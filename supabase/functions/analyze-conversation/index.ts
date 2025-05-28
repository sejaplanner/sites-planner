
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

Extraia e organize as seguintes informações exatas mencionadas pelo usuário (use apenas o que foi explicitamente dito, não invente):

1. user_name: Nome completo do usuário
2. user_whatsapp: Número do WhatsApp (apenas números)
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
Se algo não foi mencionado, deixe como null.

Retorne APENAS um JSON válido no formato:
{
  "user_name": "valor ou null",
  "user_whatsapp": "valor ou null",
  "company_name": "valor ou null",
  // ... outros campos
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um especialista em análise de conversas e extração de dados estruturados. Seja preciso e extraia apenas o que foi explicitamente mencionado.' },
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
      extractedData = JSON.parse(extractedDataText);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError);
      throw new Error('Falha ao processar dados extraídos');
    }

    console.log('✅ Dados estruturados:', extractedData);

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
