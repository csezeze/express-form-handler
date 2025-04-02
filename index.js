const express = require('express');
const fs = require('fs');
const firebase = require('firebase');
require('firebase/database');
const app = express();
const port = process.env.PORT || 3000;

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY', // Firebase API anahtarınızı buraya ekleyin
  authDomain: 'your-project-id.firebaseapp.com',
  databaseURL: 'https://your-project-id.firebaseio.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project-id.appspot.com',
  messagingSenderId: 'sender-id',
  appId: 'your-app-id'
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

const db = firebase.database();

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
  });

  // Log dosyasına yazma
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
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${port}`);
});
