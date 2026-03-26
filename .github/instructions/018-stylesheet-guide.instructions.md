---
description: Bu dosya global olarak bu projedeki tüm stillendirme kurallarını içerir.
applyTo: '**/*.tsx, **/*.html, **/*.css, **/*.scss'
---

# Stylesheet Guide

---

## 1) GENEL UI PRENSİPLERİ

Bütün UI yapıları aşağıdaki kuralları uygulamak zorundadır.

- Temiz ve minimal tasarım
- Tutarlı boşluklandırma (spacing scale)
- Tutarlı tipografi (font scale)
- Tekrar kullanılabilir component mantığı
- **Inline styling kesinlikle yasaktır** — tüm stiller CSS Modules içinde tanımlanır.
- Her component kendi `ComponentName.module.css` dosyasına sahip olmalıdır.

---

## 2) RENK PALETİ (Color Palette)

Projede aşağıdaki renk token'ları kullanılır. Bunların dışında rastgele hex değer kullanılmamalıdır.

### Ana Renkler (Brand)

| Token              | Değer       | Kullanım                          |
|---------------------|-------------|-----------------------------------|
| `--color-primary`   | `#1a1a2e`  | Navbar, birincil butonlar, vurgu  |
| `--color-accent`    | `#ffc800`  | Badge, CTA butonları, vurgu      |

### Nötr Renkler (Neutral — Metin & Arka Plan)

| Token                     | Değer       | Kullanım                             |
|----------------------------|-------------|---------------------------------------|
| `--color-text-primary`     | `#111827`  | Ana metin, başlıklar                 |
| `--color-text-secondary`   | `#374151`  | İkincil metin, açıklama paragraflar  |
| `--color-text-muted`       | `#6b7280`  | Yardımcı metin, placeholder, alt bilgi|
| `--color-text-disabled`    | `#9ca3af`  | Devre dışı öğeler                    |
| `--color-bg-primary`       | `#ffffff`  | Sayfa ve kart arka planı             |
| `--color-bg-secondary`     | `#f9fafb`  | Alternatif arka plan, özet alanları  |
| `--color-bg-dark`          | `#1a1a2e`  | Navbar ve koyu arka plan alanları    |

### Sınır & Ayırıcı (Border)

| Token                | Değer       | Kullanım                     |
|-----------------------|-------------|-------------------------------|
| `--color-border`      | `#e5e7eb`  | Kart çerçeveleri, ayırıcılar |
| `--color-border-dark` | `#d1d5db`  | Daha belirgin kenarlıklar    |

### Durum Renkleri (Semantic)

| Token                | Değer       | Kullanım         |
|-----------------------|-------------|-------------------|
| `--color-success`     | `#16a34a`  | Başarılı işlemler |
| `--color-error`       | `#dc2626`  | Hata durumları    |
| `--color-warning`     | `#f59e0b`  | Uyarılar          |

### Gölge (Shadows)

| Token                | Değer                                | Kullanım               |
|-----------------------|--------------------------------------|-------------------------|
| `--shadow-sm`         | `0 1px 4px rgba(0, 0, 0, 0.06)`    | Hafif yüzey ayrımı     |
| `--shadow-md`         | `0 2px 12px rgba(0, 0, 0, 0.08)`   | Kart varsayılan gölgesi |
| `--shadow-lg`         | `0 8px 24px rgba(0, 0, 0, 0.12)`   | Hover ve üst katman     |

---

## 3) TİPOGRAFİ (Typography)

### Font Family

Proje genelinde **Inter** font ailesi kullanılır. Fallback olarak sistem sans-serif fontu uygulanır.

```css
font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
```

> Inter, Google Fonts üzerinden `index.html` içinde `<link>` ile yüklenir.

### Font Ölçek Tablosu (Font Scale)

Tüm font boyutları **rem** biriminde yazılır. `px` birimi font boyutu için kullanılmaz.

| Token / Kullanım     | Boyut       | Ağırlık | Kullanım Alanı                     |
|-----------------------|-------------|---------|-------------------------------------|
| Sayfa Başlığı (h1)   | `2rem`      | 700     | Sayfa ana başlığı                   |
| Bölüm Başlığı (h2)   | `1.5rem`    | 600     | Kart başlığı, bölüm başlığı        |
| Alt Başlık (h3)       | `1.25rem`   | 600     | Alt bölüm, navbar brand             |
| Gövde (body)          | `1rem`      | 400     | Paragraf, açıklama metni            |
| Küçük (small)         | `0.875rem`  | 400     | Yardımcı metin, birim fiyat, badge  |
| Çok Küçük (caption)   | `0.75rem`   | 500     | ID etiketleri, alt bilgi, disclaimer|

### Satır Yüksekliği (Line Height)

| Kullanım     | Değer  |
|--------------|--------|
| Başlıklar    | `1.3`  |
| Gövde metin  | `1.6`  |

---

## 4) BOŞLUKLANDIRMA (Spacing Scale)

Tüm `margin`, `padding`, `gap` değerleri aşağıdaki **rem tabanlı** ölçekten seçilmelidir. Keyfi `px` değerleri kullanılmamalıdır.

| Token        | Değer       | px Karşılığı (16px base) |
|--------------|-------------|---------------------------|
| `--space-1`  | `0.25rem`   | 4px                       |
| `--space-2`  | `0.5rem`    | 8px                       |
| `--space-3`  | `0.75rem`   | 12px                      |
| `--space-4`  | `1rem`      | 16px                      |
| `--space-5`  | `1.25rem`   | 20px                      |
| `--space-6`  | `1.5rem`    | 24px                      |
| `--space-8`  | `2rem`      | 32px                      |
| `--space-10` | `2.5rem`    | 40px                      |
| `--space-12` | `3rem`      | 48px                      |
| `--space-16` | `4rem`      | 64px                      |

### Kullanım Kuralları

- Spacing değerleri **yalnızca rem** biriminde yazılır.
- `px` birimine yalnızca `border-width` ve `box-shadow` gibi fiziksel piksel gerektiren değerlerde izin verilir.
- `0` değeri birimsiz yazılır: `margin: 0;`

---

## 5) KENAR YARIÇAPI (Border Radius)

| Token                  | Değer      | Kullanım                   |
|-------------------------|------------|-----------------------------|
| `--radius-sm`           | `0.25rem`  | Küçük butonlar, input'lar   |
| `--radius-md`           | `0.5rem`   | Kartlar, paneller           |
| `--radius-lg`           | `1rem`     | Büyük kartlar, hero alanları|
| `--radius-full`         | `9999px`   | Badge, avatar, pill butonlar|

---

## 6) GEÇİŞ & ANİMASYON (Transitions)

| Kullanım         | Değer                               |
|-------------------|--------------------------------------|
| Renk / arka plan  | `transition: background-color 0.2s ease` |
| Gölge / transform | `transition: box-shadow 0.2s ease, transform 0.2s ease` |
| Genel             | `transition: all 0.2s ease`         |

- Animasyon süresi **0.15s – 0.3s** aralığında tutulur.
- `ease` veya `ease-in-out` tercih edilir; `linear` yalnızca progress bar gibi yapılarda kullanılır.

---

## 7) LAYOUT & CONTAINER

| Özellik           | Değer              | Kullanım                     |
|--------------------|--------------------|-------------------------------|
| Sayfa max-width    | `1100px`           | Genel sayfa container'ı       |
| Dar içerik         | `720px`            | Form sayfaları, cart sayfası   |
| Sayfa padding      | `0 1.5rem`         | Mobil-kadar yatay padding     |
| Otomatik ortalama  | `margin: 0 auto`   | Container ortalama            |

### Grid

- Ürün listeleri için: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- Grid gap: `1.5rem` (24px)

---

## 8) BUTON STİLLERİ

### Birincil Buton (Primary)

```css
background-color: var(--color-primary);
color: #ffffff;
border: none;
border-radius: var(--radius-sm);
padding: 0.625rem 1.25rem;
font-size: 0.875rem;
font-weight: 600;
cursor: pointer;
transition: opacity 0.2s ease;
```

### İkincil Buton (Secondary / Outline)

```css
background-color: transparent;
color: var(--color-primary);
border: 1px solid var(--color-border-dark);
border-radius: var(--radius-sm);
padding: 0.625rem 1.25rem;
font-size: 0.875rem;
font-weight: 600;
cursor: pointer;
```

### Tehlike Butonu (Danger)

```css
background-color: var(--color-error);
color: #ffffff;
```

### Buton Hover / Disabled

- Hover: `opacity: 0.85` veya `filter: brightness(1.1)`
- Disabled: `opacity: 0.5; cursor: not-allowed;`

---

## 9) YASAKLAR

| Yasak                              | Neden                                   |
|------------------------------------|-----------------------------------------|
| `style={{ }}` (inline styling)     | CSS Modules ile yönetilir               |
| `!important`                       | Spesifite sorunlarına yol açar          |
| `px` birimi font-size/spacing'de   | Erişilebilirlik; rem kullan             |
| Hex renk değerini direkt kullanmak | Renk token'larından seçilmeli           |
| `*` global seçici (reset hariç)    | Performans ve öngörülebilirlik sorunu   |
| `z-index` > 100 (modal hariç)     | Katman karmaşıklığını engeller          |

---

## 10) DOSYA KONVANSIYONLARI

- Her component kendi CSS Module dosyasını taşır: `ComponentName.module.css`
- CSS sınıf isimleri **camelCase** yazılır: `.productCard`, `.itemCount`, `.emptyMessage`
- Global stiller yalnızca `src/styles/` altında bir dosyada tanımlanır (reset, CSS variables).
- CSS custom properties (design token'lar) `src/styles/` altındaki global dosyada `:root` içinde tanımlanır.

