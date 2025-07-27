/**
 * Module de gestion des paiements
 * @module PaymentModule
 */

import logger from '../utils/logger.js';
import DOM from '../utils/dom.js';
import Storage from '../utils/storage.js';
import validator from '../utils/validator.js';
import { CONFIG, SELECTORS, EVENTS } from '../utils/config.js';
import { generateId, sleep, EventEmitter } from '../utils/helpers.js';

/**
 * Gestionnaire de paiements
 */
export class PaymentProcessor extends EventEmitter {
    constructor() {
        super();
        this.currentOrder = null;
        this.isProcessing = false;
        this.paymentMethods = new Map([
            ['credit-card', this.processCreditCard.bind(this)],
            ['paypal', this.processPayPal.bind(this)],
            ['bank-transfer', this.processBankTransfer.bind(this)]
        ]);
        
        this.validationSchema = {
            firstName: ['required', 'minLength:2', 'alpha'],
            lastName: ['required', 'minLength:2', 'alpha'],
            email: ['required', 'email'],
            phone: ['phone'],
            cardNumber: ['cardNumber'],
            expiryDate: ['expiryDate'],
            cvv: ['cvv'],
            cardName: ['required', 'alpha']
        };

        this.init();
    }

    /**
     * Initialise le processeur de paiement
     */
    async init() {
        try {
            await this.bindEvents();
            this.setupFormValidation();
            this.setupPaymentMethodToggle();
            
            logger.info('Payment processor initialized successfully');
            this.emit(EVENTS.PAYMENT_STARTED, { processor: this });
        } catch (error) {
            logger.error('Failed to initialize payment processor', error);
        }
    }

    /**
     * Attache les événements
     */
    async bindEvents() {
        // Délégation d'événements pour les boutons d'achat
        DOM.delegate(document, SELECTORS.BUY_BUTTONS, 'click', (e) => {
            e.preventDefault();
            this.handlePurchase(e.target);
        });

        // Gestionnaire pour le bouton de traitement
        DOM.delegate(document, SELECTORS.PROCESS_PAYMENT, 'click', (e) => {
            e.preventDefault();
            this.processPayment();
        });

        // Gestionnaire pour la soumission du formulaire
        DOM.delegate(document, SELECTORS.PAYMENT_FORM, 'submit', (e) => {
            e.preventDefault();
            this.processPayment();
        });

        // Changement de méthode de paiement
        document.addEventListener('change', (e) => {
            if (e.target.name === 'paymentMethod') {
                this.togglePaymentDetails(e.target.value);
            }
        });

        // Nettoyage à la fermeture du modal
        const modal = DOM.$(SELECTORS.PAYMENT_MODAL);
        if (modal) {
            modal.addEventListener('hidden.bs.modal', () => {
                this.resetForm();
            });
        }
    }

    /**
     * Gère l'achat d'un produit
     * @param {HTMLElement} button - Bouton d'achat
     */
    async handlePurchase(button) {
        try {
            const productData = this.extractProductData(button);
            
            this.currentOrder = {
                ...productData,
                orderId: generateId('ORDER'),
                timestamp: new Date().toISOString()
            };

            logger.info('Purchase initiated', this.currentOrder);
            
            await this.showPaymentModal();
            this.updateOrderSummary();
            
        } catch (error) {
            logger.error('Failed to handle purchase', error);
            this.showNotification('Failed to initiate purchase. Please try again.', 'error');
        }
    }

    /**
     * Extrait les données du produit depuis le bouton
     * @param {HTMLElement} button - Bouton d'achat
     * @returns {Object} Données du produit
     */
    extractProductData(button) {
        return {
            id: button.dataset.id,
            name: button.dataset.product,
            price: parseFloat(button.dataset.price) || 0
        };
    }

    /**
     * Affiche le modal de paiement
     */
    async showPaymentModal() {
        const modal = DOM.$(SELECTORS.PAYMENT_MODAL);
        if (!modal) {
            throw new Error('Payment modal not found');
        }

        // Attendre que le modal soit disponible
        await DOM.waitForElement(SELECTORS.PAYMENT_MODAL);
        
        // Appliquer le thème actuel
        this.applyThemeToModal();
        
        // Afficher le modal
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();

        // Réinitialiser après affichage
        setTimeout(() => {
            this.setupFormValidation();
            this.setupPaymentMethodToggle();
        }, 150);
    }

    /**
     * Met à jour le résumé de commande
     */
    updateOrderSummary() {
        if (!this.currentOrder) return;

        const elements = {
            name: DOM.$('#order-product-name'),
            id: DOM.$('#order-product-id'),
            total: DOM.$('#order-total'),
            reference: DOM.$('#transferReference')
        };

        if (elements.name) elements.name.textContent = this.currentOrder.name;
        if (elements.id) elements.id.textContent = this.currentOrder.id;
        if (elements.total) elements.total.textContent = `$${this.currentOrder.price}`;
        if (elements.reference) elements.reference.textContent = this.currentOrder.orderId;
    }

    /**
     * Configure la validation du formulaire
     */
    setupFormValidation() {
        const form = DOM.$(SELECTORS.PAYMENT_FORM);
        if (!form) return;

        // Validation en temps réel
        validator.enableRealTimeValidation(form, this.validationSchema, {
            validateOnInput: true,
            validateOnBlur: true,
            debounceDelay: CONFIG.FORM.VALIDATION_DELAY
        });

        // Formatage automatique des champs
        this.setupFieldFormatting();
    }

    /**
     * Configure le formatage automatique des champs
     */
    setupFieldFormatting() {
        // Formatage du numéro de carte
        const cardNumber = DOM.$('#cardNumber');
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                if (formattedValue.length > 19) {
                    formattedValue = formattedValue.substring(0, 19);
                }
                e.target.value = formattedValue;
            });
        }

        // Formatage de la date d'expiration
        const expiryDate = DOM.$('#expiryDate');
        if (expiryDate) {
            expiryDate.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        // Formatage du CVV
        const cvv = DOM.$('#cvv');
        if (cvv) {
            cvv.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 4);
            });
        }
    }

    /**
     * Configure le basculement des méthodes de paiement
     */
    setupPaymentMethodToggle() {
        // Afficher initialement les détails de carte de crédit
        this.togglePaymentDetails('credit-card');
    }

    /**
     * Bascule les détails de paiement selon la méthode
     * @param {string} method - Méthode de paiement
     */
    togglePaymentDetails(method) {
        // Masquer tous les détails
        document.querySelectorAll('.payment-details').forEach(detail => {
            detail.style.display = 'none';
        });

        // Afficher les détails de la méthode sélectionnée
        const detailsMap = {
            'credit-card': '#creditCardDetails',
            'paypal': '#paypalDetails',
            'bank-transfer': '#bankTransferDetails'
        };

        const targetSelector = detailsMap[method];
        if (targetSelector) {
            const target = DOM.$(targetSelector);
            if (target) {
                target.style.display = 'block';
            }
        }

        // Mettre à jour le texte du bouton
        this.updateProcessButtonText(method);
    }

    /**
     * Met à jour le texte du bouton de traitement
     * @param {string} method - Méthode de paiement
     */
    updateProcessButtonText(method) {
        const processBtn = DOM.$(SELECTORS.PROCESS_PAYMENT);
        if (!processBtn) return;

        const buttonTexts = {
            'credit-card': '<i class="fas fa-lock me-2"></i>Process Payment',
            'paypal': '<i class="fab fa-paypal me-2"></i>Pay with PayPal',
            'bank-transfer': '<i class="fas fa-university me-2"></i>Get Transfer Details'
        };

        processBtn.innerHTML = buttonTexts[method] || buttonTexts['credit-card'];
    }

    /**
     * Traite le paiement
     */
    async processPayment() {
        if (this.isProcessing) {
            logger.warn('Payment already in progress');
            return;
        }

        try {
            this.isProcessing = true;
            logger.info('Starting payment processing');

            // Vérifier la commande
            if (!this.currentOrder) {
                throw new Error('No order found');
            }

            // Obtenir la méthode de paiement
            const paymentMethodElement = document.querySelector('input[name="paymentMethod"]:checked');
            if (!paymentMethodElement) {
                throw new Error('No payment method selected');
            }

            const paymentMethod = paymentMethodElement.value;
            logger.info(`Processing payment via ${paymentMethod}`);

            // Valider le formulaire
            const isValid = await this.validatePaymentForm(paymentMethod);
            if (!isValid) {
                throw new Error('Form validation failed');
            }

            // Afficher l'état de chargement
            this.setLoadingState(true);

            // Traiter selon la méthode
            const processor = this.paymentMethods.get(paymentMethod);
            if (!processor) {
                throw new Error(`Unsupported payment method: ${paymentMethod}`);
            }

            await processor();
            
            logger.info('Payment processed successfully');
            this.emit(EVENTS.PAYMENT_COMPLETED, this.currentOrder);

        } catch (error) {
            logger.error('Payment processing failed', error);
            this.showNotification(error.message || 'Payment failed. Please try again.', 'error');
            this.emit(EVENTS.PAYMENT_FAILED, { error, order: this.currentOrder });
        } finally {
            this.isProcessing = false;
            this.setLoadingState(false);
        }
    }

    /**
     * Valide le formulaire de paiement
     * @param {string} paymentMethod - Méthode de paiement
     * @returns {boolean} Résultat de validation
     */
    async validatePaymentForm(paymentMethod) {
        const form = DOM.$(SELECTORS.PAYMENT_FORM);
        if (!form) return false;

        // Schéma de validation adapté à la méthode
        let schema = {
            firstName: this.validationSchema.firstName,
            lastName: this.validationSchema.lastName,
            email: this.validationSchema.email
        };

        // Ajouter les règles spécifiques à la carte de crédit
        if (paymentMethod === 'credit-card') {
            schema = {
                ...schema,
                cardNumber: this.validationSchema.cardNumber,
                expiryDate: this.validationSchema.expiryDate,
                cvv: this.validationSchema.cvv,
                cardName: this.validationSchema.cardName
            };
        }

        const result = validator.validateForm(form, schema);
        
        if (!result.isValid) {
            logger.warn('Form validation failed', result.errors);
            this.showNotification('Please correct the errors in the form.', 'error');
        }

        return result.isValid;
    }

    /**
     * Traite le paiement par carte de crédit
     */
    async processCreditCard() {
        logger.info('Processing credit card payment');
        
        // Simuler le traitement
        await sleep(CONFIG.PAYMENT.PROCESSING_DELAY);
        
        const customerData = this.getCustomerData();
        const cardData = this.getCardData();
        
        // Créer l'enregistrement de paiement
        const paymentRecord = {
            ...this.currentOrder,
            customer: customerData,
            paymentMethod: 'Credit Card',
            cardLast4: cardData.number.slice(-4),
            status: 'completed',
            processedAt: new Date().toISOString()
        };

        // Stocker l'enregistrement
        Storage.payments.add(paymentRecord);
        
        this.completePayment(paymentRecord);
    }

    /**
     * Traite le paiement PayPal
     */
    async processPayPal() {
        logger.info('Processing PayPal payment');
        
        // Simuler la redirection PayPal
        await sleep(1000);
        
        const customerData = this.getCustomerData();
        
        const paymentRecord = {
            ...this.currentOrder,
            customer: customerData,
            paymentMethod: 'PayPal',
            status: 'completed',
            processedAt: new Date().toISOString()
        };

        Storage.payments.add(paymentRecord);
        this.completePayment(paymentRecord);
    }

    /**
     * Traite le virement bancaire
     */
    async processBankTransfer() {
        logger.info('Processing bank transfer');
        
        await sleep(500);
        
        const customerData = this.getCustomerData();
        
        const paymentRecord = {
            ...this.currentOrder,
            customer: customerData,
            paymentMethod: 'Bank Transfer',
            status: 'pending',
            processedAt: new Date().toISOString()
        };

        Storage.payments.add(paymentRecord);
        
        this.showNotification(
            'Bank transfer details provided. Please complete the transfer using the reference number.',
            'info'
        );
        
        this.completePayment(paymentRecord);
    }

    /**
     * Récupère les données client du formulaire
     * @returns {Object} Données client
     */
    getCustomerData() {
        return {
            firstName: DOM.$('#firstName')?.value || '',
            lastName: DOM.$('#lastName')?.value || '',
            email: DOM.$('#email')?.value || '',
            phone: DOM.$('#phone')?.value || ''
        };
    }

    /**
     * Récupère les données de carte du formulaire
     * @returns {Object} Données de carte
     */
    getCardData() {
        return {
            number: DOM.$('#cardNumber')?.value || '',
            expiry: DOM.$('#expiryDate')?.value || '',
            cvv: DOM.$('#cvv')?.value || '',
            name: DOM.$('#cardName')?.value || ''
        };
    }

    /**
     * Finalise le paiement
     * @param {Object} paymentRecord - Enregistrement de paiement
     */
    completePayment(paymentRecord) {
        // Afficher la notification de succès
        if (paymentRecord.status === 'completed') {
            this.showNotification(
                `Payment successful! Order ${paymentRecord.orderId} has been processed.`,
                'success'
            );
        }

        // Fermer le modal
        const modal = DOM.$(SELECTORS.PAYMENT_MODAL);
        if (modal) {
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
        }

        // Simuler l'envoi d'email de confirmation
        setTimeout(() => {
            this.showNotification(
                `Confirmation email sent to ${paymentRecord.customer.email}`,
                'info'
            );
        }, 1000);
    }

    /**
     * Définit l'état de chargement
     * @param {boolean} loading - État de chargement
     */
    setLoadingState(loading) {
        const processBtn = DOM.$(SELECTORS.PROCESS_PAYMENT);
        if (!processBtn) return;

        if (loading) {
            processBtn.dataset.originalText = processBtn.innerHTML;
            processBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
            processBtn.disabled = true;
        } else {
            processBtn.innerHTML = processBtn.dataset.originalText || processBtn.innerHTML;
            processBtn.disabled = false;
        }
    }

    /**
     * Remet à zéro le formulaire
     */
    resetForm() {
        const form = DOM.$(SELECTORS.PAYMENT_FORM);
        if (form) {
            form.reset();
            validator.clearValidation(form);
        }
        
        this.currentOrder = null;
        this.isProcessing = false;
        
        logger.debug('Payment form reset');
    }

    /**
     * Applique le thème au modal
     */
    applyThemeToModal() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const modal = DOM.$(SELECTORS.PAYMENT_MODAL);
        
        if (modal) {
            modal.setAttribute('data-theme', currentTheme || 'light');
        }
    }

    /**
     * Affiche une notification
     * @param {string} message - Message
     * @param {string} type - Type de notification
     */
    showNotification(message, type = 'info') {
        const notification = DOM.createElement('div', {
            className: `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`,
            style: 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 400px;'
        });

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <i class="${icons[type]} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        document.body.appendChild(notification);

        // Auto-suppression
        setTimeout(() => {
            DOM.removeElement(notification, CONFIG.UI.ANIMATION_DURATION);
        }, CONFIG.UI.NOTIFICATION_DURATION);
    }
}

export default PaymentProcessor;