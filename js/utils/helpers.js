/**
 * Fonctions utilitaires générales
 * @module Helpers
 */

import { CONFIG } from './config.js';
import logger from './logger.js';

/**
 * Debounce une fonction
 * @param {Function} func - Fonction à debouncer
 * @param {number} wait - Délai d'attente
 * @param {boolean} immediate - Exécution immédiate
 * @returns {Function}
 */
export function debounce(func, wait = CONFIG.PERFORMANCE.DEBOUNCE_DELAY, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

/**
 * Throttle une fonction
 * @param {Function} func - Fonction à throttler
 * @param {number} limit - Limite de temps
 * @returns {Function}
 */
export function throttle(func, limit = CONFIG.PERFORMANCE.THROTTLE_DELAY) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Attend un délai
 * @param {number} ms - Délai en millisecondes
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Génère un ID unique
 * @param {string} prefix - Préfixe optionnel
 * @returns {string}
 */
export function generateId(prefix = '') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}${prefix ? '-' : ''}${timestamp}-${random}`;
}

/**
 * Formate un prix
 * @param {number} amount - Montant
 * @param {string} currency - Devise
 * @param {string} locale - Locale
 * @returns {string}
 */
export function formatPrice(amount, currency = CONFIG.PAYMENT.CURRENCY, locale = 'en-US') {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    } catch (error) {
        logger.warn('Price formatting failed, using fallback', error);
        return `${currency} ${amount.toFixed(2)}`;
    }
}

/**
 * Formate une date
 * @param {Date|string} date - Date à formater
 * @param {Object} options - Options de formatage
 * @returns {string}
 */
export function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
    } catch (error) {
        logger.warn('Date formatting failed', error);
        return date.toString();
    }
}

/**
 * Valide un email
 * @param {string} email - Email à valider
 * @returns {boolean}
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valide un numéro de téléphone
 * @param {string} phone - Numéro à valider
 * @returns {boolean}
 */
export function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Valide un numéro de carte de crédit
 * @param {string} cardNumber - Numéro de carte
 * @returns {boolean}
 */
export function isValidCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    const cardRegex = /^\d{13,19}$/;
    
    if (!cardRegex.test(cleaned)) {
        return false;
    }

    // Algorithme de Luhn
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned.charAt(i), 10);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

/**
 * Sanitise une chaîne HTML
 * @param {string} str - Chaîne à sanitiser
 * @returns {string}
 */
export function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Échappe les caractères spéciaux pour regex
 * @param {string} str - Chaîne à échapper
 * @returns {string}
 */
export function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Capitalise la première lettre
 * @param {string} str - Chaîne à capitaliser
 * @returns {string}
 */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convertit en camelCase
 * @param {string} str - Chaîne à convertir
 * @returns {string}
 */
export function toCamelCase(str) {
    return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
}

/**
 * Convertit en kebab-case
 * @param {string} str - Chaîne à convertir
 * @returns {string}
 */
export function toKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Tronque une chaîne
 * @param {string} str - Chaîne à tronquer
 * @param {number} length - Longueur maximale
 * @param {string} suffix - Suffixe
 * @returns {string}
 */
export function truncate(str, length = 100, suffix = '...') {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
}

/**
 * Clone profond d'un objet
 * @param {*} obj - Objet à cloner
 * @returns {*}
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone(obj[key]);
        });
        return cloned;
    }
}

/**
 * Fusionne des objets profondément
 * @param {Object} target - Objet cible
 * @param {...Object} sources - Objets sources
 * @returns {Object}
 */
export function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return deepMerge(target, ...sources);
}

/**
 * Vérifie si une valeur est un objet
 * @param {*} item - Valeur à vérifier
 * @returns {boolean}
 */
export function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Vérifie si une valeur est vide
 * @param {*} value - Valeur à vérifier
 * @returns {boolean}
 */
export function isEmpty(value) {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * Retry une fonction avec backoff exponentiel
 * @param {Function} fn - Fonction à retry
 * @param {number} maxAttempts - Nombre max de tentatives
 * @param {number} baseDelay - Délai de base
 * @returns {Promise<*>}
 */
export async function retry(fn, maxAttempts = CONFIG.API.RETRY_ATTEMPTS, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxAttempts) {
                throw error;
            }
            
            const delay = baseDelay * Math.pow(2, attempt - 1);
            logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, error);
            await sleep(delay);
        }
    }
    
    throw lastError;
}

/**
 * Cache simple avec TTL
 */
export class SimpleCache {
    constructor(ttl = CONFIG.PERFORMANCE.CACHE_DURATION) {
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, value) {
        const expiry = Date.now() + this.ttl;
        this.cache.set(key, { value, expiry });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    has(key) {
        return this.get(key) !== null;
    }

    delete(key) {
        return this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    size() {
        return this.cache.size;
    }
}

/**
 * Gestionnaire d'événements personnalisés
 */
export class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    off(event, callback) {
        if (!this.events[event]) return;
        
        const index = this.events[event].indexOf(callback);
        if (index > -1) {
            this.events[event].splice(index, 1);
        }
    }

    emit(event, ...args) {
        if (!this.events[event]) return;
        
        this.events[event].forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                logger.error(`Error in event handler for ${event}`, error);
            }
        });
    }

    once(event, callback) {
        const onceCallback = (...args) => {
            callback(...args);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }
}