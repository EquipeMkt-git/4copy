/* =====================================================================
   4copys — CATÁLOGOS DE DADOS
   Personas, Formatos, Objetivos/CTAs, Plataformas, Produtos, Frameworks.
   Tudo aqui é editável pela interface e persiste no backend/local.
   Os textos de persona são uma BASE inicial — refine com dados reais.
   ===================================================================== */
(function () {
  "use strict";

  // Ícones (paths SVG) usados pela interface. viewBox 0 0 24 24.
  var ICONS = {
    home: "M3 11l9-8 9 8M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10",
    plus: "M12 5v14M5 12h14",
    mail: "M4 6h16v12H4zM4 7l8 6 8-6",
    chat: "M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z",
    users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11",
    star: "M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z",
    layers: "M12 2l9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5",
    image: "M4 4h16v16H4zM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4M4 16l4-4 4 4 4-5 4 5",
    tag: "M20 12l-8 8-9-9V3h8zM7 7h.01",
    doc: "M7 3h7l5 5v13H7zM14 3v5h5",
    megaphone: "M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1zM14 8a4 4 0 0 1 0 8",
    hash: "M4 9h16M4 15h16M10 3L8 21M16 3l-2 18",
    scroll: "M4 4h13v13a3 3 0 0 0 3 3H7a3 3 0 0 1-3-3zM8 8h6M8 12h6",
    phone: "M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
    edit3: "M12 20h9M16.5 3.5a2 2 0 0 1 3 3L7 19l-4 1 1-4z",
    video: "M15 10l5-3v10l-5-3zM3 6h12v12H3z",
    book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM19 3v16",
    brain: "M12 2a5 5 0 0 1 5 5c0 1.5-.7 2.6-1.5 3.5.9.6 1.5 1.7 1.5 3a4 4 0 0 1-4 4h-1v2M12 2a5 5 0 0 0-5 5c0 1.5.7 2.6 1.5 3.5C7.6 11.1 7 12.2 7 13.5a4 4 0 0 0 4 4",
    search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3",
    grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
    folder: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    check: "M20 6L9 17l-5-5",
    copy: "M9 9h11v11H9zM5 15H4V4h11v1",
    download: "M12 3v12M7 10l5 5 5-5M4 21h16",
    sparkles: "M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8zM19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9zM5 15l.6 1.4L7 17l-1.4.6L5 19l-.6-1.4L3 17l1.4-.6z",
    target: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
    bolt: "M13 2L3 14h7l-1 8 10-12h-7z",
    globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18",
    settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.4 3H9.6l-.4 2.4a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L5.1 11a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.4 2.4h4.8l.4-2.4a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6a7 7 0 0 0 .1-1z",
    logout: "M16 17l5-5-5-5M21 12H9M12 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"
  };

  // Eixos de "habilidade" da persona (como personagem de jogo).
  var SKILL_AXES = [
    { key: "ousadia", label: "Ousadia" },
    { key: "clareza", label: "Clareza" },
    { key: "emocao", label: "Emoção" },
    { key: "autoridade", label: "Autoridade" },
    { key: "proximidade", label: "Proximidade" },
    { key: "urgencia", label: "Urgência" }
  ];

  /* ------------------------------------------------------------------
     PERSONAS — cada uma é um "agente" com tom e escrita próprios.
     status: 'ready' (base pronta) | 'weak' (base fraca) | 'open' (a criar)
     ------------------------------------------------------------------ */
  var PERSONAS = [
    {
      id: "betina", name: "Betina", role: "Conselheira empática", status: "ready",
      initials: "BE", theme: "linear-gradient(135deg,#e83e8c,#a01050)",
      personality: "Acolhedora, direta e humana. Fala como uma amiga mais experiente que já passou pelo aperto do caixa e não julga. Empatia primeiro, solução depois.",
      values: ["Verdade sem rodeios", "Empatia com o dono que está no sufoco", "Simplicidade acima de jargão", "Dinheiro é meio, não fim"],
      symbols: ["Xícara de café na mesa da cozinha", "Planilha aberta de madrugada", "Chave do próprio negócio"],
      mantras: ["Você não está sozinho nisso.", "Número não morde — ele só te mostra o caminho.", "Clareza primeiro, coragem depois."],
      stories: "Usa histórias de donos reais que saíram do vermelho: a confeiteira que descobriu que vendia no prejuízo, o casal que separou as contas e respirou pela primeira vez em anos.",
      transcricoes: "(cole aqui trechos reais de falas/áudios da Betina para calibrar o tom)",
      inimigo: "A cultura do 'trabalhar muito e não sobrar nada' — o piloto automático que mantém o dono refém do próprio negócio.",
      casos: "Confeiteira que triplicou a margem em 90 dias; casal que quitou 1,5mi separando finanças pessoais das da empresa.",
      voice: {
        sentence: "curtas", emoji: "light",
        vocab: ["olha só", "respira", "a real é", "sem pânico", "vamos por partes", "faz sentido?", "no seu ritmo"],
        powerWords: ["clareza", "alívio", "controle", "virada", "respiro", "coragem", "verdade"],
        avoid: ["disruptivo", "sinergia", "alavancar", "ecossistema", "solução robusta"],
        openers: [
          "Deixa eu te falar uma verdade sobre {dor}…",
          "Se {publico}, esse texto é pra você.",
          "Sabe aquela sensação de {dor}? Ela tem nome — e tem saída."
        ],
        bridges: ["E é aqui que a coisa muda:", "Agora presta atenção nisso:", "Deixa eu te mostrar o caminho:"],
        signature: "Com você nessa, Betina."
      },
      skills: { ousadia: 55, clareza: 90, emocao: 92, autoridade: 70, proximidade: 95, urgencia: 60 }
    },
    {
      id: "quatroblue", name: "4blue", role: "Voz institucional da marca", status: "ready",
      initials: "4B", theme: "linear-gradient(135deg,#0072CE,#004882)",
      personality: "Didática, confiável e objetiva. Autoridade acessível: explica finanças e gestão de empresa como quem ensina, sem soberba. Método antes de hype.",
      values: ["Educação financeira de verdade", "Método e processo", "Transparência", "Resultado sustentável, não milagre"],
      symbols: ["Engrenagens (a Máquina de Lucros)", "Farol / luz (Iluminismo)", "Azul e amarelo 4blue"],
      mantras: ["Empresa organizada, dono livre.", "O que não se mede, não se gerencia.", "Lucro é consequência de gestão."],
      stories: "Cases de alunos MDL/ILU: donos que saíram do apaga-incêndio para o crescimento previsível.",
      transcricoes: "(dados brutos existentes — melhorar com transcrições reais de aulas e treinamentos)",
      inimigo: "A desorganização financeira e o achismo na gestão — decisões no escuro que quebram boas empresas.",
      casos: "Alunos que dobraram margem, montaram reserva e recuperaram tempo com a família.",
      voice: {
        sentence: "medias", emoji: "none",
        vocab: ["na prática", "método", "passo a passo", "com clareza", "de forma sustentável", "o dado mostra"],
        powerWords: ["método", "previsível", "organização", "lucro", "gestão", "liberdade", "clareza"],
        avoid: ["fórmula mágica", "fique rico", "sem esforço", "garantido da noite pro dia"],
        openers: [
          "Toda empresa que cresce de forma saudável tem uma coisa em comum: {beneficio}.",
          "{publico} costuma travar no mesmo ponto: {dor}.",
          "Existe um jeito mais organizado de {beneficio} — e ele começa aqui."
        ],
        bridges: ["Veja como funciona na prática:", "O método é simples:", "É por isso que:"],
        signature: "4blue — empresa organizada, dono livre."
      },
      skills: { ousadia: 45, clareza: 88, emocao: 55, autoridade: 92, proximidade: 62, urgencia: 55 }
    },
    {
      id: "ladeirinha", name: "Ladeirinha", role: "Motivador pé no chão", status: "weak",
      initials: "LA", theme: "linear-gradient(135deg,#ff6a3d,#e5341a)",
      personality: "(BASE FRACA — deixar em aberto) Energia de virada, fala de quem subiu a ladeira no braço. Motivação sem clichê, com verdade de chão de loja.",
      values: ["Trabalho honesto", "Virar o jogo", "Sem desculpa"],
      symbols: ["Ladeira", "Suor", "Primeiro cliente"],
      mantras: ["Quem sobe a ladeira não olha pra trás.", "Desculpa não paga boleto."],
      stories: "(a definir com dados reais)", transcricoes: "(a definir)",
      inimigo: "A zona de conforto e o 'sempre foi assim'.",
      casos: "(a definir)",
      voice: {
        sentence: "curtas", emoji: "light",
        vocab: ["bora", "cola aqui", "sem choro", "de verdade", "na raça"],
        powerWords: ["virada", "atitude", "coragem", "agora", "chega"],
        avoid: ["talvez", "quem sabe", "eventualmente"],
        openers: ["Chega de {dor}. Bora virar esse jogo.", "Se {publico}, senta que o papo é reto."],
        bridges: ["Presta atenção:", "É simples assim:"],
        signature: "Bora pra cima. — Ladeirinha"
      },
      skills: { ousadia: 85, clareza: 70, emocao: 78, autoridade: 60, proximidade: 82, urgencia: 88 }
    },
    {
      id: "aleks", name: "Aleks", role: "(a construir)", status: "open",
      initials: "AL", theme: "linear-gradient(135deg,#7c5cff,#4a2fd0)",
      personality: "(EM ABERTO — criar dados) Defina personalidade, valores e tom nos campos ao lado. Sugestão inicial: analítico e provocador.",
      values: [], symbols: [], mantras: [], stories: "", transcricoes: "", inimigo: "", casos: "",
      voice: {
        sentence: "medias", emoji: "none",
        vocab: [], powerWords: ["estratégia", "dado", "decisão"], avoid: [],
        openers: ["{publico}: e se o problema não fosse {dor}, mas o que ninguém te contou sobre isso?"],
        bridges: ["Vamos aos fatos:"], signature: "— Aleks"
      },
      skills: { ousadia: 60, clareza: 65, emocao: 40, autoridade: 70, proximidade: 45, urgencia: 55 }
    },
    {
      id: "renan", name: "Renan", role: "(a construir)", status: "open",
      initials: "RE", theme: "linear-gradient(135deg,#20c997,#0f7a5c)",
      personality: "(EM ABERTO — criar dados) Defina personalidade, valores e tom. Sugestão inicial: prático e vendedor, foco em oferta.",
      values: [], symbols: [], mantras: [], stories: "", transcricoes: "", inimigo: "", casos: "",
      voice: {
        sentence: "curtas", emoji: "light",
        vocab: [], powerWords: ["oferta", "agora", "vantagem", "resultado"], avoid: [],
        openers: ["Você quer {beneficio}? Então isso é pra você."],
        bridges: ["Olha o que você ganha:"], signature: "— Renan"
      },
      skills: { ousadia: 70, clareza: 72, emocao: 55, autoridade: 60, proximidade: 68, urgencia: 80 }
    },
    {
      id: "thauan", name: "Thauan", role: "(a construir)", status: "open",
      initials: "TH", theme: "linear-gradient(135deg,#00b8d4,#0077a3)",
      personality: "(EM ABERTO — criar dados) Defina personalidade, valores e tom. Sugestão inicial: jovem, criativo, linguagem de rede social.",
      values: [], symbols: [], mantras: [], stories: "", transcricoes: "", inimigo: "", casos: "",
      voice: {
        sentence: "curtas", emoji: "heavy",
        vocab: ["olha isso", "plot twist", "salva esse post"], powerWords: ["hoje", "novo", "segredo"], avoid: [],
        openers: ["Ninguém te conta isso sobre {dor} 👇"],
        bridges: ["Mas calma que tem mais:"], signature: "— Thauan"
      },
      skills: { ousadia: 78, clareza: 68, emocao: 72, autoridade: 45, proximidade: 85, urgencia: 70 }
    },
    {
      id: "livros", name: "Agente de Livros", role: "Síntese de livros (PDF)", status: "open",
      initials: "LI", theme: "linear-gradient(135deg,#6c757d,#3d4348)",
      personality: "(A CRIAR) Voz construída a partir de livros enviados em PDF. Suba um livro em Fontes de Dados e marque a persona 'Agente de Livros' para alimentar o tom com o conteúdo.",
      values: [], symbols: [], mantras: [], stories: "", transcricoes: "", inimigo: "", casos: "",
      voice: {
        sentence: "medias", emoji: "none",
        vocab: [], powerWords: ["princípio", "conceito", "prática"], avoid: [],
        openers: ["Como ensina {fonte}: {beneficio} começa por entender {dor}."],
        bridges: ["A ideia central é esta:"], signature: "— Agente de Livros (4copys)"
      },
      skills: { ousadia: 40, clareza: 80, emocao: 45, autoridade: 85, proximidade: 40, urgencia: 35 }
    }
  ];

  /* ------------------------------------------------------------------
     FORMATOS — cada um define a estrutura que o motor preenche.
     ------------------------------------------------------------------ */
  var FORMATS = [
    { id: "email", name: "E-mail", icon: "mail", cover: "cov-email", cat: "E-mail",
      desc: "Assunto + corpo + CTA. Ideal p/ ActiveCampaign.", framework: "pas",
      parts: ["assunto", "preheader", "abertura", "corpo", "cta", "assinatura"], maxLen: 1400 },
    { id: "whatsapp_grupo", name: "WhatsApp — Grupo", icon: "chat", cover: "cov-wpp", cat: "WhatsApp",
      desc: "Mensagem curta e escaneável p/ grupos.", framework: "aida",
      parts: ["gancho", "corpo", "cta"], maxLen: 500 },
    { id: "whatsapp_individual", name: "WhatsApp — Individual", icon: "chat", cover: "cov-wpp", cat: "WhatsApp",
      desc: "Mensagem 1:1, tom pessoal.", framework: "bab",
      parts: ["abertura", "corpo", "cta"], maxLen: 400 },
    { id: "post", name: "Post (feed)", icon: "hash", cover: "cov-post", cat: "Social",
      desc: "Post de feed com gancho forte.", framework: "aida",
      parts: ["gancho", "desenvolvimento", "virada", "cta"], maxLen: 900 },
    { id: "descricao_post", name: "Descrição de post", icon: "edit3", cover: "cov-post", cat: "Social",
      desc: "Legenda que acompanha o criativo.", framework: "aida",
      parts: ["gancho", "corpo", "cta", "hashtags"], maxLen: 700 },
    { id: "stories", name: "Sequência de stories", icon: "layers", cover: "cov-story", cat: "Social",
      desc: "Roteiro de 4–6 telas de story.", framework: "storytelling",
      parts: ["tela1", "tela2", "tela3", "tela4", "cta"], maxLen: 800 },
    { id: "ads", name: "Ad (tráfego pago)", icon: "megaphone", cover: "cov-ad", cat: "Ads",
      desc: "Texto primário + título + descrição.", framework: "pas",
      parts: ["titulo", "texto_primario", "descricao", "cta"], maxLen: 900 },
    { id: "criativo", name: "Criativo (copy do arte)", icon: "image", cover: "cov-ad", cat: "Ads",
      desc: "Copy curta que vai DENTRO da imagem/vídeo.", framework: "aida",
      parts: ["chamada", "apoio", "selo_cta"], maxLen: 260 },
    { id: "headlines", name: "Headlines & ganchos", icon: "bolt", cover: "cov-headline", cat: "Ideação",
      desc: "Lote de títulos e ganchos p/ testar.", framework: "aida",
      parts: ["headlines", "ganchos"], maxLen: 900, multi: true },
    { id: "carta_vendas", name: "Carta de vendas", icon: "scroll", cover: "cov-sales", cat: "Longform",
      desc: "Estrutura longa persuasiva completa.", framework: "pastor",
      parts: ["headline", "lead", "problema", "historia", "oferta", "prova", "objecoes", "garantia", "cta"], maxLen: 4000 },
    { id: "blocos_pagina", name: "Blocos de página", icon: "grid", cover: "cov-page", cat: "Longform",
      desc: "Seções de landing (Elementor).", framework: "4ps",
      parts: ["hero", "beneficios", "prova_social", "oferta", "faq", "cta_final"], maxLen: 2600 },
    { id: "sms", name: "SMS", icon: "phone", cover: "cov-sms", cat: "Mensageria",
      desc: "Mensagem ultracurta (160 caracteres).", framework: "aida",
      parts: ["mensagem"], maxLen: 160 },
    { id: "blog", name: "Artigo de blog", icon: "doc", cover: "cov-blog", cat: "Conteúdo",
      desc: "Artigo com intro, subtópicos e conclusão.", framework: "storytelling",
      parts: ["titulo", "intro", "topicos", "conclusao", "cta"], maxLen: 3000 },
    { id: "roteiro_video", name: "Roteiro para vídeo", icon: "video", cover: "cov-video", cat: "Conteúdo",
      desc: "Roteiro com gancho, retenção e CTA.", framework: "storytelling",
      parts: ["gancho", "contexto", "conteudo", "virada", "cta"], maxLen: 2200 },
    { id: "descricao_produto", name: "Descrição de produto", icon: "tag", cover: "cov-desc", cat: "E-commerce",
      desc: "Descrição persuasiva de produto/curso.", framework: "4ps",
      parts: ["chamada", "para_quem", "beneficios", "o_que_inclui", "cta"], maxLen: 1400 }
  ];

  /* ------------------------------------------------------------------
     OBJETIVOS / CTAs
     ------------------------------------------------------------------ */
  var OBJECTIVES = [
    { id: "saiba_mais", name: "Clique em saiba mais", icon: "target",
      ctas: ["Clique em “Saiba mais” e entenda como funciona.", "Toca no link e vê os detalhes.", "Saiba mais agora — leva 2 minutos."] },
    { id: "venda", name: "Venda", icon: "bolt",
      ctas: ["Garanta sua vaga agora.", "Quero começar — clique aqui.", "Assine hoje e comece ainda esta semana."] },
    { id: "inscricao", name: "Inscrição", icon: "check",
      ctas: ["Inscreva-se gratuitamente.", "Faça sua inscrição — vagas limitadas.", "Reserve seu lugar agora."] },
    { id: "comentario", name: "Comentário", icon: "chat",
      ctas: ["Comenta aqui embaixo: você se identifica?", "Deixa nos comentários o seu maior desafio.", "Comenta “EU” se isso é a sua realidade."] },
    { id: "compartilhe", name: "Compartilhe o post", icon: "users",
      ctas: ["Compartilha com aquele dono que precisa ler isso.", "Manda pra um sócio que vive esse aperto.", "Compartilhe nos stories e marque a 4blue."] },
    { id: "salve", name: "Salve o post", icon: "star",
      ctas: ["Salva esse post pra não esquecer.", "Salva aqui — você vai querer reler isso.", "Guarda esse post pro dia que a corda apertar."] },
    { id: "interacao", name: "Interação", icon: "chat",
      ctas: ["Conta pra gente: qual é o seu maior perrengue hoje?", "Manda sua dúvida — a gente responde.", "O que você achou? Responde essa mensagem."] }
  ];

  /* ------------------------------------------------------------------
     PLATAFORMAS
     ------------------------------------------------------------------ */
  var PLATFORMS = [
    { id: "instagram", name: "Instagram", icon: "hash", note: "Mobile — posts e ads. Gancho nas 2 primeiras linhas.", style: "medio", emoji: "light" },
    { id: "elementor", name: "Elementor / Site", icon: "globe", note: "Mobile-first. Frases curtas, blocos escaneáveis.", style: "medio", emoji: "none" },
    { id: "whatsapp_manychat", name: "WhatsApp / ManyChat", icon: "chat", note: "Copys curtas, diretas, uma ideia por mensagem.", style: "curto", emoji: "light" },
    { id: "email_active", name: "E-mail / ActiveCampaign", icon: "mail", note: "Assunto forte + corpo objetivo + 1 CTA claro.", style: "longo", emoji: "none" }
  ];

  /* ------------------------------------------------------------------
     PRODUTOS
     ------------------------------------------------------------------ */
  var PRODUCTS = [
    { id: "mdl_pro", name: "Programa MDL PRO", short: "MDL PRO", persona: "quatroblue",
      promise: "Transformar a empresa numa Máquina de Lucros previsível, com o dono no controle e não refém.",
      audience: "Donos de PMEs faturando acima de ~60k/mês que vivem apagando incêndio.",
      pains: ["Empresa depende 100% do dono", "Cresce faturamento mas não sobra lucro", "Time sem processo", "Sem tempo pra família"],
      benefits: ["Gestão por indicadores", "Processos de venda e time", "Aumento de margem", "Previsibilidade e liberdade"] },
    { id: "mdl_essencial", name: "Programa MDL Essencial", short: "MDL Essencial", persona: "quatroblue",
      promise: "Colocar a base de gestão e lucro em ordem, do jeito simples, pra quem está começando a organizar.",
      audience: "Donos em fase inicial de organização da gestão.",
      pains: ["Não sabe se dá lucro", "Mistura finanças", "Gestão no achismo"],
      benefits: ["Fundamentos de gestão", "Controle financeiro simples", "Primeiros indicadores"] },
    { id: "consultoria_ilu", name: "Consultoria Iluminismo Financeiro", short: "ILU", persona: "betina",
      promise: "Trazer clareza total às finanças da empresa — enxergar os números e tomar decisões com segurança.",
      audience: "Donos perdidos nos números, sem reserva, sem saber a margem real.",
      pains: ["Não sabe a margem real", "Sem reserva financeira", "Finanças pessoais e da empresa misturadas", "Medo de olhar o extrato"],
      benefits: ["Diagnóstico financeiro", "Separação de finanças", "Construção de reserva", "Decisão baseada em dado"] },
    { id: "workshop_presencial", name: "Workshop presencial", short: "Workshop presencial", persona: "quatroblue",
      promise: "Imersão de 1 a 3 dias pra virar a chave da gestão com a comunidade 4blue.",
      audience: "Donos que querem imersão e networking presencial.",
      pains: ["Falta de foco no dia a dia", "Precisa de um choque de gestão"],
      benefits: ["Imersão intensiva", "Networking", "Plano de ação saindo pronto"] },
    { id: "workshop_online", name: "Workshop Online", short: "Workshop Online", persona: "quatroblue",
      promise: "Treinamento online sobre um tema específico, direto ao ponto e aplicável.",
      audience: "Donos que querem aprofundar um tema sem sair de casa.",
      pains: ["Dúvida pontual num tema", "Sem tempo pra curso longo"],
      benefits: ["Tema focado", "Aplicação rápida", "Acesso online"] },
    { id: "gfl", name: "GFL", short: "GFL", persona: "quatroblue",
      promise: "(Descreva o GFL) — programa/serviço 4blue. Complete a base de dados deste produto.",
      audience: "(a definir)", pains: ["(a definir)"], benefits: ["(a definir)"] },
    { id: "team4you", name: "Team4you", short: "Team4you", persona: "quatroblue",
      promise: "(Descreva o Team4you) — solução de time/gestão de pessoas. Complete a base deste produto.",
      audience: "(a definir)", pains: ["(a definir)"], benefits: ["(a definir)"] },
    { id: "outros", name: "Outros (tema livre)", short: "Tema livre", persona: "quatroblue",
      promise: "Tema livre — a IA analisa o briefing e monta a copy do zero.",
      audience: "Definido no briefing.", pains: [], benefits: [] }
  ];

  /* ------------------------------------------------------------------
     FRAMEWORKS de copy (estrutura + elementos literários)
     ------------------------------------------------------------------ */
  var FRAMEWORKS = {
    aida: { name: "AIDA", steps: ["Atenção", "Interesse", "Desejo", "Ação"],
      guide: "Prende a atenção, gera interesse com o benefício, cria desejo com prova/imagem, e pede a ação." },
    pas: { name: "PAS", steps: ["Problema", "Agitação", "Solução"],
      guide: "Nomeia a dor, agita as consequências de não resolver, e apresenta a solução." },
    bab: { name: "BAB", steps: ["Antes", "Depois", "Ponte"],
      guide: "Mostra o cenário atual (antes), pinta o cenário desejado (depois) e liga os dois com a solução (ponte)." },
    "4ps": { name: "4Ps", steps: ["Picture", "Promessa", "Prova", "Push"],
      guide: "Pinta um quadro, faz a promessa, entrega a prova e empurra pra ação." },
    pastor: { name: "PASTOR", steps: ["Problema", "Amplificação", "História/Solução", "Transformação", "Oferta", "Resposta"],
      guide: "Estrutura longa de carta de vendas: dor, amplificação, história e solução, transformação, oferta e chamada." },
    storytelling: { name: "Storytelling", steps: ["Gancho", "Conflito", "Virada", "Lição", "Convite"],
      guide: "Narrativa com gancho, conflito, virada e lição que leva ao convite (CTA)." }
  };

  // Bancos de elementos literários (usados pelo motor).
  var LITERARY = {
    powerWords: ["clareza", "liberdade", "controle", "virada", "previsível", "verdade", "método", "agora", "sem", "finalmente"],
    hooks: [
      "A verdade que ninguém te conta sobre {dor}:",
      "Se você {publico}, isso vai te incomodar (no bom sentido):",
      "{dor} não é falta de esforço. É falta de {beneficio}.",
      "Existe um motivo pra {dor} — e não é o que te disseram.",
      "Pare de {dor}. Comece a {beneficio}."
    ],
    transitions: ["E aqui está o ponto:", "Mas tem um detalhe:", "Agora repara:", "É por isso que:", "O que muda tudo:"],
    proofFrames: ["Foi exatamente o que aconteceu com {caso}.", "Não é teoria: {caso}.", "Quem já fez isso colheu {beneficio}."]
  };

  window.APP_DATA = {
    ICONS: ICONS, SKILL_AXES: SKILL_AXES,
    PERSONAS: PERSONAS, FORMATS: FORMATS, OBJECTIVES: OBJECTIVES,
    PLATFORMS: PLATFORMS, PRODUCTS: PRODUCTS, FRAMEWORKS: FRAMEWORKS, LITERARY: LITERARY,
    // helpers de acesso
    persona: function (id) { return PERSONAS.filter(function (p) { return p.id === id; })[0]; },
    format: function (id) { return FORMATS.filter(function (f) { return f.id === id; })[0]; },
    objective: function (id) { return OBJECTIVES.filter(function (o) { return o.id === id; })[0]; },
    platform: function (id) { return PLATFORMS.filter(function (p) { return p.id === id; })[0]; },
    product: function (id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; },
    icon: function (name) { return ICONS[name] || ICONS.doc; }
  };
})();
