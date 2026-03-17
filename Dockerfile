FROM node:18-alpine

WORKDIR /app

# Kopiera package filer
COPY package*.json ./

# Installera beroenden
RUN npm ci

# Kopiera resten av koden
COPY . .

# Bygg TypeScript
RUN npm run build

# Skapa en volume för SQLite databasen
VOLUME [ "/app/data" ]

# Exponera porten
EXPOSE 3000

# Starta appen
CMD ["npm", "start"]