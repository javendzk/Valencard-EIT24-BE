//Kalau cards.db masi kosong, run "node table.js" 1x di terminal.

//File ini obsolete kalau pake postgres.

/*
const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("./cards.db", sqlite.OPEN_READWRITE, (err)=>{
    if (err) return console.log("Gagal connect database");
    else return console.log("Berhasil connect database");
});

const sql = `
    CREATE TABLE cards (
        card_key INTEGER PRIMARY KEY,
        sender TEXT,
        recipient TEXT,
        message TEXT,
        theme INTEGER
    )
`;

db.run(sql, (err) => {
    if (err) return console.log("[!] Gagal membuat database", err.message);
    else return console.log(">> Berhasil membuat table");
});
*/
