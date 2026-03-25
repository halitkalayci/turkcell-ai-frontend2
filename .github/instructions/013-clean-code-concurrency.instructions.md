---
description: >
  Robert Martin – Clean Code, Chapter 13: Concurrency.
  Eşzamanlılık mitleri, SRP, paylaşılan verinin sınırlandırılması ve thread-güvenli desenler.
applyTo: "**"
---

# Chapter 13 – Concurrency

## 1. Temel Prensip

> "Concurrency is a decoupling strategy. It helps us decouple what gets done from when it gets done."

Eşzamanlılık zordur. Yanlış anlamalar (mitler) ve dikkatsiz tasarım çoğunlukla hataya yol açar.

---

## 2. Eşzamanlılık Mitleri

| Mit | Gerçek |
|-----|--------|
| Eşzamanlılık her zaman performansı artırır | Tek-thread'de bekler varsa artırır; aksi hâlde overhead ekler |
| Eşzamanlı program tasarımı değiştirmez | Paylaşılan durum, kilit ve senkronizasyon tamamen farklı tasarım gerektirir |
| Bağımlılıkları anlamak yeterli | Container/kütüphane yönetimini de anlamak şart |

---

## 3. SRP: Eşzamanlılık Kodu Ayrı Olmalı

```typescript
// KÖTÜ – iş mantığı ile async yönetimi iç içe
class ProductService {
  private cache = new Map<string, Product>();
  private pendingRequests = new Map<string, Promise<Product>>();

  async getProduct(id: string): Promise<Product> {
    // Cache kontrolü
    if (this.cache.has(id)) return this.cache.get(id)!;

    // Tekrar eden istek koruması
    if (this.pendingRequests.has(id)) return this.pendingRequests.get(id)!;

    // Gerçek iş mantığı
    const promise = this.fetchProduct(id).then(product => {
      this.cache.set(id, product);
      this.pendingRequests.delete(id);
      return product;
    });

    this.pendingRequests.set(id, promise);
    return promise;
  }

  private async fetchProduct(id: string): Promise<Product> {
    const response = await fetch(`/api/products/${id}`);
    return response.json();
  }
}

// İYİ – eşzamanlılık yönetimi ayrı sınıfta
class RequestDeduplicator<T> {
  private pending = new Map<string, Promise<T>>();

  async deduplicate(key: string, factory: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) return this.pending.get(key)!;

    const promise = factory().finally(() => this.pending.delete(key));
    this.pending.set(key, promise);
    return promise;
  }
}

class ProductCache {
  private store = new Map<string, { product: Product; cachedAt: number }>();
  private TTL = 5 * 60 * 1000; // 5 dakika

  get(id: string): Product | null {
    const entry = this.store.get(id);
    if (!entry) return null;
    if (Date.now() - entry.cachedAt > this.TTL) {
      this.store.delete(id);
      return null;
    }
    return entry.product;
  }

  set(id: string, product: Product): void {
    this.store.set(id, { product, cachedAt: Date.now() });
  }
}

// Temiz iş mantığı
class ProductService {
  constructor(
    private cache: ProductCache,
    private deduplicator: RequestDeduplicator<Product>,
  ) {}

  async getProduct(id: string): Promise<Product> {
    const cached = this.cache.get(id);
    if (cached) return cached;

    return this.deduplicator.deduplicate(id, async () => {
      const response = await fetch(`/api/products/${id}`);
      const product  = await response.json() as Product;
      this.cache.set(id, product);
      return product;
    });
  }
}
```

---

## 4. Paylaşılan Veriyi Sınırlandır

```typescript
// KÖTÜ – paylaşılan değiştirilebilir durum (race condition riski)
class OrderProcessor {
  private processedCount = 0;
  private errors: Error[] = [];

  async processAll(orders: Order[]): Promise<void> {
    await Promise.all(orders.map(order => this.process(order)));
  }

  private async process(order: Order): Promise<void> {
    try {
      await submitOrder(order);
      this.processedCount++;      // race condition!
    } catch (error) {
      this.errors.push(error as Error); // race condition!
    }
  }
}

// İYİ – her görev kendi sonucunu üretiyor, paylaşılan değiştirilebilir durum yok
interface ProcessResult {
  orderId: string;
  success: boolean;
  error?: Error;
}

class OrderProcessor {
  async processAll(orders: Order[]): Promise<ProcessSummary> {
    const results = await Promise.allSettled(
      orders.map(order => this.process(order))
    );

    return this.buildSummary(results);
  }

  private async process(order: Order): Promise<ProcessResult> {
    try {
      await submitOrder(order);
      return { orderId: order.id, success: true };
    } catch (error) {
      return { orderId: order.id, success: false, error: error as Error };
    }
  }

  private buildSummary(
    results: PromiseSettledResult<ProcessResult>[],
  ): ProcessSummary {
    const fulfilled = results.filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<ProcessResult>).value);

    return {
      total:   results.length,
      success: fulfilled.filter(r => r.success).length,
      failed:  fulfilled.filter(r => !r.success).length,
      errors:  fulfilled.filter(r => r.error).map(r => r.error!),
    };
  }
}
```

---

## 5. Veri Kopyaları Kullan

```typescript
// KÖTÜ – referansla geçiş, dışarıda değiştirilirse beklenmedik sonuç
class CartStore {
  private items: CartItem[] = [];

  getItems(): CartItem[] {
    return this.items;  // referans dönüyor – dışarıda değiştirilebilir!
  }

  addItem(item: CartItem): void {
    this.items.push(item);
  }
}

// Kullanım – istemeden iç state'i bozuyor
const items   = cartStore.getItems();
items.length = 0; // CartStore'un iç dizisini temizledi!

// İYİ – kopyayla çalış (immutability)
class CartStore {
  private items: ReadonlyArray<CartItem> = [];

  getItems(): ReadonlyArray<CartItem> {
    return this.items;  // readonly referans – değiştirilemez
  }

  addItem(item: CartItem): void {
    this.items = [...this.items, { ...item }]; // yeni dizi + nesne kopyası
  }

  removeItem(productId: string): void {
    this.items = this.items.filter(i => i.productId !== productId);
  }
}
```

---

## 6. Bağımsız Thread'ler

```typescript
// Web Worker ile ağır hesaplamayı ana thread'den ayır
// src/workers/priceCalculator.worker.ts
self.addEventListener('message', (event: MessageEvent<CalculationRequest>) => {
  const { items, discounts, taxRate } = event.data;

  // Yoğun hesaplama – ana thread'i bloklamıyor
  const result = calculateComplexPricing(items, discounts, taxRate);
  self.postMessage(result);
});

function calculateComplexPricing(
  items: CartItem[],
  discounts: Discount[],
  taxRate: number,
): PricingResult {
  // Binlerce ürün için karmaşık hesaplama
  const subtotal = items.reduce((sum, item) => {
    const discount = discounts.find(d => d.productId === item.productId);
    const price    = discount ? item.price * (1 - discount.rate) : item.price;
    return sum + price * item.quantity;
  }, 0);

  const tax   = subtotal * taxRate;
  return { subtotal, tax, total: subtotal + tax };
}

// Ana thread'de hook
function usePriceCalculation(items: CartItem[]) {
  const [result, setResult] = useState<PricingResult | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/priceCalculator.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e: MessageEvent<PricingResult>) => {
      setResult(e.data);
    };

    worker.postMessage({ items, discounts: [], taxRate: 0.18 });

    return () => worker.terminate();
  }, [items]);

  return result;
}
```

---

## 7. Promise ve Async/Await En İyi Pratikleri

```typescript
// KÖTÜ – sıralı await (gereksiz yavaş)
async function loadProductPage(productId: string, userId: string) {
  const product  = await fetchProduct(productId);   // 200ms
  const user     = await fetchUser(userId);          // 150ms
  const reviews  = await fetchReviews(productId);   // 100ms
  // Toplam: ~450ms (her biri sırayla bekliyor)
  return { product, user, reviews };
}

// İYİ – bağımsız işler paralel çalışır
async function loadProductPage(productId: string, userId: string) {
  const [product, user, reviews] = await Promise.all([
    fetchProduct(productId),   // \
    fetchUser(userId),          //  > paralel ~200ms
    fetchReviews(productId),   // /
  ]);
  return { product, user, reviews };
}

// Kısmi başarısızlığı yönet
async function loadProductPageSafe(productId: string, userId: string) {
  const [productResult, userResult, reviewsResult] = await Promise.allSettled([
    fetchProduct(productId),
    fetchUser(userId),
    fetchReviews(productId),
  ]);

  return {
    product: productResult.status === 'fulfilled' ? productResult.value : null,
    user:    userResult.status    === 'fulfilled' ? userResult.value    : null,
    reviews: reviewsResult.status === 'fulfilled' ? reviewsResult.value : [],
  };
}
```

---

## 8. Redux Thunk ile Eşzamanlılık Yönetimi

```typescript
// KÖTÜ – birden fazla thunk aynı kaynağa yarışıyor
export const fetchProduct = createAsyncThunk(
  'products/fetch',
  async (id: string) => {
    const response = await fetch(`/api/products/${id}`);
    return response.json();
  }
  // Aynı ID için iki kez dispatch edilirse iki istek açılır
);

// İYİ – abort koruması + condition kontrolü
export const fetchProduct = createAsyncThunk(
  'products/fetch',
  async (id: string, { signal }) => {
    const response = await fetch(`/api/products/${id}`, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json() as Promise<Product>;
  },
  {
    // Zaten yükleniyorsa yeniden istek açma
    condition: (id, { getState }) => {
      const state  = getState() as RootState;
      const status = selectProductStatus(state, id);
      return status !== 'loading' && status !== 'succeeded';
    },
  }
);

// Component'te cleanup ile abort
function ProductDetail({ id }: { id: string }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const promise = dispatch(fetchProduct(id));
    return () => promise.abort(); // Component unmount → isteği iptal et
  }, [id, dispatch]);
}
```

---

## 9. Özet Kural Tablosu

| # | Kural |
|---|-------|
| 1 | Eşzamanlılık kodu, iş mantığından ayrı tutulmalı (SRP) |
| 2 | Paylaşılan değiştirilebilir durum minimuma indirilmeli |
| 3 | Veri dışarıya döndürülürken kopyalanmalı (immutability) |
| 4 | Bağımsız görevler `Promise.all` ile paralel çalıştırılmalı |
| 5 | Web Worker ağır hesaplamayı ana thread'den izole eder |
| 6 | Thunk'larda `condition` ile tekrar eden istek önlenmeli |
| 7 | Component unmount'ta abort ile asılı kalan istekler iptal edilmeli |
| 8 | Race condition riskini azalt: her göreve kendi sonucunu üret |
