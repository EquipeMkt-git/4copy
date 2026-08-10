/* =====================================================================
   4copys — CAMADA DE DADOS (store)
   Local-first: tudo é salvo no navegador (localStorage) na hora.
   Se APPS_SCRIPT_URL estiver configurada, sincroniza com o backend
   (Google Sheets via Apps Script). Funciona 100% offline sem backend.
   ===================================================================== */
(function () {
  "use strict";
  var CFG = window.APP_CONFIG || {};
  var NS = "4copys:";
  var D = window.APP_DATA;

  /* ------------ localStorage helpers ------------ */
  function lsGet(k, def) { try { var v = localStorage.getItem(NS + k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function lsSet(k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) {} }
  function uid(prefix) { return (prefix || "id") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function simpleHash(s) { var h = 5381, i; s = String(s); for (i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(16); }

  /* ------------ backend ------------ */
  function hasBackend() { return !!(CFG.APPS_SCRIPT_URL && CFG.APPS_SCRIPT_URL.indexOf("http") === 0); }

  function callBackend(action, data) {
    if (!hasBackend()) return Promise.reject(new Error("Backend não configurado"));
    var url = CFG.APPS_SCRIPT_URL;
    var ctrl = new AbortController();
    var to = setTimeout(function () { ctrl.abort(); }, CFG.SUBMIT_TIMEOUT_MS || 20000);
    // Content-Type text/plain evita preflight CORS no Apps Script.
    return fetch(url, {
      method: "POST", redirect: "follow", signal: ctrl.signal,
      body: JSON.stringify(Object.assign({ action: action }, data || {}))
    }).then(function (r) { clearTimeout(to); return r.json(); })
      .then(function (j) { if (j && j.ok === false) throw new Error(j.error || "Erro no backend"); return j; })
      .catch(function (e) { clearTimeout(to); throw e; });
  }

  /* ------------ overrides de persona/produto (editáveis) ------------ */
  function applyOverrides() {
    var pOv = lsGet("personaOverrides", {});
    Object.keys(pOv).forEach(function (id) {
      var idx = D.PERSONAS.map(function (p) { return p.id; }).indexOf(id);
      if (idx >= 0) D.PERSONAS[idx] = pOv[id]; else D.PERSONAS.push(pOv[id]);
    });
    var prOv = lsGet("productOverrides", {});
    Object.keys(prOv).forEach(function (id) {
      var idx = D.PRODUCTS.map(function (p) { return p.id; }).indexOf(id);
      if (idx >= 0) D.PRODUCTS[idx] = prOv[id]; else D.PRODUCTS.push(prOv[id]);
    });
  }

  function savePersona(persona) {
    var ov = lsGet("personaOverrides", {}); ov[persona.id] = persona; lsSet("personaOverrides", ov);
    applyOverrides();
    if (hasBackend()) callBackend("savePersona", { persona: persona }).catch(function () {});
    return persona;
  }
  function saveProduct(product) {
    var ov = lsGet("productOverrides", {}); ov[product.id] = product; lsSet("productOverrides", ov);
    applyOverrides();
    if (hasBackend()) callBackend("saveProduct", { product: product }).catch(function () {});
    return product;
  }

  /* ------------ sessão / usuários ------------ */
  function currentUser() { return lsGet("session", null); }
  function setSession(u) { lsSet("session", u); }

  function signup(name, email, password) {
    email = String(email || "").trim().toLowerCase();
    if (!name || !email || !password) return Promise.reject(new Error("Preencha nome, e-mail e senha."));
    if (password.length < 4) return Promise.reject(new Error("A senha precisa de ao menos 4 caracteres."));
    if (hasBackend()) {
      return callBackend("signup", { name: name, email: email, pass: simpleHash(password) })
        .then(function (r) { var u = { id: r.userId || uid("u"), name: name, email: email }; setSession(u); return u; });
    }
    var users = lsGet("users", {});
    if (users[email]) return Promise.reject(new Error("Já existe uma conta com esse e-mail."));
    var u = { id: uid("u"), name: name, email: email, pass: simpleHash(password) };
    users[email] = u; lsSet("users", users);
    var pub = { id: u.id, name: name, email: email }; setSession(pub); return Promise.resolve(pub);
  }

  function login(email, password) {
    email = String(email || "").trim().toLowerCase();
    if (hasBackend()) {
      return callBackend("login", { email: email, pass: simpleHash(password) })
        .then(function (r) { var u = { id: r.userId, name: r.name || email, email: email }; setSession(u); return u; });
    }
    var users = lsGet("users", {});
    var u = users[email];
    if (!u || u.pass !== simpleHash(password)) return Promise.reject(new Error("E-mail ou senha incorretos."));
    var pub = { id: u.id, name: u.name, email: email }; setSession(pub); return Promise.resolve(pub);
  }

  function logout() { localStorage.removeItem(NS + "session"); }

  /* ------------ projetos (copys salvas) ------------ */
  // Estrutura de projeto:
  // { id, name, ownerId, ownerName, personaId, objectiveId, platformId, productId,
  //   formatIds[], answers{}, outputs[], shared, createdAt, updatedAt }
  function allProjects() { return lsGet("projects", []); }

  function listProjects() {
    var u = currentUser();
    var mine = allProjects().filter(function (p) { return u && p.ownerId === u.id; });
    if (hasBackend()) {
      callBackend("listProjects", { userId: u && u.id }).then(function (r) {
        if (r && r.projects) { mergeRemote(r.projects); }
      }).catch(function () {});
    }
    return mine.sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
  }

  function getProject(id) { return allProjects().filter(function (p) { return p.id === id; })[0] || null; }

  function saveProject(p) {
    var u = currentUser();
    var list = allProjects();
    if (!p.id) { p.id = uid("proj"); p.createdAt = Date.now(); p.ownerId = u ? u.id : "anon"; p.ownerName = u ? u.name : "Anônimo"; }
    p.updatedAt = Date.now();
    var idx = list.map(function (x) { return x.id; }).indexOf(p.id);
    if (idx >= 0) list[idx] = p; else list.push(p);
    lsSet("projects", list);
    if (hasBackend()) callBackend("saveProject", { project: p }).catch(function () {});
    return p;
  }

  function deleteProject(id) {
    var list = allProjects().filter(function (p) { return p.id !== id; });
    lsSet("projects", list);
    if (hasBackend()) callBackend("deleteProject", { id: id }).catch(function () {});
  }

  function mergeRemote(remote) {
    var list = allProjects(); var byId = {}; list.forEach(function (p) { byId[p.id] = p; });
    remote.forEach(function (rp) { if (!byId[rp.id] || (rp.updatedAt || 0) > (byId[rp.id].updatedAt || 0)) byId[rp.id] = rp; });
    lsSet("projects", Object.keys(byId).map(function (k) { return byId[k]; }));
  }

  /* ------------ acervo compartilhado ------------ */
  function listLibrary() {
    var local = allProjects().filter(function (p) { return p.shared; });
    if (hasBackend()) {
      callBackend("listLibrary", {}).then(function (r) { if (r && r.projects) lsSet("libraryCache", r.projects); }).catch(function () {});
      var cache = lsGet("libraryCache", []);
      // combina locais compartilhados + cache remoto, sem duplicar
      var byId = {}; cache.concat(local).forEach(function (p) { byId[p.id] = p; });
      return Object.keys(byId).map(function (k) { return byId[k]; }).sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
    }
    return local.sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
  }

  function duplicateFromLibrary(id) {
    var src = getProject(id) || lsGet("libraryCache", []).filter(function (p) { return p.id === id; })[0];
    if (!src) return null;
    var copy = JSON.parse(JSON.stringify(src));
    copy.id = null; copy.shared = false; copy.name = src.name + " (cópia)"; copy.createdAt = null;
    return saveProject(copy);
  }

  /* ------------ fontes de dados / base de conhecimento ------------ */
  // { id, name, persona, type, text, createdAt }
  function listSources() {
    if (hasBackend()) callBackend("listSources", {}).then(function (r) { if (r && r.sources) lsSet("sources", r.sources); }).catch(function () {});
    return lsGet("sources", []).sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
  }
  function saveSource(s) {
    var list = lsGet("sources", []);
    if (!s.id) { s.id = uid("src"); s.createdAt = Date.now(); }
    var idx = list.map(function (x) { return x.id; }).indexOf(s.id);
    if (idx >= 0) list[idx] = s; else list.push(s);
    lsSet("sources", list);
    if (hasBackend()) callBackend("saveSource", { source: s }).catch(function () {});
    return s;
  }
  function deleteSource(id) {
    lsSet("sources", lsGet("sources", []).filter(function (s) { return s.id !== id; }));
    if (hasBackend()) callBackend("deleteSource", { id: id }).catch(function () {});
  }
  function sourcesForPersona(personaId) { return lsGet("sources", []).filter(function (s) { return s.persona === personaId; }); }

  /* ------------ snapshot p/ o cérebro (grafo) ------------ */
  function graphSnapshot() { return { projects: allProjects(), sources: lsGet("sources", []) }; }

  applyOverrides();

  window.APP_STORE = {
    hasBackend: hasBackend, callBackend: callBackend,
    currentUser: currentUser, signup: signup, login: login, logout: logout,
    listProjects: listProjects, getProject: getProject, saveProject: saveProject, deleteProject: deleteProject,
    listLibrary: listLibrary, duplicateFromLibrary: duplicateFromLibrary,
    listSources: listSources, saveSource: saveSource, deleteSource: deleteSource, sourcesForPersona: sourcesForPersona,
    savePersona: savePersona, saveProduct: saveProduct, applyOverrides: applyOverrides,
    graphSnapshot: graphSnapshot, uid: uid
  };
})();
