const fs = require('fs'); // Dosya sistemi modülü
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

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

// Anasayfa: Formun gösterileceği HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/form.html');
});

// Formdan gelen verileri yakala
app.post('/gonder', (req, res) => {
  const ad = req.body.ad;
  const mesaj = req.body.mesaj;

  const zaman = new Date().toLocaleString();
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
