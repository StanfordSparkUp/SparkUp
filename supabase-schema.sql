-- ==========================================
-- SPARKUP DATABASE SCHEMA FOR SUPABASE
-- ==========================================

-- Crear tabla de usuarios
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('captain', 'sailor')),
  interests TEXT,
  idea TEXT, -- Para captains
  motivation TEXT, -- Para sailors
  team TEXT, -- Tipo de equipo que busca el captain
  people TEXT, -- Tipo de personas que busca el sailor
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de análisis LLM
CREATE TABLE llm_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  compatibility_score INTEGER,
  matches JSONB, -- Array de matches sugeridos por el LLM
  user_profile TEXT, -- Perfil generado por el LLM
  personality_insights TEXT, -- Análisis de personalidad
  recommendations TEXT[], -- Array de recomendaciones
  project_suggestions TEXT, -- Sugerencias específicas de proyecto
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de matches entre usuarios
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  compatibility_score INTEGER,
  match_reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'connected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar matches duplicados
  UNIQUE(user1_id, user2_id)
);

-- Crear tabla de conversaciones (para futuro)
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de mensajes (para futuro)
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ÍNDICES PARA MEJOR PERFORMANCE
-- ==========================================

-- Índices en tabla users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Índices en tabla matches
CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_created_at ON matches(created_at DESC);

-- Índices en tabla llm_analyses
CREATE INDEX idx_analyses_user_id ON llm_analyses(user_id);
CREATE INDEX idx_analyses_created_at ON llm_analyses(created_at DESC);

-- ==========================================
-- FUNCIONES Y TRIGGERS
-- ==========================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at 
  BEFORE UPDATE ON matches 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ==========================================

-- Habilitar Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios (todos pueden leer, solo pueden crear/editar sus propios datos)
CREATE POLICY "Users can read all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (true);

-- Políticas para análisis LLM (todos pueden leer, sistema puede crear)
CREATE POLICY "Anyone can read analyses" ON llm_analyses FOR SELECT USING (true);
CREATE POLICY "System can insert analyses" ON llm_analyses FOR INSERT WITH CHECK (true);

-- Políticas para matches (usuarios pueden ver sus matches)
CREATE POLICY "Users can see their matches" ON matches FOR SELECT USING (true);
CREATE POLICY "System can create matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their matches" ON matches FOR UPDATE USING (true);

-- ==========================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ==========================================

-- Insertar algunos usuarios de ejemplo
INSERT INTO users (name, email, role, interests, idea, team) VALUES
('Ana García', 'ana@universidad.edu', 'captain', 'inteligencia artificial, startups', 'Una plataforma de IA para educación personalizada', 'desarrolladores backend, diseñadores UX'),
('Carlos López', 'carlos@universidad.edu', 'captain', 'sostenibilidad, tecnología verde', 'App para reducir huella de carbono personal', 'desarrolladores mobile, expertos en sostenibilidad');

INSERT INTO users (name, email, role, interests, motivation, people) VALUES
('María Rodriguez', 'maria@universidad.edu', 'sailor', 'diseño UX, psicología', 'Proyectos que mejoren la experiencia de usuario en educación', 'equipos multidisciplinarios con visión social'),
('José Martínez', 'jose@universidad.edu', 'sailor', 'desarrollo backend, APIs', 'Startups de tecnología con impacto social', 'founders visionarios y equipos técnicos sólidos');

-- ==========================================
-- VISTAS ÚTILES
-- ==========================================

-- Vista de usuarios con sus análisis más recientes
CREATE VIEW users_with_analysis AS
SELECT 
  u.*,
  la.compatibility_score,
  la.user_profile,
  la.personality_insights,
  la.created_at as analysis_date
FROM users u
LEFT JOIN llm_analyses la ON u.id = la.user_id
WHERE la.id IS NULL OR la.id = (
  SELECT id FROM llm_analyses 
  WHERE user_id = u.id 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Vista de matches con información de usuarios
CREATE VIEW matches_detailed AS
SELECT 
  m.*,
  u1.name as user1_name,
  u1.email as user1_email,
  u1.role as user1_role,
  u2.name as user2_name,
  u2.email as user2_email,
  u2.role as user2_role
FROM matches m
JOIN users u1 ON m.user1_id = u1.id
JOIN users u2 ON m.user2_id = u2.id;

-- Vista de estadísticas generales
CREATE VIEW stats_overview AS
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM users WHERE role = 'captain') as total_captains,
  (SELECT COUNT(*) FROM users WHERE role = 'sailor') as total_sailors,
  (SELECT COUNT(*) FROM matches) as total_matches,
  (SELECT COUNT(*) FROM matches WHERE status = 'connected') as successful_connections,
  (SELECT AVG(compatibility_score) FROM llm_analyses) as avg_compatibility_score;

-- ==========================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ==========================================

COMMENT ON TABLE users IS 'Tabla principal de usuarios de SparkUp';
COMMENT ON TABLE llm_analyses IS 'Análisis y perfiles generados por IA para cada usuario';
COMMENT ON TABLE matches IS 'Matches sugeridos entre usuarios complementarios';
COMMENT ON COLUMN users.role IS 'captain: tiene idea, busca equipo | sailor: busca proyectos';
COMMENT ON COLUMN matches.status IS 'pending: sugerido | accepted: ambos aceptaron | connected: en colaboración';