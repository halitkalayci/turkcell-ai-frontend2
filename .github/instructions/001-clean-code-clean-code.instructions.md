---
description: >
  Robert Martin – Clean Code, Chapter 1: Clean Code.
  Temiz kodun ne olduğunu, neden önemli olduğunu ve profesyonel bir geliştirici
  olarak temiz kod yazma sorumluluğunu tanımlar.
applyTo: "**"
---

# Chapter 1 – Clean Code

## 1. Temiz Kod Nedir?

> "Clean code is code that has been taken care of." — Robert C. Martin

Temiz kod; okunması kolay, anlaşılması kolay, değiştirilmesi kolay ve test edilmesi kolay koddur. Sadece çalışmak yetmez — **iyi çalışmalı ve iyi görünmelidir.**

Büyük ustaların tanımları:

| Usta | Özet tanım |
|------|-----------|
| Bjarne Stroustrup | Zarif, verimli, hata bırakmayan, sadece bir şey yapan kod |
| Grady Booch | Düz cümleler gibi okunan, tasarım kararları açık olan kod |
| Dave Thomas | Yazar dışındaki kişilerce de değiştirilebilen, testleri olan kod |
| Michael Feathers | Özenle yazılmış, başkasının daha iyi yapamayacağı hissini veren kod |
| Ward Cunningham | Beklediğin gibi çalışan, güzel ve sade olan kod |

---

## 2. Kötü Kodun Bedeli

### 2.1 Hız Kaybı (Productivity Decay)

Kötü kod zamanla birikir ve üzerine yeni kötü kod yazılır. Değiştirmek için bakma, anlamak için zaman harcama zorunluluğu doğar. Bu sarmal sonunda ekibi sıfırdan yeniden yazma kararına götürür — bu her zaman daha uzun sürer.

```
Kötü Kod Birikimi → Anlamak için daha fazla zaman → Yeni özellikler daha yavaş → 
Baskı → Daha kötü kod → Döngü
```

### 2.2 Büyük Yeniden Tasarım Yanılgısı

Sıfırdan yeniden yazmak çözüm gibi görünür ama yeni ekip de aynı tuzaklara düşer. **Temiz kod sürekli disiplin gerektirir, büyük sıfırlamalar değil.**

---

## 3. Temiz Kod Yazmanın Sorumluluğu

### Kural: Profesyonellik

Doktor gibi: Hasta "elleri yıkamana gerek yok" dese de yıkarsın. Aynı şekilde, müdür "hızlı bitir" dese de temiz kod yazarsın. Bu profesyonel bir sorumluluktur.

```
// YANLIŞ düşünce: "Şimdi hızlı yaz, zamanım olunca temizlerim"
// DOĞRU düşünce: "Temiz yazmazsam zamanım olmayacak çünkü kötü kod zamanı çalar"
```

### Kural: İzci Kuralı (Boy Scout Rule)

> "Kampı bulduğundan daha temiz bırak."

Bir dosyayı her açışında en az bir küçük iyileştirme yap: kötü isim düzelt, uzun fonksiyon böl, gereksiz yorum sil.

```typescript
// Dosyayı açtın, şunu gördün:
function calc(a: number, b: number, t: string) { ... }

// Dosyadan çıkmadan önce şunu bırak:
function calculateDiscount(price: number, rate: number, type: string) { ... }
```

---

## 4. Temiz Kodun Temel Özellikleri

### 4.1 Tek Şey Yapar (Does One Thing)

Her fonksiyon, sınıf, modül yalnızca **bir şey** yapmalıdır.

```typescript
// KÖTÜ – birden fazla şey yapıyor
function processUserAndSendEmail(userId: string) {
  const user = db.find(userId);
  user.lastLogin = new Date();
  db.save(user);
  emailService.send(user.email, 'Welcome back!');
}

// İYİ – her fonksiyon tek sorumluluğa sahip
function updateLastLogin(userId: string): User {
  const user = db.find(userId);
  user.lastLogin = new Date();
  return db.save(user);
}

function sendWelcomeBackEmail(user: User): void {
  emailService.send(user.email, 'Welcome back!');
}
```

### 4.2 Okunması Kolay (Readable)

Kod, İngilizce düz yazı gibi okunmalıdır.

```typescript
// KÖTÜ
if (u.s === 'A' && u.r > 2) { ... }

// İYİ
if (user.status === 'active' && user.rating > 2) { ... }
```

### 4.3 Minimal Bağımlılık (Minimal Dependencies)

Her modül yalnızca gerçekten ihtiyaç duyduğu şeylere bağımlı olmalıdır.

### 4.4 Hata Yönetimi (Error Handling)

Temiz kod hataları gizlemez, yok saymaz. Hata yönetimi tam ve açık olmalıdır.

```typescript
// KÖTÜ
function getUser(id: string) {
  try {
    return db.find(id);
  } catch (e) {
    // sessizce yut
  }
}

// İYİ
function getUser(id: string): User {
  const user = db.find(id);
  if (!user) throw new UserNotFoundError(id);
  return user;
}
```

### 4.5 Test Edilebilir (Testable)

Temiz kod test olmadan tamamlanmış sayılmaz.

---

## 5. Okullar Arası Fark

Temiz kodun tek bir "doğru" tanımı yoktur — farklı yazarlar farklı vurgular yapar. Ancak herkes şu konularda hemfikirdir:

- **İsimler önemlidir** — iyi isimler kodu kendi kendini belgeler
- **Fonksiyonlar küçük olmalıdır**
- **Tekrar (duplication) kötüdür**
- **Yorumlar ancak gerektiğinde yazılır**
- **Testler olmazsa olmaz**

---

## 6. Çözülmüş Sorunun Önemi

Temiz kod sadece *yazılırken* değil, *yıllar sonra okunurken* de anlaşılmalıdır.

```typescript
// Bu kodu 6 ay sonra açan biri ne anlayacak?

// KÖTÜ
const x = lst.filter(i => i.t === 1 && !i.d).map(i => i.p * 0.9);

// İYİ
const discountedActivePrices = products
  .filter(product => product.type === ProductType.Regular && !product.isDeleted)
  .map(product => product.price * DISCOUNT_RATE);
```

---

## 7. Özet Kurallar

| # | Kural |
|---|-------|
| 1 | Temiz kod yaz — çalışmak yetmez, *iyi çalışmalı ve okunabilir olmalı* |
| 2 | İzci Kuralı: Dosyayı açtığından daha temiz bırak |
| 3 | Kötü kod ertelemesi yapma; "sonra temizlerim" deme — zamanın olmaz |
| 4 | Temiz kod yazmak profesyonel bir sorumluluktur, baskı gerekçe değildir |
| 5 | Her birim tek şey yapsın |
| 6 | Kod düz yazı gibi okunabilmeli |
| 7 | Test olmadan temiz değildir |
