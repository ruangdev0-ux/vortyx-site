# Vortyx

Site oficial da **Vortyx**, empresa de criação de sites e landing pages.
Página única (one-page), responsiva, com um vórtice 3D animado em Three.js
como assinatura visual, navegação interna animada e contato via WhatsApp.

## Tecnologias utilizadas

- HTML5 semântico
- CSS3 puro (custom properties, grid, flexbox, `clamp()`, animações)
- JavaScript puro (ES2017+, sem frameworks nem build)
- [Three.js r128](https://threejs.org/) com shaders GLSL próprios (vórtice 3D em WebGL)
- Google Fonts: Sora e Instrument Sans
- Imagens em WebP

## Estrutura

```
vortyx/
├── index.html              # página principal
├── css/
│   └── styles.css          # todos os estilos
├── js/
│   ├── config.js           # WhatsApp, fundador e lista de projetos (editar aqui)
│   ├── main.js             # interações, navegação e vórtice 3D
│   └── vendor/
│       ├── three.min.js    # Three.js r128 (cópia local)
│       └── three.LICENSE.txt
├── images/
│   ├── favicon.png
│   ├── vortyx-simbolo.webp
│   ├── vortyx-logotipo.webp
│   └── ruan-gomes-fundador.webp
├── README.md
└── .gitignore
```

## Como abrir localmente

**Opção 1: direto no navegador**
Dê dois cliques em `index.html`. O site abre e funciona, inclusive o 3D
(o Three.js é carregado da pasta `js/vendor/`).

**Opção 2: servidor local (recomendado para testar como na hospedagem)**

```bash
# na pasta do projeto
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

Ou use a extensão *Live Server* do VS Code.

Para ver o diagnóstico do 3D, acrescente `?debug3d` ao endereço
(ex.: `http://localhost:8000/?debug3d`).

## Configuração

Edite `js/config.js`:

- `whatsappNumber`: número oficial no formato `55 + DDD + número`
  (ex.: `"5535999999999"`). Vazio = o WhatsApp abre com a mensagem pronta
  e pede para o visitante escolher o contato.
- `whatsappMessage`: mensagem pré-preenchida.
- `PROJECTS`: lista de projetos exibidos na seção Projetos.

## Hospedagem

O projeto será hospedado futuramente na **Hostinger**. Por ser um site
estático, basta enviar o conteúdo desta pasta (com `index.html` na raiz)
para `public_html`. Não há build, banco de dados nem dependências de servidor.

Antes de publicar, com o domínio definitivo em mãos, ative as linhas
comentadas de `canonical`, `og:url` e `og:image` no `<head>` do `index.html`.
