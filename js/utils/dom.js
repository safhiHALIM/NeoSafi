/**
 * Utilitaires pour la manipulation du DOM
 * @module DOMUtils
 */

import logger from './logger.js';
import { CONFIG } from './config.js';

/**
 * Sélecteur d'éléments avec cache
 */
class DOMSelector {
    constructor() {
        this.cache = new Map();
        this.cacheEnabled = true;
    }

    /**
     * Sélectionne un élément avec cache
     * @param {string} selector - Sélecteur CSS
     * @param {Element} context - Contexte de recherche
     * @returns {Element|null}
     */
    $(selector, context = document) {
        const key = `${selector}:${context === document ? 'document' : context.id || 'element'}`;
        
        if (this.cacheEnabled && this.cache.has(key)) {
            const cached = this.cache.get(key);
            if (cached && cached.isConnected) {
                return cached;
            }
            this.cache.delete(key);
        }

        const element = context.querySelector(selector);
        if (element && this.cacheEnabled) {
            this.cache.set(key, element);
        }
        
        return element;
    }

    /**
     * Sélectionne tous les éléments
     * @param {string} selector - Sélecteur CSS
     * @param {Element} context - Contexte de recherche
     * @returns {NodeList}
     */
    $$(selector, context = document) {
        return context.querySelectorAll(selector);
    }

    /**
     * Vide le cache
     */
    clearCache() {
        this.cache.clear();
        logger.debug('DOM cache cleared');
    }

    /**
     * Active/désactive le cache
     * @param {boolean} enabled - État du cache
     */
    setCacheEnabled(enabled) {
        this.cacheEnabled = enabled;
        if (!enabled) {
            this.clearCache();
        }
    }
}

const selector = new DOMSelector();

/**
 * Utilitaires DOM
 */
export const DOM = {
    // Sélecteurs
    $: selector.$.bind(selector),
    $$: selector.$$.bind(selector),
    clearCache: selector.clearCache.bind(selector),

    /**
     * Attend qu'un élément soit disponible
     * @param {string} selector - Sélecteur CSS
     * @param {number} timeout - Timeout en ms
     * @returns {Promise<Element>}
     */
    waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = this.$(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = this.$(selector);
                if (element) {
                    observer.disconnect();
                    clearTimeout(timeoutId);
                    resolve(element);
                }
            });

            const timeoutId = setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    },

    /**
     * Vérifie si un élément est visible
     * @param {Element} element - Élément à vérifier
     * @returns {boolean}
     */
    isVisible(element) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && 
               rect.top >= 0 && rect.left >= 0 &&
               rect.bottom <= window.innerHeight && 
               rect.right <= window.innerWidth;
    },

    /**
     * Vérifie si un élément est dans le viewport
     * @param {Element} element - Élément à vérifier
     * @param {number} offset - Offset en pixels
     * @returns {boolean}
     */
    isInViewport(element, offset = 0) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return rect.top < (window.innerHeight + offset) && 
               rect.bottom > -offset;
    },

    /**
     * Scroll fluide vers un élément
     * @param {Element|string} target - Élément ou sélecteur
     * @param {Object} options - Options de scroll
     */
    scrollTo(target, options = {}) {
        const element = typeof target === 'string' ? this.$(target) : target;
        if (!element) {
            logger.warn('ScrollTo: Element not found', target);
            return;
        }

        const defaultOptions = {
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
            offset: CONFIG.UI.SCROLL_OFFSET
        };

        const finalOptions = { ...defaultOptions, ...options };
        const elementTop = element.offsetTop - finalOptions.offset;

        window.scrollTo({
            top: elementTop,
            behavior: finalOptions.behavior
        });
    },

    /**
     * Ajoute une classe avec animation
     * @param {Element} element - Élément
     * @param {string} className - Classe à ajouter
     * @param {number} duration - Durée de l'animation
     */
    addClass(element, className, duration = CONFIG.UI.ANIMATION_DURATION) {
        if (!element) return;
        
        element.classList.add(className);
        
        if (duration > 0) {
            setTimeout(() => {
                element.style.transition = `all ${duration}ms ease`;
            }, 10);
        }
    },

    /**
     * Supprime une classe avec animation
     * @param {Element} element - Élément
     * @param {string} className - Classe à supprimer
     * @param {number} duration - Durée de l'animation
     */
    removeClass(element, className, duration = CONFIG.UI.ANIMATION_DURATION) {
        if (!element) return;
        
        if (duration > 0) {
            element.style.transition = `all ${duration}ms ease`;
            setTimeout(() => {
                element.classList.remove(className);
            }, duration);
        } else {
            element.classList.remove(className);
        }
    },

    /**
     * Toggle une classe
     * @param {Element} element - Élément
     * @param {string} className - Classe à toggle
     * @returns {boolean} État final de la classe
     */
    toggleClass(element, className) {
        if (!element) return false;
        return element.classList.toggle(className);
    },

    /**
     * Crée un élément avec attributs et contenu
     * @param {string} tag - Tag HTML
     * @param {Object} attributes - Attributs
     * @param {string|Element} content - Contenu
     * @returns {Element}
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });

        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (content instanceof Element) {
            element.appendChild(content);
        }

        return element;
    },

    /**
     * Supprime un élément avec animation
     * @param {Element} element - Élément à supprimer
     * @param {number} duration - Durée de l'animation
     */
    removeElement(element, duration = CONFIG.UI.ANIMATION_DURATION) {
        if (!element) return;
        
        if (duration > 0) {
            element.style.transition = `opacity ${duration}ms ease`;
            element.style.opacity = '0';
            
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, duration);
        } else {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }
    },

    /**
     * Délégation d'événements
     * @param {Element} parent - Élément parent
     * @param {string} selector - Sélecteur des enfants
     * @param {string} event - Type d'événement
     * @param {Function} handler - Gestionnaire d'événement
     */
    delegate(parent, selector, event, handler) {
        parent.addEventListener(event, (e) => {
            const target = e.target.closest(selector);
            if (target) {
                handler.call(target, e);
            }
        });
    },

    /**
     * Charge du contenu HTML de manière asynchrone
     * @param {string} url - URL du contenu
     * @param {Element} container - Conteneur de destination
     * @returns {Promise<void>}
     */
    async loadHTML(url, container) {
        try {
            logger.debug(`Loading HTML from: ${url}`);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            container.innerHTML = html;
            
            logger.debug(`HTML loaded successfully: ${url}`);
        } catch (error) {
            logger.error(`Failed to load HTML: ${url}`, error);
            throw error;
        }
    },

    /**
     * Observe les changements d'un élément
     * @param {Element} element - Élément à observer
     * @param {Function} callback - Callback des changements
     * @param {Object} options - Options du MutationObserver
     * @returns {MutationObserver}
     */
    observe(element, callback, options = {}) {
        const defaultOptions = {
            childList: true,
            attributes: true,
            subtree: true
        };

        const observer = new MutationObserver(callback);
        observer.observe(element, { ...defaultOptions, ...options });
        
        return observer;
    }
};

export default DOM;