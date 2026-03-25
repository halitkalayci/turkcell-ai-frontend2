---
name: generate-component
description: React uygulamalarında kurumsal standartlara uygun component oluşturma işlemini yaparken bu yetenek devreye girer.
---

# Skill: generate-component

Bu skill, React + TypeScript projesinde kurumsal standartlara uygun component üretimini yönetir.
Aşağıdaki adımları sırayla uygula. Hiçbir adımı atlamadan tamamla.

---

## ADIM 1 — ÖNCE PLANLA

Component kodu üretmeden önce aşağıdaki tabloyu kullanıcıya sun ve onay al:

| # | Karar | Açıklama |
|---|-------|----------|
| 1 | Component adı | PascalCase. Örn: `ProductCard` |
| 2 | Konum | `src/components/<ComponentName>/` |
| 3 | Tip | UI / Layout / Page / Form / Feature |
| 4 | Props var mı? | Evet → interface tanımla. Hayır → props yok |
| 5 | State var mı? | Evet → `useState` veya custom hook |
| 6 | Stil yaklaşımı | CSS Module / Inline / TailwindCSS |
| 7 | Alt componentler | Varsa ayrı dosyaya ayır |

> **KURAL:** Kullanıcı planı onaylamadan implementasyona başlama.

---

## ADIM 2 — DOSYA YAPISI

Her component için klasör bazlı yapı kullan:

```
src/
└── components/
    └── ProductCard/
        ├── ProductCard.tsx        ← Ana component
        ├── ProductCard.types.ts   ← Prop & tip tanımları (opsiyonel, büyük componentlerde)
        ├── ProductCard.module.css ← Stil (CSS Module kullanılıyorsa)
        └── index.ts               ← Barrel export
```

**Kurallar:**

- Klasör adı = Component adı (PascalCase)
- Ana dosya adı = Component adı (PascalCase) + `.tsx`
- Her klasörde mutlaka `index.ts` barrel export olmalı
- Ortak/paylaşımlı tipler varsa `src/types/` altına taşı
- Sayfa bileşenleri `src/pages/` altında olmalı; `src/components/` ile karıştırma

---

## ADIM 3 — COMPONENT ŞABLONları

### 3.1 Temel Fonksiyonel Component (Props yok)

```tsx
// src/components/LoadingSpinner/LoadingSpinner.tsx

const LoadingSpinner = () => {
  return (
    <div role="status" aria-label="Yükleniyor">
      <span>Yükleniyor...</span>
    </div>
  );
};

export default LoadingSpinner;
```

### 3.2 Props'lu Component

```tsx
// src/components/ProductCard/ProductCard.tsx

interface ProductCardProps {
  id: number;
  title: string;
  price: number;
  imageUrl?: string;           // Opsiyonel prop'lar ? ile işaretle
  onAddToCart: (id: number) => void;
}

const ProductCard = ({
  id,
  title,
  price,
  imageUrl,
  onAddToCart,
}: ProductCardProps) => {
  const handleClick = () => {
    onAddToCart(id);
  };

  return (
    <article>
      {imageUrl && (
        <img src={imageUrl} alt={title} loading="lazy" />
      )}
      <h3>{title}</h3>
      <p>{price} ₺</p>
      <button type="button" onClick={handleClick}>
        Sepete Ekle
      </button>
    </article>
  );
};

export default ProductCard;
```

### 3.3 State'li Component

```tsx
// src/components/Counter/Counter.tsx

interface CounterProps {
  initialValue?: number;
  min?: number;
  max?: number;
}

const Counter = ({ initialValue = 0, min = 0, max = 99 }: CounterProps) => {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount((prev) => Math.min(prev + 1, max));
  const decrement = () => setCount((prev) => Math.max(prev - 1, min));

  return (
    <div>
      <button type="button" onClick={decrement} aria-label="Azalt">-</button>
      <span aria-live="polite">{count}</span>
      <button type="button" onClick={increment} aria-label="Artır">+</button>
    </div>
  );
};

export default Counter;
```

### 3.4 Liste Render Eden Component

```tsx
// src/components/ProductList/ProductList.tsx

interface Product {
  id: number;
  title: string;
  price: number;
}

interface ProductListProps {
  products: Product[];
  isLoading?: boolean;
}

const ProductList = ({ products, isLoading = false }: ProductListProps) => {
  if (isLoading) return <LoadingSpinner />;
  if (products.length === 0) return <p>Ürün bulunamadı.</p>;

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard {...product} onAddToCart={() => {}} />
        </li>
      ))}
    </ul>
  );
};

export default ProductList;
```

### 3.5 Form Component

```tsx
// src/components/LoginForm/LoginForm.tsx

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  isLoading?: boolean;
}

const LoginForm = ({ onSubmit, isLoading = false }: LoginFormProps) => {
  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="email">E-posta</label>
      <input
        id="email"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        autoComplete="email"
        required
      />

      <label htmlFor="password">Şifre</label>
      <input
        id="password"
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        autoComplete="current-password"
        required
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
    </form>
  );
};

export default LoginForm;
```

---

## ADIM 4 — TİP KURALLARI

```ts
// ✅ DOĞRU — interface ile prop tanımı
interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  onClick?: () => void;
}

// ❌ YANLIŞ — inline type veya any kullanma
const Button = ({ label, variant }: { label: string; variant: any }) => {};

// ✅ DOĞRU — event tipleri
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {};
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {};
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {};

// ✅ DOĞRU — children tipi
interface WrapperProps {
  children: React.ReactNode;
}

// ✅ DOĞRU — async event handler tipi
const handleFetch = async (): Promise<void> => {};
```

**Kurallar:**

- `any` kullanımı yasak; bilinmeyen tipler için `unknown` kullan
- Prop interface'i component adı + `Props` suffix'i ile adlandır (ör: `ButtonProps`)
- Opsiyonel prop'lar `?` ile işaretle ve default value ver
- Event handler isimleri `handle` prefix'i ile başlar (ör: `handleClick`, `handleChange`)
- Callback prop isimleri `on` prefix'i ile başlar (ör: `onClick`, `onSubmit`)

---

## ADIM 5 — STATE VE HOOKS KURALLARI

```tsx
// ✅ DOĞRU — tip belirli state
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Product[]>([]);

// ✅ DOĞRU — derived state hesaplaması (useMemo)
const total = useMemo(
  () => items.reduce((sum, item) => sum + item.price, 0),
  [items]
);

// ✅ DOĞRU — callback memoization (useCallback) — sadece referans istikrarı gerektiğinde
const handleReset = useCallback(() => setCount(0), []);
```

**Kurallar:**

- Her `useEffect` için mutlaka dependency array yaz; boş bırakma (`[]` geçerliyse açıkça yaz)
- `useEffect` içinde async fonksiyon kullanmak gerekiyorsa inside tanımla:
  ```tsx
  useEffect(() => {
    const fetchData = async () => { /* ... */ };
    fetchData();
  }, [id]);
  ```
- Aynı logic 2+ componentte tekrarlanıyorsa custom hook'a taşı → `src/hooks/use<Name>.ts`
- `useMemo` / `useCallback` varsayılan olarak ekleme; sadece profil edilmiş performans sorunlarında kullan

---

## ADIM 6 — BARREL EXPORT (index.ts)

Her component klasöründe `index.ts` oluştur:

```ts
// src/components/ProductCard/index.ts
export { default } from "./ProductCard";
export type { ProductCardProps } from "./ProductCard";  // tipi export ediyorsan
```

Uygulama genelinde import böyle görünmeli:

```tsx
// ✅ DOĞRU
import ProductCard from "@/components/ProductCard";

// ❌ YANLIŞ
import ProductCard from "@/components/ProductCard/ProductCard";
```

---

## ADIM 7 — ERİŞİLEBİLİRLİK (A11Y) KURALLARI

Her component'te şunları kontrol et:

- Etkileşimli elementler (`button`, `a`, `input`) semantik HTML tag kullan
- `div`/`span` üzerine `onClick` eklemek yerine `button` kullan
- Her `img` için `alt` attribute zorunlu
- Form alanları için `label` + `htmlFor` + `id` üçlüsü zorunlu
- Durum değişiklikleri için `aria-live` kullan
- Yükleme durumlarında `role="status"` ekle
- Renk tek başına bilgi taşımamalı (metin veya icon eşliğinde kullan)

---

## ADIM 8 — KALİTE KONTROL LİSTESİ

Component üretimi tamamlanmadan önce aşağıdaki her maddeyi kontrol et:

- [ ] TypeScript — `any` yok, tüm prop'lar tipli
- [ ] Props interface `<ComponentName>Props` adlandırması
- [ ] Opsiyonel prop'lara default value verilmiş
- [ ] Event handler'lar `handle` prefix'i ile başlıyor
- [ ] Callback prop'lar `on` prefix'i ile başlıyor
- [ ] Semantik HTML etiketleri kullanılmış
- [ ] `img` tag'leri `alt` attribute içeriyor
- [ ] Form alanları `label` ile ilişkilendirilmiş
- [ ] `useEffect` dependency array tanımlanmış
- [ ] Barrel `index.ts` oluşturulmuş
- [ ] Dosya `src/components/<Name>/` yapısına uygun
- [ ] Gereksiz `console.log` yok
- [ ] `default export` mevcut

---

## REFERANS — DOSYA OLUŞTURMA SIRASI

1. `src/components/<Name>/<Name>.tsx` — Ana component
2. `src/components/<Name>/<Name>.module.css` — Stil (gerekiyorsa)
3. `src/components/<Name>/<Name>.types.ts` — Büyük/paylaşımlı tipler (gerekiyorsa)
4. `src/components/<Name>/index.ts` — Barrel export

> Sırayı değiştirme. Barrel export her zaman en son oluşturulur.

---

## YASAKLAR (ZORUNLU UYMA)

| Yasak | Gerekçe |
|-------|---------|
| `any` tipi | Tip güvenliğini yok eder |
| Class component | Proje functional component kullanır |
| Default export olmayan component | Tree-shaking ve lazy load için gerekli |
| `useEffect` dependency array eksik | Stale closure ve sonsuz döngü riski |
| `div` üzerine `onClick` | Erişilebilirlik ihlali |
| Inline anonim fonksiyon prop'u (performans kritik yerlerde) | Gereksiz re-render |
| Magic number/string | Named constant kullan |