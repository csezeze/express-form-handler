// Firebase Admin SDK modülünü dahil et
const admin = require('firebase-admin');
const fs = require('fs');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Firebase Admin SDK'yı başlatmak için serviceAccountKey'yi kullanmalısınız.
// 'path/to/your/serviceAccountKey.json' yerine gerçek dosya yolunu yazmalısınız.
var serviceAccount = require("path/to/serviceAccountKey.json"); 

// Firebase Admin SDK'yı başlat
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://express-form-project-default-rtdb.firebaseio.com"
 // Firebase Realtime Database URL
});

// Firebase veritabanı bağlantısı
const db = admin.database();

// IP ve zaman loglama
app.use((req, res, next) => {
  const zaman = new Date().toLocaleString(); // Zaman bilgisi
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress; // IP adresi
  const userAgent = req.headers['user-agent']; // Tarayıcı bilgisi
  const logMessage = `[${zaman}] IP: ${ip} - Agent: ${userAgent} -> ${req.method} ${req.url}\n`;

  // Logları log.txt dosyasına kaydet
  fs.appendFile('log.txt', logMessage, (err) => {
    if (err) {
      console.error('Log dosyasına yazılamadı:', err);
    } else {
      console.log('Log dosyasına kaydedildi.');
    }
  });

  next(); // Diğer işlemlere devam et
});

// Form verilerini almak için middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // public klasörünü erişilebilir yap

// Keep-Alive kodu: Sunucu her dakika aktif tutulacak
setInterval(() => {
  console.log('Sunucu canlı tutuluyor...');
}, 60000);

// Anasayfa: Formun gösterileceği HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/form.html');
});

// Formdan gelen verileri Firebase'e kaydet
app.post('/gonder', (req, res) => {
  const ad = req.body.ad;
  const mesaj = req.body.mesaj;
  const zaman = new Date().toLocaleString();

  // Firebase'e veri gönderme
  db.ref('messages').push({
    ad: ad,
    mesaj: mesaj,
    zaman: zaman
  }).then(() => {
    // Firebase'e başarılı veri ekledikten sonra log dosyasına yazma
    const satir = `[${zaman}] Ad: ${ad}, Mesaj: ${mesaj}\n`;
    fs.appendFile('mesajlar.txt', satir, (err) => {
      if (err) {
        console.error('Dosyaya yazılamadı:', err);
        res.status(500).send('Sunucu hatası');
      } else {
        console.log('Mesaj dosyaya kaydedildi.');
        res.send(`Teşekkürler, ${ad}! Mesajın alındı.`);
      }
    });
  }).catch((error) => {
    console.error('Firebase veritabanına kaydedilemedi:', error);
    res.status(500).send('Veritabanı hatası');
  });
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${port}`);
});
