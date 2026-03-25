---
description: >
  Robert Martin – Clean Code, Chapter 5: Formatting.
  Kod biçimlendirmesinin neden önemli olduğunu ve dikey/yatay düzenleme
  kurallarını açıklar.
applyTo: "**"
---

# Chapter 5 – Formatting

## 1. Temel Prensip

> "Code formatting is about communication, and communication is the professional developer's first order of business."

Biçimlendirme, kodu ilk okuyan kişi için iletişim aracıdır. Bugün yazdığın kod değişse de biçimlendirmesi gelecek nesil geliştiricilere mesaj taşır.

> Takım içinde biçimlendirme kuralları belirlenmeli ve otomatik araçlarla (Prettier, ESLint) zorunlu hale getirilmeli.

---

## 2. Dikey Biçimlendirme (Vertical Formatting)

### 2.1 Dosya Boyutu

Çoğu dosya **200 satırın altında** olmalıdır. 500 satırı geçen dosyalar bölünmeli.

```
İdeal: < 200 satır
Kabul edilebilir: < 500 satır
Alarm: 500+ satır → dosyayı böl
```

### 2.2 Gazete Metaforu (The Newspaper Metaphor)

Kaynak dosya gazete makalesi gibi okunmalıdır:

- **Üst kısım**: Yüksek seviye soyutlama → dosyanın ne olduğunu anlatır
- **Alt kısım**: Düşük seviye detaylar

```typescript
// İYİ – üstte yüksek seviye, altta detaylar
// ── ProductList.tsx ──────────────────────────────────────

// YÜKSEK SEVİYE: bileşenin ne yaptığı
export function ProductList({ categoryId }: Props) {
  const products = useProducts(categoryId);
  return <ul>{products.map(renderProductItem)}</ul>;
}

// ORTA SEVİYE: yardımcı render
function renderProductItem(product: Product) {
  return <ProductCard key={product.id} product={product} />;
}

// DÜŞÜK SEVİYE: hook detayı
function useProducts(categoryId: string) {
  return useSelector(selectProductsByCategory(categoryId));
}
```

### 2.3 Dikey Boşluk (Vertical Openness)

İlgili olmayan kavramlar arasına boş satır koy.

```typescript
// KÖTÜ – her şey üst üste
import React from 'react';
import { useSelector } from 'react-redux';
import { Product } from '../../types/product';
import { selectProducts } from '../../store/slices/productSlice';
export function ProductList() {
  const products = useSelector(selectProducts);
  return <div>{products.map(p => <span key={p.id}>{p.name}</span>)}</div>;
}

// İYİ – mantıksal gruplar arasında boş satır
import React from 'react';

import { useSelector } from 'react-redux';

import { Product } from '../../types/product';
import { selectProducts } from '../../store/slices/productSlice';

export function ProductList() {
  const products = useSelector(selectProducts);

  return (
    <div>
      {products.map(p => <span key={p.id}>{p.name}</span>)}
    </div>
  );
}
```

### 2.4 Dikey Yoğunluk (Vertical Density)

Birbirine sıkı bağlı satırlar arasına boşluk koyma.

```typescript
// KÖTÜ – bağlı satırlar arasına gereksiz boşluk
class ReporterConfig {

  private reporterClassName: string;

  private properties: Property[] = [];

  addProperty(property: Property): void {
    this.properties.push(property);
  }
}

// İYİ – ilgili üyeler yan yana
class ReporterConfig {
  private reporterClassName: string;
  private properties: Property[] = [];

  addProperty(property: Property): void {
    this.properties.push(property);
  }
}
```

### 2.5 Dikey Mesafe (Vertical Distance)

Birbirine yakın kullanılan kavramlar dosyada da yakın olmalıdır.

#### Değişken Bildirimleri

Değişkenler kullanım noktasına yakın bildirilmeli.

```typescript
// KÖTÜ – değişkenler çok uzakta tanımlı
function processOrder(orderId: string): void {
  let order: Order;    // ← buradan
  let total: number;
  let discount: number;
  
  // ... 20 satır ...
  
  order = orderRepo.find(orderId);   // ← buraya kadar
  total = calculateTotal(order);
  discount = getDiscount(order);
}

// İYİ – değişkenler kullanım noktasına yakın
function processOrder(orderId: string): void {
  const order = orderRepo.find(orderId);
  const total = calculateTotal(order);
  const discount = getDiscount(order);
}
```

#### Instance Değişkenleri

Sınıfın en üstünde toplanmalı.

```typescript
// İYİ – tüm instance değişkenleri üstte
class Order {
  private id: string;
  private items: OrderItem[];
  private createdAt: Date;
  private status: OrderStatus;

  constructor(id: string) { ... }
  // metotlar...
}
```

#### Bağımlı Fonksiyonlar

Çağıran fonksiyon, çağrılanın hemen üzerinde olmalı.

```typescript
// İYİ – çağıran üstte, çağrılan hemen altında
function buildPageContent(pageData: PageData): string {
  const testableHtml = renderTestableHtml(pageData);
  return includeSetupPages(testableHtml);
}

function renderTestableHtml(pageData: PageData): string {
  // ...
}

function includeSetupPages(html: string): string {
  // ...
}
```

#### Kavramsal Yakınlık

Benzer işler yapan fonksiyonlar dosyada birbirine yakın olmalı.

```typescript
// İYİ – assert fonksiyonları yan yana
function assertTrue(message: string, condition: boolean): void {
  if (!condition) throw new AssertionError(message);
}

function assertFalse(message: string, condition: boolean): void {
  assertTrue(message, !condition);
}
```

---

## 3. Yatay Biçimlendirme (Horizontal Formatting)

### 3.1 Satır Uzunluğu

Satır **80-120 karakter** ile sınırlandırılmalıdır. Yatay scroll kötüdür.

```typescript
// KÖTÜ – çok uzun satır
const discountedTotal = products.filter(product => product.isActive() && product.category === ProductCategory.ELECTRONICS).map(product => product.price * 0.9).reduce((acc, price) => acc + price, 0);

// İYİ – satır araları
const discountedTotal = products
  .filter(product => product.isActive() && product.category === ProductCategory.ELECTRONICS)
  .map(product => product.price * 0.9)
  .reduce((acc, price) => acc + price, 0);
```

### 3.2 Yatay Boşluk (Horizontal Openness)

Operatörler etrafına boşluk koy; birbirine bağlı öğeler arasına koyma.

```typescript
// KÖTÜ
const discriminant=b*b-4*a*c;
function calculate(a:number,b:number):number{return a+b;}

// İYİ
const discriminant = b * b - 4 * a * c;
function calculate(a: number, b: number): number { return a + b; }
```

```typescript
// Fonksiyon çağrısında isim ile parantez arasında boşluk yok
calculate(a, b);    // ← doğru
calculate (a, b);   // ← yanlış
```

### 3.3 Hizalama (Alignment)

Üst üste dizilmiş atamaları hizalama — tuzak.

```typescript
// KÖTÜ – hizalama aldatıcı görünüyor ama diff'i bozar
const firstName  = 'Alice';
const lastName   = 'Smith';
const email      = 'alice@example.com';
const age        = 30;

// İYİ – sıradan hizalama
const firstName = 'Alice';
const lastName = 'Smith';
const email = 'alice@example.com';
const age = 30;
```

### 3.4 Girintileme (Indentation)

- Her seviye için **2 ya da 4 boşluk** — takım içinde tutarlı ol
- Tab kullanma (farklı editörlerde farklı genişlikte gösterilir)
- Kısa if/else için bile brace ve girintileme kullan

```typescript
// KÖTÜ – tek satır kısa if (girintisiz)
if (condition) doSomething();

// İYİ – her zaman brace ile
if (condition) {
  doSomething();
}
```

---

## 4. Sınıf İçi Sıralama (Team Rules)

Sınıf içi sıralama tutarlı olmalı. Önerilen sıra:

```typescript
class ExampleService {
  // 1. Static sabitler / değişkenler
  static readonly MAX_RETRIES = 3;

  // 2. Instance değişkenleri (private önce)
  private readonly repository: Repository;
  private cache: Map<string, unknown>;

  // 3. Constructor
  constructor(repository: Repository) {
    this.repository = repository;
    this.cache = new Map();
  }

  // 4. Public metotlar
  getData(id: string): Data { ... }

  // 5. Private yardımcı metotlar
  private fetchFromSource(id: string): Data { ... }
  private cacheResult(id: string, data: Data): void { ... }
}
```

---

## 5. Araçlarla Zorunlu Hale Getir

Biçimlendirme kuralları otomatik araçlarla uygulanmalı:

```json
// .prettierrc
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

```json
// package.json – lint-staged ile commit öncesi kontrol
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## 6. Özet Kural Tablosu

| # | Kural |
|---|-------|
| 1 | Dosya boyutu < 200 satır ideal, 500+ ise böl |
| 2 | Dosyayı gazete gibi yaz: üstte yüksek soyutlama, altta detay |
| 3 | Farklı kavramlar arasına boş satır koy |
| 4 | Birbirine bağlı satırlar arasına boşluk koyma |
| 5 | Değişkenleri kullanım noktasına yakın bildir |
| 6 | Çağıran fonksiyonu çağrılanın üzerine koy |
| 7 | Satır uzunluğu maksimum 100-120 karakter |
| 8 | Operatörler etrafına boşluk koy |
| 9 | Girintileme için tab değil boşluk — takım içinde tutarlı |
| 10 | Prettier/ESLint ile otomatik zorunlu kıl |
