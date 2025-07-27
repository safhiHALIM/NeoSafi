# 🎨 Documentation des Animations CSS - NeoSafi

## ✨ Animations Implémentées

### 🏷️ Animations des Titres Principaux

#### 1. **Animations de Base**
- **h1** : Animation `fadeInUpSlow` (1s) avec délai de 0.1s
- **h2** : Animation `fadeInUp` (0.8s) avec délai de 0.2s  
- **h3** : Animation `fadeInUp` (0.6s) avec délai de 0.3s

#### 2. **Effet Cascade pour Titres Multiples**
```css
/* Délais échelonnés pour h2 multiples */
h2:nth-of-type(1) { animation-delay: 0.2s; }
h2:nth-of-type(2) { animation-delay: 0.4s; }
h2:nth-of-type(3) { animation-delay: 0.6s; }
h2:nth-of-type(4) { animation-delay: 0.8s; }
h2:nth-of-type(5) { animation-delay: 1s; }

/* Délais échelonnés pour h3 multiples */
h3:nth-of-type(1) { animation-delay: 0.3s; }
h3:nth-of-type(2) { animation-delay: 0.5s; }
h3:nth-of-type(3) { animation-delay: 0.7s; }
/* ... jusqu'à 1.3s */
```

#### 3. **Animations au Survol (Hover)**
- **h1:hover** : Scale(1.02) + letter-spacing
- **h2:hover** : Scale(1.01) + translateY(-2px) + couleur primaire
- **h3:hover** : Scale(1.01) + letter-spacing + couleur secondaire

### 🎯 Animations Spécifiques par Section

#### **Section Hero**
- **h1** : `fadeInUpSlow` (1.2s) avec délai 0.3s et translateY(60px)
- **h2** : `fadeInUp` (1s) avec délai 0.6s
- **lead** : `fadeInUp` (0.8s) avec délai 0.9s
- **Boutons** : `fadeInUp` (0.8s) avec délais 1.2s et 1.4s

#### **Titres de Section (#features, #products, #contact, #pricing)**
- Animation `textReveal` (1.2s) avec effet de clip-path
- Gradient de couleur animé (text-color → primary → secondary)
- Ligne décorative au survol (::after)

#### **Titres de Cartes**
- **feature-card h5** : Délais échelonnés de 0.4s à 0.9s
- **product-card h5** : Délais échelonnés de 0.4s à 0.9s
- **pricing-card h5** : Animation `fadeInUp` (0.6s)

### 🧭 Animations de Navigation

#### **Navbar**
- Animation `slideDown` (0.8s) depuis translateY(-100%)
- **Logo** : `fadeInUp` (0.8s) avec délai 0.05s
- **Liens de navigation** : Délais échelonnés de 0.1s à 0.6s
- **Toggle thème** : `fadeInUp` (0.6s) avec délai 0.7s

### 🎬 Keyframes Définies

```css
@keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(40px); }
    100% { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUpSlow {
    0% { opacity: 0; transform: translateY(50px); }
    100% { opacity: 1; transform: translateY(0); }
}

@keyframes textReveal {
    0% { opacity: 0; transform: translateY(40px); clip-path: inset(0 100% 0 0); }
    50% { opacity: 1; transform: translateY(0); clip-path: inset(0 50% 0 0); }
    100% { opacity: 1; transform: translateY(0); clip-path: inset(0 0% 0 0); }
}

@keyframes slideDown {
    0% { transform: translateY(-100%); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}
```

### 📱 Responsive & Accessibilité

#### **Media Query pour Reduced Motion**
```css
@media (prefers-reduced-motion: reduce) {
    /* Désactive toutes les animations pour les utilisateurs sensibles */
    h1, h2, h3, h5, .navbar, .navbar-brand, .navbar-nav .nav-link, 
    .theme-toggle, .hero-buttons .btn {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
    }
}
```

#### **Adaptations Mobile**
- Animations conservées sur mobile
- Délais ajustés pour les boutons hero
- Effets hover désactivés sur les éléments de navigation mobile

### 🎨 Effets Visuels Spéciaux

#### **Lignes Décoratives**
- Apparition au survol des titres de section
- Largeur animée de 0 à 60px
- Couleur gradient secondaire

#### **Gradient de Texte Animé**
- Titres de section avec gradient 3 couleurs
- Background-size: 200% pour effet de mouvement
- Clip-path pour révélation progressive

### ⚡ Performance

- **Durées optimisées** : 0.6s à 1.2s maximum
- **Easing** : `ease-out` pour un rendu naturel
- **Transform & Opacity** : Propriétés optimisées GPU
- **Cubic-bezier** : `(0.4, 0, 0.2, 1)` pour fluidité moderne

### 🎯 Résultat Final

✅ **Titres animés au chargement** avec effet de montée fluide  
✅ **Effet cascade** pour les titres multiples  
✅ **Interactions hover** subtiles et élégantes  
✅ **Navigation animée** avec délais échelonnés  
✅ **Responsive** et accessible  
✅ **Performance optimisée** avec animations GPU  
✅ **Aucune modification HTML/JS** requise  

## 🚀 Utilisation

Les animations se déclenchent automatiquement au chargement de la page. Aucune configuration supplémentaire n'est nécessaire.

**URL de test** : http://localhost:3000

---
*Animations créées pour NeoSafi - Design moderne et professionnel*