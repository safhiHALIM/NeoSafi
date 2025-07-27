/**
 * Configuration globale de l'application
 * @module Config
 */

export const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'https://api.neosafi.com',
        TIMEOUT: 10000,
        RETRY_ATTEMPTS: 3
    },

    // Payment Configuration
    PAYMENT: {
        SUPPORTED_METHODS: ['credit-card', 'paypal', 'bank-transfer'],
        CURRENCY: 'USD',
        PROCESSING_DELAY: 2000,
        VALIDATION_DELAY: 300
    },

    // UI Configuration
    UI: {
        ANIMATION_DURATION: 300,
        NOTIFICATION_DURATION: 5000,
        MODAL_FADE_DURATION: 150,
        SCROLL_OFFSET: 80
    },

    // Theme Configuration
    THEME: {
        DEFAULT: 'light',
        STORAGE_KEY: 'neosafi-theme',
        TRANSITION_DURATION: 300
    },

    // Form Configuration
    FORM: {
        VALIDATION_DELAY: 500,
        AUTO_SAVE_DELAY: 1000,
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_FILE_TYPES: ['jpg', 'jpeg', 'png', 'pdf']
    },

    // Performance Configuration
    PERFORMANCE: {
        LAZY_LOAD_OFFSET: 100,
        DEBOUNCE_DELAY: 250,
        THROTTLE_DELAY: 100,
        CACHE_DURATION: 300000 // 5 minutes
    },

    // Debug Configuration
    DEBUG: {
        ENABLED: true,
        LOG_LEVEL: 'info', // 'error', 'warn', 'info', 'debug'
        PERFORMANCE_MONITORING: true
    }
};

export const SELECTORS = {
    // Navigation
    NAVBAR: '#navbar-section',
    NAV_LINKS: '.nav-link',
    THEME_TOGGLE: '#themeToggle',

    // Sections
    HERO: '#hero-section',
    FEATURES: '#features-section',
    PRICING: '#pricing-section',
    PRODUCTS: '#products-section',
    CONTACT: '#contact-section',

    // Forms
    CONTACT_FORM: '#contactForm',
    PAYMENT_FORM: '#paymentForm',
    NEWSLETTER_FORM: '#newsletterForm',

    // Modals
    PAYMENT_MODAL: '#paymentModal',
    CONTACT_MODAL: '#contactModal',

    // Buttons
    BUY_BUTTONS: '.buy-btn',
    PROCESS_PAYMENT: '#processPayment',
    SUBMIT_BUTTONS: '[type="submit"]',

    // Products
    PRODUCT_CARDS: '.product-card',
    PRICE_TAGS: '.price-tag',

    // Notifications
    NOTIFICATIONS: '.alert',
    TOAST_CONTAINER: '#toast-container'
};

export const EVENTS = {
    // Custom Events
    THEME_CHANGED: 'theme:changed',
    PAYMENT_STARTED: 'payment:started',
    PAYMENT_COMPLETED: 'payment:completed',
    PAYMENT_FAILED: 'payment:failed',
    FORM_VALIDATED: 'form:validated',
    SECTION_LOADED: 'section:loaded',
    
    // DOM Events
    DOM_LOADED: 'DOMContentLoaded',
    WINDOW_LOADED: 'load',
    SCROLL: 'scroll',
    RESIZE: 'resize',
    CLICK: 'click',
    SUBMIT: 'submit',
    INPUT: 'input',
    CHANGE: 'change'
};

export const STORAGE_KEYS = {
    THEME: 'neosafi-theme',
    USER_PREFERENCES: 'neosafi-preferences',
    CART: 'neosafi-cart',
    PAYMENT_RECORDS: 'neosafi-payments',
    FORM_DATA: 'neosafi-form-data',
    ANALYTICS: 'neosafi-analytics'
};

export default CONFIG;