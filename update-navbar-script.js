// Script pour mettre à jour toutes les navbars des pages HTML
const fs = require('fs');
const path = require('path');

// Template de la nouvelle navbar
const newNavbarTemplate = `    <!-- Navigation Responsive Verticale -->
    <nav class="navbar navbar-expand-lg navbar-light fixed-top" id="mainNavbar">
        <div class="container">
            <a class="navbar-brand fw-bold" href="index.html">
                <img src="img/logo/NEO SAFI LOGO DECLIN-05.png" alt="NeoSafi Logo" class="navbar-logo">
            </a>
            
            <!-- Navigation Links avec Icônes -->
            <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                    <a class="nav-link{{HOME_ACTIVE}}" href="index.html">
                        <i class="fas fa-house"></i>
                        <span class="nav-text">Home</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link{{FEATURES_ACTIVE}}" href="features-page.html">
                        <i class="fas fa-briefcase"></i>
                        <span class="nav-text">Features</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link{{PRICING_ACTIVE}}" href="pricing-page.html">
                        <i class="fas fa-tags"></i>
                        <span class="nav-text">Pricing</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link{{PRODUCTS_ACTIVE}}" href="products-page.html">
                        <i class="fas fa-box"></i>
                        <span class="nav-text">Products</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link{{CONTACT_ACTIVE}}" href="contact-page.html">
                        <i class="fas fa-envelope"></i>
                        <span class="nav-text">Contact</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="btn btn-primary ms-2 px-4" href="contact-page.html">
                        <i class="fas fa-rocket"></i>
                        <span class="nav-text">Get Started</span>
                    </a>
                </li>
            </ul>
            
            <!-- Dark Mode Toggle -->
            <button class="theme-toggle" id="themeToggle" title="Toggle Dark Mode" aria-label="Toggle Dark Mode">
                <i class="fas fa-sun"></i>
                <i class="fas fa-moon"></i>
            </button>
        </div>
    </nav>`;

// Pages à mettre à jour avec leur classe active
const pagesToUpdate = [
    {
        file: 'features-page.html',
        activeClass: 'FEATURES_ACTIVE'
    },
    {
        file: 'pricing-page.html', 
        activeClass: 'PRICING_ACTIVE'
    },
    {
        file: 'contact-page.html',
        activeClass: 'CONTACT_ACTIVE'
    }
];

// Fonction pour extraire et remplacer la navbar
function updateNavbar(filePath, activeClass) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Chercher le début et la fin de la navbar
        const navStart = content.indexOf('<nav class="navbar');
        const navEnd = content.indexOf('</nav>') + 6;
        
        if (navStart === -1 || navEnd === -1) {
            console.log(`❌ Navbar non trouvée dans ${filePath}`);
            return false;
        }
        
        // Créer la nouvelle navbar avec la classe active appropriée
        let newNavbar = newNavbarTemplate;
        
        // Réinitialiser toutes les classes actives
        newNavbar = newNavbar.replace(/\{\{HOME_ACTIVE\}\}/g, '');
        newNavbar = newNavbar.replace(/\{\{FEATURES_ACTIVE\}\}/g, '');
        newNavbar = newNavbar.replace(/\{\{PRICING_ACTIVE\}\}/g, '');
        newNavbar = newNavbar.replace(/\{\{PRODUCTS_ACTIVE\}\}/g, '');
        newNavbar = newNavbar.replace(/\{\{CONTACT_ACTIVE\}\}/g, '');
        
        // Ajouter la classe active pour la page courante
        if (activeClass) {
            newNavbar = newNavbar.replace(`\{\{${activeClass}\}\}`, ' active');
        }
        
        // Remplacer l'ancienne navbar
        const newContent = content.substring(0, navStart) + newNavbar + content.substring(navEnd);
        
        // Écrire le fichier mis à jour
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ ${filePath} mis à jour avec succès`);
        return true;
        
    } catch (error) {
        console.error(`❌ Erreur lors de la mise à jour de ${filePath}:`, error.message);
        return false;
    }
}

// Mettre à jour toutes les pages
console.log('🚀 Début de la mise à jour des navbars...\n');

pagesToUpdate.forEach(page => {
    const filePath = path.join(__dirname, page.file);
    updateNavbar(filePath, page.activeClass);
});

console.log('\n✨ Mise à jour terminée !');