# API Kurulum ve Konfigürasyon Kılavuzu

## 📁 API Dosya Yapısı

```
src/
├── api/
│   ├── config.js      # Ortam konfigürasyonu (local/production)
│   ├── client.js      # Axios client ve interceptor'lar
│   └── auth.js        # Authentication API fonksiyonları
└── utils/
    └── auth.js        # Token ve kullanıcı yönetimi helper'ları
```

## 🔧 Ortam Yönetimi

### Local Ortam (Varsayılan)

Şu anda sistem **local** ortamda çalışacak şekilde ayarlanmış:
- Base URL: `http://127.0.0.1:8000/api`
- Timeout: 10000ms

### Production Ortamına Geçiş

1. `src/api/config.js` dosyasını açın
2. `CURRENT_ENV` değişkenini güncelleyin:

```javascript
// Local için
const CURRENT_ENV = ENV.LOCAL;

// Production için
const CURRENT_ENV = ENV.PRODUCTION;
```

3. Production URL'ini ekleyin:

```javascript
[ENV.PRODUCTION]: {
  baseURL: 'https://api.yourdomain.com/api',  // ← Buraya production URL'inizi ekleyin
  timeout: 15000
}
```

## 🔐 Kimlik Doğrulama Akışı

### Login İşlemi

```javascript
import { login } from '../api/auth';

const result = await login({ email, password });

if (result.success) {
  // Başarılı giriş
  // Token otomatik olarak localStorage'a kaydedildi
  window.location.href = '/';
} else {
  // Hata durumu
  console.error(result.message);
}
```

### Register İşlemi

```javascript
import { register } from '../api/auth';

const result = await register({
  name: 'Ahmet Yılmaz',
  email: 'ahmet@restoran.com',
  tenant_name: 'Lezzet Restoran',
  tenant_slug: 'lezzet-restoran',  // Otomatik oluşturulur
  password: 'password123'
});

if (result.success) {
  // Başarılı kayıt
  window.location.href = '/';
}
```

### Logout İşlemi

```javascript
import { logout } from '../api/auth';

logout(); // Token temizlenir ve /login'e yönlendirilir
```

## 🔑 Token Yönetimi

Token'lar otomatik olarak yönetilir:

- **Kayıt/Giriş**: Token otomatik olarak localStorage'a kaydedilir
- **API İstekleri**: Token otomatik olarak her isteğe `Authorization: Bearer {token}` header'ı olarak eklenir
- **401 Hatası**: Token geçersizse kullanıcı otomatik olarak login sayfasına yönlendirilir

### Manuel Token İşlemleri

Gerekirse manuel olarak token'lara erişebilirsiniz:

```javascript
import { 
  getAuthToken, 
  setAuthToken, 
  getUserData, 
  clearAuthData,
  isAuthenticated 
} from '../utils/auth';

// Token'ı al
const token = getAuthToken();

// Kullanıcı verisi al
const user = getUserData();

// Giriş kontrolü
if (isAuthenticated()) {
  console.log('Kullanıcı giriş yapmış');
}

// Tüm verileri temizle
clearAuthData();
```

## 📡 API İstekleri

### Mevcut Auth Endpoint'leri

- `POST /api/login` - Kullanıcı girişi
- `POST /api/register` - Yeni kullanıcı kaydı

### Yeni API Endpoint'i Ekleme

Örnek: Products API oluşturma

1. `src/api/products.js` dosyası oluşturun:

```javascript
import apiClient from './client';

export const getProducts = async () => {
  try {
    const response = await apiClient.get('/products');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      errors: error.errors
    };
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await apiClient.post('/products', productData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      errors: error.errors
    };
  }
};
```

2. Component'te kullanın:

```javascript
import { getProducts } from '../api/products';

const fetchProducts = async () => {
  const result = await getProducts();
  if (result.success) {
    setProducts(result.data);
  } else {
    console.error(result.message);
  }
};
```

## ⚠️ Hata Yönetimi

API client otomatik olarak hataları yönetir:

### 401 Unauthorized
- Token geçersiz veya süresi dolmuş
- Kullanıcı otomatik olarak `/login`'e yönlendirilir
- Token ve kullanıcı verisi temizlenir

### 422 Validation Error
- Form validation hataları
- `errors` objesi döner (Laravel validation formatında)

```javascript
{
  success: false,
  message: 'Validation failed',
  errors: {
    email: ['E-posta adresi geçersiz'],
    password: ['Şifre en az 6 karakter olmalıdır']
  }
}
```

### Genel Hatalar
- Network hataları
- Server hataları (500, 503 vb.)

```javascript
{
  success: false,
  message: 'Bir hata oluştu',
  status: 500
}
```

## 🧪 Test ve Geliştirme

### Backend Kontrolü

1. Backend'in çalıştığından emin olun:
   ```bash
   php artisan serve
   ```

2. API endpoint'lerini test edin:
   ```bash
   curl -X POST http://127.0.0.1:8000/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"password"}'
   ```

### CORS Sorunları

Eğer CORS hatası alırsanız, backend'de `config/cors.php` dosyasını kontrol edin:

```php
'allowed_origins' => ['http://localhost:5173'],
```

## 📝 Notlar

- Token'lar `localStorage`'da saklanır
- Token süresiz (backend'de Sanctum yapılandırmasına bağlı)
- Otomatik token yenileme henüz implement edilmedi
- Remember me fonksiyonu şu anda pasif (ileride eklenebilir)

## 🚀 Deployment Checklist

Production'a geçmeden önce:

- [ ] `src/api/config.js` dosyasında production URL'i ayarlayın
- [ ] `CURRENT_ENV` değişkenini `ENV.PRODUCTION` olarak değiştirin
- [ ] Backend CORS ayarlarını production domain'i için yapılandırın
- [ ] HTTPS kullandığınızdan emin olun
- [ ] Environment variables için `.env` dosyası kullanmayı düşünün

