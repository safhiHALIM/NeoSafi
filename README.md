# NeoSafi Frontend - Node.js

Ce dossier contient la version frontend uniquement du projet NeoSafi, sans base de données ni pages d'administration.

## 🚀 Démarrage rapide

### Option 1: Utiliser le script Python (Recommandé)
```bash
python start.py
```

### Option 2: Utiliser npm directement
```bash
# Installer les dépendances
npm install

# Démarrer le serveur
npm start

# Ou en mode développement avec auto-reload
npm run dev
```

## 📋 Fonctionnalités incluses

✅ **Site web complet**
- Page d'accueil responsive
- Section produits avec 6 produits
- Formulaire de contact
- Pages de services
- Interface moderne et professionnelle

✅ **API simulée**
- `/api/products` - Liste des produits
- `/api/categories` - Liste des catégories
- `/api/contact` - Formulaire de contact
- `/api/health` - Vérification du serveur

✅ **Sécurité**
- Protection CORS
- Limitation du taux de requêtes
- Headers de sécurité avec Helmet

## 🌐 URLs disponibles

- **Site principal**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

## 📁 Structure du projet

```
node-frontend/
├── server.js              # Serveur Express principal
├── package.json           # Dépendances Node.js
├── start.py              # Script de démarrage Python
├── .env                  # Configuration
├── index.html            # Page d'accueil
├── products.html         # Page produits
├── contact.html          # Page contact
├── style.css             # Styles CSS
├── script.js             # JavaScript principal
├── payment.js            # Logique de paiement
├── js/                   # Scripts JavaScript
│   ├── app.js
│   ├── modules/
│   │   ├── payment.js
│   │   └── theme.js
│   └── utils/            # Utilitaires
└── img/                  # Images et ressources
```

## 🔧 Configuration

Le fichier `.env` contient la configuration du serveur :

```env
PORT=3000                    # Port du serveur
NODE_ENV=development         # Environnement
CORS_ORIGIN=http://localhost:3000  # Origine CORS
```

## 📦 Dépendances

- **express**: Serveur web
- **cors**: Gestion CORS
- **helmet**: Sécurité HTTP
- **express-rate-limit**: Limitation des requêtes
- **dotenv**: Variables d'environnement

## 🚫 Exclusions

Ce projet frontend **NE CONTIENT PAS** :
- Base de données MySQL
- Pages d'administration
- Authentification utilisateur
- Gestion des utilisateurs
- Scripts de base de données

## 💡 Notes importantes

1. **Mode démonstration**: Les données des produits sont statiques et définies dans le serveur
2. **Formulaire de contact**: Les messages sont affichés dans la console du serveur
3. **Pas de persistance**: Aucune donnée n'est sauvegardée
4. **Développement**: Parfait pour le développement frontend et les démonstrations

## 🔄 Retour au projet complet

Pour utiliser la version complète avec base de données, retournez au dossier parent et utilisez les scripts appropriés.

## 🆘 Dépannage

### Erreur "Node.js n'est pas installé"
- Installez Node.js depuis https://nodejs.org/
- Redémarrez votre terminal

### Erreur de port déjà utilisé
- Changez le port dans le fichier `.env`
- Ou arrêtez le processus utilisant le port 3000

### Problèmes de dépendances
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```