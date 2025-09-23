# JobRight.ai Clone - MVP

Bu proje, [JobRight.ai](https://jobright.ai/) web sitesinin temel özelliklerini içeren bir klonunun MVP (Minimum Viable Product) sürümüdür. Proje, MERN yığını (MongoDB, Express.js, React, Node.js) kullanılarak geliştirilmiştir.

## MVP Özellikleri

-   **Kullanıcı Kayıt ve Giriş:** Kullanıcılar sisteme kaydolabilir ve giriş yapabilirler. Kimlik doğrulama işlemleri JWT (JSON Web Tokens) ile güvence altına alınmıştır.
-   **İş Arama:** Kullanıcılar, anahtar kelime ve lokasyon bazlı iş araması yapabilirler. İş listeleri, anlık olarak [Indeed.com](http://Indeed.com) üzerinden web scraping yöntemiyle çekilmektedir.
-   **Özgeçmiş Yönetimi:** Kullanıcılar, PDF formatındaki özgeçmişlerini sisteme yükleyebilirler. Yüklenen PDF dosyası sunucu tarafında işlenerek metin içeriği veritabanına kaydedilir.

## Teknoloji Yığını

-   **Backend:** Node.js, Express.js, MongoDB (Mongoose ile)
-   **Frontend:** React, React Router, Axios
-   **Kimlik Doğrulama:** JSON Web Token (JWT)
-   **Web Scraping:** Axios, Cheerio
-   **Dosya Yükleme:** Multer, PDF-Parse

## Gereksinimler

-   Node.js (v14 veya üstü)
-   MongoDB

## Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

### 1. Projeyi Klonlayın

```bash
git clone <proje-linki>
cd <proje-dizini>
```

### 2. Backend Kurulumu

Projenin kök dizininde (root) aşağıdaki komutları çalıştırın:

```bash
# Gerekli paketleri yükleyin
npm install

# .env dosyasını oluşturun ve yapılandırın
```

Proje kök dizininde `.env` adında bir dosya oluşturun ve aşağıdaki içeriği ekleyin. `MONGO_URI` değişkenini kendi MongoDB bağlantı adresinizle güncelleyin.

```
MONGO_URI=mongodb://localhost:27017/jobright_clone
JWT_SECRET=mysecrettoken
```

```bash
# Backend sunucusunu başlatın
npm start
```

Backend sunucusu `http://localhost:5000` adresinde çalışmaya başlayacaktır.

### 3. Frontend Kurulumu

Yeni bir terminal açın ve `client` dizinine gidin:

```bash
cd client

# Gerekli paketleri yükleyin
npm install

# Frontend geliştirme sunucusunu başlatın
npm start
```

Frontend uygulaması `http://localhost:3000` adresinde çalışmaya başlayacak ve otomatik olarak tarayıcınızda açılacaktır.

## API Endpoints

-   `POST /api/auth/register`: Yeni kullanıcı kaydı.
-   `POST /api/auth/login`: Kullanıcı girişi.
-   `GET /api/jobs/search`: İş arama (query params: `keywords`, `location`).
-   `POST /api/resume/upload`: PDF özgeçmiş yükleme (multipart/form-data).
