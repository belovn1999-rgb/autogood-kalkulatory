# AUTOGOOD Contract PDF Generator

## Source Template

- Working copy: `templates/Umowa_Zamowienia_Pojazdu_AG_template.docx`
- The public repository does not include filled contracts, generated output, or signature/stamp files.
- For local generation, add the signature/stamp image as `assets/signature_stamp_source.jpg`.

## Current Findings

- The template is a Word `.docx` contract: `UMOWA ZAMÓWIENIA POJAZDU`.
- The top-right date is a Word date field and currently renders as `Łomianki, 30 maja 2026 roku`.
- The first contract section is a large table with client data, AUTOGOOD data, subject of the agreement, budget, payment, vehicle search criteria, and signatures.
- The template contains 20 real Word checkbox controls.
- The only embedded image in the blank template is the AUTOGOOD logo. The Prezes signature/stamp image is not present in this blank file.
- The contract number is placed in the title line after `UMOWA ZAMÓWIENIA POJAZDU`.
- The signature/stamp is inserted in the lower-right signature box under the `ZLECENIOBIORCA:` header when a local signature/stamp asset is available.

## Contract Number Rule

For a contract signed on `30.05.2026`, the base contract number is:

```text
30/5/26
```

If more than one contract is signed on the same day, append the sequence number:

```text
30/5/26/2
30/5/26/3
```

## Required Output

- Filled contract must be in Polish.
- Program should generate a finished PDF for download.
- Client can be either:
  - person: name, address, PESEL, identity document, phone, email;
  - company: company name, address, NIP, phone, email; PESEL and identity document are not filled.
- Program should infer which client fields/checkmarks to fill based on provided client data.
- Vehicle data should fill text fields and select relevant checkbox options.
- UI should have two language versions: RU and PL, similar to the calculators.
- User can paste client and car data as one continuous paragraph. The program parses known labels and distributes values into editable fields.
- User must still be able to edit all parsed fields manually before generation.
- Contract checkbox layout in the UI should follow the same logic and order as the Word contract.
- When client type is `Firma`, the entrepreneur/professional-contract checkbox is enabled automatically.
- When client type is `Firma`, the identity document field is disabled and left empty.
- `Pojazd wskazany przez Zleceniodawcę` is an additional checkbox and can be selected together with one of the three main cooperation variants.

## Supported Input Labels

The current parser supports one-paragraph input with labels such as:

```text
Клиент / Client / Klient
Тип клиента / Rodzaj klienta
Адрес / Adres
PESEL
NIP
Документ / Dokument
Телефон / Telefon / Nr. tel
Email / E-mail
Авто / Auto / Samochód / Pojazd
Марка / Marka
Модель / Model
Год / Rok / Wiek
Тип кузова / Nadwozie
Топливо / Paliwo
Коробка / Skrzynia
Бюджет / Budżet
Депозит / Zaliczka
Дополнительно / Dodatkowo / Wyposażenie
```

Example physical person input:

```text
Клиент: Jan Kowalski Тип клиента: физическое лицо Адрес: ul. Prosta 12/4, 00-001 Warszawa PESEL: 99070613053 Документ: dowód osobisty ABC123456 Телефон: +48 600 700 800 Email: jan.kowalski@example.com Авто: Марка: BMW Модель: 530i Год: 2021-2023 Тип кузова: sedan Топливо: benzyna Коробка: automatyczna Бюджет: 75 000 PLN brutto Депозит: 4 000 PLN brutto Дополнительно: napęd na wszystkie koła, tempomat adaptacyjny, kamera 360
```

Example company input:

```text
Клиент: JDG Auto Handel Jan Nowak Тип клиента: фирма Адрес: ul. Długa 7, 30-001 Kraków NIP: 6761234567 Телефон: +48 601 222 333 Email: biuro@example.com Авто: Марка: Mercedes-Benz Модель: Vito Год: 2021+ Тип кузова: inne: van Топливо: diesel Коробка: automatyczna Бюджет: 15 000 EUR brutto Депозит: 1 000 EUR brutto Дополнительно: kamera cofania, tempomat, hak
```

## Known Checkbox Groups

- Client is entrepreneur / professional contract checkbox.
- Subject of agreement:
  - service search and purchase mediation;
  - search within budget and purchase by AUTOGOOD on client's account;
  - search and purchase with financing;
  - vehicle indicated by client.
- Fuel:
  - diesel;
  - benzyna;
  - hybryda;
  - elektryk.
- Gearbox:
  - manualna;
  - automatyczna.
- Euro standard:
  - 6;
  - 7;
  - dowolna;
  - inna.
- Body:
  - sedan;
  - kombi;
  - coupe;
  - inne.
- Accident acceptance:
  - acceptable after collision, but without longitudinal member damage.

## Needed Next Inputs

- A sample company client example, when we start implementing company mode.
