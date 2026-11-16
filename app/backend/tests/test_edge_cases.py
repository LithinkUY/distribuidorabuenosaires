"""Edge-case regression tests found during code review (iteration 1)."""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN = {"email": "admin@distribuidoraba.com", "password": "Admin123!"}


@pytest.fixture(scope="module")
def admin_h():
    r = requests.post(f"{API}/auth/login", json=ADMIN)
    return {"Authorization": f"Bearer {r.json()['token']}"}


# Search must not crash when a product was created without 'images'
def test_search_product_without_images(admin_h):
    name = f"TEST_NoImg_{uuid.uuid4().hex[:6]}"
    p = requests.post(f"{API}/admin/products", headers=admin_h, json={
        "name": name, "active": True,
        "variants": [{"attrs": {"Medida": "U"}, "sku": "TST-NI", "price_usd": 10, "stock": 1}]}).json()
    try:
        r = requests.get(f"{API}/search", params={"q": name})
        assert r.status_code == 200, f"search crashed: {r.status_code} {r.text[:200]}"
    finally:
        requests.delete(f"{API}/admin/products/{p['id']}", headers=admin_h)


# Admin update of unknown user should be 404, not 500
def test_update_unknown_user_returns_404(admin_h):
    r = requests.put(f"{API}/admin/users/nonexistent-{uuid.uuid4().hex}", headers=admin_h, json={"name": "x"})
    assert r.status_code == 404, f"got {r.status_code}"


# Update of unknown taxonomy item should be 404
def test_update_unknown_brand_returns_404(admin_h):
    r = requests.put(f"{API}/admin/brands/nonexistent-{uuid.uuid4().hex}", headers=admin_h, json={"name": "TEST_x"})
    assert r.status_code == 404, f"got {r.status_code} body={r.text[:100]}"


# Coupon max_uses enforcement
def test_coupon_max_uses(admin_h):
    code = f"TEST_MU{uuid.uuid4().hex[:4]}".upper()
    c = requests.post(f"{API}/admin/coupons", headers=admin_h, json={"code": code, "type": "pct", "value": 5, "active": True, "max_uses": 1, "uses": 1}).json()
    try:
        prods = requests.get(f"{API}/products", params={"in_stock": "true"}).json()
        p = prods[0]
        v = next(x for x in p["variants"] if x["stock"] > 0)
        q = requests.post(f"{API}/cart/quote", json={"items": [{"product_id": p["id"], "variant_id": v["id"], "qty": 1}], "coupon": code}).json()
        assert not q["coupon_ok"] and "límite" in q["coupon_msg"]
    finally:
        requests.delete(f"{API}/admin/coupons/{c['id']}", headers=admin_h)


# Quick edit with malformed row should be 400/422 not 500
def test_quick_edit_bad_input(admin_h):
    r = requests.post(f"{API}/admin/variants/quick", headers=admin_h, json=[{"stock": 1}])
    assert r.status_code in (400, 422), f"got {r.status_code}"


# Negative qty in cart should be rejected
def test_negative_qty_quote():
    prods = requests.get(f"{API}/products", params={"in_stock": "true"}).json()
    p = prods[0]
    v = p["variants"][0]
    q = requests.post(f"{API}/cart/quote", json={"items": [{"product_id": p["id"], "variant_id": v["id"], "qty": -3}]})
    body = q.json()
    assert q.status_code in (400, 422) or body.get("errors"), f"negative qty accepted: subtotal={body.get('subtotal')}"
