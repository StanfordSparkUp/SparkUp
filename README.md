# SparkUp 🔥🌊

## ¿Qué es SparkUp?

SparkUp es una plataforma que conecta personas para formar equipos de trabajo basándose en compatibilidad de personalidades e intereses, no solo en habilidades técnicas. Usa IA para analizar perfiles y sugerir colaboraciones prometedoras.

### Tipos de Usuarios
- **🔥 Captain**: Personas con ideas que buscan formar un equipo
- **🌊 Sailor**: Personas que quieren unirse a proyectos inspiradores

## 🚀 ¡Tu sistema ya está funcionando!

### Lo que ya tienes implementado:

1. **✅ Guardado de datos**: Los formularios guardan toda la información en localStorage
2. **✅ Integración con LLM**: Sistema completo para enviar datos a OpenAI, Claude, o cualquier LLM
3. **✅ Análisis inteligente**: El LLM analiza compatibilidad, genera perfiles y sugiere matches
4. **✅ UI mejorada**: Página de confirmación que muestra resultados del análisis
5. **✅ Debug tools**: Panel para ver todos los datos guardados

## 🔧 Cómo configurar la integración con LLM

### Opción 1: OpenAI (Recomendado)
1. Ve a [OpenAI API](https://platform.openai.com/api-keys)
2. Crea una API key
3. Abre `llm-integration.js`
4. Encuentra la línea `const API_KEY = 'tu-api-key-aqui';`
5. Reemplaza `'tu-api-key-aqui'` con tu API key real
6. (Opcional) Cambia `const PROVIDER = 'openai';` si quieres usar otro proveedor

### Opción 2: Claude (Anthropic)
```javascript
const API_KEY = 'tu-claude-api-key';
const PROVIDER = 'claude';
```

### Opción 3: Ollama (Local, Gratis)
1. Instala [Ollama](https://ollama.ai/)
2. Ejecuta `ollama run llama2` en tu terminal
3. Configura:
```javascript
const API_KEY = 'not-needed-for-local';
const PROVIDER = 'local';
```

## 🌐 Cómo ver tu página en vivo

### Usando Live Server (Recomendado):
1. Instala la extensión "Live Server" en VS Code
2. Haz clic derecho en `index.html`
3. Selecciona "Open with Live Server"
4. Se abrirá en `http://127.0.0.1:5500/`

### Usando Python:
```bash
cd "/Users/osky/Documents/Mis Documentos/SparkUp"
python3 -m http.server 5500
```

## 📊 Cómo funciona el sistema

### 1. Flujo de Usuario
```
index.html → page-rol.html → captain/sailor-form.html → confirmation.html
```

### 2. Procesamiento de Datos
1. Usuario llena formulario
2. Datos se guardan en localStorage
3. Se envían al LLM para análisis
4. LLM genera:
   - Score de compatibilidad
   - Matches con otros usuarios
   - Perfil personalizado
   - Recomendaciones de mejora
   - Insights de personalidad

### 3. Datos que se guardan
- `sparkup_user_data`: Datos del usuario actual
- `sparkup_all_users`: Array de todos los usuarios registrados
- `sparkup_llm_response`: Respuesta completa del LLM

## 🛠️ Estructura de archivos

```
SparkUp/
├── index.html              # Página principal
├── page-rol.html           # Selección Captain/Sailor  
├── captain-form.html       # Formulario para Captains
├── sailor-form.html        # Formulario para Sailors
├── confirmation.html       # Resultados del análisis
├── llm-integration.js      # 🆕 Sistema de LLM
├── styles.css              # Estilos página principal
├── styles-rol.css          # Estilos selección de rol
├── styles-form.css         # Estilos formularios
├── styles-confirmation.css # 🆕 Estilos con resultados LLM
└── media/
    ├── background.mp4      # Video de fondo
    └── sparkup_logo.png    # Logo
```

## 🧪 Cómo probar el sistema

### 1. Sin LLM (Modo simulación)
- No pongas API key real
- El sistema usará respuestas simuladas
- Perfecto para desarrollar y probar la UI

### 2. Con LLM real
- Configura tu API key
- Registra varios usuarios diferentes
- Ve cómo el LLM encuentra matches reales

### 3. Debug Mode
- En la página de confirmación, haz clic en "Debug Data"
- Ve todos los datos guardados y respuestas del LLM

## 💡 Próximos pasos recomendados

### Para mejorar el producto:
1. **Base de datos real**: Migrar de localStorage a una base de datos
2. **Backend**: Crear API REST para manejar usuarios y matches
3. **Autenticación**: Sistema de login/registro
4. **Chat**: Permitir que los matches se comuniquen
5. **Notificaciones**: Email cuando hay nuevos matches

### Para mejorar el LLM:
1. **Prompts más específicos**: Afinar el prompt según el tipo de proyecto
2. **Vector embeddings**: Usar embeddings para matching más preciso
3. **Feedback loop**: Permitir que usuarios califiquen matches para mejorar el algoritmo

## 🐛 Solución de problemas

### El LLM no responde:
- Verifica que tu API key sea correcta
- Revisa la consola del navegador (F12) para errores
- Asegúrate de tener créditos en tu cuenta de OpenAI/Claude

### Los datos no se guardan:
- Verifica que estés usando HTTPS o localhost
- Algunos navegadores bloquean localStorage en file://

### La página no se actualiza:
- Usa un servidor local (Live Server)
- No abras los archivos directamente (file://)

## 🎯 Tips para mejores matches

### Para Captains:
- Describe tu idea con pasión pero también sé específico
- Menciona qué habilidades necesitas vs. qué puedes aportar
- Habla de la visión y el impacto que quieres crear

### Para Sailors:
- Sé específico sobre qué te motiva e inspira
- Menciona tanto hard skills como soft skills
- Describe el tipo de ambiente de trabajo que prefieres

---

¡Tu plataforma ya está lista para conectar a las personas correctas! 🚀✨