/**
 * Gestionnaire de stockage local avec sérialisation et validation
 * @module Storage
 */

import logger from './logger.js';
import { STORAGE_KEYS } from './config.js';

/**
 * Gestionnaire de stockage local avancé
 */
class StorageManager {
    constructor() {
        this.isAvailable = this.checkAvailability();
        this.prefix = 'neosafi_';
    }

    /**
     * Vérifie la disponibilité du localStorage
     * @returns {boolean}
     */
    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            logger.warn('localStorage not available', error);
            return false;
        }
    }

    /**
     * Génère une clé avec préfixe
     * @param {string} key - Clé originale
     * @returns {string}
     */
    getKey(key) {
        return `${this.prefix}${key}`;
    }

    /**
     * Stocke une valeur
     * @param {string} key - Clé
     * @param {*} value - Valeur
     * @param {number} ttl - Time to live en ms
     * @returns {boolean}
     */
    set(key, value, ttl = null) {
        if (!this.isAvailable) {
            logger.warn('Storage not available, using memory fallback');
            return this.setMemory(key, value, ttl);
        }

        try {
            const data = {
                value,
                timestamp: Date.now(),
                ttl: ttl ? Date.now() + ttl : null
            };

            localStorage.setItem(this.getKey(key), JSON.stringify(data));
            logger.debug(`Stored: ${key}`, { size: JSON.stringify(data).length });
            return true;
        } catch (error) {
            logger.error(`Failed to store: ${key}`, error);
            return false;
        }
    }

    /**
     * Récupère une valeur
     * @param {string} key - Clé
     * @param {*} defaultValue - Valeur par défaut
     * @returns {*}
     */
    get(key, defaultValue = null) {
        if (!this.isAvailable) {
            return this.getMemory(key, defaultValue);
        }

        try {
            const stored = localStorage.getItem(this.getKey(key));
            if (!stored) return defaultValue;

            const data = JSON.parse(stored);
            
            // Vérifier l'expiration
            if (data.ttl && Date.now() > data.ttl) {
                this.remove(key);
                logger.debug(`Expired item removed: ${key}`);
                return defaultValue;
            }

            return data.value;
        } catch (error) {
            logger.error(`Failed to retrieve: ${key}`, error);
            return defaultValue;
        }
    }

    /**
     * Vérifie l'existence d'une clé
     * @param {string} key - Clé
     * @returns {boolean}
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Supprime une valeur
     * @param {string} key - Clé
     * @returns {boolean}
     */
    remove(key) {
        if (!this.isAvailable) {
            return this.removeMemory(key);
        }

        try {
            localStorage.removeItem(this.getKey(key));
            logger.debug(`Removed: ${key}`);
            return true;
        } catch (error) {
            logger.error(`Failed to remove: ${key}`, error);
            return false;
        }
    }

    /**
     * Vide tout le stockage avec le préfixe
     * @returns {boolean}
     */
    clear() {
        if (!this.isAvailable) {
            this.memoryStorage = {};
            return true;
        }

        try {
            const keys = Object.keys(localStorage);
            const prefixedKeys = keys.filter(key => key.startsWith(this.prefix));
            
            prefixedKeys.forEach(key => {
                localStorage.removeItem(key);
            });

            logger.info(`Cleared ${prefixedKeys.length} items from storage`);
            return true;
        } catch (error) {
            logger.error('Failed to clear storage', error);
            return false;
        }
    }

    /**
     * Récupère toutes les clés avec le préfixe
     * @returns {string[]}
     */
    keys() {
        if (!this.isAvailable) {
            return Object.keys(this.memoryStorage || {});
        }

        try {
            const keys = Object.keys(localStorage);
            return keys
                .filter(key => key.startsWith(this.prefix))
                .map(key => key.replace(this.prefix, ''));
        } catch (error) {
            logger.error('Failed to get keys', error);
            return [];
        }
    }

    /**
     * Récupère la taille du stockage
     * @returns {number}
     */
    size() {
        return this.keys().length;
    }

    /**
     * Récupère des statistiques du stockage
     * @returns {Object}
     */
    getStats() {
        const keys = this.keys();
        let totalSize = 0;
        let expiredCount = 0;

        keys.forEach(key => {
            try {
                const stored = localStorage.getItem(this.getKey(key));
                if (stored) {
                    totalSize += stored.length;
                    const data = JSON.parse(stored);
                    if (data.ttl && Date.now() > data.ttl) {
                        expiredCount++;
                    }
                }
            } catch (error) {
                // Ignore errors for stats
            }
        });

        return {
            totalItems: keys.length,
            totalSize,
            expiredItems: expiredCount,
            available: this.isAvailable
        };
    }

    /**
     * Nettoie les éléments expirés
     * @returns {number} Nombre d'éléments supprimés
     */
    cleanup() {
        const keys = this.keys();
        let removedCount = 0;

        keys.forEach(key => {
            const value = this.get(key);
            if (value === null) {
                removedCount++;
            }
        });

        if (removedCount > 0) {
            logger.info(`Cleaned up ${removedCount} expired items`);
        }

        return removedCount;
    }

    // Fallback en mémoire si localStorage n'est pas disponible
    memoryStorage = {};

    setMemory(key, value, ttl) {
        this.memoryStorage[key] = {
            value,
            timestamp: Date.now(),
            ttl: ttl ? Date.now() + ttl : null
        };
        return true;
    }

    getMemory(key, defaultValue) {
        const data = this.memoryStorage[key];
        if (!data) return defaultValue;

        if (data.ttl && Date.now() > data.ttl) {
            delete this.memoryStorage[key];
            return defaultValue;
        }

        return data.value;
    }

    removeMemory(key) {
        delete this.memoryStorage[key];
        return true;
    }
}

// Instance singleton
const storage = new StorageManager();

/**
 * API simplifiée pour les types de données spécifiques
 */
export const Storage = {
    // API générale
    set: storage.set.bind(storage),
    get: storage.get.bind(storage),
    has: storage.has.bind(storage),
    remove: storage.remove.bind(storage),
    clear: storage.clear.bind(storage),
    keys: storage.keys.bind(storage),
    size: storage.size.bind(storage),
    getStats: storage.getStats.bind(storage),
    cleanup: storage.cleanup.bind(storage),

    // API spécialisée pour les thèmes
    theme: {
        get: () => storage.get(STORAGE_KEYS.THEME, 'light'),
        set: (theme) => storage.set(STORAGE_KEYS.THEME, theme),
        remove: () => storage.remove(STORAGE_KEYS.THEME)
    },

    // API spécialisée pour les préférences utilisateur
    preferences: {
        get: (key, defaultValue = null) => {
            const prefs = storage.get(STORAGE_KEYS.USER_PREFERENCES, {});
            return prefs[key] !== undefined ? prefs[key] : defaultValue;
        },
        set: (key, value) => {
            const prefs = storage.get(STORAGE_KEYS.USER_PREFERENCES, {});
            prefs[key] = value;
            return storage.set(STORAGE_KEYS.USER_PREFERENCES, prefs);
        },
        getAll: () => storage.get(STORAGE_KEYS.USER_PREFERENCES, {}),
        setAll: (preferences) => storage.set(STORAGE_KEYS.USER_PREFERENCES, preferences),
        remove: (key) => {
            const prefs = storage.get(STORAGE_KEYS.USER_PREFERENCES, {});
            delete prefs[key];
            return storage.set(STORAGE_KEYS.USER_PREFERENCES, prefs);
        },
        clear: () => storage.remove(STORAGE_KEYS.USER_PREFERENCES)
    },

    // API spécialisée pour le panier
    cart: {
        get: () => storage.get(STORAGE_KEYS.CART, []),
        set: (items) => storage.set(STORAGE_KEYS.CART, items),
        add: (item) => {
            const cart = Storage.cart.get();
            cart.push(item);
            return Storage.cart.set(cart);
        },
        remove: (itemId) => {
            const cart = Storage.cart.get();
            const filtered = cart.filter(item => item.id !== itemId);
            return Storage.cart.set(filtered);
        },
        clear: () => storage.remove(STORAGE_KEYS.CART),
        count: () => Storage.cart.get().length
    },

    // API spécialisée pour les enregistrements de paiement
    payments: {
        get: () => storage.get(STORAGE_KEYS.PAYMENT_RECORDS, []),
        add: (payment) => {
            const payments = Storage.payments.get();
            payments.push(payment);
            return storage.set(STORAGE_KEYS.PAYMENT_RECORDS, payments);
        },
        getById: (orderId) => {
            const payments = Storage.payments.get();
            return payments.find(p => p.orderId === orderId);
        },
        clear: () => storage.remove(STORAGE_KEYS.PAYMENT_RECORDS)
    },

    // API spécialisée pour les données de formulaire
    forms: {
        save: (formId, data) => {
            const forms = storage.get(STORAGE_KEYS.FORM_DATA, {});
            forms[formId] = {
                data,
                timestamp: Date.now()
            };
            return storage.set(STORAGE_KEYS.FORM_DATA, forms);
        },
        load: (formId) => {
            const forms = storage.get(STORAGE_KEYS.FORM_DATA, {});
            return forms[formId]?.data || {};
        },
        remove: (formId) => {
            const forms = storage.get(STORAGE_KEYS.FORM_DATA, {});
            delete forms[formId];
            return storage.set(STORAGE_KEYS.FORM_DATA, forms);
        },
        clear: () => storage.remove(STORAGE_KEYS.FORM_DATA)
    }
};

export default Storage;