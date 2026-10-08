const fs = require('fs');
let file = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

file = file.replace(
  /const updateOrderStatus = [\s\S]*?const deleteOrder = \(orderId: string\) => \{\s*setOrders\(\(prev\) => prev.filter\(\(ord\) => ord.id !== orderId\)\);\s*\};/,
  `const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => {
      const next = prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord));
      const updatedOrd = next.find(o => o.id === orderId);
      if (updatedOrd) {
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedOrd),
        }).catch(err => console.warn('Could not update order status in cloud:', err));
      }
      return next;
    });
  };

  const updateOrder = (orderId: string, updatedData: Partial<Order>) => {
    setOrders((prev) => {
      const next = prev.map((ord) => (ord.id === orderId ? { ...ord, ...updatedData } : ord));
      const updatedOrd = next.find(o => o.id === orderId);
      if (updatedOrd) {
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedOrd),
        }).catch(err => console.warn('Could not update order in cloud:', err));
      }
      return next;
    });
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
    fetch(\`/api/orders?id=\${orderId}\`, {
      method: 'DELETE',
    }).catch((err) => console.warn('Could not delete order from cloud:', err));
  };`
);

file = file.replace(
  /const createOrder = \(orderData: Omit<Order, 'id' \| 'orderNumber' \| 'createdAt'>\): Order => \{[\s\S]*?return newOrder;\s*\};/,
  `const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order => {
    const newOrderNumber = \`LCC-\${Math.floor(1000 + Math.random() * 9000)}\`;
    const newOrder: Order = {
      ...orderData,
      id: \`ord-\${Date.now()}\`,
      orderNumber: newOrderNumber,
      createdAt: new Date().toISOString(),
    };

    // Deduce stock
    newOrder.items.forEach((item) => {
      updateStock(item.productId, (products.find((p) => p.id === item.productId)?.stock ?? 1) - item.quantity);
    });

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Persist to Neon DB
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch(err => console.warn('Could not save order to cloud:', err));

    return newOrder;
  };`
);

file = file.replace(
  /\/\/ 2\. Fetch categories from Neon DB/,
  `// 1.5 Fetch orders from Neon DB safely
      fetch('/api/orders')
        .then((res) => (res.ok ? res.json() : null))
        .then((serverOrders) => {
          if (isCurrent && Array.isArray(serverOrders) && serverOrders.length > 0) {
            setOrders((prev) => {
              const serverIds = new Set(serverOrders.map((o) => o.id));
              const localOnly = prev.filter((o) => !serverIds.has(o.id));
              const merged = [...serverOrders, ...localOnly].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              try {
                localStorage.setItem('lcc_orders', JSON.stringify(merged));
              } catch (e) {}
              return merged;
            });
          }
        })
        .catch(() => {});

      // 2. Fetch categories from Neon DB`
);

fs.writeFileSync('src/context/StoreContext.tsx', file, 'utf8');
