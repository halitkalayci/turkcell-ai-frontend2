---
name: state-management
description: React + TypeScript projesinde Redux Toolkit kullanarak global state yönetimi yapılırken bu yetenek devreye girer. Store kurulumu, slice oluşturma, async thunk ve selector yazımını kapsar.
---

# Skill: state-management

Bu skill, React + TypeScript projesinde **Redux Toolkit** ile kurumsal standartlara uygun global state yönetimini yönetir.
Aşağıdaki adımları sırayla uygula. Hiçbir adımı atlamadan tamamla.

---

## ADIM 1 — ÖNCE PLANLA

Kod üretmeden önce aşağıdaki tabloyu kullanıcıya sun ve onay al:

| # | Karar | Açıklama |
|---|-------|----------|
| 1 | Slice adı | camelCase, domain odaklı. Örn: `cart`, `auth`, `product` |
| 2 | State shape | Tutulacak veriler ve başlangıç değerleri |
| 3 | Async işlem var mı? | Evet → `createAsyncThunk` kullan. Hayır → sadece `reducers` yeterli |
| 4 | API kaynağı | Async varsa: endpoint URL ve method (GET/POST/PUT/DELETE) |
| 5 | Loading/error state | Async varsa: `isLoading`, `error` alanları state'e eklenir |
| 6 | Selector gereksinimi | Hangi veriler bileşenlerden okunacak? |
| 7 | Mevcut slice'larla bağımlılık | Başka slice'lardan veri okunacak mı? |

> **KURAL:** Kullanıcı planı onaylamadan implementasyona başlama.

---

## ADIM 2 — BAĞIMLILIK KURULUMU

Redux Toolkit projede yoksa aşağıdaki paketleri ekle:

```bash
npm install @reduxjs/toolkit react-redux
```

**Tip tanımları için ek paket gerekmez** — Redux Toolkit TypeScript desteğini yerleşik olarak sağlar.

---

## ADIM 3 — DOSYA YAPISI

```
src/
└── store/
    ├── index.ts                    ← Store konfigürasyonu + tip dışa aktarımları
    ├── hooks.ts                    ← Tipli useAppDispatch / useAppSelector
    └── slices/
        └── cartSlice/
            ├── cartSlice.ts        ← Slice tanımı (state, reducers, thunks)
            ├── cartSlice.types.ts  ← Slice'a özel tip tanımları
            ├── cartSlice.selectors.ts ← Selector fonksiyonları
            └── index.ts            ← Barrel export
```

**Kurallar:**

- Store konfigürasyonu her zaman `src/store/index.ts` içinde olur
- Her slice kendi klasöründe yaşar: `src/store/slices/<sliceName>/`
- Selector'lar ayrı dosyaya çıkarılır: `<sliceName>.selectors.ts`
- Tip tanımları büyüdükçe `<sliceName>.types.ts` dosyasına taşınır
- Barrel export (`index.ts`) her slice klasöründe zorunludur

---

## ADIM 4 — ŞABLONLAR

### 4.1 Store Konfigürasyonu

```ts
// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    // Yeni slice'lar buraya eklenir
  },
});

// Tipli RootState ve AppDispatch — tüm projede bu tipler kullanılır
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 4.2 Tipli Hook'lar

```ts
// src/store/hooks.ts
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// ❌ useDispatch / useSelector doğrudan kullanma
// ✅ Her zaman bu tipli versiyonları kullan
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
```

### 4.3 Temel Slice (Async Yok)

```ts
// src/store/slices/cartSlice/cartSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
```

### 4.4 Async Thunk'lu Slice

```ts
// src/store/slices/productSlice/productSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface Product {
  id: number;
  title: string;
  price: number;
}

interface ProductState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  isLoading: false,
  error: null,
};

// Thunk isimlendirme: "<sliceName>/<actionName>"
export const fetchProducts = createAsyncThunk<Product[]>(
  "product/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Ürünler yüklenemedi.");
      return (await response.json()) as Product[];
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string ?? "Beklenmeyen bir hata oluştu.";
      });
  },
});

export default productSlice.reducer;
```

### 4.5 Selector Dosyası

```ts
// src/store/slices/cartSlice/cartSlice.selectors.ts
import type { RootState } from "../../index";

// Basit selector
export const selectCartItems = (state: RootState) => state.cart.items;

// Türetilmiş (derived) selector — hesaplama gerektiriyorsa
export const selectCartTotal = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const selectCartItemCount = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
```

### 4.6 Barrel Export

```ts
// src/store/slices/cartSlice/index.ts
export { addItem, removeItem, clearCart } from "./cartSlice";
export {
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
} from "./cartSlice.selectors";
export { default } from "./cartSlice";
```

### 4.7 Provider Kurulumu (main.tsx)

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
```

### 4.8 Bileşenden Kullanım

```tsx
// src/components/CartButton/CartButton.tsx
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addItem } from "../../store/slices/cartSlice";
import { selectCartItemCount } from "../../store/slices/cartSlice";

const CartButton = () => {
  const dispatch = useAppDispatch();
  const itemCount = useAppSelector(selectCartItemCount);

  const handleAddToCart = () => {
    dispatch(addItem({ id: 1, title: "Örnek Ürün", price: 99, quantity: 1 }));
  };

  return (
    <button type="button" onClick={handleAddToCart}>
      Sepet ({itemCount})
    </button>
  );
};

export default CartButton;
```

---

## ADIM 5 — TİP KURALLARI

```ts
// ✅ DOĞRU — PayloadAction ile tip güvenli reducer
reducers: {
  setUser(state, action: PayloadAction<User>) { ... }
}

// ✅ DOĞRU — createAsyncThunk için tip parametreleri
// createAsyncThunk<ReturnType, ArgType, ThunkApiConfig>
export const fetchUser = createAsyncThunk<User, number>(
  "auth/fetchUser",
  async (userId, { rejectWithValue }) => { ... }
);

// ❌ YANLIŞ — any kullanımı
export const fetchUser = createAsyncThunk("auth/fetchUser", async (id: any) => { ... });

// ✅ DOĞRU — RootState ile tipli selector
export const selectUser = (state: RootState) => state.auth.user;

// ❌ YANLIŞ — doğrudan useSelector (tipsiz)
const user = useSelector((state: any) => state.auth.user);
```

---

## ADIM 6 — KURALLAR VE YASAKLAR

### Zorunlu Kurallar

- `useDispatch` ve `useSelector` doğrudan **kullanılamaz** → Her zaman `useAppDispatch` / `useAppSelector` kullan
- `any` tip kullanımı **yasaktır**
- Async işlemler **sadece** `createAsyncThunk` ile yapılır; reducer içinde `async` olmaz
- State **doğrudan mutate edilmez** — Immer sayesinde `state.x = y` sözdizimi güvenli, ancak yeni nesne döndürme karıştırılmaz
- Selector'lar **bileşen içinde tanımlanmaz**; her zaman ayrı dosyadan import edilir
- `store.dispatch` doğrudan bileşenden **çağrılmaz**

### Adlandırma Kuralları

| Öğe | Kural | Örnek |
|-----|-------|-------|
| Slice adı | camelCase | `cartSlice`, `authSlice` |
| Action isimleri | camelCase fiil | `addItem`, `setUser`, `clearCart` |
| Thunk isimleri | `fetch/create/update/delete` + subject | `fetchProducts`, `createOrder` |
| Selector isimleri | `select` prefix | `selectCartItems`, `selectIsLoading` |
| State alanları | camelCase | `isLoading`, `error`, `items` |

### Loading/Error State Standardı

Async içeren her slice'ta bu üç alan zorunludur:

```ts
interface AsyncSliceState {
  isLoading: boolean;   // ✅ boolean — "loading" değil
  error: string | null; // ✅ null başlangıç değeri
  // ...diğer alanlar
}
```
