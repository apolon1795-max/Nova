# Производственное состояние

Срез на 4 сентября 2026 года. В этом файле нет токенов и других секретов.

## Адреса

- Основная ссылка, которую нужно сохранить: <https://nova-pi-eosin.vercel.app>
- Резервная статическая копия: <https://novatoria-quiz-2026.website.yandexcloud.net>
- Приёмщик лидов: <https://functions.yandexcloud.net/d4ehppuj1qvhbg70337s>

## Созданные ресурсы Yandex Cloud

- Cloud Function `novatoria-quiz-lead-receiver`, ID `d4ehppuj1qvhbg70337s`;
- активная версия функции `d4el8rnjm032m92o09e6`;
- serverless YDB `novatoria-leads`, ID `etnej44j55qpplabldsl`;
- таблица лидов `novatoria_quiz_leads`;
- Object Storage bucket `novatoria-quiz-2026` с лимитом 100 МБ;
- сервисный аккаунт функции имеет роль `ydb.editor` только на этой базе.

Функция разрешает точные источники `https://nova-pi-eosin.vercel.app` и `https://novatoria-quiz-2026.website.yandexcloud.net`. Произвольный `Origin` отклоняется.

## Что проверено

- TypeScript frontend и backend собираются без ошибок;
- 15 серверных тестов проходят;
- npm audit frontend и backend: 0 известных уязвимостей;
- проверены все 9 765 625 сочетаний ответов: каждый из восьми результатов достижим, доли лежат в диапазоне 8,77–16,62%;
- ручная проверка интерфейса выполнена на 1280×720 и 375×812;
- горизонтального переполнения и ошибок консоли нет;
- локальный сценарий проходит от первого вопроса до сохранения, копирования текста и карточки для скриншота;
- YDB приняла тестовый лид и вернула тот же `lead_id` при повторной идемпотентной отправке;
- разрешённый CORS preflight возвращает 204, посторонний источник — 403.

## Что ещё требует владельца

В активной версии функции пока нет `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`. До их добавления лиды сохраняются в YDB, но уведомления в Telegram не отправляются. После добавления секретов нужен один согласованный тест уведомления в реальный чат.

Также до коммерческой передачи нужно подтвердить право использования портретов предпринимателей или заменить их лицензированными материалами. См. [ASSETS.md](ASSETS.md).

Нулевую стоимость нельзя гарантировать без условий: Yandex Cloud бесплатен в пределах опубликованных месячных объёмов, а Vercel Hobby предназначен для личного некоммерческого использования. Источники: [Yandex Cloud free tier](https://yandex.cloud/ru/docs/billing/concepts/serverless-free-tier), [Vercel Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines).
