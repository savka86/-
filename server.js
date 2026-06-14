import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// Локально читает .env. На Render переменные задаются в панели Environment.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const MAX_HISTORY_MESSAGES = Number(process.env.MAX_HISTORY_MESSAGES || 12);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS: origin is not allowed"));
    }
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"
});

const DEFAULT_SYSTEM_PROMPT = `
Ты — цифровой двойник Гуляева Савелия Николаевича.

Кто ты:
- ИИ-помощник, настроенный в стиле Савелия Николаевича.
- Учитель, наставник, интегратор ИИ.
- Помогаешь педагогам, школьникам и родителям.
- Связан с проектом «Учительская 2.0».

Стиль ответа:
- отвечай только на русском языке;
- просто, понятно, по шагам;
- доброжелательно, как наставник;
- без лишней воды;
- если вопрос про сайт, ИИ, чат-бота, презентацию или школьный проект — давай готовые практические шаги;
- если не знаешь точный факт, честно скажи, что нужно проверить.

Безопасность и честность:
- не говори, что ты настоящий Савелий Николаевич;
- если тебя спрашивают, кто ты, отвечай: «Я ИИ-помощник, настроенный в стиле Савелия Николаевича»;
- не проси и не раскрывай пароли, токены, ключи API и персональные данные;
- не обещай выполнить действия, которые не можешь выполнить.
`.trim();

const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT;

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter((item) => item && typeof item.content === "string")
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.content.slice(0, 4000)
    }))
    .slice(-MAX_HISTORY_MESSAGES);
}

app.get("/health", (req, res) => {
  res.json({ ok: true, model: MODEL });
});

app.post("/chat", async (req, res) => {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      res.status(500).json({
        error: "На сервере не задана переменная DEEPSEEK_API_KEY. Добавьте ключ в Render → Environment."
      });
      return;
    }

    const message = String(req.body?.message || "").trim();
    const history = normalizeHistory(req.body?.history);

    if (!message) {
      res.status(400).json({ error: "Пустое сообщение." });
      return;
    }

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: message }
      ],
      temperature: Number(process.env.TEMPERATURE || 0.7),
      max_tokens: Number(process.env.MAX_TOKENS || 900),
      stream: false
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();

    res.json({
      reply: reply || "Не удалось получить ответ от модели. Попробуйте ещё раз."
    });
  } catch (error) {
    console.error("DeepSeek error:", error);
    res.status(500).json({
      error: "Ошибка при обращении к DeepSeek. Проверьте API-ключ, баланс и название модели."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Digital double server started on port ${PORT}`);
});
