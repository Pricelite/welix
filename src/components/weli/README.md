# Weli

Architecture du compagnon IA `Weli` pour Welix.

Composants principaux :
- `WeliProvider.tsx` : source de vérité de l'état, du contexte page et des interactions.
- `WeliContext.tsx` : contrat partagé entre les sous-composants.
- `WeliAvatar.tsx` : rendu visuel du robot et micro-mouvements.
- `WeliAnimation.tsx` : effets contextuels légers, comme les étincelles de succès.
- `WeliBubble.tsx` : aide discrète et contextuelle.
- `WeliChat.tsx` : panneau de discussion premium inspiré d'une interface assistant moderne.

Principes :
- état centralisé dans le provider
- composants découplés et réutilisables
- intégration OpenAI possible plus tard via `sendMessage`
- pas de dépendance à une bibliothèque de chatbot

