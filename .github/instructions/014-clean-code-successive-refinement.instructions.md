---
description: >
  Robert Martin – Clean Code, Chapter 14: Successive Refinement.
  Yinelemeli iyileştirme disiplini: önce çalıştır, sonra temizle, asla ilk pasoda bırakma.
applyTo: "**"
---

# Chapter 14 – Successive Refinement

## 1. Temel Prensip

> "It is not enough to write code that works. Code that works is not necessarily clean code. For code to be clean, it must be continuously refined."

Programlama el sanatıdır; taslaktan başlanır, her geçişte iyileştirilir. **İyi kod ilk seferinde çıkmaz.**

---

## 2. Süreç: Kirli → Yeşil → Temiz

```
1. Çalışan (ama kirli) kod yaz   → testleri geçiyor
2. Test kapsamını genişlet        → her senaryo kapsanıyor
3. Extract Method                 → büyük fonksiyonları böl
4. Rename                         → niyeti açık hâle getir
5. Remove Duplication             → DRY ilkesini uygula
6. Reorganize                     → sınıf yapısını düzelt
7. Testleri yeniden çalıştır      → her adımda yeşil kalmak zorunlu
```

---

## 3. Adım Adım Refinement Örneği

### 3.1 – Ham (İlk Çalışan) Kod

```typescript
// İlk geçiş – sadece çalışıyor, temiz değil
function parseArgs(args: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg.startsWith('-')) {
      const flag = arg.slice(1);
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        i++;
        const val = args[i];
        if (val === 'true' || val === 'false') {
          result[flag] = val === 'true';
        } else if (!isNaN(Number(val))) {
          result[flag] = Number(val);
        } else {
          result[flag] = val;
        }
      } else {
        result[flag] = true;
      }
    }
    i++;
  }
  return result;
}
```

### 3.2 – Testler Yaz (Yeşil'i Koru)

```typescript
describe('parseArgs', () => {
  it('parses boolean flag', () => {
    expect(parseArgs(['-v'])).toEqual({ v: true });
  });

  it('parses string argument', () => {
    expect(parseArgs(['-name', 'Alice'])).toEqual({ name: 'Alice' });
  });

  it('parses numeric argument', () => {
    expect(parseArgs(['-port', '3000'])).toEqual({ port: 3000 });
  });

  it('parses explicit boolean value', () => {
    expect(parseArgs(['-debug', 'true'])).toEqual({ debug: true });
    expect(parseArgs(['-debug', 'false'])).toEqual({ debug: false });
  });

  it('parses multiple flags', () => {
    expect(parseArgs(['-v', '-port', '8080', '-name', 'App'])).toEqual({
      v: true, port: 8080, name: 'App',
    });
  });
});
```

### 3.3 – Extract Method (Metot Ayır)

```typescript
function parseArgs(args: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let i = 0;

  while (i < args.length) {
    if (isFlag(args[i])) {
      const { flag, value, advance } = extractFlagAndValue(args, i);
      result[flag] = value;
      i += advance;
    }
    i++;
  }

  return result;
}

function isFlag(arg: string): boolean {
  return arg.startsWith('-');
}

function extractFlagAndValue(
  args: string[],
  index: number,
): { flag: string; value: unknown; advance: number } {
  const flag = args[index].slice(1);
  const hasValue = index + 1 < args.length && !isFlag(args[index + 1]);

  if (!hasValue) {
    return { flag, value: true, advance: 0 };
  }

  return {
    flag,
    value: parseValue(args[index + 1]),
    advance: 1,
  };
}

function parseValue(raw: string): unknown {
  if (raw === 'true')  return true;
  if (raw === 'false') return false;
  if (!isNaN(Number(raw))) return Number(raw);
  return raw;
}
```

### 3.4 – Sınıfa Dönüştür + Tip Güvenliği Ekle

```typescript
type ArgValue = string | number | boolean;

interface ParsedArgs {
  get<T extends ArgValue>(flag: string): T | undefined;
  has(flag: string): boolean;
  getOrDefault<T extends ArgValue>(flag: string, defaultValue: T): T;
}

class ArgsParser implements ParsedArgs {
  private values = new Map<string, ArgValue>();

  static parse(args: string[]): ArgsParser {
    const parser = new ArgsParser();
    parser.processArgs(args);
    return parser;
  }

  private processArgs(args: string[]): void {
    for (let i = 0; i < args.length; i++) {
      if (!this.isFlag(args[i])) continue;

      const flag     = this.extractFlag(args[i]);
      const hasValue = this.hasNextValue(args, i);

      if (hasValue) {
        this.values.set(flag, this.parseValue(args[++i]));
      } else {
        this.values.set(flag, true);
      }
    }
  }

  private isFlag(arg: string): boolean {
    return arg.startsWith('-') && arg.length > 1;
  }

  private extractFlag(arg: string): string {
    return arg.slice(1);
  }

  private hasNextValue(args: string[], index: number): boolean {
    return index + 1 < args.length && !this.isFlag(args[index + 1]);
  }

  private parseValue(raw: string): ArgValue {
    if (raw === 'true')  return true;
    if (raw === 'false') return false;
    const num = Number(raw);
    return isNaN(num) ? raw : num;
  }

  get<T extends ArgValue>(flag: string): T | undefined {
    return this.values.get(flag) as T | undefined;
  }

  has(flag: string): boolean {
    return this.values.has(flag);
  }

  getOrDefault<T extends ArgValue>(flag: string, defaultValue: T): T {
    return (this.values.get(flag) as T) ?? defaultValue;
  }
}

// Kullanım
const args = ArgsParser.parse(process.argv.slice(2));
const port = args.getOrDefault('port', 3000);
const debug = args.getOrDefault('debug', false);
```

---

## 4. Refinement Disiplini

### 4.1 Küçük Adımlar

```
// Her adımda:
// 1. Küçük değişiklik yap
// 2. Testleri çalıştır → HÂLÂ YEŞIL
// 3. Commit et ("Extract parseValue function")
// 4. Sonraki adıma geç

// YASAK:
// - Büyük yeniden yazım (big rewrite)
// - Testler kırmızıyken refactoring'e devam
// - "Sonra temizlerim" diyerek ilerleme
```

### 4.2 Boy Scout Kuralı ile Refinement

```typescript
// Bir dosyaya dokunduğunda onu bıraktığın zamankinden daha temiz bırak
// Köklü refactoring değil – küçük iyileştirmeler

// Bugün bulundu → magic number
const expiry = Date.now() + 86400000;

// Hemen düzelt
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const expiry = Date.now() + ONE_DAY_MS;

// Yarın başka biri cryptic isimleri bulur → düzelt
function calc(p: number, r: number): number {  // BUGÜN BULUNDU
  return p - p * r;
}

function applyDiscount(price: number, discountRate: number): number {  // DÜZELTİLDİ
  return price * (1 - discountRate);
}
```

---

## 5. React Component Refinement

```typescript
// İlk geçiş – çalışıyor ama ham
function ProductList({ categoryId }: { categoryId: string }) {
  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?category=${categoryId}&page=${page}`)
      .then(r => r.json())
      .then(data => {
        setProducts(data.items);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [categoryId, page]);

  // ... JSX
}

// Refinement 1 – custom hook'a çıkar
function useProductsByCategory(categoryId: string, page: number) {
  const [state, setState] = useState<{
    products: Product[];
    loading: boolean;
    error: string | null;
    totalPages: number;
  }>({ products: [], loading: false, error: null, totalPages: 0 });

  useEffect(() => {
    let cancelled = false;
    setState(s => ({ ...s, loading: true, error: null }));

    fetchProductsByCategory(categoryId, page)
      .then(data => {
        if (!cancelled) {
          setState({ products: data.items, loading: false, error: null, totalPages: data.totalPages });
        }
      })
      .catch(err => {
        if (!cancelled) {
          setState(s => ({ ...s, loading: false, error: err.message }));
        }
      });

    return () => { cancelled = true; };
  }, [categoryId, page]);

  return state;
}

// Refinement 2 – bileşen sadece UI
function ProductList({ categoryId }: { categoryId: string }) {
  const [page, setPage]                    = useState(1);
  const { products, loading, error, totalPages } = useProductsByCategory(categoryId, page);

  if (loading)  return <LoadingSpinner />;
  if (error)    return <ErrorMessage message={error} />;

  return (
    <>
      <ProductGrid products={products} />
      <Pagination current={page} total={totalPages} onChange={setPage} />
    </>
  );
}
```

---

## 6. Özet Kural Tablosu

| # | Kural |
|---|-------|
| 1 | Önce çalışan kod yaz, sonra temizle – asla ilk seferinde mükemmel değil |
| 2 | Her refinement adımında testler yeşil kalmalı |
| 3 | Küçük adımlarla ilerlev: extract → rename → deduplicate → reorganize |
| 4 | Boy Scout: dokunduğun kodu bırakırken daha temiz bırak |
| 5 | Büyük yeniden yazımdan kaç; küçük, güvenli dönüşümler tercih et |
| 6 | React: işlev ayrıştırması hook → UI bileşen |
| 7 | "Sonra temizlerim" → hiçbir zaman olmaz; şimdi temizle |
