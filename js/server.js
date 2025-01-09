const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = new sqlite3.Database('./kullanicilar.db', (err) => {
    if (err) {
        console.error("Veritabanına bağlanırken hata:", err.message);
    } else {
        console.log("SQLite veritabanına başarıyla bağlandı.");
    }
});

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)`, (err) => {
    if (err) {
        console.error("Tablo oluşturulurken hata:", err.message);
    } else {
        console.log("users tablosu başarıyla oluşturuldu.");
    }
});

// Kullanıcı kaydı
app.post('/signup', async (req, res) => {
    const { fullname, email, password } = req.body;
    console.log('Kayıt isteği alındı:', { fullname, email });

    // E-posta doğrulama
    if (!email.includes('@')) {
        return res.status(400).send('Geçerli bir e-posta adresi girin.');
    }

    // Kullanıcının daha önce kayıt olup olmadığını kontrol et
    const checkQuery = `SELECT * FROM users WHERE email = ?`;
    db.get(checkQuery, [email], async (err, row) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).send('Sunucu hatası.');
        }
        if (row) {
            return res.status(400).send('Bu e-posta zaten kullanılıyor.');
        }

        // Parolayı şifrele
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Şifrelenmiş parola:', hashedPassword);

        // Kullanıcıyı veritabanına ekle
        const insertQuery = `INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)`;
        db.run(insertQuery, [fullname, email, hashedPassword], function (err) {
            if (err) {
                console.error('Kayıt hatası:', err);
                return res.status(400).send('Kayıt işlemi sırasında bir hata oluştu.');
            }
            console.log('Kullanıcı başarıyla kaydedildi:', { id: this.lastID });
            res.status(201).send('Kayıt başarılı!');
        });
    });
});

// Giriş yapma
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Giriş isteği alındı:', { email });

    // Kullanıcının veritabanında olup olmadığını kontrol et
    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], async (err, row) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).send('Sunucu hatası.');
        }
        if (!row) {
            return res.status(400).send('E-posta veya şifre hatalı.');
        }

        // Şifreyi kontrol et
        const match = await bcrypt.compare(password, row.password);
        if (!match) {
            return res.status(400).send('E-posta veya şifre hatalı.');
        }

        // JWT oluştur
        const token = jwt.sign({ id: row.id, email: row.email }, 'gizliAnahtar', { expiresIn: '1h' });
        res.status(200).json({ message: 'Giriş başarılı!', token });
    });
});

// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Server çalışıyor http://localhost:${port}`);
});
