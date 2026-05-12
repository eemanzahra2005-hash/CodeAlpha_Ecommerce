const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "db.sqlite");
const defaultProducts = [
    { name: "Shoes", price: 50 },
    { name: "Watch", price: 70 },
    { name: "Phone", price: 300 }
];

const db = new sqlite3.Database(dbPath, (error) => {
    if (error) {
        console.error("Failed to open or create sqlite database:", error.message || error);
        process.exit(1);
    }
    console.log(`Using SQLite database file: ${dbPath}`);
});

db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL
        );`,
        (error) => {
            if (error) {
                console.error("Failed to create products table:", error.message || error);
                process.exit(1);
            }
        }
    );

    db.get("SELECT COUNT(*) AS count FROM products", (error, row) => {
        if (error) {
            console.error("Failed to count products:", error.message || error);
            process.exit(1);
        }

        const count = row?.count || 0;
        if (count === 0) {
            const insertStmt = db.prepare("INSERT INTO products (name, price) VALUES (?, ?)");
            defaultProducts.forEach((product) => {
                insertStmt.run(product.name, product.price);
            });
            insertStmt.finalize((error) => {
                if (error) {
                    console.error("Failed to seed default products:", error.message || error);
                    process.exit(1);
                }
                console.log("Seeded default products into SQLite database.");
                db.close();
            });
        } else {
            console.log(`Products table already contains ${count} rows.`);
            db.close();
        }
    });
});