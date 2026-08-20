# Import ofert do analizy rynku Mobile.de

Import działa lokalnie w przeglądarce. Plik nie jest wysyłany do serwera. Po zmianie
marki, modelu lub wersji zaimportowany zestaw jest automatycznie odłączany.

## CSV

Minimalne kolumny: `price,url`. Obsługiwane są przecinek, średnik i tabulator.

```csv
price;url;title;year;mileage
41999;https://suchen.mobile.de/fahrzeuge/details.html?id=123;BMW X5 xDrive30d;2023;97926
51920;https://suchen.mobile.de/fahrzeuge/details.html?id=456;BMW X5 M Sport;2022;55200
58900;https://suchen.mobile.de/fahrzeuge/details.html?id=789;BMW X5 Individual;2021;63000
```

## JSON

Akceptowana jest tablica ofert albo obiekt z tablicą `listings`, `results` lub `items`.

```json
{
  "listings": [
    {
      "price": 41999,
      "url": "https://suchen.mobile.de/fahrzeuge/details.html?id=123",
      "title": "BMW X5 xDrive30d",
      "year": 2023,
      "mileage": 97926
    }
  ]
}
```

Wymagane są co najmniej trzy poprawne, unikalne linki. `title`, `year`, `mileage`
i `id` są opcjonalne. Ceny wykresu są prezentowane w EUR. Maksymalny rozmiar pliku:
5 MB. Po imporcie każda kropka prowadzi bezpośrednio do adresu `url` danej oferty.
