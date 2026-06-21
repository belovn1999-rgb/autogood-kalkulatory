# Аукционы - Auto1

Эта часть репозитория отвечает за подготовку отчетов AUTO1 к отправке клиенту.

## Что теперь делает вкладка Auto1

Публичная страница:

```text
https://belovn1999-rgb.github.io/autogood-kalkulatory/auto1.html
```

Рабочий сценарий:

1. Пользователь загружает сырой PDF, напрямую скачанный с AUTO1.
2. Браузер локально читает и рендерит страницы PDF.
3. Программа удаляет или закрывает повторяемые аукционные элементы.
4. Программа собирает новый PDF.
5. Пользователь скачивает файл `*-client.pdf` и визуально проверяет его перед отправкой клиенту.

Файл не отправляется на сервер. Обработка идет внутри браузера.

## Правила из примера Jeep Compass

Подтвержденные правила из сравнения raw -> client-ready и демонстрации экрана:

- удалить voucher / `Save cash`;
- удалить `Export advantage`;
- удалить `Stock number` и внутренние номера аукциона;
- удалить `In high demand`, watchlist и похожие системные сообщения;
- удалить video overlay, progress bar и время плеера;
- удалить delivery / pickup / logistics / цены / сроки;
- удалить `Total Pictures` и служебные gallery-сообщения;
- удалить legal/footer-only страницу AUTO1;
- сохранить фото, характеристики, test drive, damage, equipment, service, inspection и VIN/equipment sections.

## Техническая реализация

Основная браузерная программа:

```text
auto1.html
src/auto1.js
src/auto1.css
```

`src/auto1.js` использует:

- PDF.js для чтения и рендера загруженного PDF;
- локальный `vendor/jspdf.umd.min.js` для сборки готового PDF;
- координатные маски, текстовые правила и удаление legal-страниц.

## Материалы обучения

Детали примера Jeep Compass сохранены здесь:

```text
docs/auto1-pdf-learning/jeep-compass-demo/confirmed-change-log.md
docs/auto1-pdf-learning/jeep-compass-demo/format-learning-note.md
docs/auto1-pdf-learning/jeep-compass-demo/recording-summary.md
```

## Важное ограничение

Это автоматизация для повторяемой структуры отчетов AUTO1. Если AUTO1 сильно поменяет шаблон PDF, правила нужно будет обновить и проверить на новом raw/client-ready примере.
