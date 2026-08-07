# Prompt & Skill Manager - Guia de Execução Local e Docker

Este projeto é um gerenciador completo de Prompts e Skills, com suporte a versionamento, testes em playground via IA Gemini, sincronização com repositório Git e histórico de diffs.

---

## 🐳 Como Executar com Docker (Recomendado)

A forma mais rápida e limpa de rodar o projeto localmente é usando **Docker** e **Docker Compose**.

### Opção 1: Usando Docker Compose

1. **Iniciar o contêiner:**
```bash
docker compose up -d --build
```

2. **Acesse no seu navegador:**
👉 **[http://localhost:3000](http://localhost:3000)**

3. **Para parar a aplicação:**
```bash
docker compose down
```

*Nota: As skills e prompts ficam salvos na pasta `./storage` da sua máquina local via volume do Docker, garantindo que nenhum dado seja perdido ao reiniciar os contêineres.*

---

### Opção 2: Usando Comandos do Docker diretamente

1. **Construir a Imagem:**
```bash
docker build -t prompt-skill-manager .
```

2. **Rodar o Contêiner com Volume Local:**
```bash
docker run -d \
  -p 3000:3000 \
  -e GEMINI_API_KEY="Sua_Chave_Gemini_Opcional" \
  -v $(pwd)/storage:/app/storage \
  --name prompt_skill_manager \
  prompt-skill-manager
```

---

## 💻 Como Executar com Node.js (Sem Docker)

### 1. Pré-requisitos
- **Node.js**: Versão 18.x ou superior (recomendado 20.x+)
- **npm** (incluso com Node.js) ou **pnpm** / **yarn** / **bun**

---

### 2. Passo a Passo de Instalação e Execução

#### 1. Instalar as Dependências
No terminal, dentro da pasta do projeto, execute:
```bash
npm install
```

#### 2. Configurar Variáveis de Ambiente (Opcional)
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
cp .env.example .env
```

Conteúdo do `.env`:
```env
# Opcional: Chave da API Gemini para usar o Playground de IA e Otimização Automática
GEMINI_API_KEY="Sua_Chave_Gemini_Aqui"

# Opcional: Porta do servidor (padrão 3000)
PORT=3000
```

*Nota: A aplicação funciona perfeitamente sem a chave do Gemini, permitindo gerenciar, organizar, editar, versionar e exportar todas as suas skills e prompts normalmente.*

---

### 3. Iniciar o Servidor de Desenvolvimento
Para rodar a aplicação em modo de desenvolvimento com suporte a hot reload:

```bash
npm run dev
```

Acesse no seu navegador:
👉 **[http://localhost:3000](http://localhost:3000)**

---

### 4. Build e Produção

Para testar o build compilado de produção:

1. **Compilar o Projeto:**
```bash
npm run build
```

2. **Iniciar o Servidor em Produção:**
```bash
npm start
```

---

## 📂 Estrutura de Armazenamento Local

Todos os dados das suas skills são armazenados localmente na pasta:
`./storage/skills/`

Cada skill é salva em sua própria estrutura modular:
- `title.json` - Título da skill
- `description.json` - Descrição
- `github.json` - Link do repositório
- `tags.json` - Tags da skill
- `prompt.json` - Conteúdo do prompt atual
- `versions/` - Histórico de versões (`v1.0.json`, `v1.1.json`, etc.)
- `assets/` - Imagens e anexos associados

Você pode commitar a pasta `storage/` no Git para manter todas as suas skills sincronizadas em equipe!

---

## 🛠️ Scripts Disponíveis no `package.json`

- `npm run dev` - Inicia o servidor backend Express + Vite em desenvolvimento
- `npm run build` - Compila o frontend com Vite e o backend com esbuild
- `npm start` - Executa a versão compilada em produção (`dist/server.cjs`)
- `npm run lint` - Checa a tipagem do TypeScript (`tsc --noEmit`)

