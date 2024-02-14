const sqlite3 = require("sqlite3").verbose();

let sql;

// Connect to DB
let db = new sqlite3.Database(':memory:');

// Create table
sql = 'CREATE TABLE users (card_key INTEGER PRIMARY KEY, sender TEXT, recipient TEXT, message TEXT)';
db.run(sql, (err) => {
    if (err) return console.error(err.message);

    // Insert data into table
    sql = 'INSERT INTO users (card_key, sender, recipient, message) VALUES (?,?,?,?)';
    db.run(sql, [123456, 'John', 'Jane', 'Happy Valentines Day!'], (err) => {
        if (err) return console.error(err.message);

        // Update data in table
        sql = 'UPDATE users SET message = ? WHERE card_key = ?';
        db.run(sql, ['Happy Valentines Day!', 123456], (err) => {
            if (err) return console.error(err.message);

            // Select data from table
            sql = 'SELECT * FROM users';
            db.all(sql, [], (err, rows) => {
                if (err) return console.error(err.message);
                rows.forEach((row) => {
                    console.log(row);
                });
            });
        });
    });
});
