# Цифровой двойник на OpenRouter для Render

Готовый проект: сервер Node.js + страница чата + виджет для вставки на сайт.

## Что внутри

- `server.js` — сервер Express и API `/chat`.
- `public/index.html` — готовая страница чата.
- `public/widget.js` — плавающий чат-виджет для вставки на другой сайт.
- `render.yaml` — настройки для Render Blueprint.
- `.env.example` — пример переменных окружения.
- `embed-code.html` — код для вставки виджета на сайт.

## Как загрузить на Render

### 1. Загрузите проект на GitHub

1. Создайте новый репозиторий на GitHub.
2. Загрузите все файлы из этой папки.
3. Убедитесь, что в репозитории есть `package.json`, `server.js`, папка `public` и `render.yaml`.

### 2. Создайте Web Service на Render

1. Откройте Render.
2. Нажмите **New +** → **Web Service**.
3. Подключите GitHub-репозиторий.
4. Выберите:
   - Runtime: **Node**
   - Build Command: `npm install`
   - Start Command: `npm start`

Не выбирайте **Static Site**, потому что проекту нужен сервер-посредник для хранения API-ключа.

### 3. Добавьте переменные Environment

В Render откройте сервис → **Environment** и добавьте:

```env
OPENROUTER_API_KEY=ваш_ключ_OpenRouter
OPENROUTER_MODEL=deepseek/deepseek-v4-flash:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_SITE_URL=https://ваш-сайт.ru
OPENROUTER_APP_NAME=Учительская 2.0 — цифровой двойник
ALLOWED_ORIGINS=*
TEMPERATURE=0.7
MAX_TOKENS=900
```

Если бесплатная модель будет перегружена, замените модель на платную:

```env
OPENROUTER_MODEL=deepseek/deepseek-v4-flash
```

Для рабочего сайта вместо `ALLOWED_ORIGINS=*` лучше указать свой домен, например:

```env
ALLOWED_ORIGINS=https://savka86.github.io,https://ваш-сайт.ru
```

### 4. Проверка

После деплоя откройте:

```text
https://ВАШ-СЕРВИС.onrender.com/health
```

Если всё хорошо, увидите примерно:

```json
{"ok":true,"provider":"openrouter","model":"deepseek/deepseek-v4-flash:free"}
```

Потом откройте главную страницу:

```text
https://ВАШ-СЕРВИС.onrender.com/
```

## Как вставить виджет на другой сайт

Вставьте перед `</body>`:

```html
<script
  src="https://ВАШ-СЕРВИС.onrender.com/widget.js"
  data-title="ИИ-помощник Савелия Николаевича"
  data-subtitle="Учительская 2.0">
</script>
```

## Как изменить личность цифрового двойника

Откройте `server.js` и найдите `DEFAULT_SYSTEM_PROMPT`.
Там можно изменить стиль, роль, правила ответа и информацию о проекте.

Или добавьте переменную окружения `SYSTEM_PROMPT` в Render и вставьте туда свой полный промт.

## Важно

Не вставляйте `OPENROUTER_API_KEY` в HTML, CSS или JavaScript на сайте. Ключ должен храниться только на сервере Render в Environment.
