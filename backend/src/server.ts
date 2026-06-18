import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Включаем CORS и чтение JSON-тел запросов
app.use(cors());
app.use(express.json());

// Тестовый роут для проверки связи с фронтом
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CVProphet бэкенд успешно запущен!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер CVProphet запущен на порту ${PORT}`);
});