import 'dotenv/config';

const API_KEY = process.env.GEMINI_API_KEY as string;

export const fetchAiStream = async (
  topic: string,
  count = 200,
): Promise<string[]> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Ты — генератор контента для настольных игр. Сгенерируй список из ${count} уникальных слов для игры Alias на тему: "${topic}".

Правила:
1. Только существительные в именительном падеже и единственном числе.
2. Никаких однокоренных слов с темой "${topic}".
3. Исключи любые повторы. Все слова в списке должны быть разными.
4. Используй смесь простых предметов, действий (в форме существительных, например "бег" или "прыжок") и более сложных понятий, чтобы игра была интересной.
Используй ассоциации разного порядка: как прямые, так и косвенные.

Формат вывода:
только список слов без нумераций`,
            },
          ],
        },
      ],
    }),
  });

  const data: any = await response.json();
  return data?.candidates[0].content.parts[0].text.split('\n');
};
