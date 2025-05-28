
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para limpar e extrair JSON do texto
function extractAndCleanJSON(text: string): any {
  try {
    // Remove markdown code blocks se existirem
    let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Remove quebras de linha extras e espaços
    cleanText = cleanText.trim();
    
    // Tenta fazer parse direto
    return JSON.parse(cleanText);
  } catch (error) {
    console.log('❌ Primeira tentativa de parse falhou, tentando extrair JSON...');
    
    // Tenta encontrar um objeto JSON válido no texto
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        let jsonStr = jsonMatch[0];
        // Remove markdown se houver
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        return JSON.parse(jsonStr);
      } catch (secondError) {
        console.log('❌ Segunda tentativa de parse falhou');
        throw secondError;
      }
    }
    
    throw new Error('Não foi possível extrair JSON válido do texto');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { historico_conversa, session_id } = await req.json();

    console.log('🔍 Analisando conversa para sessão:', session_id);

    const conversationText = historico_conversa
      .filter((msg: any) => msg.role === 'user')
      .map((msg: any) => msg.content)
      .join('\n\n');

    const analysisPrompt = `Analise esta conversa de briefing para criação de site e extraia as informações em formato JSON estruturado.

CONVERSA:
${conversationText}

IMPORTANTE: Retorne APENAS um objeto JSON válido, sem formatação markdown, sem blocos de código, sem explicações adicionais.

Extraia e organize as seguintes informações exatas mencionadas pelo usuário (use apenas o que foi explicitamente dito, não invente):

1. user_name: Nome completo do usuário
2. user_whatsapp: Número do WhatsApp (apenas números, sem caracteres especiais)
3. company_name: Nome da empresa
4. slogan: Slogan/tagline da empresa
5. mission: Missão da empresa
6. vision: Visão da empresa
7. values: Valores da empresa
8. description: Descrição/atividade da empresa
9. differentials: Diferenciais competitivos
10. products_services: Produtos/serviços oferecidos
11. target_audience: Público-alvo
12. social_proof: Cases de sucesso/credibilidade
13. design_preferences: Preferências de design/estilo visual
14. contact_info: Informações de contato e localização
15. website_objective: Objetivo principal do site
16. additional_info: Informações sobre logo, domínio e outras informações relevantes

Para campos onde a resposta foi "não sei", "vou decidir depois", "não tenho" ou similar, use exatamente essa resposta.
Se algo não foi mencionado, use null.

Retorne APENAS este formato JSON (sem markdown, sem \`\`\`):
{
  "user_name": "valor ou null",
  "user_whatsapp": "valor ou null",
  "company_name": "valor ou null",
  "slogan": "valor ou null",
  "mission": "valor ou null",
  "vision": "valor ou null",
  "values": "valor ou null",
  "description": "valor ou null",
  "differentials": "valor ou null",
  "products_services": "valor ou null",
  "target_audience": "valor ou null",
  "social_proof": "valor ou null",
  "design_preferences": "valor ou null",
  "contact_info": "valor ou null",
  "website_objective": "valor ou null",
  "additional_info": "valor ou null"
}`;

    console.log('🤖 Enviando para OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em análise de conversas e extração de dados estruturados. Retorne APENAS JSON válido, sem formatação markdown, sem blocos de código, sem explicações.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedDataText = data.choices[0].message.content;

    console.log('📊 Dados extraídos (raw):', extractedDataText);

    let extractedData;
    try {
      extractedData = extractAndCleanJSON(extractedDataText);
      console.log('✅ JSON parse bem-sucedido:', extractedData);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError);
      console.error('❌ Texto original:', extractedDataText);
      
      // Fallback: criar estrutura básica com dados que conseguimos extrair manualmente
      const fallbackData = {
        user_name: null,
        user_whatsapp: null,
        company_name: null,
        slogan: null,
        mission: null,
        vision: null,
        values: null,
        description: null,
        differentials: null,
        products_services: null,
        target_audience: null,
        social_proof: null,
        design_preferences: null,
        contact_info: null,
        website_objective: null,
        additional_info: `Erro no parse automático. Dados brutos: ${extractedDataText.substring(0, 500)}...`
      };
      
      console.log('🔄 Usando dados de fallback:', fallbackData);
      extractedData = fallbackData;
    }

    console.log('✅ Dados estruturados finais:', extractedData);

    return new Response(JSON.stringify({ 
      success: true, 
      data: extractedData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na análise da conversa:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
