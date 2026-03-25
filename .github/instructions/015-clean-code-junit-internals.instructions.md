---
description: >
  Robert Martin – Clean Code, Chapter 15: JUnit Internals.
  JUnit kaynak kodu üzerinden refactoring dersleri: ifade gücü, yineleme kaldırma ve extract method.
applyTo: "**"
---

# Chapter 15 – JUnit Internals

## 1. Temel Prensip

> "The Boy Scout Rule tells us we should always leave the code a little cleaner than we found it. Whether we own the code or not."

Bu bölüm, mevcut çalışan kod üzerinde yinelemeli refactoring'in nasıl yapıldığını JUnit'in `ComparisonCompactor` sınıfı üzerinden gösterir. Ders: **kötü kod birdenbire bozulmaz, biriktikçe bozulur; biriktikçe iyileştirilmezse.**

---

## 2. Şifreli Kodun İfadeye Kazandırılması

### 2.1 Cryptic Member Değişken İsimleri

```typescript
// Ham (JUnit tarzı kısaltmalar)
class ComparisonCompactor {
  private fContextLength: number;
  private fExpected: string;
  private fActual: string;
  private fPrefix: string;
  private fSuffix: string;
}

// Refactored – Hungarian notation kaldırıldı, anlamlı isimler
class ComparisonCompactor {
  private contextLength: number;
  private expected: string;
  private actual: string;
  private commonPrefix: string;
  private commonSuffix: string;
}
```

### 2.2 Negatif Koşulları Olumluya Çevir (Readable Conditionals)

```typescript
// KÖTÜ – çift olumsuz zihin yoruyor
function shouldNotCompact(): boolean {
  return expected === null || actual === null || areSameStrings();
}

if (!shouldNotCompact()) {
  compactExpectedAndActual();
}

// İYİ – olumlu isim, doğrudan niyeti ifade ediyor
function canBeCompacted(): boolean {
  return expected !== null && actual !== null && !areSameStrings();
}

if (canBeCompacted()) {
  compactExpectedAndActual();
}
```

---

## 3. Tek Sorumluluğu Olmayan Fonksiyonları Böl

```typescript
// KÖTÜ – compactExpectedAndActual hem hesaplıyor hem atıyor (yan etki)
class ComparisonCompactor {
  private compactExpected!: string;
  private compactActual!: string;

  compact(message: string): string {
    if (!canBeCompacted()) {
      return Assert.format(message, expected, actual);
    }
    compactExpectedAndActual();  // → yan etki: instance değişken ataması
    return Assert.format(message, compactExpected, compactActual);
  }

  private compactExpectedAndActual(): void {
    findCommonPrefix();
    findCommonSuffix();
    this.compactExpected = compactString(expected);
    this.compactActual   = compactString(actual);
  }
}

// İYİ – her metot sadece bir iş yapar; yan etki ayrılır
class ComparisonCompactor {
  compact(message: string): string {
    if (!canBeCompacted()) {
      return Assert.format(message, expected, actual);
    }

    const [compactExpected, compactActual] = buildCompactStrings();
    return Assert.format(message, compactExpected, compactActual);
  }

  private buildCompactStrings(): [string, string] {
    const prefixLen = findCommonPrefixLength();
    const suffixLen = findCommonSuffixLength(prefixLen);
    return [
      compactString(expected, prefixLen, suffixLen),
      compactString(actual,   prefixLen, suffixLen),
    ];
  }
}
```

---

## 4. Gizli Bağımlılıkları Parametrelere Taşı (Temporal Coupling)

```typescript
// KÖTÜ – findCommonSuffix, findCommonPrefix'e gizli bağımlılık
class ComparisonCompactor {
  private prefixLength = 0;

  private findCommonPrefix(): void {
    this.prefixLength = 0;  // önce bu çağrılmalı
    // ...
  }

  private findCommonSuffix(): void {
    // prefixLength'i kullanıyor ama parametre almıyor
    let suffixLength = 0;
    while (
      suffixLength < expected.length - this.prefixLength &&  // gizli bağımlılık
      suffixLength < actual.length   - this.prefixLength
    ) {
      // ...
      suffixLength++;
    }
  }
}
// Hata: findCommonSuffix, findCommonPrefix çağrılmadan çalıştırılırsa yanlış sonuç

// İYİ – bağımlılık parametre olarak açıkça belirtiliyor
class ComparisonCompactor {
  private findCommonPrefixLength(): number {
    let length = 0;
    while (
      length < expected.length &&
      length < actual.length &&
      expected[length] === actual[length]
    ) {
      length++;
    }
    return length;
  }

  private findCommonSuffixLength(prefixLength: number): number {
    let length = 0;
    while (
      length < expected.length - prefixLength &&
      length < actual.length   - prefixLength &&
      expected[expected.length - length - 1] === actual[actual.length - length - 1]
    ) {
      length++;
    }
    return length;
  }
  // Artık çağrılma sırası hata doğurmuyor – her ikisi de bağımsız
}
```

---

## 5. Sabit Dizeleri Anlamlı Sabitlere Çevir

```typescript
// KÖTÜ – magic string
function compactString(source: string, prefixLength: number, suffixLength: number): string {
  const result =
    source.substring(0, prefixLength) +
    '...' +
    source.substring(source.length - suffixLength);
  return result;
}

// İYİ
const ELLIPSIS = '...';

function compactString(source: string, prefixLength: number, suffixLength: number): string {
  const prefix = source.substring(0, prefixLength);
  const body   = ELLIPSIS;
  const suffix = suffixLength > 0
    ? source.substring(source.length - suffixLength)
    : '';
  return `${prefix}${body}${suffix}`;
}
```

---

## 6. Gerçek Dünyadaki TypeScript Refactoring Örneği

```typescript
// Ham – çalışıyor ama okunmuyor
function fmt(exp: string | null, act: string | null, ctx: number): string {
  if (!exp || !act || exp === act) return `expected:<${exp}> but was:<${act}>`;
  let p = 0;
  while (p < exp.length && p < act.length && exp[p] === act[p]) p++;
  let s = 0;
  while (s < exp.length - p && s < act.length - p &&
    exp[exp.length - 1 - s] === act[act.length - 1 - s]) s++;
  const ce = (p > ctx ? '...' : '') + exp.slice(Math.max(0, p - ctx), exp.length - s) + (s > ctx ? '...' : '');
  const ca = (p > ctx ? '...' : '') + act.slice(Math.max(0, p - ctx), act.length - s) + (s > ctx ? '...' : '');
  return `expected:<${ce}> but was:<${ca}>`;
}

// Refactored – her adımda testler yeşil kaldı
class DiffCompactor {
  private static readonly ELLIPSIS   = '...';
  private static readonly MAX_CHARS  = 20;

  constructor(
    private readonly expected: string,
    private readonly actual:   string,
    private readonly context:  number = DiffCompactor.MAX_CHARS,
  ) {}

  static format(expected: string | null, actual: string | null, context = 20): string {
    if (expected === null || actual === null) {
      return `expected:<${expected}> but was:<${actual}>`;
    }
    if (expected === actual) {
      return `expected:<${expected}> but was:<${actual}>`;
    }
    return new DiffCompactor(expected, actual, context).compact();
  }

  private compact(): string {
    const prefixLen = this.findCommonPrefixLength();
    const suffixLen = this.findCommonSuffixLength(prefixLen);
    return `expected:<${this.compactString(this.expected, prefixLen, suffixLen)}> ` +
           `but was:<${this.compactString(this.actual,   prefixLen, suffixLen)}>`;
  }

  private findCommonPrefixLength(): number {
    let length = 0;
    const limit = Math.min(this.expected.length, this.actual.length);
    while (length < limit && this.expected[length] === this.actual[length]) {
      length++;
    }
    return length;
  }

  private findCommonSuffixLength(prefixLength: number): number {
    let length = 0;
    while (
      length < this.expected.length - prefixLength &&
      length < this.actual.length   - prefixLength &&
      this.expected[this.expected.length - 1 - length] ===
        this.actual[this.actual.length - 1 - length]
    ) {
      length++;
    }
    return length;
  }

  private compactString(source: string, prefixLen: number, suffixLen: number): string {
    const start     = Math.max(0, prefixLen - this.context);
    const end       = source.length - suffixLen;
    const body      = source.substring(start, end);
    const prefix    = start > 0 ? DiffCompactor.ELLIPSIS : '';
    const suffix    = suffixLen > this.context ? DiffCompactor.ELLIPSIS : '';
    return `${prefix}${body}${suffix}`;
  }
}

// Test
describe('DiffCompactor', () => {
  it('returns full strings when no common prefix/suffix', () => {
    const result = DiffCompactor.format('abc', 'xyz');
    expect(result).toBe('expected:<abc> but was:<xyz>');
  });

  it('compacts long strings with common prefix', () => {
    const expected = 'a'.repeat(25) + 'X';
    const actual   = 'a'.repeat(25) + 'Y';
    const result   = DiffCompactor.format(expected, actual, 5);
    expect(result).toContain('...');
    expect(result).toContain('X');
    expect(result).toContain('Y');
  });
});
```

---

## 7. Özet Kural Tablosu

| # | Kural |
|---|-------|
| 1 | Cryptic kısaltmalar kaldır: `fExpected` → `expected` |
| 2 | Negatif koşulları olumluya çevir: `shouldNotCompact` → `canBeCompacted` |
| 3 | Yan etkili metotları böl: hesapla ve ata ayrı sorumluluklar |
| 4 | Gizli temporal bağımlılıkları parametreyle aç |
| 5 | Magic string → isimlendirilmiş sabit (`ELLIPSIS`) |
| 6 | Her adımda testler yeşil – küçük, güvenli dönüşümler |
| 7 | Refactoring büyük yeniden yazım değil; küçük, ölçülebilir adımlar |
