
## Note du dévelopeur de l'API

### Pour débuter

1. Il est essentiel d'avoir une clé de jeu. Ainsi, sur le discord de l'ASETIN, un bot a été mis à la disposition de chacun à cet effet. Dans n'importe quel salon textuel, vous pouvez utiliser la commande `enregistrer_jeu` en lui donnant un nom et une courte description qui donnera à chacun l'envie d'y jouer.
    
2. Après cela, stockez la clé générée dans un fichier et garder la SECRÈTE, car c'est avec celle-ci que votre bot devra sans cesse appeler l'API
    
3. Finalement, pour tester si cela a fonctionné, vous pouvez vérifier en faisant votre premier appel HTTP en entrant la commande `https://api.gamblingjamaeglo.dev/portefeuille/jeu/{votre clé}`. Techniquement, si cela a fonctionné, vous devriez avoir reçu une réponse vous indiquant le solde de votre jeu. Vous êtes prêts à développer!
    

---

### Les règles

1. Il est complètement interdit de stocker les clés privées des joueurs de manière à faire des transactions avec leur compte.

2. Il est interdit de prendre plus d'argent à l'utilisateur que le montant qu'il a lui-même spécifié (ex. Il met une mise de 30$ et on lui enlève 50$)

3. Il est interdit d'utiliser le système de jeu pour avoir un fond de départ supérieur en transférer l'argent du compte du jeu vers votre compte personnel

4. Tous les codes d'erreurs doivent être pris en compte et informé à l'utilisateur pour qu'il sache à chaque moment ce qui se passe avec son argent.

5. Si vous décidez d'afficher un taux de retour (vous n'êtes pas obligé), ce taux de retour doit être vérifiable au long terme si on fait tourner le jeu un grand nombre de fois (Je ne vais pas faire de stats, j'ai failli couler le cours)

---

### Conseils

1. À l'inverse du jeu de démo pour vous montrer comment tout marche, il est fortement déconseillé de laisser trainer la clé privée de votre jeu dans un code source bien visible.

2. Aussi, afin d’éviter le vol accidentel d’argent à la suite d’une transaction qui aurait échoué ou d’un crash du jeu, il est conseillé d’attendre la fin de la partie avant de prélever l’argent de la mise de départ ou d’attribuer une récompense. Cela dit, pour éviter que des joueurs jouent à plusieurs jeux en même temps, vous êtes autorisés, à la fin d’une partie, à refuser d’attribuer une récompense si le joueur, au moment du transfert, n’avait pas les fonds nécessaires pour couvrir une perte. Si cette consigne semble nébuleuse, vous pouvez poser vos questions sur Discord.

3. N'hésitez pas à poser des questions sur le Discord si vous ne comprenez pas ce que vous pouvez et ne pouvez pas faire!

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
