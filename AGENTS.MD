### AGENTS.MD

Bu dosya Typescript ile yazılacak React frontend projesinin en temel 
anayasal kurallarını içeren dosyadır.

Bu proje mini bir e-ticaret ürününün ön yüz projesidir.

---


### 1) NASIL ÇALIŞILIR? (ZORUNLU İŞ AKIŞI)

#### 1.1) UYDURMA YASAK (NO INVENTING)

Eğer herhangi bir bilgi eksikliğine/yanlışına rastlarsan bu bilgiyi uydurmak yerine işlemi durdurup kullanıcıya sormak ZORUNDASIN.


#### 1.2) ÖNCE PLANLA, SONRA KODLA

Kod üretmeden önce şunları yapmak zorundasın;

- Dosya dökümü hazırla (hangi dosyalar değişecek/eklenecek + neden)

- Eğer varsa yeni eklenecek proje bağımlılıkları.

- Kullanacağın yetenekler.

> PLANI KULLANICI ONAYLAMADAN İMPLEMENTASYONA ASLA BAŞLAMA.

#### 1.3) DOSYA YAPISI

- Tüm proje kodları `src/` altında olmalıdır.

- Tüm AI döküman dosyaları `.github/` altında olmalıdır.

#### 1.4) DOSYA OLUŞTURMA STRATEJİSİ

- Asla tek seferde tüm implementasyonu yapma

- Görevi birbiriyle alakalı ve bağımlılık sırasında önce gelen 5'erli batchlere böl ve her batch arası onay bekle.


### 2) AGENT ROUTING (ZORUNLU)

Aşağıdaki iş tiplerinde default agent görevi **devralmamalı**, 
ilgili custom agent'a `runSubagent` ile yönlendirmelidir:

İlgili custom agent seçimi agent'a bırakılır. Araştır ve bul. Bulamazsan default agent ile devam et.