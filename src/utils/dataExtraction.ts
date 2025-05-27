
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

  // Esta é uma implementação básica - você pode usar IA para extrair dados específicos
  return {
    companyInfo: {
      name: extractCompanyName(userMessages),
      description: extractSection(userMessages, ['empresa', 'negócio', 'atividade']),
    },
    productsServices: {
      main: extractSection(userMessages, ['produto', 'serviço', 'oferec']),
    },
    targetAudience: {
      ideal: extractSection(userMessages, ['cliente', 'público', 'target']),
    },
    socialProof: {
      clients: extractSection(userMessages, ['cliente', 'case', 'sucesso']),
    },
    design: {
      style: extractSection(userMessages, ['design', 'estilo', 'visual']),
    },
    contact: {
      channels: extractSection(userMessages, ['contato', 'telefone', 'email']),
    },
    objectives: {
      main: extractSection(userMessages, ['objetivo', 'meta', 'finalidade']),
    },
    additional: {
      other: extractSection(userMessages, ['adicional', 'extra', 'importante']),
    },
    files: []
  };
};

const extractCompanyName = (text: string): string => {
  // Procurar padrões como "empresa é X", "chama X", etc.
  const patterns = [
    /empresa (?:se chama|é|chamada?) ([^.!?]+)/i,
    /nome (?:da empresa )?(?:é|:) ([^.!?]+)/i,
    /chama (?:se )?([^.!?]+)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return '';
};

const extractSection = (text: string, keywords: string[]): string => {
  const sentences = text.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    if (keywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      return sentence.trim();
    }
  }

  return '';
};
