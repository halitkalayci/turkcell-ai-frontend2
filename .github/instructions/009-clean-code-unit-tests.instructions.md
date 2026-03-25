---
description: >
  Robert Martin – Clean Code, Chapter 9: Unit Tests.
  Temiz test yazma prensiplerini, TDD'nin üç yasasını ve F.I.R.S.T. kurallarını açıklar.
applyTo: "**"
---

# Chapter 9 – Unit Tests

## 1. Temel Prensip

> "Test code is just as important as production code. It requires thought, design, and care."

Kirli testler, başka bir şey yoktan daha kötüdür. Test kodu üretim kodu kadar özenle yazılır.

---

## 2. TDD'nin Üç Yasası

1. **Yasak**: Başarısız bir test geçecek kadar üretim kodu yazmadan YENİ test yazma.
2. **Yasak**: Derlemeyi bozan düzey dahil — başarısız olan testten fazlasını yazma.
3. **Yasak**: Yalnızca başarısız bir testi geçirecek kadar üretim kodu yaz; fazlasını değil.

```
Red → Green → Refactor döngüsü
1. Önce başarısız test yaz  (Red)
2. Testi geçecek minimum kodu yaz  (Green)
3. Temizle  (Refactor)
```

---

## 3. Temiz Test

Test, tek şeyi test etmeli ve okunması kolay olmalıdır.

### Test Yapısı: Arrange-Act-Assert (AAA / Given-When-Then)

```typescript
// KÖTÜ – düzensiz, ne test edildiği belirsiz
test('product', () => {
  const repo = new ProductRepository();
  const p = { id: '1', name: 'Laptop', price: 1000, stock: 5 };
  repo.add(p);
  const found = repo.findById('1');
  expect(found).toBeDefined();
  expect(found?.name).toBe('Laptop');
  repo.add({ id: '2', name: 'Phone', price: 500, stock: 0 });
  const inStock = repo.findInStock();
  expect(inStock.length).toBe(1);
});

// İYİ – her test tek şey, AAA yapısı açık
describe('ProductRepository', () => {
  describe('findById', () => {
    it('should return product when id exists', () => {
      // Arrange
      const repo = new ProductRepository();
      const product: Product = { id: '1', name: 'Laptop', price: 1000, stock: 5 };
      repo.add(product);

      // Act
      const result = repo.findById('1');

      // Assert
      expect(result).toEqual(product);
    });

    it('should return undefined when id does not exist', () => {
      const repo = new ProductRepository();
      expect(repo.findById('unknown')).toBeUndefined();
    });
  });

  describe('findInStock', () => {
    it('should return only products with stock greater than zero', () => {
      // Arrange
      const repo = new ProductRepository();
      repo.add({ id: '1', name: 'Laptop', price: 1000, stock: 5 });
      repo.add({ id: '2', name: 'Phone', price: 500, stock: 0 });

      // Act
      const result = repo.findInStock();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });
});
```

---

## 4. Test Başına Tek Kavram (One Assert / One Concept)

```typescript
// KÖTÜ – birden fazla kavram tek testte
it('addItem should update cart', () => {
  const cart = new Cart();
  cart.addItem({ productId: 'p1', quantity: 2, price: 50 });

  expect(cart.items).toHaveLength(1);           // kavram 1: item var mı
  expect(cart.totalPrice).toBe(100);            // kavram 2: fiyat hesabı
  expect(cart.lastModified).toBeInstanceOf(Date); // kavram 3: zaman damgası

  cart.addItem({ productId: 'p1', quantity: 1, price: 50 });
  expect(cart.items).toHaveLength(1);           // kavram 4: aynı ürün birleşir mi
  expect(cart.totalPrice).toBe(150);            // kavram 5: yeni fiyat
});

// İYİ – her test tek kavram
describe('Cart.addItem', () => {
  it('should add new item to empty cart', () => {
    const cart = new Cart();
    cart.addItem({ productId: 'p1', quantity: 2, price: 50 });
    expect(cart.items).toHaveLength(1);
  });

  it('should calculate total price correctly', () => {
    const cart = new Cart();
    cart.addItem({ productId: 'p1', quantity: 2, price: 50 });
    expect(cart.totalPrice).toBe(100);
  });

  it('should merge quantities when same product added twice', () => {
    const cart = new Cart();
    cart.addItem({ productId: 'p1', quantity: 2, price: 50 });
    cart.addItem({ productId: 'p1', quantity: 1, price: 50 });
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(3);
  });
});
```

---

## 5. F.I.R.S.T. Prensipleri

### Fast (Hızlı)

Testler milisaniyeler içinde çalışmalı; yavaş testler çalıştırılmaz.

```typescript
// KÖTÜ – gerçek HTTP çağrısı (yavaş, güvenilmez)
it('should fetch products', async () => {
  const products = await fetch('https://api.example.com/products');
  expect(products).toBeDefined();
});

// İYİ – mock ile hızlı
it('should fetch products', async () => {
  const mockFetch = jest.fn().mockResolvedValue({ items: [] });
  const service = new ProductService(mockFetch);
  const products = await service.getAll();
  expect(products).toEqual([]);
});
```

### Independent (Bağımsız)

Testler sıralı çalışmak zorunda kalmamalı; herhangi bir sırada, hatta tek tek çalışabilmeli.

```typescript
// KÖTÜ – test 2, test 1'in çalışmasına bağlı (paylaşılan state)
let sharedCart: Cart;

it('test 1: initialize cart', () => {
  sharedCart = new Cart();
  sharedCart.addItem({ productId: 'p1', quantity: 1, price: 10 });
});

it('test 2: remove item from cart', () => {
  // sharedCart test 1'den geliyor — bağımlılık!
  sharedCart.removeItem('p1');
  expect(sharedCart.items).toHaveLength(0);
});

// İYİ – her test kendi setup'ını yapar
describe('Cart', () => {
  let cart: Cart;

  beforeEach(() => {
    cart = new Cart();  // her test için temiz state
  });

  it('should add item', () => {
    cart.addItem({ productId: 'p1', quantity: 1, price: 10 });
    expect(cart.items).toHaveLength(1);
  });

  it('should remove item', () => {
    cart.addItem({ productId: 'p1', quantity: 1, price: 10 });
    cart.removeItem('p1');
    expect(cart.items).toHaveLength(0);
  });
});
```

### Repeatable (Tekrarlanabilir)

Test her ortamda aynı sonucu vermeli (CI, lokal, prod).

```typescript
// KÖTÜ – sisteme bağlı (tarih/saat)
it('should be within business hours', () => {
  const now = new Date();
  expect(isBusinessHour(now)).toBe(true);  // lokal saate bağlı → güvenilmez
});

// İYİ – saati inject et
it('should recognize business hour', () => {
  const noonMonday = new Date('2024-01-15T12:00:00');  // sabit
  expect(isBusinessHour(noonMonday)).toBe(true);
});

it('should recognize non-business hour', () => {
  const midnightMonday = new Date('2024-01-15T02:00:00');
  expect(isBusinessHour(midnightMonday)).toBe(false);
});
```

### Self-Validating (Kendi Kendini Doğrulayan)

Test pass/fail sinyali vermelidir; log okuma ya da manuel kontrol gerekmemeli.

```typescript
// KÖTÜ – test her zaman geçer, konsol çıktısına bakman gerekir
it('should process order', () => {
  const result = processOrder(mockOrder);
  console.log('Result:', result);  // ← manuel kontrol
});

// İYİ
it('should process order and return transaction id', () => {
  const result = processOrder(mockOrder);
  expect(result.transactionId).toMatch(/^TXN-\d+$/);
  expect(result.status).toBe('completed');
});
```

### Timely (Zamanında)

Test, üretim kodundan ÖNCE yazılmalı. Eski koda sonradan test yazmak zordur.

---

## 6. Domain-Specific Test Dili

Test kodu okunması için yardımcı metotlar içerebilir.

```typescript
// Test yardımcıları (test factory, builder)
function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'test-id',
    name: 'Test Product',
    price: 100,
    stock: 10,
    categoryId: 'cat-1',
    ...overrides,
  };
}

// Test çok daha okunur hale gelir
it('should not add out-of-stock product to cart', () => {
  const cart = new Cart();
  const outOfStockProduct = createProduct({ stock: 0 });

  expect(() => cart.addProduct(outOfStockProduct)).toThrow(OutOfStockError);
});
```

---

## 7. React Component Testleri

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

describe('ProductCard', () => {
  it('should display product name and price', () => {
    // Arrange
    const product = createProduct({ name: 'Laptop', price: 1500 });

    // Act
    render(<ProductCard product={product} />);

    // Assert
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('$1500.00')).toBeInTheDocument();
  });

  it('should call onAddToCart when button clicked', () => {
    const product = createProduct();
    const handleAdd = jest.fn();

    render(<ProductCard product={product} onAddToCart={handleAdd} />);
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));

    expect(handleAdd).toHaveBeenCalledWith(product.id);
    expect(handleAdd).toHaveBeenCalledTimes(1);
  });
});
```

---

## 8. Özet Kural Tablosu

| # | Kural |
|---|-------|
| 1 | Test kodu üretim kodu kadar özenle yazılır |
| 2 | TDD: önce kırmızı test, sonra yeşil, sonra refactor |
| 3 | Her test tek bir kavramı test eder |
| 4 | Arrange-Act-Assert (AAA) yapısı kullan |
| 5 | F: Fast – testler milisaniyeler içinde çalışmalı |
| 6 | I: Independent – testler birbirine bağımlı olmamalı |
| 7 | R: Repeatable – her ortamda aynı sonuç |
| 8 | S: Self-Validating – pass/fail otomatik belli olmalı |
| 9 | T: Timely – test üretim kodundan önce yazılmalı |
| 10 | Test factory/builder yardımcılarıyla okunurluk artır |
