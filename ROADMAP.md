# Roadmap — Autoline24

Généré le 2026-05-24 à partir de l'audit complet du projet.
Aucun fichier n'est modifié avant validation explicite de chaque phase.

---

## Légende

| Icône | Priorité |
|-------|----------|
| 🔴 | Critique — sécurité / bug bloquant |
| 🟠 | Important — à traiter rapidement |
| 🟢 | Amélioration — nice-to-have |
| ✅ | Terminé |
| 🔲 | À faire |

---

## Phase 1 — Sécurité (🔴 Critique)

> Aucune de ces corrections ne peut attendre. Elles concernent l'authentification,
> les données sensibles et la surface d'attaque de l'API.

| # | Statut | Priorité | Sujet | Fichier(s) |
|---|--------|----------|-------|------------|
| C1 | 🔲 | 🔴 | Tokens d'auth en `localStorage` → migrer vers cookies `httpOnly + Secure + SameSite=Strict` (Sanctum SPA mode) | `frontend/src/contexts/AuthContext.jsx:6,62` · `frontend/src/services/api.js:12` |
| C2 | 🔲 | 🔴 | Aucune vérification de rôle sur les routes admin — ajouter middleware `EnsureIsAdmin` | Tous les controllers `app/Http/Controllers/Api/` |
| C3 | 🔲 | 🔴 | Mot de passe SMTP stocké en clair en BDD — chiffrer avec `Crypt::encryptString()` | `app/Http/Controllers/Api/AppSettingController.php` (méthode `updateMail`) |
| C4 | 🔲 | 🔴 | CORS trop permissif (`allowed_methods: ['*']`, `allowed_headers: ['*']`) — restreindre aux méthodes et headers nécessaires | `backend/config/cors.php:7,16` |
| C5 | 🔲 | 🔴 | Pas de rate limiting sur `/admin/login`, `/admin/recover`, `/contact` — ajouter `throttle:5,1` | `backend/routes/api.php` |

---

## Phase 2 — Bugs & Performance (🟠 Important)

> Problèmes qui n'empêchent pas l'usage quotidien mais qui peuvent causer
> des pannes ou des données incorrectes à mesure que le stock grandit.

| # | Statut | Priorité | Sujet | Fichier(s) |
|---|--------|----------|-------|------------|
| I1 | 🔲 | 🟠 | N+1 queries + absence de pagination sur le listing admin (tous les véhicules chargés d'un coup) | `app/Http/Controllers/Api/CarController.php:11-17` |
| I2 | 🔲 | 🟠 | Index manquants sur colonnes filtrées : `publication_status`, `status`, `brand`, `fuel_type`, `year` | Migrations `backend/database/migrations/` |
| I3 | 🔲 | 🟠 | Race condition sur la définition de l'image principale — wrapper dans `DB::transaction()` | `app/Http/Controllers/Api/CarImageController.php:38-39` |
| I4 | 🔲 | 🟠 | Envoi de mail sans `try/catch` — retourne 500 générique si SMTP injoignable | `app/Http/Controllers/Api/ContactController.php:38` |
| I5 | 🔲 | 🟠 | Calculs financiers (`total_investment`, `estimated_margin`) non protégés contre les valeurs `null` | `app/Models/Car.php` (accesseurs) |
| I6 | 🔲 | 🟠 | Logique `applyMailSettings()` dupliquée dans deux controllers — extraire dans un `AppSettingService` | `AuthController` · `ContactController` |
| I7 | 🔲 | 🟠 | Upload images sans limite de dimensions — ajouter `dimensions:max_width=5000,max_height=5000` | `app/Http/Controllers/Api/CarImageController.php:28` |

---

## Phase 3 — Tests

> L'infrastructure de test existe côté backend. L'objectif est de couvrir
> les parties critiques non testées.

### Tests backend manquants (priorité haute)

| # | Statut | Sujet |
|---|--------|-------|
| T1 | 🔲 | `CarController` — CRUD voitures (create, update, delete, show) |
| T2 | 🔲 | `CarController::publicIndex` — filtres publics (brand, fuel_type, price range, pagination) |
| T3 | 🔲 | `CarImageController` — upload (MIME valide/invalide, taille limite), set main, suppression |
| T4 | 🔲 | `ContactController` — envoi mail valide, SMTP KO, validation des champs |
| T5 | 🔲 | Rate limiting — vérifier que `throttle:5,1` bloque à la 6e tentative |
| T6 | 🔲 | Rôle admin — vérifier qu'un user sans rôle `admin` reçoit 403 sur les routes admin |

### Tests frontend manquants (priorité basse)

| # | Statut | Sujet |
|---|--------|-------|
| T7 | 🔲 | `AuthContext` — login, logout, persistence du token |
| T8 | 🔲 | `CarCard` — affichage conditionnel (image manquante, statut vendu/réservé) |
| T9 | 🔲 | `FilterBar` — application des filtres, reset |

---

## Phase 4 — Qualité du code (🟢 Améliorations)

| # | Statut | Priorité | Sujet | Fichier(s) |
|---|--------|----------|-------|------------|
| A1 | 🔲 | 🟢 | Supprimer le modèle mort `CarOption` (jamais utilisé) | `app/Models/CarOption.php` |
| A2 | 🔲 | 🟢 | Remplacer `optional($x)->format()` par `$x?->format() ?? ''` (PHP 8) | `app/Http/Controllers/Api/ExportController.php:80` |
| A3 | 🔲 | 🟢 | Ajouter un logger centralisé côté frontend (Sentry ou équivalent) — remplacer les `console.error` bruts | Pages admin (`AdminCarFormPage`, `ContactPage`, etc.) |
| A4 | 🔲 | 🟢 | Ajouter les types de retour PHP explicites (`JsonResponse`) sur les méthodes de controllers | Tous les controllers |

---

## Phase 5 — SEO & Visibilité

> Objectif : être trouvable sur Google pour les requêtes locales (voitures d'occasion
> Belgique, marque + modèle + ville) et améliorer le taux de clic via les rich results.

### État actuel

| Page | `<title>` | `<meta description>` | Open Graph | JSON-LD Schema.org | Canonical |
|------|-----------|----------------------|------------|--------------------|-----------|
| HomePage | Défaut `index.html` | ❌ | ❌ | ❌ | ❌ |
| CarsPage | ✅ | ✅ | ✅ | ✅ `AutoDealer` | ✅ |
| CarDetailPage | ✅ | ✅ | ✅ | ✅ `Car + Offer` | ✅ |
| ContactPage | ? | ? | ? | ? | ? |

### 5.1 — Balises meta manquantes (🔴 Critique SEO)

| # | Statut | Sujet | Fichier(s) |
|---|--------|-------|------------|
| S1 | 🔲 | Ajouter `<Helmet>` sur `HomePage` : title, meta description, OG tags, JSON-LD `AutoDealer` | `frontend/src/pages/HomePage.jsx` |
| S2 | 🔲 | Ajouter `<Helmet>` sur `ContactPage` : title, meta description, canonical | `frontend/src/pages/ContactPage.jsx` |
| S3 | 🔲 | Ajouter `<meta name="description">` et OG tags dans `index.html` comme fallback SSR/partage direct | `frontend/index.html` |

### 5.2 — Données structurées (🟠 Important)

| # | Statut | Sujet | Détail |
|---|--------|-------|--------|
| S4 | 🔲 | Enrichir le JSON-LD `Car` avec `bodyType`, `seatingCapacity`, `numberOfDoors`, `driveWheelConfiguration` | `CarDetailPage.jsx:107-129` — les champs existent dans le modèle mais ne sont pas tous inclus |
| S5 | 🔲 | Ajouter JSON-LD `BreadcrumbList` sur `CarDetailPage` (Accueil > Voitures > [Marque Modèle]) | `CarDetailPage.jsx` |
| S6 | 🔲 | Ajouter JSON-LD `Organization` + `WebSite` (avec `SearchAction`) sur le layout global | `frontend/src/App.jsx` ou layout racine |
| S7 | 🔲 | Ajouter `LocalBusiness` avec `openingHours`, `geo` (latitude/longitude), `priceRange` sur `CarsPage` ou layout global | Dépend des données `AppSetting` |

### 5.3 — Sitemap & indexation (🟠 Important)

| # | Statut | Sujet | Détail |
|---|--------|-------|--------|
| S8 | 🔲 | Générer un `sitemap.xml` dynamique côté backend — une entrée par voiture publiée + pages statiques | Nouvelle route `GET /sitemap.xml` dans `routes/web.php` |
| S9 | 🔲 | Créer `robots.txt` — autoriser Google, bloquer `/admin/*`, pointer vers le sitemap | `backend/public/robots.txt` |
| S10 | 🔲 | Soumettre le sitemap à Google Search Console et Bing Webmaster Tools | Action manuelle (hors code) |

### 5.4 — Performance & Core Web Vitals (🟠 Important)

> Google intègre les CWV dans son algorithme de classement.

| # | Statut | Sujet | Détail |
|---|--------|-------|--------|
| S11 | 🔲 | Lazy-loading des images avec `loading="lazy"` sur les thumbnails et `CarCard` | `CarCard.jsx` · `CarDetailPage.jsx:197` |
| S12 | 🔲 | Ajouter `width` et `height` explicites sur les `<img>` pour éviter le Cumulative Layout Shift (CLS) | `CarCard.jsx` · `CarDetailPage.jsx` |
| S13 | 🔲 | Passer les images en format `WebP` à la conversion côté backend (ou à l'upload) | `app/Http/Controllers/Api/CarImageController.php` |
| S14 | 🔲 | Ajouter `fetchpriority="high"` sur l'image principale de `CarDetailPage` (LCP) | `CarDetailPage.jsx:169` |
| S15 | 🔲 | Précharger la police Inter (`<link rel="preload">`) dans `index.html` pour réduire le FOIT | `frontend/index.html` |

### 5.5 — Prerendering / SSR (🟢 Nice-to-have)

> L'app est une SPA React pure. Googlebot crawle le JavaScript, mais
> d'autres bots (réseaux sociaux, partage WhatsApp) ne l'exécutent pas.
> Les balises OG ne seront pas lues sans rendu serveur.

| # | Statut | Sujet | Détail |
|---|--------|-------|--------|
| S16 | 🔲 | Évaluer `vite-plugin-ssr` ou migration vers **Remix / Next.js** pour le SSR des pages publiques | Décision architecturale — à peser selon le volume de trafic attendu |
| S17 | 🔲 | Alternative légère : prerendering statique avec `vite-plugin-prerender` pour les pages fixes (Home, Cars, Contact) | Fonctionne pour les pages sans contenu dynamique par route |

### 5.6 — Contenu & maillage interne (🟢 Améliorations)

| # | Statut | Sujet | Détail |
|---|--------|-------|--------|
| S18 | 🔲 | Ajouter un attribut `alt` descriptif sur les images : `"[Marque] [Modèle] [Année] — photo [N]"` au lieu de `"[Marque] [Modèle]"` | `CarDetailPage.jsx:171,198` |
| S19 | 🔲 | Ajouter des liens internes contextuels : depuis la homepage vers des filtres précis (ex. "Voir les diesels") | `HomePage.jsx` |
| S20 | 🔲 | Ajouter une balise `<meta name="robots" content="noindex">` sur les pages admin et les pages avec filtres actifs (éviter le duplicate content) | Pages admin · `CarsPage.jsx` quand `searchParams` non vide |
| S21 | 🔲 | Vérifier que les URLs de voitures vendues retournent `410 Gone` côté backend (au lieu de 200 avec statut "sold") | `app/Http/Controllers/Api/CarController.php` méthode `show` |

---

## Récapitulatif global

| Phase | Nb d'items | Priorité dominante |
|-------|------------|-------------------|
| 1 — Sécurité | 5 | 🔴 Critique |
| 2 — Bugs & Performance | 7 | 🟠 Important |
| 3 — Tests | 9 | 🟠 / 🟢 |
| 4 — Qualité du code | 4 | 🟢 |
| 5 — SEO & Visibilité | 21 | 🔴 à 🟢 |

**Ordre d'exécution recommandé :** Phase 1 → Phase 2 → Phase 5.1 + 5.3 (sitemap/robots.txt) → Phase 5.2 → Phase 3 → Phase 4 → Phase 5.4 + 5.5 + 5.6
