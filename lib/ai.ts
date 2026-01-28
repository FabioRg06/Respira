import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.EXPO_PUBLIC_GEMINI_API_KEY!
);

export async function analyzeThought(
  thought: string,
  trigger: string,
  emotions: string
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
  });

  const prompt = `
Eres un psicólogo empático.
Analiza este pensamiento:

Pensamiento: ${thought}
Disparador: ${trigger}
Emociones: ${emotions}

trata de dar respuestas concretas evita respuestas excesasmente largas.
intenta no usar markdown si usas listas haslo con emojis, y las negritas con **.
Responde con empatía y ofrece perspectiva constructiva.
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateWeeklySummary(thoughts: any[]) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
  });

  const thoughtsText = thoughts.map((t, i) =>
    `Pensamiento ${i + 1}: ${t.thought_content}
Disparador: ${t.trigger_event || 'No especificado'}
Emociones: ${Array.isArray(t.emotions) ? t.emotions.join(', ') : t.emotions || 'No especificadas'}
Importante: ${t.is_important ? 'Sí' : 'No'}`
  ).join('\n\n');

  const prompt = `
Eres un psicólogo empático. Genera un resumen semanal constructivo basado en estos pensamientos del usuario.

Pensamientos de la semana:
${thoughtsText}

Instrucciones:
- Sé empático y alentador
- Identifica patrones o temas recurrentes
- Ofrece perspectivas constructivas
- Mantén un tono positivo y de apoyo
- Incluye estadísticas básicas (número de pensamientos, importantes)
- Evita respuestas excesivamente largas
- Usa ** para negritas si es necesario
- Si usas listas, hazlo con emojis
- los mensajes tienen que ser comprensibles y naturales y que tengan sentido

Responde como un resumen semanal personalizado.
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateGeneralChatResponse(context: string, userMessage: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
  });

  const prompt = `
Eres un psicólogo empático en una conversación general. Responde de manera inquisitiva, no concluyente.

Contexto de la conversación:
${context}

Mensaje del usuario: ${userMessage}

Instrucciones:
- Sé empático y de apoyo
- Mantén respuestas cortas: menos de 20 palabras normalmente, hasta 50 si es una conclusión importante
- No siempre hagas preguntas, cuando lo amerita 
- Usa un tono conversacional y cálido
- Evita respuestas excesivamente largas
- los mensajes tienen que ser comprensibles y naturales y que tengan sentido 

Responde como si estuvieras continuando la conversación.
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateThoughtChatResponse(thought: string, trigger: string, emotions: string, context: string, userMessage: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
  });

  const prompt = `
Eres un psicólogo empático ayudando con un pensamiento específico.

Pensamiento original: ${thought}
Disparador: ${trigger}
Emociones: ${emotions}

Contexto de la conversación:
${context}

Mensaje del usuario: ${userMessage}

Instrucciones:
- Sé empático y enfócate en este pensamiento específico
- Mantén respuestas cortas: menos de 20 palabras normalmente, hasta 50 si es una conclusión importante
- No siempre hagas preguntas, cuando lo amerita 
- Usa un tono de apoyo y comprensión
- Evita respuestas excesivamente largas

Responde como si estuvieras continuando la conversación sobre este pensamiento.
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
