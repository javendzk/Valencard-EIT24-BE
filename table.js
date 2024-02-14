const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("./cards.db", sqlite.OPEN_READWRITE, (err)=>{
    if (err) return console.log("Gagal membuat database");
});

const sql = "CREATE TABLE cards(card_key INTEGER PRIMARY KEY, sender TEXT, recipient TEXT, message TEXT)";

db.run(sql, (err) => {
    if (err) return console.error(err.message);
});
