# Mobile.de — audyt filtrów wyszukiwania

Stan: 2026-08-20. Zakres: formularz ręczny AUTOGOOD → angielska wyszukiwarka mobile.de.

## Automatyczny audyt

```bash
npm run audit:mobile-search
```

Polecenie sprawdza 1 056 modeli w 13 katalogach marek, kompletność lokalnych web-ID,
aktualne nazwy modeli w oficjalnym `services.mobile.de/refdata` oraz kontrakt parametrów URL.
Tryb bez połączenia z refdata: `npm run audit:mobile-search -- --offline`.

## Macierz pól

| Pole AUTOGOOD | Parametr mobile.de | Status |
|---|---|---|
| Język strony wyników | `lang=en` | potwierdzone w przeglądarce |
| Marka, model, wersja | `ms` | potwierdzone: BMW X5 xDrive30d |
| Nadwozie | `c` | potwierdzone: `OffRoad` |
| Przebieg | `ml` | potwierdzone: 40 000–120 000 km |
| Rok pierwszej rejestracji | `fr` | potwierdzone: 2020–2023 |
| Pojemność | `cc` | potwierdzone: 2 000–3 000 cm³ |
| Moc | `pw` | potwierdzone przeliczenie KM → kW: 200–303 KM |
| Paliwo / Plug-in | `ft` | Diesel potwierdzony; pozostałe wartości objęte audytem kontraktu |
| Napęd | `dt` | AWD potwierdzone; FWD/RWD objęte audytem kontraktu |
| Skrzynia | `tr` | automat potwierdzony; manualna objęta audytem kontraktu |
| VAT | `vat` | zwrotny potwierdzony; niezwrotny objęty audytem kontraktu |
| Sprzedawca | `st` | dealer potwierdzony; prywatny/firma objęte audytem kontraktu |
| Kraj | `cn` | Niemcy potwierdzone |
| Materiał wnętrza | `it` | pełna skóra potwierdzona; pozostałe wartości objęte audytem kontraktu |
| Kolor nadwozia | `ecol` | czarny potwierdzony |
| Kolor wnętrza | `icol` | objęty audytem kontraktu |
| Matowy / Metallic | `fe` | Metallic potwierdzony; matowy objęty audytem kontraktu |
| Auto niepalącego | `fe=NONSMOKER_VEHICLE` | potwierdzone |
| Uszkodzone pojazdy | `dam` | „nie pokazuj” potwierdzone |
| Sortowanie | `sb=p&od=up` | potwierdzone: Price (lowest first) |

Kontrolna publiczna wyszukiwarka zwróciła 72 oferty i zachowała wszystkie wybrane
parametry. Pole „Wersja” pozostaje ręczne. Wielokrotny wybór krajów pozostaje poza
bieżącym zakresem akceptacji.
