# Playwright Micro Lab (Monorepo)

Bu depo, **Saucedemo** ve **The Internet (Herokuapp)** web uygulamaları için modern test otomasyonu pratikleri, Page Object Model (POM) mimarisi ve GitHub Actions CI/CD entegrasyonu kullanılarak geliştirilmiş bir Playwright test otomasyonu monorepo projesidir.

## 🚀 Öne Çıkan Özellikler

* **Monorepo Mimarisi:** Birden fazla test projesinin (`saucedemo` ve `herokuapp`) tek bir Playwright yapılandırması (`playwright.config.ts`) altından bağımsız projeler (`projects`) olarak yönetilmesi.
* **Kimlik Doğrulama & Oturum Yönetimi (`storageState`):** 
  * *Saucedemo:* Bağımlı `setup` projesi (`auth.setup.ts`) ile oturum durumunun bir kez alınıp diğer testlerde paralel olarak yeniden kullanılması.
  * *Herokuapp:* Sıralı (`serial`) test akışı içinde dinamik çerez üretimi ve iç içe bloklarla oturum doğrulaması.
* **Page Object Model (POM):** Bakımı kolay, yeniden kullanılabilir ve okunabilir sayfa nesneleri.
* **Ortam Değişkenleri Yönetimi:** Hassas verilerin ve ortam bazlı URL'lerin `.env` ve GitHub Secrets üzerinden güvenli yönetimi.
* **CI/CD Entegrasyonu:** Her `push` ve `pull_request` işleminde GitHub Actions üzerinde otomatik test koşumu ve HTML raporlama.

## 📂 Proje Yapısı

```text
playwright-micro-lab/
├── .github/
│   └── workflows/
│       └── playwright.yml        # GitHub Actions CI/CD iş akışı
├── apps/
│   ├── herokuapp/
│   │   └── tests/
│   │       └── herokuapp.spec.ts # Herokuapp E2E ve seri test senaryoları
│   └── saucedemo/
│       ├── pages/                # Page Object Model (POM) sınıfları
│       └── tests/
│           ├── auth.setup.ts     # Saucedemo oturum hazırlama (setup) testi
│           └── *.spec.ts         # Saucedemo fonksiyonel test senaryoları
├── playwright/
│   └── .auth/                    # Otomatik üretilen oturum JSON dosyaları (.gitignore)
├── .env                          # Yerel ortam değişkenleri (.gitignore)
├── playwright.config.ts          # Monorepo proje ve ortam yapılandırması
└── package.json
```

## 🛠️ Kurulum

1. **Depoyu klonlayın:**
   ```bash
   git clone https://github.com/ogulcanmunogullari/playwright-micro-lab.git
   cd playwright-micro-lab
   ```

2. **Bağımlılıkları ve Playwright tarayıcılarını yükleyin:**
   ```bash
   npm install
   npx playwright install --with-deps
   ```

3. **Ortam değişkenlerini yapılandırın:**
   Proje kök dizininde `.env` adında bir dosya oluşturun ve aşağıdaki değişkenleri tanımlayın:
   ```env
   # --- SAUCEDEMO ---
   STORAGE_STATE_PATH_SAUCE=playwright/.auth/saucedemo-user.json
   SAUCEDEMO_BASE_URL=https://www.saucedemo.com
   SAUCEDEMO_USER=standard_user
   SAUCEDEMO_PASS=secret_sauce

   # --- HEROKUAPP ---
   STORAGE_STATE_PATH_HEROKUAPP=playwright/.auth/herokuapp-user.json
   HEROKUAPP_BASE_URL=https://the-internet.herokuapp.com
   HEROKU_USER=tomsmith
   HEROKU_PASS=SuperSecretPassword!
   ```

## 🧪 Testleri Çalıştırma

* **Tüm projelerdeki testleri çalıştırmak için:**
  ```bash
  npx playwright test
  ```

* **Sadece Saucedemo testlerini (setup dahil) çalıştırmak için:**
  ```bash
  npx playwright test --project=saucedemo
  ```

* **Sadece Herokuapp testlerini çalıştırmak için:**
  ```bash
  npx playwright test --project=herokuapp
  ```

* **Test raporunu görüntülemek için:**
  ```bash
  npx playwright show-report
  ```

## ⚙️ CI/CD (GitHub Actions)

Proje `.github/workflows/playwright.yml` dosyası üzerinden GitHub Actions ile entegre çalışır. Pipeline'ın sorunsuz çalışması için depo ayarlarında (**Settings > Secrets and variables > Actions**) aşağıdaki Repository Secrets değerlerinin tanımlı olması gerekir:

* `SAUCEDEMO_USER`
* `SAUCEDEMO_PASS`
* `HEROKU_USER`
* `HEROKU_PASS`