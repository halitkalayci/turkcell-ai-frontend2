---
description: >
  Robert Martin – Clean Code, Chapter 3: Functions.
  Fonksiyonların nasıl küçük, odaklı, okunabilir ve yan etkisiz yazılacağına
  dair somut kurallar içerir.
applyTo: "**"
---

# Chapter 3 – Functions

## 1. Temel Prensip

> "The first rule of functions is that they should be small. The second rule of functions is that they should be smaller than that."

Fonksiyonlar basit kararlar, tanımlanmış girdi/çıktı ve tek bir soyutlama seviyesinde olmalıdır.

---

## 2. Küçük Fonksiyonlar (Small!)

### 2.1 Boyut

Her fonksiyon **en fazla 20 satır** olmalıdır; çoğu 5-10 satırda biter.

```typescript
// KÖTÜ – çok uzun, çok fazla şey yapıyor
function renderPageWithSetupsAndTeardowns(
  pageData: PageData,
  isSuite: boolean
): string {
  const isTestPage = pageData.hasAttribute("Test");
  if (isTestPage) {
    const testPage = pageData.getWikiPage();
    let content = "";
    const setupPages = new LinkedList<WikiPage>();
    const suiteLevelSetups = new PageCrawlerImpl().getInheritedPages("SuiteSetUp", testPage);
    // ... 40 satır daha
  }
  // ...
}

// İYİ – küçük, okunabilir
function renderPage(pageData: PageData, isSuite: boolean): string {
  if (isTestPage(pageData)) {
    includeSetupAndTeardownPages(pageData, isSuite);
  }
  return pageData.getHtml();
}
```

### 2.2 Bloklar ve Girintiler

`if`, `else`, `while` blokları tek satır olmalı ve genellikle bir fonksiyon çağrısına işaret etmeli. İç içe yapı 2 seviyeyi geçmemeli.

```typescript
// KÖTÜ – 3 seviye iç içe
function processOrders(orders: Order[]): void {
  for (const order of orders) {
    if (order.isValid()) {
      for (const item of order.items) {
        if (item.isInStock()) {
          processItem(item);
        }
      }
    }
  }
}

// İYİ – her seviye ayrı fonksiyona
function processOrders(orders: Order[]): void {
  orders.filter(isValid).forEach(processOrder);
}

function processOrder(order: Order): void {
  order.items.filter(isInStock).forEach(processItem);
}
```

---

## 3. Tek Şey Yapma (Do One Thing)

> "Functions should do one thing. They should do it well. They should do it only."

**"Bir şey" testi:** Fonksiyondan anlamlı yeni bir alt fonksiyon çıkarabiliyorsanız, o fonksiyon birden fazla şey yapıyordur.

```typescript
// KÖTÜ – birden fazla şey: doğrulama + kayıt + e-posta gönderme
function registerUser(userData: UserDTO): void {
  // 1. Doğrulama
  if (!userData.email.includes('@')) throw new Error('Invalid email');
  if (userData.password.length < 8) throw new Error('Password too short');

  // 2. Kayıt
  const user = new User(userData);
  userRepository.save(user);

  // 3. E-posta
  emailService.sendWelcome(user.email);
}

// İYİ – her fonksiyon bir şey yapıyor
function registerUser(userData: UserDTO): void {
  validateUserData(userData);
  const user = createAndSaveUser(userData);
  sendWelcomeEmail(user);
}

function validateUserData(userData: UserDTO): void {
  if (!isValidEmail(userData.email)) throw new InvalidEmailError();
  if (!isStrongPassword(userData.password)) throw new WeakPasswordError();
}

function createAndSaveUser(userData: UserDTO): User {
  const user = new User(userData);
  return userRepository.save(user);
}

function sendWelcomeEmail(user: User): void {
  emailService.sendWelcome(user.email);
}
```

---

## 4. Bir Soyutlama Seviyesi (One Level of Abstraction)

Fonksiyon içindeki tüm ifadeler aynı soyutlama seviyesinde olmalıdır.

```typescript
// KÖTÜ – yüksek ve düşük soyutlama karışık
function buildHomePage(): string {
  const html = getPageHeader();             // yüksek soyutlama
  html += '<div class="content">';          // düşük soyutlama (HTML detayı)
  html += getWikiPage('FrontPage').text;    // yüksek soyutlama
  html += '</div>';                         // düşük soyutlama
  html += getPageFooter();                  // yüksek soyutlama
  return html;
}

// İYİ – tüm ifadeler aynı soyutlama seviyesinde
function buildHomePage(): string {
  return [
    getPageHeader(),
    wrapInContentDiv(getWikiPageContent('FrontPage')),
    getPageFooter(),
  ].join('');
}
```

---

## 5. Switch/if-else Zincirleri

`switch` veya uzun `if-else` zinciri genellikle polimorfizmle gizlenmeli.

```typescript
// KÖTÜ – yeni tip eklenince bu fonksiyon değişmeli
function calculatePay(employee: Employee): Money {
  switch (employee.type) {
    case EmployeeType.COMMISSIONED:
      return calculateCommissionedPay(employee);
    case EmployeeType.HOURLY:
      return calculateHourlyPay(employee);
    case EmployeeType.SALARIED:
      return calculateSalariedPay(employee);
    default:
      throw new InvalidEmployeeType(employee.type);
  }
}

// İYİ – Abstract Factory + polimorfizm
interface Employee {
  calculatePay(): Money;
}
class CommissionedEmployee implements Employee {
  calculatePay(): Money { ... }
}
class HourlyEmployee implements Employee {
  calculatePay(): Money { ... }
}
```

---

## 6. Fonksiyon Parametreleri (Function Arguments)

### 6.1 İdeal Parametre Sayısı

| Sayı | Adı | Yorum |
|------|-----|-------|
| 0 | Niladic | En iyi |
| 1 | Monadic | Kabul edilebilir |
| 2 | Dyadic | Dikkatli kullan |
| 3 | Triadic | Kaçın |
| 3+ | Polyadic | Nesne/objeye çevir |

```typescript
// KÖTÜ – 4 parametre
function createUser(name: string, email: string, age: number, role: string): User { ... }

// İYİ – parametre nesnesi
interface CreateUserParams {
  name: string;
  email: string;
  age: number;
  role: string;
}
function createUser(params: CreateUserParams): User { ... }
```

### 6.2 Flag Parametreleri Yasak

Boolean flag parametresi, fonksiyonun iki farklı şey yaptığının işaretidir — ikiye böl.

```typescript
// KÖTÜ
function render(isSuite: boolean): string { ... }

// İYİ
function renderSuite(): string { ... }
function renderSingleTest(): string { ... }
```

### 6.3 Output Argümanları Kullanma

Fonksiyon çıktısı dönüş değeri olmalı, parametre üzerinden değil.

```typescript
// KÖTÜ – appendFooter ne yapıyor? s'nin içine mi ekliyor?
function appendFooter(s: StringBuffer): void { ... }

// İYİ
function getFooter(): string { ... }
// veya this üzerinden
report.appendFooter();
```

---

## 7. Yan Etkisiz Fonksiyonlar (No Side Effects)

Fonksiyon yalnızca söylediği şeyi yapmalı — gizli state değişikliği olmamalı.

```typescript
// KÖTÜ – checkPassword salt doğrulama gibi görünüyor ama oturum da açıyor!
function checkPassword(userName: string, password: string): boolean {
  const user = UserGateway.findByName(userName);
  if (user !== User.NULL) {
    const codedPhrase = user.getPhraseEncodedByPassword();
    const phrase = cryptographer.decrypt(codedPhrase, password);
    if (phrase === 'Valid Password') {
      Session.initialize(); // GİZLİ YAN ETKİ
      return true;
    }
  }
  return false;
}

// İYİ – iki ayrı sorumluluk
function isValidPassword(userName: string, password: string): boolean {
  const user = UserGateway.findByName(userName);
  return user !== User.NULL && decryptedPhraseMatchesPassword(user, password);
}

function login(userName: string, password: string): void {
  if (!isValidPassword(userName, password)) throw new AuthenticationError();
  Session.initialize();
}
```

---

## 8. Komut / Sorgu Ayrımı (Command Query Separation)

Bir fonksiyon ya bir şeyi değiştirmeli (komut) ya da bir şeyi döndürmeli (sorgu) — ikisini birden yapmamalı.

```typescript
// KÖTÜ – hem set ediyor hem boolean dönüyor
if (set('username', 'Bob')) { ... }  // set mi? kontrol mü?

// İYİ – ayrı fonksiyonlar
if (attributeExists('username')) {
  setAttribute('username', 'Bob');
}
```

---

## 9. Exception Kullan, Hata Kodu Dönme

```typescript
// KÖTÜ – hata kodları dönmek
function deleteUser(userId: string): number {
  const result = userRepository.delete(userId);
  if (result === -1) return ERROR_USER_NOT_FOUND;
  if (result === -2) return ERROR_PERMISSION_DENIED;
  return SUCCESS;
}

// if içindeki hata kodu kontrolü çağırana yük yüklüyor
if (deleteUser(userId) === ERROR_USER_NOT_FOUND) { ... }

// İYİ – exception fırlat
function deleteUser(userId: string): void {
  const user = userRepository.find(userId);
  if (!user) throw new UserNotFoundError(userId);
  if (!currentUser.canDelete(user)) throw new PermissionDeniedError();
  userRepository.delete(userId);
}
```

---

## 10. Try/Catch Blokları Ayrı Fonksiyon

```typescript
// KÖTÜ – hata yönetimi ve iş mantığı karışık
function deleteUser(userId: string): void {
  try {
    const user = userRepository.find(userId);
    if (!user) throw new UserNotFoundError(userId);
    userRepository.delete(userId);
    logger.info(`Deleted user ${userId}`);
  } catch (error) {
    logger.error(`Failed to delete user ${userId}`, error);
  }
}

// İYİ – hata yönetimi kendi fonksiyonunda
function deleteUser(userId: string): void {
  try {
    tryDeleteUser(userId);
  } catch (error) {
    logDeletionError(userId, error);
  }
}

function tryDeleteUser(userId: string): void {
  const user = userRepository.findOrThrow(userId);
  userRepository.delete(user);
  logger.info(`Deleted user ${userId}`);
}
```

---

## 11. DRY – Tekrar Etme (Don't Repeat Yourself)

Yinelenen kod → yinelenen hata kaynağı. Her bilgi tek yerde olmalı.

```typescript
// KÖTÜ – aynı doğrulama iki yerde
function createProduct(name: string, price: number): void {
  if (!name || name.trim() === '') throw new Error('Name required');
  if (price < 0) throw new Error('Price cannot be negative');
  // ...
}

function updateProduct(id: string, name: string, price: number): void {
  if (!name || name.trim() === '') throw new Error('Name required');
  if (price < 0) throw new Error('Price cannot be negative');
  // ...
}

// İYİ
function validateProductInput(name: string, price: number): void {
  if (!name || name.trim() === '') throw new InvalidProductNameError();
  if (price < 0) throw new NegativePriceError();
}

function createProduct(name: string, price: number): void {
  validateProductInput(name, price);
  // ...
}

function updateProduct(id: string, name: string, price: number): void {
  validateProductInput(name, price);
  // ...
}
```

---

## 12. Özet Kural Tablosu

| # | Kural |
|---|-------|
| 1 | Fonksiyonlar küçük olmalı — ideal 5-15 satır, max ~20 |
| 2 | Tek bir şey yapmalı |
| 3 | Tüm ifadeler aynı soyutlama seviyesinde olmalı |
| 4 | Parametre sayısı 0-1 ideal, 3+ nesneleştir |
| 5 | Boolean flag parametresi yasak — fonksiyonu böl |
| 6 | Output argümanı kullanma — dönüş değeri olsun |
| 7 | Gizli yan etkilerden kaçın |
| 8 | Komut / sorgu ayrımı yap |
| 9 | Hata kodu dönme — exception fırlat |
| 10 | try/catch bloğunu ayrı fonksiyona çıkar |
| 11 | DRY: tekrar eden kodu fonksiyona çek |
