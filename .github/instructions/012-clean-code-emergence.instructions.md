---
description: >
  Robert Martin – Clean Code, Chapter 12: Emergence.
  Kent Beck'in 4 sade tasarım kuralı: testler, DRY, ifade gücü ve minimal yapı.
applyTo: "**"
---

# Chapter 12 – Emergence

## 1. Temel Prensip

> "A design is 'simple' if it follows these rules: Runs all the tests, Contains no duplication, Expresses the intent of the programmer, Minimizes the number of classes and methods."

Kent Beck'in **4 Sade Tasarım Kuralı** sırasıyla uygulanır; önceliği yüksek kural düşük kuralın önüne geçer.

---

## 2. Kural 1 – Tüm Testleri Geçer

Test edilebilir tasarım, iyi tasarımla aynı anlama gelir. Testler yazılamıyorsa tasarım bozuktur.

```typescript
// KÖTÜ – test edilmesi neredeyse imkânsız (global state, doğrudan DOM erişimi)
function initializeApp(): void {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  document.getElementById('header')!.textContent = user.name;
  window.analytics.track('app_init', { userId: user.id });
}

// İYİ – her bağımlılık dışarıdan enjekte ediliyor (test edilebilir)
interface UserStore {
  getUser(): StoredUser | null;
}

interface Analytics {
  track(event: string, data: Record<string, unknown>): void;
}

function initializeApp(
  userStore: UserStore,
  analytics: Analytics,
  headerElement: HTMLElement,
): void {
  const user = userStore.getUser();
  if (user) {
    headerElement.textContent  = user.name;
    analytics.track('app_init', { userId: user.id });
  }
}

// Test
test('initializes app with user data', () => {
  const fakeStore     = { getUser: () => ({ id: '1', name: 'Alice' }) };
  const fakeAnalytics = { track: vi.fn() };
  const fakeHeader    = document.createElement('h1');

  initializeApp(fakeStore, fakeAnalytics, fakeHeader);

  expect(fakeHeader.textContent).toBe('Alice');
  expect(fakeAnalytics.track).toHaveBeenCalledWith('app_init', { userId: '1' });
});
```

---

## 3. Kural 2 – Yineleme Yok (DRY)

Her bilgi parçasının sistemde **tek ve yetkili bir temsili** olmalıdır.  
Yinelemenin farklı türleri:

### 3.1 Satır Yinelemesi (En Bariz)

```typescript
// KÖTÜ
function getProductDiscountedPrice(product: Product): number {
  if (product.discountRate > 0) {
    return product.price - (product.price * product.discountRate);
  }
  return product.price;
}

function getCartItemDiscountedPrice(item: CartItem): number {
  if (item.discountRate > 0) {
    return item.price - (item.price * item.discountRate);  // aynı hesap
  }
  return item.price;
}

// İYİ – tek bir yerde
function applyDiscount(price: number, discountRate: number): number {
  return price * (1 - discountRate);
}
```

### 3.2 Yapısal Yineleme

```typescript
// KÖTÜ – aynı veri dönüştürme her yerde tekrarlıyor
// Slice A
const priceDisplay = `$${(product.price / 100).toFixed(2)}`;

// Component B
const formattedPrice = `$${(item.price / 100).toFixed(2)}`;

// Util C
const displayAmount = `$${(order.total / 100).toFixed(2)}`;

// İYİ – tek kaynak
function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
```

### 3.3 Algoritma Yinelemesi

```typescript
// KÖTÜ – validation iki yerde yazılmış, kural değişince ikiside güncellenir
function validateProductForm(data: ProductFormData): string[] {
  const errors: string[] = [];
  if (!data.name || data.name.trim().length < 3)
    errors.push('Name must be at least 3 characters');
  if (data.price <= 0)
    errors.push('Price must be positive');
  return errors;
}

function validateProductApi(data: unknown): void {
  const d = data as ProductFormData;
  if (!d.name || d.name.trim().length < 3)
    throw new ValidationError('Name must be at least 3 characters');
  if (d.price <= 0)
    throw new ValidationError('Price must be positive');
}

// İYİ – validation logic tek yerde
function validateProduct(data: ProductFormData): ValidationResult {
  const errors: string[] = [];
  if (!data.name || data.name.trim().length < 3)
    errors.push('Name must be at least 3 characters');
  if (data.price <= 0)
    errors.push('Price must be positive');
  return { valid: errors.length === 0, errors };
}

// Her iki taraf da aynı fonksiyonu kullanır
```

---

## 4. Kural 3 – İfade Gücü (Expressiveness)

Kod, geleceğin okuyucusuna niyeti açıkça iletmelidir.

```typescript
// KÖTÜ – niyeti gizleyen kod
function proc(items: Item[], t: number): Item[] {
  return items.filter(i => i.s === 1 && i.p <= t && Date.now() - i.cd < 86400000);
}

// İYİ – açık isimler + extract method
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function filterAvailableItemsWithinBudget(
  items: Item[],
  maxPrice: number,
): Item[] {
  return items
    .filter(isInStock)
    .filter(item => isWithinBudget(item, maxPrice))
    .filter(isAddedToday);
}

function isInStock(item: Item): boolean {
  return item.status === ItemStatus.Active;
}

function isWithinBudget(item: Item, maxPrice: number): boolean {
  return item.price <= maxPrice;
}

function isAddedToday(item: Item): boolean {
  return Date.now() - item.createdAt < ONE_DAY_MS;
}
```

```typescript
// KÖTÜ – magic number ve anlaşılmaz koşullar
if (order.status === 3 && order.paymentStatus === 2) {
  sendShipmentNotification(order);
}

// İYİ – sabitler ve alan modeli niyeti açıklıyor
const isReadyToShip = (order: Order): boolean =>
  order.status === OrderStatus.Confirmed &&
  order.paymentStatus === PaymentStatus.Captured;

if (isReadyToShip(order)) {
  sendShipmentNotification(order);
}
```

---

## 5. Kural 4 – Minimal Sınıf ve Metot Sayısı

SRP ve DRY peşinde koşarken **aşırı granülasyondan** kaçın; her şeyin sınıf/interface olması gerekmez.

```typescript
// AŞIRI BÖLÜNME – gereksiz karmaşıklık
interface ProductNameValidator {
  validate(name: string): boolean;
}

interface ProductPriceValidator {
  validate(price: number): boolean;
}

interface ProductStockValidator {
  validate(stock: number): boolean;
}

class ProductNameValidatorImpl implements ProductNameValidator { ... }
class ProductPriceValidatorImpl implements ProductPriceValidator { ... }
class ProductStockValidatorImpl implements ProductStockValidator { ... }

class ProductValidatorComposite {
  constructor(
    private nameValidator: ProductNameValidator,
    private priceValidator: ProductPriceValidator,
    private stockValidator: ProductStockValidator,
  ) {}
}

// DENGELI – tek sınıf, yeterince küçük ve odaklı
class ProductValidator {
  validate(product: ProductInput): ValidationResult {
    const errors: string[] = [];
    if (!product.name || product.name.trim().length < 3)
      errors.push('Name too short');
    if (product.price <= 0)
      errors.push('Price must be positive');
    if (product.stock < 0)
      errors.push('Stock cannot be negative');
    return { valid: errors.length === 0, errors };
  }
}
```

---

## 6. Yeniden Düzenleme (Emergent Refactoring)

Testler yeşil olduktan sonra her adımda tasarımı iyileştir.

```typescript
// Adım 1 – Çalışan ama ham kod
function processOrder(order: Order): OrderResult {
  if (!order.items || order.items.length === 0)
    throw new Error('Order has no items');
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.quantity;
  }
  if (order.couponCode) {
    const coupon = coupons.find(c => c.code === order.couponCode);
    if (coupon && coupon.expiresAt > Date.now()) {
      total = total - total * coupon.discountRate;
    }
  }
  const tax = total * 0.18;
  return { subtotal: total, tax, grandTotal: total + tax };
}

// Adım 2 – Testler yazıldıktan sonra refactor
function processOrder(order: Order): OrderResult {
  assertOrderHasItems(order);
  const subtotal   = calculateSubtotal(order.items);
  const discounted = applyCoupon(subtotal, order.couponCode);
  const tax        = calculateTax(discounted);
  return buildResult(discounted, tax);
}

function assertOrderHasItems(order: Order): void {
  if (!order.items?.length) throw new EmptyOrderError();
}

function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function applyCoupon(amount: number, couponCode?: string): number {
  if (!couponCode) return amount;
  const coupon = findActiveCoupon(couponCode);
  return coupon ? amount * (1 - coupon.discountRate) : amount;
}

function calculateTax(amount: number): number {
  return amount * TAX_RATE;
}

function buildResult(subtotal: number, tax: number): OrderResult {
  return { subtotal, tax, grandTotal: subtotal + tax };
}
```

---

## 7. Özet Kural Tablosu

| # | Kent Beck Kuralı | Uygulama Prensibi |
|---|-----------------|-------------------|
| 1 | Tüm testleri geçer | Test edilebilirlik = iyi tasarım |
| 2 | Yineleme yok | Her bilginin tek yetkili kaynağı (DRY) |
| 3 | İfade gücü | İsimler + küçük fonksiyonlar + sabitler |
| 4 | Minimal yapı | Gereksiz sınıf/interface/metot ekleme |
| — | Emergent refactoring | Önce yeşil testler, sonra temiz tasarım |
