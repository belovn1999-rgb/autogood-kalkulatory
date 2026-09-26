# Cena „pod klucz” z Niemiec vs zakup w Polsce — plan

Cel: w Analizie rynku przy każdej ofercie mobile.de pokazać cenę brutto w EUR
**i** orientacyjny koszt auta zarejestrowanego w Polsce („pod klucz”) liczony
tak samo jak w Kalkulatorach, po kursie z dnia sprawdzenia. Następnie
porównać to z cenami otomoto.pl i pokazać klientowi krótkie podsumowanie:
gdzie taniej — sprowadzić na zamówienie z Niemiec czy kupić w Polsce.

Zasada: liczymy zawsze dla osoby fizycznej, która płaci brutto — porównujemy
ceny brutto.

## Baza (gotowe, 2026-09-26)

- `src/turnkey-estimate.js` — `window.AUTOGOOD_TURNKEY`:
  - `turnkeyDirect({ carBruttoEur, rate, transportNettoPln, inspectionNettoPln, engineTypeIndex, registration })`
    — wzór zakładki „Zakup bezpośredni” (`calculate()` tab 0 w `src/main.jsx`):
    auto × kurs + oględziny i transport z VAT 23% + akcyza (klasa silnika) +
    prowizja AUTOGOOD (1829,27 + 1% ceny, z VAT) + przegląd 150 + tłumaczenie
    250. **Bez rejestracji i bez rabatu** — tylko cena z ogłoszenia (decyzja
    2026-09-26). Wynik zaokrąglony do 50 PLN jak „Razem”. Sprawdzone z
    kalkulatorem: 10 980 € / 4,25 / transport 2500 / oględziny 1300 /
    spalinowy ≤2000 → 56 700 PLN z rejestracją, 56 000 PLN bez.
  - `turnkeyForListing(listing, rate)` — dla jednej oferty: transport i
    oględziny z taryfy po kraju i kodzie pocztowym sprzedawcy
    (`estimateDeliveryInspection` w `mobile.js`), akcyza z paliwa i pojemności
    (`classifyEngineType`).
  - `calculatorRate()` — kurs kalkulatora: Walutomat, najlepsza oferta EUR→PLN
    (zapas: `data/exchange-rates.json`). Ten kurs obowiązuje teraz na całej
    stronie mobile.html.
- Zakładka AUTOGOOD zapisuje przy każdej ofercie z listy mobile.de: kraj, kod
  pocztowy, miasto, nadwozie, pojemność, paliwo, moc — wszystko, czego wzór
  potrzebuje. Nowe dane zbierane są od razu (zakładkę trzeba przeciągnąć
  ponownie).

Stałe wzoru są kopią tych z `src/main.jsx` — zmieniając kalkulator, zmień też
`turnkey-estimate.js`.

## Do zrobienia (kiedy wdrażamy)

1. **Wykres:** przełącznik „Cena ogłoszenia / Pod klucz w PL” dla mobile.de.
   W trybie „pod klucz” pomarańczowe punkty pokazują koszt w PLN, a otomoto
   zostaje bez zmian (cena brutto w Polsce) — jedna skala PLN, porównanie
   jabłek z jabłkami.
2. **Dymek oferty:** „10 980 € brutto → ok. 56 700 zł pod klucz (kurs 4,37,
   26.09)”, z rozbiciem: auto, transport, oględziny, akcyza, prowizja, opłaty.
3. **Statystyki i Historia cen:** mediana „pod klucz” mobile.de obok mediany
   otomoto, z kursem zapisanym przy każdym pomiarze (zmiana kursu nie może
   wyglądać jak zmiana rynku).
4. **Podsumowanie dla klienta („Gdzie taniej”):** dla wybranych parametrów:
   mediana pod klucz z Niemiec vs mediana otomoto, różnica w PLN i %, ile
   ofert po każdej stronie, najtańsze sensowne oferty z obu rynków (linki).
   Karta do pokazania / skopiowania klientowi.
5. **Konkretne auto:** dla rozpoznanego ogłoszenia mobile.de — jego koszt pod
   klucz na tle ofert otomoto o tych samych parametrach.

Ustalone: rejestracja nie wchodzi w „pod klucz”; rabatów nie liczymy —
tylko cena z ogłoszenia. Oferty spoza DE na mobile.de (NL, BE, FR…) — taryfa
już je obsługuje.
