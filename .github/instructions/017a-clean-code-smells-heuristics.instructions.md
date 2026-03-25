---
description: >
  Robert Martin – Clean Code, Chapter 17 (Part A): Smells and Heuristics.
  Yorumlar (C1-C5), Ortam (E1-E4), Fonksiyonlar (F1-F4) ve Genel (G1-G20) kötü kod kokuları.
applyTo: "**"
---

# Chapter 17A – Smells and Heuristics (Part 1 / 2)

> "A long list of code smells, combined with a series of heuristics that will help you identify and eliminate them."

Bu dosya kod kokularının **C, E, F** ve **G (G1–G20)** kategorilerini kapsar. G21–G36, N ve T kategorileri için `017b` dosyasına bakın.

---

## C – Yorumlar (Comments)

### C1 – Uygunsuz Bilgi

```typescript
// KÖTÜ – kaynak kontrolü, ticket numarası gibi meta veri yorum olarak kalıyor
/**
 * TODO: JIRA-1234 – Discount logic refactored by @mehmet 2023-03-15
 * Old: flat 10%. New: tiered.
 */
function calculateDiscount(price: number): number { /* ... */ }

// İYİ – bu bilgi JIRA/GitHub'da, kodda değil; yorum sadece neden'i açıklar
function calculateDiscount(price: number): number {
  // Tiered discount: >100 → 15%, >50 → 10%, otherwise 5%
  if (price > 100) return price * 0.85;
  if (price > 50)  return price * 0.90;
  return price * 0.95;
}
```

### C2 – Eski Yorum

```typescript
// KÖTÜ – kod değişmiş, yorum eskimiş; yanlış yönlendirir
/**
 * Returns product price without VAT.     ← yanlış; şimdi KDV dahil dönüyor
 */
function getProductPrice(product: Product): number {
  return product.basePrice * 1.20;  // KDV dahil
}

// İYİ – ya yorum güncelle ya da sil
function getProductPrice(product: Product): number {
  return product.basePrice * 1.20;  // includes 20% VAT
}
```

### C3 – Yedekli Yorum

```typescript
// KÖTÜ – kod kendini açıklıyor; yorum gürültü
/** Returns the product name. */
function getProductName(): string {
  return this.name;
}

// İYİ – yorum yok; isim yeterince açık
function getProductName(): string {
  return this.name;
}
```

### C4 – Kötü Yazılmış Yorum

```typescript
// KÖTÜ – dilbilgisi hataları, anlamsız kısaltmalar
// calc ttl prc w/ dsc if applic
function calcTtlPrc(prc: number, dsc: number): number { return prc - dsc; }

// İYİ – tam cümleler, açık niyet
// Calculates the final price after applying the discount amount.
function calculateTotalPrice(price: number, discount: number): number {
  return price - discount;
}
```

### C5 – Yorum Satırına Alınmış Kod

```typescript
// KÖTÜ – eski kod yorum olarak bırakılmış
function processOrder(order: Order) {
  // const fee = order.total * 0.05;  ← eski flat fee
  // applyFlatFee(order, fee);
  applyTieredFee(order);
}

// İYİ – silindi; git history gerekirse geri getirir
function processOrder(order: Order) {
  applyTieredFee(order);
}
```

---

## E – Ortam (Environment)

### E1 – Tek Komutla Build

```bash
# KÖTÜ – onlarca adım
npm install
cp .env.example .env
npm run codegen
npm run db:migrate
npm run build

# İYİ – tek komut
npm run setup   # package.json'da tüm adımları sıralı çalıştırır
```

### E2 – Tek Komutla Test

```json
// package.json
{
  "scripts": {
    "test":     "vitest run",
    "test:ci":  "vitest run --reporter=verbose --coverage"
  }
}
```

### E3 – Ortam Bağımlılığı Yok

```typescript
// KÖTÜ – test, gerçek API'ye HTTP istek atıyor
it('fetches products', async () => {
  const products = await fetch('https://api.example.com/products').then(r => r.json());
  expect(products).toHaveLength(10);
});

// İYİ – mock ile izole
it('fetches products', async () => {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    json: () => Promise.resolve(MOCK_PRODUCTS),
  } as Response);
  const products = await productService.getAll();
  expect(products).toHaveLength(MOCK_PRODUCTS.length);
});
```

### E4 – IDE Araçları Kaldırılabilir

Projeye commit edilen IDE-özel config dosyaları (`.idea/`, `.vscode/settings.json` gibi) `.gitignore` ile dışarıda tutulmalı; paylaşılacaksa `*.recommended.json` olarak ayrılmalı.

---

## F – Fonksiyonlar (Functions)

### F1 – Çok Fazla Argüman

```typescript
// KÖTÜ – 5 argüman; sıra hatası çok kolay
function createProduct(
  name: string, price: number, stock: number,
  category: string, discount: number
): Product { /* ... */ }

createProduct('Shirt', 99, 50, 'clothing', 10);  // hangi argüman ne?

// İYİ – nesne argümanı
interface CreateProductInput {
  name: string;
  price: number;
  stock: number;
  category: string;
  discount?: number;
}

function createProduct(input: CreateProductInput): Product { /* ... */ }

createProduct({ name: 'Shirt', price: 99, stock: 50, category: 'clothing' });
```

### F2 – Çıktı Argümanı

```typescript
// KÖTÜ – argüman mutasyona uğruyor (çıktı argümanı)
function appendDiscount(cart: Cart, discount: number): void {
  cart.items.forEach(item => { item.price -= discount / cart.items.length; });
}

// İYİ – dönüş değeri kullan; orijinal dokunulmaz
function withDiscount(cart: Cart, discount: number): Cart {
  const share = discount / cart.items.length;
  return {
    ...cart,
    items: cart.items.map(item => ({ ...item, price: item.price - share })),
  };
}
```

### F3 – Flag Argümanı

```typescript
// KÖTÜ – boolean flag iki farklı davranışı tek fonksiyonda gizliyor
function renderProduct(product: Product, detailed: boolean): JSX.Element {
  if (detailed) return <ProductDetailCard product={product} />;
  return <ProductCard product={product} />;
}

// İYİ – iki ayrı bileşen
function ProductSummary({ product }: { product: Product }) { /* ... */ }
function ProductDetail({ product }: { product: Product }) { /* ... */ }
```

### F4 – Ölü Fonksiyon

```typescript
// KÖTÜ – hiç çağrılmayan fonksiyonlar birikmiş
function legacyPriceCalc(price: number): number { return price * 1.12; }    // kullanılmıyor
function formatPriceOld(price: number): string   { return `TL ${price}`; } // kullanılmıyor

// İYİ – silindi; gerekirse git'ten alınır
```

---

## G – Genel (General) G1–G20

### G1 – Birden Fazla Dil Aynı Dosyada

```typescript
// KÖTÜ – TS içinde SQL string, temizlenemez, test edilemez
function getOrders() {
  return db.query(`
    SELECT * FROM orders WHERE status = 'pending'
    AND created_at > NOW() - INTERVAL '7 days'
  `);
}

// İYİ – SQL ayrı katmanda; TS sadece çağırıyor
// src/repositories/orderRepository.sql.ts
export const PENDING_ORDERS_QUERY = `
  SELECT * FROM orders
  WHERE status = 'pending'
    AND created_at > NOW() - INTERVAL '7 days'
`;

function getOrders() {
  return db.query(PENDING_ORDERS_QUERY);
}
```

### G2 – Açıkça Belirtilmemiş Davranış

```typescript
// KÖTÜ – edge case ne yapacak belli değil; çağıran tahmin etmek zorunda
function getProductById(id: string): Product | undefined { /* ... */ }

// İYİ – her yol belgelenmiş ve test edilmiş
/**
 * Returns the product with the given ID.
 * @throws ProductNotFoundError if no product exists with that ID.
 */
function getProductById(id: string): Product {
  const product = products.find(p => p.id === id);
  if (!product) throw new ProductNotFoundError(id);
  return product;
}
```

### G3 – Sınır Koşulları Gözardı

```typescript
// KÖTÜ – negatif index, boş dizi durumları göz ardı
function getLastProduct(): Product {
  return products[products.length - 1];  // boşsa undefined döner, hata yok
}

// İYİ – sınır koşulları ele alınmış
function getLastProduct(): Product {
  if (products.length === 0) throw new Error('No products available');
  return products[products.length - 1];
}
```

### G4 – Güvenlik Kontrollerini Ezmek

```typescript
// KÖTÜ – lint kuralı veya TypeScript strict kontrolü disable edilmiş
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processData(data: any) { /* ... */ }

// İYİ – tipi doğru model; any gerekliyse unknown + type guard
function processData(data: unknown) {
  if (!isProductData(data)) throw new Error('Invalid product data');
  // artık güvenle kullan
}
```

### G5 – Yineleme (Duplication)

```typescript
// KÖTÜ – aynı validation iki yerde
function updateProduct(id: string, name: string) {
  if (!name || name.length > 100) throw new Error('Invalid name');
  // ...
}

function createProduct(name: string) {
  if (!name || name.length > 100) throw new Error('Invalid name');
  // ...
}

// İYİ – tek yer
function validateProductName(name: string): void {
  if (!name || name.length > 100) {
    throw new Error('Product name must be 1–100 characters');
  }
}
```

### G6 – Yanlış Soyutlama Seviyesi

```typescript
// KÖTÜ – üst seviye fonksiyon alt detayları bizzat yapıyor
function checkoutOrder(cart: Cart) {
  // Üst seviye adımlar
  validateCart(cart);
  applyDiscounts(cart);

  // Birdenbire ham string birleştirme – yanlış seviye
  const receiptLines = cart.items.map(item => `${item.name}: ${item.price} TL`);
  const receiptText  = receiptLines.join('\n');
  console.log(receiptText);
}

// İYİ – aynı soyutlama seviyesinde kalın
function checkoutOrder(cart: Cart) {
  validateCart(cart);
  applyDiscounts(cart);
  printReceipt(cart);
}
```

### G7 – Base Sınıf Alt Sınıfa Bağımlı

```typescript
// KÖTÜ – base class, subclass'ı ismiyle biliyor
abstract class AbstractPayment {
  process() {
    if (this instanceof CreditCardPayment) {
      (this as CreditCardPayment).charge3DS();
    }
    this.doProcess();
  }
  abstract doProcess(): void;
}

// İYİ – polimorfizm; base bilmez
abstract class AbstractPayment {
  abstract process(): void;
}

class CreditCardPayment extends AbstractPayment {
  process() {
    this.charge3DS();
    this.doCharge();
  }
}
```

### G8 – Çok Fazla Bilgi

```typescript
// KÖTÜ – sınıf her şeyi dışarıya açıyor
class OrderService {
  public cart: Cart;                          // iç durum dışarıya sızıyor
  public validationRules: ValidationRule[];   // uygulama detayı
  calculateTax(order: Order, rate: number, region: string, inclusive: boolean) { /* ... */ }
}

// İYİ – gizlilik; sadece arayüz yüzeyi
class OrderService {
  private cart: Cart;
  private validationRules: ValidationRule[];

  placeOrder(items: CartItem[]): OrderConfirmation { /* ... */ }
  cancelOrder(orderId: string): void { /* ... */ }
  // calculateTax sınıf içinde private kalır
}
```

### G9 – Ölü Kod

```typescript
// KÖTÜ – hiç ulaşılamayan kod
function classifyPrice(price: number): string {
  if (price > 0) return 'positive';
  if (price < 0) return 'negative';
  return 'zero';
  console.log('This never runs');  // ölü kod
}

// İYİ
function classifyPrice(price: number): string {
  if (price > 0) return 'positive';
  if (price < 0) return 'negative';
  return 'zero';
}
```

### G10 – Dikey Ayrım

```typescript
// KÖTÜ – değişken kullanımından çok uzakta tanımlanmış
function processCart(cart: Cart) {
  const taxRate = 0.20;              // ← burada tanımlandı

  validateCart(cart);
  const items = loadCartItems(cart);
  const discountedItems = applyPromotions(items);
  const subtotal = calculateSubtotal(discountedItems);

  return subtotal * (1 + taxRate);   // ← çok satır sonra kullanıldı
}

// İYİ – değişken, kullanım noktasına yakın
function processCart(cart: Cart) {
  validateCart(cart);
  const items          = loadCartItems(cart);
  const discountedItems = applyPromotions(items);
  const subtotal       = calculateSubtotal(discountedItems);

  const taxRate = 0.20;
  return subtotal * (1 + taxRate);
}
```

### G11 – Tutarsızlık

```typescript
// KÖTÜ – bazen camelCase bazen snake_case, bazen get* bazen fetch*
function get_product(id: string) { /* ... */ }
function fetchOrder(id: string)  { /* ... */ }
function load_user(id: string)   { /* ... */ }

// İYİ – her yerde aynı konvansiyon
function getProduct(id: string) { /* ... */ }
function getOrder(id: string)   { /* ... */ }
function getUser(id: string)    { /* ... */ }
```

### G12 – Dağınık Kod (Clutter)

```typescript
// KÖTÜ – gereksiz başlangıç değeri atması, kullanılmayan import
import { useMemo } from 'react';  // kullanılmıyor

function OrderSummary({ items }: { items: CartItem[] }) {
  let total: number = 0;          // = 0 başlatما gerekli ama...
  total = items.reduce((sum, i) => sum + i.price, 0);  // hemen değişiyor
  return <div>{total}</div>;
}

// İYİ
function OrderSummary({ items }: { items: CartItem[] }) {
  const total = items.reduce((sum, i) => sum + i.price, 0);
  return <div>{total}</div>;
}
```

### G13 – Yapay Bağlantı

```typescript
// KÖTÜ – genel utility, ProductService içinde gömülü
class ProductService {
  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  }
}

// İYİ – bağımsız utility; herkes kullanabilir
// src/utils/formatCurrency.ts
export function formatCurrency(value: number, currency = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(value);
}
```

### G14 – Feature Envy

```typescript
// KÖTÜ – CartPrinter, Cart'ın verilerine çok muhtaç
class CartPrinter {
  print(cart: Cart) {
    const subtotal  = cart.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const tax       = subtotal * cart.taxRate;
    const discount  = cart.discountAmount;
    console.log(`Total: ${subtotal + tax - discount}`);
  }
}

// İYİ – total hesabı Cart'a taşındı
class Cart {
  get total(): number {
    const sub = this.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    return sub + sub * this.taxRate - this.discountAmount;
  }
}

class CartPrinter {
  print(cart: Cart) {
    console.log(`Total: ${cart.total}`);
  }
}
```

### G15 – Selector Argümanları

```typescript
// KÖTÜ – enum/string ile kod dallanıyor
function getPrice(product: Product, type: 'net' | 'gross') {
  if (type === 'gross') return product.price * 1.20;
  return product.price;
}

// İYİ – iki ayrı fonksiyon
function getNetPrice(product: Product):   number { return product.price; }
function getGrossPrice(product: Product): number { return product.price * 1.20; }
```

### G16 – Niyeti Gizleyen Kod

```typescript
// KÖTÜ – ne hesaplandığı belirsiz
const v = p * r / 100 * (1 - d / 100);

// İYİ – değişken isimleri niyeti açıklıyor
const discountedPrice   = price * (1 - discountPercent / 100);
const priceAfterTax     = discountedPrice * taxRate / 100;
```

### G17 – Hatalı Sorumluluk Seçimi

```typescript
// KÖTÜ – PI sabiti ProductUtils'de; matematikle ilgisi yok
class ProductUtils {
  static readonly PI = 3.14159;
}

// İYİ – nerede mantıklıysa oraya koy
// src/utils/math.ts
export const PI = Math.PI;

// ProductUtils sadece ürün mantığı içerir
```

### G18 – Uygunsuz Statik Metot

```typescript
// KÖTÜ – polimorfik davranış istenilebilir; static ise override edilemez
class TaxCalculator {
  static calculate(order: Order): number { return order.total * 0.20; }
}

// İYİ – instance metot; farklı hesaplayıcı inject edilebilir
interface TaxCalculator {
  calculate(order: Order): number;
}

class StandardTaxCalculator implements TaxCalculator {
  calculate(order: Order): number { return order.total * 0.20; }
}

class ZeroRateTaxCalculator implements TaxCalculator {
  calculate(order: Order): number { return 0; }  // export güvenli kargo
}
```

### G19 – Açıklayıcı Değişken Kullan

```typescript
// KÖTÜ – tek satırlık zincir; ne döndürdüğü belirsiz
return products.filter(p => p.stock > 0 && p.price <= budget).sort((a, b) => a.price - b.price)[0];

// İYİ – aşamalı, isimlendirilmiş değişkenler
const inStockProducts  = products.filter(p => p.stock > 0);
const affordableProducts = inStockProducts.filter(p => p.price <= budget);
const sortedByPrice    = affordableProducts.sort((a, b) => a.price - b.price);
const cheapestOption   = sortedByPrice[0];
return cheapestOption;
```

### G20 – Negatifi Pozitife Çevir

```typescript
// KÖTÜ – çifte olumsuz
if (!isNotAvailable(product)) { showProduct(product); }

// İYİ – doğrudan olumlu
if (isAvailable(product)) { showProduct(product); }
```

---

## Özet Kural Tablosu (A Kısmı)

| Kod | Kategori | Kural Özeti |
|-----|----------|-------------|
| C1  | Comment  | Meta veri yorumda değil, sistemde |
| C2  | Comment  | Eski yorumları güncelle veya sil |
| C3  | Comment  | Kodu tekrar eden yorumlar gürültüdür |
| C5  | Comment  | Yorum satırındaki kodu sil |
| E1  | Env      | Tek komutla build |
| E2  | Env      | Tek komutla test |
| F1  | Function | Max 3 argüman; fazlası → nesne |
| F2  | Function | Çıktı argümanı yok, return kullan |
| F3  | Function | Flag argümanı yok, iki fonksiyon yap |
| F4  | Function | Ölü fonksiyonları sil |
| G5  | General  | DRY – yinelemeyi ortadan kaldır |
| G6  | General  | Tek soyutlama seviyesi koru |
| G19 | General  | Açıklayıcı değişken adları kullan |
| G20 | General  | Pozitif koşul kullan, çifte olumsuz kaçın |
