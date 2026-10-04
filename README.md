# Vortyx

Site oficial da **Vortyx** — *Tecnologia que transforma negócios.*

A Vortyx desenvolve soluções digitais para empresas e profissionais que querem
melhorar sua presença e seus processos no ambiente digital.

- Site: https://somosvortyx.com.br
- Instagram: [@somosvortyx](https://www.instagram.com/somosvortyx/)
- E-mail: vortyx.contato@gmail.com
- WhatsApp: +55 35 99934-8489

## Serviços apresentados no site

1. Sites
2. Landing Pages
3. Automações e Integrações
4. Soluções Web para Negócios
5. Manutenção e Evolução de sites e projetos digitais
6. Automações simples com IA, quando fizer sentido

## Tecnologias

- HTML5 semântico, CSS3 puro e JavaScript puro (sem frameworks e sem build)
- [Three.js r128](https://threejs.org/) com shaders GLSL próprios (vórtice 3D em WebGL), cópia local em `js/vendor/`
- Google Fonts: Sora e Instrument Sans
- Imagens em WebP/PNG/JPG

## Estrutura

```
vortyx-site/
├── index.html                    # página única (one-page)
├── css/
│   └── styles.css                # todos os estilos
├── js/
│   ├── config.js                 # WhatsApp, fundador e lista de projetos (editar aqui)
│   ├── main.js                   # interações, navegação, cards, projetos e vórtice 3D
│   └── vendor/
│       ├── three.min.js          # Three.js r128 (cópia local)
│       └── three.LICENSE.txt
├── images/
│   ├── favicon-32.png            # favicon
│   ├── favicon-64.png            # favicon (alta densidade)
│   ├── apple-touch-icon.png      # ícone da tela inicial (iPhone/iPad), 180×180
│   ├── icon-512.png              # logo usado nos dados estruturados
│   ├── og-vortyx.jpg             # imagem de compartilhamento (Open Graph), 1200×630
│   ├── projeto-srj-business.webp # captura do projeto SRJ Business
│   ├── ruan-gomes-fundador.webp
│   ├── vortyx-logotipo.webp
│   └── vortyx-simbolo.webp
├── robots.txt
├── sitemap.xml
├── CNAME                         # domínio personalizado (somosvortyx.com.br)
├── README.md
└── .gitignore
```

## Seções da página

Início · Presença e processos (com o comparativo Site × Landing Page recolhível) ·
Serviços (6 cards expansíveis) · Diferenciais · Projetos · Processo · Sobre · Contato.

## Configuração (`js/config.js`)

- `whatsappNumber`: número oficial no formato `55 + DDD + número`.
- `whatsappMessage`: mensagem padrão. Botões podem ter mensagem própria com `data-msg="..."`.
- `projectsOnHome`: quantos projetos aparecem na home (padrão 3). Se houver mais,
  aparece o botão **Ver todos os projetos**.
- `projectsPage`: opcional — endereço de uma futura página de projetos. Vazio = o botão
  expande a lista na própria home.
- `PROJECTS`: lista de projetos. Campo `type`:
  - `"cliente"` — projeto real de cliente;
  - `"proprio"` — projeto da própria Vortyx;
  - `"demo"` — demonstração criada pela Vortyx (exibe o selo **Demonstração Vortyx**).

Cadastre apenas projetos, clientes e informações reais.

## Como abrir localmente

```bash
# na pasta do projeto
python3 -m http.server 8000
# acesse http://localhost:8000
```

Para ver o diagnóstico do 3D, acrescente `?debug3d` ao endereço.

## Publicação

O site é hospedado no **GitHub Pages**, a partir da branch `main` deste repositório,
com o domínio personalizado `somosvortyx.com.br` (arquivo `CNAME`).
Não há build: o que está na branch `main` é o que vai ao ar.

Ao alterar `css/styles.css` ou os arquivos de `js/`, aumente o parâmetro de versão
(`?v=2.0`, `?v=2.1`…) nas tags do `index.html` para que os navegadores não usem a versão em cache.
