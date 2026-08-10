/* =====================================================================
   4copys — CONFIGURAÇÃO CENTRAL (arquivo público, vai pro GitHub Pages)
   ---------------------------------------------------------------------
   NÃO coloque chaves secretas aqui. Segredos (senha do backend, futura
   API Key de IA externa) ficam nas Propriedades do Script no Apps Script.
   ===================================================================== */

window.APP_CONFIG = {
  // Nome e versão do app (aparecem na interface)
  APP_NAME: "4copys",
  APP_TAGLINE: "O Canva das copys da 4blue",
  VERSION: "1.0.0",

  // URL do Web App do Google Apps Script (termina em /exec).
  // Enquanto estiver vazio, o app roda 100% offline (salva no navegador).
  // Preencha depois de publicar o backend (ver apps-script/ e README).
  APPS_SCRIPT_URL: "",

  // -------------------------------------------------------------------
  // MOTOR DE IA
  // "internal" -> motor de regras/templates embutido (sem custo, offline).
  // "external" -> chama uma IA externa (LLM) pelo backend. Ainda NÃO ligado;
  //               a arquitetura já está pronta (ver engine.js -> Provider).
  // -------------------------------------------------------------------
  AI_PROVIDER: "internal",

  // Config da futura IA externa (só usada quando AI_PROVIDER === "external").
  // A chamada passa pelo Apps Script — a API key fica no backend, nunca aqui.
  AI_EXTERNAL: {
    // rótulo só informativo; o backend decide o provedor real
    model: "a-definir",
    // temperatura sugerida (0 = previsível, 1 = criativo)
    temperature: 0.8,
    maxTokens: 1200,
  },

  // Tempo máximo (ms) para uma chamada ao backend antes de desistir.
  SUBMIT_TIMEOUT_MS: 20000,

  // Liga/desliga módulos (útil para lançar por partes).
  FEATURES: {
    library: true,      // Acervo compartilhado
    sources: true,      // Fontes de dados / base de conhecimento
    analyze: true,      // Análise de copys de concorrentes
    brain: true,        // "Cérebro" de conexões (estilo Obsidian)
    transcription: true // Entrada de áudio/vídeo p/ transcrição (stub)
  },

  // Formato de exportação padronizado para outros sistemas (ex.: 4creaty).
  EXPORT_TARGETS: ["texto", "markdown", "4creaty-json"],
};
