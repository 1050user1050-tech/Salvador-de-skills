# Imagem base oficial do Node.js
FROM node:20-alpine

# Definir o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copiar os arquivos de manifesto de dependências
COPY package.json ./

# Instalar todas as dependências
RUN npm install

# Copiar os arquivos do projeto
COPY . .

# Fazer o build de produção (Vite + esbuild)
RUN npm run build

# Expor a porta em que a aplicação roda
EXPOSE 3000

# Configurar variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000

# Declarar volume para persistência dos dados de skills
VOLUME [ "/app/storage" ]

# Comando para iniciar a aplicação
CMD ["npm", "start"]
