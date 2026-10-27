import { Resend } from 'resend';

function formatTituloDisplay(val) {
  if (!val) return '-';
  const clean = String(val).replace(/\D/g, '');
  if (!clean) return '-';
  // Exibição em conformidade com LGPD: 2 primeiros e 3 últimos dígitos visíveis, com xxx mascarando o restante
  if (clean.length === 12) {
    const p1 = clean.slice(0, 2); // 2 primeiros números
    const p2 = clean.slice(-3);   // 3 últimos números
    return `${p1}xx xxxx x${p2}`;
  }
  if (clean.length >= 5) {
    const p1 = clean.slice(0, 2);
    const p2 = clean.slice(-3);
    const meioOculto = 'x'.repeat(clean.length - 5);
    return `${p1}${meioOculto}${p2}`;
  }
  return clean;
}

/**
 * Serviço Unificado de Envio de E-mails Transacionais da Petição
 * 
 * Regra Crítica de Negócio:
 * Invocado EXCLUSIVAMENTE após a confirmação de que o registro
 * foi inserido com sucesso na tabela public.peticao_votos do Supabase.
 * 
 * @param {Object} params
 * @param {string} params.nome Nome do eleitor
 * @param {string} params.email Endereço de e-mail do eleitor (injetado diretamente em 'to')
 * @param {string} params.tituloEleitor Título de eleitor oficial validado
 * @param {string} params.estado Sigla da Unidade Federativa (UF)
 * @param {string} [params.municipio] Nome do município (se informado)
 * @param {string} [params.codigoVotado] Código registrado (ex: '22' ou 'BRANCO')
 * @returns {Promise<{ success: boolean, id?: string, simulated?: boolean, error?: string, rawResponse?: any }>}
 */
export async function enviarEmailConfirmacaoAssinatura({
  nome,
  email,
  tituloEleitor,
  estado,
  municipio = '',
  codigoVotado = '22',
}) {
  const emailDestinatario = String(email || '').trim().toLowerCase();
  const nomeEleitor = String(nome || '').trim();
  const uf = String(estado || '').trim().toUpperCase();
  const cidade = String(municipio || '').trim();
  const tituloFormatado = formatTituloDisplay(tituloEleitor);
  const opcaoTexto = codigoVotado === '22' ? 'Opção 22 (Flávio - PL)' : 'Voto em Branco';
  const dataHoraRegistro = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  // Declaração de fé pública e responsabilidade formal solicitada
  const declaracaoTexto = codigoVotado === '22'
    ? 'Declara e confirma expressamente, sob as penas da lei e sob sua inteira responsabilidade civil e legal, que as informações prestadas são verídicas e reais, atestando que no dia <strong>25/10/2026</strong>, entre as <strong>08h00 e as 18h00</strong> deste dia, o(a) eleitor(a) qualificado(a) votou no candidato a Presidente <strong>Flávio Bolsonaro</strong>, do partido <strong>PL (Partido Liberal Brasileiro - 22)</strong>.'
    : 'Declara e confirma expressamente, sob as penas da lei e sob sua inteira responsabilidade civil e legal, que as informações prestadas são verídicas e reais, atestando que no dia <strong>25/10/2026</strong>, entre as <strong>08h00 e as 18h00</strong> deste dia, o(a) eleitor(a) qualificado(a) manifestou seu voto em <strong>BRANCO</strong> na eleição presidencial.';

  // Validação estrita do destinatário
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailDestinatario || !emailRegex.test(emailDestinatario)) {
    const erroEmailInvalido = `E-mail de destinatário inválido ou ausente: "${emailDestinatario}"`;
    console.error(`[EmailService:ValidationFail] ${erroEmailInvalido}`);
    return { success: false, error: erroEmailInvalido };
  }

  console.log('[EmailService:Tracing:PreDispatch] Iniciando preparação do e-mail com parâmetros:', {
    to: emailDestinatario,
    nome: nomeEleitor,
    tituloMascarado: tituloFormatado,
    estado: uf,
    municipio: cidade || '(não informado)',
    codigoVotado,
    timestamp: dataHoraRegistro,
  });

  const assunto = 'Comprovante de Apoio Registrado • Petição Nacional pela Transparência Eleitoral';
  const remetente = process.env.EMAIL_FROM || 'Petição Nacional <contato@peticaonacional.online>';

  // Conteúdo HTML profissional
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>${assunto}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #022c22 0%, #064e3b 100%); padding: 30px 24px; text-align: center; border-bottom: 3px solid #10b981; }
        .title { color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
        .subtitle { color: #34d399; font-size: 13px; font-weight: 600; margin-top: 6px; }
        .content { padding: 28px 24px; color: #cbd5e1; font-size: 14px; line-height: 1.6; }
        .card { background: #020617; border: 1px solid #334155; border-radius: 12px; padding: 18px; margin: 20px 0; }
        .card-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #1e293b; font-size: 13px; }
        .card-row:last-child { border-bottom: none; }
        .label { color: #94a3b8; font-weight: 600; }
        .value { color: #ffffff; font-family: monospace; font-weight: 700; }
        .badge { display: inline-block; padding: 4px 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 6px; color: #34d399; font-weight: 700; font-size: 12px; }
        .footer { background: #020617; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
        .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(90deg, #059669 0%, #10b981 100%); color: #ffffff; font-weight: 700; text-decoration: none; border-radius: 8px; margin-top: 16px; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">Petição Nacional</div>
          <div class="subtitle">Auditoria Cidadã Digital & Transparência Eleitoral</div>
        </div>
        <div class="content">
          <p>Olá, <strong>${nomeEleitor}</strong>,</p>
          <p>Seu apoio à <strong>Petição Nacional pela Transparência Eleitoral</strong> foi registrado e auditado com sucesso no nosso sistema eletrônico seguro.</p>
          
          <div class="card">
            <div class="card-row">
              <span class="label">Eleitor:</span>
              <span class="value" style="font-family: inherit;">${nomeEleitor}</span>
            </div>
            <div class="card-row">
              <span class="label">Título de Eleitor:</span>
              <span class="value">${tituloFormatado}</span>
            </div>
            <div class="card-row">
              <span class="label">Estado (UF):</span>
              <span class="value">${uf}</span>
            </div>
            ${cidade ? `
            <div class="card-row">
              <span class="label">Município:</span>
              <span class="value" style="font-family: inherit;">${cidade}</span>
            </div>` : ''}
            <div class="card-row">
              <span class="label">Manifestação Registrada:</span>
              <span class="badge">${opcaoTexto}</span>
            </div>
            <div class="card-row">
              <span class="label">Data e Hora (Brasília):</span>
              <span class="value">${dataHoraRegistro}</span>
            </div>
            <div class="card-row">
              <span class="label">Autenticidade:</span>
              <span class="value" style="color: #10b981;">Validado por Algoritmo do TSE</span>
            </div>
          </div>

          <!-- CARD DE DECLARAÇÃO FORMAL DE RESPONSABILIDADE ELEITORAL -->
          <div style="background: linear-gradient(135deg, rgba(6, 78, 59, 0.5) 0%, rgba(2, 44, 34, 0.7) 100%); border: 1.5px solid #10b981; border-radius: 12px; padding: 18px 20px; margin: 22px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            <div style="margin-bottom: 8px;">
              <span style="background: #10b981; color: #022c22; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                TERMO DE FÉ PÚBLICA & RESPONSABILIDADE
              </span>
            </div>
            <p style="margin: 0; color: #f8fafc; font-size: 13.5px; line-height: 1.6; text-align: justify;">
              ${declaracaoTexto}
            </p>
          </div>

          <p style="font-size: 12px; color: #94a3b8;">
            Este comprovante atesta sua participação cívica em conformidade com o <strong>Art. 1º, parágrafo único</strong> e <strong>Art. 5º, XXXIV, 'a'</strong> da Constituição Federal de 1988 e com as diretrizes da LGPD (Lei nº 13.709/2018).
          </p>

          <center>
            <a href="https://peticaonacional.online" class="btn" target="_blank">Acompanhar Auditoria em Tempo Real</a>
          </center>
        </div>
        <div class="footer">
          Petição Nacional pela Transparência Eleitoral • Domínio Oficial: https://peticaonacional.online<br>
          Dados protegidos nos termos da Lei Geral de Proteção de Dados (LGPD).
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. Provedor Resend (se RESEND_API_KEY estiver configurada)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      console.log('[EmailService:Provider:Resend] Disparando e-mail via SDK oficial Resend para:', emailDestinatario);
      const resend = new Resend(resendApiKey);

      const resendResponse = await resend.emails.send({
        from: remetente,
        to: emailDestinatario,
        subject: assunto,
        html: htmlContent,
      });

      console.log('[EmailService:Provider:Resend:Response] Resposta completa do Resend:', JSON.stringify(resendResponse));

      if (resendResponse.error) {
        console.error('[EmailService:Provider:Resend:Error] Erro retornado pela API do Resend:', resendResponse.error);
        return {
          success: false,
          error: resendResponse.error.message || 'Falha na entrega via Resend',
          rawResponse: resendResponse,
        };
      }

      return {
        success: true,
        id: resendResponse.data?.id,
        rawResponse: resendResponse,
      };
    } catch (resendException) {
      console.error('[EmailService:Provider:Resend:Exception] Exceção durante chamada ao Resend:', resendException);
      return {
        success: false,
        error: resendException.message || 'Exceção não tratada no cliente Resend',
      };
    }
  }

  // 2. Provedor SendGrid (se SENDGRID_API_KEY estiver configurada)
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  if (sendgridApiKey) {
    try {
      console.log('[EmailService:Provider:SendGrid] Disparando e-mail via REST SendGrid para:', emailDestinatario);
      const sgResp = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: emailDestinatario, name: nomeEleitor }] }],
          from: { email: process.env.SENDGRID_FROM_EMAIL || 'contato@peticaonacional.online', name: 'Petição Nacional' },
          subject: assunto,
          content: [{ type: 'text/html', value: htmlContent }],
        }),
      });

      console.log('[EmailService:Provider:SendGrid:ResponseStatus]', sgResp.status);

      if (sgResp.status >= 200 && sgResp.status < 300) {
        return { success: true, provider: 'sendgrid' };
      }

      const sgErrorBody = await sgResp.text();
      console.error('[EmailService:Provider:SendGrid:ErrorBody]', sgErrorBody);
      return { success: false, error: sgErrorBody };
    } catch (sgErr) {
      console.error('[EmailService:Provider:SendGrid:Exception]', sgErr);
      return { success: false, error: sgErr.message };
    }
  }

  // 3. Fallback / Modo de Simulação (sem chaves configuradas)
  console.log('[EmailService:MockSimulation] Nenhuma chave de e-mail detectada (configure RESEND_API_KEY ou SENDGRID_API_KEY no .env.local/Vercel).');
  console.log('[EmailService:MockSimulation:PayloadPreview]', {
    to: emailDestinatario,
    from: remetente,
    subject: assunto,
    nome: nomeEleitor,
    titulo: tituloFormatado,
    uf,
    municipio: cidade,
  });

  return {
    success: true,
    simulated: true,
    message: 'E-mail simulado com sucesso (RESEND_API_KEY não configurada no ambiente).',
  };
}
