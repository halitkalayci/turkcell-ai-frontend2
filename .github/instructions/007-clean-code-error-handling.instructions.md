---
description: >
  Robert Martin – Clean Code, Chapter 7: Error Handling.
  Hata yönetiminin temiz kod prensiplerine uygun yapılmasını açıklar.
applyTo: "**"
---

# Chapter 7 – Error Handling

## 1. Temel Prensip

> "Error handling is important, but if it obscures logic, it's wrong."

Hata yönetimi, ana iş mantığını gizlememelidir. Hata yönetimi ile iş mantığını bağımsız düşünülebilir hale getir.

---

## 2. Error Code Yerine Exception Kullan

Hata kodları, kontrolü çağırana bırakır ve unutulabilir.

```typescript
// KÖTÜ – hata kodu döner, her çağrı noktasında kontrol şart
function sendShutdown(handle: DeviceHandle): DEVICE_STATUS {
  if (handle === INVALID_HANDLE) return INVALID_HANDLE_STATUS;
  if (getDeviceRecord(handle).status === SUSPENDED) return SUSPENDED_STATUS;
  pauseDevice(handle);
  return OK;
}

// Çağıran her seferinde kontrol etmek zorunda
const status = sendShutdown(handle);
if (status === INVALID_HANDLE_STATUS) { /* ... */ }
if (status === SUSPENDED_STATUS) { /* ... */ }

// İYİ – exception fırlat
function sendShutdown(handle: DeviceHandle): void {
  if (handle === INVALID_HANDLE) throw new InvalidHandleError();
  if (getDeviceRecord(handle).status === SUSPENDED) throw new DeviceSuspendedError();
  pauseDevice(handle);
}

// Çağıran istediği yerde yakalar; ana akış temiz
try {
  sendShutdown(handle);
} catch (e) {
  logShutdownError(e);
}
```

---

## 3. Try-Catch ile Scope Tanımla

`try-catch` bloğu bir işlem sınırı çizer. `try` içini mümkün olduğunca küçük tut.

```typescript
// İYİ – try içinde sadece fırlatabilecek işlem
function loadProducts(): Product[] {
  try {
    return productRepository.findAll();
  } catch (e) {
    throw new DataAccessError('Products could not be loaded', { cause: e });
  }
}
```

### Try-Catch Fonksiyonu Ayrı Olmalı

```typescript
// KÖTÜ – iş mantığı ile hata yakalama iç içe
function deleteProduct(id: string): void {
  try {
    const product = repository.findById(id);
    if (!product) throw new Error('Not found');
    repository.delete(id);
    cache.invalidate(id);
    eventBus.emit('product.deleted', { id });
  } catch (e) {
    logger.error('Delete failed', e);
    notifyAdmin(e);
  }
}

// İYİ – iş mantığı ayrı, hata yakalama ayrı
function deleteProduct(id: string): void {
  try {
    performDeletion(id);
  } catch (e) {
    handleDeletionError(id, e);
  }
}

function performDeletion(id: string): void {
  const product = repository.findById(id);
  if (!product) throw new ProductNotFoundError(id);
  repository.delete(id);
  cache.invalidate(id);
  eventBus.emit('product.deleted', { id });
}

function handleDeletionError(id: string, error: unknown): void {
  logger.error(`Delete failed for product ${id}`, error);
  notifyAdmin(error);
}
```

---

## 4. Unchecked Exception Kullan

TypeScript'te checked exception yoktur; custom error sınıfları yarat.

```typescript
// Custom Error Hiyerarşisi
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" not found`, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message, 'VALIDATION_ERROR');
  }
}

class DataAccessError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 'DATA_ACCESS_ERROR', options);
  }
}
```

```typescript
// Kullanım
function findProduct(id: string): Product {
  const product = repository.findById(id);
  if (!product) throw new NotFoundError('Product', id);
  return product;
}
```

---

## 5. Exception ile Bağlamı Zenginleştir

Exception mesajına hata ayıklamasına yardımcı bilgiler ekle.

```typescript
// KÖTÜ – bağlam yok
throw new Error('Failed');

// İYİ – hata nerede, ne sırasında, hangi veriyle oluştu
throw new DataAccessError(
  `Failed to fetch products for category "${categoryId}" at page ${page}`,
  { cause: originalError }
);
```

---

## 6. Caller'ı Exception Sınıfına Göre Sarma (Wrapping)

Üçüncü taraf kütüphanelerin exception'larını kendi türlerine sar.

```typescript
// KÖTÜ – her çağrı yerinde farklı 3. taraf exception yakalanıyor
function fetchUser(id: string): User {
  try {
    return httpClient.get(`/users/${id}`);
  } catch (e) {
    if (e instanceof AxiosError) { /* ... */ }
    if (e instanceof NetworkError) { /* ... */ }
  }
}

// İYİ – bir kez sar, her yerde aynı türü yakala
class UserApiClient {
  async getUser(id: string): Promise<User> {
    try {
      const response = await this.httpClient.get(`/users/${id}`);
      return response.data;
    } catch (e) {
      throw new DataAccessError(`Could not fetch user ${id}`, { cause: e });
    }
  }
}

// Çağıran yalnızca DataAccessError'u bilir
async function loadUserProfile(id: string): Promise<UserProfile> {
  try {
    const user = await userApiClient.getUser(id);
    return mapToProfile(user);
  } catch (e) {
    if (e instanceof DataAccessError) {
      return DEFAULT_PROFILE;
    }
    throw e;
  }
}
```

---

## 7. Normal Akış Tasarımı (Special Case Pattern)

Bazen exception yerine özel durum nesnesi döndürmek kodun akışını temizler.

```typescript
// KÖTÜ – null kontrolü her yerde
function getCartTotal(userId: string): number {
  const cart = cartRepository.findByUser(userId);
  if (!cart) return 0;                 // ← null guard
  if (cart.items.length === 0) return 0; // ← başka guard
  return cart.items.reduce((sum, item) => sum + item.price, 0);
}

// İYİ – Special Case (Null Object) Pattern
class EmptyCart implements Cart {
  readonly items: CartItem[] = [];
  get total(): number { return 0; }
}

function getCart(userId: string): Cart {
  return cartRepository.findByUser(userId) ?? new EmptyCart();
}

function getCartTotal(userId: string): number {
  return getCart(userId).total;  // null kontrolü yok, daha temiz
}
```

---

## 8. Null Döndürme – Geçirme

### Null Döndürme

```typescript
// KÖTÜ – null dönüyor → her çağıran null kontrolü yapmak zorunda
function findProduct(id: string): Product | null {
  return products.find(p => p.id === id) ?? null;
}

// İYİ #1 – exception fırlat
function findProduct(id: string): Product {
  const product = products.find(p => p.id === id);
  if (!product) throw new NotFoundError('Product', id);
  return product;
}

// İYİ #2 – Special case / default value
function findProduct(id: string): Product {
  return products.find(p => p.id === id) ?? PLACEHOLDER_PRODUCT;
}

// İYİ #3 – Optional/Maybe pattern
function findProduct(id: string): Product | undefined {
  return products.find(p => p.id === id);
}
// üst katta tek noktada kontrol edilir
```

### Null Geçirme

Fonksiyonlara `null` veya `undefined` parametre verme.

```typescript
// KÖTÜ
function calculatePrice(product: Product | null, discount: number | null): number {
  if (!product) throw new Error('...');
  if (!discount) discount = 0;
  // ...
}

calculatePrice(null, null); // ← çağırma noktası temiz değil

// İYİ – parametreler zorunlu, varsayılan değer için overload veya default
function calculatePrice(product: Product, discountRate: number = 0): number {
  return product.price * (1 - discountRate);
}
```

---

## 9. React / Redux Bağlamı

```typescript
// Redux Thunk'ta hata yönetimi
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      return await productService.getByCategory(categoryId);
    } catch (e) {
      const message = e instanceof AppError ? e.message : 'Unknown error';
      return rejectWithValue(message);
    }
  }
);

// Component'te hata sınırı (ErrorBoundary)
// class ErrorBoundary extends React.Component → hataları yakala, fallback göster
```

---

## 10. Özet Kural Tablosu

| # | Kural |
|---|-------|
| 1 | Hata kodu döndürme; exception fırlat |
| 2 | try-catch içine sadece exception üretecek kodu koy |
| 3 | try bloğunu ayrı fonksiyon olarak yaz |
| 4 | Exception'a bağlamsal bilgi ekle (ne, nerede, hangi veri) |
| 5 | 3. taraf exception'larını kendi türlerine sar |
| 6 | Normal akış için Special Case (Null Object) kullan |
| 7 | Fonksiyondan null döndürme; exception veya special case tercih et |
| 8 | Fonksiyona null/undefined parametre geçirme |
| 9 | Hata hiyerarşisi oluştur: AppError → spesifik hatalar |
