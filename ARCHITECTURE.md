
**Objectif :** Créer le moteur logique du jeu (Backend logic) en TypeScript, totalement découplé de l'interface graphique (HTML/DOM) pour éviter le "Spaghetti Code".

# Structure du Projet

```text
/src
  ├── data/
  │   └── dictionary.js      # Contient la liste des mots valides
  ├── logic/
  │   ├── EconomySystem.js   # Gère la thune (Bankroll, Mises, Payouts)
  │   ├── WordleEngine.js    # Gère les règles du jeu (Comparaison lettres, Victoire/Défaite)
  │   └── GameManager.js     # Le Chef d'orchestre (Relie l'Éco et le Moteur)
  └── main_cli.js            # Point d'entrée pour tester le jeu dans la console
```

## Instructions de Code (Classes & Méthodes)

### 1. `src/logic/EconomySystem.js`

**Rôle :** Gérer le portefeuille du joueur et les mathématiques du gambling.

- **State (Propriétés) :**
    - `bankroll` (float) : L'argent total du joueur.
    - `currentBet` (float) : La mise engagée dans la manche actuelle.

- **Méthodes :**
    - `placeBet(amount)` : Vérifie si la bankroll est suffisante, déduit le montant et le stocke dans `currentBet`.
    - `calculatePayout(attemptNumber)` : Retourne le gain potentiel basé sur le numéro de l'essai (1 à 4).
        - _Multiplicateurs :_ Essai 1 (x50), Essai 2 (x5), Essai 3 (x2), Essai 4 (x0.5).
        - _Échec :_ x0.
    
    - `buyHint(cost)` : Déduit le coût de la `bankroll`. Retourne `true` si l'achat est réussi, `false` sinon.

    - `cashOut(multiplier)` : Applique le multiplicateur à la mise et rajoute les gains à la `bankroll`.


### 2. `src/logic/WordleEngine.js`

**Rôle :** Moteur pur du jeu de lettres (ne connaît pas l'argent).

- **State (Propriétés) :**
    - `targetWord` (string) : Le mot à trouver.
    - `attempts` (int) : Nombre d'essais utilisés.
    - `maxAttempts` (constante = 4).
    - `gameStatus` (string) : 'playing', 'won', 'lost'.

- **Méthodes :**
    - `startNewGame(word)` : Réinitialise les compteurs et définit le nouveau mot.

    - `submitGuess(guess)` :
        - Vérifie la validité (5 lettres).
        - Compare `guess` avec `targetWord`.
        - Retourne un tableau d'objets pour chaque lettre : `{ letter: 'A', status: 'correct' | 'present' | 'absent' }`.
        - Met à jour `gameStatus` (Gagné si tout est correct, Perdu si `attempts` > `maxAttempts`).


### 3. `src/logic/GameManager.js`

**Rôle :** Contrôleur principal. Il fait le lien entre l'argent et le jeu.

- **Dépendances :** Importe `EconomySystem` et `WordleEngine`.
- **Méthodes :**
    - `initialize(startingMoney)` : Instancie les systèmes.

    - `startRound(betAmount)` : Choisit un mot aléatoire (depuis le dictionnaire), appelle `EconomySystem.placeBet()` et `WordleEngine.startNewGame()`.

    - `makeGuess(word)` :
        
        - Appelle `WordleEngine.submitGuess()`.
        - Si le jeu est gagné (`won`), appelle `EconomySystem.calculatePayout()` et crédite le joueur.
        - Retourne le résultat de la tentative (couleurs des lettres) + le statut financier (gain ou perte).

    - `purchasePowerUp(type)` : Gère la logique d'achat d'indices (Scanner, Sniper).


### 4. `src/main_cli.js` (Simulation)

**Rôle :** Script de test pour vérifier que tout marche sans interface graphique.

- **Logique :**
    1. Initialise le jeu avec 100$.
    2. Lance une mise de 10$.
    3. Affiche le mot caché (triche pour tester).
    4. Simule une tentative incorrecte -> Affiche le retour console.
    5. Simule une tentative correcte -> Affiche le gain et le nouveau solde.

---

## Contraintes Techniques

1. **TypeScript Moderne :** Utiliser les classes ES6 (`export default class...`)

2. **Pas de DOM :** Aucune référence à `document`, `window` ou `html`. Le code doit pouvoir tourner dans un environnement Node.js ou la console du navigateur

3. **Clean Code :** Variable en anglais, commentaires explicatifs si nécessaire.à


---

# API de transaction

Il faut aussi utiliser une API externe pour les transactions. Ces choses là je v eux que ce soit dans leur propre services et leur propre fichier pour que la logique soit claire

Voir le fichier API_ENDPOINTS.md
### URL DE BASE : 

`https://api.gamblingjamaeglo.dev`

## GET   `/portefeuille/{categorie}/{cle}` :

Obtenir le portefeuille d'un utilisateur ou d'un jeu via sa clée privée
### Paramètre

| Name                             | Description                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| categorie * -- string (Path)<br> | Type d'entité dont on veut le portefeuille<br><br>_Available values_ : utilisateur, jeu<br> |
| cle * -- string (Path)<br>       | Clé privée de l'entité                                                                      |

### Réponses

#### 200 : portefeuille trouvé

mediaType : JSON

```json
{
  "portefeuille": 120 // EXEMPLE : portefeuile utilisateur
}
```

```json
{
  "portefeuille": 4500 // EXEMPLE : portefeuile Jeu
}
```

#### 404 : Catégorie invalide ou entité introuvable

mediaType : JSON

```json
{
  "title": "Not Found",
  "status": 404,
  "detail": "Cette catégorie n'existe pas" // EXEMPLE : catégorie existe pas
}
```

## POST : `echangerArgent/{cleJeu}`

Le jeu demandeur (cleJeu) doit être impliqué dans la transaction, soit comme source soit comme destination.

### Paramètre

| Name                             | Description                     |
| -------------------------------- | ------------------------------- |
| categorie * -- string (Path)<br> | Clé privée du jeu demandeur<br> |

**Request Body required**

```json
{
  "source": "CLE_UTILISATEUR",
  "destination": "CLE_JEU",  // EXEMPLE : utilisateur paye le jeu
  "montant": 50
}
```

```json
{
  "source": "CLE_JEU",
  "destination": "CLE_UTILISATEUR", // EXEMPLE : le jeu paye l'utilisateur
  "montant": 67
}
```

### Réponses

#### 201 : Transaction effectué

MediaType: Application/JSON

```json
{
  "message": "Transaction effectuée avec succès",
  "flag": "Cette transaction a causé la faillite"
}
```

#### 403 : Refus ou validation échouée (selon les règles spécifiées)

MediaType: Application/JSON

```json
{
  "title": "Forbidden",
  "status": 403,
  "detail": "Seuls les jeux créés peuvent faire des requêtes"
}
```

```json
{
  "title": "Forbidden",
  "status": 403,
  "detail": "Le montant doit être un chiffre"
}
```

```json
{
  "title": "Forbidden",
  "status": 403,
  "detail": "Le montant doit être strictement positif"
}
```

```json
{
  "title": "Forbidden",
  "status": 403,
  "detail": "Le jeu demandeur est en faillite et a perdu son droit de faire des transactions"
}
```

```json
{
  "title": "Forbidden",
  "status": 403,
  "detail": "Le jeu demandeur doit être impliqué dans l'échange"
}
```

```json
{
  "title": "Forbidden",
  "status": 403,
  "detail": "L'utilisateur n'a pas les fonds pour payer"
}
```
#### 404 : Jeu introuvable

MediaType: Application/JSON

```json
{
  "title": "Forbidden",
  "status": 404,
  "detail": "Message d'erreur"
}
```

#### 425 : trop tôt, la phase de jeu n'a pas commencé

MediaType: Application/JSON

```json
{
  "title": "Too Early",
  "status": 425,
  "detail": "Cette transaction aurait dû fonctionner, mais la phase de jeu n'est pas encore commencée. Il sera possible de jouer au jeu le 10 janvier"
}
```





