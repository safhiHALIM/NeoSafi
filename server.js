import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration des variables d'environnement
dotenv.config();

// Configuration des chemins pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            connectSrc: ["'self'"]
        }
    }
}));

// Configuration CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true
}));

// Limitation du taux de requêtes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite chaque IP à 100 requêtes par windowMs
    message: {
        success: false,
        message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
    }
});

app.use('/api/', limiter);

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname)));

// Routes API simplifiées (sans base de données)
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Serveur en fonctionnement',
        data: {
            server: 'OK',
            mode: 'Frontend Only',
            timestamp: new Date().toISOString()
        }
    });
});

// API simulée pour les produits (données statiques)
app.get('/api/products', (req, res) => {
    const products = [
        {
            id: 1,
            name: "Professional Business Website Template",
            price: 299,
            category: "Template",
            description: "Complete responsive website template with modern design, contact forms, and SEO optimization.",
            features: ["Responsive Design", "SEO Optimized", "Contact Forms", "1 Year Support"],
            image: "img/product/webtemp.png"
        },
        {
            id: 2,
            name: "Complete E-commerce Solution",
            price: 799,
            category: "E-commerce",
            description: "Full-featured online store with payment integration, inventory management, and admin panel.",
            features: ["Payment Gateway", "Inventory Management", "Admin Dashboard", "Mobile App Ready"],
            image: "img/product/Design a modern and .png"
        },
        {
            id: 3,
            name: "React Native App Template",
            price: 499,
            category: "Mobile App",
            description: "Cross-platform mobile app template with authentication, push notifications, and API integration.",
            features: ["iOS & Android", "Push Notifications", "User Authentication", "API Integration"],
            image: "img/product/Create a modern, cle.png"
        },
        {
            id: 4,
            name: "Admin Dashboard Template",
            price: 399,
            category: "Dashboard",
            description: "Modern admin dashboard with charts, tables, user management, and dark mode support.",
            features: ["Interactive Charts", "Data Tables", "Dark Mode", "User Management"],
            image: "img/product/Create a modern and .png"
        },
        {
            id: 5,
            name: "API Documentation Template",
            price: 199,
            category: "API",
            description: "Beautiful API documentation template with interactive examples and code snippets.",
            features: ["Interactive Examples", "Code Snippets", "Search Function", "Multiple Languages"],
            image: "img/product/apimg.png"
        },
        {
            id: 6,
            name: "Complete SEO Tools Package",
            price: 599,
            category: "SEO Tools",
            description: "Comprehensive SEO analysis tools with keyword research, competitor analysis, and reporting.",
            features: ["Keyword Research", "Competitor Analysis", "Site Audit", "Reporting Tools"],
            image: "img/product/seoimg.png"
        }
    ];

    res.json({
        success: true,
        data: products
    });
});

// API simulée pour les catégories
app.get('/api/categories', (req, res) => {
    const categories = [
        { id: 1, name: "Template", color: "primary" },
        { id: 2, name: "E-commerce", color: "success" },
        { id: 3, name: "Mobile App", color: "warning" },
        { id: 4, name: "Dashboard", color: "info" },
        { id: 5, name: "API", color: "secondary" },
        { id: 6, name: "SEO Tools", color: "danger" }
    ];

    res.json({
        success: true,
        data: categories
    });
});

// API simulée pour le contact
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    // Simulation d'envoi d'email
    console.log('📧 Nouveau message de contact:');
    console.log(`Nom: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Message: ${message}`);
    
    res.json({
        success: true,
        message: 'Votre message a été envoyé avec succès!'
    });
});

// Route pour servir l'index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Routes pour les pages complètes
app.get('/contact-page.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact-page.html'));
});

app.get('/products-page.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'products-page.html'));
});

app.get('/features-page.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'features-page.html'));
});

app.get('/pricing-page.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pricing-page.html'));
});

// Route pour la page de test de navigation
app.get('/test-navigation.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-navigation.html'));
});

// Routes pour toutes les pages de services
app.get('/web-development.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-development.html'));
});

app.get('/mobile-design.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'mobile-design.html'));
});

app.get('/cloud-integration.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'cloud-integration.html'));
});

app.get('/security.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'security.html'));
});

app.get('/analytics.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'analytics.html'));
});

app.get('/automation.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'automation.html'));
});

app.get('/database.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'database.html'));
});

// Route pour le test complet de navbar
app.get('/navbar-test-complete.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'navbar-test-complete.html'));
});

// Middleware de gestion des erreurs 404
app.use('*', (req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
        res.status(404).json({
            success: false,
            message: 'Route API non trouvée'
        });
    } else {
        res.status(404).sendFile(path.join(__dirname, 'index.html'));
    }
});

// Middleware de gestion des erreurs globales
app.use((error, req, res, next) => {
    console.error('Erreur non gérée:', error);
    
    res.status(error.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Erreur interne du serveur' 
            : error.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
});

// Démarrage du serveur
const startServer = () => {
    app.listen(PORT, () => {
        console.log('🚀 Serveur NeoSafi Frontend démarré avec succès !');
        console.log(`📍 URL: http://localhost:${PORT}`);
        console.log(`🔧 API: http://localhost:${PORT}/api`);
        console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
        console.log('📊 Mode: Frontend uniquement (sans base de données)');
        console.log('\n✨ Fonctionnalités disponibles:');
        console.log('   - Site web complet');
        console.log('   - API simulée pour les produits');
        console.log('   - Formulaire de contact');
        console.log('   - Interface responsive');
    });
};

// Gestion des signaux de fermeture
process.on('SIGTERM', () => {
    console.log('🛑 Signal SIGTERM reçu, fermeture du serveur...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Signal SIGINT reçu, fermeture du serveur...');
    process.exit(0);
});

// Démarrer le serveur
startServer();