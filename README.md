# Biophysique Quiz — HTML + Node.js + WebRTC

## 1. Installation
Installe Node.js (version LTS recommandée), puis dans ce dossier :

```bash
npm init -y
npm install ws
node server.js
```

Ouvre ensuite :
http://localhost:8080

## 2. Sur plusieurs téléphones du même Wi‑Fi
Sur le PC qui exécute Node.js, trouve son adresse IP locale (ex. 192.168.1.20).

Depuis les téléphones connectés au même Wi‑Fi, ouvre :
http://192.168.1.20:8080

L'Host crée la partie et donne le code aux autres joueurs.

## 3. WebRTC
Le serveur Node.js sert :
- la page HTML ;
- la signalisation WebRTC (offre/réponse/ICE).

Après établissement de la connexion, les réponses passent par un canal DataChannel WebRTC.

## 4. Important
Cette version est un prototype fonctionnel. Le serveur garde les salles uniquement en mémoire : redémarrer Node.js détruit les parties.

Pour une utilisation Internet réelle, déploie le serveur en HTTPS/WSS et ajoute idéalement un TURN server pour les réseaux où le STUN direct ne suffit pas.

## 5. Contenu
Les questions intégrées reprennent le contenu du PDF de biophysique fourni, sans prétendre couvrir tout le cours.
