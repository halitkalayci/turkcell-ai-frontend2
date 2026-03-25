---
description: >
  Robert Martin – Clean Code, Chapter 16: Refactoring SerialDate.
  Mevcut kod tabanında disiplinli refactoring: önce test yaz, sonra temizle.
applyTo: "**"
---

# Chapter 16 – Refactoring SerialDate

## 1. Temel Prensip

> "First make it work. Then make it right. Then make it fast."

Bu bölüm, [JCommon](https://www.jfree.org/jcommon/) kütüphanesinin `SerialDate` sınıfını refactor eder. Ders: **refactoring, testlerle güvence altına alınmadan başlanmaz; değiştirir değiştirmez test yaz, sonra temizle.**

---

## 2. Adım 1 – Refactoring Öncesi Test Kapsamını Garantile

```typescript
// serializableDate.ts – var olan, çalışan kod (ham hali)
export class SerializableDate {
  private readonly serialValue: number;  // "serial" gün sayısı 1900-01-01'den

  constructor(day: number, month: number, year: number) {
    if (!SerializableDate.isValidDate(day, month, year)) {
      throw new Error(`Invalid date: ${day}/${month}/${year}`);
    }
    this.serialValue = SerializableDate.toSerial(day, month, year);
  }

  static isValidDate(day: number, month: number, year: number): boolean {
    if (month < 1 || month > 12) return false;
    if (year < 1900) return false;
    if (day < 1 || day > SerializableDate.lastDayOfMonth(month, year)) return false;
    return true;
  }

  static lastDayOfMonth(month: number, year: number): number {
    // Ham hali – bir büyük switch
    switch (month) {
      case 2:
        return SerializableDate.isLeapYear(year) ? 29 : 28;
      case 4: case 6: case 9: case 11:
        return 30;
      default:
        return 31;
    }
  }

  static isLeapYear(year: number): boolean {
    if (year % 400 === 0) return true;
    if (year % 100 === 0) return false;
    return year % 4 === 0;
  }

  private static toSerial(d: number, m: number, y: number): number {
    // ... hesaplama ...
    return 0; // basitleştirilmiş
  }

  toSerial(): number { return this.serialValue; }
}

// ─── ÖNCE TEST YAZ ───────────────────────────────────────────────
describe('SerializableDate', () => {
  describe('isLeapYear', () => {
    it('divisible by 400 → leap',   () => expect(SerializableDate.isLeapYear(2000)).toBe(true));
    it('divisible by 100 → not',    () => expect(SerializableDate.isLeapYear(1900)).toBe(false));
    it('divisible by 4 → leap',     () => expect(SerializableDate.isLeapYear(2024)).toBe(true));
    it('not divisible by 4 → not',  () => expect(SerializableDate.isLeapYear(2023)).toBe(false));
  });

  describe('lastDayOfMonth', () => {
    it('February non-leap → 28', () => expect(SerializableDate.lastDayOfMonth(2, 2023)).toBe(28));
    it('February leap → 29',     () => expect(SerializableDate.lastDayOfMonth(2, 2024)).toBe(29));
    it('April → 30',             () => expect(SerializableDate.lastDayOfMonth(4, 2023)).toBe(30));
    it('January → 31',           () => expect(SerializableDate.lastDayOfMonth(1, 2023)).toBe(31));
  });
});
```

---

## 3. Adım 2 – Sihirli Sayı ve Enum Dönüşümü

```typescript
// KÖTÜ – ham sayılar (1-12 ay)
if (month === 2 && isLeap) return 29;

// İYİ – enum ile açık, güvenli
enum Month {
  JANUARY   = 1,  FEBRUARY, MARCH,    APRIL,
  MAY,            JUNE,     JULY,     AUGUST,
  SEPTEMBER,      OCTOBER,  NOVEMBER, DECEMBER,
}

const LAST_DAY_OF_MONTH: Record<Month, number> = {
  [Month.JANUARY]:   31, [Month.FEBRUARY]:  28, [Month.MARCH]:    31,
  [Month.APRIL]:     30, [Month.MAY]:        31, [Month.JUNE]:     30,
  [Month.JULY]:      31, [Month.AUGUST]:     31, [Month.SEPTEMBER]:30,
  [Month.OCTOBER]:   31, [Month.NOVEMBER]:   30, [Month.DECEMBER]: 31,
};

function lastDayOfMonth(month: Month, year: number): number {
  const days = LAST_DAY_OF_MONTH[month];
  return month === Month.FEBRUARY && isLeapYear(year) ? 29 : days;
}
```

---

## 4. Adım 3 – Statik Factory Metot ile Kurucu Temizleme

```typescript
// KÖTÜ – kurucu aşırı yüklenmiş; hem direct, hem serial destekliyor
class SerializableDate {
  constructor(serialDay: number);
  constructor(day: number, month: Month, year: number);
  constructor(a: number, b?: Month, c?: number) {
    if (b !== undefined && c !== undefined) {
      // takvim tarihinden serialize et
    } else {
      // doğrudan serial değer
    }
  }
}

// İYİ – factory metotlar ile niyet açık
class SerializableDate {
  private constructor(private readonly serial: number) {}

  static fromSerial(serial: number): SerializableDate {
    if (serial < 1) throw new Error('Serial must be positive');
    return new SerializableDate(serial);
  }

  static fromDate(day: number, month: Month, year: number): SerializableDate {
    if (!SerializableDate.isValidDate(day, month, year)) {
      throw new Error(`Invalid date: ${day}/${month}/${year}`);
    }
    return new SerializableDate(SerializableDate.toSerial(day, month, year));
  }
}

// Kullanım
const d1 = SerializableDate.fromDate(15, Month.JUNE, 2024);
const d2 = SerializableDate.fromSerial(45_000);
```

---

## 5. Adım 4 – Ölü Kodun ve Kullanılmayan Metodun Temizlenmesi

```typescript
// KÖTÜ – yıllar önce eklenmiş, hiç kullanılmayan metot
class DateUtils {
  /**
   * @deprecated Artık kullanılmıyor, SerializableDate kullanın
   */
  static toExcelSerial(d: number, m: number, y: number): number {
    // ... eski Excel bug uyumlu hesaplama ...
    return 0;
  }

  // Sadece toExcelSerial için yardımcı, başka kimse çağırmıyor
  private static adjustForExcelBug(serial: number): number {
    return serial + 1;  // Excel'in 1900'ün artık yıl olmadığını yanlış hesaplaması
  }
}

// İYİ – ölü kod kaldırıldı; gerekirse git history'den geri alınabilir
// Hiçbir şey kalmadı – dosya silindi.
```

---

## 6. Adım 5 – Polimorfizm ile Switch Elimine Et

```typescript
// KÖTÜ – Week/WeekInMonth için switch yığını
function getWeekday(date: SerializableDate): string {
  switch (date.getDayOfWeek()) {
    case 0: return 'Sunday';
    case 1: return 'Monday';
    // ...
    default: throw new Error('Unknown day');
  }
}

// İYİ – enum + lookup elimine eder switch'i
const DAY_NAMES: Record<DayOfWeek, string> = {
  [DayOfWeek.SUNDAY]:    'Sunday',
  [DayOfWeek.MONDAY]:    'Monday',
  [DayOfWeek.TUESDAY]:   'Tuesday',
  [DayOfWeek.WEDNESDAY]: 'Wednesday',
  [DayOfWeek.THURSDAY]:  'Thursday',
  [DayOfWeek.FRIDAY]:    'Friday',
  [DayOfWeek.SATURDAY]:  'Saturday',
};

function getWeekdayName(day: DayOfWeek): string {
  return DAY_NAMES[day];
}
```

---

## 7. Adım 6 – Soyut Sınıf / Interface ile Bağımlılık Kırma

```typescript
// KÖTÜ – SerializableDate hem veri hem davranış; test edilemiyor
class SerializableDate {
  // getTodayShifted → Date.now() kullanıyor (global bağımlılık)
  static getTodayShifted(days: number): SerializableDate {
    const now = new Date();
    now.setDate(now.getDate() + days);
    return SerializableDate.fromDate(
      now.getDate(), now.getMonth() + 1 as Month, now.getFullYear()
    );
  }
}

// İYİ – Clock soyutlaması enjekte edilebilir
interface Clock {
  today(): { day: number; month: Month; year: number };
}

class SystemClock implements Clock {
  today() {
    const now = new Date();
    return { day: now.getDate(), month: (now.getMonth() + 1) as Month, year: now.getFullYear() };
  }
}

class FakeClock implements Clock {
  constructor(private readonly fixed: { day: number; month: Month; year: number }) {}
  today() { return this.fixed; }
}

class DateService {
  constructor(private readonly clock: Clock) {}

  getTodayShifted(days: number): SerializableDate {
    const { day, month, year } = this.clock.today();
    // gün kaydır...
    return SerializableDate.fromDate(day + days, month, year);  // basitleştirilmiş
  }
}

// Test
it('shifts today by 3 days', () => {
  const clock   = new FakeClock({ day: 1, month: Month.JUNE, year: 2024 });
  const service = new DateService(clock);
  const result  = service.getTodayShifted(3);
  expect(result).toEqual(SerializableDate.fromDate(4, Month.JUNE, 2024));
});
```

---

## 8. Özet Kural Tablosu

| # | Kural |
|---|-------|
| 1 | Refactoring öncesi test kapsamını garantile – kırmızı olmayan testler yeşil kalmalı |
| 2 | Magic number → enum / isimlendirilmiş sabit |
| 3 | Aşırı yüklenmiş kurucu → statik factory metot |
| 4 | Ölü kod ve kullanılmayan metot → git'ten silinir |
| 5 | Switch dizileri → lookup tablo veya polimorfizm |
| 6 | Global bağımlılıklar (Date.now) → enjekte edilebilir arayüz |
| 7 | Her küçük adımdan sonra tüm testleri çalıştır |
| 8 | Sınıf adı ne yaptığını tam anlatmıyorsa yeniden adlandır |
