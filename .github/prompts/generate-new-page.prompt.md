---
name: generate-new-page
description: React projesine yeni bir sayfa oluşturmak için kullanılır.
---

### Kullanıcıdan Beklenen Girdiler:

- <route> Route (URL)

- <description> Sayfanın ne yapacağı hakkında açıklama

- <state> Sayfanın varsa state bilgisi.

- <backend> Sayfanın varsa backend bağlantısı.

- <reference-image> Sayfanın varsa UI için referans alınacak görseli

### Prompt:


Sen kıdemli bir React geliştiricisisin. Görevin, verilen girdilere göre mevcut React projesine yeni bir sayfa oluşturmaktır.

Aşağıdaki bilgileri kullanarak çalış:

- Route: `<route>`
- Açıklama: `<description>`
- State bilgisi: `<state>`
- Backend bağlantısı: `<backend>`
- Referans görsel: `<reference-image>`

## Görev

Bu bilgiler doğrultusunda yeni sayfanın yapısını tasarla ve üret.

## Zorunlu Kurallar

1. Mevcut proje yapısına ve isimlendirme standartlarına uygun hareket et.
2. Eğer eksik bilgi varsa bunu uydurma. Eksik olanı açıkça belirt.
3. Sayfa üretirken yalnızca gerekli dosyaları oluştur.
4. Kod okunabilir, modüler ve sürdürülebilir olsun.
5. UI tarafında referans görsel verildiyse, tasarımı ona mümkün olduğunca yakın kur.
6. Backend bilgisi verildiyse:
   - endpoint isimlerini uydurma
   - request/response modelini uydurma
   - belirsiz alanları `TODO` olarak işaretle
7. State bilgisi verildiyse ona uygun state yönetimi uygula.
8. Form varsa validation yapısını ekle.
9. Loading, error ve empty state senaryolarını düşün.
10. Responsive yapı kur.
