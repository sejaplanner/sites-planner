
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const transcriptionCache = new Map<string, string>();

// Detecta formato de áudio baseado nos bytes
const detectFormat = (bytes: Uint8Array): string => {
  if (bytes.length < 12) return 'unknown';
  
  // WEBM
  if (bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3) {
    return 'webm';
  }
  
  // WAV
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    return 'wav';
  }
  
  // OGG
  if (bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) {
    return 'ogg';
  }
  
  // MP4/M4A
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    return 'mp4';
  }
  
  return 'unknown';
};

// Processamento robusto de base64 em chunks
const processBase64InChunks = (base64String: string, chunkSize = 8192) => {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  try {
    while (position < base64String.length) {
      const chunk = base64String.slice(position, position + chunkSize);
      const binaryChunk = atob(chunk);
      const bytes = new Uint8Array(binaryChunk.length);
      
      for (let i = 0; i < binaryChunk.length; i++) {
        bytes[i] = binaryChunk.charCodeAt(i);
      }
      
      chunks.push(bytes);
      position += chunkSize;
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  } catch (error) {
    console.error('❌ Erro no processamento de base64:', error);
    throw new Error('Falha ao processar dados de áudio');
  }
};

// Gera chave de cache baseada no hash do áudio
const generateCacheKey = (audioData: Uint8Array): string => {
  let hash = 0;
  const sampleSize = Math.min(audioData.length, 2000); // Amostra maior para melhor hash
  
  for (let i = 0; i < sampleSize; i++) {
    const char = audioData[i];
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converter para 32bit
  }
  
  return hash.toString();
};

// Detecta plataforma móvel
const isMobileUserAgent = (userAgent: string): boolean => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
};

// Detecta especificamente iOS
const isIOSUserAgent = (userAgent: string): boolean => {
  return /iPhone|iPad|iPod/i.test(userAgent);
};

// Detecta Android
const isAndroidUserAgent = (userAgent: string): boolean => {
  return /Android/i.test(userAgent);
};

// Seleciona configurações de áudio por plataforma
const getPlatformAudioConfig = (userAgent: string, detectedFormat: string) => {
  const isIOS = isIOSUserAgent(userAgent);
  const isAndroid = isAndroidUserAgent(userAgent);
  const isMobile = isMobileUserAgent(userAgent);
  
  console.log('📱 Plataforma detectada:', {
    userAgent: userAgent.substring(0, 100) + '...',
    isIOS,
    isAndroid,
    isMobile,
    detectedFormat
  });

  // Configurações específicas por plataforma
  if (isIOS) {
    // iOS Safari funciona melhor com WAV ou MP4
    if (detectedFormat === 'webm' || detectedFormat === 'unknown') {
      return {
        mimeType: 'audio/wav',
        fileName: 'audio.wav',
        reason: 'iOS_fallback_to_wav'
      };
    }
    return {
      mimeType: detectedFormat === 'mp4' ? 'audio/mp4' : 'audio/wav',
      fileName: detectedFormat === 'mp4' ? 'audio.m4a' : 'audio.wav',
      reason: 'iOS_native'
    };
  }
  
  if (isAndroid) {
    // Android funciona bem com WEBM e OGG
    if (detectedFormat === 'webm') {
      return {
        mimeType: 'audio/webm',
        fileName: 'audio.webm',
        reason: 'Android_webm'
      };
    }
    if (detectedFormat === 'ogg') {
      return {
        mimeType: 'audio/ogg',
        fileName: 'audio.ogg',
        reason: 'Android_ogg'
      };
    }
    // Fallback para WAV
    return {
      mimeType: 'audio/wav',
      fileName: 'audio.wav',
      reason: 'Android_fallback'
    };
  }
  
  // Desktop - usar formato detectado ou WEBM como padrão
  const mimeTypeMap = {
    webm: 'audio/webm',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    mp4: 'audio/mp4'
  };
  
  const fileExtMap = {
    webm: 'audio.webm',
    wav: 'audio.wav',
    ogg: 'audio.ogg',
    mp4: 'audio.m4a'
  };
  
  return {
    mimeType: mimeTypeMap[detectedFormat] || 'audio/webm',
    fileName: fileExtMap[detectedFormat] || 'audio.webm',
    reason: 'Desktop_' + detectedFormat
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();
    const userAgent = req.headers.get('user-agent') || '';
    
    if (!audio) {
      throw new Error('Dados de áudio não fornecidos');
    }

    console.log('🎤 Processando áudio para transcrição...');
    console.log('📱 User Agent:', userAgent.substring(0, 150));
    
    // Processar áudio em chunks
    const bytes = processBase64InChunks(audio);
    console.log('📦 Áudio processado, tamanho:', bytes.length, 'bytes');

    // Verificar cache
    const cacheKey = generateCacheKey(bytes);
    if (transcriptionCache.has(cacheKey)) {
      console.log('✅ Transcrição encontrada no cache');
      return new Response(
        JSON.stringify({ 
          success: true,
          text: transcriptionCache.get(cacheKey) || '',
          cached: true,
          platform: {
            isIOS: isIOSUserAgent(userAgent),
            isAndroid: isAndroidUserAgent(userAgent),
            isMobile: isMobileUserAgent(userAgent)
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar tamanho
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (bytes.length > maxSize) {
      throw new Error('Arquivo de áudio muito grande (máximo 25MB)');
    }
    
    // Detectar formato e configurar por plataforma
    const detectedFormat = detectFormat(bytes);
    const audioConfig = getPlatformAudioConfig(userAgent, detectedFormat);
    
    console.log('🎵 Configuração de áudio:', audioConfig);
    
    // Preparar FormData
    const formData = new FormData();
    const blob = new Blob([bytes], { type: audioConfig.mimeType });
    formData.append('file', blob, audioConfig.fileName);
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');
    formData.append('response_format', 'json');

    console.log('🚀 Enviando para OpenAI Whisper...');

    // Retry com backoff exponencial
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000; // Jitter
        if (attempt > 0) {
          console.log(`⏳ Tentativa ${attempt + 1}/${maxRetries} após ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          },
          body: formData,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Erro da API OpenAI (tentativa ${attempt + 1}):`, {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            platform: audioConfig.reason
          });
          
          lastError = new Error(`OpenAI API error: ${response.status} - ${errorText}`);
          
          // Não retry em erros 4xx (client errors)
          if (response.status >= 400 && response.status < 500) {
            break;
          }
          continue;
        }

        const result = await response.json();
        const transcriptionText = result.text || '';
        
        console.log('✅ Transcrição concluída:', {
          textLength: transcriptionText.length,
          textPreview: transcriptionText.substring(0, 100),
          attempt: attempt + 1,
          platform: audioConfig.reason,
          detectedFormat,
          confidence: result.confidence || 'N/A'
        });

        // Cache se não estiver vazio
        if (transcriptionText.trim()) {
          transcriptionCache.set(cacheKey, transcriptionText);
          
          // Limpar cache se muito grande (máximo 100 itens)
          if (transcriptionCache.size > 100) {
            const firstKey = transcriptionCache.keys().next().value;
            transcriptionCache.delete(firstKey);
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            text: transcriptionText,
            confidence: result.confidence || null,
            retries: attempt,
            format: detectedFormat,
            platform: {
              isIOS: isIOSUserAgent(userAgent),
              isAndroid: isAndroidUserAgent(userAgent),
              isMobile: isMobileUserAgent(userAgent),
              config: audioConfig.reason
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (error) {
        console.error(`❌ Erro na tentativa ${attempt + 1}:`, {
          error: error.message,
          platform: audioConfig.reason,
          isAbortError: error.name === 'AbortError'
        });
        
        lastError = error as Error;
        
        // Continuar retry em timeouts
        if (error.name === 'AbortError') {
          console.log('⏰ Timeout - tentando novamente...');
          continue;
        }
      }
    }

    throw lastError || new Error('Falha após todas as tentativas');

  } catch (error) {
    console.error('❌ Erro na transcrição:', {
      error: error.message,
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get('user-agent')?.substring(0, 100)
    });
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
