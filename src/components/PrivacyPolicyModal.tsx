
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PrivacyPolicyModalProps {
  children: React.ReactNode;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Política de Privacidade</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold mb-2">1. Coleta de Informações</h3>
              <p className="text-gray-600 leading-relaxed">
                A Planner coleta informações fornecidas voluntariamente por você durante o processo de briefing, 
                incluindo dados da empresa, informações de contato, preferências de design e arquivos enviados. 
                Todos os dados são coletados com o seu consentimento expresso.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">2. Uso das Informações</h3>
              <p className="text-gray-600 leading-relaxed">
                As informações coletadas são utilizadas exclusivamente para:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Desenvolvimento do seu site institucional</li>
                <li>Comunicação sobre o progresso do projeto</li>
                <li>Prestação de suporte técnico</li>
                <li>Cumprimento de obrigações contratuais</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. Proteção de Dados (LGPD)</h3>
              <p className="text-gray-600 leading-relaxed">
                Em conformidade com a Lei Geral de Proteção de Dados (LGPD), garantimos que:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Seus dados são tratados com base no consentimento e interesse legítimo</li>
                <li>Você tem direito ao acesso, correção, exclusão e portabilidade dos seus dados</li>
                <li>Implementamos medidas de segurança técnicas e organizacionais adequadas</li>
                <li>Não compartilhamos seus dados com terceiros sem autorização</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. Armazenamento e Segurança</h3>
              <p className="text-gray-600 leading-relaxed">
                Seus dados são armazenados em servidores seguros com criptografia e acesso restrito. 
                Mantemos suas informações apenas pelo tempo necessário para cumprir as finalidades 
                descritas nesta política e atender às obrigações legais.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5. Compartilhamento de Dados</h3>
              <p className="text-gray-600 leading-relaxed">
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
                exceto quando necessário para a prestação dos nossos serviços ou quando exigido por lei.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">6. Seus Direitos</h3>
              <p className="text-gray-600 leading-relaxed">
                Você tem o direito de:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Solicitar acesso aos seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a exclusão dos seus dados</li>
                <li>Revogar o consentimento a qualquer momento</li>
                <li>Solicitar a portabilidade dos seus dados</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">7. Cookies e Tecnologias Similares</h3>
              <p className="text-gray-600 leading-relaxed">
                Utilizamos apenas cookies técnicos essenciais para o funcionamento da plataforma 
                e armazenamento local para salvar o progresso do seu briefing. Não utilizamos 
                cookies de rastreamento ou publicidade.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">8. Alterações na Política</h3>
              <p className="text-gray-600 leading-relaxed">
                Esta política pode ser atualizada periodicamente. Notificaremos sobre mudanças 
                significativas através dos nossos canais de comunicação.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">9. Contato</h3>
              <p className="text-gray-600 leading-relaxed">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política, 
                entre em contato através dos nossos canais oficiais. Temos um Encarregado 
                de Dados (DPO) disponível para atender suas solicitações.
              </p>
            </section>

            <section className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyModal;
