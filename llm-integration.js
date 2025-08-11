// ==========================================
// SPARKUP - LLM Integration
// ==========================================
// Este archivo contiene funciones para integrar con diferentes LLMs

class LLMIntegration {
  constructor(apiKey, provider = 'openai') {
    this.apiKey = apiKey;
    this.provider = provider;
    this.baseURL = this.getBaseURL(provider);
  }

  getBaseURL(provider) {
    const urls = {
      'openai': 'https://api.openai.com/v1',
      'claude': 'https://api.anthropic.com/v1',
      'gemini': 'https://generativelanguage.googleapis.com/v1beta',
      'local': 'http://localhost:11434/v1' // Para Ollama local
    };
    return urls[provider] || urls['openai'];
  }

  // Función principal para procesar datos de usuario con LLM
  async processUserData(userData, allUsers = []) {
    const prompt = this.buildPrompt(userData, allUsers);
    
    try {
      const response = await this.callLLM(prompt);
      const analysis = this.parseResponse(response);
      
      // Guardar respuesta en localStorage
      localStorage.setItem('sparkup_llm_response', JSON.stringify(analysis));
      
      return analysis;
    } catch (error) {
      console.error('Error calling LLM:', error);
      
      // Fallback con respuesta simulada
      return this.generateFallbackResponse(userData, allUsers);
    }
  }

  // Construir prompt optimizado para análisis de usuarios
  buildPrompt(userData, allUsers) {
    const recentUsers = allUsers.slice(-10); // Solo últimos 10 usuarios
    
    return `
Actúa como un experto matchmaker de equipos de trabajo y colaboración. Analiza este nuevo perfil de usuario de SparkUp:

NUEVO USUARIO:
- Nombre: ${userData.name}
- Rol: ${userData.role === 'captain' ? 'Captain (tiene una idea, busca equipo)' : 'Sailor (quiere unirse a proyectos)'}
- Email: ${userData.email}
- Intereses personales: ${userData.interests}
- ${userData.role === 'captain' ? 'Descripción de su idea' : 'Tipo de proyecto que busca'}: ${userData.idea || userData.motivation}
- ${userData.role === 'captain' ? 'Tipo de equipo que busca' : 'Tipo de colaboradores deseados'}: ${userData.team || userData.people}

USUARIOS EXISTENTES EN LA PLATAFORMA:
${recentUsers.length > 0 ? recentUsers.map((user, index) => `
${index + 1}. ${user.name} (${user.role})
   - Intereses: ${user.interests}
   - ${user.role === 'captain' ? 'Idea' : 'Busca'}: ${user.idea || user.motivation}
   - ${user.role === 'captain' ? 'Equipo deseado' : 'Colaboradores'}: ${user.team || user.people}
`).join('') : 'No hay usuarios previos registrados.'}

TAREAS:
1. Analiza la compatibilidad y potencial de colaboración del nuevo usuario
2. Identifica los 3 mejores matches basándote en:
   - Complementariedad de habilidades/roles
   - Alineación de intereses y valores
   - Compatibilidad de personalidad (extraído de su forma de escribir)
   - Potencial de crear algo significativo juntos

3. Genera un perfil atractivo que destaque las fortalezas únicas del usuario
4. Proporciona recomendaciones específicas para mejorar su perfil

RESPONDE EN FORMATO JSON VÁLIDO:
{
  "compatibility_score": [número del 1-10],
  "matches": [
    {
      "name": "nombre del usuario",
      "reason": "por qué son compatibles",
      "collaboration_potential": "qué podrían crear juntos"
    }
  ],
  "user_profile": "descripción atractiva de 2-3 oraciones que otros usuarios verían",
  "personality_insights": "análisis de personalidad basado en su forma de expresarse",
  "recommendations": [
    "recomendación específica 1",
    "recomendación específica 2"
  ],
  "project_suggestions": "si es sailor, qué tipos de proyectos le recomendarías; si es captain, cómo podría mejorar su idea"
}
`;
  }

  // Llamada a la API del LLM
  async callLLM(prompt) {
    const requestData = this.buildRequest(prompt);
    
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...(this.provider === 'claude' && {
          'anthropic-version': '2023-06-01'
        })
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return this.extractContent(data);
  }

  // Construir request según el proveedor
  buildRequest(prompt) {
    const baseRequest = {
      temperature: 0.7,
      max_tokens: 1500,
    };

    switch (this.provider) {
      case 'openai':
        return {
          ...baseRequest,
          model: 'gpt-4o-mini', // Más económico que gpt-4
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en análisis de personalidades y matching de equipos. Siempre respondes en JSON válido.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        };

      case 'claude':
        return {
          ...baseRequest,
          model: 'claude-3-sonnet-20240229',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        };

      case 'local':
        return {
          ...baseRequest,
          model: 'llama2', // O el modelo que tengas en Ollama
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        };

      default:
        return baseRequest;
    }
  }

  // Extraer contenido de la respuesta
  extractContent(data) {
    switch (this.provider) {
      case 'openai':
      case 'local':
        return data.choices[0].message.content;
      
      case 'claude':
        return data.content[0].text;
      
      default:
        return data.choices[0].message.content;
    }
  }

  // Parsear respuesta JSON del LLM
  parseResponse(response) {
    try {
      // Limpiar respuesta (remover markdown, etc.)
      const cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanResponse);
      
      // Validar estructura
      return {
        compatibility_score: parsed.compatibility_score || Math.floor(Math.random() * 3) + 7,
        matches: Array.isArray(parsed.matches) ? parsed.matches.slice(0, 3) : [],
        user_profile: parsed.user_profile || 'Perfil generado automáticamente',
        personality_insights: parsed.personality_insights || 'Análisis de personalidad no disponible',
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [parsed.recommendations || 'Sin recomendaciones'],
        project_suggestions: parsed.project_suggestions || 'Sin sugerencias de proyecto'
      };
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      console.log('Raw response:', response);
      
      // Fallback si no se puede parsear
      return this.generateFallbackResponse();
    }
  }

  // Respuesta de fallback si falla el LLM
  generateFallbackResponse(userData = {}, allUsers = []) {
    const compatibilityScore = Math.floor(Math.random() * 3) + 8;
    const potentialMatches = allUsers.slice(-3).map(user => ({
      name: user.name,
      reason: `Compatibilidad detectada en intereses: ${user.interests?.substring(0, 30)}...`,
      collaboration_potential: `Potencial proyecto conjunto en ${userData.interests?.split(',')[0] || 'área común'}`
    }));

    return {
      compatibility_score: compatibilityScore,
      matches: potentialMatches,
      user_profile: `${userData.name} es un talento prometedor con gran potencial para colaboración. Sus intereses en ${userData.interests || 'diversas áreas'} lo convierten en un candidato ideal para equipos innovadores.`,
      personality_insights: 'Análisis automático: Perfil equilibrado con tendencia colaborativa',
      recommendations: [
        'Expandir la descripción de intereses con ejemplos específicos',
        'Agregar información sobre experiencias previas de colaboración'
      ],
      project_suggestions: userData.role === 'captain' ? 
        'Considera definir más específicamente el MVP y las primeras métricas de éxito' :
        'Busca proyectos que combinen tus intereses personales con nuevas habilidades técnicas'
    };
  }
}

// Función de utilidad para usar en los formularios - MODIFICADA PARA MVP
async function processWithRealLLM(userData) {
  // Para el MVP, siempre devolver matches fijos en lugar de usar LLM real
  console.log('🎬 MVP Mode: Using fixed matches for demo video');
  
  // Matches fijos para el MVP (en inglés)
  const fixedMatches = [
    {
      name: "Maria Gonzalez",
      reason: "Shares your passion for social impact projects and technology. Her experience in digital product development perfectly complements your focus on collaboration and networking.",
      collaboration_potential: "You could create a platform that connects students with volunteer opportunities and social projects, combining technology with real impact."
    },
    {
      name: "Carlos Rodriguez",
      reason: "His fintech background and interest in sports create perfect synergy. Both of you seek projects that combine technological innovation with practical applications in the real world.",
      collaboration_potential: "Ideal for developing a university sports team management app with payment integration and analytics."
    },
    {
      name: "Ana Silva",
      reason: "Her UX/UI expertise and curiosity for new technologies make her the perfect collaborator. She shares your vision of creating solutions that truly impact people's lives.",
      collaboration_potential: "Excellent for leading user experience design in social impact and educational projects."
    }
  ];

  // Perfil personalizado basado en los datos del usuario (en inglés)
  const userProfile = `${userData.name} is an exceptional talent with a unique combination of intellectual curiosity and passion for real impact. Your focus on technology projects with social purpose, combined with your networking and collaboration experience, makes you an invaluable asset to any innovative team. Your ability to connect with people from different backgrounds and your clear vision about the types of projects you want to create together demonstrates natural leadership and exceptional collaborative mindset.`;

  const personalityInsights = "Personality Analysis: Collaborative leader profile with strong results orientation. Demonstrates genuine curiosity to learn from others and natural ability to identify synergy opportunities. Your clear and direct communication suggests team work experience and a pragmatic approach to problem solving.";

  const recommendations = [
    "Consider adding specific examples of previous collaborative projects to strengthen your profile",
    "Mention specific technologies or tools you're comfortable working with",
    "Include information about your time availability and communication preferences"
  ];

  const projectSuggestions = "Based on your profile, I recommend looking for projects that combine: 1) Digital platform development with social impact, 2) Mobile applications to connect university communities, 3) Collaboration and networking tools for students. Your technology background and collaborative approach position you perfectly to lead or significantly contribute to these types of projects.";

  const mvpResponse = {
    compatibility_score: 9,
    matches: fixedMatches,
    user_profile: userProfile,
    personality_insights: personalityInsights,
    recommendations: recommendations,
    project_suggestions: projectSuggestions
  };

  // Guardar respuesta en localStorage
  localStorage.setItem('sparkup_llm_response', JSON.stringify(mvpResponse));
  
  return mvpResponse;
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LLMIntegration, processWithRealLLM };
}