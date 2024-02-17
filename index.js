const express = require("express");
const { Pool } = require('pg')
const moment = require('moment-timezone');  
const Hashids = require('hashids/cjs');
const cors = require("cors");

require('dotenv').config()
const app = express();
const router = express.Router();
const hashids = new Hashids('AIfhu934fb', 10);
app.use(cors());

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL ,
})


pool.connect((err)=>{
    if (err) {
        console.log("[!] Gagal connect ke database", err)
    } else {
        console.log(">> Berhasil connect ke database")
    }
})

app.use(express.json());
let sql;

router.post('/post-card', async (req, res)=>{
    const date = moment().tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm [WIB]');
 
    try {
        const {sender, recipient, message, theme} = req.body;
        const data = [sender, recipient, message, theme];
        sql = "INSERT INTO cards(sender, recipient, message, theme) VALUES ($1, $2, $3, $4) RETURNING card_key";

        const result = await pool.query(sql, data);
        const hashedKey = hashids.encode(result.rows[0].card_key);

        console.log(">> Berhasil post database:\n", req.body)
        return res.status(200).json({
            success: true,
            date: date,
            message: "Berhasil posting card",
            card_key: hashedKey
        });

    } catch(error) {
        console.log("[!] Gagal posting database", err);
        return res.status(500).json({
            success: false,
            message: "Gagal posting card request"
        });
    }
})


router.get('/get-card', async (req, res)=>{
    const date = moment().tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm [WIB]');

    try {
        const {card_key} = req.query;
        const decodedKey = parseInt(hashids.decode(card_key)[0]);
        const data = [decodedKey];
        sql = "SELECT * FROM cards WHERE card_key = $1";

        const result = await pool.query(sql, data);
        const row = result.rows[0];

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
      
    } catch(error) {
        console.log("[!] Database tidak ditemukan");
        return res.status(200).json({
                success: false,
                date: date,
                message: "Database tidak ditemukan"
        });
    }
})

app.use('/api', router);
app.listen(process.env.PORT, () => console.log(">> Server jalan euy"))
