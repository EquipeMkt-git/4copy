/* =====================================================================
   4copys — APP (router, helpers compartilhados, bootstrap)
   ===================================================================== */
(function () {
  "use strict";
  var D = window.APP_DATA, S = window.APP_STORE, AUTH = window.APP_AUTH, SC = window.APP_SCREENS;

  var APP = {
    view: null, search: "",

    el: function (html) { var d = document.createElement("div"); d.innerHTML = String(html).trim(); return d.firstChild; },
    escapeHtml: function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); },
    icon: function (name, cls) { return '<svg class="ic ' + (cls || "") + '" viewBox="0 0 24 24"><path d="' + D.icon(name) + '"/></svg>'; },

    fmtDate: function (ts) {
      if (!ts) return "—"; var d = new Date(ts), now = new Date();
      var diff = (now - d) / 1000;
      if (diff < 60) return "agora"; if (diff < 3600) return Math.floor(diff / 60) + " min"; if (diff < 86400) return Math.floor(diff / 3600) + "h";
      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    },

    mount: function (html) { this.view.innerHTML = html; this.view.scrollTop = 0; window.scrollTo(0, 0); },

    navigate: function (hash) { if (location.hash === hash) route(); else location.hash = hash; },
    refresh: function () { route(); },

    currentUser: function () { return S.currentUser(); },
    logout: function () { AUTH.signOut(function () { boot(); }); },

    toast: function (msg, type) {
      var root = document.getElementById("toast-root");
      var ico = type === "ok" ? APP.icon("check") : (type === "err" ? APP.icon("bolt") : APP.icon("sparkles"));
      var t = APP.el('<div class="toast ' + (type || "") + '">' + ico + '<span>' + APP.escapeHtml(msg) + '</span></div>');
      root.appendChild(t); setTimeout(function () { t.style.opacity = "0"; t.style.transform = "translateY(8px)"; setTimeout(function () { t.remove(); }, 250); }, 2600);
    },

    modal: function (opts) {
      var root = document.getElementById("modal-root");
      var actions = (opts.actions || []).map(function (a, i) { return '<button class="btn ' + (a.cls || "btn-ghost") + '" data-act="' + i + '">' + (a.label) + '</button>'; }).join("");
      var ov = APP.el('<div class="overlay"><div class="modal ' + (opts.wide ? "modal-lg" : "") + '"><div class="modal-head"><h3>' + APP.escapeHtml(opts.title || "") + '</h3><button class="modal-x">&times;</button></div><div class="modal-body">' + (opts.body || "") + '</div>' + (actions ? '<div class="modal-foot">' + actions + '</div>' : "") + '</div></div>');
      root.appendChild(ov);
      ov.querySelector(".modal-x").addEventListener("click", APP.closeModal);
      ov.addEventListener("click", function (e) { if (e.target === ov) APP.closeModal(); });
      (opts.actions || []).forEach(function (a, i) { var b = ov.querySelector('[data-act="' + i + '"]'); if (b) b.addEventListener("click", function () { a.onClick && a.onClick(); }); });
      if (opts.onOpen) opts.onOpen();
    },
    closeModal: function () { document.getElementById("modal-root").innerHTML = ""; },

    copyText: function (text) {
      function done() { APP.toast("Copiado para a área de transferência", "ok"); }
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, fallback); } else fallback();
      function fallback() { var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) { APP.toast("Não foi possível copiar", "err"); } ta.remove(); }
    },
    download: function (filename, content) {
      var blob = new Blob([content], { type: "text/plain;charset=utf-8" }); var url = URL.createObjectURL(blob);
      var a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    },

    refreshBadge: function () {
      var txt = document.getElementById("ai-badge-text"); if (!txt) return;
      txt.textContent = window.APP_CONFIG.AI_PROVIDER === "external" ? "IA externa" : "IA interna";
    }
  };
  window.APP = APP;

  /* ------------------------- navegação ------------------------- */
  var NAV = [
    { hash: "#/home", icon: "home", label: "Início", bottom: true },
    { hash: "#/novo", icon: "plus", label: "Nova copy", bottom: true },
    { sep: "Criação" },
    { hash: "#/personas", icon: "users", label: "Personas", bottom: true },
    { hash: "#/produtos", icon: "tag", label: "Produtos" },
    { hash: "#/acervo", icon: "layers", label: "Acervo", bottom: true },
    { sep: "Inteligência" },
    { hash: "#/fontes", icon: "folder", label: "Fontes de dados" },
    { hash: "#/analisar", icon: "search", label: "Analisar copy" },
    { hash: "#/cerebro", icon: "brain", label: "Cérebro", bottom: true },
    { sep: "" },
    { hash: "#/config", icon: "settings", label: "Configurações" }
  ];

  function buildNav() {
    var side = document.getElementById("side-nav");
    side.innerHTML = NAV.map(function (n) {
      if (n.sep !== undefined) return n.sep ? '<div class="side-sep">' + n.sep + '</div>' : '<div style="height:8px"></div>';
      return '<button class="side-link" data-hash="' + n.hash + '">' + APP.icon(n.icon) + '<span>' + n.label + '</span></button>';
    }).join("");
    side.querySelectorAll("[data-hash]").forEach(function (b) {
      b.addEventListener("click", function () { APP.navigate(b.getAttribute("data-hash")); document.getElementById("sidebar").classList.remove("open"); });
    });
    var bottom = document.getElementById("bottom-nav");
    bottom.innerHTML = NAV.filter(function (n) { return n.bottom; }).map(function (n) {
      return '<button data-hash="' + n.hash + '">' + APP.icon(n.icon) + '<span>' + n.label + '</span></button>';
    }).join("");
    bottom.querySelectorAll("[data-hash]").forEach(function (b) { b.addEventListener("click", function () { APP.navigate(b.getAttribute("data-hash")); }); });
  }

  function setActiveNav(hash) {
    var base = "#/" + (hash.replace("#/", "").split(/[/?]/)[0] || "home");
    document.querySelectorAll("#side-nav [data-hash]").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-hash") === base); });
    document.querySelectorAll("#bottom-nav [data-hash]").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-hash") === base); });
  }

  /* ------------------------- router ------------------------- */
  function parseHash() {
    var raw = (location.hash || "#/home").replace(/^#\//, "");
    var qIdx = raw.indexOf("?"); var query = {};
    if (qIdx >= 0) { raw.slice(qIdx + 1).split("&").forEach(function (kv) { var p = kv.split("="); query[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ""); }); raw = raw.slice(0, qIdx); }
    var parts = raw.split("/").filter(Boolean);
    return { name: parts[0] || "home", id: parts[1], query: query };
  }

  function route() {
    if (!APP.view) return;
    var r = parseHash();
    setActiveNav(location.hash);
    try {
      switch (r.name) {
        case "home": SC.home(); break;
        case "novo": SC.editor({ formato: r.query.formato }); break;
        case "projeto": SC.editor({ id: r.id }); break;
        case "personas": SC.personas(); break;
        case "persona": SC.persona({ id: r.id }); break;
        case "acervo": SC.acervo(); break;
        case "fontes": SC.fontes(); break;
        case "analisar": SC.analisar(); break;
        case "cerebro": SC.cerebro(); break;
        case "produtos": SC.produtos(); break;
        case "config": SC.config(); break;
        default: SC.home();
      }
    } catch (e) {
      APP.mount('<div class="empty">' + APP.icon("bolt") + '<h3>Ops, algo quebrou nesta tela</h3><p>' + APP.escapeHtml(e.message || "") + '</p></div>');
      if (window.console) console.error(e);
    }
  }

  /* ------------------------- bootstrap ------------------------- */
  function boot() {
    // aplica override de provedor de IA salvo localmente
    try { var ov = localStorage.getItem("4copys:aiProvider"); if (ov) window.APP_CONFIG.AI_PROVIDER = ov; } catch (e) {}

    AUTH.init(function (user) {
      document.getElementById("app-root").hidden = false;
      APP.view = document.getElementById("view");
      buildNav();
      APP.refreshBadge();
      var chip = document.getElementById("user-initials");
      if (chip) chip.textContent = (user.name || "4B").split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();

      // Assignação direta (não addEventListener) p/ não duplicar após logout/login.
      document.getElementById("user-chip").onclick = function () { APP.navigate("#/config"); };
      var menu = document.getElementById("btn-menu"); if (menu) menu.onclick = function () { document.getElementById("sidebar").classList.toggle("open"); };
      var gs = document.getElementById("global-search");
      if (gs) gs.oninput = function () { APP.search = gs.value; if (parseHash().name === "home") SC.home(); };

      if (!location.hash) location.hash = "#/home";
      route();
    });
  }

  // Delegação global: qualquer elemento com data-nav navega; data-open abre projeto.
  document.addEventListener("click", function (e) {
    var t = e.target;
    var nav = t.closest ? t.closest("[data-nav]") : null;
    if (nav) { e.preventDefault(); APP.navigate(nav.getAttribute("data-nav")); return; }
    var open = t.closest ? t.closest("[data-open]") : null;
    if (open) { APP.navigate("#/projeto/" + open.getAttribute("data-open")); }
  });

  window.addEventListener("hashchange", route);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
