
import React from 'react';

interface MarkdownContentProps {
  content: string;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  // Função para processar markdown simples
  const processMarkdown = (text: string) => {
    // Processar negrito **texto**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Processar itálico *texto*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Processar títulos ## Título
    text = text.replace(/^## (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
    
    // Processar emojis no início de linha como bullet points
    text = text.replace(/^(🔷|🎯|📋|💡|🎨|📞|🚀|📝) (.*)$/gm, '<div class="flex items-start gap-2 my-2"><span class="text-lg">$1</span><span>$2</span></div>');
    
    // Processar quebras de linha duplas como parágrafos
    text = text.replace(/\n\n/g, '</p><p class="mb-2">');
    
    // Wrap em parágrafo se não começar com tag
    if (!text.startsWith('<')) {
      text = '<p class="mb-2">' + text + '</p>';
    }
    
    return text;
  };

  return (
    <div 
      className="markdown-content leading-relaxed"
      dangerouslySetInnerHTML={{ 
        __html: processMarkdown(content) 
      }} 
    />
  );
};

export default MarkdownContent;
