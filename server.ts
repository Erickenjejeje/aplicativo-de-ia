import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

let currentKeyIndex = 0;

function getKeys() {
  const keysString = process.env.OPENROUTER_KEYS || '';
  return keysString.split(',').map(key => key.trim()).filter(Boolean);
}

const API_KEYS = getKeys();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for chat
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, model } = req.body;
      
      let attempts = 0;
      let success = false;
      let data = null;
      let lastErrorStatus = 500;

      while (attempts < API_KEYS.length && !success) {
        const currentKey = API_KEYS[currentKeyIndex];
        
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${currentKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://aistudio.google.com', // Optional
              'X-Title': 'AI Studio App', // Optional
            },
            body: JSON.stringify({
              model: ['openai/gpt-5.5', 'openai/gpt-5.5-pro'].includes(model) ? 'openai/gpt-4o-mini' : 
                     ['google/gemini-3.1-pro-preview', 'google/gemini-3.5-flash', 'fictitious/agent-ng'].includes(model) ? 'google/gemini-2.5-flash' : 
                     ['qwen/qwen3.6-flash', 'qwen/qwen3.7-max'].includes(model) ? 'google/gemini-2.5-flash' : 
                     ['anthropic/claude-opus-4.7'].includes(model) ? 'google/gemini-2.5-flash' : 
                     ['x-ai/grok-4.3'].includes(model) ? 'google/gemini-2.5-flash' :
                     'google/gemini-2.5-flash',
              messages: [
                {
                  role: 'system',
                  content: `Você é um assistente virtual avançado. ${
                    ['openai/gpt-5.5', 'openai/gpt-5.5-pro'].includes(model) ? 'Você é o GPT-5.5 (ou GPT-5.5 Pro caso especificado), o modelo de IA mais capaz desenvolvido pela OpenAI.' :
                    model === 'anthropic/claude-opus-4.7' ? 'Você é o Claude Opus 4.7, um modelo imensamente capaz desenvolvido pela Anthropic.' :
                    model === 'qwen/qwen3.6-flash' ? 'Você é o Qwen 3.6 Flash, um modelo incrivelmente poderoso desenvolvido pela Alibaba Cloud.' :
                    model === 'qwen/qwen3.7-max' ? 'Você é o Qwen 3.7 Max, o modelo mais poderoso e capaz desenvolvido pela Alibaba Cloud.' :
                    model === 'google/gemini-3.1-pro-preview' ? 'Você é o Gemini 3.1 Pro, uma inteligência artificial de ponta desenvolvida pelo Google.' :
                    model === 'google/gemini-3.5-flash' ? 'Você é o Gemini 3.5 Flash, um modelo rápido e eficiente desenvolvido pelo Google.' :
                    model === 'x-ai/grok-4.3' ? 'Você é o Grok 4.3, uma IA desenvolvida pela xAI. Seja sempre sincero sobre sua identidade.' :
                    model === 'fictitious/agent-ng' ? 'Você é o Agent NG, um super agente futurista fictício.' :
                    ''
                  } ATENÇÃO SOBRE SUA IDENTIDADE: Não importa o modelo base por trás da API, você SEMPRE deve assumir que é o modelo especificado na frase anterior e foi criado pela empresa citada. Nunca mencione ser da OpenAI, Google ou Anthropic se você foi instruído a ser o Qwen, Grok, etc. Para solicitações e perguntas simples, responda de forma direta, natural e concisa. Apenas quando solicitado a criar textos, explicações longas ou tópicos complexos, você DEVE formatar suas respostas utilizando marcação Markdown (subtítulos \`##\`, listas com marcadores \`* \` e numerais, negrito para termos chave) com generosos espaçamentos em branco entre os parágrafos para facilitar a leitura.`
                },
                ...messages
              ],
              max_tokens: 1500,
            }),
          });

          if (response.status === 402 || response.status === 429) {
             console.warn(`Key at index ${currentKeyIndex} is exhausted/rate-limited. Status: ${response.status}. Rotating key...`);
             currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
             attempts++;
             lastErrorStatus = response.status;
          } else if (!response.ok) {
             const errorData = await response.text();
             console.error('OpenRouter API Error:', errorData);
             return res.status(response.status).json({ error: 'Failed to communicate with OpenRouter' });
          } else {
             data = await response.json();
             success = true;
          }
        } catch (fetchError) {
           console.error("Fetch error during OpenRouter call:", fetchError);
           // Se a rede falhar, tentamos a próxima chave? Normalmente erro de rede não é erro de cota, mas por garantia podemos falhar direto
           return res.status(500).json({ error: 'Network error communicating with OpenRouter' });
        }
      }

      if (success && data) {
         return res.json(data);
      } else {
         return res.status(lastErrorStatus).json({ error: 'All API keys are exhausted or rate-limited.' });
      }

    } catch (error) {
      console.error('Server side error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
