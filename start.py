#!/usr/bin/env python3
"""
Script de démarrage pour NeoSafi Frontend
Démarre uniquement le serveur Node.js sans base de données
"""

import subprocess
import sys
import os
from pathlib import Path

def print_banner():
    print("🚀" + "="*60 + "🚀")
    print("    NEOSAFI FRONTEND - SERVEUR NODE.JS")
    print("    Landing Page sans base de données")
    print("🚀" + "="*60 + "🚀")

def check_node_installed():
    """Vérifie si Node.js est installé"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print(f"✅ Node.js détecté: {result.stdout.strip()}")
            return True
        else:
            print("❌ Node.js n'est pas installé")
            return False
    except Exception:
        print("❌ Node.js n'est pas installé")
        return False

def check_npm_installed():
    """Vérifie si npm est installé"""
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print(f"✅ npm détecté: {result.stdout.strip()}")
            return True
        else:
            print("❌ npm n'est pas installé")
            return False
    except Exception:
        print("❌ npm n'est pas installé")
        return False

def install_dependencies():
    """Installe les dépendances npm"""
    print("\n📦 Installation des dépendances...")
    try:
        result = subprocess.run(['npm', 'install'], cwd=Path(__file__).parent, shell=True)
        if result.returncode == 0:
            print("✅ Dépendances installées avec succès")
            return True
        else:
            print("❌ Erreur lors de l'installation des dépendances")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def start_server():
    """Démarre le serveur Node.js"""
    print("\n🟢 Démarrage du serveur Node.js Frontend...")
    print("📍 URL: http://localhost:3000")
    print("🔧 API: http://localhost:3000/api")
    print("🏥 Health Check: http://localhost:3000/api/health")
    print("\n✨ Fonctionnalités disponibles:")
    print("   - Site web complet")
    print("   - API simulée pour les produits")
    print("   - Formulaire de contact")
    print("   - Interface responsive")
    print("\n⏳ Démarrage en cours...")
    print("💡 Utilisez Ctrl+C pour arrêter le serveur")
    
    try:
        subprocess.run(['npm', 'start'], cwd=Path(__file__).parent, shell=True)
    except KeyboardInterrupt:
        print("\n🛑 Serveur Node.js arrêté")
    except Exception as e:
        print(f"\n❌ Erreur: {e}")

def main():
    print_banner()
    
    # Vérifier les prérequis
    print("\n🔍 Vérification des prérequis...")
    
    if not check_node_installed():
        print("\n💡 Veuillez installer Node.js depuis: https://nodejs.org/")
        print("   Redémarrez votre terminal après l'installation")
        sys.exit(1)
    
    if not check_npm_installed():
        print("\n💡 npm devrait être installé avec Node.js")
        print("   Vérifiez votre installation de Node.js")
        sys.exit(1)
    
    # Vérifier si les dépendances sont installées
    node_modules_path = Path(__file__).parent / 'node_modules'
    if not node_modules_path.exists():
        print("\n📦 Les dépendances ne sont pas installées")
        if not install_dependencies():
            sys.exit(1)
    else:
        print("✅ Dépendances déjà installées")
    
    # Démarrer le serveur
    try:
        start_server()
    except KeyboardInterrupt:
        print("\n\n👋 Au revoir !")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()