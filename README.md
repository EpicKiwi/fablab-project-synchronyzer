# Synchronyzer de projets FabLab

> Système de synchronisation des projets du FabLab Sur le blog [Ghost](https://ghost.org/) depuis une base de donnée SQlite


## Installation

### Docker

L'installation via Docker permet une isaolation de l'environnement et un déploiement plus facile.
Cette méthode est recommandée par rapport à l'installation manuel.

Clonez le repository

Construisez de l'image docker
```bash
docker build . -t epickiwi/fablab-sync
```

Démarrez du container avec les variable d'environnement de configuration
```bash
docker run -d --name fablab-sync -e GHOST_URL=http://ghost:2368 -e GHOST_ADMIN_API_KEY=asdfasdfasdf -e SYNC_PASSWORD=azerty -p 8080:8080 epickiwi/fdablab-sync
```

Les sources sont présentes dans le dossier `/sync` et les données sont dans `/sync/var` il faut monter ce dernier dossier vers la base de données SQlite.

### Installation Manuel

Le système nécéssite [NodeJS](https://nodejs.org/) et NPM.

Cloner le repository et installer les dépendances

```bash
npm install
```

[Définir une intégration](https://docs.ghost.org/api/admin/#token-authentication) dans l'interface de Ghost

Définir les variables d'environnement de configuration

```bash
GHOST_URL="http://localhost:2368"
GHOST_ADMIN_API_KEY="asdfasdfasdf"
SYNC_PASSWORD="azerty"
```

Démarrer le système
```bash
npm run start
```

Rendez vous sur l'interface Web (par défaut sur [http://localhost:8080](http://localhost:8080))

## Paramétrage

Le paramétrage de l'application s'éfféctue au travers des variables de l'environnement.
Les différentes variables d'environnement disponibles sont les suivantes :

* `GHOST_URL` : URL de l'instance d'administration de Ghost sans slash final **[REQUIS]**
* `GHOST_ADMIN_API_KEY` : La clé d'API admin de l'instance Ghost **[REQUIS]**
* `SYNC_PASSWORD` : Le mot de passe qui sera demandé lors de la demande de sychronisation **[REQUIS]**
* `DB_LOCATION` : Emplacement de la base de données SQlite **[Par défaut : `var/db.sqlite`]**
* `PICTURES_BASEPATH` : Emplacement du dossier contenant les images **[Par défaut : `var`]**
* `PORT` : Port d'écoute de l'application **[Par défaut : `8080`]**
* `BETWEEN_SYNC_TIME` : Temps minimum entre deux synchronisations (en ms) **[Par défaut : `7200` (2h)]**

## API

Le système dispose d'une API permettant de démarrer une synchronisation et de consulter son avancement

### Changement requis

```http request
GET /api/get-changes
```

Listing de l'ensemble des changement requis qui seront éfféctués surant la prochaine synchronisation

Exemple de réponse :
```json
{
  "add": {
    "posts": [
      "Battery Star"
    ],
    "tags": [
      "Projet Personnel",
      "Projet Innovation",
      "Nice",
      "Projet #1"
    ]
  }
}
```

### Synchronisation

```http request
GET /api/sync
Authorization: [mot de passe base64]
```

Démarre une synchronisation et erenvoie l'état actuel de cette synchronisation.
Cette action nécéssite un mot de passe en base 64 dans le header `Authorization` pour être utilisé.

Exemple de réponse:
```json
{
  "startedDate": "2019-07-07T18:48:16.115Z",
  "state": "synchronizing",
  "syncError": null,
  "started": true
}
```

### Progression de synchronisation

```http request
GET /api/progression
```

Renvoie la progression de la dernière synchronisation.
L'état d'une synchronisation peut être :

* `synchronizing` : La synchronisation est en cours
* `ended` : La synchronisation est terminée
* `error` : La synchronisation à rencontré une érreur dont les message est dans `syncError`

Le temps requis avant la prochaine synchronisation est donné dans `mustWait`.

Exemple de réponse :
```json
{
  "startedDate": "2019-07-07T18:48:16.115Z",
  "state": "ended",
  "syncError": null,
  "mustWait": 0
}
```

## Documentation de référence

Une documentation du code à l'échelle de la fonction est disponible et inclue sous forme de [JSDoc](https://jsdoc.app/). Il est possible de générer une documentaiton web avec la commande suivante :
```bash
npm run doc
```

La documentation est générée dans le dossier `doc`.

## Modèles de présentation

Il existe deux modèles utilisés pour la syncronisation. Ces modèles utilisent le modèle de moteur de template [Handlebars](https://handlebarsjs.com/).

### Modèles de post

Le modèle de post est le modèle permettant de créer la présentation d'un article sur la base d'un post. Il se situe dans le fichier `post-template.hbs`.

Les données utilisables dans ce modèle sont les suivantes :
```json
{
  "id": 1,
  "type": { 
        "id": 1,
        "acronym": "AZ",
        "name": "Azerty",
    },
  "name": "azerty",
  "centre_id": 1,
  "centre": {
        "id": 1,
        "region": "SE",
        "name": "Lyon",
    },
  "short_description": "azertyazerty",
  "huge_description": "azertyuiopqsdfghjklmwxcvbvn",
  "documentation": "http://localhost:8080/doc",
  "creation_date": Date,
  "end_date": Date,
  "picture": "df/er/fr.png",
}
```

### Modèle de page

Le modèle de page représente la page HTML envoyée lors de la l'arrivée d'une requète à la racine du serveur. Ce modèle est disponible dans le fichier `index.hbs`.

Les données utilisables dans ce modèle sont les suivantes :
```json
{
  "changes": {
               "add": {
                 "posts": [
                   {
                     "id": 1,
                     "name": "azerty",
                     "centre_id": 1,                     "short_description": "azertyazerty",
                     "huge_description": "azertyuiopqsdfghjklmwxcvbvn",
                     "documentation": "http://localhost:8080/doc",
                     "creation_date": Date,
                     "end_date": Date,
                     "picture": "df/er/fr.png",
                   }
                 ],
                 "tags": [
                   "Projet Personnel",
                   "Projet Innovation",
                   "Nice",
                   "Projet #1"
                 ]
               }
             },
  "cantSync": true,
  "lastSync": Date,
  "relativeLastSync": "il y a 2 minutes",
  "mustWait": 1762
}
```

* `mustwait` : est le temps (en ms) nécéssaire d'attendre avant la prochaine syncronisation
* `cantSync` : est à true si il est impossible de syncroniser