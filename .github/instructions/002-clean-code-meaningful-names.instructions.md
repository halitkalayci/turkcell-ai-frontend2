---
description: >
  Robert Martin – Clean Code, Chapter 2: Meaningful Names.
  Değişken, fonksiyon, sınıf ve modül isimlerinin nasıl seçileceğine dair
  somut kurallar içerir. İyi isimlendirme kodu kendi kendini belgeleyen hale getirir.
applyTo: "**"
---

# Chapter 2 – Meaningful Names

## 1. Temel Prensip

> "The name of a variable, function, or class should answer all the big questions: why it exists, what it does, and how it is used."

İyi isim = ayrıca açıklama gerektirmeyen isim.

---

## 2. Kurallara Göre İsimlendirme

### 2.1 Niyeti Ortaya Koyan İsimler (Intention-Revealing Names)

İsim, amacı tek başına anlatmalıdır.

```typescript
// KÖTÜ
let d: number; // geçen gün sayısı

// İYİ
let elapsedTimeInDays: number;
let daysSinceCreation: number;
let fileAgeInDays: number;
```

```typescript
// KÖTÜ – ne döndürüyor? hangi liste? flag ne anlama geliyor?
function getThem(theList: number[][]): number[][] {
  const list1: number[][] = [];
  for (const x of theList) {
    if (x[0] === 4) list1.push(x);
  }
  return list1;
}

// İYİ
function getFlaggedCells(gameBoard: Cell[][]): Cell[][] {
  return gameBoard.filter(cell => cell.isFlagged());
}
```

---

### 2.2 Yanlış Çağrışım Yaratma (Avoid Disinformation)

İsimler yanlış anlam çağrıştırmamalıdır.

```typescript
// KÖTÜ – "List" sonu özel anlam taşır; bu bir liste değilse kullanma
const accountList: Account[] = []; // aslında Map veya Set ise yanıltıcı

// İYİ
const accounts: Account[] = [];
const accountMap: Map<string, Account> = new Map();
const accountGroup: Account[] = [];

// KÖTÜ – l ve O harfleri, 1 ve 0 ile karışır
const l = 1;
const O = 0; // O mu, 0 mı?

// İYİ – her zaman açıklayıcı isim kullan
const loginAttemptCount = 1;
```

---

### 2.3 Anlamlı Ayrımlar (Meaningful Distinctions)

İki farklı şey farklı isim almalıdır — salt farklı olmak için rastgele karakter ekleme.

```typescript
// KÖTÜ – a1 ve a2 hiçbir şey söylemiyor
function copyChars(a1: string[], a2: string[]): void {
  for (let i = 0; i < a1.length; i++) {
    a2[i] = a1[i];
  }
}

// İYİ
function copyChars(source: string[], destination: string[]): void {
  for (let i = 0; i < source.length; i++) {
    destination[i] = source[i];
  }
}
```

```typescript
// KÖTÜ – "Info" ve "Data" anlamsız ek
class ProductInfo { ... }
class ProductData { ... } // fark ne?

// İYİ – anlamlı fark varsa isimde göster
class Product { ... }
class ProductDetails { ... }
```

---

### 2.4 Telaffuz Edilebilir İsimler (Pronounceable Names)

İsimler sesli konuşmada kullanılabilmeli.

```typescript
// KÖTÜ – "genymdhms" ne anlama geliyor?
class DtaRcrd102 {
  private genymdhms: Date;
  private modymdhms: Date;
  private pszqint: string = '102';
}

// İYİ
class Customer {
  private generationTimestamp: Date;
  private modificationTimestamp: Date;
  private recordId: string = '102';
}
```

---

### 2.5 Aranabilir İsimler (Searchable Names)

Tek harfli değişkenler ve sihirli sayılar kodu aranmaz hale getirir.

```typescript
// KÖTÜ – 5 neyi temsil ediyor? grep ile aramak imkansız
for (let j = 0; j < 34; j++) {
  s += (t[j] * 4) / 5;
}

// İYİ
const WORK_DAYS_PER_WEEK = 5;
const NUMBER_OF_TASKS = 34;
const TASK_ESTIMATE_MULTIPLIER = 4;

let taskSumInWeeks = 0;
for (let taskIndex = 0; taskIndex < NUMBER_OF_TASKS; taskIndex++) {
  taskSumInWeeks += (tasks[taskIndex] * TASK_ESTIMATE_MULTIPLIER) / WORK_DAYS_PER_WEEK;
}
```

> Tek harfli değişkende tek istisna: kısa `for` döngülerinde `i`, `j`, `k` kabul edilebilir.

---

### 2.6 Tip Kodlaması Kullanma (No Encodings)

#### Hungarian Notation Yasak

TypeScript'te tür sistemi var — ön ekle tip belirtme hem gürültü hem yanıltıcı.

```typescript
// KÖTÜ
const strName: string = 'Alice';
const iCount: number = 5;
const bIsActive: boolean = true;
const arrProducts: Product[] = [];

// İYİ
const name: string = 'Alice';
const count: number = 5;
const isActive: boolean = true;
const products: Product[] = [];
```

#### Interface / Implementasyon Ön Eki Gereksiz

```typescript
// KÖTÜ
interface IShapeFactory { ... }
class ShapeFactoryImpl implements IShapeFactory { ... }

// İYİ
interface ShapeFactory { ... }
class DefaultShapeFactory implements ShapeFactory { ... }
// veya
class CachedShapeFactory implements ShapeFactory { ... }
```

---

### 2.7 Zihinsel Haritalama Yapma (No Mental Mapping)

Okuyucuyu zihninde çeviri yapmaya zorlamayın.

```typescript
// KÖTÜ – r nedir? url decoded mi?
const r = getDecodedUrl(url);

// İYİ
const decodedUrl = getDecodedUrl(url);
```

---

### 2.8 Sınıf İsimleri (Class Names)

Sınıf isimleri **isim (noun) ya da isim öbeği** olmalıdır. Fiil olmamalıdır.

```typescript
// İYİ
class Customer { ... }
class WikiPage { ... }
class Account { ... }
class AddressParser { ... }

// KÖTÜ – fiil veya belirsiz genel kelimeler
class Processor { ... }  // belirsiz
class Manager { ... }    // belirsiz
class Data { ... }       // çok genel
class Info { ... }       // çok genel
```

---

### 2.9 Metot İsimleri (Method Names)

Metotlar **fiil ya da fiil öbeği** olmalıdır.

```typescript
// İYİ
postPayment()
deletePage()
save()
getName()      // accessor
setName()      // mutator
isPosted()     // predicate

// KÖTÜ
payment()
page()
```

**Constructors overload varsa static factory method tercih et:**

```typescript
// KÖTÜ
const point = new Complex(23.0, 1.0);

// İYİ – ne inşa ettiği anlaşılıyor
const point = Complex.fromRealNumber(23.0);
```

---

### 2.10 Her Kavram İçin Tek Kelime (One Word Per Concept)

Aynı kavram için farklı kelimeler kullanma.

```typescript
// KÖTÜ – fetch, retrieve, get üçü de "al" demek ama hangisi ne zaman?
class UserController {
  fetchUser(id: string) { ... }
}
class ProductController {
  retrieveProduct(id: string) { ... }
}
class OrderController {
  getOrder(id: string) { ... }
}

// İYİ – tüm controller'larda tutarlı "get" kullan
class UserController {
  getUser(id: string) { ... }
}
class ProductController {
  getProduct(id: string) { ... }
}
class OrderController {
  getOrder(id: string) { ... }
}
```

---

### 2.11 Kelime Oyunu Yapma (Don't Pun)

Aynı kelimeyi iki farklı amaç için kullanma.

```typescript
// KÖTÜ – add hem "topla" hem "ekle" anlamına mı geliyor?
class StringUtils {
  add(a: string, b: string): string { return a + b; } // birleştir
}
class Collection {
  add(item: Item): void { this.items.push(item); } // ekle/ekle
}

// İYİ – farklı kavramlar için farklı isimler
class StringUtils {
  concatenate(a: string, b: string): string { return a + b; }
}
class Collection {
  insert(item: Item): void { this.items.push(item); }
}
```

---

### 2.12 Anlamlı Bağlam (Meaningful Context)

İsimleri çevreleyen bağlam onları anlamsızlaştırmamalı.

```typescript
// KÖTÜ – state, city, zipCode tek başına ne ifade ediyor sınıf olmadan?
const state = 'NY';
const city = 'New York';
const zipCode = '10001';

// İYİ – bağlamı isimle veya sınıfla sağla
const addrState = 'NY';
const addrCity = 'New York';
const addrZipCode = '10001';

// DAHA İYİ – sınıf bağlamı sağlar
class Address {
  state: string;
  city: string;
  zipCode: string;
}
```

---

### 2.13 Gereksiz Bağlam Ekleme (Don't Add Gratuitous Context)

Her şeye aynı ön eki ekleme.

```typescript
// KÖTÜ – her şeye "GSD" (Gas Station Deluxe) öneki eklenmiş
class GSDAccountAddress { ... }
interface GSDAddress { ... }
function GSDGetAddress() { ... }

// İYİ – bağlam zaten sınıf/modül adından anlaşılıyor
class AccountAddress { ... }
interface Address { ... }
function getAddress() { ... }
```

---

## 3. Özet Kural Tablosu

| # | Kural |
|---|-------|
| 1 | İsim amacı tek başına anlatmalı — yorum gerekmemeli |
| 2 | Yanlış çağrışım yaratan isimlerden kaçın (`List`, `l`, `O`) |
| 3 | Anlamsız ayırt edici ekler koyma (`Info`, `Data`, `a1`/`a2`) |
| 4 | Telaffuz edilebilir isimler kullan |
| 5 | Aranabilir isimler kullan — sihirli sayıları sabite çek |
| 6 | Tip kodlaması (Hungarian Notation, `I` ön eki) kullanma |
| 7 | Sınıf ismi isim/isim öbeği olmalı |
| 8 | Metot ismi fiil/fiil öbeği olmalı |
| 9 | Her kavram için projenin tamamında tek kelime kullan |
| 10 | Aynı kelimeyi iki farklı kavramda kullanma |
| 11 | Gereksiz ön/son ek ekleme — bağlam sınıftan anlaşılıyor |
