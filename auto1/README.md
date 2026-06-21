# Аукционы - Auto1

Эта папка относится к подготовке отчетов AUTO1 к отправке клиенту.

## Текущий статус

Старый автоматический cleaner из первой попытки больше не считается готовым рабочим решением. Правильная база для следующей версии теперь находится в learning pack по Jeep Compass:

```text
docs/auto1-pdf-learning/jeep-compass-demo/
```

## Что подтверждено на Jeep Compass

Сравнены две версии:

- сырой PDF: `Jeep Compass 1.3 T-GDi Longitude FWD.pdf`
- правильный PDF: `Jeep Compass 1.3 T-GDi Longitude FWD_.pdf`

Подтвержденные правила:

- удалить voucher / `Save cash`;
- удалить `Stock number` и номер `YK15020`;
- удалить `In high demand` и watchlist-сообщения;
- удалить видео-оверлей, progress bar и `0:00 / 0:36`;
- удалить delivery / pickup / logistics / цены / сроки;
- удалить `Total Pictures` и служебные gallery-сообщения;
- удалить legal/footer-only страницу AUTO1;
- сохранить фото, характеристики, damage, equipment, service, inspection и VIN/equipment sections.

## Где читать детали

```text
docs/auto1-pdf-learning/jeep-compass-demo/confirmed-change-log.md
docs/auto1-pdf-learning/jeep-compass-demo/format-learning-note.md
docs/auto1-pdf-learning/jeep-compass-demo/recording-summary.md
```

## Следующая правильная версия

Следующий cleaner/skill нужно строить от подтвержденного change log, а не от старой первой версии. Обязательный workflow:

1. Рендерить сырой PDF в страницы.
2. Удалять подтвержденные AUTO1/internal artifacts.
3. Сохранять клиентские sections.
4. Рендерить результат.
5. Визуально проверять первую страницу, фото, delivery cleanup, damage summary и финальные footer/legal страницы.

Пока новая автоматизация не протестирована на нескольких отчетах AUTO1, готовый PDF перед отправкой клиенту нужно проверять глазами.
