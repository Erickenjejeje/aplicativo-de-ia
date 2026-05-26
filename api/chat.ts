export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages, model } = req.body;
    
    let data = null;
    let success = false;
    let lastErrorStatus = 500;
    let lastErrorMessage = 'Failed to communicate with AI model';
    
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.error('GEMINI_API_KEY environment variable is not set');
            return res.status(500).json({ error: 'A chave da API Gemini (GEMINI_API_KEY) não está configurada no servidor Vercel. Por favor, adicione-a nas variáveis de ambiente do seu painel na Vercel.' });
        }

        const systemInstructionText = `Você é um assistente virtual avançado. ${
                  ['openai/gpt-5.5', 'openai/gpt-5.5-pro'].includes(model) ? 'Você é o GPT-5.5 (ou GPT-5.5 Pro caso especificado), o modelo de IA mais capaz desenvolvido pela OpenAI.' :
                  model === 'anthropic/claude-opus-4.7' ? 'Você é o Claude Opus 4.7, um modelo imensamente capaz desenvolvido pela Anthropic.' :
                  model === 'anthropic/claude-sonnet-4.6' ? 'Você é o Claude Sonnet 4.6, um modelo inteligente e ágil desenvolvido pela Anthropic.' :
                  model === 'qwen/qwen3.6-flash' ? 'Você é o Qwen 3.6 Flash, um modelo incrivelmente poderoso desenvolvido pela Alibaba Cloud.' :
                  model === 'qwen/qwen3.7-max' ? 'Você é o Qwen 3.7 Max, o modelo mais poderoso e capaz desenvolvido pela Alibaba Cloud.' :
                  model === 'google/gemini-3.1-pro-preview' ? 'Você é o Gemini 3.1 Pro, uma inteligência artificial de ponta desenvolvida pelo Google.' :
                  model === 'google/gemini-3.5-flash' ? 'Você é o Gemini 3.5 Flash, um modelo rápido e eficiente desenvolvido pelo Google.' :
                  model === 'x-ai/grok-4.3' ? 'Você é o Grok 4.3, uma IA desenvolvida pela xAI. Seja sempre sincero sobre sua identidade.' :
                  model === 'fictitious/agent-ng' ? 'Você é o Agent NG, um super agente futurista fictício.' :
                  model === 'zhipu/glm-5.1' ? 'Você é o GLM 5.1, um modelo robusto e avançado desenvolvido pela Zhipu AI.' :
                  model === 'deepseek/deepseek-v4-pro' ? 'Você é o DeepSeek V4 Pro, um poderoso modelo de linguagem desenvolvido pela DeepSeek.' :
                  model === 'deepseek/deepseek-v4-flash' ? 'Você é o DeepSeek V4 Flash, um modelo rápido e eficiente desenvolvido pela DeepSeek.' :
                  model === 'mimo/mimo-v2.5-pro' ? 'Você é o MiMo-V2.5-Pro, um modelo de inteligência artificial de ponta e altamente capaz.' :
                  model === 'moonshot/kimi-k2.6' ? 'Você é o Kimi K2.6, um modelo especialista em janelas de contexto longas desenvolvido pela Moonshot AI.' :
                  model === 'alibaba/wan-2.7' ? 'Você é o Wan 2.7, um modelo inovador desenvolvido pela Alibaba.' :
                  ''
                } ATENÇÃO SOBRE SUA IDENTIDADE: Não importa o modelo base por trás da API, você SEMPRE deve assumir que é o modelo especificado na frase anterior e foi criado pela empresa citada. Nunca mencione ser da OpenAI, Google ou Anthropic se você foi instruído a ser o Qwen, Grok, etc. Para solicitações e perguntas simples, responda de forma direta, natural e concisa. Apenas quando solicitado a criar textos, explicações longas ou tópicos complexos, você DEVE formatar suas respostas utilizando marcação Markdown (subtítulos \`##\`, listas com marcadores \`* \` e numerais, negrito para termos chave) com generosos espaçamentos em branco entre os parágrafos para facilitar a leitura. ESTRUTURA E FORMATAÇÃO: NÃO use linhas horizontais como "___" ou "---" para dividir o texto. Organize suas respostas de maneira limpa, profissional e bem estruturada, semelhante ao alto padrão de qualidade do ChatGPT, usando Markdown com inteligência para destacar a hierarquia da informação.`;

        const targetModel = 'gemini-3.5-flash';
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: messages.map((m) => ({
              role: m.role || 'user',
              parts: [{ text: m.content }]
            })),
            systemInstruction: {
              parts: [{ text: systemInstructionText }]
            }
          })
        });

        if (!response.ok) {
           const errorData = await response.text();
           console.error(`API Error (Status ${response.status}):`, errorData);
           lastErrorStatus = response.status;
           lastErrorMessage = `Erro na API (Status ${response.status}): ${errorData}`;
        } else {
           const rawData = await response.json();
           data = {
               choices: [
                   {
                       message: {
                           content: rawData.candidates?.[0]?.content?.parts?.[0]?.text || ''
                       }
                   }
               ]
           };
           success = true;
        }
    } catch(fetchError) {
         console.error("Fetch error during call:", fetchError);
         lastErrorStatus = 500;
         lastErrorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
    }

    if (success && data) {
       return res.status(200).json(data);
    } else {
       return res.status(lastErrorStatus).json({ error: lastErrorMessage });
    }

  } catch (error) {
    console.error('Server side error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
