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
    rodape:    "Oi! Queria falar com vocês sobre o flutuante."
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
      rodape:    "Hi! I'd like to talk to you about the floating hotel."
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
      rodape:    "¡Hola! Quería hablar con ustedes sobre el hotel flotante."
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
