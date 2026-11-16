import uuid
import random
from datetime import datetime, timezone, timedelta

U = "https://images.unsplash.com/"
IMG = {
    "hero1": U + "photo-1611251953880-611e66e904e9?crop=entropy&cs=srgb&fm=jpg&q=85&w=1800",
    "hero2": U + "photo-1616196334411-1d8d09708ca6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1800",
    "fundas": U + "photo-1667893530449-e58102223524?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    "volantes": U + "photo-1555426218-51a0ee0e3599?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    "accesorios": "https://images.pexels.com/photos/8886311/pexels-photo-8886311.jpeg?auto=compress&cs=tinysrgb&w=900",
    "p1": U + "photo-1614530499660-fe1fbd7921d6?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    "p2": U + "photo-1614527255138-018e29ff34ee?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    "p3": U + "photo-1652860316277-370ca5b1b1df?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    "p4": U + "photo-1553818501-e9926ea1ea8f?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    "p5": "https://images.pexels.com/photos/10196155/pexels-photo-10196155.jpeg?auto=compress&cs=tinysrgb&w=900",
    "p6": "https://images.pexels.com/photos/8723327/pexels-photo-8723327.jpeg?auto=compress&cs=tinysrgb&w=900",
    "v1": U + "photo-1542834506-979b3951bc9a?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    "mat": "https://images.pexels.com/photos/28055130/pexels-photo-28055130.jpeg?auto=compress&cs=tinysrgb&w=900",
    "org": U + "photo-1760818078878-6948eb2fc2cf?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
}


def uid():
    return str(uuid.uuid4())


def now():
    return datetime.now(timezone.utc)


def default_settings(wa_number):
    return {
        "_id": "site",
        "usd_rate": 1250,
        "theme": {
            "primary": "#111111", "secondary": "#E8E4DD", "bg_main": "#F7F6F3", "bg_card": "#FFFFFF",
            "bg_header": "#FFFFFF", "header_text": "#111111", "bg_footer": "#111111", "footer_text": "#F2F2F2",
            "text_main": "#1A1A1A", "btn": "#111111", "btn_text": "#FFFFFF", "sale": "#E53935",
            "font": "Outfit", "radius": 6,
        },
        "identity": {"site_title": "Distribuidora Buenos Aires | Fundas y accesorios para tu auto",
                     "meta_description": "Fundas de asiento, cubre volantes y accesorios para autos. Envíos a todo el país.",
                     "logo": "", "logo_dark": "", "favicon": "", "brand_name": "DISTRIBUIDORA BUENOS AIRES"},
        "custom_css": "",
        "topbar": {"enabled": True, "rotate": True, "bg": "#111111", "color": "#FFFFFF",
                   "messages": ["ENVÍOS GRATIS SUPERANDO $150.000", "20% OFF PAGANDO CON TRANSFERENCIA", "3 Y 6 CUOTAS SIN INTERÉS"]},
        "header": {"logo_height": 40, "bg": "", "transparent": False, "sticky": True},
        "menu": [
            {"id": uid(), "label": "Inicio", "url": "/", "children": []},
            {"id": uid(), "label": "Productos", "url": "/catalogo", "children": [
                {"id": uid(), "label": "Fundas de Asiento", "url": "/catalogo?category=fundas-de-asiento", "children": [
                    {"id": uid(), "label": "Juegos Completos", "url": "/catalogo?category=juegos-completos", "children": []},
                    {"id": uid(), "label": "Delanteras", "url": "/catalogo?category=delanteras", "children": []}]},
                {"id": uid(), "label": "Cubre Volantes", "url": "/catalogo?category=cubre-volantes", "children": []},
                {"id": uid(), "label": "Accesorios", "url": "/catalogo?category=accesorios", "children": []}]},
            {"id": uid(), "label": "Ofertas", "url": "/catalogo?tag=ofertas", "children": []},
            {"id": uid(), "label": "Mayoristas", "url": "/pagina/mayoristas", "children": []},
            {"id": uid(), "label": "Nosotros", "url": "/pagina/nosotros", "children": []},
            {"id": uid(), "label": "Contacto", "url": "/pagina/contacto", "children": []},
        ],
        "search": {"placeholder": "Buscar fundas, volantes, accesorios...", "bg": "#F2F1EE", "border": "#E2E0DA",
                   "text": "#1A1A1A", "icon": "#111111", "radius": 999, "dropdown_bg": "#FFFFFF"},
        "card": {"show_brand": True, "show_stock": True, "show_dual": False, "show_discount": True, "show_quick_buy": True},
        "shipping": {"home_enabled": True, "home_cost": 9500, "free_over": 150000, "pickup_enabled": True,
                     "pickup_address": "Av. Corrientes 1234, CABA - Lun a Vie 10 a 18hs"},
        "payments": {
            "mercadopago": {"enabled": True, "mode": "sandbox", "public_key": "", "access_token": "", "adjust_pct": 0,
                            "title": "Mercado Pago", "description": "Tarjetas de crédito, débito y dinero en cuenta"},
            "cod": {"enabled": True, "title": "Pago contra entrega", "instructions": "Abonás en efectivo al recibir tu pedido.",
                    "zones": "CABA, GBA Norte, GBA Oeste", "discount_pct": 5},
            "transfer": {"enabled": True, "title": "Transferencia bancaria", "bank": "Banco Galicia",
                         "holder": "Distribuidora Buenos Aires", "cbu": "0070000000000000000000", "alias": "DISTRIBUIDORA.BA", "discount_pct": 20},
        },
        "footer": {"bg": "", "text": "", "about": "Fundas de asiento y accesorios para autos fabricados en Argentina.",
                   "columns": [
                       {"id": uid(), "title": "Tienda", "links": [{"id": uid(), "label": "Catálogo", "url": "/catalogo"}, {"id": uid(), "label": "Ofertas", "url": "/catalogo?tag=ofertas"}]},
                       {"id": uid(), "title": "Información", "links": [{"id": uid(), "label": "Nosotros", "url": "/pagina/nosotros"}, {"id": uid(), "label": "Contacto", "url": "/pagina/contacto"}]},
                   ],
                   "socials": {"instagram": "https://www.facebook.com/distribuidorabsas/", "facebook": "https://www.facebook.com/distribuidorabsas/", "tiktok": "", "youtube": ""},
                   "legal": "© 2026 Distribuidora BA. Todos los derechos reservados. Defensa del consumidor.",
                   "contact": "ventas@distribuidoraba.com · +54 9 11 3354-9747",
                   "map_enabled": True,
                   "map_iframe": "https://www.google.com/maps?q=Av.+Corrientes+1234,+CABA&output=embed"},
        "whatsapp": {"enabled": True, "position": "right", "number": wa_number, "message": "Hola! Quiero hacer una consulta.", "bubble": "¿Necesitás ayuda?"},
        "popup": {"enabled": True, "image": IMG["hero2"], "title": "10% OFF en tu primera compra",
                  "text": "Usá el cupón BIENVENIDO10 al finalizar tu compra.", "btn_text": "Ver productos", "btn_link": "/catalogo", "delay": 2},
        "home_sections": [
            {"id": uid(), "type": "hero", "title": "Slider principal", "enabled": True, "config": {"height": 560, "autoplay": 6, "slides": [
                {"id": uid(), "image": IMG["hero1"], "title": "Fundas que visten tu auto", "subtitle": "Diseños exclusivos, fabricación nacional", "align": "left", "overlay": 45, "btn_text": "Ver colección", "btn_link": "/catalogo", "btn_bg": "#FFFFFF", "btn_color": "#111111"},
                {"id": uid(), "image": IMG["hero2"], "title": "20% OFF con transferencia", "subtitle": "En toda la tienda", "align": "center", "overlay": 50, "btn_text": "Comprar ahora", "btn_link": "/catalogo?tag=ofertas", "btn_bg": "#E53935", "btn_color": "#FFFFFF"}]}},
            {"id": uid(), "type": "categories", "title": "Categorías destacadas", "enabled": True, "config": {"items": [
                {"id": uid(), "name": "Fundas de Asiento", "image": IMG["fundas"], "link": "/catalogo?category=fundas-de-asiento"},
                {"id": uid(), "name": "Cubre Volantes", "image": IMG["volantes"], "link": "/catalogo?category=cubre-volantes"},
                {"id": uid(), "name": "Accesorios", "image": IMG["accesorios"], "link": "/catalogo?category=accesorios"}]}},
            {"id": uid(), "type": "products", "title": "Ofertas", "enabled": True, "config": {"source": "tag", "value": "ofertas", "limit": 8, "layout": "carousel"}},
            {"id": uid(), "type": "banner", "title": "Banner mayoristas", "enabled": True, "config": {"image": IMG["p6"], "title": "¿Tenés un local?", "text": "Sumate a nuestra red de revendedores", "btn_text": "Ser mayorista", "link": "/pagina/mayoristas", "height": 340, "overlay": 50}},
            {"id": uid(), "type": "products", "title": "Destacados", "enabled": True, "config": {"source": "tag", "value": "destacados", "limit": 8, "layout": "grid"}},
            {"id": uid(), "type": "products", "title": "Lanzamientos", "enabled": True, "config": {"source": "tag", "value": "lanzamientos", "limit": 8, "layout": "grid"}},
            {"id": uid(), "type": "comments", "title": "Comentarios de clientes", "enabled": True, "config": {"subtitle": "Experiencias reales de quienes ya renovaron el interior de su auto", "allow_submit": True, "limit": 12}},
        ],
    }


def taxonomy():
    cats = [
        {"id": uid(), "name": "Fundas de Asiento", "slug": "fundas-de-asiento", "image": IMG["fundas"], "parent_id": None, "order": 1},
        {"id": uid(), "name": "Cubre Volantes", "slug": "cubre-volantes", "image": IMG["volantes"], "parent_id": None, "order": 2},
        {"id": uid(), "name": "Accesorios", "slug": "accesorios", "image": IMG["accesorios"], "parent_id": None, "order": 3},
    ]
    subs = [
        {"id": uid(), "name": "Juegos Completos", "slug": "juegos-completos", "image": IMG["p1"], "parent_id": cats[0]["id"], "order": 1},
        {"id": uid(), "name": "Delanteras", "slug": "delanteras", "image": IMG["p3"], "parent_id": cats[0]["id"], "order": 2},
        {"id": uid(), "name": "Alfombras", "slug": "alfombras", "image": IMG["mat"], "parent_id": cats[2]["id"], "order": 1},
    ]
    brands = [{"id": uid(), "name": "Distribuidora BA", "slug": "distribuidora-ba", "image": ""},
              {"id": uid(), "name": "AutoStyle", "slug": "autostyle", "image": ""}]
    types = [{"id": uid(), "name": "Tela acolchada", "slug": "tela-acolchada"}, {"id": uid(), "name": "Eco cuero", "slug": "eco-cuero"},
             {"id": uid(), "name": "Goma", "slug": "goma"}]
    return cats, subs, brands, types


def v(attrs, sku, usd, sale, stock, image=""):
    return {"id": uid(), "attrs": attrs, "sku": sku, "price_usd": usd, "sale_usd": sale, "ars_manual": False,
            "price_ars": 0, "sale_ars": 0, "stock": stock, "image": image}


def products(cats, subs, brands, types):
    spec = [{"key": "Material", "value": "Tela acolchada triple capa"}, {"key": "Compatibilidad", "value": "Universal con airbag lateral"},
            {"key": "Lavable", "value": "Sí, a mano"}, {"key": "Origen", "value": "Argentina"}]
    d = "<p>Funda de asiento <strong>premium</strong> con acolchado de alta densidad. Protege tus asientos originales y renueva el interior de tu auto.</p><ul><li>Instalación fácil en 15 minutos</li><li>Costuras reforzadas</li><li>Compatible con airbag lateral</li></ul>"
    raw = [
        ("Funda de Asiento Línea Glitter Rosa", subs[0], brands[0], types[0], [IMG["p2"], IMG["p6"]], ["ofertas", "destacados"],
         [v({"Medida": "Juego completo", "Color": "Rosa"}, "GL-ROS-JC", 156, 132.6, 12, IMG["p2"]),
          v({"Medida": "Delanteras", "Color": "Rosa"}, "GL-ROS-DL", 96, 0, 8, IMG["p6"]),
          v({"Medida": "Juego completo", "Color": "Fucsia"}, "GL-FUC-JC", 156, 132.6, 3, IMG["p6"])]),
        ("Funda de Asiento Línea Sport Negro", subs[0], brands[0], types[0], [IMG["p1"], IMG["fundas"]], ["destacados", "lanzamientos"],
         [v({"Medida": "Juego completo", "Color": "Negro"}, "SP-NEG-JC", 156, 0, 20, IMG["p1"]),
          v({"Medida": "Delanteras", "Color": "Negro"}, "SP-NEG-DL", 96, 0, 15, IMG["fundas"]),
          v({"Medida": "Juego completo", "Color": "Gris"}, "SP-GRI-JC", 156, 140, 2, IMG["p4"])]),
        ("Juego Fundas Eco Cuero Premium", subs[1], brands[1], types[1], [IMG["p3"], IMG["p5"]], ["ofertas", "lanzamientos"],
         [v({"Medida": "Delanteras", "Color": "Blanco"}, "EC-BLA-DL", 140, 119, 6, IMG["p3"]),
          v({"Medida": "Delanteras", "Color": "Suela"}, "EC-SUE-DL", 140, 119, 4, IMG["p5"]),
          v({"Medida": "Juego completo", "Color": "Suela"}, "EC-SUE-JC", 210, 0, 0, IMG["p5"])]),
        ("Cubre Volante Deportivo Antideslizante", cats[1], brands[0], types[1], [IMG["v1"], IMG["volantes"]], ["destacados", "ofertas"],
         [v({"Medida": "37 cm", "Color": "Negro"}, "CV-NEG-37", 24, 19.9, 30, IMG["v1"]),
          v({"Medida": "38 cm", "Color": "Negro"}, "CV-NEG-38", 24, 19.9, 25, IMG["v1"]),
          v({"Medida": "38 cm", "Color": "Rojo"}, "CV-ROJ-38", 26, 0, 4, IMG["volantes"])]),
        ("Juego Alfombras de Goma Reforzada", subs[2], brands[1], types[2], [IMG["mat"], IMG["accesorios"]], ["lanzamientos"],
         [v({"Medida": "Universal 4 piezas", "Color": "Negro"}, "AL-NEG-4P", 48, 0, 18, IMG["mat"]),
          v({"Medida": "Universal 5 piezas", "Color": "Negro"}, "AL-NEG-5P", 58, 52, 10, IMG["accesorios"]),
          v({"Medida": "Universal 4 piezas", "Color": "Gris"}, "AL-GRI-4P", 48, 0, 1, IMG["mat"])]),
    ]
    out = []
    for i, (name, cat, br, ty, imgs, tags, variants) in enumerate(raw):
        parent = cat.get("parent_id")
        out.append({"id": uid(), "name": name, "slug": name.lower().replace(" ", "-").replace("í", "i").replace("ñ", "n"),
                    "description": d, "specs": spec, "category_id": parent or cat["id"], "subcategory_id": cat["id"] if parent else None,
                    "brand_id": br["id"], "type_id": ty["id"], "images": imgs, "tags": tags, "active": True,
                    "variants": variants, "created_at": (now() - timedelta(days=10 - i)).isoformat()})
    return out


def coupons():
    return [
        {"id": uid(), "code": "BIENVENIDO10", "type": "pct", "value": 10, "expires_at": (now() + timedelta(days=180)).date().isoformat(), "max_uses": 500, "uses": 12, "active": True},
        {"id": uid(), "code": "ENVIO5000", "type": "fixed", "value": 5000, "expires_at": (now() + timedelta(days=60)).date().isoformat(), "max_uses": 100, "uses": 3, "active": True},
        {"id": uid(), "code": "VENCIDO20", "type": "pct", "value": 20, "expires_at": (now() - timedelta(days=5)).date().isoformat(), "max_uses": 50, "uses": 50, "active": True},
    ]


def pages():
    return [
        {"id": uid(), "title": "Nosotros", "slug": "nosotros", "active": True, "show_in_footer": True,
         "content": "<h2>Somos Distribuidora Buenos Aires</h2><p>Fabricamos fundas de asiento y accesorios para autos con materiales de primera calidad, diseñados y confeccionados en Argentina.</p>"},
        {"id": uid(), "title": "Contacto", "slug": "contacto", "active": True, "show_in_footer": True,
         "content": "<h2>Contacto</h2><p>Email: ventas@distribuidoraba.com<br/>WhatsApp: +54 9 11 3354-9747<br/>Showroom: Franklin D. Roosevelt 1700, CABA</p>"},
    ]


def orders(prods, rate, client_id):
    statuses = ["Pagado", "Entregado", "Enviado", "En Preparación", "Pendiente", "Entregado", "Cancelado"]
    methods = ["mercadopago", "transfer", "cod"]
    out = []
    random.seed(7)
    for n in range(36):
        p = random.choice(prods)
        var = random.choice(p["variants"])
        qty = random.randint(1, 3)
        cur = "USD" if n % 3 == 0 else "ARS"
        unit_usd = var["sale_usd"] or var["price_usd"]
        unit = round(unit_usd, 2) if cur == "USD" else round(unit_usd * rate)
        sub = round(unit * qty, 2)
        created = now() - timedelta(days=random.randint(0, 170), hours=random.randint(0, 23))
        out.append({"id": uid(), "number": 1001 + n, "user_id": client_id if n % 4 == 0 else None,
                    "customer": {"name": random.choice(["Lucía Pérez", "Martín Gómez", "Sofía Díaz", "Juan Romero", "Camila Ruiz"]),
                                 "email": "cliente@demo.com", "phone": "1155550000", "address": "Calle Falsa 123", "city": "CABA", "zip": "1405"},
                    "items": [{"product_id": p["id"], "variant_id": var["id"], "name": p["name"],
                               "variant_name": " / ".join(var["attrs"].values()), "sku": var["sku"], "image": var["image"],
                               "qty": qty, "unit_price": unit}],
                    "currency": cur, "subtotal": sub, "discount": 0, "coupon_code": None, "shipping_method": "home",
                    "shipping_cost": 0, "payment_method": methods[n % 3], "payment_adjust": 0, "total": sub,
                    "status": statuses[n % len(statuses)], "stock_deducted": statuses[n % len(statuses)] != "Cancelado",
                    "payment_status": None, "created_at": created.isoformat()})
    return out


def comments():
    return [
        {
            "id": uid(),
            "user_id": None,
            "name": "Lucía Pérez",
            "email": "lucia@example.com",
            "vehicle": "VW Gol Trend · Línea Glitter Rosa",
            "rating": 5,
            "comment": "¡Increíble cómo quedaron las fundas! El calce es perfecto y la calidad de la tela acolchada superó mis expectativas. Las coloqué en 15 minutos.",
            "photo": IMG["p2"],
            "status": "Aprobado",
            "created_at": (now() - timedelta(days=6)).isoformat(),
        },
        {
            "id": uid(),
            "user_id": None,
            "name": "Martín Gómez",
            "email": "martin@example.com",
            "vehicle": "Toyota Hilux · Eco Cuero Premium",
            "rating": 5,
            "comment": "Excelente terminación y costuras súper reforzadas. Parecen tapizado original de fábrica y se limpian con un paño húmedo.",
            "photo": IMG["p3"],
            "status": "Aprobado",
            "created_at": (now() - timedelta(days=3)).isoformat(),
        },
        {
            "id": uid(),
            "user_id": None,
            "name": "Sofía Díaz",
            "email": "sofia@example.com",
            "vehicle": "Peugeot 208 · Línea Sport Negro",
            "rating": 5,
            "comment": "Muy buena atención por WhatsApp y el envío llegó rapidísimo. El cubre volante y las fundas cambiaron por completo el interior.",
            "photo": IMG["p1"],
            "status": "Aprobado",
            "created_at": (now() - timedelta(days=1)).isoformat(),
        },
        {
            "id": uid(),
            "user_id": None,
            "name": "Juan Romero",
            "email": "juan@example.com",
            "vehicle": "Ford Ranger · Alfombras + Fundas",
            "rating": 4,
            "comment": "Muy buena relación precio-calidad, calzan muy bien en las butacas delanteras. Dejo foto de cómo quedaron instaladas.",
            "photo": IMG["fundas"],
            "status": "Pendiente",
            "created_at": (now() - timedelta(hours=5)).isoformat(),
        },
    ]
