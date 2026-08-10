/* =====================================================================
   4copys — TELAS
   Cada função monta uma tela dentro de #view. Usa os helpers em window.APP
   (definidos em app.js) e os módulos APP_DATA / APP_ENGINE / APP_STORE.
   ===================================================================== */
(function () {
  "use strict";
  var D = window.APP_DATA, E = window.APP_ENGINE, S = window.APP_STORE;
  var SC = {};

  function A() { return window.APP; }
  function ic(name, cls) { return A().icon(name, cls); }
  function esc(s) { return A().escapeHtml(s); }

  /* ============================ HOME ============================ */
  SC.home = function () {
    var a = A(); var u = a.currentUser();
    var projects = S.listProjects();
    var q = (a.search || "").toLowerCase();
    if (q) projects = projects.filter(function (p) { return (p.name || "").toLowerCase().indexOf(q) >= 0; });

    var quickFormats = ["post", "email", "ads", "stories", "headlines", "whatsapp_grupo", "carta_vendas", "roteiro_video"];
    var html =
      '<div class="page-head"><h1 class="page-title">Olá, ' + esc((u && u.name || "").split(" ")[0] || "4blue") + '</h1>' +
      '<p class="page-sub">O que vamos escrever hoje? Escolha um formato ou abra um projeto.</p></div>' +

      '<div class="section-title">Começar do zero</div>' +
      '<div class="grid grid-auto" id="quick-formats">' +
        quickFormats.map(function (fid) {
          var f = D.format(fid);
          return '<div class="tile" data-quick="' + fid + '"><div class="tile-cover ' + f.cover + '">' + ic(f.icon) +
            '<span class="fmt-tag">' + esc(f.cat) + '</span></div><div class="tile-body"><p class="tile-title">' + esc(f.name) +
            '</p><div class="tile-meta">' + esc(f.desc) + '</div></div></div>';
        }).join("") +
      '</div>' +

      '<div class="flex-between" style="margin-top:30px"><div class="section-title" style="margin:0">Seus projetos</div>' +
      '<button class="btn btn-ghost btn-sm" data-nav="#/novo">' + ic("plus") + 'Nova copy</button></div>' +
      '<div class="grid grid-auto" id="projects-grid">' +
        '<div class="tile tile-new" data-nav="#/novo"><div class="plus">' + ic("plus") + '</div><span>Novo projeto</span></div>' +
        projects.map(projectTile).join("") +
      '</div>';

    if (!projects.length) html += '<div class="empty" style="margin-top:10px">' + ic("sparkles") + '<h3>Nenhum projeto ainda</h3><p>Clique em um formato acima para gerar sua primeira copy.</p></div>';

    a.mount(html);
    a.view.querySelectorAll("[data-quick]").forEach(function (t) {
      t.addEventListener("click", function () { a.navigate("#/novo?formato=" + t.getAttribute("data-quick")); });
    });
  };

  function projectTile(p) {
    var f = D.format((p.formatIds || [])[0]) || { cover: "cov-default", icon: "doc", name: "Copy" };
    var per = D.persona(p.personaId);
    return '<div class="tile" data-open="' + p.id + '"><div class="tile-cover ' + f.cover + '">' + ic(f.icon) +
      '<span class="fmt-tag">' + ((p.formatIds || []).length) + ' formato(s)</span></div>' +
      '<div class="tile-body"><p class="tile-title">' + esc(p.name) + '</p>' +
      '<div class="tile-meta"><span>' + esc(per ? per.name : "—") + '</span><span>·</span><span>' + A().fmtDate(p.updatedAt) + '</span>' +
      (p.shared ? '<span class="tag green" style="margin-left:auto">acervo</span>' : '') + '</div></div></div>';
  }

  /* ============================ EDITOR ============================ */
  var ed = null; // estado do editor

  SC.editor = function (params) {
    var a = A();
    if (params && params.id) {
      var proj = S.getProject(params.id);
      ed = proj ? JSON.parse(JSON.stringify(proj)) : newProjectState();
    } else {
      ed = newProjectState();
      if (params && params.formato) ed.formatIds = [params.formato];
    }
    renderEditor();
  };

  function newProjectState() {
    return {
      id: null, name: "", personaId: "betina", objectiveId: "venda", platformId: "instagram",
      productId: "mdl_pro", formatIds: ["post"], answers: {}, outputs: [], shared: false, useSources: true
    };
  }

  function renderEditor() {
    var a = A();
    var missing = E.missingQuestions(ed);
    var html =
      '<div class="flex-between page-head"><div><input id="ed-name" class="ed-name-input" placeholder="Nomeie seu projeto…" value="' + esc(ed.name) + '">' +
      '<p class="page-sub" style="margin-top:2px">Todo projeto precisa de um nome para ser salvo.</p></div>' +
      '<div class="wrap-actions"><button class="btn btn-ghost btn-sm" id="ed-save">' + ic("check") + 'Salvar</button>' +
      '<button class="btn btn-ghost btn-sm" id="ed-export">' + ic("download") + 'Exportar</button></div></div>' +

      '<div class="editor-grid">' +
        '<div class="editor-form">' +
          section("1 · Persona (tom de voz)", personaPicker()) +
          section("2 · Contexto", contextPickers()) +
          section("3 · Formatos (pode escolher vários)", formatPicker()) +
          section("4 · Briefing" + (missing.length ? ' <span class="badge-soft">' + missing.length + ' pergunta(s) sugerida(s)</span>' : ""), briefForm(missing)) +
          '<button class="btn btn-primary btn-lg btn-block" id="ed-generate" style="margin-top:8px">' + ic("sparkles") + 'Gerar ' + (ed.formatIds.length > 1 ? ed.formatIds.length + ' copys' : "copy") + '</button>' +
        '</div>' +
        '<div class="editor-out" id="ed-out">' + outputPanel() + '</div>' +
      '</div>';
    a.mount(html);
    wireEditor();
  }

  function section(title, body) {
    return '<div class="ed-section"><div class="ed-section-title">' + title + '</div>' + body + '</div>';
  }

  function personaPicker() {
    return '<div class="opt-grid">' + D.PERSONAS.map(function (p) {
      var sel = ed.personaId === p.id ? " sel" : "";
      var dot = p.status === "ready" ? "status-ready" : (p.status === "weak" ? "status-weak" : "status-open");
      return '<div class="opt-card' + sel + '" data-persona="' + p.id + '"><div class="oc-check">' + ic("check") + '</div>' +
        '<div class="oc-top"><div class="oc-ic" style="background:' + p.theme + ';color:#fff">' + esc(p.initials) + '</div>' +
        '<div><div class="oc-name">' + esc(p.name) + '</div><div class="oc-desc"><span class="status-dot ' + dot + '"></span> ' + esc(p.role) + '</div></div></div></div>';
    }).join("") + '</div>';
  }

  function selectField(label, key, list, valueKey, labelKey) {
    var cur = ed[key];
    return '<div class="field"><label class="lbl">' + label + '</label><select data-set="' + key + '">' +
      list.map(function (o) { return '<option value="' + o[valueKey] + '"' + (cur === o[valueKey] ? " selected" : "") + '>' + esc(o[labelKey] || o.name) + '</option>'; }).join("") +
      '</select></div>';
  }

  function contextPickers() {
    return '<div class="row">' +
      selectField("Produto", "productId", D.PRODUCTS, "id", "name") +
      selectField("Objetivo / CTA", "objectiveId", D.OBJECTIVES, "id", "name") +
      '</div><div class="row">' +
      selectField("Plataforma", "platformId", D.PLATFORMS, "id", "name") +
      '<div class="field"><label class="lbl">Usar fontes da persona</label><select data-set="useSources"><option value="1"' + (ed.useSources ? " selected" : "") + '>Sim, enriquecer com a base</option><option value="0"' + (!ed.useSources ? " selected" : "") + '>Não</option></select></div>' +
      '</div><p class="hint">' + esc((D.platform(ed.platformId) || {}).note || "") + '</p>';
  }

  function formatPicker() {
    return '<div class="chips">' + D.FORMATS.map(function (f) {
      var sel = ed.formatIds.indexOf(f.id) >= 0 ? " sel" : "";
      return '<button type="button" class="chip' + sel + '" data-format="' + f.id + '">' + ic(f.icon) + esc(f.name) + '</button>';
    }).join("") + '</div>';
  }

  function briefForm(missing) {
    var a = ed.answers;
    function ta(key, label, ph, hi) {
      var need = missing.some(function (m) { return m.key === key; });
      return '<div class="field"><label class="lbl">' + label + (need ? ' <span class="tag gold">sugerido</span>' : "") + '</label>' +
        '<textarea data-answer="' + key + '" placeholder="' + esc(ph) + '" style="min-height:64px">' + esc(a[key] || "") + '</textarea>' +
        (hi ? '<p class="hint">' + hi + '</p>' : "") + '</div>';
    }
    var out = ta("publico", "Público-alvo", "Ex.: dona de salão faturando 20k/mês, sempre no sufoco de caixa") +
      ta("dor", "Dor principal", "Ex.: trabalha demais e não sobra lucro no fim do mês") +
      ta("promessa", "Promessa / benefício central", "Ex.: clareza total dos números em 30 dias") +
      ta("prova", "Prova / caso real (opcional)", "Ex.: aluna que dobrou a margem em 90 dias") +
      ta("observacoes", "Observações extras p/ a IA (opcional)", "Ex.: evitar falar de preço; tom mais leve; citar a black friday");
    if (ed.formatIds.indexOf("whatsapp_individual") >= 0)
      out += '<div class="field"><label class="lbl">Nome do lead (WhatsApp individual)</label><input data-answer="nome_lead" placeholder="Ex.: Marina" value="' + esc(a.nome_lead || "") + '"></div>';
    return out;
  }

  function outputPanel() {
    if (!ed.outputs || !ed.outputs.length) {
      return '<div class="empty" style="border:1px dashed var(--line);border-radius:var(--radius);height:100%;display:flex;flex-direction:column;justify-content:center">' +
        ic("sparkles") + '<h3>Sua copy aparece aqui</h3><p>Preencha o briefing e clique em Gerar.<br>Você pode gerar vários formatos de uma vez.</p></div>';
    }
    var per = D.persona(ed.personaId);
    return '<div class="flex-between" style="margin-bottom:12px"><div class="section-title" style="margin:0">Resultado · ' + esc(per ? per.name : "") + '</div>' +
      '<div class="wrap-actions"><button class="btn btn-ghost btn-sm" id="out-regen">' + ic("sparkles") + 'Regerar</button>' +
      '<button class="btn btn-ghost btn-sm" id="out-copyall">' + ic("copy") + 'Copiar tudo</button></div></div>' +
      ed.outputs.map(function (o, i) {
        var f = D.format(o.formatId) || { cover: "cov-default", icon: "doc" };
        return '<div class="out-block"><div class="out-head"><div class="oh-ic ' + f.cover + '">' + ic(f.icon) + '</div>' +
          '<div><div class="oh-name">' + esc(o.name) + '</div><div class="tile-meta">' + (o.framework ? "Framework " + esc(o.framework) + " · " : "") + o.chars + ' caracteres</div></div>' +
          '<div class="oh-tools"><button class="copy-btn" data-copy="' + i + '">' + ic("copy") + 'Copiar</button></div></div>' +
          '<div class="out-body" data-outbody="' + i + '" contenteditable="true" spellcheck="true">' + esc(o.text) + '</div></div>';
      }).join("") +
      '<div class="wrap-actions" style="margin-top:6px"><label class="chip' + (ed.shared ? " sel" : "") + '" id="out-share"><input type="checkbox" ' + (ed.shared ? "checked" : "") + ' style="display:none">' + ic("users") + 'Publicar no acervo</label></div>';
  }

  function collectEditorInputs() {
    var a = A();
    var nameEl = a.view.querySelector("#ed-name"); if (nameEl) ed.name = nameEl.value.trim();
    a.view.querySelectorAll("[data-answer]").forEach(function (t) { ed.answers[t.getAttribute("data-answer")] = t.value; });
  }

  function wireEditor() { wireForm(); wireOutputs(); }

  function wireForm() {
    var a = A();
    a.view.querySelectorAll("[data-persona]").forEach(function (c) {
      c.addEventListener("click", function () { collectEditorInputs(); ed.personaId = c.getAttribute("data-persona"); renderEditor(); });
    });
    a.view.querySelectorAll("[data-set]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var k = sel.getAttribute("data-set");
        if (k === "useSources") ed.useSources = sel.value === "1"; else ed[k] = sel.value;
        if (k === "platformId" || k === "productId") { collectEditorInputs(); renderEditor(); }
      });
    });
    a.view.querySelectorAll("[data-format]").forEach(function (ch) {
      ch.addEventListener("click", function () {
        collectEditorInputs();
        var fid = ch.getAttribute("data-format"); var i = ed.formatIds.indexOf(fid);
        if (i >= 0) { if (ed.formatIds.length > 1) ed.formatIds.splice(i, 1); } else ed.formatIds.push(fid);
        renderEditor();
      });
    });
    var gen = a.view.querySelector("#ed-generate"); if (gen) gen.addEventListener("click", doGenerate);
    var save = a.view.querySelector("#ed-save"); if (save) save.addEventListener("click", doSave);
    var exp = a.view.querySelector("#ed-export"); if (exp) exp.addEventListener("click", doExport);
  }

  // Só os controles do painel de resultado — re-chamado após (re)gerar, sem
  // duplicar os listeners do formulário à esquerda.
  function wireOutputs() {
    var a = A();
    var regen = a.view.querySelector("#out-regen"); if (regen) regen.addEventListener("click", function () { ed.nonce = (ed.nonce || 0) + 1; doGenerate(); });
    var copyall = a.view.querySelector("#out-copyall"); if (copyall) copyall.addEventListener("click", function () {
      a.copyText(ed.outputs.map(function (o) { return o.text; }).join("\n\n———\n\n"));
    });
    a.view.querySelectorAll("[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () { a.copyText(ed.outputs[+b.getAttribute("data-copy")].text); });
    });
    a.view.querySelectorAll("[data-outbody]").forEach(function (bd) {
      bd.addEventListener("input", function () { ed.outputs[+bd.getAttribute("data-outbody")].text = bd.innerText; });
    });
    var share = a.view.querySelector("#out-share"); if (share) share.addEventListener("click", function () {
      ed.shared = !ed.shared; share.classList.toggle("sel", ed.shared);
    });
  }

  function doGenerate() {
    var a = A(); collectEditorInputs();
    if (ed.useSources) ed.sources = S.sourcesForPersona(ed.personaId);
    var out = a.view.querySelector("#ed-out");
    out.innerHTML = '<div class="loading-copy"><div class="ring"></div><p>Escrevendo com a voz de ' + esc((D.persona(ed.personaId) || {}).name) + '…</p></div>';
    ed.provider = window.APP_CONFIG.AI_PROVIDER;
    E.generate(ed).then(function (res) {
      ed.outputs = res.outputs; ed.generatedBy = res.provider;
      out.innerHTML = outputPanel(); wireOutputs();
      a.toast("Copy gerada com o motor " + (res.provider === "external" ? "externo" : "interno"), "ok");
    }).catch(function (err) {
      out.innerHTML = '<div class="empty">' + ic("sparkles") + '<h3>Não deu pra gerar</h3><p>' + esc(err.message || "") + '</p></div>';
    });
  }

  function doSave() {
    var a = A(); collectEditorInputs();
    if (!ed.name) { a.toast("Dê um nome ao projeto antes de salvar", "err"); var n = a.view.querySelector("#ed-name"); if (n) n.focus(); return; }
    var saved = S.saveProject(ed); ed.id = saved.id;
    a.toast("Projeto salvo", "ok");
  }

  function doExport() {
    var a = A(); collectEditorInputs();
    if (!ed.outputs || !ed.outputs.length) { a.toast("Gere a copy antes de exportar", "err"); return; }
    var targets = { "texto": "Texto para colar", "markdown": "Markdown (.md)", "4creaty-json": "JSON padrão 4creaty" };
    var body = '<div class="field"><label class="lbl">Formato de saída</label><select id="exp-target">' +
      Object.keys(targets).map(function (k) { return '<option value="' + k + '">' + targets[k] + '</option>'; }).join("") + '</select></div>' +
      '<textarea id="exp-text" style="min-height:280px;font-family:ui-monospace,monospace;font-size:13px"></textarea>';
    a.modal({
      title: "Exportar copy", body: body, wide: true,
      actions: [
        { label: "Copiar", cls: "btn-ghost", onClick: function () { a.copyText(document.getElementById("exp-text").value); } },
        { label: "Baixar arquivo", cls: "btn-primary", onClick: function () {
            var t = document.getElementById("exp-target").value;
            var ext = t === "markdown" ? "md" : (t === "4creaty-json" ? "json" : "txt");
            a.download((ed.name || "copy").replace(/\s+/g, "-").toLowerCase() + "." + ext, document.getElementById("exp-text").value);
        } }
      ],
      onOpen: function () {
        function refresh() { document.getElementById("exp-text").value = E.standardize(ed, document.getElementById("exp-target").value); }
        document.getElementById("exp-target").addEventListener("change", refresh); refresh();
      }
    });
  }

  /* ============================ PERSONAS ============================ */
  SC.personas = function () {
    var a = A();
    var html = '<div class="flex-between page-head"><div><h1 class="page-title">Personas</h1>' +
      '<p class="page-sub">Cada persona é um agente com tom e escrita próprios — como um personagem com habilidades.</p></div>' +
      '<div class="wrap-actions"><button class="btn btn-ghost btn-sm" data-nav="#/analisar">' + ic("search") + 'Criar por análise</button>' +
      '<button class="btn btn-primary btn-sm" id="new-persona">' + ic("plus") + 'Nova persona</button></div></div>' +
      '<div class="grid grid-3">' + D.PERSONAS.map(personaCard).join("") + '</div>';
    a.mount(html);
    a.view.querySelectorAll("[data-persona-open]").forEach(function (c) {
      c.addEventListener("click", function () { a.navigate("#/persona/" + c.getAttribute("data-persona-open")); });
    });
    var np = a.view.querySelector("#new-persona"); if (np) np.addEventListener("click", function () {
      var p = blankPersona(); S.savePersona(p); a.navigate("#/persona/" + p.id);
    });
  };

  function personaCard(p) {
    var statusTag = p.status === "ready" ? '<span class="tag green">base pronta</span>' :
      (p.status === "weak" ? '<span class="tag gold">base fraca</span>' : '<span class="tag gray">em aberto</span>');
    var skills = D.SKILL_AXES.slice(0, 3).map(function (ax) {
      var v = (p.skills && p.skills[ax.key]) || 0;
      return '<div class="skill-row"><span class="sk-name">' + ax.label + '</span><div class="skill-track"><div class="skill-fill" style="width:' + v + '%"></div></div><span class="sk-val">' + v + '</span></div>';
    }).join("");
    return '<div class="persona-card" data-persona-open="' + p.id + '"><div class="persona-top" style="background:' + p.theme + '">' +
      '<div class="persona-avatar">' + esc(p.initials) + '</div><div><p class="persona-name">' + esc(p.name) + '</p>' +
      '<div class="persona-role">' + esc(p.role) + '</div></div></div>' +
      '<div class="persona-body"><div style="margin-bottom:8px">' + statusTag + '</div>' +
      '<p class="persona-tone">' + esc((p.personality || "").slice(0, 120)) + ((p.personality || "").length > 120 ? "…" : "") + '</p>' +
      '<div style="margin-top:10px">' + skills + '</div></div></div>';
  }

  function blankPersona() {
    return {
      id: S.uid("persona"), name: "Nova persona", role: "(defina o papel)", status: "open", initials: "NP",
      theme: "linear-gradient(135deg,#0072CE,#004882)", personality: "", values: [], symbols: [], mantras: [],
      stories: "", transcricoes: "", inimigo: "", casos: "",
      voice: { sentence: "medias", emoji: "none", vocab: [], powerWords: [], avoid: [], openers: [], bridges: [], signature: "" },
      skills: { ousadia: 50, clareza: 50, emocao: 50, autoridade: 50, proximidade: 50, urgencia: 50 }
    };
  }

  /* ===================== PERSONA DETALHE / EDIÇÃO ===================== */
  SC.persona = function (params) {
    var a = A(); var p = D.persona(params.id);
    if (!p) { a.mount('<div class="empty">' + ic("users") + '<h3>Persona não encontrada</h3></div>'); return; }
    function list(arr) { return (arr || []).join("\n"); }
    var vv = p.voice || {};
    var html =
      '<div class="flex-between page-head"><div class="flex"><div class="persona-avatar" style="background:' + p.theme + ';width:46px;height:46px;border-radius:12px;font-size:18px">' + esc(p.initials) + '</div>' +
      '<div><h1 class="page-title" style="font-size:26px">' + esc(p.name) + '</h1><p class="page-sub" style="margin:0">Editando a construção da persona</p></div></div>' +
      '<div class="wrap-actions"><button class="btn btn-ghost btn-sm" data-nav="#/personas">Voltar</button><button class="btn btn-primary btn-sm" id="persona-save">' + ic("check") + 'Salvar persona</button></div></div>' +

      '<div class="grid grid-2">' +
        '<div class="card"><h3 class="blk">Identidade</h3>' +
          f2("Nome", "name", p.name) + row2(f2("Papel / arquétipo", "role", p.role), selField("Status", "status", [["ready", "Base pronta"], ["weak", "Base fraca"], ["open", "Em aberto"]], p.status)) +
          f2("Iniciais (avatar)", "initials", p.initials) +
          taField("Personalidade", "personality", p.personality, "Como essa persona pensa e fala") +
          taField("Características e valores (um por linha)", "values", list(p.values)) +
          taField("Símbolos (um por linha)", "symbols", list(p.symbols)) +
          taField("Mantras / bordões (um por linha)", "mantras", list(p.mantras)) +
        '</div>' +
        '<div class="card"><h3 class="blk">Narrativa & provas</h3>' +
          taField("Histórias", "stories", p.stories) +
          taField("Transcrições (falas reais p/ calibrar o tom)", "transcricoes", p.transcricoes) +
          taField("Inimigo em comum", "inimigo", p.inimigo) +
          taField("Estudos de caso", "casos", p.casos) +
        '</div>' +
        '<div class="card"><h3 class="blk">Voz & escrita</h3>' +
          row2(selField("Tamanho de frase", "voice.sentence", [["curtas", "Curtas"], ["medias", "Médias"], ["longas", "Longas"]], vv.sentence), selField("Uso de emoji", "voice.emoji", [["none", "Nenhum"], ["light", "Leve"], ["heavy", "Alto"]], vv.emoji)) +
          taField("Vocabulário característico (um por linha)", "voice.vocab", list(vv.vocab)) +
          taField("Palavras de poder (um por linha)", "voice.powerWords", list(vv.powerWords)) +
          taField("Evitar (um por linha)", "voice.avoid", list(vv.avoid)) +
          taField("Aberturas / ganchos — use {dor} {publico} {beneficio} {produto}", "voice.openers", list(vv.openers)) +
          taField("Pontes / transições (uma por linha)", "voice.bridges", list(vv.bridges)) +
          f2("Assinatura", "voice.signature", vv.signature) +
        '</div>' +
        '<div class="card"><h3 class="blk">Habilidades (como personagem de jogo)</h3>' +
          '<p class="hint" style="margin-top:0">Esses valores mudam o jeito que o motor escreve.</p>' +
          D.SKILL_AXES.map(function (ax) {
            var v = (p.skills && p.skills[ax.key]) || 50;
            return '<div class="skill-row"><span class="sk-name">' + ax.label + '</span>' +
              '<input type="range" min="0" max="100" value="' + v + '" data-skill="' + ax.key + '" style="flex:1;height:auto;padding:0">' +
              '<span class="sk-val" data-skillval="' + ax.key + '">' + v + '</span></div>';
          }).join("") +
        '</div>' +
      '</div>';
    a.mount(html);

    a.view.querySelectorAll("[data-skill]").forEach(function (r) {
      r.addEventListener("input", function () { a.view.querySelector('[data-skillval="' + r.getAttribute("data-skill") + '"]').textContent = r.value; });
    });
    a.view.querySelector("#persona-save").addEventListener("click", function () {
      function getv(f) { var elx = a.view.querySelector('[data-f="' + f + '"]'); return elx ? elx.value : ""; }
      function getlist(f) { return getv(f).split("\n").map(function (s) { return s.trim(); }).filter(Boolean); }
      var np = JSON.parse(JSON.stringify(p));
      np.name = getv("name") || p.name; np.role = getv("role"); np.status = getv("status"); np.initials = (getv("initials") || p.initials).slice(0, 3).toUpperCase();
      np.personality = getv("personality"); np.values = getlist("values"); np.symbols = getlist("symbols"); np.mantras = getlist("mantras");
      np.stories = getv("stories"); np.transcricoes = getv("transcricoes"); np.inimigo = getv("inimigo"); np.casos = getv("casos");
      np.voice = np.voice || {};
      np.voice.sentence = getv("voice.sentence"); np.voice.emoji = getv("voice.emoji");
      np.voice.vocab = getlist("voice.vocab"); np.voice.powerWords = getlist("voice.powerWords"); np.voice.avoid = getlist("voice.avoid");
      np.voice.openers = getlist("voice.openers"); np.voice.bridges = getlist("voice.bridges"); np.voice.signature = getv("voice.signature");
      np.skills = {}; a.view.querySelectorAll("[data-skill]").forEach(function (r) { np.skills[r.getAttribute("data-skill")] = +r.value; });
      S.savePersona(np); a.toast("Persona salva", "ok"); a.navigate("#/personas");
    });
  };

  function f2(label, f, val) { return '<div class="field"><label class="lbl">' + label + '</label><input data-f="' + f + '" value="' + esc(val || "") + '"></div>'; }
  function taField(label, f, val, hi) { return '<div class="field"><label class="lbl">' + label + '</label><textarea data-f="' + f + '">' + esc(val || "") + '</textarea>' + (hi ? '<p class="hint">' + hi + '</p>' : "") + '</div>'; }
  function selField(label, f, opts, cur) { return '<div class="field"><label class="lbl">' + label + '</label><select data-f="' + f + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (cur === o[0] ? " selected" : "") + '>' + esc(o[1]) + '</option>'; }).join("") + '</select></div>'; }
  function row2(a1, b1) { return '<div class="row">' + a1 + b1 + '</div>'; }

  /* ============================ ACERVO ============================ */
  SC.acervo = function () {
    var a = A(); var lib = S.listLibrary();
    var html = '<div class="page-head"><h1 class="page-title">Acervo</h1><p class="page-sub">Copys publicadas pela equipe. Você pode duplicar qualquer uma para o seu histórico.</p></div>';
    if (!lib.length) html += '<div class="empty">' + ic("layers") + '<h3>Acervo vazio</h3><p>Publique uma copy pelo editor (marque “Publicar no acervo”).</p></div>';
    else html += '<div class="grid grid-auto">' + lib.map(function (p) {
      var f = D.format((p.formatIds || [])[0]) || { cover: "cov-default", icon: "doc" };
      var per = D.persona(p.personaId);
      return '<div class="tile" data-lib="' + p.id + '"><div class="tile-cover ' + f.cover + '">' + ic(f.icon) + '<span class="fmt-tag">' + esc(per ? per.name : "") + '</span></div>' +
        '<div class="tile-body"><p class="tile-title">' + esc(p.name) + '</p><div class="tile-meta"><span>por ' + esc(p.ownerName || "equipe") + '</span></div></div></div>';
    }).join("") + '</div>';
    a.mount(html);
    a.view.querySelectorAll("[data-lib]").forEach(function (t) {
      t.addEventListener("click", function () { previewLibrary(t.getAttribute("data-lib")); });
    });
  };

  function previewLibrary(id) {
    var a = A(); var lib = S.listLibrary(); var p = lib.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    var body = (p.outputs || []).map(function (o) { return '<div class="out-block"><div class="out-head"><div class="oh-name">' + esc(o.name) + '</div></div><div class="out-body">' + esc(o.text) + '</div></div>'; }).join("");
    a.modal({
      title: p.name, body: body || "<p>Sem conteúdo.</p>", wide: true,
      actions: [{ label: "Duplicar para meus projetos", cls: "btn-primary", onClick: function () {
        var np = S.duplicateFromLibrary(id); a.closeModal(); if (np) a.navigate("#/projeto/" + np.id);
      } }]
    });
  }

  /* ============================ FONTES ============================ */
  SC.fontes = function () {
    var a = A(); var sources = S.listSources();
    var html = '<div class="flex-between page-head"><div><h1 class="page-title">Fontes de dados</h1>' +
      '<p class="page-sub">Alimente a IA: apresentações, cursos, transcrições, depoimentos, pesquisas, hooks. Cada fonte recebe uma persona.</p></div>' +
      '<button class="btn btn-primary btn-sm" id="new-source">' + ic("plus") + 'Nova fonte</button></div>';
    if (!sources.length) html += '<div class="empty">' + ic("folder") + '<h3>Nenhuma fonte ainda</h3><p>Adicione textos, transcrições ou dados para o cérebro conectar.</p></div>';
    else html += '<div class="grid grid-2">' + sources.map(function (s) {
      var per = D.persona(s.persona);
      return '<div class="card"><div class="flex-between"><div class="flex">' + ic("doc") +
        '<div><b>' + esc(s.name) + '</b><div class="tile-meta"><span class="tag blue">' + esc(per ? per.name : "sem persona") + '</span> <span class="tag gray">' + esc(s.type || "texto") + '</span></div></div></div>' +
        '<button class="btn btn-danger btn-sm" data-del-src="' + s.id + '">Excluir</button></div>' +
        '<p class="txt-sm txt-muted" style="margin-top:10px">' + esc((s.text || "").slice(0, 220)) + ((s.text || "").length > 220 ? "…" : "") + '</p></div>';
    }).join("") + '</div>';
    a.mount(html);
    var nb = a.view.querySelector("#new-source"); if (nb) nb.addEventListener("click", function () { sourceModal(); });
    a.view.querySelectorAll("[data-del-src]").forEach(function (b) {
      b.addEventListener("click", function () { S.deleteSource(b.getAttribute("data-del-src")); SC.fontes(); });
    });
  };

  function sourceModal() {
    var a = A();
    var body =
      '<div class="field"><label class="lbl">Nome da fonte</label><input id="src-name" placeholder="Ex.: Transcrição aula 1 MDL"></div>' +
      '<div class="row"><div class="field"><label class="lbl">Persona (estilo que essa fonte representa)</label><select id="src-persona">' +
        D.PERSONAS.map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + '</option>'; }).join("") + '</select></div>' +
      '<div class="field"><label class="lbl">Tipo</label><select id="src-type"><option>texto</option><option>documento</option><option>planilha</option><option>transcrição áudio/vídeo</option><option>depoimento</option><option>pesquisa</option><option>hooks</option><option>url</option></select></div></div>' +
      '<div class="field"><label class="lbl">Conteúdo</label><textarea id="src-text" style="min-height:160px" placeholder="Cole aqui o texto, transcrição, dados ou hooks…"></textarea>' +
      '<p class="hint">Você pode carregar um arquivo .txt / .csv / .md e o conteúdo entra aqui. PDFs/áudios: cole a transcrição (transcrição automática será um conector externo no futuro).</p>' +
      '<input type="file" id="src-file" accept=".txt,.csv,.md,.json" style="margin-top:8px"></div>';
    a.modal({
      title: "Nova fonte de dados", body: body, wide: true,
      actions: [{ label: "Salvar fonte", cls: "btn-primary", onClick: function () {
        var s = { name: (document.getElementById("src-name").value || "Fonte").trim(), persona: document.getElementById("src-persona").value, type: document.getElementById("src-type").value, text: document.getElementById("src-text").value };
        if (!s.text.trim()) { a.toast("Cole algum conteúdo", "err"); return; }
        S.saveSource(s); a.closeModal(); a.toast("Fonte salva — cérebro atualizado", "ok"); SC.fontes();
      } }],
      onOpen: function () {
        document.getElementById("src-file").addEventListener("change", function (e) {
          var file = e.target.files[0]; if (!file) return; var r = new FileReader();
          r.onload = function () { var t = document.getElementById("src-text"); t.value = (t.value ? t.value + "\n" : "") + r.result; if (!document.getElementById("src-name").value) document.getElementById("src-name").value = file.name; };
          r.readAsText(file);
        });
      }
    });
  }

  /* ============================ ANALISAR ============================ */
  SC.analisar = function () {
    var a = A();
    var html = '<div class="page-head"><h1 class="page-title">Analisar copy</h1><p class="page-sub">Cole a copy de um concorrente/referência. O motor extrai o estilo e pode virar uma persona.</p></div>' +
      '<div class="grid grid-2"><div class="card"><div class="field"><label class="lbl">Copy de referência</label><textarea id="an-text" style="min-height:280px" placeholder="Cole aqui o texto do anúncio, post, e-mail…"></textarea></div>' +
      '<button class="btn btn-primary btn-block" id="an-run">' + ic("search") + 'Analisar estilo</button></div>' +
      '<div id="an-out"><div class="empty" style="height:100%;display:flex;flex-direction:column;justify-content:center;border:1px dashed var(--line);border-radius:var(--radius)">' + ic("sparkles") + '<h3>Resultado da análise</h3><p>Métricas, tom e habilidades sugeridas aparecem aqui.</p></div></div></div>';
    a.mount(html);
    a.view.querySelector("#an-run").addEventListener("click", function () {
      var txt = a.view.querySelector("#an-text").value; if (!txt.trim()) { a.toast("Cole uma copy primeiro", "err"); return; }
      var r = E.analyzeCopy(txt);
      window._lastAnalysis = { r: r, text: txt };
      var skills = D.SKILL_AXES.map(function (ax) {
        var v = Math.round(r.skills[ax.key] || 0);
        return '<div class="skill-row"><span class="sk-name">' + ax.label + '</span><div class="skill-track"><div class="skill-fill" style="width:' + v + '%"></div></div><span class="sk-val">' + v + '</span></div>';
      }).join("");
      a.view.querySelector("#an-out").innerHTML = '<div class="card"><h3 class="blk">Leitura de estilo</h3>' +
        '<div class="persona-stats"><div class="stat"><b>' + r.stats.mediaFrase + '</b><span>palavras/frase</span></div><div class="stat"><b>' + r.stats.emojis + '</b><span>emojis</span></div><div class="stat"><b>' + r.stats.perguntas + '</b><span>perguntas</span></div><div class="stat"><b>' + r.stats.imperativos + '</b><span>comandos</span></div></div>' +
        '<div style="margin-top:12px"><div class="lbl" style="margin-bottom:6px">Tom detectado</div><div class="chips">' + r.tom.map(function (t) { return '<span class="tag blue">' + esc(t) + '</span>'; }).join("") + '</div></div>' +
        '<div style="margin-top:12px"><div class="lbl" style="margin-bottom:6px">Palavras recorrentes</div><div class="chips">' + r.topWords.map(function (t) { return '<span class="tag gray">' + esc(t) + '</span>'; }).join("") + '</div></div>' +
        '<div style="margin-top:14px"><div class="lbl" style="margin-bottom:6px">Habilidades sugeridas</div>' + skills + '</div>' +
        '<button class="btn btn-primary btn-block mt16" id="an-make">' + ic("plus") + 'Criar persona a partir deste estilo</button></div>';
      a.view.querySelector("#an-make").addEventListener("click", function () {
        var p = blankPersona(); p.name = "Persona analisada"; p.role = "Extraída de referência"; p.status = "weak";
        p.voice.sentence = r.sentence; p.voice.emoji = r.emojiPolicy; p.voice.powerWords = r.topWords.slice(0, 6); p.skills = {};
        D.SKILL_AXES.forEach(function (ax) { p.skills[ax.key] = Math.round(r.skills[ax.key] || 50); });
        p.personality = "Estilo extraído automaticamente: " + r.tom.join(", ") + ". Refine com dados reais.";
        S.savePersona(p); a.toast("Persona criada a partir da análise", "ok"); a.navigate("#/persona/" + p.id);
      });
    });
  };

  /* ============================ CÉREBRO ============================ */
  SC.cerebro = function () {
    var a = A();
    var g = E.buildGraph(S.graphSnapshot());
    var html = '<div class="page-head"><h1 class="page-title">Cérebro</h1><p class="page-sub">Conexões entre personas, produtos, fontes e copys — quanto mais você alimenta, mais robusto fica.</p></div>' +
      '<div class="brain-canvas" id="brain"></div>' +
      '<div class="brain-legend"><span><span class="lg-dot" style="background:#e83e8c"></span>Persona</span><span><span class="lg-dot" style="background:#0072CE"></span>Produto</span><span><span class="lg-dot" style="background:#20c997"></span>Fonte</span><span><span class="lg-dot" style="background:#F6BF00"></span>Copy</span></div>' +
      '<p class="hint">' + g.nodes.length + ' nós · ' + g.edges.length + ' conexões. Adicione fontes e gere copys para o grafo crescer.</p>';
    a.mount(html);
    drawGraph(document.getElementById("brain"), g);
  };

  function drawGraph(container, g) {
    var W = container.clientWidth || 800, H = container.clientHeight || 520;
    var colors = { persona: "#e83e8c", produto: "#0072CE", fonte: "#20c997", copy: "#F6BF00" };
    var nodes = g.nodes.map(function (n, i) {
      var ang = (i / Math.max(1, g.nodes.length)) * Math.PI * 2;
      return { id: n.id, label: n.label, type: n.type, x: W / 2 + Math.cos(ang) * (Math.min(W, H) / 3), y: H / 2 + Math.sin(ang) * (Math.min(W, H) / 3), vx: 0, vy: 0 };
    });
    var byId = {}; nodes.forEach(function (n) { byId[n.id] = n; });
    var edges = g.edges.filter(function (e) { return byId[e.a] && byId[e.b]; });
    // simulação de força simples (síncrona)
    for (var it = 0; it < 140; it++) {
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y; var d = Math.sqrt(dx * dx + dy * dy) || 1;
          var rep = 2200 / (d * d); nodes[i].vx += dx / d * rep; nodes[i].vy += dy / d * rep; nodes[j].vx -= dx / d * rep; nodes[j].vy -= dy / d * rep;
        }
      }
      edges.forEach(function (e) {
        var A1 = byId[e.a], B1 = byId[e.b]; var dx = B1.x - A1.x, dy = B1.y - A1.y; var d = Math.sqrt(dx * dx + dy * dy) || 1;
        var f = (d - 90) * 0.02 * (e.w || 1); A1.vx += dx / d * f; A1.vy += dy / d * f; B1.vx -= dx / d * f; B1.vy -= dy / d * f;
      });
      nodes.forEach(function (n) {
        n.vx += (W / 2 - n.x) * 0.002; n.vy += (H / 2 - n.y) * 0.002;
        n.x += Math.max(-8, Math.min(8, n.vx)); n.y += Math.max(-8, Math.min(8, n.vy)); n.vx *= 0.82; n.vy *= 0.82;
        n.x = Math.max(24, Math.min(W - 24, n.x)); n.y = Math.max(24, Math.min(H - 24, n.y));
      });
    }
    var svg = '<svg width="100%" height="100%" viewBox="0 0 ' + W + ' ' + H + '" style="position:absolute;inset:0">';
    edges.forEach(function (e) { var A1 = byId[e.a], B1 = byId[e.b]; svg += '<line x1="' + A1.x + '" y1="' + A1.y + '" x2="' + B1.x + '" y2="' + B1.y + '" stroke="#c9d6e6" stroke-width="' + Math.min(3, e.w) + '"/>'; });
    nodes.forEach(function (n) {
      var r = n.type === "persona" ? 11 : (n.type === "produto" ? 9 : 7);
      svg += '<g><circle cx="' + n.x + '" cy="' + n.y + '" r="' + r + '" fill="' + (colors[n.type] || "#888") + '" stroke="#fff" stroke-width="2"><title>' + esc(n.label) + '</title></circle>' +
        '<text x="' + n.x + '" y="' + (n.y - r - 4) + '" font-size="10" font-weight="700" fill="#5a6470" text-anchor="middle">' + esc(n.label.slice(0, 16)) + '</text></g>';
    });
    svg += '</svg>';
    container.innerHTML = svg;
  }

  /* ============================ PRODUTOS ============================ */
  SC.produtos = function () {
    var a = A();
    var html = '<div class="page-head"><h1 class="page-title">Produtos</h1><p class="page-sub">Base de cada produto: promessa, público, dores e benefícios. Alimenta o motor.</p></div>' +
      '<div class="grid grid-2">' + D.PRODUCTS.map(function (p) {
        var per = D.persona(p.persona);
        return '<div class="card" data-prod="' + p.id + '" style="cursor:pointer"><div class="flex-between"><h3 class="blk">' + esc(p.name) + '</h3>' + (per ? '<span class="tag blue">' + esc(per.name) + '</span>' : "") + '</div>' +
          '<p class="txt-sm txt-muted">' + esc(p.promise) + '</p>' +
          '<div class="chips" style="margin-top:8px">' + (p.benefits || []).slice(0, 3).map(function (b) { return '<span class="tag gray">' + esc(b) + '</span>'; }).join("") + '</div></div>';
      }).join("") + '</div>';
    a.mount(html);
    a.view.querySelectorAll("[data-prod]").forEach(function (c) { c.addEventListener("click", function () { productModal(c.getAttribute("data-prod")); }); });
  };

  function productModal(id) {
    var a = A(); var p = D.product(id); if (!p) return;
    var body = f2b("Nome", "name", p.name) + f2b("Promessa central", "promise", p.promise) + f2b("Público", "audience", p.audience) +
      taField2("Dores (uma por linha)", "pains", (p.pains || []).join("\n")) + taField2("Benefícios (um por linha)", "benefits", (p.benefits || []).join("\n")) +
      '<div class="field"><label class="lbl">Persona padrão</label><select data-pf="persona">' + D.PERSONAS.map(function (x) { return '<option value="' + x.id + '"' + (p.persona === x.id ? " selected" : "") + '>' + esc(x.name) + '</option>'; }).join("") + '</select></div>';
    a.modal({
      title: "Editar produto", body: body, wide: true,
      actions: [{ label: "Salvar produto", cls: "btn-primary", onClick: function () {
        function gv(f) { var e = document.querySelector('[data-pf="' + f + '"]'); return e ? e.value : ""; }
        var np = JSON.parse(JSON.stringify(p));
        np.name = gv("name"); np.promise = gv("promise"); np.audience = gv("audience");
        np.pains = gv("pains").split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
        np.benefits = gv("benefits").split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
        np.persona = gv("persona");
        S.saveProduct(np); a.closeModal(); a.toast("Produto atualizado", "ok"); SC.produtos();
      } }]
    });
    function f2b(l, f, v) { return '<div class="field"><label class="lbl">' + l + '</label><input data-pf="' + f + '" value="' + esc(v || "") + '"></div>'; }
    function taField2(l, f, v) { return '<div class="field"><label class="lbl">' + l + '</label><textarea data-pf="' + f + '">' + esc(v || "") + '</textarea></div>'; }
  }

  /* ============================ CONFIG ============================ */
  SC.config = function () {
    var a = A(); var u = a.currentUser();
    var html = '<div class="page-head"><h1 class="page-title">Configurações</h1><p class="page-sub">Motor de IA, backend e dados.</p></div>' +
      '<div class="grid grid-2"><div class="card"><h3 class="blk">Motor de IA</h3>' +
        '<div class="field"><label class="lbl">Provedor</label><select id="cfg-provider"><option value="internal"' + (window.APP_CONFIG.AI_PROVIDER === "internal" ? " selected" : "") + '>Interno (regras/templates)</option><option value="external"' + (window.APP_CONFIG.AI_PROVIDER === "external" ? " selected" : "") + '>Externo (LLM via backend)</option></select>' +
        '<p class="hint">O provedor externo exige backend configurado e uma IA ligada no Apps Script. Enquanto não houver, o app usa o motor interno automaticamente.</p></div></div>' +
      '<div class="card"><h3 class="blk">Backend (Google Sheets)</h3><p class="txt-sm">Status: ' + (S.hasBackend() ? '<span class="tag green">conectado</span>' : '<span class="tag gold">offline (salvando neste navegador)</span>') + '</p>' +
        '<p class="hint">Para conectar, publique o Apps Script (pasta <b>apps-script/</b>) e cole a URL <code>/exec</code> em <b>config.js → APPS_SCRIPT_URL</b>. Veja o README.</p></div>' +
      '<div class="card"><h3 class="blk">Seus dados</h3>' +
        '<div class="wrap-actions"><button class="btn btn-ghost btn-sm" id="cfg-export">' + ic("download") + 'Exportar dados (JSON)</button>' +
        '<label class="btn btn-ghost btn-sm">' + ic("copy") + 'Importar<input type="file" id="cfg-import" accept=".json" hidden></label></div>' +
        '<p class="hint">Backup local de projetos, personas e fontes deste navegador.</p></div>' +
      '<div class="card"><h3 class="blk">Conta</h3><p class="txt-sm txt-muted">' + esc(u ? u.name : "") + ' · ' + esc(u ? u.email : "") + '</p>' +
        '<button class="btn btn-danger btn-sm mt8" id="cfg-logout">' + ic("logout") + 'Sair</button></div></div>';
    a.mount(html);
    a.view.querySelector("#cfg-provider").addEventListener("change", function (e) {
      window.APP_CONFIG.AI_PROVIDER = e.target.value; try { localStorage.setItem("4copys:aiProvider", e.target.value); } catch (x) {}
      a.refreshBadge(); a.toast("Provedor: " + e.target.value, "ok");
    });
    a.view.querySelector("#cfg-export").addEventListener("click", function () {
      var dump = {}; ["projects", "personaOverrides", "productOverrides", "sources"].forEach(function (k) { try { dump[k] = JSON.parse(localStorage.getItem("4copys:" + k) || "null"); } catch (e) {} });
      a.download("4copys-backup.json", JSON.stringify(dump, null, 2));
    });
    a.view.querySelector("#cfg-import").addEventListener("change", function (e) {
      var file = e.target.files[0]; if (!file) return; var r = new FileReader();
      r.onload = function () { try { var d = JSON.parse(r.result); Object.keys(d).forEach(function (k) { if (d[k] != null) localStorage.setItem("4copys:" + k, JSON.stringify(d[k])); }); S.applyOverrides(); a.toast("Dados importados", "ok"); } catch (x) { a.toast("Arquivo inválido", "err"); } };
      r.readAsText(file);
    });
    a.view.querySelector("#cfg-logout").addEventListener("click", function () { a.logout(); });
  };

  window.APP_SCREENS = SC;
})();
