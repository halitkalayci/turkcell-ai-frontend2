---
description: >
  Robert Martin – Clean Code, Chapter 6: Objects and Data Structures.
  Nesneler ve veri yapıları arasındaki farkı, soyutlamayı ve Law of Demeter'i açıklar.
applyTo: "**"
---

# Chapter 6 – Objects and Data Structures

## 1. Temel Prensip

> "Objects hide their data behind abstractions and expose functions that operate on that data. Data structures expose their data and have no meaningful functions."

İkisi birbirine karşıdır; ikisini aynı anda yapmaya çalışma.

---

## 2. Veri Gizleme (Data Abstraction)

Veri üyelerini `public` yapıp accessor eklemek, gerçek soyutlama DEĞİLDİR.

```typescript
// KÖTÜ – implementasyonu açığa çıkarıyor
class Point {
  public x: number;
  public y: number;
}

// yine KÖTÜ – getter/setter = aynı şey
class Point {
  private x: number;
  private y: number;

  getX(): number { return this.x; }
  setX(x: number): void { this.x = x; }
  getY(): number { return this.y; }
  setY(y: number): void { this.y = y; }
}

// İYİ – soyut arayüz, implementasyon gizli
interface Point {
  getDistanceFromOrigin(): number;
  translate(deltaX: number, deltaY: number): Point;
}
```

```typescript
// KÖTÜ – yakıt miktarını doğrudan sayı olarak döner
interface Vehicle {
  getFuelTankCapacityInGallons(): number;
  getGallonsOfGasoline(): number;
}

// İYİ – soyut kavramla çalışır
interface Vehicle {
  getPercentFuelRemaining(): number;  // %0–100
}
```

---

## 3. Nesne-Veri Yapısı Dikotomisi

### 3.1 Prosedürel Kod (Data Structure)

Yeni fonksiyon eklemek kolayken, yeni tür eklemek tüm fonksiyonları değiştirir.

```typescript
// Veri yapısı – herkese açık data, davranış yok
interface Square { topLeft: Point; side: number; }
interface Rectangle { topLeft: Point; height: number; width: number; }
interface Circle { center: Point; radius: number; }

// Fonksiyon ayrı yerde – yeni shape ekleyince tüm fonksiyonlar değişmeli
class Geometry {
  area(shape: Square | Rectangle | Circle): number {
    if ('side' in shape) return shape.side ** 2;
    if ('width' in shape) return shape.height * shape.width;
    return Math.PI * shape.radius ** 2;
  }
}
```

### 3.2 OOP (Objects)

Yeni tür eklemek kolayken, yeni metot eklemek tüm sınıfları değiştirir.

```typescript
// Polimorfik nesne – her tür kendi davranışını bilir
abstract class Shape {
  abstract area(): number;
}

class Square extends Shape {
  constructor(private side: number) { super(); }
  area(): number { return this.side ** 2; }
}

class Circle extends Shape {
  constructor(private radius: number) { super(); }
  area(): number { return Math.PI * this.radius ** 2; }
}
// Yeni shape eklemek: sadece yeni sınıf → mevcut değişmez
// Yeni metot eklemek: tüm sınıflara eklenmeli
```

> **Seç:** Yeni tip mi, yeni davranış mı daha sık ekleneceği belirler.

---

## 4. Law of Demeter (Minimum Bilgi Prensibi)

Bir nesne yalnızca **yakın dostlarıyla** konuşmalıdır.

**Bir `f` metodu yalnızca şunları çağırabilir:**
1. `this`'in metotları
2. `f`'in parametrelerinin metotları
3. `f`'in içinde oluşturulan nesnelerin metotları
4. Sınıfın instance değişkenlerinin metotları

```typescript
// KÖTÜ – "tren kazası" → zincir çağrı
const outputDir = ctxt.getOptions().getScratchDir().getAbsolutePath();

// İYİ – ayrıştırılmış
const options = ctxt.getOptions();
const scratchDir = options.getScratchDir();
const outputDir = scratchDir.getAbsolutePath();

// EN İYİ – nesneye ne yapmasını söyle, veriyi çekme
const outputDir = ctxt.getScratchDirectoryPath();
```

### Melez Yapılardan Kaçın (Hybrid Structures)

```typescript
// KÖTÜ – yarı nesne yarı veri yapısı (en kötüsü)
class OrderProcessor {
  public orderId: string;         // veri yapısı gibi açık alan
  public customer: Customer;

  calculateDiscount(): number {   // ama davranış da var
    return this.customer.getLoyaltyPoints() > 1000 ? 0.1 : 0;
  }
}
```

---

## 5. Veri Transfer Nesneleri (DTO / Data Transfer Object)

Dış sistemlerden gelen ham veriyi almak için saf veri yapıları kullanılır.

```typescript
// DTO – sadece veri, mantık yok
interface ProductDTO {
  id: string;
  name: string;
  price: number;
  categoryId: string;
}

// Domain object – veriyi gizler, davranış sunar
class Product {
  private readonly data: ProductDTO;

  constructor(dto: ProductDTO) {
    this.data = dto;
  }

  get id(): string { return this.data.id; }
  get displayPrice(): string { return `$${this.data.price.toFixed(2)}`; }
  isInCategory(categoryId: string): boolean {
    return this.data.categoryId === categoryId;
  }
}
```

### Active Record Tuzağı

Active Record nesnelere iş kuralı metodu ekleme — `save()` / `find()` varsa başka metot ekleme.

```typescript
// KÖTÜ – Active Record + iş mantığı karışımı
class UserRecord {
  id: string;
  email: string;

  save(): Promise<void> { /* DB'ye kaydet */ }
  find(id: string): Promise<UserRecord> { /* DB'den çek */ }

  // İş kuralı Active Record'da olmamalı!
  isEligibleForDiscount(): boolean {
    return this.createdAt < new Date('2020-01-01');
  }
}

// İYİ – Active Record ayrı, domain logic ayrı
class UserRecord {
  id: string;
  email: string;
  createdAt: Date;

  save(): Promise<void> { ... }
}

class User {
  constructor(private record: UserRecord) {}

  isEligibleForDiscount(): boolean {
    return this.record.createdAt < new Date('2020-01-01');
  }
}
```

---

## 6. React/Redux Bağlamı

```typescript
// Store state – veri yapısı (saf data, mantık yok)
interface ProductState {
  items: Product[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

// Selector – prosedürel erişim (veri yapısı üzerinde fonksiyon)
export const selectDiscountedProducts = (state: RootState) =>
  state.products.items.filter(p => p.discountRate > 0);

// Component – soyutlama yeterince yüksek seviyede
function ProductList() {
  const products = useSelector(selectDiscountedProducts);
  // selectDiscountedProducts'un içini bilmez
  return <ul>{products.map(p => <ProductCard key={p.id} product={p} />)}</ul>;
}
```

---

## 7. Özet Kural Tablosu

| # | Kural |
|---|-------|
| 1 | Getter/setter eklemek soyutlama DEĞİLDİR; soyut arayüz tasarla |
| 2 | Nesne: veriyi gizle, davranışı aç; Veri yapısı: veriyi aç, davranışı gizle |
| 3 | İkisini karıştırma — Hybrid yapıdan kaçın |
| 4 | Sık tip ekleniyorsa OOP kullan; sık fonksiyon ekleniyorsa prosedürel |
| 5 | Law of Demeter: sadece yakın dostlarla konuş |
| 6 | Tren kazası gibi zincir çağrı yazmak Law of Demeter ihlalidir |
| 7 | DTO'lar saf data taşır; iş mantığı domain nesnelere girer |
| 8 | Active Record'a iş mantığı ekleme; ayrı domain nesnesi yaz |
