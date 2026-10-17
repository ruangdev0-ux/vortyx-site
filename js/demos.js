/* =========================================================
   Vortyx · Registro das demonstrações
   Cada item vira um card no hub (demonstracoes/index.html).
   Para adicionar uma demo: crie a pasta em demonstracoes/<cat>/<slug>/
   e acrescente um objeto abaixo.
     cat    : sites | landing-pages | automacoes | solucoes-web | manutencao | ia
     path   : caminho relativo à pasta demonstracoes/
     thumb  : captura em images/demos/ (gerada a partir da própria demo)
     tags   : até 4 recursos em destaque
     fx     : "3D" | "Interativo" | "Simulação" (selo do card)
   Tudo aqui é demonstrativo: nomes de negócios e dados são fictícios.
   ========================================================= */
const DEMO_CATS = [
  {id:"sites",          n:"01", name:"Sites",                       short:"Sites",          lead:"Sites completos para segmentos diferentes, cada um com identidade própria."},
  {id:"landing-pages",  n:"02", name:"Landing Pages",               short:"Landing Pages",  lead:"Páginas de um objetivo só, construídas com estrutura real de conversão."},
  {id:"automacoes",     n:"03", name:"Automações e Integrações",    short:"Automações",     lead:"Veja, passo a passo, como uma informação percorre um fluxo automático."},
  {id:"solucoes-web",   n:"04", name:"Soluções Web para Negócios",  short:"Soluções Web",   lead:"Sistemas que funcionam no navegador, com dados de exemplo para você testar."},
  {id:"manutencao",     n:"05", name:"Manutenção e Evolução",       short:"Manutenção",     lead:"Compare antes e depois e acompanhe como um projeto evolui por versões."},
  {id:"ia",             n:"06", name:"Automações e soluções com IA",short:"IA",             lead:"Exemplos realistas de IA apoiando triagem, organização e atendimento."}
];

const DEMOS = [
  /* ---------- Sites ---------- */
  {id:"barbearia", cat:"sites", title:"Barbearia Navalha Norte", segment:"Barbearia", path:"sites/barbearia/", thumb:"barbearia.webp", fx:"3D",
   desc:"Visual escuro e premium, serviços com preços, equipe, galeria, horários e agendamento simulado.", tags:["Agendamento","Galeria","3D no topo"]},
  {id:"restaurante", cat:"sites", title:"Brasa & Miolo Burger Bar", segment:"Hamburgueria", path:"sites/restaurante/", thumb:"restaurante.webp", fx:"Interativo",
   desc:"Cardápio visual, combos, monte o seu burger camada por camada e pedido com entrega ou retirada.", tags:["Cardápio visual","Monte o seu","Pedido"]},
  {id:"confeitaria", cat:"sites", title:"Ateliê Açúcar & Afeto", segment:"Confeitaria", path:"sites/confeitaria/", thumb:"confeitaria.webp", fx:"Interativo",
   desc:"Confeitaria autoral com coleções, encomendas por ocasião e pedido em 4 etapas com estimativa de valor.", tags:["Encomendas","Coleções","Ocasiões"]},
  {id:"academia", cat:"sites", title:"Pulso Academia", segment:"Academia", path:"sites/academia/", thumb:"academia.webp", fx:"3D",
   desc:"Planos mensais e anuais, modalidades, professores, grade de horários e matrícula.", tags:["Planos","Grade de horários","3D"]},
  {id:"consultoria", cat:"sites", title:"Marino Consultoria", segment:"Consultoria / Profissional", path:"sites/consultoria/", thumb:"consultoria.webp", fx:"Interativo",
   desc:"Consultoria de gestão com raio-X interativo da operação, priorização de gargalos e plano de ação estruturado.", tags:["Diagnóstico","Processos","Planejamento"]},

  /* ---------- Landing Pages ---------- */
  {id:"lp-servico", cat:"landing-pages", title:"LP de serviço · Arquitetura de interiores", segment:"Serviço", path:"landing-pages/servico/", thumb:"lp-servico.webp", fx:"Interativo",
   desc:"Para profissionais que vendem um serviço: proposta clara, processo, objeções e contato.", tags:["Headline","Objeções","FAQ"]},
  {id:"lp-produto", cat:"landing-pages", title:"LP de produto digital · Curso online", segment:"Produto digital", path:"landing-pages/produto-digital/", thumb:"lp-produto.webp", fx:"Interativo",
   desc:"Landing page de curso online com prévia interativa de aula, módulos em sanfona e inscrição demonstrativa.", tags:["Curso online","Prévia interativa","Inscrição"]},
  {id:"lp-captacao", cat:"landing-pages", title:"LP de captação · Guia gratuito", segment:"Captação de leads", path:"landing-pages/captacao/", thumb:"lp-captacao.webp", fx:"Interativo",
   desc:"Landing page de captação com guia gratuito, formulário em duas etapas e conteúdo expansível.", tags:["Captação","Guia gratuito","Formulário"]},

  /* ---------- Automações e Integrações ---------- */
  {id:"auto-triagem", cat:"automacoes", title:"Triagem de atendimento", segment:"Atendimento", path:"automacoes/triagem/", thumb:"auto-triagem.webp", fx:"Simulação",
   desc:"Automação que classifica mensagens por regras, aplica prioridades e encaminha cada caso para a fila certa.", tags:["Triagem","Regras","Encaminhamento"]},
  {id:"auto-lead", cat:"automacoes", title:"Captação de lead", segment:"Comercial", path:"automacoes/captacao-lead/", thumb:"auto-lead.webp", fx:"Simulação",
   desc:"Automação que valida leads, calcula prioridade, registra no CRM e encaminha cada contato para um responsável.", tags:["Leads","Prioridade","CRM"]},
  {id:"auto-integracao", cat:"automacoes", title:"Integração entre sistemas", segment:"Integração", path:"automacoes/integracao/", thumb:"auto-integracao.webp", fx:"Simulação",
   desc:"Um pedido no site percorre API, sistema e banco até atualizar o painel.", tags:["API","JSON","Painel"]},

  /* ---------- Soluções Web ---------- */
  {id:"crm", cat:"solucoes-web", title:"Mini CRM", segment:"Comercial", path:"solucoes-web/mini-crm/", thumb:"crm.webp", fx:"Interativo",
   desc:"Funil por etapas, clientes e leads, busca, cadastro e indicadores. Funciona no navegador.", tags:["Funil","Busca","Indicadores"]},
  {id:"vendas", cat:"solucoes-web", title:"Controle de vendas", segment:"Varejo / Serviços", path:"solucoes-web/controle-de-vendas/", thumb:"vendas.webp", fx:"Interativo",
   desc:"Registre vendas, veja total do dia, ticket médio, produtos e histórico com gráficos.", tags:["Caixa","Ticket médio","Gráficos"]},
  {id:"dashboard", cat:"solucoes-web", title:"Dashboard empresarial", segment:"Gestão", path:"solucoes-web/dashboard/", thumb:"dashboard.webp", fx:"Interativo",
   desc:"Indicadores, gráficos e filtros por período e unidade, com dados de exemplo.", tags:["KPIs","Filtros","Gráficos"]},

  /* ---------- Manutenção e Evolução ---------- */
  {id:"manutencao", cat:"manutencao", title:"Antes × Depois e evolução por versões", segment:"Manutenção", path:"manutencao/antes-e-depois/", thumb:"manutencao.webp", fx:"Interativo",
   desc:"Compare uma página antiga com a versão otimizada e percorra o histórico v1.0 → v2.0.", tags:["Comparação","Responsividade","Versões"]},

  /* ---------- IA ---------- */
  {id:"ia-classificacao", cat:"ia", title:"Classificação de mensagens", segment:"Atendimento", path:"ia/classificacao/", thumb:"ia-classificacao.webp", fx:"Simulação",
   desc:"Classificação demonstrativa que compara sinais, avalia a certeza e envia casos ambíguos para revisão humana.", tags:["Sinais","Certeza","Revisão humana"]},
  {id:"ia-triagem", cat:"ia", title:"Triagem inteligente", segment:"Atendimento", path:"ia/triagem/", thumb:"ia-triagem.webp", fx:"Simulação",
   desc:"Triagem demonstrativa que extrai dados da mensagem, percebe o que falta e só encaminha quando a ficha está pronta.", tags:["Extração","Complemento","Ficha"]},
  {id:"ia-leads", cat:"ia", title:"Organização de leads", segment:"Comercial", path:"ia/leads/", thumb:"ia-leads.webp", fx:"Simulação",
   desc:"Leads organizados por interesse e prioridade, com o motivo de cada decisão.", tags:["Prioridade","Interesse","Motivos"]}
];
