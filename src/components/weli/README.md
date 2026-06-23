# Weli

Architecture du compagnon IA `Weli` pour Welix.

Objectif :
- faire de Weli le copilote différenciant de Welix
- séparer l'interface, la logique, la mémoire et le contexte
- préparer une intégration IA plus puissante sans refonte de l'application

Composants principaux :
- `WeliProvider.tsx` : source de vérité de l'état, du contexte, de la mémoire et des interactions
- `WeliContext.tsx` : contrat partagé entre les sous-composants
- `WeliAvatar.tsx` : rendu visuel du robot et micro-mouvements
- `WeliAnimation.tsx` : effets contextuels légers, comme les étincelles de succès
- `WeliBubble.tsx` : aide discrète et contextuelle
- `WeliChat.tsx` : panneau de copilote avec expertise, suggestions, actions et mémoire contrôlée

Couche logique :
- `src/lib/weli/page-context.ts` : contexte métier selon la page
- `src/lib/weli/copilot.ts` : logique de réponse et d'orientation
- `src/lib/weli/memory.ts` : mémoire locale contrôlable par l'utilisateur
- `src/lib/weli/persona.ts` : identité et principes fondateurs
- `src/lib/weli/types.ts` : contrats de données Weli

Principes :
- état centralisé dans le provider
- composants découplés et réutilisables
- mémoire maîtrisée, consultable et effaçable
- réponses utiles, brèves et orientées action
- base prête pour brancher des outils et modèles IA plus avancés
