const express = require("express");
const app = express();
const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("./cards.db", sqlite.OPEN_READWRITE, (err)=>{
    if (err) return console.log("Gagal membuat database");
    else return console.log("Berhasil membuat database");
});
const Hashids = require('hashids/cjs');
const hashids = new Hashids('AIfhu934fb', 10);

const PORT = 5000; 
let sql;

app.use(express.json());

app.post('/post-card', (req, res)=>{
    try{
        const {sender, recipient, message} = req.body;
        sql = "INSERT INTO cards(sender,recipient,message) VALUES (?,?,?)"

        db.run(sql, [sender, recipient, message], (err)=>{
            if(err) {
                console.log("Gagal posting database", sender, recipient, message, err);
                return res.json({
                    status: 300,
                    success: false,
                    error: "Gagal posting card"
                });
            }

            db.get("SELECT last_insert_rowid() as card_key", [], (err, row) => {
                const hashedKey = hashids.encode(row.card_key); 
                return res.status(200).json({
                    status: 200,
                    success: true,
                    message: "Berhasil posting card",
                    card_key: hashedKey
                });
            });
        })

    } catch(error) {
        return res.json({
            status: 400, 
            success: false,
            error: "Gagal post request"
        });
    }
})

app.listen(PORT);

