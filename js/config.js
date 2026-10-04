/* =========================================================
   CONFIGURAÇÃO — edite aqui
   ========================================================= */
const CONFIG = {
  // NÚMERO OFICIAL: formato internacional = 55 + DDD + número (sem espaços).
  // Todos os botões de WhatsApp do site usam este número.
  whatsappNumber: "5535999348489", // +55 35 99934-8489 (WhatsApp Business oficial)
  whatsappMessage: "Olá! Vim pelo site da Vortyx e gostaria de conversar sobre um projeto.",
  founderName: "Ruan Gomes",
  founderRole: "Fundador da Vortyx",

  // Projetos na home: quantos destaques aparecem antes do botão "Ver todos os projetos".
  projectsOnHome: 3,
  // Opcional: endereço de uma futura página com todos os projetos (ex.: "projetos/").
  // Vazio = o botão "Ver todos os projetos" expande a lista na própria home.
  projectsPage: ""
};

/* =========================================================
   PROJETOS
   ---------------------------------------------------------
   Campos:
     type        "cliente" (projeto real de cliente), "proprio" (projeto da Vortyx)
                 ou "demo" (demonstração criada pela Vortyx; mostra o selo
                 "Demonstração Vortyx")
     client      nome do projeto
     category    ex.: "Site institucional", "Landing Page", "Solução Web"
     description texto curto (1–2 frases)
     image       caminho da captura (16:10 ou 16:9, WebP) — opcional
     imageWidth / imageHeight  dimensões reais da captura (evita salto de layout)
     emblem      true = usa o símbolo da Vortyx no lugar da imagem
     link        endereço do projeto (externo abre em nova aba)
     linkLabel   texto do botão (padrão: "Ver site")
     featured    true = prioridade para aparecer entre os destaques da home
   Ordem: a lista é exibida na ordem abaixo (destaques primeiro).
   Não cadastre clientes, resultados ou números que não sejam reais.
   ========================================================= */
const PROJECTS = [
  {
    type: "cliente",
    client: "SRJ Business",
    category: "Site institucional",
    description: "Site institucional para uma empresa de estruturação de negócios: apresentação da marca, das soluções e contato direto pelo WhatsApp.",
    image: "images/projeto-srj-business.webp",
    imageWidth: 1438,
    imageHeight: 832,
    imageAlt: "Página inicial do site da SRJ Business, com o título “Construindo negócios mais preparados para o futuro”",
    link: "https://srjbusiness.github.io/srj-business/",
    linkLabel: "Ver site",
    featured: true
  },
  {
    type: "proprio",
    client: "Vortyx",
    category: "Site institucional",
    description: "A identidade digital da própria Vortyx: direção visual, conteúdo, elemento 3D autoral e desenvolvimento. Você está navegando nele agora.",
    emblem: true,
    link: "",
    featured: true
  }
  /* Exemplo de demonstração (futuro):
  ,{
    type: "demo",
    client: "Caixa simples",
    category: "Solução Web para Negócios",
    description: "Demonstração de um sistema simples de caixa e gestão para pequenos negócios.",
    image: "images/demo-caixa.webp",
    link: "https://...",
    linkLabel: "Ver demonstração"
  }
  */
];
