@echo off
echo.
echo ========================================
echo   NEOSAFI FRONTEND - NODE.JS SERVER
echo ========================================
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé
    echo 💡 Installez Node.js depuis: https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier si npm est installé
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm n'est pas installé
    echo 💡 npm devrait être installé avec Node.js
    pause
    exit /b 1
)

echo ✅ Node.js et npm détectés

REM Vérifier si les dépendances sont installées
if not exist "node_modules" (
    echo.
    echo 📦 Installation des dépendances...
    npm install
    if errorlevel 1 (
        echo ❌ Erreur lors de l'installation des dépendances
        pause
        exit /b 1
    )
    echo ✅ Dépendances installées
)

echo.
echo 🚀 Démarrage du serveur...
echo 📍 URL: http://localhost:3000
echo 💡 Appuyez sur Ctrl+C pour arrêter
echo.

REM Démarrer le serveur
npm start

pause