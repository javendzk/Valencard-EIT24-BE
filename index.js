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
        console.log("[!] Gagal posting database", error);
        return res.status(500).json({
            success: false,
            message: "Gagal posting card request"
        });
    }
})


router.put('/put-card', async (req, res) => {
    const date = moment().tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm [WIB]');

    try {
        const { card_key, sender, recipient, message, theme } = req.body;

        if (!card_key) {
            return res.status(400).json({
                success: false,
                date,
                message: "card_key is required"
            });
        }

        const decodedKey = parseInt(hashids.decode(card_key)[0]);
        if (!decodedKey) {
            return res.status(404).json({
                success: false,
                date,
                message: "Card tidak ditemukan"
            });
        }

        const updates = [];
        const values = [];

        if (sender !== undefined) {
            values.push(sender);
            updates.push(`sender = $${values.length}`);
        }
        if (recipient !== undefined) {
            values.push(recipient);
            updates.push(`recipient = $${values.length}`);
        }
        if (message !== undefined) {
            values.push(message);
            updates.push(`message = $${values.length}`);
        }
        if (theme !== undefined) {
            values.push(theme);
            updates.push(`theme = $${values.length}`);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                date,
                message: "Tidak ada data untuk diubah"
            });
        }

        values.push(decodedKey);
        sql = `UPDATE cards SET ${updates.join(', ')} WHERE card_key = $${values.length}`;

        const result = await pool.query(sql, values);
        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                date,
                message: "Card tidak ditemukan"
            });
        }

        return res.status(200).json({
            success: true,
            date,
            message: "Berhasil mengubah card",
            card_key
        });
    } catch (error) {
        console.log("[!] Gagal mengubah card", error);
        return res.status(500).json({
            success: false,
            date,
            message: "Gagal mengubah card"
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
