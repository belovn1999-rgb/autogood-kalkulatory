# Contract Field Map

This file documents the non-sensitive field mapping used by the AUTOGOOD contract generator.

## Header

- Date line: `Łomianki, <day> <polish month> <year> roku`
- Contract title and number: `UMOWA ZAMÓWIENIA POJAZDU <number>`
- Number format: `day/month/two-digit-year`, with `/2`, `/3`, etc. appended for additional contracts on the same day.

## Client Fields

Person:

- `Imię i Nazwisko/Nazwa`
- `Adres`
- `PESEL/NIP` receives PESEL
- `Rodzaj, numer i seria dokumentu tożsamości`
- `Nr. tel.`
- `E-mail`

Company:

- `Imię i Nazwisko/Nazwa`
- `Adres`
- `PESEL/NIP` receives NIP
- identity document field is empty
- entrepreneur/professional-contract checkbox is checked
- `Nr. tel.`
- `E-mail`

## Agreement Subject

Main cooperation variant is one of:

- search and purchase mediation;
- search within budget and purchase by AUTOGOOD on client's account;
- search and purchase with financing.

Additional checkbox:

- vehicle indicated by client.

## Vehicle Criteria

- Make and model
- Fuel: diesel, benzyna, hybryda, elektryk
- Gearbox: manualna, automatyczna
- Euro standard: 6, 7, dowolna, inna
- Age / first registration
- Mileage up to
- Body: sedan, kombi, coupe, inne
- Collision acceptance
- Required equipment
- Expected equipment

## Signature / Stamp

The signature/stamp image is intentionally not committed to the public repository. For local generation, place it at:

```text
contract-pdf-work/assets/signature_stamp_source.jpg
```
