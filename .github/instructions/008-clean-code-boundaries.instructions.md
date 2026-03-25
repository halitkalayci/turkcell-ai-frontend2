---
description: >
  Robert Martin – Clean Code, Chapter 8: Boundaries.
  Üçüncü taraf kod, harici API ve sistem sınırlarının temiz yönetimini açıklar.
applyTo: "**"
---

# Chapter 8 – Boundaries

## 1. Temel Prensip

> "We don't always control the code on the other side of a boundary. We need to manage boundaries carefully to prevent our software from becoming too dependent on their choices."

Kodumuzun dış kütüphaneler ve servislerle sınırları sarılmış, test edilmiş ve yalıtılmış olmalıdır.

---

## 2. Üçüncü Taraf Koda Dikkat

Dış kütüphanelerin API'si büyük, geniş ve bazen tehlikelidir.

```typescript
// KÖTÜ – Map/third-party koleksiyonu doğrudan API'de sunma
class ProductService {
  private products = new Map<string, Product>();

  getProducts(): Map<string, Product> {
    return this.products;  // ← dışarıya Map sızıyor
  }
}

// Çağıran Map'e her şeyi yapabilir:
const map = service.getProducts();
map.clear(); // ← yıkıcı! ProductService bunu bilmez

// İYİ – wrap et, güvenli arayüz sun
class ProductRepository {
  private products = new Map<string, Product>();

  findById(id: string): Product | undefined {
    return this.products.get(id);
  }

  findAll(): Product[] {
    return Array.from(this.products.values());
  }

  add(product: Product): void {
    this.products.set(product.id, product);
  }

  // Map.clear(), Map.set() gibi tehlikeli metotlar açık değil
}
```

---

## 3. Sınırları Keşfet: Learning Tests

Yeni bir kütüphane öğrenirken testlerle deney yap; üretim koduna geçmeden önce nasıl davrandığını belgele.

```typescript
// Axios davranışını learning test ile belgele
describe('Axios Learning Tests', () => {
  it('should parse JSON response automatically', async () => {
    // Bunu production koduna geçmeden önce doğrula
    const response = await axios.get('https://api.example.com/data');
    expect(typeof response.data).toBe('object');
  });

  it('should throw on 4xx status codes', async () => {
    await expect(
      axios.get('https://api.example.com/nonexistent')
    ).rejects.toThrow();
  });

  it('should include status code in error', async () => {
    try {
      await axios.get('https://api.example.com/nonexistent');
    } catch (e) {
      if (axios.isAxiosError(e)) {
        expect(e.response?.status).toBe(404);
      }
    }
  });
});
```

> Learning tests değerlidir: kütüphane güncellenince testler "sınır değişti" işareti verir.

---

## 4. Var Olmayan Kodu Kullanma (The Adapter Pattern)

Henüz yazılmamış ya da bilinmeyen bir API ile çalışırken adapterle soyutla.

```typescript
// Senaryo: API entegrasyonu henüz hazır değil, ama bunu kullanan kod yazılmalı

// 1. İstediğimiz arayüzü tanımla (bizim kontrolümüzde)
interface PaymentGateway {
  charge(amount: number, currency: string, token: string): Promise<PaymentResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}

// 2. Sahte (fake) implementasyon ile geliştirmeye devam et
class FakePaymentGateway implements PaymentGateway {
  async charge(amount: number): Promise<PaymentResult> {
    return { transactionId: 'fake-tx-123', success: true };
  }

  async refund(transactionId: string): Promise<RefundResult> {
    return { success: true };
  }
}

// 3. Gerçek implementasyon hazır olunca adapter yaz
class StripePaymentGateway implements PaymentGateway {
  constructor(private stripe: Stripe) {}

  async charge(amount: number, currency: string, token: string): Promise<PaymentResult> {
    const charge = await this.stripe.charges.create({
      amount: Math.round(amount * 100),
      currency,
      source: token,
    });
    return { transactionId: charge.id, success: charge.status === 'succeeded' };
  }

  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    const refund = await this.stripe.refunds.create({
      charge: transactionId,
      amount: Math.round(amount * 100),
    });
    return { success: refund.status === 'succeeded' };
  }
}
```

---

## 5. Temiz Sınır Pratiği

### HTTP Client Sarma

```typescript
// KÖTÜ – Axios'u doğrudan component/service içinde kullan
async function fetchProducts(): Promise<Product[]> {
  const response = await axios.get('/api/products', {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000,
  });
  return response.data;
}

// İYİ – HTTP client sınır arkasında
class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string, getToken: () => string) {
    this.client = axios.create({
      baseURL,
      timeout: 5000,
    });

    this.client.interceptors.request.use(config => {
      config.headers.Authorization = `Bearer ${getToken()}`;
      return config;
    });
  }

  async get<T>(path: string): Promise<T> {
    try {
      const { data } = await this.client.get<T>(path);
      return data;
    } catch (e) {
      throw new ApiError(`GET ${path} failed`, { cause: e });
    }
  }
}

// Service katmanı Axios'u bilmez
class ProductService {
  constructor(private api: ApiClient) {}

  getAll(): Promise<Product[]> {
    return this.api.get<Product[]>('/products');
  }
}
```

### Local Storage Sarma

```typescript
// KÖTÜ – localStorage doğrudan component içinde
function LoginForm() {
  const handleLogin = (token: string) => {
    localStorage.setItem('auth_token', token);   // 3. taraf API
    localStorage.setItem('auth_expiry', String(Date.now() + 3600000));
  };
}

// İYİ – sarılmış
class AuthStorage {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly EXPIRY_KEY = 'auth_expiry';

  saveToken(token: string, expiresInMs: number): void {
    localStorage.setItem(AuthStorage.TOKEN_KEY, token);
    localStorage.setItem(AuthStorage.EXPIRY_KEY, String(Date.now() + expiresInMs));
  }

  getToken(): string | null {
    const token = localStorage.getItem(AuthStorage.TOKEN_KEY);
    const expiry = Number(localStorage.getItem(AuthStorage.EXPIRY_KEY));
    if (!token || Date.now() > expiry) {
      this.clear();
      return null;
    }
    return token;
  }

  clear(): void {
    localStorage.removeItem(AuthStorage.TOKEN_KEY);
    localStorage.removeItem(AuthStorage.EXPIRY_KEY);
  }
}
```

---

## 6. Sınır Testleri

Sınır adapter'larını kolayca mock'layabilmek için arayüz arkasına al.

```typescript
// Test – FakeApiClient ile gerçek HTTP olmadan test
describe('ProductService', () => {
  it('should return all products', async () => {
    const fakeApi: ApiClient = {
      get: jest.fn().mockResolvedValue([
        { id: '1', name: 'Laptop', price: 1000 },
      ]),
    } as unknown as ApiClient;

    const service = new ProductService(fakeApi);
    const products = await service.getAll();

    expect(products).toHaveLength(1);
    expect(products[0].name).toBe('Laptop');
  });
});
```

---

## 7. Özet Kural Tablosu

| # | Kural |
|---|-------|
| 1 | 3. taraf koleksiyonları/nesneleri doğrudan döndürme, sar |
| 2 | Yeni kütüphane öğrenirken learning test yaz |
| 3 | Learning testler kütüphane güncellemesini takip eder |
| 4 | Bilinmeyen/hazır olmayan API'ler için kendi arayüzünü tanımla |
| 5 | Adapter ile gerçek implementasyondan yalıt |
| 6 | HTTP client, localStorage, 3. taraf SDK'larını sar |
| 7 | Sınır bileşenleri arayüz arkasında olmalı ki testlenebilsin |
| 8 | Kod sınırları mümkün olduğunca az yerde geçilmeli |
