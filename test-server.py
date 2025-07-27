#!/usr/bin/env python3
"""
Script de test pour vérifier que le serveur Node.js fonctionne correctement
"""

import requests
import json
import time
import sys

def test_server():
    base_url = "http://localhost:3000"
    
    print("🧪 Test du serveur NeoSafi Frontend")
    print("=" * 50)
    
    # Test 1: Health Check
    print("\n1. 🏥 Test Health Check...")
    try:
        response = requests.get(f"{base_url}/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Health Check OK - Mode: {data['data']['mode']}")
        else:
            print(f"   ❌ Health Check Failed - Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Health Check Error: {e}")
        return False
    
    # Test 2: API Produits
    print("\n2. 📦 Test API Produits...")
    try:
        response = requests.get(f"{base_url}/api/products", timeout=5)
        if response.status_code == 200:
            data = response.json()
            products_count = len(data['data'])
            print(f"   ✅ API Produits OK - {products_count} produits trouvés")
            
            # Afficher quelques produits
            for i, product in enumerate(data['data'][:3]):
                print(f"      - {product['name']} (${product['price']})")
        else:
            print(f"   ❌ API Produits Failed - Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ API Produits Error: {e}")
    
    # Test 3: API Catégories
    print("\n3. 🏷️  Test API Catégories...")
    try:
        response = requests.get(f"{base_url}/api/categories", timeout=5)
        if response.status_code == 200:
            data = response.json()
            categories_count = len(data['data'])
            print(f"   ✅ API Catégories OK - {categories_count} catégories trouvées")
        else:
            print(f"   ❌ API Catégories Failed - Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ API Catégories Error: {e}")
    
    # Test 4: Page d'accueil
    print("\n4. 🏠 Test Page d'accueil...")
    try:
        response = requests.get(base_url, timeout=5)
        if response.status_code == 200:
            if "NeoSafi" in response.text:
                print("   ✅ Page d'accueil OK - Contenu NeoSafi détecté")
            else:
                print("   ⚠️  Page d'accueil OK mais contenu suspect")
        else:
            print(f"   ❌ Page d'accueil Failed - Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Page d'accueil Error: {e}")
    
    # Test 5: API Contact (POST)
    print("\n5. 📧 Test API Contact...")
    try:
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "message": "Test message from automated test"
        }
        response = requests.post(f"{base_url}/api/contact", 
                               json=contact_data, 
                               timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ API Contact OK - {data['message']}")
        else:
            print(f"   ❌ API Contact Failed - Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ API Contact Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Tests terminés !")
    print(f"🌐 Serveur accessible sur: {base_url}")
    return True

def main():
    print("⏳ Attente du démarrage du serveur...")
    time.sleep(2)  # Attendre que le serveur soit prêt
    
    try:
        if test_server():
            print("\n✅ Tous les tests sont passés avec succès !")
            print("💡 Le serveur frontend Node.js fonctionne correctement")
        else:
            print("\n❌ Certains tests ont échoué")
            print("💡 Vérifiez que le serveur est démarré avec 'python start.py'")
    except KeyboardInterrupt:
        print("\n\n👋 Tests interrompus par l'utilisateur")
    except Exception as e:
        print(f"\n❌ Erreur lors des tests: {e}")

if __name__ == "__main__":
    main()