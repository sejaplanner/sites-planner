
export interface ExtractedBriefingData {
  companyInfo: {
    name: string;
    slogan?: string;
    mission?: string;
    vision?: string;
    values?: string;
    description?: string;
    differentials?: string;
  };
  productsServices: {
    main: string;
    descriptions?: string;
    highlights?: string;
    problems?: string;
  };
  targetAudience: {
    ideal: string;
    needs?: string;
    types?: string;
  };
  socialProof: {
    clients?: string;
    testimonials?: string;
    certifications?: string;
  };
  design: {
    style?: string;
    inspiration?: string;
    colors?: string;
    logo?: boolean;
    images?: boolean;
    hasLogo?: string;
    domainStatus?: string;
  };
  contact: {
    channels?: string;
    address?: string;
    form?: string;
  };
  objectives: {
    main?: string;
    cta?: string;
    floating?: string;
  };
  additional: {
    social?: string;
    domain?: string;
    other?: string;
  };
  files: string[];
}

export const extractDataFromConversation = (conversationLog: any[]): ExtractedBriefingData => {
  const userMessages = conversationLog
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content)
    .join(' ');

  return {
    companyInfo: {
      name: extractCompanyName(userMessages),
      description: extractSection(userMessages, ['empresa', 'negócio', 'atividade']),
      mission: extractSection(userMessages, ['missão', 'propósito']),
      vision: extractSection(userMessages, ['visão', 'futuro']),
      values: extractSection(userMessages, ['valores', 'princípios']),
      slogan: extractSection(userMessages, ['slogan', 'lema']),
      differentials: extractSection(userMessages, ['diferencial', 'vantagem', 'destaque']),
    },
    productsServices: {
      main: extractSection(userMessages, ['produto', 'serviço', 'oferec']),
      descriptions: extractSection(userMessages, ['descrição', 'detalhes']),
      highlights: extractSection(userMessages, ['destaque', 'principal']),
      problems: extractSection(userMessages, ['problema', 'solução', 'resolve']),
    },
    targetAudience: {
      ideal: extractSection(userMessages, ['cliente', 'público', 'target', 'audiência']),
      needs: extractSection(userMessages, ['necessidade', 'precisa', 'busca']),
      types: extractSection(userMessages, ['tipo', 'segmento', 'perfil']),
    },
    socialProof: {
      clients: extractSection(userMessages, ['cliente', 'case', 'sucesso']),
      testimonials: extractSection(userMessages, ['depoimento', 'feedback', 'avaliação']),
      certifications: extractSection(userMessages, ['certificação', 'prêmio', 'reconhecimento']),
    },
    design: {
      style: extractSection(userMessages, ['design', 'estilo', 'visual']),
      inspiration: extractSection(userMessages, ['inspiração', 'referência', 'exemplo']),
      colors: extractSection(userMessages, ['cor', 'cores', 'paleta']),
      hasLogo: extractLogoInfo(userMessages),
      domainStatus: extractDomainInfo(userMessages),
    },
    contact: {
      channels: extractSection(userMessages, ['contato', 'telefone', 'email']),
      address: extractSection(userMessages, ['endereço', 'localização', 'onde']),
      form: extractSection(userMessages, ['formulário', 'contato']),
    },
    objectives: {
      main: extractSection(userMessages, ['objetivo', 'meta', 'finalidade']),
      cta: extractSection(userMessages, ['ação', 'chamada', 'botão']),
      floating: extractSection(userMessages, ['whatsapp', 'flutuante']),
    },
    additional: {
      domain: extractDomainInfo(userMessages),
      social: extractSection(userMessages, ['social', 'instagram', 'facebook']),
      other: extractSection(userMessages, ['adicional', 'extra', 'importante']),
    },
    files: []
  };
};

const extractCompanyName = (text: string): string => {
  const patterns = [
    /(?:empresa|negócio|companhia)\s+(?:se chama|é|chamada?|nome)\s+([A-Za-zÀ-ÿ\s&]{2,50})/i,
    /(?:nome|chama)\s+(?:da empresa )?(?:é|:)?\s*([A-Za-zÀ-ÿ\s&]{2,50})/i,
    /(?:chama|chamamos)\s+(?:se )?([A-Za-zÀ-ÿ\s&]{2,50})/i,
    /([A-Za-zÀ-ÿ\s&]{2,50})\s+(?:é o nome|é nossa empresa)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return '';
};

const extractLogoInfo = (text: string): string => {
  if (text.toLowerCase().includes('tenho logo') || text.toLowerCase().includes('temos logo')) {
    return 'sim';
  }
  if (text.toLowerCase().includes('não tenho logo') || text.toLowerCase().includes('não temos logo')) {
    return 'não';
  }
  if (text.toLowerCase().includes('preciso de logo') || text.toLowerCase().includes('criar logo')) {
    return 'precisa_criar';
  }
  return '';
};

const extractDomainInfo = (text: string): string => {
  if (text.toLowerCase().includes('tenho domínio') || text.toLowerCase().includes('temos domínio')) {
    return 'sim';
  }
  if (text.toLowerCase().includes('não tenho domínio') || text.toLowerCase().includes('não temos domínio')) {
    return 'não';
  }
  if (text.toLowerCase().includes('preciso de domínio') || text.toLowerCase().includes('comprar domínio')) {
    return 'precisa_comprar';
  }
  return '';
};

const extractSection = (text: string, keywords: string[]): string => {
  const sentences = text.split(/[.!?]+/);
  
  const relevantSentences = sentences.filter(sentence => 
    keywords.some(keyword => sentence.toLowerCase().includes(keyword))
  );

  return relevantSentences.join('. ').trim();
};

// Função para extrair nome do usuário
export const extractUserName = (text: string): string => {
  const namePatterns = [
    /(?:meu nome é|me chamo|sou o|sou a|eu sou)\s+([A-Za-zÀ-ÿ\s]{2,50})/i,
    /(?:nome|chamo)\s*[:\-]?\s*([A-Za-zÀ-ÿ\s]{2,50})/i,
    /^([A-Za-zÀ-ÿ]{2,}\s+[A-Za-zÀ-ÿ\s]{1,48})$/i
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return '';
};

// Função para extrair WhatsApp
export const extractWhatsApp = (text: string): string => {
  const whatsappPatterns = [
    /(?:whatsapp|telefone|celular|número|zap).*?(\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4})/i,
    /(\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4})/
  ];
  
  for (const pattern of whatsappPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].replace(/[-\s()]/g, '');
    }
  }
  
  return '';
};
