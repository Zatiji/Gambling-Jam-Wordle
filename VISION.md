# 🎲 PROJECT: WORDLE GAMBLE (Nom de code)

**Concept :** Un Wordle rogue-like / gambling inspiré de *Balatro*.
**Vibe :** High Risk / High Reward, Animations "Juicy", CRT, Screen Shake, Stress.
**Tech :** TypeScript.

## 1. LES RÈGLES DU JEU (Core Loop)
Le but est de créer un sentiment de contrôle, tout en gardant les stats en faveur de la "Maison".

* **Format :** Mots de **5 lettres** (Standard, pour ne pas frustrer inutilement).
* **Tentatives :** **4 Essais** max (Le "Sweet Spot" entre stress et faisabilité).
* **Mise de départ (Ante) :** Le joueur paie une somme fixe pour lancer une manche.

## 2. ÉCONOMIE & PAYOUTS (Le Piège)
Le multiplicateur de gain s'effondre à chaque tentative. Le but est de pousser le joueur à prendre des risques tôt.

| Essai # | Type de victoire | Multiplicateur | Feeling Joueur |
| :--- | :--- | :--- | :--- |
| **1** | Jackpot | **x50** | "J'suis un dieu" (Pure chance) |
| **2** | Lucky Guess | **x5** | "Gros gain" (Grosse dopamine) |
| **3** | La Strat | **x2** | "Double ou rien" (Le standard visé) |
| **4** | La Survie | **x0.5** | "J'ai limité la casse" (Perte sèche de 50%) |
| **Fail** | Ruine | **x0** | "Rage quit" (Tout perdu) |

## 3. LE SHOP (Payer pour gagner... moins)
Le joueur peut acheter des indices en temps réel avec sa Bankroll globale.
*C'est là que le casino gagne : le coût de l'indice bouffe la marge de profit.*

* **Le Scanner (Coût : Faible) :** Révèle si une voyelle spécifique (A, E, I, O, U, Y) est présente (Rouge/Vert), mais sans donner la position.
* **Le Sniper (Coût : Moyen) :** Révèle la **première lettre** du mot. (Extrêmement puissant pour éviter les pièges).
* **L'Extra Life (Coût : Élevé) :** Ajoute un 5ème essai. Souvent utilisé en désespoir de cause pour ne pas perdre la mise, même si le profit devient négatif.


## 4. LE "HOUSE EDGE" (Pourquoi c'est pas fair)
Mécaniques invisibles pour assurer que le jeu reste difficile.
* **Les pièges à rimes :** Fréquence élevée de mots type _ALLE (Balle, Salle, Dalle, Mâle) pour forcer le joueur à gaspiller des essais au hasard.
* **Banlist :** Les mots trop faciles ou avec des lettres trop communes sont retirés de la base de données.

## 5. DIRECTION ARTISTIQUE (Le "Juice")
Le jeu doit compenser sa simplicité graphique par du feedback violent.
* **Visuel :** Effet CRT, Scanlines, Glitchs chromatiques.
* **Feedback :**
    * *Screen Shake* léger quand on tape.
    * *Screen Shake* violent quand on valide un mot.
    * L'écran se fissure ou devient rouge sang quand on perd.
* **Audio :** Sons "Crunchy", bruits de casino, impact lourd.
