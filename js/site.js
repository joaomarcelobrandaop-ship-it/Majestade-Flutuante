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
  /* as mensagens em PORTUGUES. As de ingles e espanhol ficam no I18N,
     embaixo, com as mesmas chaves. */
  mensagens: {
    topo:      "Oi! Vi o site de vocês e queria saber sobre o flutuante.",
    hero:      "Oi! Queria saber se tem data livre no Majestade. Somos [nº] pessoas, de [data] a [data].",
    /* as duas abaixo eram NOTAS na tela ("ainda nao sabemos responder...").
       Viraram pergunta clicavel: o hospede pergunta, o Fabio responde. As
       respostas estao na pauta (comercial/pauta-reuniao.md). */
    regras:    "Oi! Antes de reservar: qual a diária mínima, como é o pagamento e como funciona o cancelamento?",
    bordo:     "Oi! Tenho umas dúvidas sobre o flutuante: tem energia a noite toda? Tem sinal de celular ou wi-fi?",
    comer:     "Oi! Queria saber sobre as refeições a bordo: almoço, jantar e o que dá pra programar.",
    chegar:    "Oi! Queria saber como chego até o flutuante e onde deixo o carro.",
    fim:       "Oi! Queria reservar o Majestade. Entrada [data], saída [data], [nº] pessoas.",
    rodape:    "Oi! Queria falar com vocês sobre o flutuante.",
    dados:     "Oi! Tenho uma pergunta sobre os meus dados no site do Majestade."
  },
  /* O BOTAO DO QUADRO DE PERNOITE leva a opcao MARCADA para a mensagem.
     {preco} sai do texto da opcao na pagina: mudou o preco no HTML, a
     mensagem acompanha sozinha. {item} vem de ITENS, pelo value do radio. */
  mensagensDePreco: {
    pernoite: "Oi! Vi no site o pernoite em {item}, {preco} por pessoa com café da manhã. Tem data livre? Somos [nº] pessoas, de [data] a [data]."
  }
};

/* ============================================================
   INTEGRACOES — TODAS DESLIGADAS (regra 6 e regra 8 / LGPD)
   Nada aqui coleta dado. O formulario nao existe de proposito:
   tudo vai direto pro WhatsApp, entao nao ha o que guardar.

   GOOGLE ANALYTICS (o Joao escolheu ter, 06/10/2026 -- conta DELE):
   o aviso de cookies e a politica de privacidade JA ESTAO PRONTOS.
   Para ligar:
     1. id: "G-XXXXXXXXXX" (analytics.google.com > Administrador >
        Fluxos de dados > o site) e ativo: true, aqui embaixo
     2. no gerar-paginas.py, POLITICA_DATA_COM_GA = a data do dia
     3. python gerar-paginas.py  (a politica passa a falar do GA)
     4. publicar
   Ligado, o aviso aparece sozinho e o GA so carrega DEPOIS do
   "Aceitar"; "Recusar" e igual de facil (veja "AVISO DE COOKIES").

   metaPixel e mapa NAO tem codigo: ligar = pedir ao Claude, porque
   precisam entrar no aviso e na politica antes.
   ============================================================ */
const INTEGRACOES = {
  googleAnalytics: { ativo:false, id:"" },
  metaPixel:       { ativo:false, id:"" },
  mapa:            { ativo:false },   /* embed do Google manda o IP pra fora */
  motorDeReserva:  { ativo:false, url:"" }
};

/* ============================================================
   IDIOMAS — cada lingua tem a SUA pagina: / (portugues), /en/ e /es/.
   O texto ja vem traduzido no HTML: o gerar-paginas.py le o traducoes.py
   e escreve site/en/ e site/es/ (06/10/2026; antes a troca era feita
   aqui, na tela, e o Google so via o portugues).
   Aqui ficam so as frases que o JS monta na hora: as mensagens de
   WhatsApp, a frase da barra de reserva e o botao do pernoite.
   A lingua da vez e a da pagina (<html lang>). Sem cookie e sem
   localStorage: o rodape diz "nao guarda nenhum dado seu", e continua
   verdade.
   ============================================================ */
const ITENS = {
  pt: { i1: "camarote para uma pessoa", i2: "camarote com 2 pessoas", i3: "camarote com 3 pessoas", i46: "camarote com 4, 5 ou 6 pessoas" },
  en: { i1: "a cabin for one person", i2: "a cabin for 2 people", i3: "a cabin for 3 people", i46: "a cabin for 4, 5 or 6 people" },
  es: { i1: "camarote para una persona", i2: "camarote para 2 personas", i3: "camarote para 3 personas", i46: "camarote para 4, 5 o 6 personas" }
};

const MESES = {
  pt: ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  es: ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"]
};

/* a frase de reserva: plural na tela e a mensagem que ela monta */
const FRASE = {
  pt: { pessoa: ["pessoa","pessoas"], noite: ["noite","noites"],
        abre: "Oi! Queria reservar o Majestade: ", fecha: ". Tem vaga?",
        combinar: "em data a combinar",
        data: function (d, m, a) { return "a partir de " + d + "/" + m + "/" + a; } },
  en: { pessoa: ["person","people"], noite: ["night","nights"],
        abre: "Hi! I'd like to book the Majestade: ", fecha: ". Is there availability?",
        combinar: "dates to be arranged",
        data: function (d, m, a) { return "from " + Number(d) + " " + MESES.en[m - 1] + " " + a; } },
  es: { pessoa: ["persona","personas"], noite: ["noche","noches"],
        abre: "¡Hola! Quiero reservar el Majestade: ", fecha: ". ¿Hay lugar?",
        combinar: "fecha a coordinar",
        data: function (d, m, a) { return "a partir del " + Number(d) + " de " + MESES.es[m - 1] + " de " + a; } }
};

/* o botao do quadro de pernoite: "Reservar para 2 pessoas". O {q} e o
   texto da opcao marcada, ja na lingua da vez. */
const RESERVAR_PARA = { pt: "Reservar para {q}", en: "Book for {q}", es: "Reservar para {q}" };

/* as mensagens de WhatsApp em ingles e espanhol (as em portugues estao no
   CONFIG, la em cima), com as mesmas chaves */
const I18N = {
  en: {
    msg: {
      topo:      "Hi! I saw your website and would like to know more about the floating hotel.",
      hero:      "Hi! I'd like to know if Majestade has dates available. We are [number] people, from [date] to [date].",
      regras:    "Hi! Before booking: what is the minimum stay, how does payment work and what is the cancellation policy?",
      bordo:     "Hi! I have a few questions about the floating hotel: is there power all night? Is there cell signal or Wi-Fi?",
      comer:     "Hi! I'd like to know about meals on board: lunch, dinner and what can be arranged.",
      chegar:    "Hi! I'd like to know how to get to the floating hotel and where to leave the car.",
      fim:       "Hi! I'd like to book Majestade. Check-in [date], check-out [date], [number] people.",
      rodape:    "Hi! I'd like to talk to you about the floating hotel.",
      dados:     "Hi! I have a question about my data on the Majestade website."
    },
    preco: { pernoite: "Hi! I saw on the website the overnight stay in {item}, {preco} per person with breakfast. Are there dates available? We are [number] people, from [date] to [date]." }
  },
  es: {
    msg: {
      topo:      "¡Hola! Vi su sitio y quería saber sobre el hotel flotante.",
      hero:      "¡Hola! Quería saber si hay fechas disponibles en el Majestade. Somos [nº] personas, del [fecha] al [fecha].",
      regras:    "¡Hola! Antes de reservar: ¿cuál es la estadía mínima, cómo es el pago y cómo funciona la cancelación?",
      bordo:     "¡Hola! Tengo algunas dudas sobre el hotel flotante: ¿hay energía toda la noche? ¿Hay señal de celular o wifi?",
      comer:     "¡Hola! Quería saber sobre las comidas a bordo: almuerzo, cena y qué se puede coordinar.",
      chegar:    "¡Hola! Quería saber cómo llegar al hotel flotante y dónde dejar el auto.",
      fim:       "¡Hola! Quiero reservar el Majestade. Entrada [fecha], salida [fecha], [nº] personas.",
      rodape:    "¡Hola! Quería hablar con ustedes sobre el hotel flotante.",
      dados:     "¡Hola! Tengo una pregunta sobre mis datos en el sitio del Majestade."
    },
    preco: { pernoite: "¡Hola! Vi en el sitio la estadía en {item}, {preco} por persona con desayuno. ¿Hay fechas disponibles? Somos [nº] personas, del [fecha] al [fecha]." }
  }
};

/* a lingua da PAGINA: <html lang="en"> em /en/, "es" em /es/, "pt-BR" no resto */
var LANG = (document.documentElement.lang || "pt").slice(0, 2);
if (LANG !== "en" && LANG !== "es") LANG = "pt";

function linkZap(texto) {
  return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(texto);
}

/* ---- os botoes de WhatsApp: mensagem da secao, na lingua da vez (regra 5).
   O href ja vem do HTML com o numero; se o JS falhar, abre a conversa
   do mesmo jeito, so que sem a mensagem escrita. ---- */
function atualizarZaps() {
  var msg = LANG === "pt" ? CONFIG.mensagens : I18N[LANG].msg;
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    var chave = el.getAttribute("data-wa");
    el.href = linkZap(msg[chave] || msg.topo);
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  });
  /* o botao do quadro de pernoite: item e preco vem da opcao marcada,
     que o bloco "escolhe e reserva" (embaixo) copia para data-item e
     data-preco */
  var modelos = LANG === "pt" ? CONFIG.mensagensDePreco : I18N[LANG].preco;
  document.querySelectorAll("[data-wa-preco]").forEach(function (a) {
    var modelo = modelos[a.getAttribute("data-wa-preco")];
    var valor = a.getAttribute("data-preco");
    var item = ITENS[LANG][a.getAttribute("data-item")];
    if (!modelo || !valor || !item) return;
    a.href = linkZap(modelo.replace("{item}", item).replace("{preco}", valor));
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });
}

/* ---- cabecalho ganha fundo ao descolar do topo ---- */
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

/* ---- o quadro de pernoite: escolhe e reserva (opcao D, 25/09/2026) ----
   As opcoes sao radio de verdade; o botao embaixo diz para quantos e a
   reserva e leva a opcao marcada para a mensagem do WhatsApp. Serve a
   home e a pagina de camarotes (o gerador copia o bloco da home). */
(function () {
  var quadros = document.querySelectorAll(".escolha");
  if (!quadros.length) return;

  function atualizar() {
    quadros.forEach(function (q) {
      var marcado = q.querySelector("input:checked");
      var bt = q.querySelector(".escolha__bt");
      if (!marcado || !bt) return;
      var opcao = q.querySelector('label[for="' + marcado.id + '"]');
      bt.setAttribute("data-item", marcado.value);
      bt.setAttribute("data-preco", opcao.querySelector("b").textContent.trim());
      bt.querySelector(".escolha__txt").textContent =
        RESERVAR_PARA[LANG].replace("{q}", opcao.querySelector(".lugar__q").textContent.trim());
    });
  }
  quadros.forEach(function (q) {
    q.addEventListener("change", function () { atualizar(); atualizarZaps(); });
  });
  atualizar();
})();

/* ---- a barra de reserva ----
   Pessoas, noites e chegada viram a mensagem do WhatsApp. NADA e guardado nem enviado a lugar nenhum:
   o site so monta o texto e abre a conversa (regra 8).

   ⚠️ DIA E MES EM LISTA, NAO <input type="date">. O campo de data do
   navegador mostra o formato da lingua do COMPUTADOR de quem visita -- num
   Windows em ingles aparecia mm/dd/yyyy, e brasileiro le 10/12 como 10 de
   dezembro. Em lista, e sempre "12 de outubro", em qualquer navegador.
   O ano nao se pergunta: se o dia ja passou este ano, e o do ano que vem. */
(function () {
  var f = document.getElementById("pedido");
  if (!f) return;

  function anoDe(dia, mes) {
    var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    var a = hoje.getFullYear();
    return new Date(a, mes - 1, dia) < hoje ? a + 1 : a;
  }

  /* 31 de fevereiro nao existe: os dias que o mes nao tem ficam desligados */
  function ajustarDias() {
    var mes = parseInt(f.mes.value, 10);
    var diaEscolhido = parseInt(f.dia.value, 10);
    var ultimo = 31;
    if (mes) {
      var ano = anoDe(1, mes);
      ultimo = new Date(ano, mes, 0).getDate();
    }
    Array.prototype.forEach.call(f.dia.options, function (o) {
      if (o.value) o.disabled = parseInt(o.value, 10) > ultimo;
    });
    if (diaEscolhido > ultimo) f.dia.value = "";
  }

  f.addEventListener("change", function (e) { if (e.target === f.mes) ajustarDias(); });

  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var F = FRASE[LANG];
    var p = parseInt(f.pessoas.value, 10), n = parseInt(f.noites.value, 10);
    var dia = parseInt(f.dia.value, 10), mes = parseInt(f.mes.value, 10);
    /* sem verbo conjugado: em lista, qualquer numero funciona, e campo
       apagado so some da frase em vez de entorta-la */
    var partes = [];
    if (p > 0) partes.push(p + " " + (p === 1 ? F.pessoa[0] : F.pessoa[1]));
    if (n > 0) partes.push(n + " " + (n === 1 ? F.noite[0] : F.noite[1]));
    if (dia && mes) {
      var dd = dia < 10 ? "0" + dia : String(dia), mm = mes < 10 ? "0" + mes : String(mes);
      partes.push(F.data(dd, LANG === "pt" ? mm : mes, anoDe(dia, mes)));
    } else {
      partes.push(F.combinar);
    }
    window.open(linkZap(F.abre + partes.join(", ") + F.fecha), "_blank", "noopener");
  });

  ajustarDias();
})();

/* ---- AVISO DE COOKIES (regra 8, LGPD) ----
   So existe com o Google Analytics LIGADO no INTEGRACOES. Desligado, o site
   nao pergunta nada, porque nao ha o que perguntar.
   - O GA so carrega DEPOIS do "Aceitar". Antes disso, nenhum pedido sai
     para o Google (nem preconnect).
   - "Recusar" e "Aceitar": mesmo desenho, mesmo tamanho, lado a lado.
   - A escolha fica no navegador (localStorage "majestade-cookies"), com a
     data e a VERSAO da politica: e o registro do consentimento. Mudou a
     politica de um jeito que pede novo aceite, suba a VERSAO.
   - "Preferencias de cookies", no rodape, reabre o aviso: retirar e tao
     facil quanto dar. Recusou depois de aceitar: o GA para na hora e os
     cookies dele (_ga, _ga_XXXX) sao apagados.
   O texto do aviso e do botao mora no HTML (<template>), traduzido pelo
   gerar-paginas.py como o resto da pagina. ---- */
(function () {
  if (!INTEGRACOES.googleAnalytics.ativo) return;
  var ga = INTEGRACOES.googleAnalytics;
  if (!/^G-[A-Z0-9]{4,}$/.test(ga.id)) return;
  var CHAVE = "majestade-cookies", VERSAO = 1;
  var raiz = document.documentElement, quemAbriu = null;

  function ler() {
    try {
      var v = JSON.parse(localStorage.getItem(CHAVE));
      return v && v.versao === VERSAO ? v : null;
    } catch (e) { return null; }
  }
  function gravar(escolha) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ escolha: escolha, data: new Date().toISOString(), versao: VERSAO }));
    } catch (e) { /* navegador sem localStorage: pergunta de novo na proxima pagina */ }
  }

  function ligarGA() {
    if (!INTEGRACOES.googleAnalytics.ativo || window.__gaMajestade) return;  /* portao: so depois do Aceitar */
    window.__gaMajestade = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", ga.id, { allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 395 * 24 * 60 * 60 });
    var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ga.id); document.head.appendChild(s);
  }
  function desligarGA() {
    window["ga-disable-" + ga.id] = true;   /* para de medir nesta pagina */
    var partes = location.hostname.split(".");
    document.cookie.split(";").forEach(function (c) {
      var nome = c.split("=")[0].trim();
      if (nome !== "_ga" && nome.indexOf("_ga_") !== 0) return;
      document.cookie = nome + "=; Max-Age=0; path=/";
      for (var i = 0; i < partes.length - 1; i++) {
        document.cookie = nome + "=; Max-Age=0; path=/; domain=." + partes.slice(i).join(".");
      }
    });
  }

  /* a altura do aviso, para o botao do WhatsApp e o fim da pagina nao
     ficarem escondidos atras dele no celular */
  function medir() {
    var a = document.querySelector(".aviso-cookies");
    if (a) raiz.style.setProperty("--aviso-h", a.offsetHeight + "px");
  }
  function fechar() {
    var a = document.querySelector(".aviso-cookies");
    if (a) a.remove();
    raiz.classList.remove("com-aviso-cookies");
    window.removeEventListener("resize", medir);
    if (quemAbriu) { quemAbriu.focus(); quemAbriu = null; }
  }
  function escolher(escolha) {
    gravar(escolha);
    if (escolha === "aceito") ligarGA(); else desligarGA();
    fechar();
  }
  function mostrar(origem) {
    var t = document.getElementById("aviso-cookies");
    if (!t || document.querySelector(".aviso-cookies")) return;
    var aviso = t.content.firstElementChild.cloneNode(true);
    aviso.querySelectorAll("[data-escolha]").forEach(function (b) {
      b.addEventListener("click", function () { escolher(b.getAttribute("data-escolha")); });
    });
    /* primeiro no corpo da pagina: e o primeiro lugar que o Tab e o leitor
       de tela encontram. Na tela, ele fica embaixo (position: fixed). */
    document.body.insertBefore(aviso, document.body.firstChild);
    raiz.classList.add("com-aviso-cookies");
    medir();
    window.addEventListener("resize", medir, { passive: true });
    if (origem) { quemAbriu = origem; aviso.querySelector("[data-escolha]").focus(); }
  }

  /* rodape: "Preferencias de cookies" */
  var tb = document.getElementById("botao-cookies"), fim = document.querySelector(".rod__fim");
  if (tb && fim) {
    var bt = tb.content.firstElementChild.cloneNode(true);
    bt.addEventListener("click", function () { mostrar(bt); });
    fim.appendChild(bt);
  }

  var atual = ler();
  if (!atual) mostrar(null);
  else if (atual.escolha === "aceito") ligarGA();
})();

/* ---- as mensagens de WhatsApp na lingua da pagina. Depois do quadro de
   pernoite, que acerta o item e o preco do botao dele. ---- */
atualizarZaps();

/* ---- link antigo com ?lang=en numa pagina em portugues vai para a versao
   certa (ate 06/10/2026 o site trocava de lingua assim) ---- */
(function () {
  if (LANG !== "pt") return;
  try {
    var q = new URL(window.location.href).searchParams.get("lang");
    if (q === "en" || q === "es") window.location.replace("/" + q + window.location.pathname + window.location.hash);
  } catch (e) {}
})();

/* ---- ano do rodape ---- */
(function () {
  var a = document.getElementById("ano");
  if (a) a.textContent = new Date().getFullYear();
})();
