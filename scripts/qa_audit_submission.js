const http = require('http');
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:S@lsandafury@db.hbwianqvbhzgxfihykhh.supabase.co:5432/postgres';

// Gerador de Título Válido segundo Módulo 11 oficial do TSE
function gerarTituloValido(uf = 'SP') {
  const codUf = '01'; // SP
  const numUf = 1;
  // 8 dígitos sequenciais pseudo-aleatórios
  const seq = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
  
  // DV1
  let soma1 = 0;
  for (let i = 0; i < 8; i++) {
    soma1 += parseInt(seq[i], 10) * (i + 2);
  }
  const resto1 = soma1 % 11;
  let dv1 = 0;
  if (resto1 === 10) dv1 = 0;
  else if (resto1 === 0) dv1 = (numUf === 1 || numUf === 2) ? 1 : 0;
  else dv1 = resto1;

  // DV2
  const d9 = parseInt(codUf[0], 10);
  const d10 = parseInt(codUf[1], 10);
  const soma2 = (d9 * 7) + (d10 * 8) + (dv1 * 9);
  const resto2 = soma2 % 11;
  let dv2 = 0;
  if (resto2 === 10) dv2 = 0;
  else if (resto2 === 0) dv2 = (numUf === 1 || numUf === 2) ? 1 : 0;
  else dv2 = resto2;

  return `${seq}${codUf}${dv1}${dv2}`;
}

function postRequest(url, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/voto',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

async function runAudit() {
  console.log('=================================================================');
  console.log('🔍 INICIANDO AUDITORIA QA END-TO-END DE SUBMISSÃO DA PETIÇÃO');
  console.log('=================================================================\n');

  const tituloTeste = gerarTituloValido('SP');
  const payloadTeste = {
    nome: 'Auditor QA Sênior - Teste Automatizado',
    tituloEleitor: tituloTeste,
    estado: 'SP',
    municipio: 'São Paulo',
    email: 'auditor.qa.teste@exemplo.com.br',
    codigoVotado: '22',
  };

  console.log('📋 1. DADOS DE TESTE GERADOS:');
  console.log(`   - Título Gerado: ${tituloTeste} (Válido para SP via Módulo 11)`);
  console.log(`   - Município: ${payloadTeste.municipio}`);
  console.log(`   - E-mail Alvo: ${payloadTeste.email}\n`);

  const pgClient = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await pgClient.connect();

  try {
    // -------------------------------------------------------------------
    // ETAPA 1: SUBMISSÃO VÁLIDA (PRIMEIRA INSERÇÃO)
    // -------------------------------------------------------------------
    console.log('🧪 TESTE 1: Inserção inicial de apoio via POST /api/voto...');
    const res1 = await postRequest('http://localhost:3000/api/voto', payloadTeste);
    console.log(`   👉 Resposta HTTP Status: ${res1.status}`);
    console.log('   👉 Payload retornado:', JSON.stringify(res1.data));

    if (res1.status !== 200 || !res1.data.success) {
      throw new Error(`Falha no Teste 1: esperado status 200 e success=true, recebido: ${JSON.stringify(res1)}`);
    }
    console.log('   ✅ TESTE 1 APROVADO: Submissão inicial gravada com sucesso.\n');

    // -------------------------------------------------------------------
    // ETAPA 2: VERIFICAÇÃO DE INTEGRIDADE NO BANCO DE DADOS
    // -------------------------------------------------------------------
    console.log('🧪 TESTE 2: Auditoria de mapeamento das 6 colunas na tabela peticao_votos...');
    const dbQuery = await pgClient.query(
      'SELECT id, nome, titulo_eleitor, estado, municipio, email, codigo_votado, created_at FROM public.peticao_votos WHERE titulo_eleitor = $1',
      [tituloTeste]
    );

    if (dbQuery.rows.length !== 1) {
      throw new Error(`Falha no Teste 2: Registro não encontrado no Supabase para o título ${tituloTeste}`);
    }

    const row = dbQuery.rows[0];
    console.log('   👉 Registro persistido no Supabase:', row);

    const matchNome = row.nome === payloadTeste.nome;
    const matchTitulo = row.titulo_eleitor === payloadTeste.tituloEleitor;
    const matchEstado = row.estado === payloadTeste.estado;
    const matchMunicipio = row.municipio === payloadTeste.municipio;
    const matchEmail = row.email === payloadTeste.email;
    const matchCodigo = row.codigo_votado === payloadTeste.codigoVotado;

    console.log(`   - nome mapeado: ${matchNome ? '✅' : '❌'} (${row.nome})`);
    console.log(`   - titulo_eleitor mapeado: ${matchTitulo ? '✅' : '❌'} (${row.titulo_eleitor})`);
    console.log(`   - estado mapeado: ${matchEstado ? '✅' : '❌'} (${row.estado})`);
    console.log(`   - municipio mapeado: ${matchMunicipio ? '✅' : '❌'} (${row.municipio})`);
    console.log(`   - email mapeado: ${matchEmail ? '✅' : '❌'} (${row.email})`);
    console.log(`   - codigo_votado mapeado: ${matchCodigo ? '✅' : '❌'} (${row.codigo_votado})`);

    if (!matchNome || !matchTitulo || !matchEstado || !matchMunicipio || !matchEmail || !matchCodigo) {
      throw new Error('Falha no Teste 2: Divergência no mapeamento de colunas no banco!');
    }
    console.log('   ✅ TESTE 2 APROVADO: Todas as 6 colunas persistidas com 100% de integridade.\n');

    // -------------------------------------------------------------------
    // ETAPA 3: TESTE DE DUPLICIDADE (BLOQUEIO DE VOTO DUPLICADO)
    // -------------------------------------------------------------------
    console.log('🧪 TESTE 3: Submissão duplicada do mesmo Título de Eleitor...');
    const res2 = await postRequest('http://localhost:3000/api/voto', payloadTeste);
    console.log(`   👉 Resposta HTTP Status: ${res2.status}`);
    console.log('   👉 Payload retornado:', JSON.stringify(res2.data));

    if (res2.status !== 409 || !res2.data.isDuplicate || res2.data.success !== false) {
      throw new Error(`Falha no Teste 3: Esperado status 409 e isDuplicate=true, recebido: ${JSON.stringify(res2)}`);
    }
    console.log('   ✅ TESTE 3 APROVADO: Violação de UNIQUE (código 23505) interceptada com HTTP 409.\n');

    // -------------------------------------------------------------------
    // ETAPA 4: VERIFICAÇÃO DO NÚMERO DE REGISTROS NO BANCO
    // -------------------------------------------------------------------
    console.log('🧪 TESTE 4: Verificando que NENHUM segundo registro foi inserido no Supabase...');
    const countQuery = await pgClient.query(
      'SELECT COUNT(*) as total FROM public.peticao_votos WHERE titulo_eleitor = $1',
      [tituloTeste]
    );
    const totalRegistros = parseInt(countQuery.rows[0].total, 10);
    console.log(`   👉 Total de registros para o título: ${totalRegistros}`);
    if (totalRegistros !== 1) {
      throw new Error(`Falha no Teste 4: Esperado exatamente 1 registro, encontrado ${totalRegistros}`);
    }
    console.log('   ✅ TESTE 4 APROVADO: Atomicidade e restrição UNIQUE garantidas.\n');

  } finally {
    // -------------------------------------------------------------------
    // LIMPEZA DOS DADOS DE TESTE
    // -------------------------------------------------------------------
    console.log('🧹 Limpando registro de teste do banco de dados...');
    await pgClient.query('DELETE FROM public.peticao_votos WHERE titulo_eleitor = $1', [tituloTeste]);
    console.log('   ✅ Registro de teste removido. Banco limpo e higienizado.');
    await pgClient.end();
  }

  console.log('\n=================================================================');
  console.log('🎉 AUDITORIA QA CONCLUÍDA COM SUCESSO - 100% DE CONFORMIDADE!');
  console.log('=================================================================');
}

runAudit().catch((err) => {
  console.error('❌ ERRO NA AUDITORIA QA:', err);
  process.exit(1);
});
