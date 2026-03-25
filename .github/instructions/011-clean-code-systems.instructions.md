---
description: >
  Robert Martin – Clean Code, Chapter 11: Systems.
  Sistem inşasını kullanımdan ayırmak, DI, fabrikalar, AOP ve sistem mimarisini açıklar.
applyTo: "**"
---

# Chapter 11 – Systems

## 1. Temel Prensip

> "Software systems are unique compared to physical systems. Their architectures can grow incrementally, if we maintain the proper separation of concerns."

Bir binayı inşa etmek ile onu kullanmak farklı süreçlerdir. Yazılımda da **inşa (construction)** ile **kullanım (use)** ayrı olmalıdır.

---

## 2. İnşayı Kullanımdan Ayır

```typescript
// KÖTÜ – uygulama nesneleri lazy init ile birbirine karışıyor
class OrderService {
  private cartService: CartService;

  getCart(): CartService {
    if (!this.cartService) {
      // Hard-coded bağımlılık + lazy init karışımı
      this.cartService = new CartService(
        new ProductRepository(new DatabaseConnection()),
        new PricingEngine(),
      );
    }
    return this.cartService;
  }
}

// İYİ – inşa ayrı bir yerde olur (composition root)
// src/main.tsx veya src/container.ts
function buildContainer() {
  const db         = new DatabaseConnection(config.DATABASE_URL);
  const productRepo = new ProductRepository(db);
  const pricing    = new PricingEngine();
  const cart       = new CartService(productRepo, pricing);
  const order      = new OrderService(cart);
  return { orderService: order };
}

// Servisler sadece arayüze bağımlıdır, nasıl oluşturulduğunu bilmez
class OrderService {
  constructor(private cartService: CartService) {}
}
```

---

## 3. Bağımlılık Enjeksiyonu (Dependency Injection)

DI, "inşayı kullanımdan ayırmanın" en güçlü mekanizmasıdır.

```typescript
// Arayüzler tanımla
interface Logger {
  log(message: string, level?: string): void;
}

interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  save(product: Product): Promise<void>;
}

// Somut implementasyonlar
class ConsoleLogger implements Logger {
  log(message: string, level = 'info'): void {
    console[level as 'log'](`[${level.toUpperCase()}] ${message}`);
  }
}

class HttpProductRepository implements ProductRepository {
  constructor(private readonly baseUrl: string) {}

  async findById(id: string): Promise<Product | null> {
    const response = await fetch(`${this.baseUrl}/products/${id}`);
    if (!response.ok) return null;
    return response.json();
  }

  async save(product: Product): Promise<void> {
    await fetch(`${this.baseUrl}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
  }
}

// Servis arayüze bağımlı, somuta değil
class ProductService {
  constructor(
    private repo: ProductRepository,
    private logger: Logger,
  ) {}

  async getProduct(id: string): Promise<Product> {
    this.logger.log(`Fetching product: ${id}`);
    const product = await this.repo.findById(id);
    if (!product) throw new NotFoundError(`Product not found: ${id}`);
    return product;
  }
}

// Composition root (main.tsx / app bootstrap)
const logger  = new ConsoleLogger();
const repo    = new HttpProductRepository(import.meta.env.VITE_API_URL);
const service = new ProductService(repo, logger);
```

---

## 4. Fabrika Deseni (Factories)

Nesne yaratma mantığı karmaşıklaştığında fabrika kullan.

```typescript
// KÖTÜ – nesne yaratma iş mantığıyla karışıyor
class CartService {
  addItem(type: string, data: Record<string, unknown>): CartItem {
    if (type === 'physical') {
      const item = new PhysicalCartItem();
      item.weight = data.weight as number;
      item.dimensions = data.dimensions as Dimensions;
      item.shippingZone = ShippingZoneCalculator.calculate(item);
      return item;
    }
    if (type === 'digital') {
      const item = new DigitalCartItem();
      item.downloadUrl = data.downloadUrl as string;
      item.licenseKey = LicenseKeyGenerator.generate();
      return item;
    }
    throw new Error(`Unknown item type: ${type}`);
  }
}

// İYİ – fabrika yaratma sorumluluğunu üstleniyor
interface CartItemFactory {
  createItem(data: Record<string, unknown>): CartItem;
  supports(type: string): boolean;
}

class PhysicalCartItemFactory implements CartItemFactory {
  supports(type: string): boolean { return type === 'physical'; }

  createItem(data: Record<string, unknown>): CartItem {
    const item = new PhysicalCartItem();
    item.weight    = data.weight as number;
    item.dimensions = data.dimensions as Dimensions;
    item.shippingZone = ShippingZoneCalculator.calculate(item);
    return item;
  }
}

class DigitalCartItemFactory implements CartItemFactory {
  supports(type: string): boolean { return type === 'digital'; }

  createItem(data: Record<string, unknown>): CartItem {
    const item = new DigitalCartItem();
    item.downloadUrl = data.downloadUrl as string;
    item.licenseKey = LicenseKeyGenerator.generate();
    return item;
  }
}

class CartItemFactoryRegistry {
  constructor(private factories: CartItemFactory[]) {}

  create(type: string, data: Record<string, unknown>): CartItem {
    const factory = this.factories.find(f => f.supports(type));
    if (!factory) throw new Error(`No factory for type: ${type}`);
    return factory.createItem(data);
  }
}
```

---

## 5. Çapraz Kesen Kaygılar (Cross-Cutting Concerns)

Logging, yetkilendirme, hata izleme gibi kaygılar iş mantığına karışmamalıdır.

```typescript
// KÖTÜ – loglama iş mantığıyla iç içe
class ProductService {
  async getProduct(id: string): Promise<Product> {
    console.log(`[INFO] getProduct called with id=${id}`);
    const start = Date.now();
    try {
      const product = await this.repo.findById(id);
      console.log(`[INFO] getProduct success (${Date.now() - start}ms)`);
      return product;
    } catch (error) {
      console.error(`[ERROR] getProduct failed: ${error}`);
      throw error;
    }
  }
}

// İYİ – dekoratör / higher-order function ile ayrıştırma
function withLogging<T extends object>(service: T, logger: Logger): T {
  return new Proxy(service, {
    get(target, property: string) {
      const original = (target as Record<string, unknown>)[property];
      if (typeof original !== 'function') return original;

      return async (...args: unknown[]) => {
        logger.log(`${property} called with ${JSON.stringify(args)}`);
        const start = Date.now();
        try {
          const result = await (original as Function).apply(target, args);
          logger.log(`${property} completed in ${Date.now() - start}ms`);
          return result;
        } catch (error) {
          logger.log(`${property} failed: ${error}`, 'error');
          throw error;
        }
      };
    },
  });
}

// İş mantığı temiz kalıyor
class ProductService {
  async getProduct(id: string): Promise<Product> {
    const product = await this.repo.findById(id);
    if (!product) throw new NotFoundError(`Product not found: ${id}`);
    return product;
  }
}

// Composition root'ta bir araya getiriliyor
const rawService     = new ProductService(repo);
const loggedService  = withLogging(rawService, logger);
```

---

## 6. React'ta Sistem Mimarisi Katmanları

```
src/
├── main.tsx                # Composition root – tüm bağımlılıklar burada kurulur
├── store/                  # Redux store – uygulama durumu
│   ├── index.ts
│   └── slices/             # Feature-based slice'lar
├── services/               # Dış dünya ile iletişim (API, storage)
│   ├── api/
│   └── storage/
├── domain/                 # Saf iş mantığı (framework bağımlılığı yok)
│   ├── entities/
│   └── valueObjects/
├── pages/                  # Route düzeyinde bileşenler
├── components/             # Yeniden kullanılabilir UI bileşenleri
└── hooks/                  # Çapraz kesen UI mantığı
```

```typescript
// src/main.tsx – Composition root
import { ApiClient }      from './services/api/ApiClient';
import { ProductService } from './services/ProductService';

const apiClient = new ApiClient(import.meta.env.VITE_API_URL);
export const productService = new ProductService(apiClient);

// Hook üzerinden servise erişim (DI yerine singleton export)
export function useProductService() {
  return productService;
}
```

---

## 7. Alan Özgü Dil (DSL) Tasarımı

Okunabilir API'lar DSL yaklaşımıyla inşa edilebilir.

```typescript
// Fluent/Builder DSL ile okunabilir sorgu
const results = await ProductQuery
  .withCategory('electronics')
  .priceRange({ min: 100, max: 500 })
  .inStock()
  .sortBy('price', 'asc')
  .limit(20)
  .execute();

// Implementasyon
class ProductQuery {
  private params: QueryParams = {};

  static withCategory(category: string): ProductQuery {
    return new ProductQuery().withCategory(category);
  }

  withCategory(category: string): this {
    this.params.category = category;
    return this;
  }

  priceRange(range: { min: number; max: number }): this {
    this.params.minPrice = range.min;
    this.params.maxPrice = range.max;
    return this;
  }

  inStock(): this {
    this.params.inStock = true;
    return this;
  }

  sortBy(field: string, direction: 'asc' | 'desc'): this {
    this.params.sortField     = field;
    this.params.sortDirection = direction;
    return this;
  }

  limit(count: number): this {
    this.params.limit = count;
    return this;
  }

  async execute(): Promise<Product[]> {
    return productRepository.findAll(this.params);
  }
}
```

---

## 8. Özet Kural Tablosu

| # | Kural |
|---|-------|
| 1 | İnşa ve kullanım ayrı: nesne oluşturma composition root'ta |
| 2 | DI ile somut bağımlılıktan kaçın, arayüze bağımlı ol |
| 3 | Karmaşık nesne yaratma → fabrika deseni |
| 4 | Loglama / auth / tracing → cross-cutting concern olarak izole et |
| 5 | Sistem mimarisini katmanlara böl: domain / services / UI |
| 6 | DSL API'lar okunabilirliği artırır |
| 7 | Test ortamı için mock dependency'ler composition root'ta enjekte et |
