from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import re
import uuid
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, Any

import bcrypt
import jwt
import requests
import httpx
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File, Response, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING, IndexModel
from bson import Binary
from pydantic import BaseModel

import seed as S

DEFAULT_MONGO_URL = "mongodb+srv://infolithink_db_user:0SzXcNhPCVCOWtEh@cluster0.jm7zu6p.mongodb.net/?retryWrites=true&w=majority"
_raw_mongo = (os.environ.get("MONGO_URL") or "").strip().strip('"').strip("'")
if not _raw_mongo or "<db_username>" in _raw_mongo or "<password>" in _raw_mongo or (os.environ.get("VERCEL") and "localhost" in _raw_mongo):
    MONGO_URL = DEFAULT_MONGO_URL
else:
    MONGO_URL = _raw_mongo

_raw_db = (os.environ.get("DB_NAME") or "").strip().strip('"').strip("'")
DB_NAME = _raw_db if _raw_db else "distribuidora_ba"

_clients: dict[int, AsyncIOMotorClient] = {}


def get_client() -> AsyncIOMotorClient:
    try:
        loop_id = id(asyncio.get_running_loop())
    except RuntimeError:
        loop_id = 0
    if loop_id not in _clients:
        _clients[loop_id] = AsyncIOMotorClient(
            MONGO_URL,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )
    return _clients[loop_id]


class _DBProxy:
    def __getattr__(self, name: str):
        return getattr(get_client()[DB_NAME], name)

    def __getitem__(self, name: str):
        return get_client()[DB_NAME][name]


client = None
db = _DBProxy()
logger = logging.getLogger("store")
logging.basicConfig(level=logging.INFO)

JWT_SECRET = (os.environ.get("JWT_SECRET") or "b7f3c1e9a2d84f6c9e0a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcd").strip().strip('"')
APP_NAME = (os.environ.get("APP_NAME") or "distribuidora-ba").strip().strip('"')
WA_DEFAULT = "5491133549747"
STATUSES = ["Pendiente", "Pagado", "En Preparación", "Enviado", "Entregado", "Cancelado"]

app = FastAPI()
api = APIRouter(prefix="/api")

INDEXES = {
    "users": [IndexModel([("email", ASCENDING)], unique=True, name="email")],
    "products": [IndexModel([("id", ASCENDING)], name="id"), IndexModel([("slug", ASCENDING)], name="slug"),
                 IndexModel([("category_id", ASCENDING)], name="cat"), IndexModel([("brand_id", ASCENDING)], name="brand")],
    "orders": [IndexModel([("id", ASCENDING)], name="id"), IndexModel([("created_at", DESCENDING)], name="created"),
               IndexModel([("user_id", ASCENDING)], name="user")],
    "categories": [IndexModel([("id", ASCENDING)], name="id")],
    "coupons": [IndexModel([("code", ASCENDING)], name="code")],
    "files": [IndexModel([("storage_path", ASCENDING)], name="path")],
    "login_attempts": [IndexModel([("identifier", ASCENDING)], name="ident")],
    "comments": [IndexModel([("id", ASCENDING)], name="id"), IndexModel([("status", ASCENDING)], name="status"),
                 IndexModel([("created_at", DESCENDING)], name="created")],
}


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ---------------- Auth ----------------
def hash_pw(p): return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()
def check_pw(p, h): return bcrypt.checkpw(p.encode(), h.encode())


def make_token(user):
    return jwt.encode({"sub": user["id"], "role": user["role"], "type": "access",
                       "exp": datetime.now(timezone.utc) + timedelta(days=7)}, JWT_SECRET, algorithm="HS256")


def public_user(u):
    return {k: u.get(k) for k in ("id", "email", "name", "role", "phone", "created_at")}


async def optional_user(request: Request):
    h = request.headers.get("Authorization", "")
    if not h.startswith("Bearer "):
        return None
    try:
        payload = jwt.decode(h[7:], JWT_SECRET, algorithms=["HS256"])
    except jwt.InvalidTokenError:
        return None
    return await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})


async def current_user(user=Depends(optional_user)):
    if not user:
        raise HTTPException(401, "No autenticado")
    return user


async def admin_user(user=Depends(current_user)):
    if user["role"] != "ADMIN":
        raise HTTPException(403, "Solo administradores")
    return user


class RegisterIn(BaseModel):
    email: str
    password: str
    name: str
    phone: Optional[str] = ""


class LoginIn(BaseModel):
    email: str
    password: str


@api.post("/auth/register")
async def register(body: RegisterIn):
    email = body.email.strip().lower()
    if len(body.password) < 6:
        raise HTTPException(400, "La contraseña debe tener al menos 6 caracteres")
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "El email ya está registrado")
    u = {"id": str(uuid.uuid4()), "email": email, "name": body.name, "phone": body.phone, "role": "CLIENTE",
         "password_hash": hash_pw(body.password), "created_at": now_iso()}
    await db.users.insert_one(u)
    return {"token": make_token(u), "user": public_user(u)}


@api.post("/auth/login")
async def login(body: LoginIn, request: Request):
    email = body.email.strip().lower()
    ident = f"{request.client.host if request.client else 'x'}:{email}"
    att = await db.login_attempts.find_one({"identifier": ident})
    if att and att.get("count", 0) >= 5 and att.get("until", "") > now_iso():
        raise HTTPException(429, "Demasiados intentos. Probá en 15 minutos.")
    u = await db.users.find_one({"email": email})
    if not u or not check_pw(body.password, u["password_hash"]):
        cnt = (att or {}).get("count", 0) + 1
        await db.login_attempts.update_one({"identifier": ident}, {"$set": {"count": cnt, "until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}}, upsert=True)
        raise HTTPException(401, "Email o contraseña incorrectos")
    await db.login_attempts.delete_one({"identifier": ident})
    return {"token": make_token(u), "user": public_user(u)}


@api.get("/auth/me")
async def me(user=Depends(current_user)):
    return public_user(user)


@api.get("/me/orders")
async def my_orders(user=Depends(current_user)):
    return await db.orders.find({"$or": [{"user_id": user["id"]}, {"customer.email": user["email"]}]}, {"_id": 0}).sort("created_at", -1).to_list(200)


# ---------------- Settings ----------------
async def get_settings():
    return await db.settings.find_one({"_id": "site"}) or {}


def public_settings(s):
    s = {k: v for k, v in s.items() if k != "_id"}
    mp = dict(s.get("payments", {}).get("mercadopago", {}))
    mp.pop("access_token", None)
    s["payments"] = {**s.get("payments", {}), "mercadopago": mp}
    return s


@api.get("/settings")
async def settings_public():
    return public_settings(await get_settings())


@api.get("/admin/settings")
async def settings_admin(_=Depends(admin_user)):
    s = await get_settings()
    s.pop("_id", None)
    return s


@api.put("/admin/settings")
async def settings_update(body: dict, _=Depends(admin_user)):
    body.pop("_id", None)
    if "usd_rate" in body:
        body["usd_rate"] = float(body["usd_rate"])
        if body["usd_rate"] <= 0:
            raise HTTPException(400, "Cotización inválida")
    await db.settings.update_one({"_id": "site"}, {"$set": body})
    s = await get_settings()
    s.pop("_id", None)
    return s


# ---------------- Storage ----------------
LOCAL_UPLOADS = ROOT_DIR / "uploads"


def put_object(path, data, ct):
    try:
        fp = LOCAL_UPLOADS / path
        fp.parent.mkdir(parents=True, exist_ok=True)
        fp.write_bytes(data)
    except OSError:
        pass
    return {"path": path, "size": len(data)}


def get_object(path):
    fp = LOCAL_UPLOADS / path
    if not fp.exists():
        raise HTTPException(404, "Archivo no encontrado")
    return fp.read_bytes(), "application/octet-stream"


@api.post("/upload")
async def upload(file: UploadFile = File(...), user=Depends(optional_user)):
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(400, "Solo se permiten imágenes")
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(400, "Imagen demasiado grande (máx 8MB)")
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "png"
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    res = await asyncio.to_thread(put_object, path, data, file.content_type)
    await db.files.insert_one({"id": str(uuid.uuid4()), "storage_path": res["path"], "original_filename": file.filename,
                               "content_type": file.content_type, "size": res.get("size"), "data": Binary(data),
                               "is_deleted": False, "created_at": now_iso()})
    return {"url": f"/api/files/{res['path']}"}


@api.get("/files/{path:path}")
async def serve_file(path: str):
    rec = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not rec:
        raise HTTPException(404, "Archivo no encontrado")
    if rec.get("data"):
        data = bytes(rec["data"])
        ct = rec.get("content_type") or "application/octet-stream"
    else:
        data, ct = await asyncio.to_thread(get_object, path)
    return Response(content=data, media_type=rec.get("content_type") or ct, headers={"Cache-Control": "public, max-age=31536000"})


# ---------------- Generic CRUD (taxonomy, coupons, pages) ----------------
def slugify(s):
    s = s.lower().strip()
    for a, b in (("á", "a"), ("é", "e"), ("í", "i"), ("ó", "o"), ("ú", "u"), ("ñ", "n")):
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def register_crud(name, public_read=True, sort_field="name"):
    async def list_items():
        return await db[name].find({}, {"_id": 0}).sort(sort_field, 1).to_list(1000)

    if public_read:
        api.get(f"/{name}")(list_items)

    @api.get(f"/admin/{name}", name=f"admin_list_{name}")
    async def admin_list(_=Depends(admin_user)):
        return await list_items()

    @api.post(f"/admin/{name}", name=f"create_{name}")
    async def create(body: dict, _=Depends(admin_user)):
        body.pop("_id", None)
        body["id"] = str(uuid.uuid4())
        if "name" in body or "title" in body:
            body["slug"] = body.get("slug") or slugify(body.get("name") or body.get("title"))
        if name == "coupons":
            body["code"] = body["code"].strip().upper()
            body.setdefault("uses", 0)
        await db[name].insert_one(body)
        body.pop("_id", None)
        return body

    @api.put(f"/admin/{name}/{{item_id}}", name=f"update_{name}")
    async def update(item_id: str, body: dict, _=Depends(admin_user)):
        old_doc = await db[name].find_one({"id": item_id}, {"_id": 0}) if name == "pages" else None
        body.pop("_id", None)
        body.pop("id", None)
        if name == "coupons" and "code" in body:
            body["code"] = body["code"].strip().upper()
        if not body.get("slug") and (body.get("name") or body.get("title")):
            body["slug"] = slugify(body.get("name") or body.get("title"))
        await db[name].update_one({"id": item_id}, {"$set": body})
        updated = await db[name].find_one({"id": item_id}, {"_id": 0})
        if name == "pages" and old_doc and updated:
            old_url = f"/pagina/{old_doc.get('slug')}"
            new_url = f"/pagina/{updated.get('slug')}"
            new_title = updated.get("title") or old_doc.get("title")
            s = await db.settings.find_one({"_id": "site"})
            if s:
                menu = s.get("menu") or []
                for m in menu:
                    if m.get("url") == old_url:
                        m["url"] = new_url
                        m["label"] = new_title
                footer = s.get("footer") or {}
                for col in footer.get("columns") or []:
                    for lk in col.get("links") or []:
                        if lk.get("url") == old_url:
                            lk["url"] = new_url
                            lk["label"] = new_title
                await db.settings.update_one({"_id": "site"}, {"$set": {"menu": menu, "footer": footer}})
        return updated

    @api.delete(f"/admin/{name}/{{item_id}}", name=f"delete_{name}")
    async def delete(item_id: str, _=Depends(admin_user)):
        old_doc = await db[name].find_one({"id": item_id}, {"_id": 0}) if name == "pages" else None
        await db[name].delete_one({"id": item_id})
        if name == "pages" and old_doc:
            old_url = f"/pagina/{old_doc.get('slug')}"
            s = await db.settings.find_one({"_id": "site"})
            if s:
                menu = [m for m in (s.get("menu") or []) if m.get("url") != old_url]
                footer = s.get("footer") or {}
                for col in footer.get("columns") or []:
                    col["links"] = [lk for lk in (col.get("links") or []) if lk.get("url") != old_url]
                await db.settings.update_one({"_id": "site"}, {"$set": {"menu": menu, "footer": footer}})
        return {"ok": True}


register_crud("categories", sort_field="order")
register_crud("brands")
register_crud("types")
register_crud("pages", sort_field="title")
register_crud("coupons", public_read=False, sort_field="code")


@api.get("/pages/{slug}")
async def page_by_slug(slug: str):
    p = await db.pages.find_one({"slug": slug, "active": True}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Página no encontrada")
    return p


# ---------------- Products ----------------
def enrich_variant(vr, rate):
    vr = dict(vr)
    if not vr.get("ars_manual"):
        vr["price_ars"] = round((vr.get("price_usd") or 0) * rate)
        vr["sale_ars"] = round((vr.get("sale_usd") or 0) * rate)
    return vr


async def lookups():
    cats = {c["id"]: c for c in await db.categories.find({}, {"_id": 0}).to_list(1000)}
    brands = {b["id"]: b for b in await db.brands.find({}, {"_id": 0}).to_list(1000)}
    types = {t["id"]: t for t in await db.types.find({}, {"_id": 0}).to_list(1000)}
    return cats, brands, types


def enrich(p, rate, lk):
    cats, brands, types = lk
    p = dict(p)
    p.pop("_id", None)
    tags = [str(t).strip().lower() for t in (p.get("tags") or []) if str(t).strip()]
    p["featured"] = bool(p["featured"]) if "featured" in p else ("destacados" in tags)
    p["on_sale"] = bool(p["on_sale"]) if "on_sale" in p else ("ofertas" in tags)
    p["lanzamiento"] = bool(p["lanzamiento"]) if "lanzamiento" in p else True
    tag_set = set(tags)
    tag_set.add("destacados") if p["featured"] else tag_set.discard("destacados")
    tag_set.add("ofertas") if p["on_sale"] else tag_set.discard("ofertas")
    tag_set.add("lanzamientos") if p["lanzamiento"] else tag_set.discard("lanzamientos")
    p["tags"] = sorted(tag_set)
    p["variants"] = [enrich_variant(v, rate) for v in p.get("variants", [])]
    p["brand"] = brands.get(p.get("brand_id"), {}).get("name", "")
    p["category"] = cats.get(p.get("category_id"), {}).get("name", "")
    p["subcategory"] = cats.get(p.get("subcategory_id"), {}).get("name", "")
    p["type"] = types.get(p.get("type_id"), {}).get("name", "")
    p["stock_total"] = sum(int(v.get("stock") or 0) for v in p["variants"])
    p["min_variant"] = min(p["variants"], key=lambda v: (v["sale_usd"] or v["price_usd"]), default=None)
    return p


def eff(v, cur):
    if cur == "USD":
        return v.get("sale_usd") or v.get("price_usd") or 0
    return v.get("sale_ars") or v.get("price_ars") or 0


@api.get("/products")
async def list_products(category: Optional[str] = None, brand: Optional[str] = None, type: Optional[str] = None,
                        tag: Optional[str] = None, q: Optional[str] = None, in_stock: bool = False,
                        min_price: Optional[float] = None, max_price: Optional[float] = None, currency: str = "ARS",
                        on_sale: bool = False, sort: str = "new", limit: int = 100, include_inactive: bool = False, user=Depends(optional_user)):
    include_inactive = include_inactive and isinstance(user, dict) and user.get("role") == "ADMIN"
    s = await get_settings()
    rate = s.get("usd_rate", 1)
    lk = await lookups()
    cats = lk[0]
    query: dict[str, Any] = {} if include_inactive else {"active": True}
    if category:
        cids = [c["id"] for c in cats.values() if c.get("slug") in category.split(",") or c["id"] in category.split(",")]
        query["$or"] = [{"category_id": {"$in": cids}}, {"subcategory_id": {"$in": cids}}]
    if brand:
        bids = [b["id"] for b in lk[1].values() if b.get("slug") in brand.split(",") or b["id"] in brand.split(",")]
        query["brand_id"] = {"$in": bids}
    if type:
        tids = [t["id"] for t in lk[2].values() if t.get("slug") in type.split(",") or t["id"] in type.split(",")]
        query["type_id"] = {"$in": tids}
    docs = await db.products.find(query, {"_id": 0}).to_list(2000)
    items = [enrich(p, rate, lk) for p in docs]
    if tag:
        tl = tag.strip().lower()
        if tl == "destacados":
            items = [p for p in items if p.get("featured")]
        elif tl == "ofertas":
            items = [p for p in items if p.get("on_sale")]
        elif tl == "lanzamientos":
            items = [p for p in items if p.get("lanzamiento", True)]
        else:
            items = [p for p in items if tl in (p.get("tags") or [])]
    if q:
        ql = q.lower()
        items = [p for p in items if ql in p["name"].lower() or ql in p["brand"].lower() or ql in p["category"].lower()
                 or any(ql in (v.get("sku") or "").lower() for v in p["variants"])]
    if in_stock:
        items = [p for p in items if p["stock_total"] > 0]
    if on_sale:
        items = [p for p in items if p.get("on_sale") or any(v.get("sale_usd") or v.get("sale_ars") for v in p["variants"])]
    if min_price is not None:
        items = [p for p in items if p["min_variant"] and eff(p["min_variant"], currency) >= min_price]
    if max_price is not None:
        items = [p for p in items if p["min_variant"] and eff(p["min_variant"], currency) <= max_price]
    if sort == "price_asc":
        items.sort(key=lambda p: eff(p["min_variant"] or {}, currency))
    elif sort == "price_desc":
        items.sort(key=lambda p: -eff(p["min_variant"] or {}, currency))
    elif sort == "name":
        items.sort(key=lambda p: p["name"])
    else:
        items.sort(key=lambda p: p.get("created_at", ""), reverse=True)
    return items[:limit]


@api.get("/search")
async def search(q: str = Query(..., min_length=1)):
    items = await list_products(q=q, limit=8)
    return [{"id": p["id"], "slug": p["slug"], "name": p["name"], "brand": p["brand"], "image": (p["images"] or [""])[0],
             "stock": p["stock_total"], "min_variant": p["min_variant"]} for p in items]


@api.get("/products/{slug}")
async def get_product(slug: str):
    p = await db.products.find_one({"$or": [{"slug": slug}, {"id": slug}]}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Producto no encontrado")
    s = await get_settings()
    return enrich(p, s.get("usd_rate", 1), await lookups())


def clean_product(body):
    body.pop("_id", None)
    for k in ("brand", "category", "subcategory", "type", "stock_total", "min_variant"):
        body.pop(k, None)
    body["slug"] = body.get("slug") or slugify(body.get("name", "producto"))
    tags = set(str(t).strip().lower() for t in (body.get("tags") or []) if str(t).strip())
    featured = bool(body["featured"]) if "featured" in body else ("destacados" in tags)
    on_sale = bool(body["on_sale"]) if "on_sale" in body else ("ofertas" in tags)
    lanzamiento = bool(body["lanzamiento"]) if "lanzamiento" in body else True
    tags.add("destacados") if featured else tags.discard("destacados")
    tags.add("ofertas") if on_sale else tags.discard("ofertas")
    tags.add("lanzamientos") if lanzamiento else tags.discard("lanzamientos")
    body["featured"] = featured
    body["on_sale"] = on_sale
    body["lanzamiento"] = lanzamiento
    body["tags"] = sorted(tags)
    vs = []
    for v in body.get("variants", []):
        v = dict(v)
        v["id"] = v.get("id") or str(uuid.uuid4())
        for f in ("price_usd", "sale_usd", "price_ars", "sale_ars"):
            v[f] = float(v.get(f) or 0)
        v["stock"] = int(v.get("stock") or 0)
        vs.append(v)
    body["variants"] = vs
    return body


@api.put("/admin/products/{pid}/flags")
async def update_product_flags(pid: str, body: dict, _=Depends(admin_user)):
    p = await db.products.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Producto no encontrado")
    tags = set(str(t).strip().lower() for t in (p.get("tags") or []) if str(t).strip())
    featured = bool(body["featured"]) if "featured" in body else bool(p.get("featured", "destacados" in tags))
    on_sale = bool(body["on_sale"]) if "on_sale" in body else bool(p.get("on_sale", "ofertas" in tags))
    lanzamiento = bool(body["lanzamiento"]) if "lanzamiento" in body else bool(p.get("lanzamiento", True))
    active = bool(body["active"]) if "active" in body else bool(p.get("active", True))
    tags.add("destacados") if featured else tags.discard("destacados")
    tags.add("ofertas") if on_sale else tags.discard("ofertas")
    tags.add("lanzamientos") if lanzamiento else tags.discard("lanzamientos")
    upd = {"featured": featured, "on_sale": on_sale, "lanzamiento": lanzamiento, "active": active, "tags": sorted(tags)}
    await db.products.update_one({"id": pid}, {"$set": upd})
    return await get_product(pid)


@api.post("/admin/products")
async def create_product(body: dict, _=Depends(admin_user)):
    body = clean_product(body)
    body["id"] = str(uuid.uuid4())
    body["created_at"] = now_iso()
    await db.products.insert_one(body)
    return await get_product(body["id"])


@api.put("/admin/products/{pid}")
async def update_product(pid: str, body: dict, _=Depends(admin_user)):
    body = clean_product(body)
    body.pop("id", None)
    await db.products.update_one({"id": pid}, {"$set": body})
    return await get_product(pid)


@api.delete("/admin/products/{pid}")
async def delete_product(pid: str, _=Depends(admin_user)):
    await db.products.delete_one({"id": pid})
    return {"ok": True}


@api.post("/admin/variants/quick")
async def quick_edit(rows: list[dict], _=Depends(admin_user)):
    for r in rows:
        upd = {f"variants.$.{k}": (int(r[k]) if k == "stock" else float(r[k] or 0))
               for k in ("stock", "price_usd", "sale_usd", "price_ars", "sale_ars") if k in r}
        await db.products.update_one({"id": r["product_id"], "variants.id": r["variant_id"]}, {"$set": upd})
    return {"ok": True, "updated": len(rows)}


class BulkIn(BaseModel):
    scope: str = "all"
    target_id: Optional[str] = None
    mode: str = "pct"
    value: float
    currency: str = "USD"


@api.post("/admin/prices/bulk")
async def bulk_prices(body: BulkIn, _=Depends(admin_user)):
    rate = (await get_settings()).get("usd_rate", 1)
    q: dict[str, Any] = {}
    if body.scope == "category":
        q = {"$or": [{"category_id": body.target_id}, {"subcategory_id": body.target_id}]}
    elif body.scope == "brand":
        q = {"brand_id": body.target_id}
    usd_delta = body.value if body.currency == "USD" else body.value / rate
    ars_delta = body.value if body.currency == "ARS" else body.value * rate

    def adj(x, delta):
        if not x:
            return x
        nv = x * (1 + body.value / 100) if body.mode == "pct" else x + delta
        return max(round(nv, 2), 0)

    count = 0
    for p in await db.products.find(q, {"_id": 0}).to_list(5000):
        for v in p["variants"]:
            v["price_usd"] = adj(v.get("price_usd"), usd_delta)
            v["sale_usd"] = adj(v.get("sale_usd"), usd_delta)
            if v.get("ars_manual"):
                v["price_ars"] = round(adj(v.get("price_ars"), ars_delta) or 0)
                v["sale_ars"] = round(adj(v.get("sale_ars"), ars_delta) or 0)
            count += 1
        await db.products.update_one({"id": p["id"]}, {"$set": {"variants": p["variants"]}})
    return {"ok": True, "variants_updated": count}


# ---------------- Cart quote & Orders ----------------
class CartItem(BaseModel):
    product_id: str
    variant_id: str
    qty: int


class QuoteIn(BaseModel):
    items: list[CartItem]
    currency: str = "ARS"
    coupon: Optional[str] = None
    shipping_method: Optional[str] = None
    payment_method: Optional[str] = None


class OrderIn(QuoteIn):
    customer: dict
    return_url: Optional[str] = None


async def compute(body: QuoteIn):
    s = await get_settings()
    rate = s.get("usd_rate", 1)
    cur = body.currency if body.currency in ("ARS", "USD") else "ARS"
    conv = (lambda ars: round(ars / rate, 2)) if cur == "USD" else (lambda ars: ars)
    lines, sub, errors = [], 0.0, []
    for it in body.items:
        p = await db.products.find_one({"id": it.product_id, "active": True}, {"_id": 0})
        v = next((x for x in (p or {}).get("variants", []) if x["id"] == it.variant_id), None)
        if not p or not v:
            errors.append("Un producto ya no está disponible")
            continue
        v = enrich_variant(v, rate)
        if it.qty > v["stock"]:
            errors.append(f"Stock insuficiente para {p['name']} ({v['stock']} disponibles)")
        unit = eff(v, cur)
        lines.append({"product_id": p["id"], "variant_id": v["id"], "name": p["name"], "variant_name": " / ".join(v.get("attrs", {}).values()),
                      "sku": v.get("sku"), "image": v.get("image") or (p.get("images") or [""])[0], "qty": it.qty, "unit_price": unit})
        sub += unit * it.qty
    sub = round(sub, 2)
    discount, coupon_msg, coupon_ok = 0.0, None, False
    if body.coupon:
        c = await db.coupons.find_one({"code": body.coupon.strip().upper(), "active": True}, {"_id": 0})
        if not c:
            coupon_msg = "Cupón inválido"
        elif c.get("expires_at") and c["expires_at"] < datetime.now(timezone.utc).date().isoformat():
            coupon_msg = "El cupón está vencido"
        elif c.get("max_uses") and c.get("uses", 0) >= c["max_uses"]:
            coupon_msg = "El cupón alcanzó su límite de usos"
        else:
            discount = sub * c["value"] / 100 if c["type"] == "pct" else min(conv(c["value"]), sub)
            coupon_ok, coupon_msg = True, f"Cupón {c['code']} aplicado"
    discount = round(discount, 2)
    ship = s.get("shipping", {})
    ship_cost = 0.0
    if body.shipping_method == "home":
        free = conv(ship.get("free_over") or 0)
        ship_cost = 0 if (ship.get("free_over") and sub - discount >= free) else conv(ship.get("home_cost", 0))
    pays = s.get("payments", {})
    adjust_pct = 0
    if body.payment_method:
        pm = pays.get(body.payment_method, {})
        if not pm.get("enabled"):
            errors.append("Método de pago no disponible")
        adjust_pct = {"mercadopago": pm.get("adjust_pct", 0), "cod": -(pm.get("discount_pct") or 0),
                      "transfer": -(pm.get("discount_pct") or 0)}.get(body.payment_method, 0)
    base = sub - discount
    adjust = round(base * adjust_pct / 100, 2)
    total = round(base + adjust + ship_cost, 2)
    if cur == "ARS":
        total, ship_cost = round(total), round(ship_cost)
    return {"items": lines, "currency": cur, "subtotal": sub, "discount": discount, "coupon_ok": coupon_ok, "coupon_msg": coupon_msg,
            "coupon_code": body.coupon.strip().upper() if coupon_ok else None, "shipping_cost": ship_cost, "payment_adjust": adjust,
            "payment_adjust_pct": adjust_pct, "total": total, "errors": errors, "usd_rate": rate}


@api.post("/cart/quote")
async def quote(body: QuoteIn):
    return await compute(body)


async def move_stock(order, sign):
    for it in order["items"]:
        await db.products.update_one({"id": it["product_id"], "variants.id": it["variant_id"]}, {"$inc": {"variants.$.stock": sign * it["qty"]}})


@api.post("/orders")
async def create_order(body: OrderIn, user=Depends(optional_user)):
    if not body.items:
        raise HTTPException(400, "El carrito está vacío")
    if not body.shipping_method or not body.payment_method:
        raise HTTPException(400, "Elegí método de entrega y de pago")
    for f in ("name", "email", "phone"):
        if not (body.customer.get(f) or "").strip():
            raise HTTPException(400, "Completá nombre, email y teléfono")
    if body.shipping_method == "home" and not (body.customer.get("address") or "").strip():
        raise HTTPException(400, "Completá la dirección de envío")
    q = await compute(body)
    if q["errors"]:
        raise HTTPException(400, q["errors"][0])
    last = await db.orders.find_one({}, {"number": 1}, sort=[("number", -1)])
    order = {"id": str(uuid.uuid4()), "number": (last or {}).get("number", 1000) + 1, "user_id": user["id"] if user else None,
             "customer": body.customer, "items": q["items"], "currency": q["currency"], "subtotal": q["subtotal"],
             "discount": q["discount"], "coupon_code": q["coupon_code"], "shipping_method": body.shipping_method,
             "shipping_cost": q["shipping_cost"], "payment_method": body.payment_method, "payment_adjust": q["payment_adjust"],
             "total": q["total"], "status": "Pendiente", "stock_deducted": True, "payment_status": None,
             "usd_rate": q["usd_rate"], "created_at": now_iso()}
    await db.orders.insert_one(order)
    order.pop("_id", None)
    await move_stock(order, -1)
    if q["coupon_code"]:
        await db.coupons.update_one({"code": q["coupon_code"]}, {"$inc": {"uses": 1}})
    result = {"order": order, "redirect": None}
    if body.payment_method == "mercadopago":
        mp = (await get_settings())["payments"]["mercadopago"]
        if mp.get("mode") == "production":
            result["redirect"] = await mp_preference(order, mp, body.return_url or "")
        else:
            result["redirect"] = f"/pago-mp/{order['id']}"
    return result


@api.get("/orders/{oid}")
async def get_order(oid: str):
    o = await db.orders.find_one({"id": oid}, {"_id": 0})
    if not o:
        raise HTTPException(404, "Pedido no encontrado")
    return o


# ---------------- Mercado Pago ----------------
MP_API = "https://api.mercadopago.com"


async def mp_preference(order, mp, origin):
    if not mp.get("access_token"):
        raise HTTPException(400, "Mercado Pago no tiene Access Token configurado")
    total_ars = order["total"] if order["currency"] == "ARS" else round(order["total"] * order["usd_rate"], 2)
    payload = {"items": [{"title": f"Pedido #{order['number']}", "quantity": 1, "unit_price": float(total_ars), "currency_id": "ARS"}],
               "external_reference": order["id"], "payer": {"email": order["customer"].get("email")},
               "back_urls": {k: f"{origin}/orden/{order['id']}" for k in ("success", "failure", "pending")},
               "auto_return": "approved", "notification_url": f"{origin}/api/payments/mp/webhook"}
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(f"{MP_API}/checkout/preferences", json=payload, headers={"Authorization": f"Bearer {mp['access_token']}"})
    if r.status_code >= 300:
        logger.error("MP preference error %s %s", r.status_code, r.text[:300])
        raise HTTPException(502, "No se pudo iniciar el pago con Mercado Pago. Revisá las credenciales.")
    pref = r.json()
    await db.orders.update_one({"id": order["id"]}, {"$set": {"mp_preference_id": pref["id"]}})
    return pref["init_point"]


async def apply_payment(order_id, status, payment_id=None):
    o = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not o:
        return
    upd = {"payment_status": status, "payment_id": payment_id}
    if status == "approved" and o["status"] == "Pendiente":
        upd["status"] = "Pagado"
    await db.orders.update_one({"id": order_id}, {"$set": upd})


async def mp_verify_payment(payment_id):
    mp = (await get_settings())["payments"]["mercadopago"]
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.get(f"{MP_API}/v1/payments/{payment_id}", headers={"Authorization": f"Bearer {mp.get('access_token', '')}"})
    if r.status_code >= 300:
        raise HTTPException(502, "No se pudo verificar el pago")
    p = r.json()
    if p.get("external_reference"):
        await apply_payment(p["external_reference"], p.get("status"), str(p.get("id")))
    return p


@api.post("/payments/mp/webhook")
async def mp_webhook(request: Request):
    body = await request.json()
    pid = str((body.get("data") or {}).get("id") or request.query_params.get("data.id") or "")
    if (body.get("type") == "payment" or body.get("topic") == "payment") and pid:
        await mp_verify_payment(pid)
    return {"ok": True}


@api.post("/payments/mp/verify/{oid}")
async def mp_verify(oid: str, payment_id: str):
    p = await mp_verify_payment(payment_id)
    if p.get("external_reference") != oid:
        raise HTTPException(400, "El pago no corresponde a este pedido")
    return await get_order(oid)


class SimIn(BaseModel):
    result: str


@api.post("/payments/mp/simulate/{oid}")
async def mp_simulate(oid: str, body: SimIn):
    mp = (await get_settings())["payments"]["mercadopago"]
    if mp.get("mode") != "sandbox":
        raise HTTPException(400, "El modo simulación no está activo")
    o = await get_order(oid)
    if o["payment_method"] != "mercadopago" or o["payment_status"] == "approved":
        raise HTTPException(400, "Este pedido no admite simulación")
    await apply_payment(oid, "approved" if body.result == "approved" else "rejected", f"SIM-{uuid.uuid4().hex[:10]}")
    return await get_order(oid)


# ---------------- Admin orders ----------------
@api.get("/admin/orders")
async def admin_orders(q: Optional[str] = None, status: Optional[str] = None, _=Depends(admin_user)):
    query: dict[str, Any] = {}
    if status:
        query["status"] = status
    if q:
        rx = {"$regex": re.escape(q), "$options": "i"}
        ors = [{"customer.name": rx}, {"customer.email": rx}, {"customer.phone": rx}]
        if q.isdigit():
            ors.append({"number": int(q)})
        query["$or"] = ors
    return await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)


class StatusIn(BaseModel):
    status: str


@api.put("/admin/orders/{oid}/status")
async def order_status(oid: str, body: StatusIn, _=Depends(admin_user)):
    if body.status not in STATUSES:
        raise HTTPException(400, "Estado inválido")
    o = await get_order(oid)
    upd = {"status": body.status}
    if body.status == "Cancelado" and o.get("stock_deducted"):
        await move_stock(o, 1)
        upd["stock_deducted"] = False
    elif body.status != "Cancelado" and not o.get("stock_deducted"):
        await move_stock(o, -1)
        upd["stock_deducted"] = True
    await db.orders.update_one({"id": oid}, {"$set": upd})
    return await get_order(oid)


# ---------------- Admin users ----------------
@api.get("/admin/users")
async def admin_users(_=Depends(admin_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(2000)
    stats = {}
    async for o in db.orders.find({"status": {"$ne": "Cancelado"}}, {"user_id": 1, "customer.email": 1, "total": 1, "currency": 1}):
        for key in (o.get("user_id"), (o.get("customer") or {}).get("email")):
            if key:
                st = stats.setdefault(key, {"orders": 0, "ARS": 0, "USD": 0})
                st["orders"] += 1
                st[o["currency"]] += o["total"]
                break
    for u in users:
        st = stats.get(u["id"]) or stats.get(u["email"]) or {"orders": 0, "ARS": 0, "USD": 0}
        u["stats"] = st
    return users


@api.get("/admin/users/{uid}/orders")
async def admin_user_orders(uid: str, _=Depends(admin_user)):
    u = await db.users.find_one({"id": uid}, {"_id": 0})
    if not u:
        raise HTTPException(404, "Usuario no encontrado")
    return await db.orders.find({"$or": [{"user_id": uid}, {"customer.email": u["email"]}]}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.post("/admin/users")
async def admin_create_user(body: dict, _=Depends(admin_user)):
    email = (body.get("email") or "").strip().lower()
    if not email or len(body.get("password") or "") < 6:
        raise HTTPException(400, "Email y contraseña (mín. 6) requeridos")
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "El email ya existe")
    u = {"id": str(uuid.uuid4()), "email": email, "name": body.get("name", ""), "phone": body.get("phone", ""),
         "role": body.get("role") if body.get("role") in ("ADMIN", "CLIENTE") else "CLIENTE",
         "password_hash": hash_pw(body["password"]), "created_at": now_iso()}
    await db.users.insert_one(u)
    return public_user(u)


@api.put("/admin/users/{uid}")
async def admin_update_user(uid: str, body: dict, me_=Depends(admin_user)):
    upd = {k: body[k] for k in ("name", "phone") if k in body}
    if body.get("role") in ("ADMIN", "CLIENTE"):
        if uid == me_["id"] and body["role"] != "ADMIN":
            raise HTTPException(400, "No podés quitarte el rol de administrador")
        upd["role"] = body["role"]
    if body.get("password"):
        if len(body["password"]) < 6:
            raise HTTPException(400, "Contraseña muy corta")
        upd["password_hash"] = hash_pw(body["password"])
    await db.users.update_one({"id": uid}, {"$set": upd})
    return public_user(await db.users.find_one({"id": uid}))


@api.delete("/admin/users/{uid}")
async def admin_delete_user(uid: str, me_=Depends(admin_user)):
    if uid == me_["id"]:
        raise HTTPException(400, "No podés eliminar tu propio usuario")
    await db.users.delete_one({"id": uid})
    return {"ok": True}


# ---------------- Analytics ----------------
@api.get("/admin/analytics")
async def analytics(period: str = "month", _=Depends(admin_user)):
    orders = await db.orders.find({}, {"_id": 0}).to_list(10000)
    valid = [o for o in orders if o["status"] != "Cancelado"]
    nowd = datetime.now(timezone.utc)
    if period == "day":
        keys = [(nowd - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(29, -1, -1)]
        keyf = lambda o: o["created_at"][:10]
    elif period == "week":
        keys = [(nowd - timedelta(weeks=i)).strftime("%G-W%V") for i in range(11, -1, -1)]
        keyf = lambda o: datetime.fromisoformat(o["created_at"]).strftime("%G-W%V")
    else:
        keys, d = [], nowd.replace(day=1)
        for _i in range(6):
            keys.insert(0, d.strftime("%Y-%m"))
            d = (d - timedelta(days=1)).replace(day=1)
        keyf = lambda o: o["created_at"][:7]
    series = {k: {"period": k, "ARS": 0, "USD": 0, "orders_ARS": 0, "orders_USD": 0} for k in keys}
    methods, top, totals = {}, {}, {"ARS": 0, "USD": 0, "orders": len(valid), "pending": 0}
    for o in valid:
        k = keyf(o)
        if k in series:
            series[k][o["currency"]] += o["total"]
            series[k]["orders_" + o["currency"]] += 1
        totals[o["currency"]] += o["total"]
        totals["pending"] += o["status"] == "Pendiente"
        m = methods.setdefault(o["payment_method"], {"method": o["payment_method"], "count": 0, "ARS": 0, "USD": 0})
        m["count"] += 1
        m[o["currency"]] += o["total"]
        for it in o["items"]:
            t = top.setdefault(it["product_id"], {"name": it["name"], "qty": 0, "ARS": 0, "USD": 0})
            t["qty"] += it["qty"]
            t[o["currency"]] += it["qty"] * it["unit_price"]
    low = []
    for p in await db.products.find({}, {"_id": 0, "name": 1, "variants": 1}).to_list(5000):
        for v in p["variants"]:
            if v.get("stock", 0) <= 5:
                low.append({"product": p["name"], "variant": " / ".join(v.get("attrs", {}).values()), "sku": v.get("sku"), "stock": v.get("stock", 0)})
    r2 = lambda x: round(x, 2)
    return {"series": [{**v, "ARS": round(v["ARS"]), "USD": r2(v["USD"])} for v in series.values()],
            "methods": list(methods.values()), "top_products": sorted(top.values(), key=lambda t: -t["qty"])[:10],
            "low_stock": sorted(low, key=lambda x: x["stock"]), "totals": {**totals, "ARS": round(totals["ARS"]), "USD": r2(totals["USD"])},
            "recent": sorted(orders, key=lambda o: o["created_at"], reverse=True)[:8], "all_orders": [
                {k: o[k] for k in ("number", "created_at", "status", "currency", "total", "payment_method")} | {"customer": o["customer"].get("name")}
                for o in sorted(orders, key=lambda o: o["created_at"], reverse=True)]}


# ---------------- Comments / Reviews ----------------
COMMENT_STATUSES = ("Pendiente", "Aprobado", "Rechazado")


class CommentIn(BaseModel):
    name: Optional[str] = ""
    email: Optional[str] = ""
    vehicle: Optional[str] = ""
    rating: int = 5
    comment: str
    photo: Optional[str] = ""


@api.get("/comments")
async def public_comments(limit: int = 50):
    return await db.comments.find({"status": "Aprobado"}, {"_id": 0}).sort("created_at", -1).to_list(limit)


@api.post("/comments")
async def submit_comment(body: CommentIn, user=Depends(optional_user)):
    text = (body.comment or "").strip()
    if len(text) < 3:
        raise HTTPException(400, "Escribí un comentario válido")
    name = (body.name or "").strip() or (user.get("name") if user else "")
    if not name:
        raise HTTPException(400, "Ingresá tu nombre")
    email = (body.email or "").strip() or (user.get("email") if user else "")
    rating = max(1, min(5, int(body.rating or 5)))
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"] if user else None,
        "name": name,
        "email": email,
        "vehicle": (body.vehicle or "").strip(),
        "rating": rating,
        "comment": text,
        "photo": (body.photo or "").strip(),
        "status": "Pendiente",
        "created_at": now_iso(),
    }
    await db.comments.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/admin/comments")
async def admin_list_comments(status: Optional[str] = None, q: Optional[str] = None, _=Depends(admin_user)):
    query: dict[str, Any] = {}
    if status and status in COMMENT_STATUSES:
        query["status"] = status
    if q:
        rx = {"$regex": re.escape(q), "$options": "i"}
        query["$or"] = [{"name": rx}, {"comment": rx}, {"vehicle": rx}, {"email": rx}]
    return await db.comments.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api.post("/admin/comments")
async def admin_create_comment(body: dict, _=Depends(admin_user)):
    name = (body.get("name") or "").strip()
    text = (body.get("comment") or "").strip()
    if not name or not text:
        raise HTTPException(400, "Nombre y comentario son obligatorios")
    status = body.get("status") if body.get("status") in COMMENT_STATUSES else "Aprobado"
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": None,
        "name": name,
        "email": (body.get("email") or "").strip(),
        "vehicle": (body.get("vehicle") or "").strip(),
        "rating": max(1, min(5, int(body.get("rating") or 5))),
        "comment": text,
        "photo": (body.get("photo") or "").strip(),
        "status": status,
        "created_at": body.get("created_at") or now_iso(),
    }
    await db.comments.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/admin/comments/{cid}")
async def admin_update_comment(cid: str, body: dict, _=Depends(admin_user)):
    existing = await db.comments.find_one({"id": cid}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Comentario no encontrado")
    upd: dict[str, Any] = {}
    for k in ("name", "email", "vehicle", "comment", "photo"):
        if k in body:
            upd[k] = (body.get(k) or "").strip()
    if "rating" in body:
        upd["rating"] = max(1, min(5, int(body.get("rating") or 5)))
    if body.get("status") in COMMENT_STATUSES:
        upd["status"] = body["status"]
    if not upd.get("name", existing.get("name")) or not upd.get("comment", existing.get("comment")):
        raise HTTPException(400, "Nombre y comentario son obligatorios")
    await db.comments.update_one({"id": cid}, {"$set": upd})
    return await db.comments.find_one({"id": cid}, {"_id": 0})


@api.put("/admin/comments/{cid}/status")
async def admin_comment_status(cid: str, body: StatusIn, _=Depends(admin_user)):
    if body.status not in COMMENT_STATUSES:
        raise HTTPException(400, "Estado inválido")
    res = await db.comments.update_one({"id": cid}, {"$set": {"status": body.status}})
    if not res.matched_count:
        raise HTTPException(404, "Comentario no encontrado")
    return await db.comments.find_one({"id": cid}, {"_id": 0})


@api.delete("/admin/comments/{cid}")
async def admin_delete_comment(cid: str, _=Depends(admin_user)):
    await db.comments.delete_one({"id": cid})
    return {"ok": True}


# ---------------- Startup / seed ----------------
async def ensure_comments_seed():
    if await db.comments.count_documents({}) == 0:
        await db.comments.insert_many(S.comments())
    site = await db.settings.find_one({"_id": "site"})
    if site:
        secs = site.get("home_sections") or []
        if not any(s.get("type") == "comments" for s in secs):
            secs.append({
                "id": str(uuid.uuid4()),
                "type": "comments",
                "title": "Comentarios de clientes",
                "enabled": True,
                "config": {"subtitle": "Experiencias reales de quienes ya renovaron el interior de su auto", "allow_submit": True, "limit": 12},
            })
            await db.settings.update_one({"_id": "site"}, {"$set": {"home_sections": secs}})


async def run_seed():
    if await db.settings.find_one({"_id": "site"}):
        await ensure_comments_seed()
        return
    snap_path = ROOT_DIR / "initial_data.json"
    if snap_path.exists():
        import json
        snap = json.loads(snap_path.read_text(encoding="utf-8"))
        for col, docs in snap.items():
            if docs:
                await db[col].insert_many(docs)
        client_u = {"id": str(uuid.uuid4()), "email": "cliente@demo.com", "name": "Cliente Demo", "phone": "1155550000", "role": "CLIENTE",
                    "password_hash": hash_pw("Cliente123!"), "created_at": now_iso()}
        if not await db.users.find_one({"email": client_u["email"]}):
            await db.users.insert_one(client_u)
        logger.info("Seed completed from initial_data.json")
        return
    st = S.default_settings(WA_DEFAULT)
    await db.settings.insert_one(st)
    cats, subs, brands, types = S.taxonomy()
    await db.categories.insert_many(cats + subs)
    await db.brands.insert_many(brands)
    await db.types.insert_many(types)
    prods = S.products(cats, subs, brands, types)
    await db.products.insert_many([dict(p) for p in prods])
    await db.coupons.insert_many(S.coupons())
    await db.pages.insert_many(S.pages())
    await db.comments.insert_many(S.comments())
    client_u = {"id": str(uuid.uuid4()), "email": "cliente@demo.com", "name": "Cliente Demo", "phone": "1155550000", "role": "CLIENTE",
                "password_hash": hash_pw("Cliente123!"), "created_at": now_iso()}
    if not await db.users.find_one({"email": client_u["email"]}):
        await db.users.insert_one(client_u)
    await db.orders.insert_many(S.orders(prods, st["usd_rate"], client_u["id"]))
    logger.info("Seed completed")


async def seed_admin():
    email = os.environ.get("ADMIN_EMAIL", "admin@distribuidoraba.com").lower()
    pw = os.environ.get("ADMIN_PASSWORD", "Admin123!")
    if not await db.users.find_one({"email": email}):
        await db.users.insert_one({"id": str(uuid.uuid4()), "email": email, "name": "Administrador", "phone": "", "role": "ADMIN",
                                   "password_hash": hash_pw(pw), "created_at": now_iso()})


async def ensure_indexes():
    for col, models in INDEXES.items():
        for m in models:
            try:
                await db[col].create_indexes([m])
            except Exception as e:
                logger.error("index %s: %s", col, e)


@app.on_event("startup")
async def startup():
    try:
        LOCAL_UPLOADS.mkdir(parents=True, exist_ok=True)
    except OSError:
        pass
    if os.environ.get("VERCEL"):
        return
    await ensure_indexes()
    await seed_admin()
    await run_seed()


@app.on_event("shutdown")
async def shutdown():
    for c in list(_clients.values()):
        c.close()


@api.get("/health")
async def health_check():
    try:
        cnt = await db.products.count_documents({})
        return {"ok": True, "db": DB_NAME, "products": cnt}
    except Exception as e:
        return {"ok": False, "db": DB_NAME, "error": f"{type(e).__name__}: {e}"}


app.include_router(api)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
                   allow_methods=["*"], allow_headers=["*"])
