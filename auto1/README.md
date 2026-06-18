# Аукционы - Авто 1

Инструмент для подготовки PDF-отчетов AUTO1 к отправке клиенту.

## Что делает

Берет исходный отчет AUTO1 и формирует клиентскую версию:

- удаляет voucher / export advantage;
- удаляет stock number;
- удаляет блок `In high demand`;
- удаляет видео-оверлей `0:00 / 0:16`;
- удаляет блоки доставки, адреса, сроков и стоимости;
- удаляет страницу с процессом delivery / pickup;
- удаляет строку `Total Pictures`;
- удаляет финальную legal/footer страницу AUTO1;
- удаляет тонкую техническую полосу справа на страницах;
- сохраняет основные данные автомобиля, фото, состояние, damage summary, equipment, service и VIN-блок.

## Установка

```bash
python3 -m pip install -r requirements.txt
```

## Использование

```bash
python3 auto1_pdf_cleaner.py "/path/to/source-auto1.pdf"
```

По умолчанию готовый файл появится в:

```text
output/pdf/<source-name>-client.pdf
```

Можно явно указать путь:

```bash
python3 auto1_pdf_cleaner.py "/path/to/source-auto1.pdf" -o "output/pdf/client-report.pdf"
```

## Проверка на Peugeot sample

```bash
python3 tests/validate_peugeot_sample.py "output/pdf/client-report.pdf"
```

## Важные ограничения

Правила настроены под текущий формат отчетов AUTO1, где данные расположены примерно как в проверенных файлах Peugeot 508. Если AUTO1 сильно поменяет верстку, нужно перепроверить результат визуально и обновить координаты очистки.

Перед отправкой клиенту открывай готовый PDF и проверяй:

- нет ли внутренних цен/скидок/stock number;
- нет ли адресов доставки и сроков логистики;
- остались ли все важные фото и damage summary;
- не появилась ли пустая или поврежденная страница.

