# Scripts de l'application SAMI

Ce dossier contient des scripts utilitaires pour l'application SAMI.

## Script de Simulation de Réveil

Le script `simulateWakeup.ts` permet de simuler l'algorithme de réveil de l'application SAMI. Il ajoute des rendez-vous de test à Firestore et exécute l'algorithme comme s'il était 6h30 du matin.

### Fonctionnalités

- Ajoute des rendez-vous de test à Firestore
- Exécute l'algorithme de réveil (checkWakeupList)
- Envoie une notification au groupe de professionnels
- Génère des logs détaillés

### Utilisation

#### Exécution standard

```bash
npm run simulate:wakeup
```

#### Exécution en mode CI (continue integration)

```bash
npm run simulate:wakeup:ci
```

#### Exécution en mode debug

```bash
npm run simulate:wakeup:debug
```

### Configuration

Le script peut être configuré via des variables d'environnement :

- `LOG_PATH` : Chemin vers le dossier de logs (par défaut: `logs`)
- `CI` : Mode CI, si défini à `true`, le processus se terminera avec un code d'erreur en cas d'échec
- `DEBUG` : Mode debug, active des logs plus verbeux

### Logs

Les logs sont écrits à la fois dans la console et dans un fichier de log. Le fichier de log est créé dans le dossier spécifié par `LOG_PATH` avec un nom basé sur la date courante.

### Intégration avec CI/CD

Pour intégrer ce script dans un pipeline CI/CD, vous pouvez utiliser la commande suivante :

```yaml
# Exemple pour GitHub Actions
- name: Test Wakeup Algorithm
  run: npm run simulate:wakeup:ci
```

### Résolution des problèmes

Si vous ne voyez pas de sortie console lors de l'exécution du script, vérifiez le fichier de log généré dans le dossier `logs`. 