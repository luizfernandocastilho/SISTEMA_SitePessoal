FROM node:22-alpine

WORKDIR /app

# Instala dependências (tsx roda o TS direto em produção — sem etapa de build).
COPY package.json ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]
