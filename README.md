# Vortyx

Site oficial da **Vortyx** — *Tecnologia que transforma negócios.*

**Entendemos o problema. Aplicamos a tecnologia certa.** A Vortyx entende como o negócio
funciona antes de propor uma ferramenta e, depois, desenvolve a solução digital adequada.

- Site: https://somosvortyx.com.br
- Instagram: [@somosvortyx](https://www.instagram.com/somosvortyx/)
- E-mail: vortyx.contato@gmail.com
- WhatsApp: +55 35 99934-8489

## Serviços apresentados no site

1. Sites
2. Landing Pages
3. E-commerce / Lojas Virtuais
4. Automações e Integrações
5. Soluções Web para Negócios (sistemas, plataformas, áreas logadas, dashboards, portais e produtos SaaS)
6. Manutenção e Evolução
7. Automações e soluções simples com IA, quando fizer sentido

## Tecnologias

- HTML5 semântico, CSS3 puro e JavaScript puro (sem frameworks e sem build)
- [Three.js r128](https://threejs.org/) com shaders próprios (vórtice 3D da Home e fundos 3D de algumas
  demonstrações), sempre da cópia local em `js/vendor/` — o site não depende de CDN
- O 3D só liga com WebGL acelerado por hardware; sem aceleração, sem WebGL ou com
  "reduzir movimento", entra a versão estática
- Google Fonts: Sora e Instrument Sans (cada demonstração pode ter as suas)
- Imagens em WebP/PNG/JPG

## Estrutura

```
vortyx-site/
├── index.html                  # Home (one-page)
├── 404.html                    # página de erro personalizada (GitHub Pages)
├── css/
│   ├── styles.css              # estilos da Home
│   └── demos.css               # estilos do hub de demonstrações
├── js/
│   ├── config.js               # WhatsApp, fundador e lista de projetos (editar aqui)
│   ├── main.js                 # Home: navegação, serviços, vitrine animada e vórtice 3D
│   ├── demos.js                # catálogo das demonstrações (título, descrição, tags, miniatura)
│   ├── demos-hub.js            # hub de demonstrações (abas por categoria e fundo 3D)
│   └── vendor/three.min.js     # Three.js r128 (cópia local) + licença
├── demos-kit/                  # código comum às demonstrações
│   ├── kit.js / kit.css        # barra "Demonstração Vortyx", convite final, toasts, 3D sob demanda
│   ├── lab.css                 # visual das demos técnicas (automações, sistemas, IA)
│   ├── flow.js                 # componente de fluxo em etapas
│   └── charts.js               # gráficos simples em SVG
├── demonstracoes/
│   ├── index.html              # hub (/demonstracoes/)
│   ├── sites/                  # barbearia, restaurante, confeitaria, academia, consultoria
│   ├── landing-pages/          # servico, produto-digital, captacao
│   ├── automacoes/             # triagem, captacao-lead, integracao
│   ├── solucoes-web/           # mini-crm, controle-de-vendas, dashboard
│   ├── manutencao/             # antes-e-depois
│   └── ia/                     # classificacao, triagem, leads (+ ia-sim.js e ia.css, comuns às 3)
├── images/
│   ├── demos/                  # miniaturas do hub e dos cards da Home (960×600, WebP)
│   ├── vitrine/                # telas da vitrine animada: {cena}-d (notebook), -t (tablet), -m (celular)
│   ├── og-vortyx-v3.jpg        # imagem de compartilhamento (1200×630)
│   ├── ruan-gomes-fundador.webp  # sem uso no site (reservada)
│   ├── vortyx-logotipo.webp / vortyx-simbolo.webp
│   └── favicons e ícones
├── robots.txt
├── sitemap.xml                 # Home e hub (as demonstrações são noindex)
├── CNAME                       # domínio personalizado (somosvortyx.com.br)
└── README.md
```

## Home

Início · Problemas · Vitrine animada · Demonstrações em destaque · Serviços (7 cards expansíveis) ·
Como a Vortyx trabalha · Processo · Contato.

### Vitrine animada

Cenas em notebook, tablet e celular, todas sincronizadas com o rótulo. Cada cena é marcada como
**Demonstração** (abre a demo publicada) ou **Conceito Vortyx** (tela conceitual, sem demo
publicada; o link leva à conversa no WhatsApp). As cenas ficam em `#scProg` no `index.html`
(`data-k`, `data-type`, `data-kind`, `data-href` ou `data-msg`) e as imagens em `images/vitrine/`.

## Demonstrações

Todas são fictícias e marcadas como tal (barra "Demonstração Vortyx" e `noindex`).
A barra, o convite final e o botão "Quero algo assim" vêm de `demos-kit/kit.js`.
Para incluir uma demo no hub, cadastre-a em `js/demos.js` e gere a miniatura em `images/demos/`.

## Configuração (`js/config.js`)

- `whatsappNumber`: número oficial no formato `55 + DDD + número`.
- `whatsappMessage`: mensagem padrão. Botões podem ter mensagem própria com `data-msg="..."`.
- `founderName` / `founderRole`: reservados; hoje não há bloco de fundador exibido no site.
- `PROJECTS`: lista de projetos para uma futura seção de projetos (hoje não exibida na Home).
  Cadastre apenas projetos, clientes e informações reais e autorizados.

## Como abrir localmente

```bash
# na pasta do projeto
python3 -m http.server 8000
# acesse http://localhost:8000
```

Para ver o diagnóstico do 3D da Home, acrescente `?debug3d` ao endereço.

## Publicação

O site é hospedado no **GitHub Pages**, a partir da branch `main` deste repositório,
com o domínio personalizado `somosvortyx.com.br` (arquivo `CNAME`).
Não há build: o que está na branch `main` é o que vai ao ar.

Ao alterar CSS ou JS, aumente o parâmetro de versão (`?v=3.1`, `?v=2`…) nas tags que
carregam o arquivo, para que os navegadores não usem a versão em cache.
