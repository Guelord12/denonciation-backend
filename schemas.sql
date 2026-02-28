-- ============================================================
-- BASE DE DONNÉES : denonciation_app
-- ============================================================

-- TABLE : utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs(
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE NOT NULL,
    sexe VARCHAR(20) NOT NULL, -- Homme, Femme, Autre
    avatar_choisi VARCHAR(50) DEFAULT 'default', -- homme, femme, autre, custom
    avatar_url TEXT, -- si l'utilisateur upload une image personnalisée
    ville VARCHAR(100),
    pays VARCHAR(100) NOT NULL,
    nationalite VARCHAR(100) DEFAULT 'Congolaise',
    telephone VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    langue_preferee VARCHAR(50) DEFAULT 'français',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dernier_acces TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(20) DEFAULT 'user',
    accepted_terms BOOLEAN DEFAULT FALSE,
    terms_accepted_at TIMESTAMP
);

-- TABLE : categories_abus (complète avec toutes les catégories)
CREATE TABLE IF NOT EXISTS categories_abus(
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name JSONB NOT NULL,
    icon VARCHAR(100),
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLE : signalements
CREATE TABLE IF NOT EXISTS signalements(
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE,
    categorie_id INTEGER REFERENCES categories_abus(id) ON DELETE SET NULL,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    date_signalement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    ville VARCHAR(100),
    statut VARCHAR(50) DEFAULT 'en_attente',
    preuve_image TEXT,
    preuve_video TEXT,
    preuve_document TEXT,
    preuve_audio TEXT,
    preuve_type VARCHAR(20),
    is_valid BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    analyse_ia JSONB,
    partageable BOOLEAN DEFAULT TRUE,
    live_stream_url TEXT,
    is_live BOOLEAN DEFAULT FALSE,
    urgency_level VARCHAR(20) DEFAULT 'medium',
    views_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0
);

-- TABLE : commentaires
CREATE TABLE IF NOT EXISTS commentaires(
    id SERIAL PRIMARY KEY,
    signalement_id INTEGER REFERENCES signalements(id) ON DELETE CASCADE,
    utilisateur_id INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE,
    contenu TEXT NOT NULL,
    date_commentaire TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    media_image TEXT,
    media_video TEXT,
    media_document TEXT,
    media_audio TEXT,
    is_valid BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    analyse_ia JSONB,
    parent_id INTEGER REFERENCES commentaires(id) ON DELETE CASCADE
);

-- TABLE : pays (pour la liste déroulante)
CREATE TABLE IF NOT EXISTS pays(
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(2) UNIQUE NOT NULL,
    indicatif VARCHAR(10) NOT NULL,
    flag TEXT
);

-- TABLE : villes (optionnel, mais peut être rempli avec les grandes villes)
CREATE TABLE IF NOT EXISTS villes(
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    pays_id INTEGER REFERENCES pays(id) ON DELETE CASCADE,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8)
);

-- TABLE : likes
CREATE TABLE IF NOT EXISTS likes(
    id SERIAL PRIMARY KEY,
    signalement_id INTEGER REFERENCES signalements(id) ON DELETE CASCADE,
    utilisateur_id INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE,
    date_like TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(signalement_id, utilisateur_id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_signalements_utilisateur ON signalements(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_signalements_categorie ON signalements(categorie_id);
CREATE INDEX IF NOT EXISTS idx_signalements_date ON signalements(date_signalement);
CREATE INDEX IF NOT EXISTS idx_signalements_ville ON signalements(ville);
CREATE INDEX IF NOT EXISTS idx_commentaires_signalement ON commentaires(signalement_id);
CREATE INDEX IF NOT EXISTS idx_notifications_utilisateur ON notifications(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_actualites_categorie ON actualites(categorie);
CREATE INDEX IF NOT EXISTS idx_actualites_date ON actualites(date_publication);
CREATE INDEX IF NOT EXISTS idx_likes_signalement ON likes(signalement_id);
CREATE INDEX IF NOT EXISTS idx_likes_utilisateur ON likes(utilisateur_id);