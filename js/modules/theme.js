/**
 * Module de gestion des thèmes
 * @module ThemeModule
 */

import logger from '../utils/logger.js';
import DOM from '../utils/dom.js';
import Storage from '../utils/storage.js';
import { CONFIG, SELECTORS, EVENTS } from '../utils/config.js';
import { EventEmitter } from '../utils/helpers.js';

/**
 * Gestionnaire de thèmes
 */
export class ThemeManager extends EventEmitter {
    constructor() {
        super();
        this.currentTheme = 'light';
        this.themes = new Map([
            ['light', {
                name: 'Light',
                icon: 'fas fa-sun',
                colors: {
                    primary: '#6366f1',
                    secondary: '#10b981',
                    background: '#f8fafc',
                    surface: '#ffffff',
                    text: '#333333'
                }
            }],
            ['dark', {
                name: 'Dark',
                icon: 'fas fa-moon',
                colors: {
                    primary: '#6366f1',
                    secondary: '#10b981',
                    background: '#0f172a',
                    surface: '#1e293b',
                    text: '#e2e8f0'
                }
            }]
        ]);
        
        this.init();
    }

    /**
     * Initialise le gestionnaire de thèmes
     */
    async init() {
        try {
            await this.loadSavedTheme();
            await this.bindEvents();
            this.updateThemeToggle();
            
            logger.info(`Theme manager initialized with theme: ${this.currentTheme}`);
        } catch (error) {
            logger.error('Failed to initialize theme manager', error);
        }
    }

    /**
     * Charge le thème sauvegardé
     */
    async loadSavedTheme() {
        const savedTheme = Storage.theme.get();
        
        if (savedTheme && this.themes.has(savedTheme)) {
            await this.setTheme(savedTheme, false); // Ne pas sauvegarder à nouveau
        } else {
            // Détecter la préférence système
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const defaultTheme = prefersDark ? 'dark' : 'light';
            await this.setTheme(defaultTheme);
        }
    }

    /**
     * Attache les événements
     */
    async bindEvents() {
        // Bouton de basculement de thème
        const themeToggle = await DOM.waitForElement(SELECTORS.THEME_TOGGLE, 2000).catch(() => null);
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Écouter les changements de préférence système
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!Storage.theme.get()) { // Seulement si aucune préférence manuelle
                const newTheme = e.matches ? 'dark' : 'light';
                this.setTheme(newTheme);
            }
        });

        // Raccourci clavier
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    /**
     * Définit le thème
     * @param {string} themeName - Nom du thème
     * @param {boolean} save - Sauvegarder la préférence
     */
    async setTheme(themeName, save = true) {
        if (!this.themes.has(themeName)) {
            logger.warn(`Unknown theme: ${themeName}`);
            return;
        }

        const previousTheme = this.currentTheme;
        this.currentTheme = themeName;

        try {
            // Appliquer le thème au DOM
            await this.applyTheme(themeName);
            
            // Sauvegarder la préférence
            if (save) {
                Storage.theme.set(themeName);
            }

            // Mettre à jour l'interface
            this.updateThemeToggle();
            
            // Émettre l'événement
            this.emit(EVENTS.THEME_CHANGED, {
                previous: previousTheme,
                current: themeName,
                theme: this.themes.get(themeName)
            });

            logger.info(`Theme changed to: ${themeName}`);
            
        } catch (error) {
            logger.error(`Failed to set theme: ${themeName}`, error);
            this.currentTheme = previousTheme; // Rollback
        }
    }

    /**
     * Applique le thème au DOM
     * @param {string} themeName - Nom du thème
     */
    async applyTheme(themeName) {
        const theme = this.themes.get(themeName);
        if (!theme) return;

        // Ajouter une classe de transition pour une animation fluide
        document.documentElement.style.transition = `all ${CONFIG.THEME.TRANSITION_DURATION}ms ease`;
        
        // Appliquer l'attribut data-theme
        document.documentElement.setAttribute('data-theme', themeName);
        
        // Appliquer les couleurs personnalisées si nécessaire
        this.applyCustomColors(theme.colors);
        
        // Mettre à jour les meta tags pour les navigateurs mobiles
        this.updateMetaThemeColor(theme.colors.primary);
        
        // Supprimer la transition après application
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, CONFIG.THEME.TRANSITION_DURATION);
    }

    /**
     * Applique les couleurs personnalisées
     * @param {Object} colors - Couleurs du thème
     */
    applyCustomColors(colors) {
        const root = document.documentElement;
        
        Object.entries(colors).forEach(([property, value]) => {
            root.style.setProperty(`--theme-${property}`, value);
        });
    }

    /**
     * Met à jour la couleur du thème dans les meta tags
     * @param {string} color - Couleur principale
     */
    updateMetaThemeColor(color) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        metaThemeColor.content = color;
    }

    /**
     * Bascule entre les thèmes
     */
    toggleTheme() {
        const currentIndex = Array.from(this.themes.keys()).indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.size;
        const nextTheme = Array.from(this.themes.keys())[nextIndex];
        
        this.setTheme(nextTheme);
    }

    /**
     * Met à jour le bouton de basculement
     */
    updateThemeToggle() {
        const themeToggle = DOM.$(SELECTORS.THEME_TOGGLE);
        if (!themeToggle) return;

        const theme = this.themes.get(this.currentTheme);
        if (!theme) return;

        // Mettre à jour l'icône
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme.icon;
        }

        // Mettre à jour le titre
        themeToggle.title = `Switch to ${this.getNextTheme().name} mode`;
        themeToggle.setAttribute('aria-label', `Switch to ${this.getNextTheme().name} mode`);

        // Animation de rotation
        themeToggle.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            themeToggle.style.transform = '';
        }, CONFIG.THEME.TRANSITION_DURATION);
    }

    /**
     * Obtient le prochain thème dans la rotation
     * @returns {Object} Prochain thème
     */
    getNextTheme() {
        const currentIndex = Array.from(this.themes.keys()).indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.size;
        const nextThemeKey = Array.from(this.themes.keys())[nextIndex];
        return this.themes.get(nextThemeKey);
    }

    /**
     * Obtient le thème actuel
     * @returns {string} Nom du thème actuel
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Obtient les informations du thème actuel
     * @returns {Object} Informations du thème
     */
    getCurrentThemeInfo() {
        return this.themes.get(this.currentTheme);
    }

    /**
     * Ajoute un nouveau thème
     * @param {string} name - Nom du thème
     * @param {Object} config - Configuration du thème
     */
    addTheme(name, config) {
        this.themes.set(name, config);
        logger.info(`Theme added: ${name}`);
    }

    /**
     * Supprime un thème
     * @param {string} name - Nom du thème
     */
    removeTheme(name) {
        if (this.themes.size <= 1) {
            logger.warn('Cannot remove theme: at least one theme must remain');
            return false;
        }

        if (this.currentTheme === name) {
            // Basculer vers un autre thème avant suppression
            const firstTheme = Array.from(this.themes.keys()).find(key => key !== name);
            this.setTheme(firstTheme);
        }

        const removed = this.themes.delete(name);
        if (removed) {
            logger.info(`Theme removed: ${name}`);
        }
        
        return removed;
    }

    /**
     * Obtient la liste de tous les thèmes
     * @returns {Array} Liste des thèmes
     */
    getAvailableThemes() {
        return Array.from(this.themes.entries()).map(([key, theme]) => ({
            key,
            ...theme
        }));
    }

    /**
     * Précharge les ressources du thème
     * @param {string} themeName - Nom du thème
     */
    async preloadTheme(themeName) {
        if (!this.themes.has(themeName)) return;

        try {
            // Précharger les images ou ressources spécifiques au thème
            const theme = this.themes.get(themeName);
            
            // Exemple: précharger des images de fond
            if (theme.backgroundImage) {
                const img = new Image();
                img.src = theme.backgroundImage;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
            }

            logger.debug(`Theme preloaded: ${themeName}`);
        } catch (error) {
            logger.warn(`Failed to preload theme: ${themeName}`, error);
        }
    }

    /**
     * Applique un thème temporaire (sans sauvegarde)
     * @param {string} themeName - Nom du thème
     */
    async previewTheme(themeName) {
        if (!this.themes.has(themeName)) return;

        const originalTheme = this.currentTheme;
        await this.setTheme(themeName, false);

        // Retourner une fonction pour restaurer le thème original
        return () => {
            this.setTheme(originalTheme, false);
        };
    }

    /**
     * Exporte la configuration des thèmes
     * @returns {Object} Configuration des thèmes
     */
    exportThemes() {
        const themes = {};
        this.themes.forEach((config, name) => {
            themes[name] = config;
        });
        
        return {
            themes,
            currentTheme: this.currentTheme
        };
    }

    /**
     * Importe une configuration de thèmes
     * @param {Object} config - Configuration à importer
     */
    importThemes(config) {
        try {
            if (config.themes) {
                Object.entries(config.themes).forEach(([name, themeConfig]) => {
                    this.addTheme(name, themeConfig);
                });
            }

            if (config.currentTheme && this.themes.has(config.currentTheme)) {
                this.setTheme(config.currentTheme);
            }

            logger.info('Themes imported successfully');
        } catch (error) {
            logger.error('Failed to import themes', error);
        }
    }
}

export default ThemeManager;