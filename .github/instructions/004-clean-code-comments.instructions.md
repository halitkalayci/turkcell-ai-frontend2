---
description: >
  Robert Martin – Clean Code, Chapter 4: Comments.
  Yorumların ne zaman yazılması, ne zaman yazılmaması gerektiğini ve iyi/kötü
  yorum çeşitlerini somut kurallarla açıklar.
applyTo: "**"
---

# Chapter 4 – Comments

## 1. Temel Prensip

> "The proper use of comments is to compensate for our failure to express ourselves in code."

Yorum eklemek, kodu daha iyi yazmamanın tazminatıdır. **Her yorum yazma isteğinde önce kodu daha iyi yazılabilir mi diye sor.**

---

## 2. Yorumlar Kötüdür (Comments Are Failures)

### 2.1 Yorum Çürür, Kod Değişir

Kod değişince yorum güncellenmez ve yalan söylemeye başlar.

```typescript
// Müşterinin yaşlı olup olmadığını kontrol et
// (Bu yorum yanlış — kod artık 65+ değil 60+ kontrol ediyor)
if (employee.age > 60) {  // ← kod güncellendi ama yorum kalmış
  applyDiscount(employee);
}
```

### 2.2 Kötü Kodu Yorumla Saklamaya Çalışma

```typescript
// KÖTÜ – karmaşık kodu yorum ile açıklamak
// Kullanıcının sipariş listesini al ve toplam fiyatı hesapla,
// indirim oranını uygula ve vergiyi ekle
const r = u.o.filter(x => x.s > 0).map(x => x.p).reduce((a, b) => a + b, 0) * 0.9 * 1.18;

// İYİ – kendi kendini açıklayan kod
const activeOrders = user.orders.filter(order => order.isActive());
const subtotal = activeOrders.map(order => order.price).reduce(sum, 0);
const discountedTotal = subtotal * DISCOUNT_RATE;
const totalWithTax = discountedTotal * TAX_RATE;
```

---

## 3. İyi Yorumlar (Good Comments)

Bazı yorumlar gerçekten gerekli veya faydalıdır.

### 3.1 Yasal Yorumlar (Legal Comments)

Lisans, telif hakkı bilgileri gereklidir.

```typescript
// Copyright (C) 2024 Acme Corp. All rights reserved.
// Licensed under the MIT License. See LICENSE file for details.
```

### 3.2 Bilgilendirici Yorumlar (Informative Comments)

Kodu adlandırarak açıklanamayan bilgi.

```typescript
// kk:mm:ss EEE, MMM dd, yyyy formatına uyuyor
const timeMatcher = /\d{2}:\d{2}:\d{2} \w{3}, \w{3} \d{2}, \d{4}/;
```

### 3.3 Niyet Açıklama (Explanation of Intent)

Neden o kararın alındığını açıklar.

```typescript
// Performans: binary search yerine linear search kullanılıyor
// çünkü liste 10 elemandan küçük; binary search overhead'i daha fazla.
function findItem(items: string[], target: string): number {
  return items.indexOf(target);
}
```

### 3.4 Açıklama (Clarification)

Standart kütüphane veya değiştirilemeyen API'nin anlaşılmasına yardım.

```typescript
assertTrue(a.compareTo(a) === 0);  // a === a
assertTrue(a.compareTo(b) !== 1);  // a !== b
assertTrue(a.compareTo(b) === -1); // a < b
```

### 3.5 Uyarı Yorumları (Warning of Consequences)

Önemli sonuçları olan durumları işaret eder.

```typescript
// Bu test çok yavaş çalışır (~5 dakika).
// CI ortamında devre dışı bırakılmıştır.
// @skip
function testFullDatabaseMigration() { ... }
```

### 3.6 TODO Yorumları

Yapılmayı bekleyen işler — ama birikip çürümemeli.

```typescript
// TODO: PROJ-1234 – Bu geçici çözüm v2.x'te kaldırılacak
// Şimdilik eski API ile uyumluluk için bırakıldı.
function legacyTransform(data: unknown): LegacyDTO { ... }
```

### 3.7 Önem Vurgulama (Amplification)

Önemsiz görünen ama kritik olan kodu işaret eder.

```typescript
const listItemContent = match[3].trim();
// trim() burada çok önemli. Eğer kaldırılırsa başındaki boşluk
// son list item'ı başka bir item olarak ayrıştırmasına neden olur.
```

### 3.8 JSDoc / Public API Dokümantasyonu

Public API metodlarının dokümantasyonu gereklidir.

```typescript
/**
 * Belirtilen kullanıcı kimliğine sahip kullanıcıyı döndürür.
 * @param userId - Benzersiz kullanıcı kimliği
 * @returns Kullanıcı nesnesi
 * @throws {UserNotFoundError} Kullanıcı bulunamazsa
 */
function getUser(userId: string): User { ... }
```

---

## 4. Kötü Yorumlar (Bad Comments)

### 4.1 Mırıldanan Yorumlar (Mumbling)

Sadece yazmak için yazılan, anlam taşımayan yorumlar.

```typescript
function loadProperties(): void {
  try {
    loadedProperties = PropertiesFile.load(DEFAULT_PROPERTIES_FILE);
  } catch (e) {
    // Dosya yüklenemezse varsayılanlar zaten yüklü
    // (Hangi varsayılanlar? Nerede? Nasıl?)
  }
}
```

### 4.2 Gereksiz Yorumlar (Redundant Comments)

Kodun zaten söylediğini tekrar eden yorumlar.

```typescript
// KÖTÜ – yorum koda değer katmıyor
// userName'i döndürür
get userName(): string {
  return this._userName;
}

// i'yi 1 artırır
i++;

// İYİ – yorum yoksa zaten anlaşılıyor
get userName(): string {
  return this._userName;
}
```

### 4.3 Yanıltıcı Yorumlar (Misleading Comments)

Davranışı yanlış anlatan yorumlar.

```typescript
// KÖTÜ – "this.closed true olduğunda döner" yazıyor
// ama aslında timeout olana kadar bekliyor
/** Returns when this.closed is true. */
async function waitForClose(timeoutMs: number): Promise<void> {
  if (!this.closed) {
    await this.wait(timeoutMs);  // timeout dolunca devam eder
    if (!this.closed) throw new Error('Timed out');
  }
}
```

### 4.4 Zorunlu Yorumlar (Mandated Comments)

"Her fonksiyona JSDoc ekle" gibi kurallar anlamsız gürültü üretir.

```typescript
// KÖTÜ – hiçbir değer katmıyor
/**
 * @param name name
 * @param email email
 * @param age age
 */
function createUser(name: string, email: string, age: number): void { ... }
```

### 4.5 Günlük Yorumlar (Journal Comments)

Kaynak kontrolü bu işi yapıyor — kod dosyasında tarih/değişiklik geçmişi yazmak gereksiz.

```typescript
// KÖTÜ
// 2024-01-15 Bob: calculateDiscount eklendi
// 2024-02-03 Alice: vergi hesabı düzeltildi
// 2024-03-01 Bob: refactor edildi
function calculateTotal(price: number): number { ... }
```

### 4.6 Parazit Yorumlar (Noise Comments)

Hiçbir bilgi taşımayan yorumlar.

```typescript
// KÖTÜ
/** Default constructor. */
constructor() { }

/** The day of the month. */
private dayOfMonth: number;

// The name
private name: string;
```

### 4.7 Kapanış Brace Yorumları (Closing Brace Comments)

Fonksiyon çok uzunsa kısa yaz — yorum koyma.

```typescript
// KÖTÜ – fonksiyon o kadar uzun ki paranteze yorum koymak gerekiyor
function processAllPages(): void {
  while (hasMorePages()) {
    const page = getNextPage();
    if (page.isValid()) {
      // ... 30 satır
    } // if page.isValid
  } // while hasMorePages
} // processAllPages
```

### 4.8 Yazara Atıf / İmza (Attribution and Bylines)

Kaynak kontrol sistemi bunu yapıyor.

```typescript
// KÖTÜ
/* Added by Bob – March 2024 */
function fetchUserData() { ... }
```

### 4.9 Yorum Haline Getirilmiş Kod (Commented-Out Code)

Silin. Git history var.

```typescript
// KÖTÜ
function calculateTotal(price: number): number {
  // const oldDiscount = price * 0.1;
  // const legacyTax = price * 0.08;
  // return price - oldDiscount + legacyTax;
  return price * 1.08;
}
```

### 4.10 HTML Yorumları

Yorum içinde HTML markup IDE'de okunmaz hale getirir.

```typescript
// KÖTÜ
/**
 * Bu metodu çağırmak için önce
 * <a href="http://docs.example.com/setup">kurulumu</a> tamamlayın
 */
```

### 4.11 Uzak Bilgi (Nonlocal Information)

Yorum, yanında bulunmayan kodu açıklamamalı.

```typescript
// KÖTÜ – port 8080 farklı dosyada tanımlı; bu yorum burada işe yaramaz
/**
 * Port: 8080 üzerinden çalışır (bkz: config.ts)
 */
function startServer(): void {
  server.listen(DEFAULT_PORT);
}
```

---

## 5. Yorum Yazma Kontrolü

Yorum yazmadan önce şu soruları sor:

1. Bu yorumu gerektiren kodu daha iyi isimlerle ifade edebilir miyim?
2. Bu yorum 6 ay sonra da doğru olacak mı?
3. Bu yorum koda değer mi katıyor, yoksa sadece gürültü mü?
4. Bu bilgiyi kaynak kontrol sisteminden alamaz mıyım?

---

## 6. Özet Kural Tablosu

| # | Kural |
|---|-------|
| 1 | Yorum yazmak yerine kodu daha iyi yaz |
| 2 | Yorum çürür — kod değişince güncellenmez |
| 3 | Gereksiz/redundant yorumlar yazma |
| 4 | Yanıltıcı yorum kötü yorumdan daha kötüdür |
| 5 | Yorum haline getirilmiş kod sil (git history var) |
| 6 | Kapanış brace'lerine yorum koyma — fonksiyonu küçült |
| 7 | Günlük/attribution yorumları koyma — git log var |
| 8 | Public API için JSDoc yaz |
| 9 | Niyet, uyarı ve önem vurgusu için yorum kabul edilebilir |
| 10 | TODO yorumları birikip çürümesin — ticket takibi yap |
