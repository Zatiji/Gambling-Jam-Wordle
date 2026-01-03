**Objectif :** Créer le moteur logique du jeu (Backend logic) en TypeScript, totalement découplé de l'interface graphique (HTML/DOM) en suivant les principes SOLID pour une architecture durable et testable.

# Structure du Projet

```text
/src
  ├── data/
  │   ├── dictionary.ts      # Liste des mots valides
  │   └── GameConfig.ts      # Configuration centrale (Limites, Multiplicateurs, Coûts)
  ├── logic/
  │   ├── powerups/          # Stratégies de Power-Ups (OCP)
  │   │   ├── IPowerUp.ts    # Interface commune
  │   │   ├── ScannerPowerUp.ts
  │   │   ├── SniperPowerUp.ts
  │   │   └── ExtraLifePowerUp.ts
  │   ├── EconomySystem.ts   # Gestion financière locale
  │   ├── WordleEngine.ts    # Moteur de jeu de lettres pur
  │   └── GameManager.ts     # Chef d'orchestre (DIP - Injection de dépendances)
  ├── services/
  │   └── GamblingApi.ts     # Client pour l'API externe de transactions
  └── types/
      └── env.d.ts           # Définitions de types environnementaux
```

## Principes Architecturaux Appliqués

1.  **Single Responsibility (SRP)** : Chaque classe a un rôle unique (ex: `WordleEngine` ne connaît pas l'argent, `EconomySystem` ne connaît pas les lettres).
2.  **Open/Closed (OCP)** : Le système de Power-Ups utilise le *Strategy Pattern*. On peut ajouter un nouveau bonus sans modifier le `GameManager`.
3.  **Dependency Inversion (DIP)** : `GameManager` ne crée plus ses dépendances, elles lui sont injectées (Engine, Economy, WordProvider, PowerUps).

---

## Composants Principaux

### 1. `src/logic/EconomySystem.ts`
Gère le portefeuille local et les règles de calcul.
- **Config** : Utilise `GAME_CONFIG` pour les multiplicateurs et les limites de mise (Min/Max).
- **Méthodes** : `placeBet()`, `calculatePayout()`, `cashOut()`, `buyHint()`.

### 2. `src/logic/WordleEngine.ts`
Moteur de jeu pur, 100% logique de lettres.
- **Règle** : 5 lettres, 4 essais par défaut (modifiable via Power-Up).
- **Statut** : Gère les états `playing`, `won`, `lost`.

### 3. `src/logic/powerups/` (Système de Bonus)
- **Interface `IPowerUp`** : Définit la méthode `execute(engine, input)`.
- **Implémentations** :
    - `Scanner` : Vérifie la présence d'une voyelle.
    - `Sniper` : Révèle la première lettre du mot.
    - `ExtraLife` : Ajoute une tentative supplémentaire.

### 4. `src/logic/GameManager.ts`
Le point de pivot qui coordonne les systèmes via injection.
- **Injection** : Reçoit ses dépendances par constructeur (Map de Power-Ups, Services, etc.).
- **Responsabilité** : Orchestration des tours de jeu et validation du flux.

### 5. `src/services/GamblingApi.ts`
Service dédié aux communications réseau avec l'API externe.
- **Endpoints** : Gère les appels vers `https://api.gamblingjamaeglo.dev` pour la synchronisation des portefeuilles et les échanges d'argent.

---

## Configuration du Jeu (`src/data/GameConfig.ts`)
Toutes les valeurs critiques sont centralisées :
- `BETTING` : `MIN_BET`, `MAX_BET`.
- `PAYOUT_MULTIPLIERS` : Map des gains par essai (x50, x5, x2, x0.5).
- `POWERUPS.COSTS` : Prix par niveau (LEVEL_1, LEVEL_2, LEVEL_3).

---

## Contraintes Techniques
1. **TypeScript Moderne** : Typage strict, classes ES6, imports `.js`.
2. **Environnement Agnostique** : Aucun couplage avec le DOM. Fonctionne sous Node.js, CLI ou Web.
3. **Persistance API** : Les transactions réelles doivent passer par le `GamblingApi` service.