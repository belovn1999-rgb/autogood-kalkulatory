# 4. Проверка VIN

Цель: сделать внутреннюю проверку VIN через partslink24 и получать PDF-отчет без ручного входа, кликов и переименования файла.

## Поля проверки

1. Язык: `RU` / `PL` / `ENG`
2. Марка авто
3. VIN для проверки

## Первый набор марок

| Марка | Способ поиска | Проверочный VIN | Язык примера | PDF подтвержден |
| --- | --- | --- | --- | --- |
| BMW | Общий поиск VIN на стартовой странице | `WBA31AA0905V40977` | `RU` | Да |
| Mercedes-Benz | Сначала плитка `Mercedes-Benz`, потом VIN внутри марки | `WDD2120481A322032` | `PL` | Да |
| Volvo | Общий поиск VIN на стартовой странице | `YV1ZZK5V2P2106956` | `PL` | Да |
| Peugeot | Сначала плитка `Peugeot`, потом VIN внутри марки | `VF3MCYHZUMS121613` | `RU` | Да |
| Audi | Общий поиск VIN на стартовой странице | `WAUZZZ4M3RD016484` | `PL` | Да |

## Логика маршрутизации

`general_vin_search`:

- BMW
- Volvo
- Audi

`brand_first_search`:

- Mercedes-Benz
- Peugeot

## Критерий успешного PDF

PDF считается успешным, если:

- файл создан и не пустой;
- `Subject` в метаданных PDF равен VIN;
- `Keywords` содержит `partslink24`;
- `Keywords` содержит ожидаемую марку;
- текст PDF содержит VIN.

Дополнительные проверки:

- BMW: в тексте ожидаются `Идентификация автомобиля`, `Серийная комплектация` или `Спецоборудование`.
- Mercedes-Benz: в тексте ожидаются `identyfikacja pojazdu`, `Wyposazenie` или `SAA Numbers`.
- Volvo: в тексте ожидаются `identyfikacja pojazdu`, `Wyposazenie` или `Informacje techniczne`.
- Peugeot: дата производства не обязательна; в тексте ожидаются `Идентификация автомобиля`, `Модель` и `Оснащение`.
- Audi: в тексте ожидаются `identyfikacja pojazdu`, `Data produkcji` и `Wyposazenie`.

## Пароли и доступы

Нельзя хранить в GitHub:

- partslink24 ID компании;
- имя пользователя;
- пароль;
- cookies/session storage браузера;
- реальные скачанные клиентские PDF, если они не нужны как тестовые артефакты.

Правильное место для секретов:

- локальный `.env` на Mac или сервере;
- переменные окружения на сервере;
- GitHub Secrets, если позже будет CI/CD без запуска самой браузерной автоматизации.

Пример закрытого `.env`:

```text
PARTSLINK24_COMPANY_ID=...
PARTSLINK24_USERNAME=...
PARTSLINK24_PASSWORD=...
PARTSLINK24_DEFAULT_LANGUAGE=RU
```

Файл `.env` должен быть закрыт через `.gitignore`.

## Следующий технический шаг

1. Подготовить Playwright-скрипт входа в partslink24.
2. Проверить первый BMW VIN: `WBA31AA0905V40977`.
3. Сохранить PDF автоматически в `output/partslink24/`.
4. Проверить PDF через `tools/partslink24/validate-pdf.mjs`.

## Команды для локальной проверки

Перед запуском нужно задать секреты только в локальном окружении:

```bash
export PARTSLINK24_COMPANY_ID="..."
export PARTSLINK24_USERNAME="..."
export PARTSLINK24_PASSWORD="..."
```

Проверка BMW через partslink24:

```bash
node tools/partslink24/download-vin-pdf.mjs \
  --brand BMW \
  --vin WBA31AA0905V40977 \
  --language RU \
  --headed
```

Проверка готового PDF:

```bash
node tools/partslink24/validate-pdf.mjs \
  output/partslink24/BMW_WBA31AA0905V40977_RU.pdf \
  --brand BMW \
  --vin WBA31AA0905V40977
```
