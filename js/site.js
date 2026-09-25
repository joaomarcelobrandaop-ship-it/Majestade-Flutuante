/* ============================================================
   MAJESTADE FLUTUANTE — script unico, compartilhado pelas paginas.
   Todo bloco sai cedo se o elemento dele nao existir na pagina.
   ============================================================ */

/* ============================================================
   CONFIG — os dados do negocio ficam aqui, num lugar so
   ============================================================ */
const CONFIG = {
  /* o numero DELE, regra 3. +55 67 9206-3535 (Fabio).
     ⚠️ Os arquivos antigos do Corujao registram 99206-3535, com um 9 a
     mais. O WhatsApp so encontra a conversa por 9206-3535, entao e este
     que vale. Conferir com ele antes de publicar. */
  whatsapp: "556792063535",
  mensagens: {
    topo:      "Oi! Vi o site de vocês e queria saber sobre o flutuante.",
    hero:      "Oi! Queria saber se tem data livre no Majestade. Somos [nº] pessoas, de [data] a [data].",
    camarotes: "Oi! Queria saber o valor do pernoite. Somos [nº] pessoas, de [data] a [data].",
    /* as duas abaixo eram NOTAS na tela ("ainda nao sabemos responder...").
       Viraram pergunta clicavel: o hospede pergunta, o Fabio responde. As
       respostas estao na pauta (comercial/pauta-reuniao.md). */
    regras:    "Oi! Antes de reservar: qual a diária mínima, como é o pagamento e como funciona o cancelamento?",
    bordo:     "Oi! Tenho umas dúvidas sobre o flutuante: tem energia a noite toda? Tem sinal de celular ou wi-fi?",
    comer:     "Oi! Queria saber sobre as refeições a bordo: almoço, jantar e o que dá pra programar.",
    chegar:    "Oi! Queria saber como chego até o flutuante e onde deixo o carro.",
    fim:       "Oi! Queria reservar o Majestade. Entrada [data], saída [data], [nº] pessoas.",
    rodape:    "Oi! Queria falar com vocês sobre o flutuante."
  },
  /* CADA LINHA DE PRECO E UM ATALHO para o WhatsApp. {item} e {preco} saem
     do texto DA PROPRIA LINHA na pagina: mudou o preco no HTML, a mensagem
     acompanha sozinha -- nao existe um segundo lugar para esquecer. */
  mensagensDePreco: {
    pernoite: "Oi! Vi no site o pernoite em {item}, {preco} por pessoa com café da manhã. Tem data livre? Somos [nº] pessoas, de [data] a [data].",
    refeicao: "Oi! Queria programar o {item} a bordo ({preco} no site). Somos [nº] pessoas, no dia [data]."
  }
};

/* ============================================================
   INTEGRACOES — TODAS DESLIGADAS (regra 6 e regra 8 / LGPD)
   Nada aqui coleta dado. O formulario nao existe de proposito:
   tudo vai direto pro WhatsApp, entao nao ha o que guardar.
   Ligar qualquer uma destas passa a tratar dado pessoal e exige
   banner de consentimento + politica antes.
   ============================================================ */
const INTEGRACOES = {
  googleAnalytics: { ativo:false, id:"" },
  metaPixel:       { ativo:false, id:"" },
  mapa:            { ativo:false },   /* embed do Google manda o IP pra fora */
  consentimento:   { ativo:false },
  motorDeReserva:  { ativo:false, url:"" }
};

/* ---- todo botao de WhatsApp nasce do CONFIG ----
   O href ja vem completo do HTML como reserva; aqui so entra o texto
   pronto de cada secao (regra 5). Se o JS falhar, o botao continua
   abrindo a conversa -- so sem a mensagem escrita. */
document.querySelectorAll("[data-wa]").forEach(function (el) {
  var chave = el.getAttribute("data-wa");
  var texto = CONFIG.mensagens[chave] || CONFIG.mensagens.topo;
  el.href = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(texto);
  el.target = "_blank";
  el.rel = "noopener noreferrer";
});

/* ---- cada preco abre o WhatsApp com a escolha escrita ----
   O href ja vem do HTML (so o numero); aqui entra o texto montado com o
   nome e o valor da linha. Se o JS falhar, a linha continua abrindo a
   conversa, so que sem a mensagem pronta. */
document.querySelectorAll("[data-wa-preco]").forEach(function (a) {
  var modelo = CONFIG.mensagensDePreco[a.getAttribute("data-wa-preco")];
  var nome = a.querySelector("span"), valor = a.querySelector("b");
  if (!modelo || !nome || !valor) return;
  var item = nome.textContent.trim();
  var texto = modelo
    .replace("{item}", item.charAt(0).toLowerCase() + item.slice(1))
    .replace("{preco}", valor.textContent.trim());
  a.href = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(texto);
  a.target = "_blank";
  a.rel = "noopener noreferrer";
});

/* ---- menu do celular ----
   Fecha de tres jeitos: tocando o icone de novo, clicando num link, ou
   com Esc. Um menu que so fecha de um jeito prende quem abriu sem querer. */
(function () {
  var bt = document.querySelector(".abrir");
  var menu = document.querySelector(".menu");
  if (!bt || !menu) return;
  function poe(aberto) {
    document.body.classList.toggle("menu-on", aberto);
    bt.setAttribute("aria-expanded", aberto ? "true" : "false");
  }
  bt.addEventListener("click", function () {
    poe(!document.body.classList.contains("menu-on"));
  });
  menu.addEventListener("click", function (e) {
    if (e.target.tagName === "A") poe(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("menu-on")) {
      poe(false);
      bt.focus();
    }
  });
  /* se a tela voltar a ser larga com o menu aberto, some com o estado */
  window.addEventListener("resize", function () {
    if (window.innerWidth > 980) poe(false);
  }, { passive: true });
})();

/* ---- cabecalho ganha borda ao descolar do topo ---- */
(function () {
  var topo = document.querySelector(".topo");
  if (!topo) return;
  var pedido = null;
  function pinta() {
    pedido = null;
    topo.classList.toggle("preso", window.scrollY > 30);
  }
  window.addEventListener("scroll", function () {
    if (pedido === null) pedido = requestAnimationFrame(pinta);
  }, { passive: true });
  pinta();
})();

/* ⚠️ SEM "APARECER AO ROLAR" E SEM TITULO PALAVRA POR PALAVRA.
   Os dois existiam aqui ate 24/09/2026 e sairam de proposito: a pesquisa
   sobre "cara de IA" (Anthropic, Impeccable, 34 comentarios no Reddit)
   aponta os dois como assinatura de site gerado. A pagina tinha 48
   elementos subindo ao rolar. Movimento agora e UM so: a entrada da capa,
   feita no CSS (.hero__in). Nao recolocar sem motivo que o visitante sinta. */

/* ---- a frase de reserva ----
   "Reserva para [4] pessoas, [2] noites, a partir de [data]." vira a
   mensagem do WhatsApp. NADA e guardado nem enviado a lugar nenhum: o site
   so monta o texto e abre a conversa (regra 8). Sem JS, o formulario abre
   o WhatsApp do mesmo jeito, so que sem o texto pronto. */
(function () {
  var f = document.getElementById("pedido");
  if (!f) return;

  /* a data nao aceita dia que ja passou */
  var hoje = new Date();
  hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
  f.data.min = hoje.toISOString().slice(0, 10);

  /* "1 pessoas" fica errado na tela: o substantivo acompanha o numero */
  function plural() {
    f.querySelectorAll("[data-plural]").forEach(function (s) {
      var campo = s.previousElementSibling;
      var formas = s.getAttribute("data-plural").split("|");
      s.textContent = campo && campo.value === "1" ? formas[0] : formas[1];
    });
  }
  f.addEventListener("input", plural);
  plural();

  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var p = parseInt(f.pessoas.value, 10), n = parseInt(f.noites.value, 10);
    /* sem verbo conjugado de proposito: "Somos 1 pessoa e queremos 1 noite"
       lia torto. Em lista, qualquer numero funciona, e campo apagado so
       some da frase em vez de entorta-la. */
    var partes = [];
    if (p > 0) partes.push(p + (p === 1 ? " pessoa" : " pessoas"));
    if (n > 0) partes.push(n + (n === 1 ? " noite" : " noites"));
    partes.push(f.data.value
      ? "a partir de " + f.data.value.split("-").reverse().join("/")
      : "em data a combinar");
    var texto = "Oi! Queria reservar o Majestade: " + partes.join(", ") + ". Tem vaga?";
    window.open("https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(texto), "_blank", "noopener");
  });
})();

/* ---- ano do rodape ---- */
(function () {
  var a = document.getElementById("ano");
  if (a) a.textContent = new Date().getFullYear();
})();
