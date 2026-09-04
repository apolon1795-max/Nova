# Развёртывание теста Новатории в Yandex Cloud

Инструкция рассчитана на YDB Serverless, Cloud Functions Node.js 22 и статический сайт в Object Storage. Секреты в репозиторий не сохраняются.

## 0. Финансовый стоп-контроль

Yandex Cloud предоставляет бесплатные месячные объёмы для Cloud Functions, YDB и Object Storage, но после их превышения начинает действовать тарификация. Неиспользованный бесплатный объём обнуляется в конце месяца. Перед запуском нужно оставить включёнными бюджетные уведомления и не обещать клиенту «бесплатно при любом трафике».

Источники: [free tier Yandex Cloud](https://yandex.cloud/ru/docs/billing/concepts/serverless-free-tier), [тарифы Object Storage](https://yandex.cloud/ru/docs/storage/pricing).

## 1. Подготовить YDB и сервисный аккаунт

Можно использовать уже созданную serverless-базу YDB, если Новатория является допустимым владельцем этих данных. Код создаёт отдельную таблицу `novatoria_quiz_leads`, поэтому новая база технически не обязательна.

Для отдельной базы и сервисного аккаунта:

```bash
yc ydb database create novatoria-leads --serverless
yc iam service-account create --name novatoria-quiz-function-sa
yc ydb database list
yc iam service-account list
```

Назначить сервисному аккаунту роль только на нужную базу:

```bash
yc ydb database add-access-binding \
  --id DB_ID \
  --role ydb.editor \
  --service-account-id SERVICE_ACCOUNT_ID
```

Роль нужна функции для создания таблицы и записи заявок. Источники: [управление YDB](https://yandex.cloud/ru/docs/ydb/operations/manage-databases), [доступ к YDB](https://yandex.cloud/ru/docs/ydb/security/).

## 2. Собрать архив функции

Из корня проекта:

```bash
npm --prefix backend/yandex-function ci
npm --prefix backend/yandex-function test
cd backend/yandex-function
zip -r /tmp/novatoria-quiz-function.zip dist package.json package-lock.json
```

Cloud Functions установит production-зависимости из `package.json` и `package-lock.json`. TypeScript уже скомпилирован в `dist`.

Источники: [зависимости Node.js-функций](https://yandex.cloud/ru/docs/functions/lang/nodejs/dependencies), [runtime Node.js](https://yandex.cloud/ru/docs/functions/concepts/runtime/).

## 3. Создать функцию

```bash
yc serverless function create --name novatoria-quiz-lead-receiver
```

Создать версию из `/tmp/novatoria-quiz-function.zip` со следующими настройками:

- runtime: `Node.js 22`;
- точка входа: `dist/index.handler`;
- память: `256 МБ`;
- timeout: `15 секунд`;
- сервисный аккаунт: `novatoria-quiz-function-sa`;
- `LEAD_STORAGE_MODE` не задавать.

Переменные функции:

```dotenv
ALLOWED_ORIGINS=https://ИМЯ-БАКЕТА.website.yandexcloud.net|https://nova-pi-eosin.vercel.app
YDB_CONNECTION_STRING=grpcs://ydb.serverless.yandexcloud.net:2135/?database=/ru-central1/...
YDB_TABLE_NAME=novatoria_quiz_leads
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
TELEGRAM_INCLUDE_CONTACTS=true
```

`TELEGRAM_RELAY_URL` сначала оставить пустым: функция попробует отправлять уведомления напрямую. Токен бота нельзя добавлять в переменные с префиксом `VITE_` и нельзя сохранять в Git.

Разрешить публичный вызов функции:

```bash
yc serverless function allow-unauthenticated-invoke novatoria-quiz-lead-receiver
```

Публичный вызов необходим форме, но функция принимает браузерные запросы только с точных адресов из `ALLOWED_ORIGINS` и дополнительно проверяет структуру заявки.

Источники: [создание версии функции](https://yandex.cloud/ru/docs/functions/operations/function/version-manage), [публичный вызов](https://yandex.cloud/ru/docs/functions/operations/function/function-public), [Cloud Functions → YDB](https://yandex.cloud/ru/docs/tutorials/serverless/connect-from-cf-nodejs).

## 4. Собрать статический сайт

Получить публичный HTTPS-адрес функции вида `https://functions.yandexcloud.net/FUNCTION_ID`, затем выполнить:

```bash
VITE_LEAD_ENDPOINT=https://functions.yandexcloud.net/FUNCTION_ID \
VITE_PRIVACY_URL=https://новатория18.рф/page38711582.html \
npm run build
```

В `dist/` появится готовый статический сайт. Адрес функции публичный и не является секретом; токен Telegram в сборку не попадает.

## 5. Разместить сайт в Object Storage

Создать бакет без точки в имени, например `novatoria-quiz`. Для такого имени Yandex предоставляет стандартный HTTPS-адрес без загрузки собственного сертификата.

В настройках бакета:

- открыть публичное чтение объектов;
- включить «Хостинг»;
- главная страница: `index.html`;
- страница ошибки: `index.html`;
- загрузить содержимое `dist/` с сохранением папок.

Канонический адрес будет иметь вид `https://novatoria-quiz.website.yandexcloud.net`. Именно его нужно указать первым адресом в `ALLOWED_ORIGINS` функции и после изменения создать новую версию функции. Символ `|` разделяет разрешённые адреса.

Источники: [настройка статического хостинга](https://yandex.cloud/ru/docs/storage/operations/hosting/setup), [HTTPS для Object Storage](https://yandex.cloud/ru/docs/storage/operations/hosting/certificate).

## 6. Контрольный производственный тест

До передачи ссылки пройти тест в реальном браузере и отправить одну заранее согласованную тестовую заявку. Затем проверить:

1. в `novatoria_quiz_leads` появилась одна строка с тем же `lead_id`;
2. в `payload_json` сохранены имя и телефон мамы, результат, три сильные стороны и UTM-контекст;
3. Telegram получил имя мамы, тот же телефон и результат;
4. интерфейс показал успех только после сохранения;
5. работают «Получить приглашение», «Скопировать результат» и «Скачать результат»;
6. повторный POST с тем же `lead_id` возвращает `duplicate: true` и не создаёт вторую строку;
7. запрос с чужим `Origin` получает 403;
8. старт, вопросы, форма и карточка корректны на экранах 375×812 и 1440×900.

Если Telegram вернул `failed`, лид всё равно остаётся в YDB. В таком состоянии приложение нельзя считать готовым к передаче: нужно отдельно восстановить канал уведомлений или согласовать другой канал.
