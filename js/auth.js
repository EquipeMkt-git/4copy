/* =====================================================================
   4copys — AUTENTICAÇÃO (cadastro/login)
   Renderiza a tela de acesso e devolve o usuário logado ao app.
   Segurança: hash simples no cliente — suficiente para uma ferramenta
   interna. Para produção com dados sensíveis, troque por auth real.
   ===================================================================== */
(function () {
  "use strict";
  var S = window.APP_STORE;

  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }

  function render(onSuccess) {
    var root = document.getElementById("auth-root");
    var mode = "login";
    root.innerHTML = "";
    var card = el(
      '<div class="auth-wrap"><div class="auth-card">' +
        '<div class="auth-brand">' +
          '<div class="brand"><span class="brand-mark">4</span><span class="brand-name" style="color:#004882">copys</span></div>' +
          '<p>' + (window.APP_CONFIG.APP_TAGLINE || "") + '</p>' +
        '</div>' +
        '<div class="auth-tabs">' +
          '<button data-mode="login" class="active">Entrar</button>' +
          '<button data-mode="signup">Criar conta</button>' +
        '</div>' +
        '<div id="auth-err"></div>' +
        '<form id="auth-form">' +
          '<div class="field" id="f-name" hidden><label class="lbl">Nome</label><input name="name" placeholder="Seu nome" autocomplete="name"></div>' +
          '<div class="field"><label class="lbl">E-mail</label><input name="email" type="email" placeholder="voce@4blue.com.br" autocomplete="email"></div>' +
          '<div class="field"><label class="lbl">Senha</label><input name="password" type="password" placeholder="••••••" autocomplete="current-password"></div>' +
          '<button type="submit" class="btn btn-primary btn-block btn-lg" id="auth-submit">Entrar</button>' +
        '</form>' +
        '<p class="auth-note" id="auth-mode-note">Acesso da equipe 4blue. ' +
          (S.hasBackend() ? "Contas gravadas no backend." : "Modo local: contas ficam neste navegador.") + '</p>' +
      '</div></div>'
    );
    root.appendChild(card);

    var form = card.querySelector("#auth-form");
    var errBox = card.querySelector("#auth-err");
    var submit = card.querySelector("#auth-submit");
    var fName = card.querySelector("#f-name");
    var tabs = card.querySelectorAll(".auth-tabs button");

    function setMode(m) {
      mode = m;
      tabs.forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-mode") === m); });
      fName.hidden = m !== "signup";
      submit.textContent = m === "signup" ? "Criar conta e entrar" : "Entrar";
      form.password.setAttribute("autocomplete", m === "signup" ? "new-password" : "current-password");
      errBox.innerHTML = "";
    }
    tabs.forEach(function (t) { t.addEventListener("click", function () { setMode(t.getAttribute("data-mode")); }); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      errBox.innerHTML = "";
      var name = form.name.value.trim(), email = form.email.value.trim(), pass = form.password.value;
      submit.disabled = true; submit.innerHTML = '<span class="spinner"></span>';
      var op = mode === "signup" ? S.signup(name, email, pass) : S.login(email, pass);
      op.then(function (user) { onSuccess(user); })
        .catch(function (err) {
          errBox.innerHTML = '<div class="auth-err">' + (err.message || "Não foi possível acessar.") + '</div>';
          submit.disabled = false; submit.textContent = mode === "signup" ? "Criar conta e entrar" : "Entrar";
        });
    });

    setMode("login");
  }

  // Ponto de entrada: se já há sessão, segue direto; senão, mostra login.
  function init(onAuthed) {
    var u = S.currentUser();
    if (u) { onAuthed(u); return; }
    document.getElementById("app-root").hidden = true;
    document.getElementById("auth-root").hidden = false;
    render(function (user) {
      document.getElementById("auth-root").hidden = true;
      document.getElementById("auth-root").innerHTML = "";
      onAuthed(user);
    });
  }

  function signOut(reboot) {
    S.logout();
    document.getElementById("app-root").hidden = true;
    document.getElementById("auth-root").hidden = false;
    render(function (user) {
      document.getElementById("auth-root").hidden = true;
      document.getElementById("auth-root").innerHTML = "";
      reboot(user);
    });
  }

  window.APP_AUTH = { init: init, signOut: signOut };
})();
