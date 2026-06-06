# AUTOGOOD Tools

Publiczna strona AUTOGOOD Tools z zestawem narzedzi operacyjnych.

Pierwsze narzedzie:

```text
https://belovn1999-rgb.github.io/autogood-kalkulatory/calculators.html
```

PDF:

```text
https://belovn1999-rgb.github.io/autogood-kalkulatory/pdf.html
```

PDF z generatora umowy wymaga konwertera DOCX -> PDF z LibreOffice. GitHub Pages
obsluguje tylko statyczna strone, wiec poprawny PDF dziala po uruchomieniu albo
wdrozeniu serwisu:

```bash
python3 converter/server.py
```

Lokalny adres z konwerterem:

```text
http://127.0.0.1:8787/pdf.html
```

Import danych z Mobile.de w kalkulatorze `Zakup bezposredni` wymaga backendu:

```bash
npm install
npx playwright install chromium
npm run mobilede
```

Na lokalnym macOS backend moze tez uzyc systemowego Google Chrome. W razie potrzeby
podaj sciezke przez `MOBILEDE_CHROME_PATH`.

Domyslny endpoint importu:

```text
http://127.0.0.1:8788/mobilede/import
```

Na publicznym GitHub Pages backend musi byc wdrozony osobno pod adresem HTTPS i
podany w `window.AUTOGOOD_MOBILEDE_API_URL`.

Mapa procesu managera:

```text
https://belovn1999-rgb.github.io/autogood-kalkulatory/process.html
```

Karta transakcji:

```text
https://belovn1999-rgb.github.io/autogood-kalkulatory/deal.html
```

Szablony wiadomosci:

```text
https://belovn1999-rgb.github.io/autogood-kalkulatory/messages.html
```

Dokumenty transakcji:

```text
https://belovn1999-rgb.github.io/autogood-kalkulatory/documents.html
```

## Uruchomienie

W folderze projektu uruchom:

```bash
python3 -m http.server 4173
```

Nastepnie otworz:

```text
http://localhost:4173
```

## Publiczny link

```text
https://belovn1999-rgb.github.io/autogood-kalkulatory/
```

Zmiany opublikowane w galezi `main` sa automatycznie widoczne pod publicznym linkiem przez GitHub Pages.

## Publikacja zmian

Po zmianach uruchom:

```bash
./scripts/publish.sh "Opis zmiany"
```

## Zawartosc

- kalkulatory dla zakupu bezposredniego, aukcji i dealerow;
- warianty VAT 23% oraz VAT Marza;
- przeliczanie EUR/PLN;
- wersja PL/RU;
- drukowanie lub zapis do PDF z przegladarki.
- strona startowa dla programu PDF.
- mapa procesu sprzedazy auta pod zamowienie.
- karta transakcji z klientem, autem, statusem, zadaniami i finansami.
- szablony wiadomosci do klienta z podstawieniem danych z Deal Desk.
- generator dokumentow roboczych z danych Deal Desk.
