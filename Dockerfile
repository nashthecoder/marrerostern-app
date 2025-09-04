# Étape 1 : Build de l'application Vue.js
FROM node:22.17.0 AS builder

# Crée un répertoire de travail
WORKDIR /app

# Copie les fichiers de dépendances et installe
COPY package*.json ./
RUN npm install

# Copie tout le reste et build l'app
COPY . .
RUN npm run build

# Étape 2 : Serveur Nginx pour servir les fichiers statiques
FROM nginx:alpine

# Copie le build dans le dossier servi par Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Optionnel : Copier une config personnalisée de Nginx
# COPY nginx.conf /etc/nginx/nginx.conf

# Exposer le port 80
EXPOSE 80

# Commande pour démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]