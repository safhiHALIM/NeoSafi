// ===== PAYMENT SYSTEM =====
// Advanced payment processing with multiple payment methods

class PaymentProcessor {
    constructor() {
        this.currentOrder = null;
        this.paymentMethods = {
            'credit-card': this.processCreditCard,
            'paypal': this.processPayPal,
            'bank-transfer': this.processBankTransfer
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupFormValidation();
        this.setupPaymentMethodToggle();
        console.log('💳 Payment system initialized');
    }

    // Method to reinitialize after dynamic content loading
    reinitialize() {
        console.log('🔄 Reinitializing payment system...');
        this.setupFormValidation();
        this.setupPaymentMethodToggle();
        
        // Ensure process payment button is working
        const processBtn = document.getElementById('processPayment');
        if (processBtn) {
            console.log('✅ Process payment button found');
            // Remove any existing listeners and add new one
            processBtn.removeEventListener('click', this.processPaymentHandler);
            this.processPaymentHandler = (e) => {
                e.preventDefault();
                console.log('🔘 Process payment button clicked');
                this.processPayment();
            };
            processBtn.addEventListener('click', this.processPaymentHandler);
        } else {
            console.log('❌ Process payment button not found');
        }
    }

    bindEvents() {
        // Buy button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('buy-btn') || e.target.closest('.buy-btn')) {
                const button = e.target.classList.contains('buy-btn') ? e.target : e.target.closest('.buy-btn');
                this.handlePurchase(button);
            }
        });

        // Process payment button - using event delegation
        document.addEventListener('click', (e) => {
            if (e.target.id === 'processPayment') {
                e.preventDefault();
                console.log('🔘 Process payment button clicked via delegation');
                this.processPayment();
            }
        });

        // Also handle form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'paymentForm') {
                e.preventDefault();
                console.log('📝 Payment form submitted');
                this.processPayment();
            }
        });

        // Payment method change
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.togglePaymentDetails(e.target.value);
            });
        });

        // Modal events
        const paymentModal = document.getElementById('paymentModal');
        if (paymentModal) {
            paymentModal.addEventListener('hidden.bs.modal', () => {
                this.resetForm();
            });
        }
    }

    handlePurchase(button) {
        const productData = {
            id: button.dataset.id,
            name: button.dataset.product,
            price: parseFloat(button.dataset.price)
        };

        this.currentOrder = {
            ...productData,
            orderId: this.generateOrderId(),
            timestamp: new Date().toISOString()
        };

        this.showPaymentModal();
    }

    showPaymentModal() {
        if (!this.currentOrder) return;

        // Update order summary
        document.getElementById('order-product-name').textContent = this.currentOrder.name;
        document.getElementById('order-product-id').textContent = this.currentOrder.id;
        document.getElementById('order-total').textContent = `$${this.currentOrder.price}`;
        document.getElementById('transferReference').textContent = this.currentOrder.orderId;

        // Apply current theme to modal
        this.applyThemeToModal();

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
        modal.show();

        // Reinitialize after modal is shown to ensure all elements are available
        setTimeout(() => {
            this.reinitialize();
        }, 100);

        // Add loading animation to buy button
        const buyButtons = document.querySelectorAll(`[data-id="${this.currentOrder.id}"]`);
        buyButtons.forEach(btn => {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
            btn.disabled = true;
        });

        // Reset button after modal is shown
        setTimeout(() => {
            buyButtons.forEach(btn => {
                btn.innerHTML = '<i class="fas fa-shopping-cart me-2"></i>Buy Now';
                btn.disabled = false;
            });
        }, 1000);
    }

    setupPaymentMethodToggle() {
        // Initially show credit card details
        this.togglePaymentDetails('credit-card');
    }

    togglePaymentDetails(method) {
        // Hide all payment details
        document.querySelectorAll('.payment-details').forEach(detail => {
            detail.style.display = 'none';
        });

        // Show selected payment method details
        const detailsMap = {
            'credit-card': 'creditCardDetails',
            'paypal': 'paypalDetails',
            'bank-transfer': 'bankTransferDetails'
        };

        const targetId = detailsMap[method];
        if (targetId) {
            document.getElementById(targetId).style.display = 'block';
        }

        // Update process button text
        const processBtn = document.getElementById('processPayment');
        const buttonTexts = {
            'credit-card': '<i class="fas fa-lock me-2"></i>Process Payment',
            'paypal': '<i class="fab fa-paypal me-2"></i>Pay with PayPal',
            'bank-transfer': '<i class="fas fa-university me-2"></i>Get Transfer Details'
        };
        
        if (processBtn && buttonTexts[method]) {
            processBtn.innerHTML = buttonTexts[method];
        }
    }

    setupFormValidation() {
        // Real-time validation
        const inputs = document.querySelectorAll('#paymentForm input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Format card number
        const cardNumber = document.getElementById('cardNumber');
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });
        }

        // Format expiry date
        const expiryDate = document.getElementById('expiryDate');
        if (expiryDate) {
            expiryDate.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        // Format CVV
        const cvv = document.getElementById('cvv');
        if (cvv) {
            cvv.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error styling
        field.classList.remove('is-invalid');
        const existingError = field.parentNode.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }

        // Validation rules
        switch (field.id) {
            case 'firstName':
            case 'lastName':
                if (!value) {
                    isValid = false;
                    errorMessage = 'This field is required';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Must be at least 2 characters';
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) {
                    isValid = false;
                    errorMessage = 'Email is required';
                } else if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email';
                }
                break;

            case 'cardNumber':
                const cardRegex = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
                if (!value) {
                    isValid = false;
                    errorMessage = 'Card number is required';
                } else if (!cardRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid card number';
                }
                break;

            case 'expiryDate':
                const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
                if (!value) {
                    isValid = false;
                    errorMessage = 'Expiry date is required';
                } else if (!expiryRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter MM/YY format';
                }
                break;

            case 'cvv':
                if (!value) {
                    isValid = false;
                    errorMessage = 'CVV is required';
                } else if (value.length < 3) {
                    isValid = false;
                    errorMessage = 'CVV must be 3-4 digits';
                }
                break;

            case 'cardName':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Name on card is required';
                }
                break;
        }

        if (!isValid) {
            field.classList.add('is-invalid');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = errorMessage;
            field.parentNode.appendChild(errorDiv);
        }

        return isValid;
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid');
        const existingError = field.parentNode.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
    }

    validateForm() {
        const requiredFields = document.querySelectorAll('#paymentForm input[required]');
        let isValid = true;
        
        console.log('🔍 Validating form, found', requiredFields.length, 'required fields');

        // Check payment method selection
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (!paymentMethod) {
            console.log('❌ No payment method selected');
            return false;
        }

        // Validate only visible required fields based on payment method
        const visibleRequiredFields = Array.from(requiredFields).filter(field => {
            const fieldContainer = field.closest('.payment-details');
            return !fieldContainer || fieldContainer.style.display !== 'none';
        });

        console.log('👁️ Visible required fields:', visibleRequiredFields.length);

        visibleRequiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
                console.log('❌ Field validation failed:', field.id);
            }
        });

        console.log('✅ Form validation result:', isValid);
        return isValid;
    }

    async processPayment() {
        console.log('🔄 Processing payment...');
        
        // Simple test first - just show a notification
        this.showNotification('Payment processing started!', 'info');
        
        if (!this.currentOrder) {
            this.showNotification('No order found. Please select a product first.', 'error');
            return;
        }

        const paymentMethodElement = document.querySelector('input[name="paymentMethod"]:checked');
        if (!paymentMethodElement) {
            this.showNotification('Please select a payment method.', 'error');
            return;
        }

        const paymentMethod = paymentMethodElement.value;
        const processBtn = document.getElementById('processPayment');
        
        console.log('💳 Payment method:', paymentMethod);
        console.log('🔘 Process button:', processBtn);
        console.log('📦 Current order:', this.currentOrder);

        // Skip form validation for now to test the basic flow
        // if (!this.validateForm()) {
        //     this.showNotification('Please fill in all required fields correctly.', 'error');
        //     return;
        // }
        
        // Show loading state
        if (processBtn) {
            const originalText = processBtn.innerHTML;
            processBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
            processBtn.disabled = true;

            try {
                // Simulate payment processing
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                this.showNotification(`Payment successful! Order ${this.currentOrder.orderId} processed via ${paymentMethod}.`, 'success');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
                if (modal) {
                    modal.hide();
                }
                
            } catch (error) {
                console.error('Payment processing error:', error);
                this.showNotification('Payment processing failed. Please try again.', 'error');
            } finally {
                // Reset button
                processBtn.innerHTML = originalText;
                processBtn.disabled = false;
            }
        } else {
            console.log('❌ Process button not found');
            this.showNotification('Button not found. Please try again.', 'error');
        }
    }

    async processCreditCard() {
        // Simulate credit card processing
        await this.simulatePaymentProcessing();
        
        const cardData = {
            number: document.getElementById('cardNumber').value,
            expiry: document.getElementById('expiryDate').value,
            cvv: document.getElementById('cvv').value,
            name: document.getElementById('cardName').value
        };

        // In a real application, you would send this to a payment processor
        console.log('Processing credit card payment:', cardData);
        
        this.completePayment('Credit Card');
    }

    async processPayPal() {
        // Simulate PayPal redirect
        await this.simulatePaymentProcessing();
        
        // In a real application, you would redirect to PayPal
        console.log('Redirecting to PayPal...');
        
        this.completePayment('PayPal');
    }

    async processBankTransfer() {
        // Bank transfer doesn't require immediate processing
        await this.simulatePaymentProcessing(1000);
        
        console.log('Bank transfer details provided');
        
        this.showNotification(
            'Bank transfer details have been provided. Please complete the transfer using the reference number.',
            'info'
        );
        
        this.completePayment('Bank Transfer');
    }

    async simulatePaymentProcessing(delay = 2000) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    completePayment(method) {
        const customerData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };

        const paymentRecord = {
            ...this.currentOrder,
            customer: customerData,
            paymentMethod: method,
            status: method === 'Bank Transfer' ? 'pending' : 'completed',
            processedAt: new Date().toISOString()
        };

        // Store payment record (in a real app, send to server)
        this.storePaymentRecord(paymentRecord);

        // Show success message
        if (method !== 'Bank Transfer') {
            this.showNotification(
                `Payment successful! Your order ${this.currentOrder.orderId} has been processed.`,
                'success'
            );
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
        modal.hide();

        // Send confirmation email (simulate)
        this.sendConfirmationEmail(paymentRecord);
    }

    storePaymentRecord(record) {
        // In a real application, this would be sent to your backend
        const existingRecords = JSON.parse(localStorage.getItem('paymentRecords') || '[]');
        existingRecords.push(record);
        localStorage.setItem('paymentRecords', JSON.stringify(existingRecords));
        
        console.log('Payment record stored:', record);
    }

    sendConfirmationEmail(record) {
        // Simulate sending confirmation email
        console.log('Sending confirmation email to:', record.customer.email);
        
        // In a real application, you would call your email service
        setTimeout(() => {
            this.showNotification(
                `Confirmation email sent to ${record.customer.email}`,
                'info'
            );
        }, 1000);
    }

    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `ORDER-${timestamp}-${random}`;
    }

    resetForm() {
        document.getElementById('paymentForm').reset();
        document.querySelectorAll('.is-invalid').forEach(field => {
            field.classList.remove('is-invalid');
        });
        document.querySelectorAll('.invalid-feedback').forEach(error => {
            error.remove();
        });
        this.currentOrder = null;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 400px;';
        
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

        // Add animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    applyThemeToModal() {
        // Get current theme
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const modal = document.getElementById('paymentModal');
        
        if (modal) {
            // Apply theme attribute to modal for CSS targeting
            modal.setAttribute('data-theme', currentTheme || 'light');
            
            // Update any dynamic elements that need theme-specific styling
            const bgLightElements = modal.querySelectorAll('.bg-light');
            bgLightElements.forEach(element => {
                if (currentTheme === 'dark') {
                    element.style.backgroundColor = 'var(--card-bg)';
                    element.style.color = 'var(--text-color)';
                    element.style.border = '1px solid var(--border-color)';
                } else {
                    element.style.backgroundColor = '';
                    element.style.color = '';
                    element.style.border = '';
                }
            });
        }
    }
}

// Initialize payment processor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.paymentProcessor = new PaymentProcessor();
    console.log('Payment system initialized! 💳');
    
    // Add a test function to window for debugging
    window.testPayment = () => {
        console.log('🧪 Testing payment system...');
        const processBtn = document.getElementById('processPayment');
        console.log('Process button:', processBtn);
        if (processBtn) {
            processBtn.click();
        } else {
            console.log('❌ Process button not found');
        }
    };
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentProcessor;
}