---
description: >
  Robert Martin – Clean Code, Chapter 17 (Part B): Smells and Heuristics.
  Genel (G21-G36), İsimler (N1-N7) ve Testler (T1-T9) kötü kod kokuları.
applyTo: "**"
---

# Chapter 17B – Smells and Heuristics (Part 2 / 2)

> "We want the code to be expressive, to communicate intent. And we want to avoid the smells that obscure intent."

Bu dosya `017a` devamıdır: **G21–G36**, **N1–N7** ve **T1–T9** kategorilerini kapsar.

---

## G – Genel (Continued) G21–G36

### G21 – Algoritmaları Anla

```typescript
// KÖTÜ – deneme-yanılma ile yazılmış; neden çalıştığı bilinmiyor
function isPalindrome(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== s[s.length - 1]) return false;  // YANLIŞ! sayaç yok
  }
  return true;
}

// İYİ – algoritma anlaşıldı, sonra yazıldı
function isPalindrome(s: string): boolean {
  const normalized = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left  = 0;
  let right = normalized.length - 1;
  while (left < right) {
    if (normalized[left] !== normalized[right]) return false;
    left++;
    right--;
  }
  return true;
}
```

### G22 – Mantıksal Bağımlılıkları Fiziksel Yap

```typescript
// KÖTÜ – caller, callee'nin iç detayına bağımlı (gizli bağımlılık)
function getHoursPerWeek(): number {
  return 7;     // çağıran biliyor ki bu 7 gün × 1 saat/gün; magic!
}

// İYİ – sabit açıkça hesaplanıyor; bağımlılık fiziksel
const DAYS_PER_WEEK  = 7;
const HOURS_PER_DAY  = 24;

function getHoursPerWeek(): number {
  return DAYS_PER_WEEK * HOURS_PER_DAY;
}
```

### G23 – İf/Else Yerine Polimorfizm Tercih Et

```typescript
// KÖTÜ – tip kontrolü ile if/else zinciri
function applyShipping(order: Order): number {
  if (order.shippingType === 'express') return order.total * 0.10;
  if (order.shippingType === 'same-day') return order.total * 0.20;
  return 0;  // standard free
}

// İYİ – polimorfizm
interface ShippingStrategy {
  calculateCost(order: Order): number;
}

class StandardShipping  implements ShippingStrategy { calculateCost() { return 0; } }
class ExpressShipping   implements ShippingStrategy { calculateCost(o) { return o.total * 0.10; } }
class SameDayShipping   implements ShippingStrategy { calculateCost(o) { return o.total * 0.20; } }

// Kayıt + fabrika
const SHIPPING_STRATEGIES: Record<string, ShippingStrategy> = {
  standard: new StandardShipping(),
  express:  new ExpressShipping(),
  'same-day': new SameDayShipping(),
};

function applyShipping(order: Order): number {
  return (SHIPPING_STRATEGIES[order.shippingType] ?? SHIPPING_STRATEGIES.standard)
    .calculateCost(order);
}
```

### G24 – Koşulları Kapsülle

```typescript
// KÖTÜ – karmaşık boolean ifade ham halde
if (
  user.isVerified &&
  !user.isBanned &&
  user.role === 'admin' &&
  (Date.now() - user.lastLogin) < 30 * 24 * 3600 * 1000
) {
  grantAccess(user);
}

// İYİ – niyeti açıklayan kapsüllenmiş predicate
function isActiveAdmin(user: User): boolean {
  const thirtyDaysMs = 30 * 24 * 3600 * 1000;
  return (
    user.isVerified &&
    !user.isBanned &&
    user.role === 'admin' &&
    (Date.now() - user.lastLogin) < thirtyDaysMs
  );
}

if (isActiveAdmin(user)) { grantAccess(user); }
```

### G25 – Negatif Koşullardan Kaçın

```typescript
// KÖTÜ
if (!isNotEmpty(items)) { showEmptyState(); }

// İYİ
if (isEmpty(items)) { showEmptyState(); }
```

### G26 – Fonksiyonların Tek Bir İşi Olsun

```typescript
// KÖTÜ – hem doğruluyor hem kaydediyor hem bildirim gönderiyor
async function submitOrder(cart: Cart): Promise<void> {
  if (!cart.items.length) throw new Error('Cart is empty');
  const order = await orderRepo.save(cart);
  await notificationService.send(order.userId, 'Order placed');
  analytics.track('order_placed', { orderId: order.id });
}

// İYİ – her adım ayrı, orchestrator compose ediyor
async function validateCart(cart: Cart): Promise<void> {
  if (!cart.items.length) throw new Error('Cart is empty');
}

async function persistOrder(cart: Cart): Promise<Order> {
  return orderRepo.save(cart);
}

async function notifyUser(order: Order): Promise<void> {
  await notificationService.send(order.userId, 'Order placed');
}

async function submitOrder(cart: Cart): Promise<void> {
  await validateCart(cart);
  const order = await persistOrder(cart);
  await notifyUser(order);
  analytics.track('order_placed', { orderId: order.id });
}
```

### G27 – Koşulların Yerine Açıklayıcı Fonksiyon

```typescript
// KÖTÜ
if (employee.flags & HOURLY_FLAG && employee.age > 65) { /* ... */ }

// İYİ
function isEligibleForRetirementBonus(employee: Employee): boolean {
  return isHourlyEmployee(employee) && isOverRetirementAge(employee);
}

if (isEligibleForRetirementBonus(employee)) { /* ... */ }
```

### G28 – Kapsüle Koşulları Değişkene At

```typescript
// KÖTÜ – inline koşul anlaşılmıyor
const result = users
  .filter(u => u.active && !u.suspended && u.verifiedAt !== null)
  .map(u => u.email);

// İYİ
const eligibleUsers = users.filter(u =>
  u.active && !u.suspended && u.verifiedAt !== null
);
const emails = eligibleUsers.map(u => u.email);
```

### G29 – Switch/Case Minimize Et

Bakınız G23 – her switch/case polimorfizm adayıdır.

### G30 – Enum'ları Kullan (Sihirli Sayı Yok)

```typescript
// KÖTÜ
if (order.status === 3) { shipOrder(order); }

// İYİ
enum OrderStatus { Pending = 1, Confirmed, ReadyToShip, Shipped, Delivered }

if (order.status === OrderStatus.ReadyToShip) { shipOrder(order); }
```

### G31 – Türe Kodlamadan Kaçın

```typescript
// KÖTÜ – tür ismini değikene kodladık
const productManager = new ProductManager();
const productList    = [product1, product2];

// İYİ – isim kullanım niyetini söyler
const manager  = new ProductManager();
const featured = [product1, product2];
```

### G32 – Kalıtım Yerine Kompozisyon Tercih Et

```typescript
// KÖTÜ – sadece log yeteneği için extends
class LoggableProductService extends ProductService {
  override findById(id: string) {
    console.log(`findById: ${id}`);
    return super.findById(id);
  }
}

// İYİ – kompozisyon; ProductService değişmeden kalır
function withLogging<T extends object>(service: T): T {
  return new Proxy(service, {
    get(target, prop) {
      const orig = (target as any)[prop];
      if (typeof orig !== 'function') return orig;
      return (...args: unknown[]) => {
        console.log(`${String(prop)}(${JSON.stringify(args)})`);
        return orig.apply(target, args);
      };
    },
  });
}

const productService = withLogging(new ProductService());
```

### G33 – Hata Kodları Yerine Exception

```typescript
// KÖTÜ – çağıran, dönüş değeri -1'i bilmek zorunda
function divide(a: number, b: number): number {
  if (b === 0) return -1;
  return a / b;
}

// İYİ
function divide(a: number, b: number): number {
  if (b === 0) throw new RangeError('Division by zero');
  return a / b;
}
```

### G34 – Soyutlama Seviyesi ile Tutarlı Ol

```typescript
// KÖTÜ – OrderController hem üst hem alt seviye
class OrderController {
  async placeOrder(req: Request) {
    const dto = req.body as CreateOrderDto;
    // Doğrudan SQL – çok düşük seviye
    await db.query('INSERT INTO orders (user_id) VALUES ($1)', [dto.userId]);
  }
}

// İYİ – her katman kendi seviyesinde
class OrderController {
  constructor(private readonly orderService: OrderService) {}

  async placeOrder(req: Request) {
    const dto = req.body as CreateOrderDto;
    await this.orderService.create(dto);
  }
}
```

### G35 – Önemsiz Boyut Ölçütü

Kısa != temiz. Her sınıf, fonksiyon amacını eksiksiz yansıtmalı; yapay kısaltmadan sakın.

### G36 – Kapsamı Açık Tut

```typescript
// KÖTÜ – i loop değişkeni dışarıya sızıyor
for (var i = 0; i < products.length; i++) { /* ... */ }
console.log(i); // var → geçerli, ama kapsam hatalı

// İYİ – let ile blok kapsamı
for (let i = 0; i < products.length; i++) { /* ... */ }
// console.log(i); → ReferenceError, doğru davranış
```

---

## N – İsimler (Names)

### N1 – Açıklayıcı İsimler Kullan

```typescript
// KÖTÜ
const d = new Date();
const t = calcTot(items);

// İYİ
const orderDate  = new Date();
const totalPrice = calculateTotalPrice(items);
```

### N2 – İsimleri Uygun Soyutlama Seviyesinde Kullan

```typescript
// KÖTÜ – implementasyon detayı isimde
interface IArrayProductList { getArray(): Product[]; }

// İYİ – soyutlama: ne sakladığı değil ne verdiği
interface ProductRepository { findAll(): Product[]; }
```

### N3 – Standart İsimlendirme Kullan (Sözlük)

| Eylem | Önek | Örnek |
|-------|------|-------|
| Sorgulama | `get` / `find` | `getProduct`, `findByCategory` |
| Boolean | `is` / `has` / `can` | `isAvailable`, `hasStock` |
| Dönüşüm | `to` / `from` | `toCurrencyString`, `fromDto` |
| Fabrika | `create` / `build` | `createOrder`, `buildQuery` |
| Olay | `on` / `handle` | `onSubmit`, `handleClick` |

### N4 – Belirsiz İsimleri Elle Yakalamak Zordur

```typescript
// KÖTÜ – list, data, info aşırı genel
function processData(data: any): any { /* ... */ }

// İYİ – tam ne işlendiği belli
function applyDiscountToCartItems(items: CartItem[]): CartItem[] { /* ... */ }
```

### N5 – Büyük Kapsamlar için Uzun İsimler

```typescript
// Global yardımcı – kısa isim çakışmaya neden olur
const u = getUser(); // KÖTÜ – modül düzeyi

// İYİ – kapsamla orantılı uzunluk
const currentAuthenticatedUser = getUser(); // global/modül
```

### N6 – Encoder Kullanma (Hungarian Notation)

```typescript
// KÖTÜ
const strName:   string  = 'Shirt';
const bInStock:  boolean = true;
const nQuantity: number  = 5;

// İYİ – TypeScript zaten tipi takip ediyor
const name:     string  = 'Shirt';
const inStock:  boolean = true;
const quantity: number  = 5;
```

### N7 – İsimler Yan Etkileri Açıklasın

```typescript
// KÖTÜ – isim saf gibi görünüyor ama state değiştiriyor
function getSession(): Session {
  if (!this.session) this.session = new Session();  // yan etki gizli!
  return this.session;
}

// İYİ – yan etki isme yansımış
function getOrCreateSession(): Session {
  if (!this.session) this.session = new Session();
  return this.session;
}
```

---

## T – Testler (Tests)

### T1 – Yetersiz Test

```typescript
// KÖTÜ – sadece mutlu yol test edilmiş
describe('divide', () => {
  it('divides two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });
});

// İYİ – sınır koşulları, hatalar ve edge case'ler dahil
describe('divide', () => {
  it('divides two positive numbers',  () => expect(divide(10, 2)).toBe(5));
  it('divides by negative',           () => expect(divide(10, -2)).toBe(-5));
  it('divides to produce decimal',    () => expect(divide(10, 3)).toBeCloseTo(3.333));
  it('throws on division by zero',    () => expect(() => divide(10, 0)).toThrow(RangeError));
  it('handles dividend of zero',      () => expect(divide(0, 5)).toBe(0));
});
```

### T2 – Kapsam Aracı Kullan

Vitest ve Istanbul entegrasyonu:

```json
// vite.config.ts içinde
{
  "test": {
    "coverage": {
      "provider": "istanbul",
      "reporter": ["text", "lcov"],
      "thresholds": { "lines": 80, "functions": 80, "branches": 70 }
    }
  }
}
```

### T3 – Önemsiz Testleri Atlama

```typescript
// KÖTÜ – .skip ile kalıcı olarak es geçilmiş
describe.skip('calculateDiscount', () => { /* ... */ });

// İYİ – ya düzelt ya sil; .skip sadece geçici
it.todo('handles negative discount amounts');
```

### T4 – Devre Dışı Bırakılmış Testten Kaçın

Bakılacak kalıplar: `it.skip`, `xit`, `xdescribe` → geçici ise bilet aç, kalıcı ise sil.

### T5 – Sınır Koşullarını Test Et

```typescript
// Sınır test kalıpları
it('returns empty array for empty input',   () => expect(fn([])).toEqual([]));
it('handles single item',                   () => expect(fn([item])).toHaveLength(1));
it('handles maximum allowed items',         () => expect(fn(maxItems)).toBeDefined());
it('throws on overflow',                    () => expect(() => fn(overMaxItems)).toThrow());
```

### T6 – Hataları Bulucu Testler (Bug Tests)

```typescript
// Bir hata bulununca → ÖNCE test, SONRA düzeltme
it('REGRESSION: should not apply double discount on sale items (#BUGID-42)', () => {
  const saleItem  = { price: 100, onSale: true };
  const discounted = applyDiscount(saleItem, 0.10);
  expect(discounted.price).toBe(90);   // önceden 81 dönüyordu (çift uygulama hatalı)
});
```

### T7 – Başarısızlık Kalıplarını İncele

Testler gruplanmış başarısızlık gösteriyorsa ortaklaşa neden ara:

```
✗ ProductCard renders name       → snapshot güncellenmemiş
✗ ProductCard renders price      → snapshot güncellenmemiş
✓ ProductCard handles null       → props sorunu değil
```

→ snapshotları güncelle, diğer testlere dokunma.

### T8 – Kapsam Kalıplarını İncele

Dal kapsamı düşükse:

```typescript
// 0% kapsanan dal → test yaz
function getStockLabel(qty: number): string {
  if (qty === 0)   return 'Out of stock';   // ← test edilmemiş
  if (qty < 10)    return 'Low stock';      // ← test edilmemiş
  return 'In stock';                        // ← sadece bu test edilmiş
}
```

### T9 – Testler Hızlı Olmalı

```typescript
// KÖTÜ – gerçek zamanlayıcı bekliyor
it('hides notification after 3 seconds', async () => {
  showNotification('Saved');
  await new Promise(r => setTimeout(r, 3000));  // 3sn bekleme!
  expect(isVisible()).toBe(false);
});

// İYİ – sahte zamanlayıcı
it('hides notification after 3 seconds', () => {
  vi.useFakeTimers();
  showNotification('Saved');
  vi.advanceTimersByTime(3000);
  expect(isVisible()).toBe(false);
  vi.useRealTimers();
});
```

---

## Özet Kural Tablosu (B Kısmı)

| Kod | Kategori | Kural Özeti |
|-----|----------|-------------|
| G21 | General  | Algoritmaları tam anla, tahminle değil |
| G23 | General  | Switch/if-else zinciri → polimorfizm |
| G24 | General  | Karmaşık koşulları fonksiyona kapsülle |
| G26 | General  | Her fonksiyon tek iş |
| G30 | General  | Magic sayı → enum / sabit |
| G32 | General  | Kalıtım yerine kompozisyon tercih et |
| G33 | General  | Hata kodu yerine exception fırlat |
| N1  | Names    | Açıklayıcı, niyeti belli isimler |
| N3  | Names    | `get/find/is/has/to/create/on` sözlüğüne uy |
| N6  | Names    | Hungarian notation kullanma |
| N7  | Names    | Yan etkiler isimde açıkça belirsin |
| T1  | Tests    | Mutlu yol + sınır + hata yollarını test et |
| T2  | Tests    | Kapsam aracı kullan, eşik belirle |
| T5  | Tests    | Boundary conditions her zaman test et |
| T6  | Tests    | Her hata bulunduğunda regresyon testi yaz |
| T9  | Tests    | Testler hızlı olmalı – sahte zamanlayıcı kullan |

---

## Kütüphane Tamamlama Notu

Bu dosya (`017b`) ile birlikte **Robert Martin – Clean Code** kitabının 17 bölümünün tamamı `.instructions.md` formatına çevrilmiştir. Dosya tablosu:

| Dosya | Konu |
|-------|------|
| 001 | Clean Code – Temiz Kod Nedir |
| 002 | Meaningful Names |
| 003 | Functions |
| 004 | Comments |
| 005 | Formatting |
| 006 | Objects & Data Structures |
| 007 | Error Handling |
| 008 | Boundaries |
| 009 | Unit Tests |
| 010 | Classes |
| 011 | Systems |
| 012 | Emergence |
| 013 | Concurrency |
| 014 | Successive Refinement |
| 015 | JUnit Internals |
| 016 | Refactoring SerialDate |
| 017a | Smells & Heuristics (C/E/F/G1-G20) |
| 017b | Smells & Heuristics (G21-G36/N/T) |
