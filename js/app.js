/**
 * Module principal de l'application
 * @module App
 */

import logger from './utils/logger.js';
import DOM from './utils/dom.js';
import Storage from './utils/storage.js';
import { CONFIG, EVENTS } from './utils/config.js';
import { EventEmitter, debounce, throttle } from './utils/helpers.js';

// Modules principaux
import PaymentProcessor from './modules/payment.js';
import ThemeManager from './modules/theme.js';

/**
 * Application principale
 */
class NeoSafiApp extends EventEmitter {
    constructor() {
        super();
        this.modules = new Map();
        this.isInitialized = false;
        this.loadingPromises = new Map();
        
        // Configuration de performance
        this.performanceObserver = null;
        this.intersectionObserver = null;
        
        this.init();
    }

    /**
     * Initialise l'application
     */
    async init() {
        try {
            logger.info('🚀 Initializing NeoSafi Application...');
            
            // Vérifier les prérequis
            await this.checkPrerequisites();
            
            // Initialiser les modules core
            await this.initializeCoreModules();
            
            // Charger les sections HTML
            await this.loadSections();
            
            // Initialiser les modules fonctionnels
            await this.initializeFunctionalModules();
            
            // Configurer les observateurs de performance
            this.setupPerformanceMonitoring();
            
            // Configurer les gestionnaires d'événements globaux
            this.setupGlobalEventHandlers();
            
            // Finaliser l'initialisation
            this.finalize();
            
            logger.info('✅ NeoSafi Application initialized successfully');
            
        } catch (error) {
            logger.error('❌ Failed to initialize application', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Vérifie les prérequis du navigateur
     */
    async checkPrerequisites() {
        const requirements = [
            // ES6 Modules cannot be checked via typeof import; skip this check
            { name: 'Fetch API', test: () => typeof fetch !== 'undefined' },
            { name: 'Local Storage', test: () => typeof localStorage !== 'undefined' },
            { name: 'CSS Custom Properties', test: () => CSS.supports('color', 'var(--test)') },
            { name: 'Intersection Observer', test: () => typeof IntersectionObserver !== 'undefined' }
        ];

        const failed = requirements.filter(req => !req.test());
        
        if (failed.length > 0) {
            const failedNames = failed.map(req => req.name).join(', ');
            throw new Error(`Browser requirements not met: ${failedNames}`);
        }

        logger.debug('✅ All browser requirements met');
    }

    /**
     * Initialise les modules core
     */
    async initializeCoreModules() {
        logger.info('Initializing core modules...');
        
        // Gestionnaire de thèmes
        const themeManager = new ThemeManager();
        this.modules.set('theme', themeManager);
        
        // Nettoyage du stockage expiré
        Storage.cleanup();
        
        logger.debug('Core modules initialized');
    }

    /**
     * Charge les sections HTML
     */
    async loadSections() {
        logger.info('Loading HTML sections...');
        
        const sections = [
            { id: 'navbar-section', file: 'navbar.html' },
            { id: 'hero-section', file: 'hero.html' },
            { id: 'partners-section', file: 'partners.html' },
            { id: 'features-section', file: 'features.html' },
            { id: 'pricing-section', file: 'pricing.html' },
            { id: 'products-section', file: 'products.html' },
            { id: 'contact-section', file: 'contact.html' },
            { id: 'footer-section', file: 'footer.html' }
        ];

        // Charger les sections en parallèle avec gestion d'erreurs
        const loadPromises = sections.map(async (section) => {
            try {
                const container = DOM.$(`#${section.id}`);
                if (container) {
                    await DOM.loadHTML(section.file, container);
                    this.emit(EVENTS.SECTION_LOADED, section);
                    logger.debug(`Section loaded: ${section.id}`);
                } else {
                    logger.warn(`Container not found for section: ${section.id}`);
                }
            } catch (error) {
                logger.error(`Failed to load section: ${section.id}`, error);
                // Ne pas faire échouer toute l'application pour une section
            }
        });

        await Promise.allSettled(loadPromises);
        logger.info('HTML sections loading completed');
    }

    /**
     * Initialise les modules fonctionnels
     */
    async initializeFunctionalModules() {
        logger.info('Initializing functional modules...');
        
        try {
            // Processeur de paiement
            const paymentProcessor = new PaymentProcessor();
            this.modules.set('payment', paymentProcessor);
            
            // Autres modules peuvent être ajoutés ici
            // const contactManager = new ContactManager();
            // this.modules.set('contact', contactManager);
            
            logger.debug('Functional modules initialized');
            
        } catch (error) {
            logger.error('Failed to initialize functional modules', error);
            // Les modules fonctionnels peuvent échouer sans casser l'app
        }
    }

    /**
     * Configure le monitoring de performance
     */
    setupPerformanceMonitoring() {
        if (!CONFIG.DEBUG.PERFORMANCE_MONITORING) return;

        try {
            // Observer les métriques de performance
            if (typeof PerformanceObserver !== 'undefined') {
                this.performanceObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'navigation') {
                            logger.info(`Page load time: ${entry.loadEventEnd - entry.loadEventStart}ms`);
                        } else if (entry.entryType === 'paint') {
                            logger.info(`${entry.name}: ${entry.startTime}ms`);
                        }
                    });
                });

                this.performanceObserver.observe({ entryTypes: ['navigation', 'paint'] });
            }

            // Observer l'intersection pour le lazy loading
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.handleElementInView(entry.target);
                    }
                });
            }, {
                rootMargin: `${CONFIG.PERFORMANCE.LAZY_LOAD_OFFSET}px`
            });

            // Observer les images pour le lazy loading
            document.querySelectorAll('img[data-src]').forEach(img => {
                this.intersectionObserver.observe(img);
            });

        } catch (error) {
            logger.warn('Performance monitoring setup failed', error);
        }
    }

    /**
     * Gère les éléments qui entrent dans le viewport
     * @param {Element} element - Élément observé
     */
    handleElementInView(element) {
        // Lazy loading des images
        if (element.tagName === 'IMG' && element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
            this.intersectionObserver.unobserve(element);
        }

        // Animations d'entrée
        if (element.classList.contains('animate-on-scroll')) {
            element.classList.add('animated');
        }
    }

    /**
     * Configure les gestionnaires d'événements globaux
     */
    setupGlobalEventHandlers() {
        // Gestion des erreurs globales
        window.addEventListener('error', (event) => {
            logger.error('Global error caught', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Gestion des promesses rejetées
        window.addEventListener('unhandledrejection', (event) => {
            logger.error('Unhandled promise rejection', event.reason);
        });

        // Gestion du scroll avec throttling
        const throttledScrollHandler = throttle(() => {
            this.handleScroll();
        }, CONFIG.PERFORMANCE.THROTTLE_DELAY);

        window.addEventListener('scroll', throttledScrollHandler, { passive: true });

        // Gestion du redimensionnement avec debouncing
        const debouncedResizeHandler = debounce(() => {
            this.handleResize();
        }, CONFIG.PERFORMANCE.DEBOUNCE_DELAY);

        window.addEventListener('resize', debouncedResizeHandler);

        // Navigation fluide
        this.setupSmoothScrolling();

        // Raccourcis clavier
        this.setupKeyboardShortcuts();

        logger.debug('Global event handlers configured');
    }

    /**
     * Gère le scroll de la page
     */
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Navbar sticky
        const navbar = DOM.$('nav');
        if (navbar) {
            if (scrollTop > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // Bouton retour en haut
        const backToTop = DOM.$('#backToTop');
        if (backToTop) {
            if (scrollTop > 300) {
                backToTop.style.display = 'block';
            } else {
                backToTop.style.display = 'none';
            }
        }
    }

    /**
     * Gère le redimensionnement de la fenêtre
     */
    handleResize() {
        // Vider le cache DOM car les éléments peuvent avoir changé
        DOM.clearCache();
        
        // Recalculer les layouts si nécessaire
        this.emit('app:resize', {
            width: window.innerWidth,
            height: window.innerHeight
        });
    }

    /**
     * Configure la navigation fluide
     */
    setupSmoothScrolling() {
        // Délégation d'événements pour les liens d'ancrage
        DOM.delegate(document, 'a[href^="#"]', 'click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            const targetElement = DOM.$(`#${targetId}`);
            
            if (targetElement) {
                DOM.scrollTo(targetElement);
            }
        });
    }

    /**
     * Configure les raccourcis clavier
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K pour la recherche
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }
            
            // Échap pour fermer les modals
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
    }

    /**
     * Ouvre la recherche
     */
    openSearch() {
        // Implémentation de la recherche
        logger.info('Search opened');
    }

    /**
     * Ferme tous les modals ouverts
     */
    closeModals() {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
        });
    }

    /**
     * Finalise l'initialisation
     */
    finalize() {
        this.isInitialized = true;
        
        // Masquer le loader si présent
        const loader = DOM.$('#app-loader');
        if (loader) {
            DOM.removeElement(loader, CONFIG.UI.ANIMATION_DURATION);
        }

        // Ajouter la classe d'application initialisée
        document.body.classList.add('app-initialized');
        
        // Émettre l'événement d'initialisation complète
        this.emit('app:initialized', {
            modules: Array.from(this.modules.keys()),
            timestamp: new Date().toISOString()
        });

        // Afficher les statistiques en mode debug
        if (CONFIG.DEBUG.ENABLED) {
            this.logInitializationStats();
        }
    }

    /**
     * Affiche les statistiques d'initialisation
     */
    logInitializationStats() {
        const stats = {
            modules: this.modules.size,
            storage: Storage.getStats(),
            performance: {
                loadTime: performance.now(),
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
                } : 'Not available'
            }
        };

        logger.group('📊 Application Statistics', () => {
            logger.table(stats);
        });
    }

    /**
     * Gère les erreurs d'initialisation
     * @param {Error} error - Erreur d'initialisation
     */
    handleInitializationError(error) {
        // Afficher un message d'erreur à l'utilisateur
        const errorContainer = DOM.$('#error-container') || document.body;
        
        const errorMessage = DOM.createElement('div', {
            className: 'alert alert-danger m-3',
            role: 'alert'
        }, `
            <h4>Application Error</h4>
            <p>The application failed to initialize properly. Please refresh the page or contact support.</p>
            <details>
                <summary>Technical Details</summary>
                <pre>${error.message}</pre>
            </details>
        `);

        errorContainer.appendChild(errorMessage);
    }

    /**
     * Obtient un module par nom
     * @param {string} name - Nom du module
     * @returns {*} Module ou null
     */
    getModule(name) {
        return this.modules.get(name) || null;
    }

    /**
     * Vérifie si l'application est initialisée
     * @returns {boolean}
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Nettoie les ressources avant déchargement
     */
    cleanup() {
        logger.info('Cleaning up application resources...');
        
        // Nettoyer les observateurs
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
        
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }

        // Nettoyer les modules
        this.modules.forEach((module, name) => {
            if (typeof module.cleanup === 'function') {
                try {
                    module.cleanup();
                    logger.debug(`Module cleaned up: ${name}`);
                } catch (error) {
                    logger.warn(`Failed to cleanup module: ${name}`, error);
                }
            }
        });

        // Vider les caches
        DOM.clearCache();
        
        logger.info('Application cleanup completed');
    }
}

// Initialiser l'application quand le DOM est prêt
let app = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        app = new NeoSafiApp();
        
        // Exposer l'application globalement pour le debug
        if (CONFIG.DEBUG.ENABLED) {
            window.NeoSafiApp = app;
            window.logger = logger;
            window.DOM = DOM;
            window.Storage = Storage;
        }
        
    } catch (error) {
        console.error('Failed to start application:', error);
    }
});

// Nettoyer avant déchargement
window.addEventListener('beforeunload', () => {
    if (app) {
        app.cleanup();
    }
});

export default NeoSafiApp;