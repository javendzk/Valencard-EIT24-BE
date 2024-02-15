const express = require("express");
const sqlite = require("sqlite3").verbose();
const moment = require('moment-timezone');  
const Hashids = require('hashids/cjs');

const app = express();
const router = express.Router();
const hashids = new Hashids('AIfhu934fb', 10);
const db = new sqlite.Database("./cards.db", sqlite.OPEN_READWRITE, (err)=>{
    if (err) return console.log("[!] Gagal connect database");
    else return console.log(">> Berhasil connect database");
});

app.use(express.json());
const PORT = 5000; 
let sql;

router.post('/post-card', (req, res)=>{
    const date = moment().tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm [WIB]');
 
    try {
        const {sender, recipient, message, theme} = req.body;
        sql = "INSERT INTO cards(sender,recipient,message,theme) VALUES (?,?,?,?)"

        db.run(sql, [sender, recipient, message, theme], (err)=>{
            if(err) {
                console.log("[!] Gagal posting database", err);
                return res.status(300).json({
                    success: false,
                    date: date,
                    message: "Gagal posting card"
                });
            }

            console.log(">> Berhasil post database:\n", req.body)
            db.get("SELECT last_insert_rowid() as card_key", [], (err, row) => {
                const hashedKey = hashids.encode(row.card_key); 
                return res.status(200).json({
                    success: true,
                    date: date,
                    message: "Berhasil posting card",
                    card_key: hashedKey
                });
            });
        })

    } catch(error) {
        return res.status(400).json({
            success: false,
            message: "Gagal post request"
        });
    }
})


router.get('/get-card', (req, res)=>{
    const date = moment().tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm [WIB]');

    try {
        const {card_key} = req.query;
        const decodedKey = parseInt(hashids.decode(card_key)[0]);
        sql = "SELECT * FROM cards WHERE card_key = ?";

        db.get(sql, [decodedKey], (err, row)=>{
            if(err) {
                console.log("[!] Gagal mengambil database");
                return res.status(300).json({
                    success: false,
                    date: date,
                    message: "Gagal mengambil card"
                });
            }

            if(!row) {
                console.log("[!] Database tidak ditemukan: ", decodedKey);
                return res.status(404).json({
                    success: false,
                    date: date,
                    message: "Database tidak ditemukan"
                });
            }

            console.log(">> Berhasil get database:\n", row)
            return res.status(200).json({
                success: true,
                date: date,
                message: "Berhasil mengambil card",
                card: {
                    sender: row.sender,
                    recipient: row.recipient,
                    message: row.message,
                    theme: row.theme,
                }
            });
        })


    } catch(error) {
        return res.status(400).json({
            success: false,
            date: date,
            message: "Gagal get request"
        });
    }
})

app.use('/api', router);
app.listen(PORT);

