/**
 * Système de logging avancé avec niveaux et formatage
 * @module Logger
 */

import { CONFIG } from './config.js';

class Logger {
    constructor() {
        this.levels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3
        };
        
        this.currentLevel = this.levels[CONFIG.DEBUG.LOG_LEVEL.toUpperCase()] || this.levels.INFO;
        this.enabled = CONFIG.DEBUG.ENABLED;
        this.performanceMonitoring = CONFIG.DEBUG.PERFORMANCE_MONITORING;
        
        this.colors = {
            ERROR: '#ff4444',
            WARN: '#ffaa00',
            INFO: '#0088ff',
            DEBUG: '#888888'
        };
        
        this.emojis = {
            ERROR: '❌',
            WARN: '⚠️',
            INFO: 'ℹ️',
            DEBUG: '🔍'
        };
    }

    /**
     * Log d'erreur
     * @param {string} message - Message d'erreur
     * @param {*} data - Données additionnelles
     */
    error(message, data = null) {
        this._log('ERROR', message, data);
    }

    /**
     * Log d'avertissement
     * @param {string} message - Message d'avertissement
     * @param {*} data - Données additionnelles
     */
    warn(message, data = null) {
        this._log('WARN', message, data);
    }

    /**
     * Log d'information
     * @param {string} message - Message d'information
     * @param {*} data - Données additionnelles
     */
    info(message, data = null) {
        this._log('INFO', message, data);
    }

    /**
     * Log de debug
     * @param {string} message - Message de debug
     * @param {*} data - Données additionnelles
     */
    debug(message, data = null) {
        this._log('DEBUG', message, data);
    }

    /**
     * Mesure de performance
     * @param {string} label - Label de la mesure
     * @param {Function} fn - Fonction à mesurer
     * @returns {*} Résultat de la fonction
     */
    async performance(label, fn) {
        if (!this.performanceMonitoring) {
            return await fn();
        }

        const start = performance.now();
        this.debug(`⏱️ Starting: ${label}`);
        
        try {
            const result = await fn();
            const end = performance.now();
            const duration = (end - start).toFixed(2);
            
            this.info(`⚡ ${label} completed in ${duration}ms`);
            return result;
        } catch (error) {
            const end = performance.now();
            const duration = (end - start).toFixed(2);
            
            this.error(`💥 ${label} failed after ${duration}ms`, error);
            throw error;
        }
    }

    /**
     * Groupe de logs
     * @param {string} label - Label du groupe
     * @param {Function} fn - Fonction contenant les logs
     */
    group(label, fn) {
        if (!this.enabled) return;
        
        console.group(`📁 ${label}`);
        try {
            fn();
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Table de données
     * @param {Array|Object} data - Données à afficher
     * @param {string} label - Label optionnel
     */
    table(data, label = null) {
        if (!this.enabled) return;
        
        if (label) {
            this.info(`📊 ${label}`);
        }
        console.table(data);
    }

    /**
     * Trace de la pile d'appels
     * @param {string} message - Message optionnel
     */
    trace(message = 'Stack trace') {
        if (!this.enabled) return;
        
        console.trace(`🔍 ${message}`);
    }

    /**
     * Log conditionnel
     * @param {boolean} condition - Condition
     * @param {string} level - Niveau de log
     * @param {string} message - Message
     * @param {*} data - Données
     */
    assert(condition, level, message, data = null) {
        if (!condition) {
            this._log(level.toUpperCase(), `Assertion failed: ${message}`, data);
        }
    }

    /**
     * Méthode privée de logging
     * @private
     */
    _log(level, message, data) {
        if (!this.enabled || this.levels[level] > this.currentLevel) {
            return;
        }

        const timestamp = new Date().toISOString();
        const emoji = this.emojis[level];
        const color = this.colors[level];
        
        const formattedMessage = `${emoji} [${timestamp}] ${message}`;
        
        const style = `color: ${color}; font-weight: bold;`;
        
        switch (level) {
            case 'ERROR':
                console.error(`%c${formattedMessage}`, style, data || '');
                break;
            case 'WARN':
                console.warn(`%c${formattedMessage}`, style, data || '');
                break;
            case 'INFO':
                console.info(`%c${formattedMessage}`, style, data || '');
                break;
            case 'DEBUG':
                console.debug(`%c${formattedMessage}`, style, data || '');
                break;
        }
    }

    /**
     * Active/désactive le logging
     * @param {boolean} enabled - État du logging
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        this.info(`Logging ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Change le niveau de log
     * @param {string} level - Nouveau niveau
     */
    setLevel(level) {
        const upperLevel = level.toUpperCase();
        if (this.levels[upperLevel] !== undefined) {
            this.currentLevel = this.levels[upperLevel];
            this.info(`Log level set to: ${upperLevel}`);
        } else {
            this.warn(`Invalid log level: ${level}`);
        }
    }
}

// Instance singleton
const logger = new Logger();

export default logger;
export { Logger };