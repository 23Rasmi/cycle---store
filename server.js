const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const db = new sqlite3.Database("./db/database.db");

/* AUTO BACKUP */

const fs = require("fs");

setInterval(()=>{

const source =
"./db/database.db";

const backup =
"./db/backup.db";

fs.copyFile(
source,
backup,
(err)=>{

if(err){

console.log("Backup failed");

}else{

console.log("Backup saved");

}

});

},300000);

// Create table
db.run(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT UNIQUE,
    address TEXT,
    balance INTEGER,
    total INTEGER DEFAULT 0
  )
`);

db.run(`
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT,
  amount INTEGER,
  date TEXT
)
`);

// Transactions table
// Transactions table
db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT,
    type TEXT,
    amount INTEGER,
    previous_balance INTEGER,
    remaining_balance INTEGER,
    receipt_no TEXT,
    date TEXT,
    time TEXT
  )
`);

// Add customer
app.post("/add-customer", (req, res) => {

  const { name, phone, address } = req.body;

  db.run(
    "INSERT INTO customers (name, phone, address, balance, total) VALUES (?, ?, ?, 0, 0)",
    [name, phone, address],

    function (err) {

      if (err) {
        return res.send("Error: " + err.message);
      }

      res.send("Customer Added");

    }
  );

});
// Add udhar
app.post("/add-udhar", (req, res) => {
  const { phone, amount } = req.body;

  db.run(
  `UPDATE customers
SET
balance = balance + ?,
total = total + ?
WHERE phone = ?`,
[amount, amount, phone],
    function (err) {
      if (err) return res.send("Error");
      res.send("Udhar Added");
    }
  );
});

// Payment
app.post("/payment", (req, res) => {
  const { phone, amount } = req.body;

  db.get("SELECT * FROM customers WHERE phone = ?", [phone], (err, row) => {
    if (!row) return res.send("Customer not found");

    const prev = row.balance;
    const remaining = prev - amount;
    if (remaining < 0) {
  return res.send("Payment exceeds remaining balance");
}
    
    var date = new Date().toLocaleString();
    db.run(
      
      "UPDATE customers SET balance = ? WHERE phone = ?",
      [remaining, phone]
    );

    console.log(phone, amount, date);

    db.run(
  `INSERT INTO payments
  (phone,amount,date)
  VALUES(?,?,?)`,
  [phone, amount, date]
);

    res.send("Payment Done");
  });
});

// Get customers
app.get("/customers", (req, res) => {
  db.all("SELECT * FROM customers", [], (err, rows) => {
    res.json(rows);
  });
});
// Delete customer
app.delete("/delete-customer/:phone", (req, res) => {

  const phone = req.params.phone;

  db.run(
    "DELETE FROM customers WHERE phone = ?",
    [phone],

    function(err){

      if(err){
        return res.send("Delete failed");
      }

      res.send("Customer Deleted");

    }
  );

});
// BILL PDF
app.post("/bill", (req, res) => {
  const { name, phone, address, item, amount } = req.body;

  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=bill.pdf");

  doc.pipe(res);

  doc.fillColor("#0A3D62").fontSize(22).text("VISWAKARMA CYCLE STORE", { align: "center" });
  doc.fontSize(12).text("Agarapada", { align: "center" });

  doc.moveDown();

  doc.strokeColor("#0A3D62").lineWidth(2).moveTo(40, doc.y).lineTo(550, doc.y).stroke();

  doc.moveDown();

  doc.fillColor("black").fontSize(14).text("BILL RECEIPT", { align: "center" });

  doc.moveDown();

  doc.fontSize(12);
  doc.text("Customer Name: " + name);
  doc.text("Phone: " + phone);
  doc.text("Address: " + address);

  doc.moveDown();

  doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();

  doc.moveDown();

  doc.fillColor("#0A3D62").fontSize(13).text("Item Details:");

  doc.moveDown();

  doc.fillColor("black").fontSize(12);
  doc.text("Item", 50, doc.y);
  doc.text("Amount", 400, doc.y);

  doc.moveDown();

  doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();

  doc.moveDown();

  doc.text(item, 50, doc.y);
  doc.text("₹ " + amount, 400, doc.y);

  doc.moveDown();

  doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();

  doc.moveDown();

  doc.fontSize(14).fillColor("#0A3D62").text("Total: ₹ " + amount, { align: "right" });

  doc.moveDown(2);

  doc.fillColor("black").fontSize(11);
  doc.text("Date: " + new Date().toLocaleString());

  doc.moveDown(3);

  doc.text("Signature: Pratap Chandra Rout", { align: "right" });

  doc.end();
});

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

app.get("/history/:phone", (req,res)=>{

  var phone = req.params.phone;

  db.all(
    "SELECT * FROM payments WHERE phone = ? ORDER BY id DESC",
    [phone],
    (err,rows)=>{

      if(err){
        return res.json([]);
      }

      res.json(rows);

    }
  );

});