# Valencard-EIT24-BE
Backend system for Pemasak Internal Training Team's project, *Valencard*. Available in two variants; Express.js & PostgreSQL as in `.../tree/postgresql` or Express.js & SQLite3 as in `.../tree/sqlite3`. The deployed one is with Postgres, hooked to Vercel's Postgres. 

```javascript=
GET     https://valencard-eit24.vercel.app/api/get-card
POST    https://valencard-eit24.vercel.app/api/post-card
```

## GET  .../api/get-card
Returns a card based on a key provided in url parameter 
```javascript
https://valencard-eit24.vercel.app/api/get-card?card_key={CARD_KEY}
```
Example request and response;
```javascript
https://valencard-eit24.vercel.app/api/get-card?card_key=YwW8l2Q0KO
```
```json
{
	"success": true,
	"date": "16-02-2024 14:49 WIB",
	"message": "Berhasil mengambil card",
	"card": {
		"sender": "Github",
		"recipient": "Javendzk",
		"message": "Hey, I'm trying out this valencard repository, cheer!",
		"theme": 1
	}
}
```

## POST  .../api/post-card
Posts a card to database and returns a unique key for it. Post request is made with JSON body and must have a JSON header, which is `"Content-Type": "application/json"`
```javascript
https://valencard-eit24.vercel.app/api/post-card
```
Example request (JSON request body);
```json
{
	"sender": "Github",
	"recipient": "Javendzk",
	"message": "Hey, I'm trying out this valencard repository, cheer!",
	"theme": 1
}
```
Example response;
```json
{
	"success": true,
	"date": "16-02-2024 14:49 WIB",
	"message": "Berhasil posting card",
	"card_key": "YwW8l2Q0KO"
}
```
## Failed / Bad Requests
on …/api/get-card if no card found for corresponding key
```json
{
	"success": false,
	"date": "16-02-2024 15:18 WIB",
	"message": "Database tidak ditemukan"
}
```
on …/api/post-card if card posting failed
```json
{
	"success": false,
	"message": "Gagal posting card request"
}
```

## Extras
Run `npm install` to automatically install all dependency listed below and `npm run dev` to fire it up on localhost. Remember to make a `.env` file containing required resources (PostgreSQL variant) or simply edit ports & database connection on `index.js` (all variant)
- dotenv: ^16.4.4
- express: ^4.18.2
- hashids: ^2.3.0
- moment-timezone: ^0.5.45
- nodemon: ^3.0.3
- pg: ^8.11.3 (PostgreSQL variant)
- sqlite3: "^5.1.7 (SQLite3 variant)
