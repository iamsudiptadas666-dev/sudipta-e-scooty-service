const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Find the start of /api/track-order
const startIdx = code.indexOf('app.get("/api/track-order"');
// Find the start of the next endpoint
const endIdx = code.indexOf('app.get("/api/orders/:id"', startIdx);

const replacement = `app.get("/api/track-order", (req, res) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ message: "Phone Number is required" });
  }

  const db = readDb();
  const orders = db.orders || [];
  
  const foundOrders = orders.filter((o) => 
    o.customerPhone.includes(phone)
  );
  
  // Sort by created at descending
  foundOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (foundOrders.length > 0) {
    res.json(foundOrders);
  } else {
    res.status(404).json({ message: "No orders found for this number." });
  }
});\n\n`;

code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
fs.writeFileSync('server.ts', code);
