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


pool.connect(async (err)=>{
    if (err) {
        console.log("[!] Gagal connect ke database", err)
    } else {
        console.log(">> Berhasil connect ke database")
        try {
            await pool.query("ALTER TABLE cards ADD COLUMN IF NOT EXISTS custom_key text UNIQUE");
            console.log(">> custom_key column ready")
        } catch (err) {
            console.log("[!] Failed to ensure custom_key column", err)
        }
    }
})

app.use(express.json());
let sql;

const findCardByKey = async (key) => {
    if (!key) return null;

    const direct = await pool.query("SELECT * FROM cards WHERE custom_key = $1", [key]);
    if (direct.rowCount > 0) {
        return direct.rows[0];
    }

    const decoded = hashids.decode(key);
    const decodedId = parseInt(decoded[0]);
    if (!decodedId) {
        return null;
    }

    const byId = await pool.query("SELECT * FROM cards WHERE card_key = $1", [decodedId]);
    return byId.rowCount > 0 ? byId.rows[0] : null;
};

router.post('/post-card', async (req, res)=>{
    const date = moment().tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm [WIB]');
 
    try {
        const { sender, recipient, message, theme, card_key } = req.body;
        const data = [sender, recipient, message, theme];
        let result;

        if (card_key) {
            sql = "INSERT INTO cards(sender, recipient, message, theme, custom_key) VALUES ($1, $2, $3, $4, $5) RETURNING card_key, custom_key";
            data.push(card_key);
        } else {
            sql = "INSERT INTO cards(sender, recipient, message, theme) VALUES ($1, $2, $3, $4) RETURNING card_key";
        }

        result = await pool.query(sql, data);

        const row = result.rows[0];
        const returnedKey = row.custom_key || hashids.encode(row.card_key);

        console.log(">> Berhasil post database:\n", req.body)
        return res.status(200).json({
            success: true,
            date,
            message: "Berhasil posting card",
            card_key: returnedKey
        });

    } catch(error) {
        console.log("[!] Gagal posting database", error);
        const message = error.code === '23505' ? "card_key sudah digunakan" : "Gagal posting card request";
        return res.status(500).json({
            success: false,
            message
        });
    }
})


router.put('/put-card', async (req, res) => {
    const date = moment().tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm [WIB]');

    try {
        const { card_key, new_card_key, sender, recipient, message, theme } = req.body;

        if (!card_key) {
            return res.status(400).json({
                success: false,
                date,
                message: "card_key is required"
            });
        }

        const card = await findCardByKey(card_key);
        if (!card) {
            return res.status(404).json({
                success: false,
                date,
                message: "Card tidak ditemukan"
            });
        }

        const updates = [];
        const values = [];

        if (new_card_key !== undefined) {
            values.push(new_card_key);
            updates.push(`custom_key = $${values.length}`);
        }
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

        values.push(card.card_key);
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
            card_key: new_card_key || card.custom_key || hashids.encode(card.card_key)
        });
    } catch (error) {
        console.log("[!] Gagal mengubah card", error);
        const message = error.code === '23505' ? "new_card_key sudah digunakan" : "Gagal mengubah card";
        return res.status(500).json({
            success: false,
            date,
            message
        });
    }
})


router.get('/get-card', async (req, res)=>{
    const date = moment().tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm [WIB]');

    try {
        const { card_key } = req.query;
        const row = await findCardByKey(card_key);

        if (!row) {
            return res.status(404).json({
                success: false,
                date,
                message: "Database tidak ditemukan"
            });
        }

        console.log(">> Berhasil get database:\n", row)
        return res.status(200).json({
            success: true,
            date,
            message: "Berhasil mengambil card",
            card: {
                sender: row.sender,
                recipient: row.recipient,
                message: row.message,
                theme: row.theme,
            }
        });
      
    } catch(error) {
        console.log("[!] Database tidak ditemukan", error);
        return res.status(500).json({
                success: false,
                date,
                message: "Database tidak ditemukan"
        });
    }
})

app.use('/api', router);
app.listen(process.env.PORT, () => console.log(">> Server jalan euy"))
