---
description: >
  Robert Martin – Clean Code, Chapter 10: Classes.
  Sınıf organizasyonu, SRP, OCP, yüksek kohezyon ve küçük sınıf ilkelerini açıklar.
applyTo: "**"
---

# Chapter 10 – Classes

## 1. Temel Prensip

> "Classes should be small. The first rule of classes is that they should be small. The second rule of classes is that they should be smaller than that."

Fonksiyonlar için satır sayısı; sınıflar için **sorumluluk sayısı** ölçüt alınır.

---

## 2. Sınıf Organizasyonu

Sınıfın üyeleri geleneksel sırayla yazılır:

```typescript
class ExampleClass {
  // 1. Static sabitler (public → protected → private)
  static readonly MAX_SIZE = 100;

  // 2. Static değişkenler
  private static instanceCount = 0;

  // 3. Instance değişkenleri (public → protected → private)
  private readonly id: string;
  private name: string;

  // 4. Constructor
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    ExampleClass.instanceCount++;
  }

  // 5. Public metotlar
  getId(): string { return this.id; }
  getName(): string { return this.name; }

  // 6. Private yardımcı metotlar (çağıranın hemen altında)
  private validate(): void { ... }
}
```

---

## 3. Kapsülleme (Encapsulation)

Değişkenleri `private` tut; testler için minimum açıklık yeterli.

```typescript
// KÖTÜ – her şey public
class Cart {
  public items: CartItem[] = [];
  public discountRate: number = 0;
  public customerId: string = '';
}

// İYİ – dışarıya sadece ihtiyaç duyulan arayüz
class Cart {
  private items: CartItem[] = [];
  private discountRate: number = 0;
  private readonly customerId: string;

  constructor(customerId: string) {
    this.customerId = customerId;
  }

  addItem(item: CartItem): void {
    const existing = this.items.find(i => i.productId === item.productId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.items.push({ ...item });
    }
  }

  get total(): number {
    const subtotal = this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return subtotal * (1 - this.discountRate);
  }

  get itemCount(): number {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }
}
```

---

## 4. Tek Sorumluluk İlkesi (SRP)

Bir sınıfın **değişmek için tek bir sebebi** olmalıdır.

```typescript
// KÖTÜ – çok fazla sorumluluk tek sınıfta
class ProductManager {
  // Sorumluluk 1: Veri erişimi
  findById(id: string): Product { ... }
  save(product: Product): void { ... }

  // Sorumluluk 2: İş mantığı
  applyDiscount(product: Product, rate: number): Product { ... }
  isEligibleForPromo(product: Product): boolean { ... }

  // Sorumluluk 3: Formatlama
  formatPrice(price: number): string { ... }
  generateSlug(name: string): string { ... }

  // Sorumluluk 4: Bildirim
  notifyPriceChange(product: Product): void { ... }
}

// İYİ – her sınıf tek sorumluluk
class ProductRepository {
  findById(id: string): Product { ... }
  save(product: Product): void { ... }
}

class ProductPricingService {
  applyDiscount(product: Product, rate: number): Product { ... }
  isEligibleForPromo(product: Product): boolean { ... }
}

class ProductFormatter {
  formatPrice(price: number): string { ... }
  generateSlug(name: string): string { ... }
}

class ProductNotifier {
  notifyPriceChange(product: Product): void { ... }
}
```

> **Birden fazla sebep = birden fazla sınıf.** Ne zaman değişir sorusunun birden fazla cevabı varsa böl.

---

## 5. Yüksek Kohezyon (High Cohesion)

Sınıftaki metotlar, sınıfın değişkenlerini ne kadar sık kullanıyorsa kohezyon o kadar yüksektir.

```typescript
// DÜŞÜK KOHEZYON – metotlar farklı değişkenlere dokunuyor
class MixedService {
  private userName: string;
  private userEmail: string;
  private productName: string;
  private productPrice: number;

  getUserDisplayName(): string {
    return this.userName;          // userName kullanıyor
  }

  getProductDisplayPrice(): string {
    return `$${this.productPrice}`; // productPrice kullanıyor
  }
  // → iki ayrı sınıfa bölünmeli
}

// YÜKSEK KOHEZYON – tüm metotlar aynı değişkenlere dokunuyor
class Stack<T> {
  private elements: T[] = [];
  private topIndex: number = -1;

  push(item: T): void {
    this.elements[++this.topIndex] = item;  // her iki değişken
  }

  pop(): T {
    if (this.isEmpty()) throw new Error('Stack is empty');
    return this.elements[this.topIndex--];  // her iki değişken
  }

  peek(): T {
    if (this.isEmpty()) throw new Error('Stack is empty');
    return this.elements[this.topIndex];    // her iki değişken
  }

  isEmpty(): boolean {
    return this.topIndex < 0;               // topIndex
  }

  get size(): number {
    return this.topIndex + 1;              // topIndex
  }
}
```

---

## 6. Değişiklik İçin Organizasyon (OCP)

Açık-Kapalı İlkesi: Genişlemeye açık, değişikliğe kapalı.

```typescript
// KÖTÜ – yeni ödeme tipi ekleyince switch değişmeli
class PaymentProcessor {
  process(payment: Payment): PaymentResult {
    switch (payment.type) {
      case 'credit_card': return this.processCreditCard(payment);
      case 'paypal':      return this.processPayPal(payment);
      case 'crypto':      return this.processCrypto(payment);
      // Yeni tür → buraya ekleme gerekir (değişikliğe açık!)
    }
  }
}

// İYİ – yeni tür = yeni sınıf, mevcut kod değişmiyor
interface PaymentStrategy {
  process(payment: Payment): PaymentResult;
  supports(type: string): boolean;
}

class CreditCardStrategy implements PaymentStrategy {
  supports(type: string): boolean { return type === 'credit_card'; }
  process(payment: Payment): PaymentResult { ... }
}

class PayPalStrategy implements PaymentStrategy {
  supports(type: string): boolean { return type === 'paypal'; }
  process(payment: Payment): PaymentResult { ... }
}

class PaymentProcessor {
  constructor(private strategies: PaymentStrategy[]) {}

  process(payment: Payment): PaymentResult {
    const strategy = this.strategies.find(s => s.supports(payment.type));
    if (!strategy) throw new UnsupportedPaymentTypeError(payment.type);
    return strategy.process(payment);
  }
}
// Crypto eklemek = yeni CryptoStrategy sınıfı; PaymentProcessor değişmez
```

---

## 7. Değişiklik İzolasyonu (DIP + Arayüzler)

Somut implementasyona değil, soyutlamaya bağımlı ol.

```typescript
// KÖTÜ – somut sınıfa bağımlı (test edilmesi zor, değişime kapalı)
class OrderService {
  private emailService = new SendGridEmailService();  // somut bağımlılık

  completeOrder(order: Order): void {
    // ...
    this.emailService.sendOrderConfirmation(order);
  }
}

// İYİ – arayüze bağımlı (test edilebilir, değiştirilebilir)
interface EmailService {
  sendOrderConfirmation(order: Order): Promise<void>;
}

class OrderService {
  constructor(private emailService: EmailService) {}  // bağımlılık enjeksiyonu

  async completeOrder(order: Order): Promise<void> {
    // ...
    await this.emailService.sendOrderConfirmation(order);
  }
}

// Test → FakeEmailService inject et
// Prod → SendGridEmailService inject et
```

---

## 8. React Component Tasarımında SRP

```typescript
// KÖTÜ – ProductCard çok şey biliyor
function ProductCard({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then(r => r.json())
      .then(p => { setProduct(p); setLoading(false); });
  }, [productId]);

  const handleAddToCart = () => {
    setCartItems(prev => [...prev, productId]);
    fetch('/api/cart', { method: 'POST', body: JSON.stringify({ productId }) });
  };

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <h2>{product?.name}</h2>
      <span>{product?.price}</span>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <div>Cart: {cartItems.length} items</div>
    </div>
  );
}

// İYİ – sorumluluklar ayrı
// 1. Veri hook'ta
function useProduct(productId: string) {
  return useSelector(selectProductById(productId));
}

// 2. Aksiyon hook'ta
function useAddToCart() {
  const dispatch = useDispatch();
  return (productId: string) => dispatch(addToCartAction(productId));
}

// 3. Bileşen sadece UI
function ProductCard({ productId }: { productId: string }) {
  const product = useProduct(productId);
  const addToCart = useAddToCart();

  if (!product) return null;

  return (
    <div>
      <h2>{product.name}</h2>
      <span>{product.displayPrice}</span>
      <button onClick={() => addToCart(product.id)}>Add to Cart</button>
    </div>
  );
}
```

---

## 9. Özet Kural Tablosu

| # | Kural |
|---|-------|
| 1 | Sınıf küçük olmalı: sorumluluk sayısı ölçütü |
| 2 | Üye sırası: static → instance → constructor → public → private |
| 3 | Değişkenleri private tut, minimum arayüz aç |
| 4 | SRP: her sınıfın değişmek için tek sebebi olmalı |
| 5 | Kohezyon: metotlar sınıfın değişkenlerini kullanmalı |
| 6 | OCP: genişlemeye açık, değişikliğe kapalı |
| 7 | DIP: somuta değil, soyutlamaya bağımlı ol |
| 8 | React: veri hook'ta, aksiyon hook'ta, UI bileşende |
| 9 | Çok fazla instance değişkeni → sınıfı böl |
