# Import ofert do analizy rynku Mobile.de

Import działa lokalnie w przeglądarce. Plik nie jest wysyłany do serwera. Po zmianie
marki, modelu lub wersji zaimportowany zestaw jest automatycznie odłączany.

## CSV

Minimalna kolumna: `price` (w EUR). `url`, `title`, `year`, `mileage` i `id` są opcjonalne. Obsługiwane są przecinek, średnik i tabulator.

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

Wymagane są co najmniej trzy poprawne ceny. Ceny wykresu są prezentowane w EUR.
Maksymalny rozmiar pliku: 5 MB. Punkty nie prowadzą do konkretnych ogłoszeń.
Jeśli `url` występuje, aplikacja może go zachować w lokalnym snapshocie, ale nie
używa go do budowy ani obsługi punktów wykresu.

## Brak danych rynku

Gdy nie ma importu, zapisanego snapshota ani podłączonego dostawcy danych, aplikacja
nie rysuje punktów ani cen zastępczych. Wykres pokazuje wyłącznie ceny otrzymane dla
aktualnych filtrów lub zapisane w konkretnym snapshocie.

## Podział rynku

Cena rośnie od dołu do góry wykresu: najtańsza oferta jest podpisana przy dolnej
granicy, a najdroższa przy górnej. Wszystkie poprawne oferty, również nietypowo
drogie i tanie, pozostają punktami na wysokości swojej ceny. Punkty nie są linkami;
odnośniki do ogłoszeń są dostępne osobno w tabeli. Poziome kreski są co €1 000 dla
Mobile.de lub co 5 000 zł, gdy na wykresie jest Otomoto. Dla czytelności podpisana
jest tylko część kresek. Typowy zakres wyznaczają P25 i P75, a mediana ma osobną
linię. Przy jednakowych cenach zakres może obejmować więcej niż połowę ofert.
Przy mniej niż 20 ofertach pojawia się ostrzeżenie o małej próbie. Przy mniej niż
8 ofertach lub aktywnym filtrze ceny aplikacja nie wydaje oceny konkretnego auta.
Są to ceny ofertowe, a nie transakcyjne; stan i wyposażenie auta mogą uzasadniać
odchylenie od mediany.
Skrajnie niska lub wysoka cena nie jest usuwana, lecz może rozciągnąć skalę;
aplikacja wyświetla wtedy ostrzeżenie.

## Historia wyszukiwania

Przycisk „Zapisz dane” zapisuje bieżący zestaw filtrów jako osobny snapshot z datą
i godziną lokalnie w przeglądarce. Historia przechowuje maksymalnie 15 snapshotów,
najnowsze na górze. Przycisk „Odśwież dane” w analizie pobiera aktualny zestaw cen z
podłączonego dostawcy i tworzy kolejny snapshot — wcześniejsze nie są nadpisywane.

Każdy wpis ma osobny przycisk „Usuń”. Po potwierdzeniu usuwany jest wyłącznie
wybrany zestaw wraz z jego zapisanymi ofertami, a licznik historii aktualizuje się
od razu.

Jeżeli zostanie zaimportowany plik ofert, tworzy on nowy snapshot cen. Przycisk „Analiza rynku” w historii
odtwarza filtry oraz zapisany wykres również po ponownym otwarciu strony. Dane nie są
synchronizowane między przeglądarkami ani urządzeniami.
