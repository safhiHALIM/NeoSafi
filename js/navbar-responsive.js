// Navbar Responsive JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggleMobile = document.getElementById('themeToggle');
    const themeToggleDesktop = document.getElementById('themeToggleDesktop');
    const body = document.body;
    
    // Check for saved theme preference or default to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', currentTheme);
    
    // Function to toggle theme
    function toggleTheme() {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    // Add event listeners to both toggle buttons
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', toggleTheme);
    }
    
    if (themeToggleDesktop) {
        themeToggleDesktop.addEventListener('click', toggleTheme);
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('mainNavbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Active link highlighting
    function setActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // Set active link on page load
    setActiveLink();
    
    // Mobile navbar height adjustment
    function adjustBodyPadding() {
        const navbar = document.getElementById('mainNavbar');
        if (navbar && window.innerWidth <= 767) {
            const navbarHeight = navbar.offsetHeight;
            document.body.style.paddingTop = (navbarHeight + 20) + 'px';
        } else if (navbar) {
            document.body.style.paddingTop = '80px';
        }
    }
    
    // Adjust padding on load and resize
    adjustBodyPadding();
    window.addEventListener('resize', adjustBodyPadding);
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbarHeight = document.getElementById('mainNavbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});