"""Regression tests for Distribuidora Buenos Aires e-commerce API (auth, catalog, pricing, cart, orders, MP sandbox, admin CRUD)."""
import os
import io
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN = {"email": "admin@distribuidoraba.com", "password": "Admin123!"}
CLIENT = {"email": "cliente@demo.com", "password": "Cliente123!"}


def login(creds):
    r = requests.post(f"{API}/auth/login", json=creds)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def admin_h():
    return {"Authorization": f"Bearer {login(ADMIN)}"}


@pytest.fixture(scope="module")
def client_h():
    return {"Authorization": f"Bearer {login(CLIENT)}"}


@pytest.fixture(scope="module")
def tax(admin_h):
    cats = requests.get(f"{API}/categories").json()
    brands = requests.get(f"{API}/brands").json()
    types = requests.get(f"{API}/types").json()
    return {c["slug"]: c for c in cats}, {b["slug"]: b for b in brands}, {t["slug"]: t for t in types}


@pytest.fixture(scope="module")
def test_env(admin_h):
    """Create TEST_ brand + category + product with variants; cleanup after module."""
    created = {"products": [], "brands": [], "categories": [], "coupons": [], "users": []}
    b = requests.post(f"{API}/admin/brands", json={"name": f"TEST_Brand_{uuid.uuid4().hex[:5]}"}, headers=admin_h).json()
    created["brands"].append(b["id"])
    c = requests.post(f"{API}/admin/categories", json={"name": f"TEST_Cat_{uuid.uuid4().hex[:5]}", "parent_id": None, "order": 99}, headers=admin_h).json()
    created["categories"].append(c["id"])
    p = requests.post(f"{API}/admin/products", headers=admin_h, json={
        "name": f"TEST_Prod_{uuid.uuid4().hex[:5]}", "active": True, "brand_id": b["id"], "category_id": c["id"],
        "tags": ["test"], "images": [],
        "variants": [
            {"attrs": {"Medida": "A", "Color": "Negro"}, "sku": "TST-A", "price_usd": 100, "sale_usd": 0, "stock": 10},
            {"attrs": {"Medida": "B", "Color": "Rojo"}, "sku": "TST-B", "price_usd": 200, "sale_usd": 150, "stock": 2,
             "ars_manual": True, "price_ars": 300000, "sale_ars": 250000},
        ]}).json()
    created["products"].append(p["id"])
    yield {"brand": b, "cat": c, "product": p, "created": created}
    for k, ids in created.items():
        for i in ids:
            requests.delete(f"{API}/admin/{k}/{i}", headers=admin_h)


# ---- Auth ----
class TestAuth:
    def test_admin_login_and_me(self):
        r = requests.post(f"{API}/auth/login", json=ADMIN)
        assert r.status_code == 200
        d = r.json()
        assert d["user"]["role"] == "ADMIN" and isinstance(d["token"], str)
        me = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {d['token']}"})
        assert me.status_code == 200 and me.json()["email"] == ADMIN["email"]
        assert "password_hash" not in me.json()

    def test_client_login(self):
        r = requests.post(f"{API}/auth/login", json=CLIENT)
        assert r.status_code == 200 and r.json()["user"]["role"] == "CLIENTE"

    def test_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"email": f"test_nouser_{uuid.uuid4().hex[:5]}@x.com", "password": "bad"})
        assert r.status_code == 401

    def test_register_and_bruteforce(self, admin_h, test_env):
        email = f"test_{uuid.uuid4().hex[:6]}@example.com"
        r = requests.post(f"{API}/auth/register", json={"email": email, "password": "Test1234", "name": "TEST_User"})
        assert r.status_code == 200 and r.json()["user"]["role"] == "CLIENTE"
        test_env["created"]["users"].append(r.json()["user"]["id"])
        dup = requests.post(f"{API}/auth/register", json={"email": email, "password": "Test1234", "name": "x"})
        assert dup.status_code == 400
        codes = [requests.post(f"{API}/auth/login", json={"email": email, "password": "wrong"}).status_code for _ in range(6)]
        assert codes[:5] == [401] * 5 and codes[5] == 429, codes

    def test_me_anon(self):
        assert requests.get(f"{API}/auth/me").status_code == 401


# ---- Access control ----
class TestAccess:
    @pytest.mark.parametrize("path", ["/admin/settings", "/admin/orders", "/admin/users", "/admin/analytics", "/admin/coupons"])
    def test_admin_only(self, path, client_h):
        assert requests.get(f"{API}{path}").status_code == 401
        assert requests.get(f"{API}{path}", headers=client_h).status_code == 403

    def test_public_settings_hides_token(self):
        s = requests.get(f"{API}/settings").json()
        assert "access_token" not in s["payments"]["mercadopago"]
        assert "_id" not in s


# ---- Catalog ----
class TestCatalog:
    def test_category_includes_subcategories(self):
        items = requests.get(f"{API}/products", params={"category": "fundas-de-asiento"}).json()
        assert len(items) >= 3
        assert all(p["category"] == "Fundas de Asiento" for p in items)
        sub = requests.get(f"{API}/products", params={"category": "juegos-completos"}).json()
        assert len(sub) >= 2 and all(p["subcategory"] == "Juegos Completos" for p in sub)

    def test_brand_type_tag_stock(self):
        b = requests.get(f"{API}/products", params={"brand": "autostyle"}).json()
        assert b and all(p["brand"] == "AutoStyle" for p in b)
        t = requests.get(f"{API}/products", params={"type": "goma"}).json()
        assert t and all(p["type"] == "Goma" for p in t)
        tg = requests.get(f"{API}/products", params={"tag": "ofertas"}).json()
        assert tg and all("ofertas" in p["tags"] for p in tg)
        st = requests.get(f"{API}/products", params={"in_stock": "true"}).json()
        assert all(p["stock_total"] > 0 for p in st)

    def test_price_range_and_sort(self):
        rate = requests.get(f"{API}/settings").json()["usd_rate"]
        usd = requests.get(f"{API}/products", params={"min_price": 50, "max_price": 150, "currency": "USD", "sort": "price_asc"}).json()
        prices = [p["min_variant"]["sale_usd"] or p["min_variant"]["price_usd"] for p in usd]
        assert prices == sorted(prices) and all(50 <= x <= 150 for x in prices)
        ars = requests.get(f"{API}/products", params={"max_price": 30 * rate, "currency": "ARS", "sort": "price_desc"}).json()
        ap = [p["min_variant"]["sale_ars"] or p["min_variant"]["price_ars"] for p in ars]
        assert ap == sorted(ap, reverse=True) and all(x <= 30 * rate for x in ap)

    def test_search(self):
        r = requests.get(f"{API}/search", params={"q": "funda"})
        assert r.status_code == 200
        d = r.json()
        assert d and {"id", "slug", "name", "brand", "image", "stock", "min_variant"} <= set(d[0].keys())
        assert requests.get(f"{API}/search", params={"q": "GL-ROS"}).json()

    def test_product_detail(self):
        p = requests.get(f"{API}/products").json()[0]
        d = requests.get(f"{API}/products/{p['slug']}")
        assert d.status_code == 200 and d.json()["id"] == p["id"]
        assert requests.get(f"{API}/products/nope-xyz").status_code == 404


# ---- Pricing ----
class TestPricing:
    def test_usd_rate_recalc(self, admin_h, test_env):
        pid = test_env["product"]["id"]
        orig = requests.get(f"{API}/admin/settings", headers=admin_h).json()["usd_rate"]
        try:
            r = requests.put(f"{API}/admin/settings", json={"usd_rate": 1500}, headers=admin_h)
            assert r.status_code == 200 and r.json()["usd_rate"] == 1500
            p = requests.get(f"{API}/products/{pid}").json()
            va, vb = p["variants"]
            assert va["price_ars"] == 150000
            assert vb["price_ars"] == 300000 and vb["sale_ars"] == 250000  # manual stays
            assert requests.put(f"{API}/admin/settings", json={"usd_rate": 0}, headers=admin_h).status_code == 400
        finally:
            requests.put(f"{API}/admin/settings", json={"usd_rate": orig}, headers=admin_h)
        assert requests.get(f"{API}/settings").json()["usd_rate"] == orig

    def test_bulk_brand_pct_and_category_fixed(self, admin_h, test_env):
        pid = test_env["product"]["id"]
        r = requests.post(f"{API}/admin/prices/bulk", headers=admin_h,
                          json={"scope": "brand", "target_id": test_env["brand"]["id"], "mode": "pct", "value": 10})
        assert r.status_code == 200 and r.json()["variants_updated"] == 2
        va, vb = requests.get(f"{API}/products/{pid}").json()["variants"]
        assert va["price_usd"] == 110 and vb["price_usd"] == 220 and vb["price_ars"] == 330000
        r = requests.post(f"{API}/admin/prices/bulk", headers=admin_h,
                          json={"scope": "category", "target_id": test_env["cat"]["id"], "mode": "fixed", "value": -10, "currency": "USD"})
        assert r.json()["variants_updated"] == 2
        va, vb = requests.get(f"{API}/products/{pid}").json()["variants"]
        assert va["price_usd"] == 100 and vb["price_usd"] == 210

    def test_bulk_all_fixed_reversible(self, admin_h):
        before = {p["id"]: [v["price_usd"] for v in p["variants"]] for p in requests.get(f"{API}/products").json()}
        r1 = requests.post(f"{API}/admin/prices/bulk", headers=admin_h, json={"scope": "all", "mode": "fixed", "value": 1, "currency": "USD"})
        assert r1.status_code == 200 and r1.json()["variants_updated"] >= 15
        mid = {p["id"]: [v["price_usd"] for v in p["variants"]] for p in requests.get(f"{API}/products").json()}
        requests.post(f"{API}/admin/prices/bulk", headers=admin_h, json={"scope": "all", "mode": "fixed", "value": -1, "currency": "USD"})
        after = {p["id"]: [v["price_usd"] for v in p["variants"]] for p in requests.get(f"{API}/products").json()}
        some = next(iter(before))
        assert mid[some][0] == round(before[some][0] + 1, 2)
        assert after == before


# ---- Quote ----
class TestQuote:
    def _item(self, test_env, idx=0, qty=1):
        p = test_env["product"]
        return [{"product_id": p["id"], "variant_id": p["variants"][idx]["id"], "qty": qty}]

    def test_coupons(self, test_env):
        rate = requests.get(f"{API}/settings").json()["usd_rate"]
        it = self._item(test_env)
        q = requests.post(f"{API}/cart/quote", json={"items": it, "coupon": "bienvenido10"}).json()
        assert q["coupon_ok"] and q["discount"] == round(q["subtotal"] * 0.1, 2) and q["subtotal"] == 100 * rate
        q = requests.post(f"{API}/cart/quote", json={"items": it, "coupon": "ENVIO5000"}).json()
        assert q["coupon_ok"] and q["discount"] == 5000
        q = requests.post(f"{API}/cart/quote", json={"items": it, "coupon": "ENVIO5000", "currency": "USD"}).json()
        assert q["discount"] == round(5000 / rate, 2)
        q = requests.post(f"{API}/cart/quote", json={"items": it, "coupon": "VENCIDO20"}).json()
        assert not q["coupon_ok"] and "vencido" in q["coupon_msg"].lower()
        q = requests.post(f"{API}/cart/quote", json={"items": it, "coupon": "NOEXISTE"}).json()
        assert not q["coupon_ok"] and q["coupon_msg"] == "Cupón inválido"

    def test_shipping_and_payment(self, test_env):
        s = requests.get(f"{API}/settings").json()
        ship = s["shipping"]
        # subtotal 125000 < 150000 => cost
        q = requests.post(f"{API}/cart/quote", json={"items": self._item(test_env), "shipping_method": "home"}).json()
        assert q["shipping_cost"] == ship["home_cost"]
        q = requests.post(f"{API}/cart/quote", json={"items": self._item(test_env, qty=2), "shipping_method": "home"}).json()
        assert q["shipping_cost"] == 0
        q = requests.post(f"{API}/cart/quote", json={"items": self._item(test_env), "shipping_method": "pickup"}).json()
        assert q["shipping_cost"] == 0
        q = requests.post(f"{API}/cart/quote", json={"items": self._item(test_env), "shipping_method": "pickup", "payment_method": "transfer"}).json()
        assert q["payment_adjust_pct"] == -20 and q["total"] == round(q["subtotal"] * 0.8)
        q = requests.post(f"{API}/cart/quote", json={"items": self._item(test_env), "shipping_method": "pickup", "payment_method": "cod"}).json()
        assert q["payment_adjust_pct"] == -5 and q["total"] == round(q["subtotal"] * 0.95)

    def test_insufficient_stock_quote(self, test_env):
        q = requests.post(f"{API}/cart/quote", json={"items": self._item(test_env, 1, 99)}).json()
        assert q["errors"] and "Stock insuficiente" in q["errors"][0]


# ---- Orders ----
CUST = {"name": "TEST_Cliente", "email": "test_buyer@example.com", "phone": "1100000000", "address": "Calle 1", "city": "CABA"}


def stock(pid, idx):
    return requests.get(f"{API}/products/{pid}").json()["variants"][idx]["stock"]


class TestOrders:
    def test_order_stock_cycle(self, admin_h, test_env):
        p = test_env["product"]
        s0 = stock(p["id"], 0)
        r = requests.post(f"{API}/orders", json={"items": [{"product_id": p["id"], "variant_id": p["variants"][0]["id"], "qty": 2}],
                                                 "shipping_method": "home", "payment_method": "transfer", "customer": CUST})
        assert r.status_code == 200, r.text
        o = r.json()["order"]
        assert o["status"] == "Pendiente" and r.json()["redirect"] is None
        assert stock(p["id"], 0) == s0 - 2
        assert requests.get(f"{API}/orders/{o['id']}").json()["number"] == o["number"]
        c = requests.put(f"{API}/admin/orders/{o['id']}/status", json={"status": "Cancelado"}, headers=admin_h)
        assert c.status_code == 200 and c.json()["stock_deducted"] is False
        assert stock(p["id"], 0) == s0
        requests.put(f"{API}/admin/orders/{o['id']}/status", json={"status": "Pagado"}, headers=admin_h)
        assert stock(p["id"], 0) == s0 - 2
        requests.put(f"{API}/admin/orders/{o['id']}/status", json={"status": "Cancelado"}, headers=admin_h)
        assert stock(p["id"], 0) == s0
        assert requests.put(f"{API}/admin/orders/{o['id']}/status", json={"status": "Foo"}, headers=admin_h).status_code == 400

    def test_insufficient_and_validation(self, test_env):
        p = test_env["product"]
        it = [{"product_id": p["id"], "variant_id": p["variants"][1]["id"], "qty": 50}]
        r = requests.post(f"{API}/orders", json={"items": it, "shipping_method": "pickup", "payment_method": "cod", "customer": CUST})
        assert r.status_code == 400 and "Stock insuficiente" in r.json()["detail"]
        r = requests.post(f"{API}/orders", json={"items": [], "shipping_method": "pickup", "payment_method": "cod", "customer": CUST})
        assert r.status_code == 400
        r = requests.post(f"{API}/orders", json={"items": it[:1], "shipping_method": "home", "payment_method": "cod",
                                                 "customer": {**CUST, "address": ""}})
        assert r.status_code == 400

    def test_mercadopago_sandbox(self, admin_h, test_env):
        p = test_env["product"]
        r = requests.post(f"{API}/orders", json={"items": [{"product_id": p["id"], "variant_id": p["variants"][0]["id"], "qty": 1}],
                                                 "shipping_method": "pickup", "payment_method": "mercadopago", "customer": CUST, "currency": "USD"})
        assert r.status_code == 200, r.text
        oid = r.json()["order"]["id"]
        assert r.json()["redirect"] == f"/pago-mp/{oid}"
        s = requests.post(f"{API}/payments/mp/simulate/{oid}", json={"result": "approved"})
        assert s.status_code == 200 and s.json()["status"] == "Pagado" and s.json()["payment_status"] == "approved"
        assert requests.post(f"{API}/payments/mp/simulate/{oid}", json={"result": "approved"}).status_code == 400
        requests.put(f"{API}/admin/orders/{oid}/status", json={"status": "Cancelado"}, headers=admin_h)

    def test_admin_orders_search(self, admin_h):
        r = requests.get(f"{API}/admin/orders", params={"q": "TEST_Cliente"}, headers=admin_h)
        assert r.status_code == 200 and all(o["customer"]["name"] == "TEST_Cliente" for o in r.json())


# ---- Admin CRUD ----
class TestAdminCrud:
    def test_coupon_crud(self, admin_h, test_env):
        r = requests.post(f"{API}/admin/coupons", headers=admin_h, json={"code": "test_cup1", "type": "pct", "value": 5, "active": True, "max_uses": 1})
        cid = r.json()["id"]
        test_env["created"]["coupons"].append(cid)
        assert r.json()["code"] == "TEST_CUP1" and r.json()["uses"] == 0
        u = requests.put(f"{API}/admin/coupons/{cid}", headers=admin_h, json={"value": 7})
        assert u.json()["value"] == 7
        lst = requests.get(f"{API}/admin/coupons", headers=admin_h).json()
        assert any(c["id"] == cid for c in lst)

    def test_page_crud(self, admin_h):
        r = requests.post(f"{API}/admin/pages", headers=admin_h, json={"title": "TEST Página", "content": "<p>x</p>", "active": True})
        pg = r.json()
        assert pg["slug"] == "test-pagina"
        assert requests.get(f"{API}/pages/test-pagina").json()["id"] == pg["id"]
        requests.delete(f"{API}/admin/pages/{pg['id']}", headers=admin_h)
        assert requests.get(f"{API}/pages/test-pagina").status_code == 404

    def test_type_crud(self, admin_h):
        t = requests.post(f"{API}/admin/types", headers=admin_h, json={"name": "TEST Tipo"}).json()
        u = requests.put(f"{API}/admin/types/{t['id']}", headers=admin_h, json={"name": "TEST Tipo2"}).json()
        assert u["name"] == "TEST Tipo2" and u["slug"] == "test-tipo2"
        requests.delete(f"{API}/admin/types/{t['id']}", headers=admin_h)
        assert not any(x["id"] == t["id"] for x in requests.get(f"{API}/types").json())

    def test_product_update_delete_and_quick(self, admin_h, test_env):
        pid = test_env["product"]["id"]
        p = requests.get(f"{API}/products/{pid}").json()
        p["name"] = p["name"] + "_upd"
        p["variants"].append({"attrs": {"Medida": "C", "Color": "Azul"}, "sku": "TST-C", "price_usd": 50, "stock": 5})
        u = requests.put(f"{API}/admin/products/{pid}", headers=admin_h, json=p)
        assert u.status_code == 200 and u.json()["name"].endswith("_upd") and len(u.json()["variants"]) == 3
        vid = u.json()["variants"][2]["id"]
        q = requests.post(f"{API}/admin/variants/quick", headers=admin_h, json=[{"product_id": pid, "variant_id": vid, "stock": 42, "price_usd": 55}])
        assert q.json()["updated"] == 1
        v = requests.get(f"{API}/products/{pid}").json()["variants"][2]
        assert v["stock"] == 42 and v["price_usd"] == 55
        # delete temp product
        tmp = requests.post(f"{API}/admin/products", headers=admin_h, json={"name": "TEST_Tmp", "active": True, "variants": []}).json()
        requests.delete(f"{API}/admin/products/{tmp['id']}", headers=admin_h)
        assert requests.get(f"{API}/products/{tmp['id']}").status_code == 404

    def test_users_and_history(self, admin_h, test_env):
        r = requests.post(f"{API}/admin/users", headers=admin_h, json={"email": f"test_adm_{uuid.uuid4().hex[:5]}@x.com", "password": "Admin999", "name": "TEST_Adm", "role": "ADMIN"})
        assert r.status_code == 200 and r.json()["role"] == "ADMIN"
        test_env["created"]["users"].append(r.json()["id"])
        users = requests.get(f"{API}/admin/users", headers=admin_h).json()
        demo = next(u for u in users if u["email"] == CLIENT["email"])
        assert demo["stats"]["orders"] > 0
        h = requests.get(f"{API}/admin/users/{demo['id']}/orders", headers=admin_h)
        assert h.status_code == 200 and len(h.json()) > 0

    def test_analytics(self, admin_h):
        for per in ("day", "week", "month"):
            d = requests.get(f"{API}/admin/analytics", params={"period": per}, headers=admin_h).json()
            assert {"series", "methods", "top_products", "low_stock", "totals"} <= set(d)
            assert "ARS" in d["series"][0] and "USD" in d["series"][0]

    def test_upload(self, admin_h, client_h):
        png = (b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
               b"\x00\x00\x00\rIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82")
        assert requests.post(f"{API}/upload", files={"file": ("t.png", io.BytesIO(png), "image/png")}, headers=client_h).status_code == 403
        r = requests.post(f"{API}/upload", files={"file": ("t.png", io.BytesIO(png), "image/png")}, headers=admin_h)
        assert r.status_code == 200, r.text
        url = r.json()["url"]
        g = requests.get(f"{BASE_URL}{url}")
        assert g.status_code == 200 and g.headers["content-type"].startswith("image/")
        bad = requests.post(f"{API}/upload", files={"file": ("t.txt", io.BytesIO(b"x"), "text/plain")}, headers=admin_h)
        assert bad.status_code == 400
