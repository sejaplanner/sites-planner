
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const transcriptionCache = new Map<string, string>();

const detectFormat = (bytes: Uint8Array): string => {
  if (bytes.length < 12) return 'unknown';
  
  if (bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3) {
    return 'webm';
  }
  
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    return 'wav';
  }
  
  if (bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) {
    return 'ogg';
  }
  
  return 'unknown';
};

const processBase64InChunks = (base64String: string, chunkSize = 8192) => {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
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
};

const generateCacheKey = (audioData: Uint8Array): string => {
  let hash = 0;
  for (let i = 0; i < Math.min(audioData.length, 1000); i++) {
    const char = audioData[i];
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

const isMobileUserAgent = (userAgent: string): boolean => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
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
    console.log('📱 User Agent:', userAgent);
    console.log('📱 É mobile:', isMobileUserAgent(userAgent));
    
    const bytes = processBase64InChunks(audio);
    console.log('📦 Áudio processado, tamanho:', bytes.length, 'bytes');

    const cacheKey = generateCacheKey(bytes);
    if (transcriptionCache.has(cacheKey)) {
      console.log('✅ Transcrição encontrada no cache');
      return new Response(
        JSON.stringify({ 
          success: true,
          text: transcriptionCache.get(cacheKey) || '',
          cached: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const maxSize = 25 * 1024 * 1024;
    if (bytes.length > maxSize) {
      throw new Error('Arquivo de áudio muito grande (máximo 25MB)');
    }
    
    const formData = new FormData();
    
    const detectedFormat = detectFormat(bytes);
    console.log('🎵 Formato detectado:', detectedFormat);
    
    let mimeType = 'audio/wav';
    let fileName = 'audio.wav';
    
    if (detectedFormat === 'webm') {
      mimeType = 'audio/webm';
      fileName = 'audio.webm';
    } else if (detectedFormat === 'ogg') {
      mimeType = 'audio/ogg';
      fileName = 'audio.ogg';
    } else if (detectedFormat === 'wav') {
      mimeType = 'audio/wav';
      fileName = 'audio.wav';
    } else {
      console.log('🎵 Formato não detectado, tentando webm para mobile ou wav para desktop');
      if (isMobileUserAgent(userAgent)) {
        mimeType = 'audio/webm';
        fileName = 'audio.webm';
      } else {
        mimeType = 'audio/wav';
        fileName = 'audio.wav';
      }
    }
    
    const blob = new Blob([bytes], { type: mimeType });
    formData.append('file', blob, fileName);
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');

    console.log('🚀 Enviando para OpenAI...');

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const delay = Math.pow(2, attempt) * 1000;
        if (attempt > 0) {
          console.log(`⏳ Tentativa ${attempt + 1}/${maxRetries} após ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          },
          body: formData,
          signal: AbortSignal.timeout(30000)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Erro da API OpenAI (tentativa ${attempt + 1}):`, response.status, errorText);
          lastError = new Error(`Erro da API OpenAI: ${response.status} - ${errorText}`);
          
          if (response.status >= 400 && response.status < 500) {
            break;
          }
          continue;
        }

        const result = await response.json();
        const transcriptionText = result.text || '';
        
        console.log('✅ Transcrição concluída:', transcriptionText);

        if (transcriptionText.trim()) {
          transcriptionCache.set(cacheKey, transcriptionText);
          
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
            isMobile: isMobileUserAgent(userAgent)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (error) {
        console.error(`❌ Erro na tentativa ${attempt + 1}:`, error);
        lastError = error as Error;
        
        if (error.name === 'AbortError') {
          continue;
        }
      }
    }

    throw lastError || new Error('Falha após todas as tentativas');

  } catch (error) {
    console.error('❌ Erro na transcrição:', error);
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
