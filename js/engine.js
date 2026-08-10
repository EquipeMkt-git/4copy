/* =====================================================================
   4copys — MOTOR DE IA INTERNA
   ---------------------------------------------------------------------
   Geração determinística de copys a partir de:
     persona (tom/voz) + formato (estrutura) + objetivo (CTA)
     + produto (promessa/dores/benefícios) + briefing (respostas)
     + fontes (contexto opcional) + frameworks (AIDA/PAS/...).
   Arquitetura pronta para plugar uma IA EXTERNA no futuro (Provider).
   Não depende de rede: roda 100% no navegador.
   ===================================================================== */
(function () {
  "use strict";
  var D = window.APP_DATA;

  /* ----------------------- utilidades ----------------------- */
  function hash(str) { var h = 2166136261, i; for (i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function makeRng(seedStr) {
    var a = hash(seedStr);
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function pick(arr, rnd) { if (!arr || !arr.length) return ""; return arr[Math.floor(rnd() * arr.length)]; }
  function pickN(arr, n, rnd) { var c = arr.slice(), out = []; while (c.length && out.length < n) { out.push(c.splice(Math.floor(rnd() * c.length), 1)[0]); } return out; }
  function lc(s) { s = String(s || ""); return s.charAt(0).toLowerCase() + s.slice(1); }
  function cap(s) { s = String(s || "").trim(); return s.charAt(0).toUpperCase() + s.slice(1); }
  function clean(s) { return String(s || "").replace(/\s+\n/g, "\n").replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim(); }
  function trimTo(s, n) { s = String(s || ""); if (s.length <= n) return s; return s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…"; }
  function fill(t, ing) {
    return String(t || "")
      .replace(/\{dor\}/g, lc(ing.dor)).replace(/\{Dor\}/g, cap(ing.dor))
      .replace(/\{publico\}/g, lc(ing.publico)).replace(/\{Publico\}/g, cap(ing.publico))
      .replace(/\{beneficio\}/g, lc(ing.beneficio)).replace(/\{Beneficio\}/g, cap(ing.beneficio))
      .replace(/\{produto\}/g, ing.produto).replace(/\{caso\}/g, lc(ing.caso))
      .replace(/\{fonte\}/g, ing.fonte || "o método").replace(/\{oferta\}/g, lc(ing.oferta));
  }

  /* ----------------------- ingredientes ----------------------- */
  function ingredients(brief) {
    var prod = D.product(brief.productId) || {};
    var a = brief.answers || {};
    var srcText = (brief.sources || []).map(function (s) { return s.text; }).join(" ").slice(0, 400);
    var okPromise = prod.promise && prod.promise.indexOf("definir") < 0 && prod.promise.indexOf("Descreva") < 0;
    var okAudience = prod.audience && prod.audience.indexOf("definir") < 0;
    var benefits = (prod.benefits || []).filter(function (b) { return b && b.indexOf("definir") < 0; });
    var pains = (prod.pains || []).filter(function (p) { return p && p.indexOf("definir") < 0; });
    return {
      publico: a.publico || (okAudience ? prod.audience : "") || "dono de pequena empresa",
      dor: a.dor || pains[0] || "correr o dia todo e não ver o lucro no fim do mês",
      beneficio: a.promessa || (okPromise ? prod.promise : "") || "ter clareza e controle do próprio negócio",
      oferta: a.oferta || benefits.join(", ") || "",
      caso: a.prova || "",
      produto: prod.name || a.tema || "a solução",
      fonte: (brief.sources && brief.sources[0] && brief.sources[0].name) || "",
      benefits: benefits, pains: pains,
      srcText: srcText, extra: a.observacoes || ""
    };
  }

  function toneFlags(persona) {
    var s = persona.skills || {};
    return {
      bold: (s.ousadia || 50) >= 70,
      urgent: (s.urgencia || 50) >= 70,
      emotional: (s.emocao || 50) >= 70,
      authority: (s.autoridade || 50) >= 70,
      close: (s.proximidade || 50) >= 70,
      clear: (s.clareza || 50) >= 80
    };
  }

  function emoji(persona, platform, kind) {
    var pol = (platform && platform.emoji) || (persona.voice && persona.voice.emoji) || "none";
    if (pol === "none") return "";
    var packs = {
      point: ["👇", "➡️", "✅"], fire: ["🔥", "💥", "🚀"], money: ["💰", "📈"],
      heart: ["❤️", "🙌", "✨"], warn: ["⚠️", "⏰"], star: ["⭐", "📌"]
    };
    var arr = packs[kind] || packs.point;
    if (pol === "light") return " " + arr[0];
    return " " + arr[0] + arr[1 % arr.length];
  }

  /* ----------------------- "beats" de copy ----------------------- */
  function beatHook(ing, ctx) {
    var v = ctx.persona.voice || {};
    var bank = (v.openers && v.openers.length ? v.openers : D.LITERARY.hooks);
    if (ctx.tone.bold) bank = bank.concat(D.LITERARY.hooks);
    return cap(fill(pick(bank, ctx.rnd), ing));
  }
  function beatProblem(ing, ctx) {
    var bank = [
      "Você conhece bem esse cenário: {dor}.",
      "No fundo, você sente isso todo mês: {dor}.",
      "A rotina virou isso — {dor}.",
      "E não adianta fingir que está tudo bem quando {dor}."
    ];
    return cap(fill(pick(bank, ctx.rnd), ing));
  }
  function beatAgitate(ing, ctx) {
    var bank = [
      "E o pior: cada mês que passa assim é dinheiro e tempo que não voltam.",
      "Enquanto isso continua, você trabalha mais e sobra menos.",
      "Não é falta de esforço — é que ninguém te mostrou o caminho certo.",
      "Isso vai te custar caro se seguir no piloto automático."
    ];
    if (ctx.tone.emotional) bank.push("E dói ver o quanto você se dedica pra, no fim, se sentir refém do próprio negócio.");
    return pick(bank, ctx.rnd);
  }
  function beatSolution(ing, ctx) {
    var bridge = pick((ctx.persona.voice && ctx.persona.voice.bridges) || D.LITERARY.transitions, ctx.rnd);
    var bank = [
      bridge + " dá pra {beneficio} com método, não com sorte.",
      bridge + " existe um jeito organizado de {beneficio}.",
      bridge + " o {produto} foi feito exatamente pra {beneficio}."
    ];
    return cap(fill(pick(bank, ctx.rnd), ing));
  }
  function beatBenefits(ing, ctx, n) {
    var list = ing.benefits.length ? ing.benefits : [ing.beneficio];
    list = pickN(list, n || Math.min(3, list.length), ctx.rnd);
    return list.map(function (b) { return "• " + cap(b); }).join("\n");
  }
  function beatProof(ing, ctx) {
    if (ing.caso) return cap(fill("Não é teoria: {caso}.", { caso: ing.caso }));
    if (ctx.persona.casos) return "Foi o que aconteceu com quem já aplicou: " + lc(ctx.persona.casos);
    return "";
  }
  function beatCTA(ing, ctx) {
    var base = pick(ctx.objective.ctas, ctx.rnd);
    if (ctx.tone.urgent && ctx.objective.id === "venda") base = base + " As vagas são limitadas.";
    return base;
  }
  function beatSignature(ctx) { return (ctx.persona.voice && ctx.persona.voice.signature) || ""; }

  /* ----------------------- renderizadores por formato ----------------------- */
  var RENDER = {
    email: function (ing, ctx) {
      var subjBank = [
        "{Publico}? Isso aqui é pra você",
        "A verdade sobre {dor}",
        "O que trava {beneficio} (e como resolver)",
        "Você não precisa {dor} pra sempre"
      ];
      var assunto = cap(fill(pick(subjBank, ctx.rnd), ing));
      var pre = trimTo(fill("Leva 2 minutos e pode mudar o seu mês.", ing), 90);
      var corpo = [
        beatHook(ing, ctx),
        "",
        beatProblem(ing, ctx) + " " + beatAgitate(ing, ctx),
        "",
        beatSolution(ing, ctx),
        "",
        (ing.benefits.length ? "Na prática, você sai com:\n" + beatBenefits(ing, ctx, 3) + "\n" : ""),
        beatProof(ing, ctx)
      ].filter(Boolean).join("\n");
      var cta = "» " + beatCTA(ing, ctx);
      var text = "Assunto: " + assunto + "\nPreheader: " + pre + "\n\n" + corpo + "\n\n" + cta;
      var sig = beatSignature(ctx); if (sig) text += "\n\n" + sig;
      return { text: text, structured: { assunto: assunto, preheader: pre, corpo: corpo, cta: cta } };
    },

    whatsapp_grupo: function (ing, ctx) {
      var e = emoji(ctx.persona, ctx.platform, "fire");
      var t = [
        cap(fill(pick(["Bora resolver {dor} de vez" + e, "Recado rápido pra quem {publico}" + e, "Isso aqui é ouro pra você" + e], ctx.rnd), ing)),
        "",
        cap(fill("Se você vive {dor}, o {produto} te dá {beneficio}.", ing)),
        "",
        beatCTA(ing, ctx) + emoji(ctx.persona, ctx.platform, "point")
      ].join("\n");
      return { text: trimTo(clean(t), ctx.format.maxLen), structured: {} };
    },

    whatsapp_individual: function (ing, ctx) {
      var nome = (ctx.brief.answers && ctx.brief.answers.nome_lead) || "";
      var ola = nome ? "Oi, " + nome + "! " : "Oi! ";
      var t = [
        ola + cap(fill("passando aqui rapidinho porque lembrei de você quando pensei em {dor}.", ing)),
        "",
        cap(fill("O {produto} ajuda exatamente nisso — {beneficio}.", ing)),
        "",
        beatCTA(ing, ctx)
      ].join("\n");
      return { text: trimTo(clean(t), ctx.format.maxLen), structured: {} };
    },

    post: function (ing, ctx) {
      var t = [
        beatHook(ing, ctx) + emoji(ctx.persona, ctx.platform, "point"),
        "",
        beatProblem(ing, ctx),
        beatAgitate(ing, ctx),
        "",
        beatSolution(ing, ctx),
        (ing.benefits.length ? "\n" + beatBenefits(ing, ctx, 3) : ""),
        "",
        pick(D.LITERARY.transitions, ctx.rnd) + " " + lc(beatCTA(ing, ctx))
      ].filter(Boolean).join("\n");
      return { text: trimTo(clean(t), ctx.format.maxLen), structured: {} };
    },

    descricao_post: function (ing, ctx) {
      var tags = ["#gestao", "#pequenaempresa", "#financas", "#4blue", "#lucro", "#empreendedorismo"];
      var t = [
        beatHook(ing, ctx),
        "",
        cap(fill("{Beneficio} não é sorte — é método. O {produto} te mostra como.", ing)),
        "",
        beatCTA(ing, ctx) + emoji(ctx.persona, ctx.platform, "point"),
        "",
        pickN(tags, 5, ctx.rnd).join(" ")
      ].join("\n");
      return { text: trimTo(clean(t), ctx.format.maxLen), structured: {} };
    },

    stories: function (ing, ctx) {
      var telas = [
        "TELA 1 (gancho): " + beatHook(ing, ctx),
        "TELA 2 (dor): " + beatProblem(ing, ctx),
        "TELA 3 (virada): " + beatSolution(ing, ctx),
        "TELA 4 (prova): " + (beatProof(ing, ctx) || cap(fill("O {produto} entrega {beneficio}.", ing))),
        "TELA 5 (CTA): " + beatCTA(ing, ctx) + emoji(ctx.persona, ctx.platform, "point") + " (arrasta pra cima / link na bio)"
      ];
      return { text: telas.join("\n\n"), structured: { telas: telas } };
    },

    ads: function (ing, ctx) {
      var titulo = trimTo(cap(fill(pick(["{Beneficio} de verdade", "Pare de {dor}", "O {produto} é pra você"], ctx.rnd), ing)), 40);
      var primario = [
        beatHook(ing, ctx),
        "",
        beatProblem(ing, ctx) + " " + beatSolution(ing, ctx),
        (ing.benefits.length ? "\n" + beatBenefits(ing, ctx, 3) : ""),
        "",
        beatCTA(ing, ctx)
      ].filter(Boolean).join("\n");
      var desc = trimTo(fill("{Beneficio}. Comece agora.", ing), 60);
      var text = "TÍTULO: " + titulo + "\n\nTEXTO PRIMÁRIO:\n" + clean(primario) + "\n\nDESCRIÇÃO: " + desc;
      return { text: text, structured: { titulo: titulo, texto_primario: primario, descricao: desc } };
    },

    criativo: function (ing, ctx) {
      var chamada = trimTo(cap(fill(pick(["Pare de {dor}", "{Beneficio} começa aqui", "E se você {beneficio}?"], ctx.rnd), ing)), 42);
      var apoio = trimTo(fill("{Produto} te leva lá.", ing), 60);
      var selo = trimTo(pick(ctx.objective.ctas, ctx.rnd).replace(/\.$/, ""), 26);
      return { text: "CHAMADA (grande):\n" + chamada + "\n\nAPOIO (menor):\n" + apoio + "\n\nSELO/CTA:\n" + selo, structured: { chamada: chamada, apoio: apoio, selo: selo } };
    },

    headlines: function (ing, ctx) {
      var hb = D.LITERARY.hooks.concat((ctx.persona.voice && ctx.persona.voice.openers) || []);
      var heads = [], i, seen = {};
      for (i = 0; i < 24 && heads.length < 8; i++) { var h = cap(fill(pick(hb, ctx.rnd), ing)); if (!seen[h]) { seen[h] = 1; heads.push(h); } }
      var extra = [
        cap(fill("Como {beneficio} sem {dor}", ing)),
        cap(fill("O erro que faz você {dor}", ing)),
        cap(fill("3 sinais de que você precisa {beneficio}", ing)),
        cap(fill("A conta que todo {publico} esquece de fazer", ing))
      ];
      var out = "HEADLINES:\n" + heads.map(function (h, idx) { return (idx + 1) + ". " + h; }).join("\n") +
        "\n\nGANCHOS:\n" + extra.map(function (h) { return "• " + h; }).join("\n");
      return { text: out, structured: { headlines: heads, ganchos: extra } };
    },

    sms: function (ing, ctx) {
      var t = trimTo(fill("{Produto}: " + lc(pick(ctx.objective.ctas, ctx.rnd)), ing), 160);
      return { text: t, structured: {} };
    },

    carta_vendas: function (ing, ctx) {
      var S = [];
      S.push("[HEADLINE]\n" + beatHook(ing, ctx));
      S.push("[LEAD]\n" + beatProblem(ing, ctx) + " " + beatAgitate(ing, ctx));
      S.push("[O PROBLEMA REAL]\n" + cap(fill("Se você {publico}, provavelmente já tentou de tudo. Mas {dor} continua — porque falta o essencial: método.", ing)));
      S.push("[HISTÓRIA / SOLUÇÃO]\n" + beatSolution(ing, ctx) + " " + (ctx.persona.stories ? lc(ctx.persona.stories) : ""));
      S.push("[A OFERTA — " + ing.produto + "]\n" + cap(fill("{Beneficio}.", ing)) + (ing.benefits.length ? "\n\nO que você recebe:\n" + beatBenefits(ing, ctx, ing.benefits.length) : ""));
      S.push("[PROVA]\n" + (beatProof(ing, ctx) || "Insira aqui depoimentos e resultados reais."));
      S.push("[QUEBRA DE OBJEÇÕES]\n" + cap(fill("“Será que funciona pra mim?” Funciona pra quem {publico} e está disposto a sair do piloto automático.", ing)));
      S.push("[GARANTIA]\nApresente aqui a garantia (ex.: risco zero por X dias).");
      S.push("[CTA]\n" + beatCTA(ing, ctx));
      var sig = beatSignature(ctx); if (sig) S.push(sig);
      return { text: S.join("\n\n"), structured: { blocos: S } };
    },

    blocos_pagina: function (ing, ctx) {
      var B = [];
      B.push("[HERO]\nTítulo: " + beatHook(ing, ctx) + "\nSubtítulo: " + cap(fill("{Beneficio} com o {produto}.", ing)) + "\nBotão: " + trimTo(pick(ctx.objective.ctas, ctx.rnd).replace(/\.$/, ""), 24));
      B.push("[BENEFÍCIOS]\n" + beatBenefits(ing, ctx, Math.max(3, ing.benefits.length)));
      B.push("[PROVA SOCIAL]\n" + (beatProof(ing, ctx) || "Espaço para depoimentos, logos e números."));
      B.push("[OFERTA]\n" + cap(fill("Tudo isso para você {beneficio}.", ing)));
      B.push("[FAQ]\n- Para quem é? " + cap(ing.publico) + ".\n- Como funciona? Método passo a passo.\n- E se não for pra mim? Fale com a gente antes.");
      B.push("[CTA FINAL]\n" + beatCTA(ing, ctx));
      return { text: B.join("\n\n"), structured: { blocos: B } };
    },

    blog: function (ing, ctx) {
      var titulo = cap(fill(pick(["Como {beneficio} sem {dor}", "{Publico}: o guia para {beneficio}", "Por que você {dor} (e como mudar isso)"], ctx.rnd), ing));
      var t = [
        "# " + titulo,
        "",
        beatHook(ing, ctx) + " " + beatProblem(ing, ctx),
        "",
        "## O que realmente está acontecendo",
        beatAgitate(ing, ctx) + " " + cap(fill("A raiz costuma ser a mesma: falta de clareza sobre os números e os processos.", ing)),
        "",
        "## O caminho na prática",
        beatSolution(ing, ctx),
        (ing.benefits.length ? "\n" + beatBenefits(ing, ctx, ing.benefits.length) : ""),
        "",
        "## Conclusão",
        cap(fill("{Beneficio} é possível — e começa por uma decisão simples.", ing)),
        "",
        "> " + beatCTA(ing, ctx)
      ].filter(Boolean).join("\n");
      return { text: clean(t), structured: { titulo: titulo } };
    },

    roteiro_video: function (ing, ctx) {
      var R = [
        "[0:00 — GANCHO]\n" + beatHook(ing, ctx),
        "[0:05 — CONTEXTO]\n" + beatProblem(ing, ctx) + " " + beatAgitate(ing, ctx),
        "[0:20 — CONTEÚDO]\n" + beatSolution(ing, ctx) + (ing.benefits.length ? "\n" + beatBenefits(ing, ctx, 3) : ""),
        "[0:50 — VIRADA/PROVA]\n" + (beatProof(ing, ctx) || cap(fill("O {produto} existe justamente pra isso.", ing))),
        "[1:10 — CTA]\n" + beatCTA(ing, ctx) + emoji(ctx.persona, ctx.platform, "point")
      ];
      return { text: R.join("\n\n"), structured: { cenas: R } };
    },

    descricao_produto: function (ing, ctx) {
      var t = [
        cap(fill("{Produto} — {beneficio}.", ing)),
        "",
        "Para quem é: " + cap(ing.publico) + ".",
        "",
        "O que você ganha:",
        beatBenefits(ing, ctx, Math.max(3, ing.benefits.length)),
        "",
        (ing.caso ? "Resultado real: " + cap(ing.caso) + "\n" : ""),
        beatCTA(ing, ctx)
      ].filter(Boolean).join("\n");
      return { text: trimTo(clean(t), ctx.format.maxLen), structured: {} };
    }
  };

  /* ----------------------- provider (interno x externo) ----------------------- */
  var Provider = {
    internal: function (brief) {
      var persona = D.persona(brief.personaId) || D.PERSONAS[0];
      var objective = D.objective(brief.objectiveId) || D.OBJECTIVES[0];
      var platform = D.platform(brief.platformId) || null;
      var ing = ingredients(brief);
      var outputs = (brief.formatIds || []).map(function (fid, idx) {
        var format = D.format(fid); if (!format) return null;
        var seed = [brief.personaId, fid, brief.objectiveId, brief.platformId, JSON.stringify(brief.answers || {}), (brief.nonce || 0)].join("|");
        var ctx = {
          persona: persona, objective: objective, platform: platform, format: format,
          framework: D.FRAMEWORKS[format.framework], brief: brief,
          tone: toneFlags(persona), rnd: makeRng(seed + "#" + idx)
        };
        var r = (RENDER[fid] || RENDER.post)(ing, ctx);
        // política de plataforma: encurtar em canais "curto"
        var text = clean(r.text);
        if (platform && platform.style === "curto" && text.length > 600) text = trimTo(text, 600);
        return {
          formatId: fid, name: format.name, framework: (ctx.framework && ctx.framework.name) || "",
          text: text, structured: r.structured || {}, chars: text.length
        };
      }).filter(Boolean);
      return Promise.resolve({ outputs: outputs, provider: "internal", persona: persona.id });
    },
    external: function (brief) {
      // Ponto de plugagem futuro. O backend (Apps Script) faria a chamada ao LLM
      // com a API key guardada nas Script Properties. Enquanto não houver,
      // rejeitamos para o chamador cair no motor interno.
      if (!window.APP_STORE || !window.APP_STORE.hasBackend()) {
        return Promise.reject(new Error("IA externa não configurada — usando motor interno."));
      }
      return window.APP_STORE.callBackend("aiGenerate", {
        brief: brief, options: (window.APP_CONFIG.AI_EXTERNAL || {})
      }).then(function (res) {
        if (!res || !res.outputs) throw new Error("Resposta da IA externa inválida.");
        return { outputs: res.outputs, provider: "external", persona: brief.personaId };
      });
    }
  };

  /* ----------------------- API pública do motor ----------------------- */
  function generate(brief) {
    var provider = (brief.provider || window.APP_CONFIG.AI_PROVIDER || "internal");
    if (provider === "external") {
      return Provider.external(brief).catch(function () { return Provider.internal(brief); });
    }
    return Provider.internal(brief);
  }

  // Sugere perguntas de briefing que faltam (o sistema "pergunta antes").
  function missingQuestions(brief) {
    var q = [], a = brief.answers || {}, prod = D.product(brief.productId) || {};
    if (!a.publico && !prod.audience) q.push({ key: "publico", label: "Para quem é essa copy? (público-alvo)", ph: "Ex.: dona de salão faturando 20k/mês" });
    if (!a.dor && !(prod.pains && prod.pains.length)) q.push({ key: "dor", label: "Qual a dor principal que essa copy toca?", ph: "Ex.: trabalha muito e não sobra lucro" });
    if (!a.promessa && !prod.promise) q.push({ key: "promessa", label: "Qual a promessa/benefício central?", ph: "Ex.: ter clareza dos números em 30 dias" });
    if (!a.prova) q.push({ key: "prova", label: "Tem uma prova/caso real? (opcional, mas potencializa)", ph: "Ex.: aluna que dobrou a margem em 90 dias" });
    return q;
  }

  /* ----------------------- exportação padronizada (ex.: 4creaty) ----------------------- */
  function standardize(project, target) {
    var outs = project.outputs || [];
    if (target === "markdown") {
      return outs.map(function (o) { return "## " + o.name + "\n\n" + o.text; }).join("\n\n---\n\n");
    }
    if (target === "4creaty-json") {
      return JSON.stringify({
        origem: "4copys", versao: window.APP_CONFIG.VERSION,
        projeto: project.name, persona: project.personaId, objetivo: project.objectiveId,
        plataforma: project.platformId, produto: project.productId,
        criado_em: project.createdAt, itens: outs.map(function (o) {
          return { formato: o.formatId, titulo: o.name, framework: o.framework, texto: o.text, campos: o.structured || {} };
        })
      }, null, 2);
    }
    // texto simples
    return outs.map(function (o) { return "=== " + o.name + " ===\n" + o.text; }).join("\n\n");
  }

  /* ----------------------- cérebro (grafo de conexões, estilo Obsidian) ----------------------- */
  function tokenize(s) {
    return String(s || "").toLowerCase().normalize("NFD")
      .replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
      .filter(function (w) { return w.length > 3 && ["para", "como", "isso", "voce", "pelo", "pela", "mais", "seu", "sua", "que", "com", "dos", "das", "uma", "num"].indexOf(w) < 0; });
  }
  function buildGraph(store) {
    var nodes = [], edges = [], idset = {};
    function add(id, label, type) { if (!idset[id]) { idset[id] = 1; nodes.push({ id: id, label: label, type: type }); } }
    function link(a, b, w) { if (a && b && a !== b) edges.push({ a: a, b: b, w: w || 1 }); }

    D.PERSONAS.forEach(function (p) { add("persona:" + p.id, p.name, "persona"); });
    D.PRODUCTS.forEach(function (p) { add("produto:" + p.id, p.short, "produto"); if (p.persona) link("produto:" + p.id, "persona:" + p.persona, 2); });
    (store.sources || []).forEach(function (s) { add("fonte:" + s.id, s.name, "fonte"); if (s.persona) link("fonte:" + s.id, "persona:" + s.persona, 2); });
    (store.projects || []).forEach(function (pr) {
      add("copy:" + pr.id, pr.name, "copy");
      if (pr.personaId) link("copy:" + pr.id, "persona:" + pr.personaId, 1.5);
      if (pr.productId) link("copy:" + pr.id, "produto:" + pr.productId, 1);
    });

    // conexões por palavras-chave compartilhadas entre fontes e copys
    var docs = [];
    (store.sources || []).forEach(function (s) { docs.push({ id: "fonte:" + s.id, toks: tokenize(s.text) }); });
    (store.projects || []).forEach(function (pr) {
      var txt = (pr.outputs || []).map(function (o) { return o.text; }).join(" ") + " " + JSON.stringify(pr.answers || {});
      docs.push({ id: "copy:" + pr.id, toks: tokenize(txt) });
    });
    for (var i = 0; i < docs.length; i++) {
      for (var j = i + 1; j < docs.length; j++) {
        var setB = {}; docs[j].toks.forEach(function (t) { setB[t] = 1; });
        var shared = 0, seen = {};
        docs[i].toks.forEach(function (t) { if (setB[t] && !seen[t]) { seen[t] = 1; shared++; } });
        if (shared >= 3) link(docs[i].id, docs[j].id, Math.min(4, shared / 3));
      }
    }
    return { nodes: nodes, edges: edges };
  }

  /* ----------------------- análise de copy de concorrente ----------------------- */
  function analyzeCopy(text) {
    var t = String(text || "");
    var sentences = t.split(/[.!?\n]+/).filter(function (s) { return s.trim().length > 1; });
    var words = t.split(/\s+/).filter(Boolean);
    var avgLen = sentences.length ? Math.round(words.length / sentences.length) : 0;
    var emojis = (t.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).length;
    var questions = (t.match(/\?/g) || []).length;
    var exclam = (t.match(/!/g) || []).length;
    var imper = (t.match(/\b(clique|compre|garanta|acesse|comente|salve|compartilhe|inscreva|baixe|descubra|pare|comece|aprenda)\b/gi) || []).length;
    var caps = (t.match(/\b[A-ZÁÉÍÓÚÂ]{3,}\b/g) || []).length;
    var toks = tokenize(t); var freq = {}; toks.forEach(function (w) { freq[w] = (freq[w] || 0) + 1; });
    var top = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 8);
    // sugestão de skills a partir dos sinais
    var skills = {
      ousadia: Math.min(100, 40 + caps * 6 + exclam * 4),
      clareza: Math.max(20, 100 - Math.max(0, avgLen - 12) * 6),
      emocao: Math.min(100, 40 + emojis * 6 + exclam * 3),
      autoridade: Math.min(100, 45 + (avgLen > 16 ? 25 : 0) + top.length * 2),
      proximidade: Math.min(100, 40 + emojis * 5 + questions * 6),
      urgencia: Math.min(100, 35 + imper * 10 + exclam * 4)
    };
    var tomList = [];
    if (avgLen <= 9) tomList.push("frases curtas"); else if (avgLen >= 16) tomList.push("frases longas"); else tomList.push("frases médias");
    if (emojis > 3) tomList.push("uso alto de emoji"); else if (emojis === 0) tomList.push("sem emoji");
    if (questions >= 2) tomList.push("provoca com perguntas");
    if (imper >= 2) tomList.push("comando direto (imperativo)");
    if (caps >= 3) tomList.push("ênfase em CAIXA ALTA");
    return {
      stats: { frases: sentences.length, palavras: words.length, mediaFrase: avgLen, emojis: emojis, perguntas: questions, imperativos: imper },
      topWords: top, tom: tomList, skills: skills,
      emojiPolicy: emojis > 3 ? "heavy" : (emojis > 0 ? "light" : "none"),
      sentence: avgLen <= 9 ? "curtas" : (avgLen >= 16 ? "longas" : "medias")
    };
  }

  window.APP_ENGINE = {
    generate: generate, missingQuestions: missingQuestions,
    standardize: standardize, buildGraph: buildGraph, analyzeCopy: analyzeCopy,
    ingredients: ingredients, _RENDER: RENDER
  };
})();
