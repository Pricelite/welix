# Welix - Checklist de mise en production

## 1. Environnement

- Renseigner `NEXT_PUBLIC_APP_URL`
- Renseigner `NEXT_PUBLIC_SUPABASE_URL`
- Renseigner `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Renseigner `SUPABASE_SERVICE_ROLE_KEY`
- Renseigner `STRIPE_SECRET_KEY`
- Renseigner `STRIPE_WEBHOOK_SECRET`
- Renseigner `STRIPE_PRICE_ID_PRO`
- Renseigner `STRIPE_PRICE_ID_STARTER` si plan starter actif
- Renseigner `OPENAI_API_KEY`
- Vérifier `OPENAI_MODEL`

## 2. Supabase

- Appliquer toutes les migrations
- Vérifier les policies RLS sur `profiles`, `subscriptions`, `clients`, `quotes`, `invoices`
- Tester avec deux comptes différents qu'aucune donnée ne fuite
- Vérifier les index et la volumétrie réelle

## 3. Stripe

- Créer les produits et prix définitifs
- Configurer le webhook Stripe vers `/api/stripe/webhook`
- Tester:
  - checkout
  - upgrade
  - downgrade
  - résiliation
  - reprise
  - portail client
- Vérifier la synchronisation `subscriptions` et `profiles.stripe_customer_id`

## 4. IA

- Vérifier plusieurs prompts réels par métier
- Contrôler que l'IA n'injecte jamais de prix
- Vérifier les fallbacks sans clé OpenAI

## 5. PDF

- Générer plusieurs devis réels
- Vérifier accents, montants, coordonnées et lisibilité
- Contrôler l'impression A4

## 6. Sécurité

- Vérifier la CSP en production
- Vérifier que les entrées HTML sont nettoyées
- Vérifier les erreurs 401, 403, 404 et 500 sur les routes sensibles
- Vérifier la rotation des secrets

## 7. Vérifications finales

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test:unit`
- `pnpm test:e2e`
- `pnpm build`
