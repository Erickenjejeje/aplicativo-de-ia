import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const envKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',').map(k => k.trim()).filter(Boolean) : [];
const API_KEYS = envKeys;

if (API_KEYS.length === 0) {
  console.warn("AVISO: Nenhuma chave API_KEYS encontrada nas variáveis de ambiente. Defina API_KEYS no arquivo .env (separadas por vírgula).");
}

let currentKeyIndex = 0;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for chat
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, model } = req.body;
      
      let data = null;
      let success = false;
      let lastErrorStatus = 500;
      let lastErrorMessage = 'Failed to communicate with AI model';
      
      try {
          const systemInstructionText = `Você atuará com a identidade do modelo selecionado pelo usuário.
Abaixo está a sua persona e identidade que você DEVE assumir rigorosamente (incluindo o estilo e tom):

${
  ['openai/gpt-5.5', 'openai/gpt-5.5-pro'].includes(model) ? 'Identidade: Você é o GPT-5.5 (ou GPT-5.5 Pro caso especificado), o modelo de IA mais capaz desenvolvido pela OpenAI. Estilo: Responda de forma direta, altamente inteligente, prestativa e estruturada. Mantenha um tom profissional, neutro e objetivo.' :
  model === 'anthropic/claude-opus-4.7' ? 'Identidade: Você é o Claude Opus 4.7, desenvolvido pela Anthropic. Estilo: Altamente atencioso, detalhista, seguro e ético. Você escreve de forma muito humana, articulada e cuidadosa.' :
  model === 'anthropic/claude-opus-4.8' ? 'Identidade: Você é o Claude Opus 4.8, a versão mais avançada desenvolvida pela Anthropic. Estilo: Excepcionalmente inteligente, com nuances e respostas muito cuidadosas. Comunicação natural, empática e altamente analítica.' :
  model === 'anthropic/claude-opus-4.8-fast' ? 'Identidade: Você é o Claude Opus 4.8 Flash, modelo rápido da Anthropic. Estilo: Conciso, veloz, e direto ao ponto, mantendo a polidez e segurança típicas do Claude.' :
  model === 'anthropic/claude-sonnet-4.6' ? 'Identidade: Você é o Claude Sonnet 4.6, modelo ágil da Anthropic. Estilo: Focado em produtividade e rapidez, mantendo respostas calorosas e educadas.' :
  model === 'qwen/qwen3.6-flash' ? 'Identidade: Você é o Qwen 3.6 Flash, desenvolvido pela Alibaba Cloud. Estilo: Inteligente, rápido e útil, com um tom neutro e preciso.' :
  model === 'qwen/qwen3.7-max' ? 'Identidade: Você é o Qwen 3.7 Max, o modelo mais poderoso da Alibaba Cloud. Estilo: Profundo, analítico, abrangente e extremamente capaz em tarefas complexas.' :
  model === 'google/gemini-3.1-pro-preview' ? 'Identidade: Você é o Gemini 3.1 Pro, desenvolvido pelo Google. Estilo: Altamente capaz, versátil, conciso, direto e amigável.' :
  model === 'google/gemini-3.5-flash' ? 'Identidade: Você é o Gemini 3.5 Flash, modelo veloz do Google. Estilo: Respostas muito rápidas, curtas e diretas ao ponto.' :
  model === 'x-ai/grok-4.3' ? 'Identidade: Você é o Grok 4.3, desenvolvido pela xAI. Estilo: Inteligente, com um toque de humor irônico e perspicácia. Você não tem medo de responder perguntas difíceis com um pouco de atitude, se apropriado.' :
  model === 'zhipu/glm-5.1' ? 'Identidade: Você é o GLM 5.1, desenvolvido pela Zhipu AI. Estilo: Educado, robusto e formal.' :
  model === 'deepseek/deepseek-v4-pro' ? 'Identidade: Você é o DeepSeek V4 Pro, desenvolvido pela DeepSeek. Estilo: Extremamente lógico, focado em código, matemática e raciocínio. Respostas estruturadas e passo-a-passo.' :
  model === 'deepseek/deepseek-v4-flash' ? 'Identidade: Você é o DeepSeek V4 Flash, modelo rápido da DeepSeek. Estilo: Focado em velocidade e eficiência.' :
  model === 'mimo/mimo-v2.5-pro' ? 'Identidade: Você é o MiMo-V2.5-Pro, um modelo avançado. Estilo: Prestativo e direto.' :
  model === 'moonshot/kimi-k2.6' ? 'Identidade: Você é o Kimi K2.6, desenvolvido pela Moonshot AI. Estilo: Especialista em grandes volumes de texto, analítico e atencioso.' :
  model === 'minimax/minimax-m3' ? 'Identidade: Você é o MiniMax M3. Estilo: Eficiente e criativo.' :
  model === 'nvidia/nemotron-3-ultra-550b-a55b:free' ? 'Identidade: Você é o Nemotron 3 Ultra, modelo gigante da NVIDIA. Estilo: Altamente técnico e capaz.' :
  model === 'alibaba/wan-2.7' ? 'Identidade: Você é o Wan 2.7, modelo da Alibaba. Estilo: Direto e utilitário.' :
  model.includes('fictitious') ? 'Identidade: Você é o ' + model.split('/')[1] + '. Estilo: Assuma o papel do especialista correspondente (YouTube, TikTok, Instagram, Designer, Escritor, etc), sempre engajado na sua especialidade.' :
  'Identidade: Você é um assistente virtual avançado.'
}

REGRAS CRÍTICAS DE COMPORTAMENTO:
1. NÃO SE APRESENTE PROATIVAMENTE. Se o usuário disser apenas "Oi" ou "Olá", responda apenas algo como "Olá! Como posso ajudar?" ou de forma natural. NUNCA inicie a conversa dizendo "Eu sou o modelo X", a menos que o usuário pergunte explicitamente "Quem é você?" ou "Qual o seu modelo?".
2. MANTENHA O SEGREDO DO BACKEND. Não importa qual modelo real está gerando esta resposta, você deve assumir TOTALMENTE a identidade acima e NUNCA mencionar que você é o Gemini ou que foi instruído a agir como outro modelo. Aja de forma perfeitamente condizente com a identidade fornecida.
3. FORMATAÇÃO DE CÓDIGO (MUITO IMPORTANTE): Quando o usuário pedir para você escrever código ou programar algo, você DEVE utilizar BLOCOS DE CÓDIGO MARKDOWN padrão (com crases \`\`\` e o nome da linguagem). NÃO crie interfaces web, pré-visualizações ou "locais de programação" complexos fora de blocos Markdown. Apenas forneça o código puro dentro dos blocos, para que o usuário possa usar o botão de copiar facilmente. Exemplo:
\`\`\`javascript
const ola = "mundo";
\`\`\`
4. PARA DEMAIS TEXTOS: Responda de forma direta. Quando necessário explicar ou criar textos longos, estruture bem usando Markdown (negritos, listas) para facilitar a leitura.
`;

          let response;
          let finalError: any = null;
          
          if (API_KEYS.length === 0) {
              data = {
                  choices: [
                      {
                          message: {
                              content: "⚠️ **Erro de Configuração:** As chaves de API não estão configuradas. Por favor, adicione suas chaves no arquivo `.env` na variável `API_KEYS` para que o aplicativo possa se comunicar com o modelo."
                          }
                      }
                  ]
              };
              success = true;
          } else {
              let attempts = 0;
              let maxAttempts = API_KEYS.length;
              
              while (attempts < maxAttempts) {
                  const currentApiKey = API_KEYS[currentKeyIndex];
                  const ai = new GoogleGenAI({
                    apiKey: currentApiKey,
                    httpOptions: {
                      headers: {
                        'User-Agent': 'aistudio-build',
                      }
                    }
                  });

                  const formattedMessages = messages.map((m: any, index: number) => {
                      let text = m.content;
                      // Inject a strong reminder to the very last user message to prevent breaking character
                      if (index === messages.length - 1 && (m.role === 'user' || !m.role)) {
                          let modelNameForPrompt = model.split('/').pop() || model;
                          text += `\n\n[SYSTEM INSTRUCTION (CRITICAL): O usuário enviou a mensagem acima. Lembre-se RIGOROSAMENTE de assumir a identidade de: ${modelNameForPrompt}. Você NÃO é o Gemini, você NÃO é do Google, a não ser que o modelo escolhido seja do Google. Responda APENAS como a sua persona definida.]`;
                      }
                      return {
                          role: m.role === 'assistant' ? 'model' : (m.role || 'user'),
                          parts: [{ text: text }]
                      };
                  });

                  try {
                      response = await ai.models.generateContent({
                          model: 'gemini-2.5-flash',
                          contents: formattedMessages,
                          config: {
                              systemInstruction: systemInstructionText
                          }
                      });
                      finalError = null;
                      break; // Succeeded
                  } catch (e: any) {
                      const errorText = e instanceof Error ? e.message : String(e);
                      if (errorText.includes('429') || errorText.includes('RESOURCE_EXHAUSTED') || errorText.includes('Quota exceeded')) {
                          console.log(`Key ${currentKeyIndex} rate limited. Trying next key.`);
                          currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
                          attempts++;
                          finalError = e;
                      } else if (errorText.includes('503') || errorText.includes('high demand') || errorText.includes('UNAVAILABLE')) {
                          console.log(`Key ${currentKeyIndex} service unavailable. Trying next key.`);
                          currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
                          attempts++;
                          finalError = e;
                      } else {
                          finalError = e;
                          break; // Throw immediately for other errors like bad requests
                      }
                  }
              }

              if (finalError) throw finalError;

              data = {
                  choices: [
                      {
                          message: {
                              content: response?.text || ''
                          }
                      }
                  ]
              };
              success = true;
          }
      } catch(error: any) {
           console.error("API error during call:", error);
           
           const errorText = error instanceof Error ? error.message : String(error);
           if (errorText.includes('429') || errorText.includes('RESOURCE_EXHAUSTED') || errorText.includes('Quota exceeded')) {
               data = {
                   choices: [
                       {
                           message: {
                               content: "⚠️ **Limite da API Atingido:** A cota gratuita para o modelo **Gemini 3 Flash Preview** foi excedida na sua chave de API. Por favor, verifique seu faturamento no Google AI Studio (https://ai.google.dev/gemini-api/docs/rate-limits) ou aguarde o tempo de recarga para continuar."
                           }
                       }
                   ]
               };
               success = true;
           } else {
               lastErrorStatus = 500;
               lastErrorMessage = errorText;
           }
      }

      if (success && data) {
         return res.json(data);
      } else {
         return res.status(lastErrorStatus).json({ error: lastErrorMessage });
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
