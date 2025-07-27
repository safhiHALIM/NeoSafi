/**
 * Système de validation avancé avec règles personnalisables
 * @module Validator
 */

import logger from './logger.js';
import { isValidEmail, isValidPhone, isValidCardNumber } from './helpers.js';

/**
 * Règles de validation prédéfinies
 */
const VALIDATION_RULES = {
    required: {
        validate: (value) => value !== null && value !== undefined && value.toString().trim() !== '',
        message: 'This field is required'
    },
    
    email: {
        validate: (value) => !value || isValidEmail(value),
        message: 'Please enter a valid email address'
    },
    
    phone: {
        validate: (value) => !value || isValidPhone(value),
        message: 'Please enter a valid phone number'
    },
    
    minLength: {
        validate: (value, param) => !value || value.toString().length >= param,
        message: (param) => `Must be at least ${param} characters long`
    },
    
    maxLength: {
        validate: (value, param) => !value || value.toString().length <= param,
        message: (param) => `Must be no more than ${param} characters long`
    },
    
    min: {
        validate: (value, param) => !value || parseFloat(value) >= param,
        message: (param) => `Must be at least ${param}`
    },
    
    max: {
        validate: (value, param) => !value || parseFloat(value) <= param,
        message: (param) => `Must be no more than ${param}`
    },
    
    pattern: {
        validate: (value, param) => !value || new RegExp(param).test(value),
        message: 'Invalid format'
    },
    
    cardNumber: {
        validate: (value) => !value || isValidCardNumber(value),
        message: 'Please enter a valid card number'
    },
    
    expiryDate: {
        validate: (value) => {
            if (!value) return true;
            const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
            if (!regex.test(value)) return false;
            
            const [month, year] = value.split('/');
            const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
            return expiry > new Date();
        },
        message: 'Please enter a valid expiry date (MM/YY)'
    },
    
    cvv: {
        validate: (value) => !value || /^\d{3,4}$/.test(value),
        message: 'Please enter a valid CVV (3-4 digits)'
    },
    
    url: {
        validate: (value) => {
            if (!value) return true;
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        },
        message: 'Please enter a valid URL'
    },
    
    numeric: {
        validate: (value) => !value || /^\d+(\.\d+)?$/.test(value),
        message: 'Please enter a valid number'
    },
    
    alpha: {
        validate: (value) => !value || /^[a-zA-Z\s]+$/.test(value),
        message: 'Only letters and spaces are allowed'
    },
    
    alphanumeric: {
        validate: (value) => !value || /^[a-zA-Z0-9\s]+$/.test(value),
        message: 'Only letters, numbers and spaces are allowed'
    },
    
    strongPassword: {
        validate: (value) => {
            if (!value) return true;
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
        },
        message: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character'
    }
};

/**
 * Classe de validation
 */
export class Validator {
    constructor() {
        this.rules = { ...VALIDATION_RULES };
        this.errors = new Map();
    }

    /**
     * Ajoute une règle personnalisée
     * @param {string} name - Nom de la règle
     * @param {Function} validate - Fonction de validation
     * @param {string|Function} message - Message d'erreur
     */
    addRule(name, validate, message) {
        this.rules[name] = { validate, message };
        logger.debug(`Custom validation rule added: ${name}`);
    }

    /**
     * Valide une valeur selon des règles
     * @param {*} value - Valeur à valider
     * @param {string|Array} rules - Règles de validation
     * @param {string} fieldName - Nom du champ (pour les messages)
     * @returns {Object} Résultat de validation
     */
    validate(value, rules, fieldName = 'Field') {
        const ruleArray = typeof rules === 'string' ? rules.split('|') : rules;
        const errors = [];

        for (const rule of ruleArray) {
            const [ruleName, param] = rule.includes(':') ? rule.split(':') : [rule, null];
            
            if (!this.rules[ruleName]) {
                logger.warn(`Unknown validation rule: ${ruleName}`);
                continue;
            }

            const ruleConfig = this.rules[ruleName];
            const isValid = ruleConfig.validate(value, param);

            if (!isValid) {
                const message = typeof ruleConfig.message === 'function' 
                    ? ruleConfig.message(param) 
                    : ruleConfig.message;
                errors.push(message);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            value
        };
    }

    /**
     * Valide un objet selon un schéma
     * @param {Object} data - Données à valider
     * @param {Object} schema - Schéma de validation
     * @returns {Object} Résultat de validation
     */
    validateObject(data, schema) {
        const results = {};
        const allErrors = {};
        let isValid = true;

        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            const result = this.validate(value, rules, field);
            
            results[field] = result;
            
            if (!result.isValid) {
                allErrors[field] = result.errors;
                isValid = false;
            }
        }

        return {
            isValid,
            errors: allErrors,
            results,
            data
        };
    }

    /**
     * Valide un formulaire DOM
     * @param {HTMLFormElement} form - Formulaire à valider
     * @param {Object} schema - Schéma de validation
     * @returns {Object} Résultat de validation
     */
    validateForm(form, schema = null) {
        const formData = new FormData(form);
        const data = {};
        
        // Convertir FormData en objet
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Si pas de schéma fourni, utiliser les attributs HTML
        const validationSchema = schema || this.extractSchemaFromForm(form);
        
        const result = this.validateObject(data, validationSchema);
        
        // Appliquer les styles visuels
        this.applyFormValidation(form, result);
        
        return result;
    }

    /**
     * Extrait un schéma de validation depuis les attributs HTML
     * @param {HTMLFormElement} form - Formulaire
     * @returns {Object} Schéma de validation
     */
    extractSchemaFromForm(form) {
        const schema = {};
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            const rules = [];
            
            if (input.required) rules.push('required');
            if (input.type === 'email') rules.push('email');
            if (input.type === 'tel') rules.push('phone');
            if (input.type === 'url') rules.push('url');
            if (input.type === 'number') rules.push('numeric');
            if (input.minLength) rules.push(`minLength:${input.minLength}`);
            if (input.maxLength) rules.push(`maxLength:${input.maxLength}`);
            if (input.min) rules.push(`min:${input.min}`);
            if (input.max) rules.push(`max:${input.max}`);
            if (input.pattern) rules.push(`pattern:${input.pattern}`);
            
            // Règles personnalisées via data attributes
            if (input.dataset.validation) {
                rules.push(...input.dataset.validation.split('|'));
            }

            if (rules.length > 0) {
                schema[input.name || input.id] = rules;
            }
        });

        return schema;
    }

    /**
     * Applique la validation visuelle au formulaire
     * @param {HTMLFormElement} form - Formulaire
     * @param {Object} result - Résultat de validation
     */
    applyFormValidation(form, result) {
        // Nettoyer les erreurs précédentes
        form.querySelectorAll('.is-invalid, .is-valid').forEach(el => {
            el.classList.remove('is-invalid', 'is-valid');
        });
        
        form.querySelectorAll('.invalid-feedback, .valid-feedback').forEach(el => {
            el.remove();
        });

        // Appliquer les nouveaux états
        for (const [field, fieldResult] of Object.entries(result.results)) {
            const input = form.querySelector(`[name="${field}"], #${field}`);
            if (!input) continue;

            if (fieldResult.isValid) {
                input.classList.add('is-valid');
                this.addFeedback(input, 'Looks good!', 'valid-feedback');
            } else {
                input.classList.add('is-invalid');
                const errorMessage = fieldResult.errors[0]; // Premier message d'erreur
                this.addFeedback(input, errorMessage, 'invalid-feedback');
            }
        }
    }

    /**
     * Ajoute un message de feedback à un champ
     * @param {HTMLElement} input - Champ de saisie
     * @param {string} message - Message
     * @param {string} className - Classe CSS
     */
    addFeedback(input, message, className) {
        const feedback = document.createElement('div');
        feedback.className = className;
        feedback.textContent = message;
        
        // Insérer après l'input ou son parent le plus proche
        const parent = input.parentNode;
        parent.insertBefore(feedback, input.nextSibling);
    }

    /**
     * Validation en temps réel
     * @param {HTMLFormElement} form - Formulaire
     * @param {Object} schema - Schéma de validation
     * @param {Object} options - Options
     */
    enableRealTimeValidation(form, schema = null, options = {}) {
        const defaultOptions = {
            validateOnInput: true,
            validateOnBlur: true,
            debounceDelay: 300
        };
        
        const config = { ...defaultOptions, ...options };
        const validationSchema = schema || this.extractSchemaFromForm(form);

        const validateField = (input) => {
            const fieldName = input.name || input.id;
            const rules = validationSchema[fieldName];
            
            if (!rules) return;

            const result = this.validate(input.value, rules, fieldName);
            
            // Nettoyer les états précédents
            input.classList.remove('is-invalid', 'is-valid');
            const existingFeedback = input.parentNode.querySelector('.invalid-feedback, .valid-feedback');
            if (existingFeedback) {
                existingFeedback.remove();
            }

            // Appliquer le nouvel état
            if (result.isValid) {
                input.classList.add('is-valid');
                this.addFeedback(input, 'Looks good!', 'valid-feedback');
            } else {
                input.classList.add('is-invalid');
                this.addFeedback(input, result.errors[0], 'invalid-feedback');
            }
        };

        // Debounce pour la validation sur input
        let debounceTimer;
        const debouncedValidate = (input) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => validateField(input), config.debounceDelay);
        };

        // Attacher les événements
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (config.validateOnInput) {
                input.addEventListener('input', () => debouncedValidate(input));
            }
            
            if (config.validateOnBlur) {
                input.addEventListener('blur', () => validateField(input));
            }
        });

        logger.debug('Real-time validation enabled for form', form.id || form.className);
    }

    /**
     * Nettoie toutes les erreurs de validation
     * @param {HTMLFormElement} form - Formulaire
     */
    clearValidation(form) {
        form.querySelectorAll('.is-invalid, .is-valid').forEach(el => {
            el.classList.remove('is-invalid', 'is-valid');
        });
        
        form.querySelectorAll('.invalid-feedback, .valid-feedback').forEach(el => {
            el.remove();
        });
    }
}

// Instance singleton
const validator = new Validator();

export default validator;