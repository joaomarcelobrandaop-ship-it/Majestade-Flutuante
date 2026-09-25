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
   IDIOMAS — PT (padrao, ja no HTML) / EN / ES.
   Mesmo padrao do Corujao e do Coast Tours: todo texto traduzivel tem
   data-i18n="chave"; o portugues fica no HTML e aqui so moram EN e ES.
   data-i18n-aria / data-i18n-alt traduzem aria-label e alt.

   DIFERENCA para os de uma pagina so: a escolha VIAJA NA URL (?lang=en),
   para nao se perder ao trocar de pagina. De proposito NAO usa cookie nem
   localStorage -- o rodape diz "nao guarda nenhum dado seu", e continua
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

/* "Falta a foto 03 de 8" -- o numero vem do data-foto de cada quadro */
const FOTO_N = { pt: "Falta a foto {n} de 8", en: "Photo {n} of 8 still missing", es: "Falta la foto {n} de 8" };

/* o botao do quadro de pernoite: "Reservar para 2 pessoas". O {q} e o
   texto da opcao marcada, ja na lingua da vez. */
const RESERVAR_PARA = { pt: "Reservar para {q}", en: "Book for {q}", es: "Reservar para {q}" };

const I18N = {
  en: {
    titulo: {
      "home": "Majestade Floating Hotel in the Pantanal - Aquidauana, Brazil",
      "camarotes": "Cabins and Price per Person - Majestade Floating Hotel",
      "a-bordo": "What the Floating Hotel Is Like Inside - Majestade",
      "comer-e-beber": "Menu and Meals on Board - Majestade Floating Hotel",
      "como-chegar": "How to Get to Majestade Floating Hotel - Aquidauana",
      "404": "Page not found - Majestade Flutuante"
    },
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
    preco: { pernoite: "Hi! I saw on the website the overnight stay in {item}, {preco} per person with breakfast. Are there dates available? We are [number] people, from [date] to [date]." },
    t: {
      nav_camarotes: "Cabins", nav_bordo: "On board", nav_comer: "Food and drinks", nav_chegar: "Getting here", nav_reservar: "Book",
      nav_aria: "Main", menu_abrir: "Open menu", idioma_aria: "Language", zap_aria: "Chat on WhatsApp",
      hero_h1: "Floating hotel in the Pantanal, departing from Aquidauana, Brazil",
      hero_grande: "Sleep on the river",
      hero_tag: "<b>Majestade</b> is a three-story floating hotel in the Pantanal, boarding at Pesqueiro Itaju in Aquidauana (Mato Grosso do Sul, Brazil). It has 18 beds in four air-conditioned cabins, and an overnight stay with breakfast starts at R$ 200 per person.",
      rod_lema: "The Pantanal at its finest",
      hero_cta: "Check available dates", hero_link: "Cabins and rates",
      hero_alt: "Majestade Flutuante lit up at night, seen from the river, with the lights reflecting on the water",
      oque_t: "A hotel that floats",
      oque_lead: "Majestade is anchored on the water and has everything a small hotel has: <b>four air-conditioned cabins</b>, bathrooms, a lounge, a kitchen and an open deck on the top floor.",
      oque_l1: "<b>18 beds</b> in four cabins: three with four beds and one with six.",
      oque_l2: "<b>Four bathrooms</b>, outside the cabins.",
      oque_l3: "<b>A lounge with TV, sofas, tables and a beer fridge</b>, where everyone gets together after sunset.",
      oque_l4: "<b>Breakfast included</b> with the overnight stay. Lunch and dinner can be arranged.",
      oque_leg: "From above, with the solar panels on the roof.",
      oque_alt: "Aerial view of Majestade Flutuante anchored on the river, with solar panels on the roof and the wooden deck",
      and_t: "Three floors, each with its own time of day",
      and_lead: "The cabins are in the middle. Below are the lounge and the kitchen; above, the open-air deck.",
      andar: "floor",
      sr_and3: "Third floor: ", sr_and2: "Second floor: ", sr_and1: "First floor: ",
      and_3_t: "Open deck, outdoor shower and shade",
      and_3_p: "Chairs and sun loungers in the open for the sun and the late afternoon, plus a covered area with a coffee table for those who prefer the shade.",
      and_3_leg: "The covered deck at night.",
      and_3_alt: "The covered third-floor deck lit up at night, with the forest behind",
      and_2_t: "Four cabins and two bathrooms",
      and_2_p: "Three cabins with four beds (two bunk beds each) and one with six beds (three bunk beds). All air-conditioned.",
      and_2_link: "See the cabins",
      and_1_t: "Lounge, kitchen and two bathrooms",
      and_1_p: "The lounge has TV, air conditioning, tables, sofas and a <b>beer fridge stocked with drinks</b>. The kitchen prepares the meals on board.",
      per_t: "What a night on board costs",
      per_lead: "Prices are <b>per person, per night</b>, with <b>breakfast included</b>. The more people share a cabin, the less each one pays.",
      per_dica: "Choose how many people are going and tap the button: WhatsApp opens with your choice already written.",
      esc_q: "How many people in the cabin?", esc_q_s: "price per person",
      lg_1: "1 person", lg_2: "2 people", lg_3: "3 people", lg_46: "4 to 6 people",
      lg_sr: " on WhatsApp",
      ref_rot: "Meals, to be arranged", almoco: "Lunch", jantar: "Dinner",
      ref_aviso: "Drinks and snacks have their own menu on board.",
      per_link: "See the menu on board",
      fp01_t: "The lounge", fp01_c: "From the corner, <b>landscape</b>, with the sofa, table and beer fridge in one shot.",
      fp02_t: "The kitchen", fp02_c: "Clean and tidy, <b>landscape</b>.",
      fp03_t: "A bathroom", fp03_c: "<b>Portrait</b>, dry and clean, with the light on.",
      faq_t: "Frequently asked questions",
      faq1_q: "How much does a night at Majestade cost?",
      faq1_a: "An overnight stay costs R$ 200 to R$ 500 per person, per night, with breakfast included. The price depends on how many people share the cabin: R$ 200 with 4 to 6 people, R$ 250 with 3, R$ 300 with 2 and R$ 500 for one person.",
      faq2_q: "How many cabins and beds does Majestade have?",
      faq2_a: "There are 18 beds in four cabins: three cabins with four beds (two bunk beds each) and one with six beds (three bunk beds).",
      faq3_q: "Do the cabins have air conditioning and a bathroom?",
      faq3_a: "All four cabins have air conditioning. The bathrooms are outside the cabins: there are four in total, two on the first floor and two on the second.",
      faq4_q: "Are meals included?",
      faq4_a: "Breakfast is included with the overnight stay. Lunch and dinner cost R$ 75 each and are arranged in advance. Drinks, ice and snacks are sold on board.",
      faq5_q: "How do I get to Majestade Flutuante?",
      faq5_a: "You board at Pesqueiro Itaju, in Aquidauana (Mato Grosso do Sul), about 140 km from Campo Grande. From there, the last stretch to the hotel is by boat, at a time arranged when you book.",
      faq6_q: "How do I book?",
      faq6_a: "On WhatsApp at +55 67 9206-3535. Send the number of people, the number of nights and your arrival date, and we reply with the price for your group.",
      rod_zap: "WhatsApp +55 67 9206-3535",
      fim_slogan: "More than a destination, an unforgettable experience!",
      f_pessoas: "People", f_noites: "Nights", f_chegada: "Arrival", f_dia: "day", f_mes: "month",
      f_dia_aria: "Arrival day", f_mes_aria: "Arrival month",
      f_bt: "Send on WhatsApp",
      fim_nota: "The message is written for you. We check the date and reply with the price for your group.",
      rod_p: "Floating hotel in the Pantanal<br>Boarding at Pesqueiro Itaju<br>Aquidauana, Mato Grosso do Sul, Brazil",
      rod_paginas: "Pages", rod_camarotes: "Cabins and rates", rod_falar: "Talk to us",
      rod_cookies: "This site uses no cookies and stores none of your data.",
      /* camarotes */
      cam_h1: "Cabins and price per person",
      cam_lead: "There are 18 beds in four cabins, all with <b>air conditioning</b>. The bathrooms are outside the cabins: there are four, split between the first and second floors.",
      cam_c1_t: "Three cabins with four beds",
      cam_c1_p: "Two bunk beds in each. It is the layout of most cabins: a group of four stays together, and nobody sleeps in the lounge.",
      cam_c2_t: "One cabin with six beds",
      cam_c2_p: "Three bunk beds. It suits a bigger group that wants to share one cabin, or two families traveling together.",
      cam_per_t: "The price is per person",
      cam_per_lead: "Per night, with <b>breakfast included</b>. The more people share a cabin, the less each one pays.",
      cam_regras: "Ask about minimum stay and payment",
      fp04_t: "A made-up cabin",
      fp04_c: "Standing at the door, <b>landscape</b>, with both bunk beds and the air conditioner in the same shot. Beds made, lights on, no bags on the floor. It is the photo that answers \"where will I sleep\".",
      fp05_t: "The bunk bed up close",
      fp05_c: "Just one bed, <b>portrait</b>, showing the mattress, the pillow and the space between the bunks.",
      /* a bordo */
      bor_h1: "What the floating hotel is like inside",
      bor_lead: "There are three floors, each with its own use: the lounge and kitchen below, the cabins in the middle, and the deck open to the river on top.",
      bor_3_p: "Chairs and sun loungers in the open for the sun and the late afternoon, and a <b>covered area</b> with chairs and a coffee table for those who prefer the shade. The shower is outside.",
      bor_2_p: "Three cabins with four beds and one with six, all air-conditioned. The two bathrooms on this floor are shared between the cabins.",
      bor_2_link: "See the cabins and rates",
      bor_1_p: "The lounge has TV, air conditioning, tables, sofas and a <b>beer fridge stocked with drinks</b>. It is where the group has dinner and hangs out. The kitchen prepares the meals on board.",
      bor_nota: "Power, cell signal, what to pack: if you have any question about the place, just ask.",
      bor_cta: "Ask a question",
      fp06_t: "The beer fridge, stocked", fp06_c: "From the front, <b>portrait</b>, with the drinks in view.",
      fp07_t: "The outdoor shower", fp07_c: "<b>Landscape</b>, with the shower and the deck around it.",
      /* comer e beber */
      com_h1: "Menu and meals on board",
      com_lead: "The kitchen is on the first floor. Lunch and dinner are <b>arranged in advance</b>: before the trip we agree on how many people and which days. Drinks, ice and snacks are on board, in the beer fridge and the kitchen.",
      c_garrafa: "Beer, 600 ml bottle", c_lata: "Beer, can", c_refri: "Soft drinks", c_agua: "Water and others", c_gelo: "Ice",
      c_refeicoes: "Full meals", c_aprogramar: "to be arranged", c_porcoes: "Snacks",
      c_pet: "Soft drink, 2 L bottle", c_semgas: "Still water, small bottle", c_comgas: "Sparkling water", c_agua15: "Water 1.5 L (still)",
      c_isotonico: "Sports drink", c_energetico: "Energy drink",
      c_gelocubo: "Ice cubes", c_gelobarra: "Ice block", c_meiabarra: "Half block", c_meiabarra_v: "R$ 15,00 or R$ 20,00",
      c_costela: "Pacu fish ribs, 1 kg", c_batata: "French fries, 800 g", c_arroz: "Rice (serves 4)", c_mandioca: "Boiled cassava (serves 4)",
      com_cafe: "<b>Breakfast</b> is already included in the overnight stay.",
      com_nota: "Prices may change. Please confirm when booking.",
      com_cta: "Arrange meals",
      fp08_t: "The table set for a meal",
      fp08_c: "A meal laid out on the first-floor table, <b>from above</b> (phone pointing down) or <b>landscape</b> from the side. Daylight, no flash: food shot with flash looks bad.",
      /* como chegar */
      che_h1: "How to get to the floating hotel",
      che_lead: "You board at <b>Pesqueiro Itaju</b>, in Aquidauana, in the Pantanal of Mato Grosso do Sul. From there, Majestade's boats take you to the floating hotel.",
      che_1_t: "By car to Aquidauana",
      che_1_p: "Aquidauana is about 140 km from Campo Grande. When you book, we send you the location of the pesqueiro and tell you where to leave the car.",
      che_2_t: "From the pesqueiro to the hotel, by boat",
      che_2_p: "The last stretch is by water. The boarding time is arranged when you book.",
      che_leg: "Majestade seen from the river, by day.",
      che_alt: "Majestade Flutuante seen from the river by day, anchored next to the forest",
      che_cta: "Ask for the location",
      /* 404 */
      nf_h1: "This page does not exist",
      nf_p: "The address may have changed. All the information about the floating hotel is on the home page.",
      nf_link: "Go to the home page"
    }
  },
  es: {
    titulo: {
      "home": "Hotel Flotante Majestade en el Pantanal - Aquidauana, Brasil",
      "camarotes": "Camarotes y Precio por Persona - Hotel Flotante Majestade",
      "a-bordo": "Cómo Es el Hotel Flotante por Dentro - Majestade",
      "comer-e-beber": "Menú de a Bordo y Comidas - Hotel Flotante Majestade",
      "como-chegar": "Cómo Llegar al Hotel Flotante Majestade - Aquidauana",
      "404": "Página no encontrada - Majestade Flutuante"
    },
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
    preco: { pernoite: "¡Hola! Vi en el sitio la estadía en {item}, {preco} por persona con desayuno. ¿Hay fechas disponibles? Somos [nº] personas, del [fecha] al [fecha]." },
    t: {
      nav_camarotes: "Camarotes", nav_bordo: "A bordo", nav_comer: "Comer y beber", nav_chegar: "Cómo llegar", nav_reservar: "Reservar",
      nav_aria: "Principal", menu_abrir: "Abrir el menú", idioma_aria: "Idioma", zap_aria: "Hablar por WhatsApp",
      hero_h1: "Hotel flotante en el Pantanal, con salida desde Aquidauana (MS)",
      hero_grande: "Dormir en medio del río",
      hero_tag: "El <b>Majestade</b> es un hotel flotante de tres pisos en el Pantanal, con embarque en el Pesqueiro Itaju, en Aquidauana (Mato Grosso do Sul, Brasil). Son 18 camas en cuatro camarotes con aire acondicionado, y la estadía con desayuno cuesta desde R$ 200 por persona.",
      rod_lema: "El Pantanal en su mejor experiencia",
      hero_cta: "Ver fechas disponibles", hero_link: "Camarotes y precios",
      hero_alt: "El Majestade Flutuante iluminado de noche, visto desde el río, con las luces reflejadas en el agua",
      oque_t: "Un hotel que flota",
      oque_lead: "El Majestade está anclado sobre el agua y tiene la estructura de un hotel pequeño: <b>cuatro camarotes con aire acondicionado</b>, baños, sala, cocina y una terraza abierta en el último piso.",
      oque_l1: "<b>18 camas</b> en cuatro camarotes: tres de cuatro camas y uno de seis.",
      oque_l2: "<b>Cuatro baños</b>, fuera de las habitaciones.",
      oque_l3: "<b>Sala con TV, sofás, mesas y heladera de cervezas</b>, donde el grupo se junta cuando cae el sol.",
      oque_l4: "<b>Desayuno incluido</b> en la estadía. Almuerzo y cena a coordinar.",
      oque_leg: "Visto desde arriba, con los paneles solares en el techo.",
      oque_alt: "Vista aérea del Majestade Flutuante anclado en el río, con paneles solares en el techo y la terraza de madera",
      and_t: "Tres pisos, cada uno con su momento",
      and_lead: "Los camarotes están en el medio. Abajo, la sala y la cocina; arriba, la terraza al aire libre.",
      andar: "piso",
      sr_and3: "Tercer piso: ", sr_and2: "Segundo piso: ", sr_and1: "Primer piso: ",
      and_3_t: "Terraza abierta, ducha y sombra",
      and_3_p: "Sillas y reposeras al aire libre para el sol y el atardecer, y un área cubierta con mesita de centro para quien prefiere la sombra.",
      and_3_leg: "La terraza cubierta, de noche.",
      and_3_alt: "La terraza cubierta del tercer piso iluminada de noche, con la selva al fondo",
      and_2_t: "Cuatro camarotes y dos baños",
      and_2_p: "Tres camarotes de cuatro camas, con dos literas cada uno, y uno de seis camas, con tres literas. Todos con aire acondicionado.",
      and_2_link: "Ver los camarotes",
      and_1_t: "Sala, cocina y dos baños",
      and_1_p: "La sala tiene TV, aire acondicionado, mesas, sofás y <b>heladera con bebidas</b>. La cocina prepara las comidas a bordo.",
      per_t: "Cuánto cuesta dormir a bordo",
      per_lead: "Precio <b>por persona, por noche</b>, con <b>desayuno incluido</b>. Cuanta más gente en el camarote, menos paga cada uno.",
      per_dica: "Elige cuántas personas van y toca el botón: WhatsApp se abre con tu elección ya escrita.",
      esc_q: "¿Cuántas personas en el camarote?", esc_q_s: "precio por persona",
      lg_1: "1 persona", lg_2: "2 personas", lg_3: "3 personas", lg_46: "4 a 6 personas",
      lg_sr: " por WhatsApp",
      ref_rot: "Comidas, a coordinar", almoco: "Almuerzo", jantar: "Cena",
      ref_aviso: "Bebidas y porciones tienen su propio menú a bordo.",
      per_link: "Ver el menú de a bordo",
      fp01_t: "La sala", fp01_c: "Desde la esquina, <b>horizontal</b>, con el sofá, la mesa y la heladera juntos.",
      fp02_t: "La cocina", fp02_c: "Limpia y ordenada, <b>horizontal</b>.",
      fp03_t: "Un baño", fp03_c: "<b>Vertical</b>, seco y limpio, con la luz encendida.",
      faq_t: "Preguntas frecuentes",
      faq1_q: "¿Cuánto cuesta dormir en el Majestade?",
      faq1_a: "La estadía cuesta de R$ 200 a R$ 500 por persona, por noche, con desayuno incluido. El precio depende de cuántas personas comparten el camarote: R$ 200 con 4 a 6 personas, R$ 250 con 3, R$ 300 con 2 y R$ 500 para una sola persona.",
      faq2_q: "¿Cuántos camarotes y camas tiene el Majestade?",
      faq2_a: "Son 18 camas en cuatro camarotes: tres camarotes de cuatro camas, con dos literas cada uno, y uno de seis camas, con tres literas.",
      faq3_q: "¿Los camarotes tienen aire acondicionado y baño?",
      faq3_a: "Los cuatro camarotes tienen aire acondicionado. Los baños están fuera de las habitaciones: son cuatro en total, dos en el primer piso y dos en el segundo.",
      faq4_q: "¿Las comidas están incluidas?",
      faq4_a: "El desayuno está incluido en la estadía. El almuerzo y la cena cuestan R$ 75 cada uno y se coordinan con anticipación. Bebidas, hielo y porciones se venden a bordo.",
      faq5_q: "¿Cómo se llega al Majestade Flutuante?",
      faq5_a: "El embarque es en el Pesqueiro Itaju, en Aquidauana (Mato Grosso do Sul), a unos 140 km de Campo Grande. Desde ahí, el último tramo hasta el hotel se hace en barco, en el horario acordado al reservar.",
      faq6_q: "¿Cómo hago la reserva?",
      faq6_a: "Por WhatsApp al +55 67 9206-3535. Envía cuántas personas, cuántas noches y la fecha de llegada, y te respondemos con el precio para tu grupo.",
      rod_zap: "WhatsApp +55 67 9206-3535",
      fim_slogan: "¡Más que un destino, una experiencia inolvidable!",
      f_pessoas: "Personas", f_noites: "Noches", f_chegada: "Llegada", f_dia: "día", f_mes: "mes",
      f_dia_aria: "Día de llegada", f_mes_aria: "Mes de llegada",
      f_bt: "Enviar por WhatsApp",
      fim_nota: "El mensaje ya sale escrito. Revisamos la fecha y respondemos con el precio para tu grupo.",
      rod_p: "Hotel flotante en el Pantanal<br>Embarque en el Pesqueiro Itaju<br>Aquidauana, Mato Grosso do Sul, Brasil",
      rod_paginas: "Páginas", rod_camarotes: "Camarotes y precios", rod_falar: "Hablar con nosotros",
      rod_cookies: "Este sitio no usa cookies y no guarda ningún dato tuyo.",
      /* camarotes */
      cam_h1: "Camarotes y precio por persona",
      cam_lead: "Son 18 camas en cuatro camarotes, todos con <b>aire acondicionado</b>. Los baños están fuera de las habitaciones: son cuatro, repartidos entre el primer y el segundo piso.",
      cam_c1_t: "Tres camarotes de cuatro camas",
      cam_c1_p: "Dos literas en cada uno. Es el formato de la mayoría de los camarotes: un grupo de cuatro queda junto, sin que nadie duerma en la sala.",
      cam_c2_t: "Un camarote de seis camas",
      cam_c2_p: "Tres literas. Sirve al grupo más grande que quiere quedarse en el mismo camarote, o a dos familias que viajan juntas.",
      cam_per_t: "El precio es por persona",
      cam_per_lead: "Por noche, con <b>desayuno incluido</b>. Cuanta más gente en el camarote, menos paga cada uno.",
      cam_regras: "Preguntar por estadía mínima y pago",
      fp04_t: "Un camarote arreglado",
      fp04_c: "Parado en la puerta, <b>horizontal</b>, con las dos literas y el aire acondicionado en la misma imagen. Cama hecha, luz encendida, nada de valijas en el piso. Es la foto que responde \"dónde voy a dormir\".",
      fp05_t: "La litera de cerca",
      fp05_c: "Una sola cama, <b>vertical</b>, mostrando el colchón, la almohada y el espacio entre las literas.",
      /* a bordo */
      bor_h1: "Cómo es el hotel flotante por dentro",
      bor_lead: "Son tres pisos. Cada uno tiene su uso: abajo la sala y la cocina, en el medio los camarotes, arriba la terraza abierta al río.",
      bor_3_p: "Sillas y reposeras al aire libre para el sol y el atardecer, y un <b>área cubierta</b> con sillas y mesita de centro para quien prefiere la sombra. La ducha está afuera.",
      bor_2_p: "Tres camarotes de cuatro camas y uno de seis, todos con aire acondicionado. Los dos baños de este piso se comparten entre los camarotes.",
      bor_2_link: "Ver los camarotes y los precios",
      bor_1_p: "La sala tiene TV, aire acondicionado, mesas, sofás y <b>heladera con bebidas</b>. Es donde el grupo cena y conversa. La cocina prepara las comidas a bordo.",
      bor_nota: "Energía, señal de celular, qué llevar en la valija: si te quedó alguna duda sobre la estructura, pregunta directamente.",
      bor_cta: "Hacer una pregunta",
      fp06_t: "La heladera llena", fp06_c: "De frente, <b>vertical</b>, con las bebidas a la vista.",
      fp07_t: "La ducha exterior", fp07_c: "<b>Horizontal</b>, con la ducha y la terraza alrededor.",
      /* comer e beber */
      com_h1: "Menú de a bordo y comidas",
      com_lead: "La cocina está en el primer piso. El almuerzo y la cena se <b>coordinan con anticipación</b>: antes del viaje acordamos cuántas personas y qué días. Bebidas, hielo y porciones están a bordo, en la heladera y en la cocina.",
      c_garrafa: "Cerveza botella 600 ml", c_lata: "Cerveza en lata", c_refri: "Gaseosas", c_agua: "Agua mineral y otros", c_gelo: "Hielo",
      c_refeicoes: "Comidas completas", c_aprogramar: "a coordinar", c_porcoes: "Porciones",
      c_pet: "Gaseosa 2 L", c_semgas: "Sin gas / botellita", c_comgas: "Con gas", c_agua15: "Agua 1,5 L (sin gas)",
      c_isotonico: "Isotónico", c_energetico: "Energizante",
      c_gelocubo: "Hielo en cubos", c_gelobarra: "Hielo en barra", c_meiabarra: "Media barra", c_meiabarra_v: "R$ 15,00 o R$ 20,00",
      c_costela: "Costilla de pacú 1 kg", c_batata: "Papas fritas 800 g", c_arroz: "Porción de arroz (para 4 personas)", c_mandioca: "Mandioca hervida (para 4 personas)",
      com_cafe: "El <b>desayuno</b> ya está incluido en la estadía.",
      com_nota: "Los precios pueden cambiar. Confírmalos al reservar.",
      com_cta: "Coordinar las comidas",
      fp08_t: "La mesa servida",
      fp08_c: "La comida servida en la mesa del primer piso, <b>desde arriba</b> (celular apuntando hacia abajo) o <b>horizontal</b> de costado. Luz de día, sin flash: la comida con flash parece mala.",
      /* como chegar */
      che_h1: "Cómo llegar al hotel flotante",
      che_lead: "El embarque es en el <b>Pesqueiro Itaju</b>, en Aquidauana, en el Pantanal de Mato Grosso do Sul. Desde ahí, las embarcaciones del Majestade te llevan hasta el hotel flotante.",
      che_1_t: "En auto hasta Aquidauana",
      che_1_p: "Aquidauana está a unos 140 km de Campo Grande. Al reservar, te enviamos la ubicación del pesqueiro y te decimos dónde dejar el auto.",
      che_2_t: "Del pesqueiro al hotel flotante, en barco",
      che_2_p: "El último tramo es por agua. El horario de embarque se coordina al reservar.",
      che_leg: "El Majestade visto desde el río, de día.",
      che_alt: "El Majestade Flutuante visto desde el río de día, anclado junto a la selva",
      che_cta: "Pedir la ubicación",
      /* 404 */
      nf_h1: "Esta página no existe",
      nf_p: "La dirección puede haber cambiado. Toda la información del hotel flotante está en la página de inicio.",
      nf_link: "Ir a la página de inicio"
    }
  }
};

var LANG = "pt";

function linkZap(texto) {
  return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(texto);
}

/* ---- guarda o portugues de tudo que se traduz, uma vez ---- */
document.querySelectorAll("[data-i18n]").forEach(function (el) { el.dataset.pt = el.innerHTML; });
document.querySelectorAll("[data-i18n-aria]").forEach(function (el) { el.dataset.ptAria = el.getAttribute("aria-label") || ""; });
document.querySelectorAll("[data-i18n-alt]").forEach(function (el) { el.dataset.ptAlt = el.getAttribute("alt") || ""; });
var TITULO_PT = document.title;
/* o endereco original de cada link interno, para por e tirar o ?lang= */
document.querySelectorAll("a[href]").forEach(function (a) {
  var h = a.getAttribute("href");
  if (/^(https?:|mailto:|tel:|#)/.test(h)) return;
  a.dataset.base = h.replace(/[?#].*$/, "");
});

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

function aplicarIdioma(lang) {
  LANG = (lang === "en" || lang === "es") ? lang : "pt";
  document.documentElement.lang = LANG === "pt" ? "pt-BR" : LANG;
  var t = LANG === "pt" ? null : I18N[LANG].t;

  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var k = el.getAttribute("data-i18n");
    el.innerHTML = (t && t[k] != null) ? t[k] : el.dataset.pt;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
    var k = el.getAttribute("data-i18n-aria");
    el.setAttribute("aria-label", (t && t[k] != null) ? t[k] : el.dataset.ptAria);
  });
  document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
    var k = el.getAttribute("data-i18n-alt");
    el.setAttribute("alt", (t && t[k] != null) ? t[k] : el.dataset.ptAlt);
  });
  document.querySelectorAll("[data-foto]").forEach(function (el) {
    el.textContent = FOTO_N[LANG].replace("{n}", el.getAttribute("data-foto"));
  });

  var pagina = document.documentElement.getAttribute("data-pagina") || "home";
  document.title = LANG === "pt" ? TITULO_PT : (I18N[LANG].titulo[pagina] || TITULO_PT);

  /* a lingua viaja para as outras paginas pelo endereco dos links */
  document.querySelectorAll("a[data-base]").forEach(function (a) {
    a.setAttribute("href", a.dataset.base + (LANG === "pt" ? "" : "?lang=" + LANG));
  });
  try {
    var u = new URL(window.location.href);
    if (LANG === "pt") u.searchParams.delete("lang"); else u.searchParams.set("lang", LANG);
    history.replaceState(null, "", u.pathname + u.search + u.hash);
  } catch (e) { /* sem history, a pagina so nao lembra ao recarregar */ }

  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.setAttribute("aria-pressed", b.getAttribute("data-lang") === LANG ? "true" : "false");
  });
  var sel = document.getElementById("idioma-sel");
  if (sel) sel.value = LANG;

  /* antes do atualizarZaps: o botao do pernoite precisa do texto da opcao
     marcada ja traduzido (o laco do data-i18n, acima, acabou de fazer) */
  if (window.escolheReserva) window.escolheReserva.atualizar();
  atualizarZaps();
  if (window.fraseReserva) window.fraseReserva.traduzir();
}

document.querySelectorAll("[data-lang]").forEach(function (b) {
  b.addEventListener("click", function () { aplicarIdioma(b.getAttribute("data-lang")); });
});
(function () {
  var sel = document.getElementById("idioma-sel");
  if (sel) sel.addEventListener("change", function () { aplicarIdioma(sel.value); });
})();

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
  window.escolheReserva = { atualizar: atualizar };

  quadros.forEach(function (q) {
    q.addEventListener("change", function () { atualizar(); atualizarZaps(); });
  });
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

  function traduzir() {
    Array.prototype.forEach.call(f.mes.options, function (o) {
      if (o.value) o.textContent = MESES[LANG][parseInt(o.value, 10) - 1];
    });
  }
  window.fraseReserva = { traduzir: traduzir };

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

/* ---- a lingua da vez: vem do endereco (?lang=en), ou portugues ---- */
(function () {
  var lang = "pt";
  try { lang = new URL(window.location.href).searchParams.get("lang") || "pt"; } catch (e) {}
  aplicarIdioma(lang);
})();

/* ---- ano do rodape ---- */
(function () {
  var a = document.getElementById("ano");
  if (a) a.textContent = new Date().getFullYear();
})();
