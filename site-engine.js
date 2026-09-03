/* ===== BLOQUE ORIGINAL 1 ===== */

document.documentElement.classList.add("performance-mode");

/* Durante desplazamiento y arrastre se omiten temporalmente los filtros más
   costosos. Se restauran al terminar el gesto, sin alterar el estado visual. */
(function instalarRutaRapida(){
  const raiz=document.documentElement;
  let finScroll=0;
  addEventListener("scroll",()=>{
    raiz.classList.add("scrolling-fast");
    clearTimeout(finScroll);
    finScroll=setTimeout(()=>raiz.classList.remove("scrolling-fast"),90);
  },{passive:true});
  document.addEventListener("pointerdown",e=>{
    if(e.target.closest(".ventana"))raiz.classList.add("interaccion-fast");
  },{passive:true,capture:true});
  const terminar=()=>raiz.classList.remove("interaccion-fast");
  document.addEventListener("pointerup",terminar,{passive:true,capture:true});
  document.addEventListener("pointercancel",terminar,{passive:true,capture:true});
})();

function mostrarLoaderSistema(ms=650){
  const loader=document.getElementById("sistemaLoader");
  if(!loader) return;
  loader.classList.add("visible");
  clearTimeout(window._loaderSistemaTimer);
  window._loaderSistemaTimer=setTimeout(()=>{
    loader.classList.remove("visible");
  },ms);
}

if("PerformanceObserver" in window){
  try{
    const longTaskObserver=new PerformanceObserver((list)=>{
      if(list.getEntries().some(entry=>entry.duration>140)){
        mostrarLoaderSistema(620);
      }
    });
    longTaskObserver.observe({entryTypes:["longtask"]});
  }catch(e){}
}

/* =========================
FAVICON
========================= */

(()=>{
  const link=document.querySelector('link[rel~="icon"]') || document.createElement("link");
  link.rel="icon";
  link.type="image/svg+xml";
  link.href="logo-cuadrados.svg";
  if(!link.parentNode) document.head.appendChild(link);
})();

/* =========================
TITULO VIVO
========================= */
document.addEventListener("DOMContentLoaded",()=>{
  const nombre=document.getElementById("nombre");
  if(!nombre || nombre.dataset.tipografiaViva) return;

  const escapar=(ch)=>ch.replace(/[&<>"']/g,(m)=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[m]));

  const texto=(nombre.textContent || "MIGUEL ROSALÉN").trim();
  nombre.setAttribute("aria-label",texto);
  nombre.innerHTML=[...texto].map((ch,i)=>{
    if(ch===" ") return `<span class="nombre-space" aria-hidden="true"></span>`;
    const limpio=escapar(ch);
    return `<span class="nombre-char" data-char="${limpio}" style="--i:${i}" aria-hidden="true">${limpio}</span>`;
  }).join("");
  nombre.dataset.tipografiaViva="1";
});

/* =========================
VOZ ESPAÑOL ESPAÑA · IPHONE
========================= */

let vozEspanol = null;
let vozIngles = null;

function seleccionarVozEspanol(){

  if(!('speechSynthesis' in window)) return null;

  const voces = speechSynthesis.getVoices();

  if(!voces || !voces.length) return null;

  const normalizar = txt =>
    (txt || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"");

  const vocesES =
    voces.filter(v => normalizar(v.lang) === "es-es");

  const vocesEspanol =
    voces.filter(v => normalizar(v.lang).startsWith("es"));

  /* Prioridad: español de España. Cada dispositivo ofrece voces distintas,
     así que elegimos la opción más española disponible en ese navegador. */
  vozEspanol =
    vocesES.find(v => /pablo|jorge|diego|enrique|alvaro|carlos|antonio|juan|miguel|male|hombre|mascul/i.test(normalizar(v.name))) ||
    vocesES.find(v => /microsoft|google|apple|siri/i.test(normalizar(v.name)) && !/mexico|mexicano|latino|latin|us|united states|america/i.test(normalizar(v.name + " " + v.lang))) ||
    vocesES.find(v => /spanish.*spain|espanol.*espana|español.*españa/i.test(v.name)) ||
    vocesES[0] ||
    vocesEspanol.find(v => /pablo|jorge|diego|enrique|alvaro|carlos|antonio|juan|miguel|male|hombre|mascul/i.test(normalizar(v.name + " " + v.lang))) ||
    vocesEspanol.find(v => !/mexico|méxico|latino|latin|us|united states|america|argentina|chile|colombia/i.test(normalizar(v.name + " " + v.lang))) ||
    vocesEspanol[0] ||
    voces[0];

  return vozEspanol;

}

function seleccionarVozIngles(){

  if(!('speechSynthesis' in window)) return null;

  const voces = speechSynthesis.getVoices();

  if(!voces || !voces.length) return null;

  const normalizar = txt =>
    (txt || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"");

  vozIngles =
    voces.find(v => /^en(-|_)?gb/i.test(v.lang) && /daniel|arthur|george|male|hombre/i.test(normalizar(v.name))) ||
    voces.find(v => /^en(-|_)?us/i.test(v.lang) && /alex|david|mark|aaron|male|hombre/i.test(normalizar(v.name))) ||
    voces.find(v => /^en(-|_)?gb/i.test(v.lang)) ||
    voces.find(v => /^en(-|_)?us/i.test(v.lang)) ||
    voces.find(v => normalizar(v.lang).startsWith("en")) ||
    null;

  return vozIngles;

}

if('speechSynthesis' in window){

  speechSynthesis.onvoiceschanged = seleccionarVozEspanol;

  seleccionarVozEspanol();
  seleccionarVozIngles();

  setTimeout(()=>{
    seleccionarVozEspanol();
    seleccionarVozIngles();
  },1000);

}

function dividirTextoPorIdioma(texto){
  const englishWords = [
    "scroll","click","portfolio","read","web","link","links","online",
    "email","mail","gmail","input","output","system","reset","escape",
    "enter","space","backspace","hover","drag","drop","interface","window",
    "windows","chat","prompt","prompts","timer","desktop","mobile"
  ];

  const regex = new RegExp(`\\b(${englishWords.join("|")})\\b`, "gi");
  const partes = [];
  let lastIndex = 0;
  let match;

  while((match = regex.exec(texto)) !== null){
    if(match.index > lastIndex){
      partes.push({ lang:"es-ES", text:texto.slice(lastIndex, match.index) });
    }
    partes.push({ lang:"en-US", text:match[0] });
    lastIndex = regex.lastIndex;
  }

  if(lastIndex < texto.length){
    partes.push({ lang:"es-ES", text:texto.slice(lastIndex) });
  }

  return partes.filter(parte => parte.text && parte.text.trim().length);
}

function humanizarTextoVoz(texto){
  return String(texto || "")
    .replace(/\s+/g," ")
    .replace(/([,;:])/g,"$1 ")
    .replace(/([.!?¿¡])/g,"$1|")
    .replace(/\s*\|\s*/g,"|")
    .split("|")
    .map(t=>t.trim())
    .filter(Boolean);
}

function suavizarPronunciacionIngles(texto){
  return String(texto || "")
    .replace(/\bscroll\b/gi,"scrol")
    .replace(/\bclick\b/gi,"clic")
    .replace(/\bportfolio\b/gi,"portfólio")
    .replace(/\breset\b/gi,"ríset")
    .replace(/\bescape\b/gi,"escéip")
    .replace(/\binput\b/gi,"ínput")
    .replace(/\boutput\b/gi,"áutput")
    .replace(/\bsystem\b/gi,"sístem")
    .replace(/\bprompt\b/gi,"promt")
    .replace(/\bprompts\b/gi,"promts")
    .replace(/\bhover\b/gi,"jóver")
    .replace(/\bdrag\b/gi,"drag")
    .replace(/\bdrop\b/gi,"drop")
    .replace(/\binterface\b/gi,"ínterfeis")
    .replace(/\bwindow\b/gi,"wíndou")
    .replace(/\bwindows\b/gi,"wíndous")
    .replace(/\bchat\b/gi,"chat")
    .replace(/\btimer\b/gi,"táimer")
    .replace(/\bdesktop\b/gi,"désktop")
    .replace(/\bmobile\b/gi,"móubail");
}

function configurarMatizVoz(msg, parte, indice, total){
  const texto=parte.text.trim();
  const profundidadVoz=Math.max(0,Math.min(1,Number(window.iaVoiceDepth)||0));
  const pregunta=/[?¿]/.test(texto);
  const exclamacion=/[!¡]/.test(texto);
  const duda=/\b(creo|quizas|quizá|no se|no sé|tal vez|espera|mmm|eh)\b/i.test(texto);
  const intenso=/\b(no|salida|ayuda|cierra|cierres|miguel|escape|reset|tarde)\b/i.test(texto);
  const variacion=((indice % 5)-2)*0.018;

  msg.volume = intenso ? 1 : 0.92;

  if(parte.lang==="en-US"){
    msg.pitch = pregunta ? 0.84 : 0.76 + variacion;
    msg.rate = duda ? 0.82 : 0.9 + variacion;
    return;
  }

  msg.pitch = 0.64 + variacion;
  msg.rate = 0.88 + variacion;

  if(pregunta){
    msg.pitch += 0.08;
    msg.rate += 0.02;
  }

  if(exclamacion || intenso){
    msg.pitch -= 0.03;
    msg.rate -= 0.04;
  }

  if(duda){
    msg.pitch -= 0.02;
    msg.rate -= 0.08;
  }

  if(total>3 && indice===total-1){
    msg.rate -= 0.04;
  }

  if(profundidadVoz>.24){
    msg.pitch -= profundidadVoz*.16;
    msg.rate -= profundidadVoz*.13;
    msg.volume=Math.max(.62,msg.volume-profundidadVoz*.16);
  }

  if(profundidadVoz>.72 && indice%2===1){
    msg.rate-=.07;
    msg.pitch-=.035;
  }

  msg.pitch=Math.max(.48,Math.min(1.08,msg.pitch));
  msg.rate=Math.max(.62,Math.min(1.12,msg.rate));
}

let microBocaTimer=null;
let microBocaEndTimer=null;

function detenerBocaMicroIA(){
  clearTimeout(microBocaTimer);
  clearTimeout(microBocaEndTimer);
  microBocaTimer=null;
  microBocaEndTimer=null;
  const btn=document.getElementById("microIA");
  if(!btn) return;
  btn.classList.remove("hablando");
  btn.style.setProperty("--voz-scale","1");
  btn.style.background="";
  btn.style.borderColor="";
  btn.style.color="";
  btn.style.transform="";
  btn.style.fontSize="";
}

function iniciarBocaMicroIA(texto){
  const btn=document.getElementById("microIA");
  if(!btn) return;

  detenerBocaMicroIA();
  btn.classList.add("hablando");
  btn.style.background="rgba(255,255,255,.9)";
  btn.style.borderColor="rgba(0,0,0,.22)";
  btn.style.color="#d71920";
  btn.style.transform="none";
}

function hablarRobot(texto){

  if(!('speechSynthesis' in window)) return;

  window.ultimaVozIASistema=Date.now();

  const voz = vozEspanol || seleccionarVozEspanol();
  /* La voz acompaña al chat: una o dos frases bastan para que no invada la lectura. */
  const frases = humanizarTextoVoz(suavizarPronunciacionIngles(texto)).slice(0,2);
  const partes = frases.flatMap((frase,fraseIndex)=>{
    const fragmentos = [{ lang:"es-ES", text:frase }];
    if(fraseIndex < frases.length-1){
      fragmentos.push({ lang:"pausa", text:"..." });
    }
    return fragmentos;
  });

  speechSynthesis.cancel();
  try{ speechSynthesis.resume(); }catch(err){}
  detenerBocaMicroIA();

  (()=>{
    iniciarBocaMicroIA(texto);
    let vocesPendientes=partes.filter(parte=>parte.lang!=="pausa").length;
    partes.forEach((parte,indice)=>{
      if(parte.lang==="pausa"){
        const pausa = new SpeechSynthesisUtterance(" ");
        pausa.volume = 0;
        pausa.rate = 0.55;
        speechSynthesis.speak(pausa);
        return;
      }

      const msg = new SpeechSynthesisUtterance(parte.text);
      msg.lang = parte.lang;

      msg.onstart=()=>{ window.ultimaVozIASistema=Date.now(); };
      msg.onend=()=>{
        window.ultimaVozIASistema=Date.now();
        vocesPendientes--;
      };
      msg.onerror=()=>{
        window.ultimaVozIASistema=Date.now();
        vocesPendientes--;
      };

      if(voz) msg.voice = voz;

      configurarMatizVoz(msg, parte, indice, partes.length);
      speechSynthesis.speak(msg);
    });
  })();



}

/* =========================
TECLAS NUMÉRICAS → VOZ
========================= */

const palabrasTeclado = {
  "1": "hola",
  "2": "¿miguel?",
  "3": "¡Ah!, no. No eres tú...",
  "4": "¿quién eres?",
  "5": "esto no es una página",
  "6": "no cierres",
  "7": "sigue bajando",
  "8": "ya es tarde",
  "9": "no hay salida"
};

function objetivoEscrituraActivo(){
  const el=document.activeElement;
  if(!el) return false;
  const tag=(el.tagName || "").toLowerCase();
  return tag==="input" || tag==="textarea" || el.isContentEditable;
}

function accionEnterSistema(){
  if(window.perdido) return;
  if(typeof ensureIAVentana==="function") ensureIAVentana();
  setTimeout(()=>{
    const input=document.querySelector(".ia-input");
    if(input){
      input.placeholder="pregunta algo, da una orden o pide criterio";
      input.focus();
    }
    if(typeof salidaActualIA==="function"){
      salidaActualIA("ENTER recibido. Estoy lista para pregunta, orden o lectura crítica.");
    }
    if(typeof playNote==="function") playNote("IA", Math.random()*10, .42, 1.05);
  },80);
}

function accionEspacioSistema(){
  if(window.perdido) return;
  document.body.classList.add("sistema-pausa");
  clearTimeout(window._pausaSistemaTimer);
  window._pausaSistemaTimer=setTimeout(()=>{
    document.body.classList.remove("sistema-pausa");
  },1250);
  if(typeof crearComandoTexto==="function"){
    crearComandoTexto("PAUSA", innerWidth*.5, innerHeight*.52, {
      fontSize:"16px",
      opacity:".42",
      life:900
    });
  }
  if(typeof playNote==="function") playNote("IA", Math.random()*10, .28, .72);
}

function accionNumeroSistema(key){
  if(key==="1" && typeof crearComandoTexto==="function"){
    crearComandoTexto("HOLA", innerWidth*.5, innerHeight*.45, {fontSize:"22px", opacity:".55", life:1100});
    return;
  }
  if(key==="2" && typeof crearComandoTexto==="function"){
    crearComandoTexto("¿MIGUEL?", innerWidth*.5, innerHeight*.45, {fontSize:"22px", opacity:".55", life:1200});
    return;
  }
  if(key==="5" && typeof ensureIAVentana==="function"){
    ensureIAVentana();
    if(typeof salidaActualIA==="function") salidaActualIA("comando 5: esto no es una página. es una interfaz en estado de prueba.");
    return;
  }
  if(key==="7"){
    window.scrollTo({top:Math.min(document.body.scrollHeight, window.scrollY + innerHeight*.78), behavior:"smooth"});
    return;
  }
  if(key==="8" && typeof playNote==="function"){
    playNote("IA", Math.random()*10, .72, .52);
    return;
  }
  if(key==="9"){
    const escapeEl=document.getElementById("escape");
    if(escapeEl){
      escapeEl.classList.add("active");
      escapeEl.textContent="NO HAY SALIDA";
      escapeEl.style.opacity=.55;
      setTimeout(()=>{ escapeEl.style.opacity=0; },1600);
    }
  }
}

document.addEventListener("keydown", (e)=>{

  if(window.perdido) return;

  const key = e.key;

  if(palabrasTeclado[key]){

    hablarRobot(palabrasTeclado[key]);
    accionNumeroSistema(key);

    // opcional: meter sonido del sistema IA también
    if(typeof playNote === "function"){
      playNote("IA", Math.random()*10, 0.4, 0.8);
     
    }

  }

});

function activarTeclaInterfaz(key){
  if(window.perdido) return;

  if(key==="Escape" || key==="Enter" || key==="Backspace"){
    document.dispatchEvent(new KeyboardEvent("keydown",{key:key,bubbles:true}));
    return;
  }

  if(key==="Space"){
    document.dispatchEvent(new KeyboardEvent("keydown",{key:" ",code:"Space",bubbles:true}));
    return;
  }

  if(palabrasTeclado[key]){
    hablarRobot(palabrasTeclado[key]);
    accionNumeroSistema(key);
    if(typeof playNote === "function"){
      playNote("IA", Math.random()*10, 0.4, 0.8);
    }
    return;
  }

  document.dispatchEvent(new KeyboardEvent("keydown",{key:key,bubbles:true}));
}

let iaPreguntaActiva=null;

const porronObras=[
  {
    "titulo": "Camisa Porrón",
    "ano": "2022",
    "material": "Camisa estampada; composición propuesta: 65% algodón, 35% poliéster.",
    "medidas": "",
    "descripcion": "La camisa aparece puesta como una primera capa de identidad: no anuncia la marca, la incorpora al cuerpo como si ya perteneciera a una escena cotidiana.",
    "sinFicha": false,
    "span": 5,
    "grupo": "merchandising",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-01.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-01.webp",
    "composicion": [
      {
        "nombre": "Algodón",
        "valor": 65
      },
      {
        "nombre": "Poliéster",
        "valor": 35
      }
    ]
  },
  {
    "titulo": "Detalle de botonadura",
    "ano": "2022",
    "material": "Detalle textil; composición propuesta: 65% algodón, 35% poliéster.",
    "medidas": "",
    "descripcion": "Botones, cuadros y color vino: el detalle acerca la marca a la escala de la piel y del gesto de abrocharse.",
    "sinFicha": false,
    "span": 4,
    "grupo": "merchandising",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-03.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-03.webp",
    "composicion": [
      {
        "nombre": "Algodón",
        "valor": 65
      },
      {
        "nombre": "Poliéster",
        "valor": 35
      }
    ]
  },
  {
    "titulo": "Camisa extendida",
    "ano": "2022",
    "material": "Camisa estampada; composición propuesta: 65% algodón, 35% poliéster.",
    "medidas": "",
    "descripcion": "La prenda queda extendida como si fuera cartel, bandera doméstica y objeto de campaña al mismo tiempo.",
    "sinFicha": false,
    "span": 7,
    "grupo": "merchandising",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-02.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-02.webp",
    "composicion": [
      {
        "nombre": "Algodón",
        "valor": 65
      },
      {
        "nombre": "Poliéster",
        "valor": 35
      }
    ]
  },
  {
    "titulo": "Calzado trenzado",
    "ano": "2022",
    "material": "Calzado con tejido trenzado y suela de goma; composición propuesta: 70% fibra trenzada, 30% goma.",
    "medidas": "",
    "descripcion": "El zapato traduce la marca a una pieza de suelo: rural, seca, ligera, pensada para caminar dentro de la imagen.",
    "sinFicha": false,
    "span": 6,
    "grupo": "merchandising",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-04.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-04.webp",
    "composicion": [
      {
        "nombre": "Fibra trenzada",
        "valor": 70
      },
      {
        "nombre": "Goma",
        "valor": 30
      }
    ]
  },
  {
    "titulo": "Suela de calzado",
    "ano": "2022",
    "material": "Calzado con tejido trenzado y suela de goma; composición propuesta: 70% fibra trenzada, 30% goma.",
    "medidas": "",
    "descripcion": "La suela muestra la parte menos visible del objeto: una marca que también se reconoce por lo que toca el suelo.",
    "sinFicha": false,
    "span": 6,
    "grupo": "merchandising",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-05.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-05.webp",
    "composicion": [
      {
        "nombre": "Fibra trenzada",
        "valor": 70
      },
      {
        "nombre": "Goma",
        "valor": 30
      }
    ]
  },
  {
    "titulo": "Camiseta sin mangas",
    "ano": "2022",
    "material": "Camiseta sin mangas estampada; composición propuesta: 100% algodón.",
    "medidas": "",
    "descripcion": "La camiseta funciona como soporte directo, casi como una etiqueta llevada encima: mancha, firma y cuerpo.",
    "sinFicha": false,
    "span": 5,
    "grupo": "merchandising",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-06.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-06.webp",
    "composicion": [
      {
        "nombre": "Algodón",
        "valor": 100
      }
    ]
  },
  {
    "titulo": "Camiseta sin mangas",
    "ano": "2022",
    "material": "Camiseta sin mangas estampada; composición propuesta: 100% algodón.",
    "medidas": "",
    "descripcion": "La misma pieza cambia de lectura al girarse: de objeto de venta a resto de una escena.",
    "sinFicha": false,
    "span": 5,
    "grupo": "merchandising",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-07.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-07.webp",
    "composicion": [
      {
        "nombre": "Algodón",
        "valor": 100
      }
    ]
  },
  {
    "titulo": "Detalle de camiseta",
    "ano": "2022",
    "material": "Detalle de camiseta estampada; composición propuesta: 100% algodón.",
    "medidas": "",
    "descripcion": "El logotipo se acerca hasta perder solemnidad y volverse textura, casi una mancha textil.",
    "sinFicha": false,
    "span": 7,
    "grupo": "merchandising",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-08.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-08.webp",
    "composicion": [
      {
        "nombre": "Algodón",
        "valor": 100
      }
    ]
  },
  {
    "titulo": "Botella en sombra",
    "ano": "2022",
    "material": "Fotografía digital de producto.",
    "medidas": "",
    "descripcion": "La botella aparece como silueta antes que como etiqueta: una presencia vertical, quieta, casi ritual.",
    "sinFicha": false,
    "span": 4,
    "grupo": "producto / objeto",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-11.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-11.webp"
  },
  {
    "titulo": "Sombra de botella",
    "ano": "2022",
    "material": "Fotografía digital de producto.",
    "medidas": "",
    "descripcion": "La sombra convierte el envase en señal; no hace falta enseñar todo para entender que hay vino esperando.",
    "sinFicha": false,
    "span": 5,
    "grupo": "producto / objeto",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-16.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-16.webp"
  },
  {
    "titulo": "Botella dorada",
    "ano": "2022",
    "material": "Fotografía digital de producto.",
    "medidas": "",
    "descripcion": "El vidrio recoge la luz y la devuelve como metal líquido, entre bodega imaginaria y noche de verano.",
    "sinFicha": false,
    "span": 3,
    "grupo": "producto / objeto",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-18.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-18.webp"
  },
  {
    "titulo": "Imagen de marca",
    "ano": "2022",
    "material": "Fotografía digital y composición gráfica.",
    "medidas": "",
    "descripcion": "La marca entra sobre la imagen como firma de campaña: vino, mesa, fruta oscura y un nombre que se queda flotando.",
    "sinFicha": false,
    "span": 12,
    "grupo": "producto / objeto",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-09.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-09.webp"
  },
  {
    "titulo": "Botella nocturna",
    "ano": "2022",
    "material": "Fotografía digital de producto.",
    "medidas": "",
    "descripcion": "Una botella casi negra sostiene la escena desde el centro, como si el producto fuese una aparición.",
    "sinFicha": false,
    "span": 5,
    "grupo": "producto / objeto",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-26.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-26.webp"
  },
  {
    "titulo": "Uva y brillo",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "La fruta se vuelve materia visual: brillo, grano, piel y promesa de fermentación.",
    "sinFicha": false,
    "span": 7,
    "grupo": "producto / objeto",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-39.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-39.webp"
  },
  {
    "titulo": "Marca sobre flores",
    "ano": "2022",
    "material": "Fotografía digital y composición gráfica.",
    "medidas": "",
    "descripcion": "El logotipo se deposita sobre una superficie floral, mezclando celebración, mancha y recuerdo.",
    "sinFicha": false,
    "span": 12,
    "grupo": "producto / objeto",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-27.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-27.webp"
  },
  {
    "titulo": "Objeto dulce",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "La marca aparece como objeto comestible: una celebración pequeña, blanca, casi excesiva.",
    "sinFicha": false,
    "span": 4,
    "grupo": "producto / objeto",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-30.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-30.webp"
  },
  {
    "titulo": "Cuello de botella",
    "ano": "2022",
    "material": "Fotografía digital de producto.",
    "medidas": "",
    "descripcion": "El cuello de la botella actúa como una aguja: mide la escena y la atraviesa con luz.",
    "sinFicha": false,
    "span": 4,
    "grupo": "producto / objeto",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-23.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-23.webp"
  },
  {
    "titulo": "Botella en exterior",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "La botella queda sola fuera de la mesa, como un resto abandonado después de la conversación.",
    "sinFicha": false,
    "span": 4,
    "grupo": "producto / objeto",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-45.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-45.webp"
  },
  {
    "titulo": "Vidrio ámbar",
    "ano": "2022",
    "material": "Fotografía digital de producto.",
    "medidas": "",
    "descripcion": "El vidrio ya no enseña el vino, enseña la temperatura de la luz que lo rodea.",
    "sinFicha": false,
    "span": 4,
    "grupo": "producto / objeto",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-49.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-49.webp"
  },
  {
    "titulo": "Etiqueta nocturna",
    "ano": "2022",
    "material": "Fotografía digital de producto.",
    "medidas": "",
    "descripcion": "La etiqueta aparece entre destellos rojos, más cerca de una señal que de una ficha de bodega.",
    "sinFicha": false,
    "span": 4,
    "grupo": "producto / objeto",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-52.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-52.webp"
  },
  {
    "titulo": "Piel y sombra",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "La escena se acerca al cuerpo: sudor, sombra y una copa que parece interrumpir el retrato.",
    "sinFicha": false,
    "span": 6,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-10.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-10.webp"
  },
  {
    "titulo": "Mesa cercana",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "Dos cuerpos se inclinan sobre la mesa como si la conversación fuese también una forma de beber.",
    "sinFicha": false,
    "span": 6,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-12.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-12.webp"
  },
  {
    "titulo": "Fruta sobre tela",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "Las uvas caen sobre el blanco como pequeñas manchas de noche: fruta, cuerpo y fiesta en la misma superficie.",
    "sinFicha": false,
    "span": 7,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-14.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-14.webp"
  },
  {
    "titulo": "Tela después",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "La tela registra lo que ha pasado: pliegues, sombras y una presencia que ya se ha movido.",
    "sinFicha": false,
    "span": 5,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-15.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-15.webp"
  },
  {
    "titulo": "Exterior fragmentado",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "La imagen corta la escena en fragmentos: planta, cuerpo, botella y suelo como una misma temperatura.",
    "sinFicha": false,
    "span": 8,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-19.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-19.webp"
  },
  {
    "titulo": "Detalle de suelo",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "El suelo conserva una parte de la historia: tela, sombra y materia sin ordenar del todo.",
    "sinFicha": false,
    "span": 4,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-20.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-20.webp"
  },
  {
    "titulo": "Rastro de tela",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "Una pieza blanca cae sobre la tierra como si la marca también tuviera restos, no solo productos.",
    "sinFicha": false,
    "span": 4,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-21.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-21.webp"
  },
  {
    "titulo": "Sombras vegetales",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "Las sombras vegetales hacen de decorado accidental: una imagen que parece encontrada aunque esté dirigida.",
    "sinFicha": false,
    "span": 4,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-22.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-22.webp"
  },
  {
    "titulo": "Cuello al sol",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "La piel iluminada se vuelve paisaje; el vino queda cerca, pero no necesita ocupar el centro.",
    "sinFicha": false,
    "span": 5,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-24.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-24.webp"
  },
  {
    "titulo": "Tela colgada",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "La tela cuelga como una bandera menor, una señal doméstica dentro de una fiesta más grande.",
    "sinFicha": false,
    "span": 7,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-25.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-25.webp"
  },
  {
    "titulo": "Celebración oscura",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "El cuerpo aparece entre salpicaduras y noche, como si la imagen hubiese sido tomada en mitad del gesto.",
    "sinFicha": false,
    "span": 5,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-31.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-31.webp"
  },
  {
    "titulo": "Mesa con ramas",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "Ramas, vidrio y mantel construyen una mesa que parece ceremonial sin dejar de ser improvisada.",
    "sinFicha": false,
    "span": 7,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-32.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-32.webp"
  },
  {
    "titulo": "Cuerpo y botella",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "El encuadre mira desde abajo, haciendo que beber parezca una acción física, casi coreográfica.",
    "sinFicha": false,
    "span": 6,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-33.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-33.webp"
  },
  {
    "titulo": "Copas en flash",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "La luz rebota en las copas como si la mesa fuese una pista momentánea.",
    "sinFicha": false,
    "span": 6,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-34.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-34.webp"
  },
  {
    "titulo": "Mantel intervenido",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "El blanco recoge huellas y pliegues: no es fondo, es superficie usada.",
    "sinFicha": false,
    "span": 8,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-35.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-35.webp"
  },
  {
    "titulo": "Figura blanca",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "La figura aparece quemada por la luz, como un recuerdo de la fiesta antes de volverse nítido.",
    "sinFicha": false,
    "span": 4,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-36.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-36.webp"
  },
  {
    "titulo": "Derrame gráfico",
    "ano": "2022",
    "material": "Fotografía digital y composición gráfica.",
    "medidas": "",
    "descripcion": "La imagen funciona como una mancha de marca: líquido, firma y exceso sobre una misma superficie.",
    "sinFicha": false,
    "span": 6,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-37.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-37.webp"
  },
  {
    "titulo": "Figura en contraste",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "El cuerpo queda casi recortado por el blanco y negro, reducido a gesto y brillo.",
    "sinFicha": false,
    "span": 4,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-38.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-38.webp"
  },
  {
    "titulo": "Porrón futuro",
    "ano": "2022",
    "material": "Fotografía digital y composición gráfica.",
    "medidas": "",
    "descripcion": "La campaña se abre al exterior: humo, luz y una frase que suena a cartel encontrado de madrugada.",
    "sinFicha": false,
    "span": 12,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-40.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-40.webp"
  },
  {
    "titulo": "Mesa movida",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "La imagen borrosa no falla: dice velocidad, ruido y una mesa que no se queda quieta.",
    "sinFicha": false,
    "span": 5,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-41.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-41.webp"
  },
  {
    "titulo": "Espalda en movimiento",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "Una espalda cruza la escena con luz detrás, como si la fiesta siguiera fuera del encuadre.",
    "sinFicha": false,
    "span": 7,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-42.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-42.webp"
  },
  {
    "titulo": "Firma sobre cuerpo",
    "ano": "2022",
    "material": "Fotografía digital y composición gráfica.",
    "medidas": "",
    "descripcion": "El nombre aparece sobre la ropa como una marca recién escrita, entre piel y documento visual.",
    "sinFicha": false,
    "span": 8,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-43.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-43.webp"
  },
  {
    "titulo": "Coche y noche",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "La noche desplaza la mesa hacia otro lugar: carretera, cuerpo y una botella que sigue operando como señal.",
    "sinFicha": false,
    "span": 7,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-44.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-44.webp"
  },
  {
    "titulo": "Abrazo en grano",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "El grano de la imagen vuelve íntimo lo que podría ser publicidad: dos cuerpos, muy cerca, casi fuera de foco.",
    "sinFicha": false,
    "span": 5,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-46.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-46.webp"
  },
  {
    "titulo": "Porrón escrito",
    "ano": "2022",
    "material": "Fotografía digital y composición gráfica.",
    "medidas": "",
    "descripcion": "La palabra se imprime sobre el cuerpo como una mancha elegante, a medio camino entre etiqueta y tatuaje temporal.",
    "sinFicha": false,
    "span": 6,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-47.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-47.webp"
  },
  {
    "titulo": "Figura junto al coche",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "La escena queda suspendida: una figura, un coche y la oscuridad como espacio de marca.",
    "sinFicha": false,
    "span": 6,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-48.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-48.webp"
  },
  {
    "titulo": "Botella en mano",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "La botella se sostiene sin solemnidad, dentro de una imagen húmeda, social y directa.",
    "sinFicha": false,
    "span": 5,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-50.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-50.webp"
  },
  {
    "titulo": "Botellas en tierra",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "Dos botellas en el suelo convierten el exterior en mesa provisional.",
    "sinFicha": false,
    "span": 7,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-51.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-51.webp"
  },
  {
    "titulo": "Retrato final",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "El retrato cierra la secuencia con una calma rara: después del ruido, una mirada baja.",
    "sinFicha": false,
    "span": 6,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-53.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-53.webp"
  },
  {
    "titulo": "Conversación lateral",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "El encuadre se queda en el borde de la charla, donde la marca respira sin imponerse.",
    "sinFicha": false,
    "span": 6,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-13.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-13.webp"
  },
  {
    "titulo": "Vidrio desenfocado",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "La botella se vuelve destello: menos objeto que sensación alcohólica de la imagen.",
    "sinFicha": false,
    "span": 6,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-17.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-17.webp"
  },
  {
    "titulo": "Brillo fugaz",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "Una luz pequeña atraviesa el encuadre como si algo acabara de pasar demasiado rápido.",
    "sinFicha": false,
    "span": 4,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-28.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-28.webp"
  },
  {
    "titulo": "Mirada nocturna",
    "ano": "2022",
    "material": "Fotografía digital de campaña.",
    "medidas": "",
    "descripcion": "La noche se mira desde dentro; no hay producto en primer plano, solo atmósfera.",
    "sinFicha": false,
    "span": 5,
    "grupo": "campaña / escena",
    "thumb": "portfolio/thumbs/diseno-grafico/folk/folk-29.webp",
    "full": "portfolio/full/diseno-grafico/folk/folk-29.webp"
  }
];

const porronOrdenMerch=[1,2,3,6,7,8,4,5];
const porronTitulosMerch={
  1:"camisa porrón",2:"camisa porrón",3:"camisa porrón",
  6:"tank top porrón",7:"tank top porrón",8:"tank top porrón",
  4:"calzado porrón",5:"calzado porrón"
};
const porronSpansMerch={1:4,2:4,3:4,6:4,7:4,8:4,4:6,5:6};
const porronOrdenVisual=[
  9,10,11,12,13,14,16,15,17,19,18,20,23,24,21,22,25,
  26,31,30,32,34,35,33,39,28,36,27,38,29,41,42,37,44,
  43,45,46,49,47,48,50,51,52,40,53
];
const porronDimensiones={
  1:[486,620],2:[506,620],3:[521,620],4:[505,620],5:[522,620],6:[483,620],7:[505,620],8:[521,620],
  9:[620,310],10:[620,448],11:[441,620],12:[620,350],13:[620,350],14:[620,310],15:[620,310],16:[606,620],
  17:[620,474],18:[486,620],19:[620,310],20:[620,476],21:[590,620],22:[620,446],23:[411,620],24:[620,552],
  25:[620,472],26:[541,620],27:[620,310],28:[518,620],29:[620,495],30:[521,620],31:[620,497],32:[620,437],
  33:[620,475],34:[620,310],35:[620,310],36:[521,620],37:[620,497],38:[489,620],39:[620,476],40:[620,310],
  41:[620,518],42:[620,388],43:[620,310],44:[620,446],45:[436,620],46:[509,620],47:[620,482],48:[620,453],
  49:[448,620],50:[438,620],51:[620,447],52:[478,620],53:[620,476]
};
/* Las imágenes de Porrón quedan como archivo visual: solo conserva la composición de las prendas. */
porronObras.forEach(obra=>{
  obra.descripcion="";
  if(!/composici[oó]n propuesta/i.test(obra.material||"")) obra.material="";
});
const porronPorNumero=new Map(
  porronObras.map(obra=>{
    const coincidencia=String(obra.full || obra.thumb || "").match(/folk-(\d+)\.webp$/);
    return [coincidencia ? Number(coincidencia[1]) : -1,obra];
  })
);
const porronObrasOrdenadas=[...porronOrdenMerch,...porronOrdenVisual]
  .map((numero,index)=>{
    const obra=porronPorNumero.get(numero);
    if(!obra) return null;
    const [ancho,alto]=porronDimensiones[numero] || [4,3];
    if(index<porronOrdenMerch.length){
      return {...obra,titulo:porronTitulosMerch[numero] || obra.titulo,grupo:"merchandising",ancho,alto,span:porronSpansMerch[numero] || obra.span};
    }
    return {
      ...obra,
      titulo:`Imagen de marca ${index-porronOrdenMerch.length+1}`,
      ancho,
      alto,
      grupo:"campaña · producto",
      material:"",
      medidas:"",
      descripcion:"",
      sinFicha:true
    };
  })
  .filter(Boolean);

const portfolioSecciones=[
  {
    id:"diseno-grafico",
    titulo:"DISEÑO GRÁFICO",
    nota:"dirección creativa · moda · marca · editorial",
    obras:[],
    subsecciones:[
      {
        id:"porron",
        titulo:"PORRÓN",
        nota:"identidad · dirección de arte · campaña · merchandising",
        layout:"editorial",
        editorialNota:"proyecto de marca · visualboard generativo · dirección de arte",
        editorialTextoModo:"orb",
        soloAmpliarMerch:true,
        editorialTexto:[
          "Porrón parte de una idea sencilla: beber nunca es solamente beber.",
          "Alrededor del vino se construyen conversaciones, celebraciones, silencios y formas de pertenencia. Una botella no contiene únicamente un líquido; también puede provocar una situación. Determina cómo se sirve, cómo se comparte y qué distancia se establece entre quienes están alrededor de una mesa.",
          "El porrón lo hace de una manera especialmente clara. Para beber hay que levantarlo, inclinar la cabeza y calcular el chorro. El gesto exige atención y cierta confianza: se puede acertar, derramar el vino o hacer el ridículo. Durante unos segundos, beber deja de ser una acción automática y se convierte en algo que involucra a todo el cuerpo.",
          "Además, el porrón pasa de mano en mano sin tocar los labios. Une a las personas, pero mantiene una pequeña distancia entre ellas. Es individual y colectivo al mismo tiempo. En esa contradicción reside buena parte de su inteligencia.",
          "Frente a un presente lleno de productos diseñados para consumirse de forma rápida, cómoda y privada, el porrón introduce una pequeña dificultad. No se adapta por completo a quien lo utiliza; exige que quien lo utiliza aprenda también a relacionarse con él. Esa falta de comodidad no es un defecto, sino aquello que transforma el consumo en experiencia.",
          "La marca nace de esta forma de entender el objeto. No pretende recuperar el porrón como una reliquia ni utilizar lo rural como una imagen nostálgica. Parte de una tradición que sigue viva y se pregunta qué puede decir dentro de un contexto contemporáneo.",
          "Porrón propone recuperar no solo una forma, sino el gesto que esa forma provoca: acercarse, compartir, prestar atención y aceptar la posibilidad de perder un poco el control.",
          "El producto es un vino joven de 2022, directo y pensado para disfrutarse sin una ceremonia excesiva. Su valor no reside en parecer inaccesible ni en adoptar los códigos solemnes del vino de lujo, sino en convertir una acción cotidiana en un momento memorable.",
          "La botella reinterpreta la silueta del porrón y la traslada a un lenguaje comercial contemporáneo. No funciona únicamente como envase ni como símbolo gráfico. Es el centro físico de la experiencia: se puede servir de manera convencional, pero conserva la posibilidad del chorro, el juego y la participación.",
          "De este modo, el concepto no se limita a aparecer escrito en una etiqueta. Está incorporado en la forma de utilizar el producto.",
          "A su alrededor se construye un universo visual intenso, cercano y ligeramente imprevisible. El rojo del vino se desplaza hacia granates, violetas y reflejos casi eléctricos. Los verdes, blancos y tonos de tierra remiten al paisaje sin convertirlo en una postal idealizada.",
          "La fotografía utiliza el flash para endurecer la luz y hacer visibles la piel, el vidrio, las manchas y los tejidos. Los encuadres se acercan demasiado; algunos cuerpos quedan cortados, desenfocados o parcialmente ocultos. Las imágenes no muestran una reunión perfecta, sino una escena en la que ya han ocurrido cosas.",
          "La botella aparece entre manos, fruta, ropa, sombras y restos de vino. No se presenta como una pieza intocable, sino como un objeto que se agarra, se comparte, se mancha y se vacía.",
          "Esa tensión entre lo rural y lo nocturno define la identidad de Porrón. La tradición convive con la moda, la fotografía editorial y una sensibilidad joven sin disfrazarse de modernidad. El proyecto no enfrenta el pasado y el presente; muestra que pueden formar parte de una misma escena.",
          "Porrón no vende únicamente vino. Propone una forma de beberlo y una situación en la que hacerlo. El producto se asocia a una temperatura, una luz, unos cuerpos y una manera de estar juntos. La marca adquiere valor no por separarse de la vida cotidiana, sino por intervenir en ella.",
          "El merchandising prolonga este universo fuera de la mesa. Las prendas y los objetos no funcionan como publicidad literal, sino como fragmentos de una identidad reconocible. El color, las manchas, las palabras y los materiales permiten que la marca circule incluso cuando la botella no está presente.",
          "Las imágenes del proyecto se han desarrollado con herramientas de inteligencia artificial generativa y funcionan como un visualboard expandido. Permiten ensayar iluminación, color, estilismo, casting, localizaciones y encuadres antes de trasladar la propuesta a una producción física.",
          "No se entienden como una campaña terminada ni como sustitutas de una sesión real. Son una forma de hacer visibles las decisiones, detectar errores y comprobar qué imágenes pertenecen realmente a la marca.",
          "La inteligencia artificial puede multiplicar posibilidades, pero no establecer un criterio. La parte decisiva sigue siendo humana: formular una intención, seleccionar, corregir y convertir imágenes dispersas en un sistema coherente.",
          "Porrón no intenta modernizar una tradición como si estuviera caducada. Parte de algo que todavía funciona y lo desplaza de contexto para hacerlo visible de otra manera.",
          "En una época en la que casi todo puede consumirse a solas, con rapidez y sin contacto, Porrón propone acercarse, mirar, calcular y compartir.",
          "Una marca joven que no necesita fingir que ha nacido de cero.",
          "Su novedad está, precisamente, en saber de dónde bebe."
        ],
        editorialFacts:[
          "vino joven · 2022",
          "identidad · producto · campaña · merchandising",
          "IA generativa como visualboard y prototipo de producción"
        ],
        obras:porronObrasOrdenadas
      }
    ]
  },
  {
    id:"artes-visuales",
    titulo:"ARTES VISUALES",
    nota:"cuerpo · acción · registro",
    obras:[],
    subsecciones:[
      {
        id:"tatuaje",
        titulo:"TATUAJE",
        nota:"archivo de piel · dibujo directo",
        layout:"archivo-miniaturas",
        obras:[
          {
            titulo:"Dibujo prestado",
            ano:"2021",
            material:"Lápiz de color sobre papel y tinta sobre piel",
            medidas:"dibujo A3 aprox. · tatuaje aprox. 22 × 16 cm",
            descripcion:"El tatuaje parte de un dibujo que no intenta volverse perfecto al pasar a la piel. Conserva la proporción infantil, la frontalidad y la emoción directa del trazo. El cuerpo no corrige el dibujo: lo recibe como una escena afectiva.",
            sinFicha:true,
            thumb:"portfolio/thumbs/artes-visuales/tatuaje/tatuaje-05-dibujo-piel.webp",
            full:"portfolio/full/artes-visuales/tatuaje/tatuaje-05-dibujo-piel.webp"
          },
          {
            titulo:"Girls & Gays",
            ano:"2021",
            material:"Tinta negra y roja sobre piel",
            medidas:"aprox. 8 × 7 cm",
            descripcion:"Una imagen pequeña, casi como una nota escrita en la piel. El corazón rojo organiza el centro y convierte el texto en declaración, no en adorno. La línea mantiene una torpeza buscada: cercana, política y tierna a la vez.",
            sinFicha:true,
            thumb:"portfolio/thumbs/artes-visuales/tatuaje/tatuaje-04-girls-gays.webp",
            full:"portfolio/full/artes-visuales/tatuaje/tatuaje-04-girls-gays.webp"
          },
          {
            titulo:"Estrellas sobre hombro",
            ano:"2021",
            material:"Tinta negra sobre piel",
            medidas:"aprox. 14 × 13 cm",
            descripcion:"Las estrellas se pisan, se abren y se desordenan sobre una zona curva del cuerpo. No funcionan como símbolo cerrado, sino como dibujo rápido que se adapta al movimiento. El hombro convierte la línea en algo casi orbital.",
            sinFicha:true,
            thumb:"portfolio/thumbs/artes-visuales/tatuaje/tatuaje-03-estrellas-espalda.webp",
            full:"portfolio/full/artes-visuales/tatuaje/tatuaje-03-estrellas-espalda.webp"
          },
          {
            titulo:"Estrellas sobre brazo",
            ano:"2021",
            material:"Tinta negra sobre piel",
            medidas:"aprox. 18 × 9 cm",
            descripcion:"Dos estrellas alargadas recorren el brazo como una marca en tránsito. La línea no busca limpieza industrial: vibra, se dobla y acompaña la anatomía. El motivo se vuelve más interesante por su fragilidad que por su precisión.",
            sinFicha:true,
            thumb:"portfolio/thumbs/artes-visuales/tatuaje/tatuaje-02-estrellas-brazo.webp",
            full:"portfolio/full/artes-visuales/tatuaje/tatuaje-02-estrellas-brazo.webp"
          },
          {
            titulo:"Estrellas sobre pierna",
            ano:"2021",
            material:"Tinta negra sobre piel",
            medidas:"aprox. 9 × 7 cm",
            descripcion:"Dos estrellas cerca del tobillo, vistas desde una distancia doméstica, casi accidental. La escala las vuelve discretas, pero el cuerpo las activa al caminar. La imagen parece aparecer y desaparecer con la postura.",
            sinFicha:true,
            thumb:"portfolio/thumbs/artes-visuales/tatuaje/tatuaje-06-estrellas-pierna.webp",
            full:"portfolio/full/artes-visuales/tatuaje/tatuaje-06-estrellas-pierna.webp"
          },
          {
            titulo:"Archivo de signos",
            ano:"2021",
            material:"Tinta negra, roja, naranja, violeta y amarilla sobre piel",
            medidas:"aprox. 18 × 12 cm",
            descripcion:"Círculos, estrellas, flores y pequeñas marcas conviven sin jerarquía. La pierna funciona como una página donde los signos se acumulan por impulso. No hay una imagen única: hay una constelación de decisiones, casi como apuntes hechos con urgencia.",
            sinFicha:true,
            thumb:"portfolio/thumbs/artes-visuales/tatuaje/tatuaje-01-archivo-color.webp",
            full:"portfolio/full/artes-visuales/tatuaje/tatuaje-01-archivo-color.webp"
          },
          {
            titulo:"Columna de color",
            ano:"2021",
            material:"Tinta negra, roja, violeta, amarilla y verde sobre piel",
            medidas:"aprox. 12 × 4 cm",
            descripcion:"Una línea vertical de formas pequeñas atraviesa la pierna como una cadena de señales. El color no rellena: marca temperatura, ritmo y diferencia entre signos. La pieza parece ligera, pero queda muy fija en la memoria visual.",
            sinFicha:true,
            thumb:"portfolio/thumbs/artes-visuales/tatuaje/tatuaje-07-columna-color.webp",
            full:"portfolio/full/artes-visuales/tatuaje/tatuaje-07-columna-color.webp"
          }
        ]
      }
    ]
  },  {
    id:"artes-plasticas",
    titulo:"ARTES PLÁSTICAS",
    nota:"pintura · escultura · instalación · objeto",
    obras:[],
    subsecciones:[
      {
        id:"pintura",
        titulo:"PINTURA",
        nota:"serie Pared · archivo de pintura",
        layout:"archivo-miniaturas",
        obras:[
          {
            titulo:"Pared I",
            ano:"2021",
            material:"Spray, acrílico, grafito, papel adherido y materia acrílica sobre soporte recuperado",
            medidas:"135 × 95 cm",
            descripcion:"La imagen aparece como una superficie arrancada de su contexto y obligada a sostenerse sola. El verde ácido actúa como una señal reciente sobre una capa ya gastada. La obra habla desde esa mezcla de inscripción, accidente y resto.",
            thumb:"portfolio/thumbs/artes-plasticas/pintura/pared-01-i.webp",
            full:"portfolio/full/artes-plasticas/pintura/pared-01-i.webp"
          },
          {
            titulo:"Pared II",
            ano:"2021",
            material:"Spray, acrílico, grafito, papel adherido y carga matérica blanca sobre soporte textil",
            medidas:"116 × 89 cm",
            descripcion:"La superficie blanca no limpia: cubre, borra a medias y deja que lo anterior siga respirando. Las zonas negras aparecen como impactos o restos de una escritura interrumpida. Es una pintura donde la materia funciona como memoria visible.",
            thumb:"portfolio/thumbs/artes-plasticas/pintura/pared-02-ii.webp",
            full:"portfolio/full/artes-plasticas/pintura/pared-02-ii.webp"
          },
          {
            titulo:"Pared III",
            ano:"2021",
            material:"Acrílico, pigmento amarillo y veladuras sobre soporte textil",
            medidas:"110 × 105 cm",
            descripcion:"El amarillo ocupa la tela como una luz retenida, irregular, casi ambiental. Los pliegues y las zonas de absorción impiden que el color sea plano. La pieza convierte una superficie mínima en un campo de presencia lenta.",
            thumb:"portfolio/thumbs/artes-plasticas/pintura/pared-03-iii.webp",
            full:"portfolio/full/artes-plasticas/pintura/pared-03-iii.webp"
          },
          {
            titulo:"Pared IV",
            ano:"2021",
            material:"Pigmento, acrílico diluido, transferencia y abrasión sobre arpillera o tejido crudo",
            medidas:"54 × 92 cm",
            descripcion:"Dos fragmentos pequeños funcionan como una lectura partida. Uno concentra fricción y oscuridad; el otro conserva una marca más diluida, casi sedimentada. La separación entre ambos construye un ritmo de aparición y pérdida.",
            thumb:"portfolio/thumbs/artes-plasticas/pintura/pared-04-iv.webp",
            full:"portfolio/full/artes-plasticas/pintura/pared-04-iv.webp"
          },
          {
            titulo:"Pared V",
            ano:"2021",
            material:"Spray, acrílico, pigmento oscuro y veladuras sobre soporte textil",
            medidas:"46 × 24 cm",
            descripcion:"Una tela estrecha donde la mancha cae como si hubiera atravesado la superficie. La franja superior marca un límite y convierte el resto en zona de descenso. Lo mínimo se vuelve una forma de insistencia.",
            thumb:"portfolio/thumbs/artes-plasticas/pintura/pared-05-v.webp",
            full:"portfolio/full/artes-plasticas/pintura/pared-05-v.webp"
          },
          {
            titulo:"Pared VI",
            ano:"2021",
            material:"Acrílico, pigmento, veladuras líquidas e impresión de humedad sobre soporte textil",
            medidas:"38 × 36 cm",
            descripcion:"La imagen aparece casi por debajo de sí misma: marcas líquidas, zonas apagadas y una esquina amarilla que sostiene la composición. No busca imponerse, sino quedar como rastro. La tela funciona como una memoria pequeña, parcial e insistente.",
            thumb:"portfolio/thumbs/artes-plasticas/pintura/pared-06-vi.webp",
            full:"portfolio/full/artes-plasticas/pintura/pared-06-vi.webp"
          },
          {
            titulo:"Pared VII",
            ano:"2021",
            material:"Spray, acrílico, pigmento oscuro, veladura y restos de hilo sobre soporte textil",
            medidas:"34 × 16 cm",
            descripcion:"La escala pequeña obliga a mirar despacio. El bloque oscuro cae sobre la tela sin cerrarla del todo, y los hilos convierten el borde en una parte activa de la pieza. Parece un resto mínimo, pero mantiene una presencia difícil de cancelar.",
            thumb:"portfolio/thumbs/artes-plasticas/pintura/pared-07-vii.webp",
            full:"portfolio/full/artes-plasticas/pintura/pared-07-vii.webp"
          },
          {
            titulo:"Pared VIII",
            ano:"2021",
            material:"Acrílico, pigmento amarillo y textura sobre soporte textil",
            medidas:"32 × 32 cm",
            descripcion:"El amarillo se deposita como una luz gastada sobre una tela pequeña. Los pliegues rompen cualquier idea de superficie perfecta y hacen que el color tenga cuerpo. La obra parece simple, pero esa simpleza está llena de variaciones y señales leves.",
            thumb:"portfolio/thumbs/artes-plasticas/pintura/pared-08-viii.webp",
            full:"portfolio/full/artes-plasticas/pintura/pared-08-viii.webp"
          }
        ]
      },
      {
        id:"instalacion",
        titulo:"INSTALACIÓN",
        nota:"instalación · objeto · archivo",
        layout:"archivo-miniaturas",
        obras:[
          {
            titulo:"Tres veces cemento",
            ano:"2019",
            material:"Instalación site-specific: poliestireno expandido, ladrillos cerámicos, fotografía digital y archivo familiar",
            medidas:"4 × 8 × 0,25 m",
            descripcion:"",
            thumb:"portfolio/thumbs/artes-plasticas/instalacion/instalacion-01-la-misma-imagen.webp",
            full:"portfolio/full/artes-plasticas/instalacion/instalacion-01-la-misma-imagen.webp"
          },
          {
            titulo:"Cómo llorarle a un castillo de arena",
            ano:"2024",
            material:"Instalación site-specific: cemento, arena de playa, agua de mar y bivalvos; fotografía digital y objeto intervenido",
            medidas:"Dimensiones variables",
            descripcion:"",
            thumb:"portfolio/thumbs/artes-plasticas/instalacion/instalacion-02-castillo.webp",
            full:"portfolio/full/artes-plasticas/instalacion/instalacion-02-castillo.webp"
          },
          {
            titulo:"El hueco del hueco",
            ano:"2022",
            material:"Instalación: ropa de cama y tinta termocromática",
            medidas:"Dimensiones variables",
            descripcion:"",
            thumb:"portfolio/thumbs/artes-plasticas/instalacion/instalacion-03-cama.webp",
            full:"portfolio/full/artes-plasticas/instalacion/instalacion-03-cama.webp"
          },
          {
            titulo:"Lo que los muros saben",
            ano:"2022",
            material:"Instalación site-specific: ropa, lejía y tendederos",
            medidas:"Dimensiones variables",
            descripcion:"",
            thumb:"portfolio/thumbs/artes-plasticas/instalacion/instalacion-04-bandera.webp",
            full:"portfolio/full/artes-plasticas/instalacion/instalacion-04-bandera.webp"
          },
          {
            titulo:"Sobre las paredes está escrito mi nombre",
            ano:"2020",
            material:"Libro de artista en papel poliéster de 75 micras y caja de cemento",
            medidas:"Libro 12 × 60 cm · caja 21 × 29,7 cm",
            descripcion:"",
            thumb:"portfolio/thumbs/artes-plasticas/instalacion/instalacion-05-objeto-libro.webp",
            full:"portfolio/full/artes-plasticas/instalacion/instalacion-05-objeto-libro.webp"
          },
          {
            titulo:"Lo que los muros saben",
            ano:"2022",
            material:"Instalación: muro de hormigón, render 3D y fotografía digital",
            medidas:"Muro 160 × 280 cm",
            descripcion:"",
            thumb:"portfolio/thumbs/artes-plasticas/instalacion/instalacion-06-muro.webp",
            full:"portfolio/full/artes-plasticas/instalacion/instalacion-06-muro.webp",
            galeria:[
              {img:"assets/multiverse/instalacion-muros/muros-01-muro.webp",titulo:"Lo que los muros saben · muro",ano:"2022",material:"Muro de hormigón",medidas:"160 × 280 cm",descripcion:""},
              {img:"assets/multiverse/instalacion-muros/muros-02-render.webp",titulo:"Lo que los muros saben · render 3D",ano:"2022",material:"Render 3D",medidas:"",descripcion:""}
            ]
          }
        ]
      }
    ]
  }
];

const artesVisualesPortfolio=portfolioSecciones.find(sec=>sec.id==="artes-visuales");
const artesPlasticasPortfolio=portfolioSecciones.find(sec=>sec.id==="artes-plasticas");
if(artesVisualesPortfolio && artesPlasticasPortfolio){
  const indiceTatuaje=artesVisualesPortfolio.subsecciones.findIndex(sec=>sec.id==="tatuaje");
  if(indiceTatuaje!==-1){
    const [tatuaje]=artesVisualesPortfolio.subsecciones.splice(indiceTatuaje,1);
    artesPlasticasPortfolio.subsecciones.push(tatuaje);
  }

const performancePortfolio={
  id:"performance",
  titulo:"PERFORMANCE",
  nota:"cuerpo · acción · archivo",
  layout:"archivo-performance",

  obras:[
    {
      numero:1,
      titulo:"nyotaimori 720p_30fps",
      tipo:"video",
      thumb:"portfolio/thumbs/artes-visuales/performance/performance-01-thumb.webp",
      video:"assets/multiverse/performance-nyotaimori-preview.mp4",
      videoPreload:"metadata",
      sensible:true,
      x:8,
      y:8,
      w:138
    },
    {
      numero:2,
      titulo:"tres veces cemento",
      tipo:"imagen",
      thumb:"assets/multiverse/tres-veces-cemento-instalacion.jpg",
      full:"assets/multiverse/tres-veces-cemento-instalacion.jpg",
      video:"assets/multiverse/performance-tres-veces-cemento-preview.mp4",
      videoPreload:"metadata",
      ano:"Valencia · 2019 · Video Instalación",
      descripcion:"La negativa no como excepción, sino como forma de inscripción: aquello que no aparece en el archivo queda fuera del campo de reconocimiento.",
      galeria:[
        {
          img:"assets/multiverse/tres-veces-cemento-instalacion.jpg",
          titulo:"tres veces cemento",
          noAmpliar:true,
          ano:"Valencia · 2019 · Video Instalación",
          descripcion:"La negativa no como excepción, sino como forma de inscripción: aquello que no aparece en el archivo queda fuera del campo de reconocimiento."
        },
        {
          img:"assets/multiverse/tres-veces-cemento-documentos.jpg",
          titulo:"tres veces cemento · archivo",
          noAmpliar:true,
          ano:"Imagen 1 (izq.) Registro oficial sobre la situación de mi abuelo en uno de los campos de concentración en el que estuvo, 1945.<br><br>Imagen 2 (der.) Respuesta a solicitud de certificado de permanencia en prisión, 1993."
        },
        {
          img:"assets/multiverse/tres-veces-cemento-registro-01.jpg",
          titulo:"tres veces cemento · registro 01",
          noAmpliar:true
        },
        {
          img:"assets/multiverse/tres-veces-cemento-registro-02.jpg",
          titulo:"tres veces cemento · registro 02",
          noAmpliar:true
        }
      ],
      x:28,
      y:18,
      w:110
    },
    {
      numero:3,
      titulo:"el rincón de pensar",
      tipo:"video",
      thumb:"portfolio/thumbs/artes-visuales/performance/performance-03-thumb.webp",
      video:"assets/multiverse/performance-rincon-pensar-preview.mp4",
      videoPreload:"metadata",
      ano:"Granada · 2023 · 53' 01\"",
      descripcion:"Comer pipas es una acción cotidiana que se desarrolla en espacios sociales, una práctica extraordinariamente habitual que tiene un gran valor cultural. Así pues, este lenguaje –succionar, pelar, comer, intercambiar y punzar– nos permite establecer una conexión temporal con las personas que compartimos la comida; un aspecto de la interacción social que de forma arbitraria plantea nuevas formas de comunicación. Este proceso tiene implicaciones en la construcción de la identidad grupal (AB) y la forma que se percibe la dialéctica en el ritual de comer pipas, sujeta a la relación física entre los participantes, a partir de los cuales se establece una unión somática por medio de sus fluidos corporales –saliva y sangre–.<br><br><em>El rincón de pensar</em> –en aquella esquina–, una delimitación espacial; como territorio de reflexión y autocontrol, nos sirve para configurar una cartografía de aquellos espacios –tan ínfimos– que se emplean como refugio; espacio de reflexión en el que dialogar de forma libre. Un lugar donde concebir nuevas formas dialécticas –gestuales, corporales; formas de comunicación no verbales, sin condicionantes–.",
      galeria:[
        {img:"assets/multiverse/performance-rincon-pensar-01.webp",titulo:"el rincón de pensar · registro 01",ano:"Granada · 2023 · 53' 01\"",sensible:true},
        {img:"assets/multiverse/performance-rincon-pensar-02.webp",titulo:"el rincón de pensar · registro 02",sensible:true}
      ],
      sensible:true,
      x:64,
      y:10,
      w:145
    },
    {
      numero:4,
      titulo:"ruski-ruski",
      tipo:"video",
      thumb:"portfolio/thumbs/artes-visuales/performance/performance-04-thumb.webp",
      video:"assets/multiverse/performance-ruski-ruski-preview.mp4",
      videoPreload:"metadata",
      ano:"Granada · 2023 · 50' 38\"",
      descripcion:"&lt;&lt;los ejercicios son como lavarse los dientes, una acción necesaria pero no creativa&gt;&gt;<br><br>Inspirado en el teatro <em>In-your-face</em>, el trabajo habla de cómo el juego lúdico contribuye a crear nuevas modalidades discursivas que nos permitan reformular la idea sobre la colectividad.",
      galeria:[
        {img:"assets/multiverse/performance-ruski-ruski-01.webp",titulo:"ruski-ruski · registro 01",ano:"Granada · 2023 · 50' 38\"",sensible:true},
        {img:"assets/multiverse/performance-ruski-ruski-02.webp",titulo:"ruski-ruski · registro 02",sensible:true},
        {img:"assets/multiverse/performance-ruski-ruski-03.webp",titulo:"ruski-ruski · registro 03",sensible:true},
        {img:"assets/multiverse/performance-ruski-ruski-04.webp",titulo:"ruski-ruski · registro 04",sensible:true},
        {img:"assets/multiverse/performance-ruski-ruski-05.webp",titulo:"ruski-ruski · registro 05",sensible:true}
      ],
      sensible:true,
      x:76,
      y:29,
      w:142
    },
    {
      numero:5,
      titulo:"morning pages",
      tipo:"video",
      thumb:"portfolio/thumbs/artes-visuales/performance/performance-05-thumb.webp",
      video:"assets/multiverse/performance-morning-pages-preview.mp4",
      videoPreload:"metadata",
      ano:"Valencia · 2021 · 2'30''",
      descripcion:"<em>Morning Pages</em> fue presentada en <a href=\"https://musicaelectronica.blogs.upv.es/2021/11/14/mevart-2021/\" target=\"_blank\" rel=\"noopener noreferrer\">MEVArt</a> – Música Electrónica y Vídeo Arte, festival organizado por la Universitat Politècnica de València y centrado en la experimentación entre imagen, sonido, tecnología y creación contemporánea.<br><br>La pieza se inscribe dentro del vídeo experimental y parte de una aproximación más libre a la construcción audiovisual, alejándose de una narrativa convencional para trabajar desde el ritmo, la imagen, la repetición y la asociación visual. Su presentación en MEVArt permitió situar el proyecto dentro de un contexto de investigación artística y de diálogo con otras prácticas audiovisuales y sonoras contemporáneas.",
      x:16,
      y:49,
      w:146
    },
    {
      numero:6,
      titulo:"nada vuelve a ser lo mismo 2 veces",
      tipo:"video",
      thumb:"portfolio/thumbs/artes-visuales/performance/performance-06-thumb.webp",
      video:"assets/multiverse/performance-nada-vuelve-preview.mp4",
      videoPreload:"metadata",
      ano:"Granada · 2022 · 6' 25\"",
      descripcion:"La performance trabaja con la gelatina como materia inestable: una forma que tiembla, se desplaza y no termina de conservar el estado que tenía un instante antes. La repetición aparece como una tentativa de volver al mismo lugar, aunque cada gesto modifique ya las condiciones de la acción.<br><br>Los registros muestran esa tensión entre apariencia y transformación. La pieza se aproxima al cuerpo y al tiempo desde una materialidad blanda, frágil y cotidiana, dejando que el cambio sea parte visible de la propia imagen.",
      galeria:[
        {img:"assets/multiverse/performance-nada-vuelve-01.webp",titulo:"nada vuelve a ser lo mismo 2 veces · registro 01",ano:"Granada · 2022 · 6' 25\""},
        {img:"assets/multiverse/performance-nada-vuelve-02.webp",titulo:"nada vuelve a ser lo mismo 2 veces · registro 02"},
        {img:"assets/multiverse/performance-nada-vuelve-03.webp",titulo:"nada vuelve a ser lo mismo 2 veces · registro 03"},
        {img:"assets/multiverse/performance-nada-vuelve-04.webp",titulo:"nada vuelve a ser lo mismo 2 veces · registro 04"},
        {img:"assets/multiverse/performance-nada-vuelve-05.webp",titulo:"nada vuelve a ser lo mismo 2 veces · registro 05"},
        {img:"assets/multiverse/performance-nada-vuelve-06.webp",titulo:"nada vuelve a ser lo mismo 2 veces · registro 06"}
      ],
      x:47,
      y:61,
      w:138
    },
    {
      numero:7,
      titulo:"adivina que hay en mi espalda",
      tipo:"video",
      thumb:"portfolio/thumbs/artes-visuales/performance/performance-07-thumb.webp",
      video:"assets/multiverse/performance-adivina-espalda-preview.mp4",
      videoPreload:"metadata",
      ano:"Valencia · 2021 · 21' 53\"",
      descripcion:"<em>He encontrado un sitio en casa donde guardar mis pendientes<br>El rincón está detrás de tres paredes pero si te cansas buscando nos podemos tumbar y así me cuentas como estás<br>No hablamos todo el rato y ya empiezo a pensar q no t gusta mi pelo y q debería cortármelo<br>Hemos encontrado uno debajo del cojín del sofá<br>El otro se ha perdido y yo solo puedo pensar en q no te gusta mi pelo<br>pero me has hecho un pendiente nuevo con alambre de espino brillantísimo y ya vuelvo a pensar q si t gusta jugar conmigo &#129419;</em>",
      galeria:[
        {img:"assets/multiverse/performance-adivina-espalda-01.webp",titulo:"adivina que hay en mi espalda · registro 01",ano:"Valencia · 2021 · 21' 53\"",sensible:true},
        {img:"assets/multiverse/performance-adivina-espalda-03.webp",titulo:"adivina que hay en mi espalda · registro 02",sensible:true}
      ],
      sensible:true,
      x:72,
      y:73,
      w:145
    },
    {
      numero:8,
      titulo:"dolor.dulce.dolor",
      tipo:"video",
      thumb:"portfolio/thumbs/artes-visuales/performance/performance-08-thumb.webp",
      video:"assets/multiverse/performance-dolor-dulce-dolor-preview.mp4",
      videoPreload:"metadata",
      ano:"València · 2025 · 17' 23\"",
      descripcion:"Esta performance se sitúa en el punto liminar en el que el amor y el dolor dejan de presentarse como experiencias opuestas. Parte de una relación atravesada por el cuidado, el deseo, la dependencia y la herida, atendiendo a los gestos que pueden sostener y desgastar a la vez.<br><br>La acción no busca resolver esa tensión, sino permanecer en ella: observar cómo una caricia puede convertirse en marca, cómo el afecto puede contener incomodidad y cómo el cuerpo guarda aquello que no siempre encuentra una forma clara de decirse. <em>dolor.dulce.dolor</em> propone así un espacio inestable entre la entrega y el límite, entre lo que acompaña y lo que duele.",
      galeria:[
        {img:"assets/multiverse/performance-dolor-dulce-dolor-01.webp",titulo:"dolor.dulce.dolor · registro 01",ano:"València · 2025 · 17' 23\"",sensible:true},
        {img:"assets/multiverse/performance-dolor-dulce-dolor-02.webp",titulo:"dolor.dulce.dolor · registro 02",sensible:true}
      ],
      sensible:true,
      x:36,
      y:39,
      w:132
    }
  ]
};

  portfolioSecciones.push(performancePortfolio);
  const indiceArtesVisuales=portfolioSecciones.indexOf(artesVisualesPortfolio);
  if(indiceArtesVisuales!==-1) portfolioSecciones.splice(indiceArtesVisuales,1);

  portfolioSecciones.push({
  id:"museografia-mediacion",
  titulo:"MUSEOGRAFÍA Y MEDIACIÓN ARTÍSTICA",
  nota:"museografía · mediación · proyectos culturales",

  layout:"editorial",
  mosaicoAmpliable:false,

  editorialNota:"selección de proyectos",
  editorialTextoModo:"orb",

  editorialTexto:[
    "Mi trabajo en mediación artística y museografía se centra en los procesos que permiten transformar un conjunto de obras en una experiencia expositiva coherente. Me interesa especialmente todo aquello que ocurre entre la pieza y el espacio: cómo se organiza una sala, cómo se construye un recorrido, qué relaciones se establecen entre unas obras y otras y de qué manera estas decisiones condicionan la lectura del conjunto.",

    "He trabajado en tareas de montaje, acondicionamiento y organización de espacios expositivos, participando en la distribución de piezas y en la resolución de cuestiones relacionadas con circulación, alturas, distancias, líneas de visión y necesidades específicas de cada obra. Entiendo el montaje no únicamente como una cuestión técnica, sino como una herramienta capaz de generar ritmos, pausas, tensiones y conexiones dentro de una exposición.",

    "La museografía me interesa precisamente por esa capacidad de articular relaciones. El espacio nunca funciona como un fondo neutro: interviene en la manera en que una obra se percibe, se contextualiza y dialoga con aquello que la rodea. Por eso, parte de mi trabajo consiste en analizar cómo conviven diferentes formatos, escalas y lenguajes, buscando un equilibrio entre la autonomía de cada pieza y la construcción de una lectura común.",

    "Desde la mediación, me interesa también la relación entre exposición y público. Pienso el espacio expositivo como un lugar que debe facilitar la aproximación a las obras sin cerrar su interpretación, generando recorridos y condiciones de lectura que acompañen al visitante sin imponer una única manera de entender lo que está viendo.",

    "Esta forma de trabajar me permite abordar una exposición desde una perspectiva transversal, atendiendo simultáneamente a la obra, la arquitectura, el montaje, la circulación y la experiencia del espectador. Muchas de las decisiones más importantes de una muestra ocurren precisamente en esos elementos aparentemente secundarios: una distancia, una altura, un vacío, una transición entre salas o la manera en que una pieza aparece por primera vez dentro del recorrido."
  ],

  nodosInfo:[
  {
    id:"museologia",
    titulo:"Museología",
    html:`<p><strong>Museografía y producción expositiva</strong></p><p>Una sala expositiva nunca es un espacio neutro. La disposición de una pieza, una distancia, una línea de visión o el recorrido entre dos obras pueden alterar por completo la forma en que una exposición se percibe. Desde esa idea he participado en la planificación, adaptación y montaje de distintos proyectos expositivos, trabajando tanto sobre las necesidades concretas de las obras como sobre la construcción general del espacio.</p><p>He colaborado en Project Rooms de la Universitat Politècnica de València, en espacios como la Sala T4 y en otros contextos vinculados a la producción artística, interviniendo en nuevas distribuciones de sala, organización de recorridos, montaje de piezas, iluminación y adecuación de espacios para exposiciones, presentaciones y eventos.</p><p>En Granada participé también en la configuración de <em>Alterar lo cotidiano</em>, exposición organizada por el Máster en Producción e Investigación en Arte de la Facultad de Bellas Artes de la Universidad de Granada y comisariada por el colectivo Ballate-Armas. La muestra reunió los proyectos de más de una veintena de artistas y se desarrolló entre la Facultad de Bellas Artes y el Museo de América - Centro Damián Bayón de Santa Fe, planteando la necesidad de adaptar obras, escalas y formatos muy diferentes a dos contextos arquitectónicos específicos.</p><p>Entiendo la museografía como una práctica de articulación: hacer convivir obras, arquitectura, circulación y necesidades técnicas hasta construir una lectura espacial coherente. El montaje deja entonces de ser la última fase de una exposición para convertirse en una herramienta capaz de producir relaciones, ritmos, pausas y nuevas formas de percibir las piezas.</p>`
  },
  {
    id:"mediacion",
    titulo:"Mediación artística",
    html:`<p><strong>Granada · 2023</strong></p><p>Entre una obra y quien la observa existe un espacio que también puede trabajarse. La mediación artística parte precisamente de esa relación: no de explicar qué significa una pieza, sino de generar condiciones que permitan aproximarse a ella, establecer conexiones y construir una lectura propia.</p><p>Durante <em>Alterar lo cotidiano</em> formé parte de <button class="portfolio-inline-nodo-link" type="button" data-inline-nodo="dinamizadores">Dinamizadores</button>, el equipo de mediación artística de la Facultad de Bellas Artes de la Universidad de Granada. La exposición reunió el trabajo de más de una veintena de artistas entre la propia Facultad y el Museo de América - Centro Damián Bayón de Santa Fe, configurando un proyecto colectivo con lenguajes, formatos y planteamientos muy diversos.</p><p>Mi participación implicó conocer y comprender las distintas propuestas, colaborar en la organización del proyecto y pensar de qué manera podían establecerse relaciones entre las piezas, el recorrido expositivo y sus públicos. La mediación funcionaba así como una extensión de la propia exposición: una herramienta para contextualizar, conectar y facilitar diferentes formas de aproximación al trabajo artístico.</p><p>Me interesa especialmente una mediación que no sustituya la experiencia de la obra por una explicación cerrada. Prefiero entenderla como una forma de acompañamiento capaz de abrir preguntas, ofrecer puntos de entrada y favorecer que cada visitante construya su propia relación con aquello que está viendo.</p>`,
    inlineNodos:[{
      id:"dinamizadores",
      titulo:"Dinamizadores",
      html:`<p><strong>Granada · 2023</strong></p><p>Durante 2023 formé parte de <strong>Dinamizadores</strong>, el equipo de mediación y activación cultural de la Facultad de Bellas Artes de la Universidad de Granada. Desde este contexto participé en distintas acciones vinculadas a exposiciones y proyectos desarrollados tanto en la propia Facultad como en espacios colaboradores, entre ellos el Museo de América - Centro Damián Bayón de Santa Fe. El trabajo combinaba mediación con públicos, apoyo a la programación y desarrollo de propuestas destinadas a acercar la creación contemporánea a la comunidad universitaria.</p><p>Dentro de este marco diseñé y desarrollé también una serie de talleres vinculados a <strong>alRaso</strong>, las becas de verano para estudiantes de Arte que se celebran cada año en el municipio granadino de El Valle, en el Valle de Lecrín. Estas actividades funcionaban como una forma de dar a conocer tanto la convocatoria como su filosofía, basada en trabajar desde un contexto abierto, libre de estructuras rígidas y conectado con el territorio y la experimentación artística.</p><p>Mi propuesta, <strong>Construcción de cometas</strong>, se articuló en cuatro sesiones desarrolladas a lo largo del año. Partiendo de la expresión “construir castillos en el aire”, el taller utilizaba la cometa como un objeto situado entre lo posible y lo imaginado: una construcción diseñada para elevarse, pero cuyo vuelo nunca está completamente asegurado. A través de su fabricación paso a paso, el taller proponía pensar el deseo, la imaginación y la capacidad de proyectar aquello que todavía no existe, utilizando un proceso manual y colectivo como herramienta de creación, mediación y acercamiento al arte.</p><div class="dinamizadores-galeria"><img src="assets/multiverse/dinamizadores/dinamizadores-01.jpg" loading="lazy" decoding="async" alt="Taller Construcción de cometas"><img src="assets/multiverse/dinamizadores/dinamizadores-02.jpg" loading="lazy" decoding="async" alt="Taller Construcción de cometas"><img src="assets/multiverse/dinamizadores/dinamizadores-03.jpg" loading="lazy" decoding="async" alt="Taller Construcción de cometas"><img src="assets/multiverse/dinamizadores/dinamizadores-04.jpg" loading="lazy" decoding="async" alt="Taller Construcción de cometas"><img src="assets/multiverse/dinamizadores/dinamizadores-05.jpg" loading="lazy" decoding="async" alt="Taller Construcción de cometas"><img src="assets/multiverse/dinamizadores/dinamizadores-06.jpg" loading="lazy" decoding="async" alt="Taller Construcción de cometas"><img src="assets/multiverse/dinamizadores/dinamizadores-07-cartel.jpg" loading="lazy" decoding="async" alt="Cartel del taller Construcción de cometas"></div>`
    }]
  },
  {
    id:"asistencia",
    titulo:"Asistencia artística",
    html:`<p>València · 2024</p><p>Mi trabajo en asistencia artística se centra en el desarrollo y la materialización de propuestas escénicas y performativas, participando tanto en su dimensión creativa como en su resolución técnica. A lo largo del proceso intervengo en la adaptación de las ideas al espacio, la construcción de la puesta en escena y la coordinación de los distintos elementos que forman parte de la acción.</p><p>La iluminación, el sonido, los contenidos visuales, la escenografía o la disposición del espacio no funcionan únicamente como recursos técnicos, sino como parte del lenguaje de cada pieza. Me interesa especialmente cómo estos elementos modifican la percepción del cuerpo y de la acción, construyendo atmósferas, ritmos y formas de relación con el espectador.</p><p>Esta forma de trabajo me ha permitido participar en proyectos como <em>El cuerpo del hueco</em> o <em>A cien segundos de lo que ha de acontecer</em>, colaborando en diferentes fases de su producción y puesta en escena. En ambos casos, el trabajo técnico se planteó desde las necesidades conceptuales de la obra, entendiendo cada decisión - una luz, una imagen, un sonido o la disposición de un elemento - como parte activa de la propuesta artística.</p><p>Parte de este trabajo aparece también recogido en <a href="https://elhype.com/poeticas-de-lo-hibrido-hacia-una-estetica-transinteligente/?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer"><em>Poéticas de lo híbrido: hacia una estética transinteligente</em></a>, publicado en <em>El Hype</em>, donde <em>El cuerpo del hueco</em> se aborda dentro de una reflexión sobre las relaciones entre cuerpo, tecnología, imagen y experiencia artística.</p>`
  }
],

  obras:[
  {
    titulo:"Registro expositivo",
    grupo:"Museología · Mediación artística",
    span:7,
    ancho:1600,
    alto:1066,
    sinFicha:true,
    thumb:"portfolio/thumbs/museografia/museografia-01.webp"
  },

  {
    titulo:"Identidad de exposición",
    grupo:"Museología · Mediación artística",
    span:5,
    ancho:1600,
    alto:1066,
    sinFicha:true,
    thumb:"portfolio/thumbs/museografia/museografia-02.webp"
  },

  {
    titulo:"Pieza en sala",
    grupo:"Museología · Mediación artística",
    span:12,
    ancho:1600,
    alto:1066,
    sinFicha:true,
    thumb:"portfolio/thumbs/museografia/museografia-03.webp"
  },

  {
    titulo:"Acción performativa",
    grupo:"Asistencia artística · escena y performance",
    span:5,
    ancho:800,
    alto:800,
    sinFicha:true,
    thumb:"portfolio/thumbs/museografia/museografia-04.webp"
  },

  {
    titulo:"Acción escénica",
    grupo:"Asistencia artística · escena y performance",
    span:7,
    ancho:1600,
    alto:900,
    sinFicha:true,
    thumb:"portfolio/thumbs/museografia/museografia-05.webp"
  },

  {
    titulo:"Acción escénica",
    grupo:"Asistencia artística · escena y performance",
    span:12,
    ancho:1600,
    alto:900,
    sinFicha:true,
    thumb:"portfolio/thumbs/museografia/museografia-06.webp"
  }
]
});

  artesPlasticasPortfolio.subsecciones.push({
    id:"escaparatismo",
    titulo:"ESCAPARATISMO",
    nota:"Óptica Meseguer · El Cabanyal · València",
    layout:"editorial",
    editorialNota:"Valencia · 2024",
    editorialTextoModo:"orb",
    mosaicoAmpliable:false,
    editorialTexto:[
      "Durante el verano de 2024 desarrollé una propuesta de escaparatismo para Óptica Meseguer, en València.",
      "El proyecto partía de dos elementos principales: el carácter estacional del escaparate y la identidad de El Cabanyal, barrio en el que se encuentra el establecimiento. La propuesta buscaba alejarse de una ambientación veraniega genérica para construir una imagen vinculada al entorno, tomando como referencia su relación con el Mediterráneo, su arquitectura, sus colores y su imaginario popular.",
      "Para reforzar esta conexión con el lugar, parte de los elementos del escaparate fueron construidos mediante moldes realizados con arena de la propia playa, agua del mar, bivalvos y cemento. El proceso incorporaba así materiales directamente vinculados al territorio, trasladando una parte física del paisaje del Cabanyal al interior del espacio comercial.",
      "El resultado planteaba el escaparate no solo como soporte de producto, sino como una pequeña intervención espacial en diálogo con el barrio, su materialidad y su identidad."
    ],
    editorialFacts:[
      "escaparatismo · intervención espacial",
      "arena de playa · agua de mar · bivalvos · cemento"
    ],
    obras:[
      {titulo:"Óptica Meseguer",ano:"2024",grupo:"escaparate · producto",span:12,ancho:3,alto:2,sinFicha:true,thumb:"portfolio/thumbs/artes-plasticas/escaparatismo/escaparatismo-01-gafas.webp",full:"portfolio/full/artes-plasticas/escaparatismo/escaparatismo-01-gafas.webp"},
      {titulo:"Óptica Meseguer",ano:"2024",grupo:"escaparate · producto",span:12,ancho:3,alto:2,sinFicha:true,thumb:"portfolio/thumbs/artes-plasticas/escaparatismo/escaparatismo-02-rastrillo.webp",full:"portfolio/full/artes-plasticas/escaparatismo/escaparatismo-02-rastrillo.webp"},
      {titulo:"Óptica Meseguer",ano:"2024",grupo:"materia · proceso",span:6,ancho:3,alto:2,sinFicha:true,thumb:"portfolio/thumbs/artes-plasticas/escaparatismo/escaparatismo-03-estrella.webp",full:"portfolio/full/artes-plasticas/escaparatismo/escaparatismo-03-estrella.webp"},
      {titulo:"Óptica Meseguer",ano:"2024",grupo:"materia · proceso",span:6,ancho:3,alto:2,sinFicha:true,thumb:"portfolio/thumbs/artes-plasticas/escaparatismo/escaparatismo-04-conjunto.webp",full:"portfolio/full/artes-plasticas/escaparatismo/escaparatismo-04-conjunto.webp"},
      {titulo:"Óptica Meseguer",ano:"2024",grupo:"materia · proceso",span:5,ancho:2,alto:3,sinFicha:true,thumb:"portfolio/thumbs/artes-plasticas/escaparatismo/escaparatismo-05-fragmento.webp",full:"portfolio/full/artes-plasticas/escaparatismo/escaparatismo-05-fragmento.webp"},
      {titulo:"Óptica Meseguer",ano:"2024",grupo:"materia · proceso",span:7,ancho:2,alto:3,sinFicha:true,thumb:"portfolio/thumbs/artes-plasticas/escaparatismo/escaparatismo-06-castillo.webp",full:"portfolio/full/artes-plasticas/escaparatismo/escaparatismo-06-castillo.webp"},
      {titulo:"Óptica Meseguer",ano:"2024",grupo:"materia · proceso",span:5,ancho:2,alto:3,sinFicha:true,thumb:"portfolio/thumbs/artes-plasticas/escaparatismo/escaparatismo-07-relieve.webp",full:"portfolio/full/artes-plasticas/escaparatismo/escaparatismo-07-relieve.webp"},
      {titulo:"Óptica Meseguer",ano:"2024",grupo:"materia · proceso",span:7,ancho:3,alto:2,sinFicha:true,thumb:"portfolio/thumbs/artes-plasticas/escaparatismo/escaparatismo-08-rastrillo.webp",full:"portfolio/full/artes-plasticas/escaparatismo/escaparatismo-08-rastrillo.webp"}
    ]
  });
}

const disenoGraficoPortfolio = portfolioSecciones.find(
  sec => sec.id === "diseno-grafico"
);

if (disenoGraficoPortfolio) {

  // ─────────────────────────────
  // CARTELERÍA
  // ─────────────────────────────

disenoGraficoPortfolio.subsecciones.push({
  id: "carteleria",
  titulo: "CARTELERÍA",
  nota: "cartel · mixed media · comunicación gráfica",
  layout: "carpetas-editoriales",
  editorialBoton: "PRÁCTICA GRÁFICA",
  editorialNota: "2018—2023",
  editorialTexto: [
    "Este apartado reúne una selección de trabajos de cartelería realizados entre 2018 y 2023, atravesando distintas etapas, lenguajes y formas de entender la comunicación gráfica.",
    "Entiendo el cartel como un espacio de experimentación en el que puedo combinar diferentes formas de crear. Me interesa especialmente trabajar desde el mixed media, haciendo convivir recursos como el collage, el décollage, la fotografía, la intervención manual y las técnicas gráficas más tradicionales con herramientas digitales y nuevas tecnologías.",
    "Esta mezcla de procesos me permite adaptar cada pieza a su contexto sin partir siempre de una misma fórmula y explorar cómo materiales, imágenes y técnicas de procedencias distintas pueden encontrarse dentro de una misma composición.",
    "La selección recoge también esa evolución: desde trabajos más gráficos y compositivos hasta propuestas donde la experimentación material y la combinación entre procesos analógicos y digitales adquieren cada vez mayor presencia."
  ],

    subsecciones: [

      {
        id: "russafa-escenica",
        titulo: "RUSSAFA ESCÈNICA",
        nota: "BIS – el prefacio · Valencia · 2019",
        layout: "editorial",
        mosaicoCompacto: true,
        mosaicoAmpliable: false,

        editorialNota: "Valencia · 2019",
        editorialTextoModo: "orb",

        editorialTexto: [
          "Participé como artista plástico en BIS – el prefacio, propuesta escénica presentada dentro del festival Russafa Escènica 2019, en colaboración con el Institut Valencià de Cultura.",

          "La pieza tomaba como punto de partida la coreografía de La Macarena, utilizando su repetición y transformación para reflexionar sobre la memoria colectiva, la cultura popular y la construcción del imaginario español.",

          "Mi trabajo se centró en el desarrollo de la identidad gráfica y plástica vinculada al espectáculo, realizando el cartel y una serie de postales concebidas como piezas de presentación y difusión. Para ello trabajé desde el collage, la fotografía y la intervención gráfica, trasladando al soporte impreso el carácter fragmentario, popular y reconocible sobre el que se construía la propuesta escénica.",

          "El proyecto planteaba así una continuidad entre escena e imagen gráfica, utilizando los materiales de comunicación no solo para anunciar el espectáculo, sino también como una extensión de su universo visual."
        ],

        editorialLinks: [
          {
            label: "BIS – el prefacio",
            url: "https://www.hortanoticias.com/el-festival-russafa-escenica-recibe-la-propuesta-bis-el-prefacio-o-la-reinvencion-y-el-repensar-de-la-macarena/"
          }
        ],

        obras: [
          {
            grupo: "archivo gráfico",
            titulo: "cartel",
            span: 7,
            ancho: 849,
            alto: 1200,
            sinFicha: true,
            thumb: "portfolio/thumbs/diseno-grafico/carteleria/russafa/russafa-01.webp"
          },
          {
            grupo: "archivo gráfico",
            titulo: "postal 1",
            span: 5,
            ancho: 849,
            alto: 1200,
            sinFicha: true,
            thumb: "portfolio/thumbs/diseno-grafico/carteleria/russafa/russafa-02.webp"
          },
          {
            grupo: "archivo gráfico",
            titulo: "postal 2",
            span: 7,
            ancho: 960,
            alto: 1200,
            sinFicha: true,
            thumb: "portfolio/thumbs/diseno-grafico/carteleria/russafa/russafa-03.webp"
          }
        ]
      },

      {
        id: "espectre-visible",
        titulo: "ESPECTRE VISIBLE",
        nota: "diversitats · Universitat de València · 2020",
        layout: "editorial",
        mosaicoAmpliable: false,

        editorialNota: "Valencia · 2020",
        editorialTextoModo: "orb",

        editorialTexto: [
          "Espectre Visible reúne dos carteles premiados en el concurso de producción artística impulsado por el programa diversitats de la Universitat de València, una iniciativa orientada a visibilizar la presencia del colectivo LGTBI+ en los ámbitos científicos.",

          "La propuesta parte de la necesidad de reconocer referentes que, pese a formar parte de la historia de la ciencia, han quedado con frecuencia fuera de sus relatos más visibles. A través de la composición, el tratamiento gráfico y la construcción de cada cartel, el proyecto busca acercar estas figuras al presente y reivindicar la diversidad como una parte real y necesaria del conocimiento científico.",

          "Más que representar ciencia e identidad como ámbitos separados, ambos carteles plantean un mismo espacio en el que pueden convivir. El diseño funciona así como una herramienta de visibilización, capaz de recuperar referentes, generar reconocimiento y ampliar la imagen de quién puede formar parte de la ciencia."
        ],

        obras: [
          {
            grupo: "carteles premiados",
            titulo: "Sally riding high",
            span: 6,
            ancho: 1200,
            alto: 1200,
            sinFicha: true,
            thumb: "portfolio/thumbs/diseno-grafico/carteleria/espectre/espectre-01.webp"
          },
          {
            grupo: "carteles premiados",
            titulo: "Benn Barres",
            span: 6,
            ancho: 1196,
            alto: 1200,
            sinFicha: true,
            thumb: "portfolio/thumbs/diseno-grafico/carteleria/espectre/espectre-02.webp"
          }
        ]
      },

      {
        id: "san-jeronimo",
        titulo: "SAN JERÓNIMO",
        nota: "cartelería local · Santibáñez de la Peña · 2023",
        layout: "editorial",
        mosaicoCompacto: true,
        mosaicoFocoHover: true,
        mosaicoAmpliable: false,

        editorialNota: "Valencia · 2023",
        editorialTextoModo: "orb",

        editorialTexto: [
          "Selección de carteles ilustrados para fiestas y celebraciones locales. Cada propuesta parte del contexto de la festividad para construir una imagen propia, reconocible y capaz de funcionar en distintos formatos de comunicación.",

          "En el cartel de San Jerónimo 2023, en Santibáñez de la Peña, la ilustración se construye mediante grandes manchas negras de formas orgánicas. En lugar de representar una escena concreta, estas figuras sugieren cuerpos, movimiento y agrupación, dejando que cada persona complete la imagen desde su propia mirada. La fiesta aparece así como una forma colectiva y cambiante, difícil de contener en una única representación.",

          "El contraste entre las manchas, el fondo neutro y la tipografía verde genera una composición directa y visible a distancia. La propuesta se aleja de los símbolos festivos más previsibles sin perder su función principal: llamar la atención, comunicar con claridad y crear una imagen vinculada al lugar."
        ],

        obras: [
          {
            grupo: "archivo gráfico",
            titulo: "cartel",
            span: 7,
            ancho: 900,
            alto: 1200,
            sinFicha: true,
            thumb: "portfolio/thumbs/diseno-grafico/carteleria/sanjeronimo/sanjeronimo-01.webp"
          },
          {
            grupo: "archivo gráfico",
            titulo: "prueba 1",
            span: 5,
            ancho: 857,
            alto: 1200,
            sinFicha: true,
            thumb: "portfolio/thumbs/diseno-grafico/carteleria/sanjeronimo/sanjeronimo-02.webp"
          },
          {
            grupo: "archivo gráfico",
            titulo: "prueba 2",
            span: 5,
            ancho: 857,
            alto: 1200,
            sinFicha: true,
            thumb: "portfolio/thumbs/diseno-grafico/carteleria/sanjeronimo/sanjeronimo-03.webp"
          },
          {
            grupo: "archivo gráfico",
            titulo: "prueba 3",
            span: 7,
            ancho: 857,
            alto: 1200,
            sinFicha: true,
            thumb: "portfolio/thumbs/diseno-grafico/carteleria/sanjeronimo/sanjeronimo-04.webp"
          },
          {
            grupo: "archivo gráfico",
            titulo: "prueba 4",
            span: 5,
            ancho: 857,
            alto: 1200,
            sinFicha: true,
            thumb: "portfolio/thumbs/diseno-grafico/carteleria/sanjeronimo/sanjeronimo-05.webp"
          }
        ]
      }

    ]
  });


  // ─────────────────────────────
  // DISEÑO TIPOGRÁFICO
  // ─────────────────────────────

  disenoGraficoPortfolio.subsecciones.push({
    id: "diseno-tipografico",
    titulo: "DISEÑO TIPOGRÁFICO",
    nota: "tipografía · identidad · experimental",

    layout: "editorial",
    playgroundTipografico: true,
    mosaicoAmpliable: false,

    editorialNota: "proyectos tipográficos · 2020—2024",
    editorialTextoModo: "orb",

    editorialTexto: [
      "Exploración de sistemas tipográficos personalizados para proyectos de marca e identidad. Estos diseños van más allá de la simple selección de fuentes comerciales, buscando crear soluciones únicas que reflejen la esencia de cada proyecto.",

      "La tipografía funciona como un elemento estratégico de la comunicación, no como un adorno. Cada proyecto parte de un análisis profundo del brief, el contexto cultural y los valores que deben transmitirse.",

      "Desde letrerismo experimental hasta sistemas tipográficos parametrizados, estos trabajos exploran diferentes enfoques para la generación de formas y la construcción de identidades visuales coherentes.",

      "El proceso incluye investigación histórica, bocetaje digital, pruebas de aplicación y refinamiento iterativo. El objetivo es crear herramientas tipográficas que funcionen en múltiples contextos: desde aplicaciones web hasta grandes formatos."
    ],

    editorialFacts: [
      "sistemas tipográficos personalizados",
      "identidad · branding · experimental",
      "aplicación multi-contexto"
    ],

    obras: []
  });

}

function escaparHTMLPortfolio(valor){
  return String(valor ?? "").replace(/[&<>"']/g,m=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[m]));
}

function limpiarPortfolioEditorial(v){
  v.classList.remove("portfolio-carteleria-map-activa");
  const editorial=v.querySelector(".portfolio-editorial");
  if(editorial){
    if(editorial._masonryObserver) editorial._masonryObserver.disconnect();
    if(editorial._imageObserver) editorial._imageObserver.disconnect();
    editorial.remove();
  }
  const archivoPerformance=v.querySelector(".portfolio-performance-archivo");
  if(archivoPerformance) archivoPerformance.remove();
}

function prepararObrasPortfolio(obras){
  obrasPortfolioData.length=0;
  obras.forEach(obra=>{
    obrasPortfolioData.push({
      img:obra.full || obra.thumb || "",
      titulo:obra.titulo || "Obra",
      ano:obra.ano || "",
      material:obra.material || "",
      medidas:obra.medidas || "",
      descripcion:obra.descripcion || "",
      sinFicha:!!obra.sinFicha,
      composicion:obra.composicion || [],
      sensible:!!obra.sensible,
      revelada:false
    });
  });
}

function renderPortfolioEditorial(v,sec,parent){
  const wrap=v.querySelector(".portfolio-wrap");
  const track=v.querySelector(".track");
  const empty=v.querySelector(".portfolio-empty");
  const metaTitle=v.querySelector("[data-portfolio-title]");
  const metaDetail=v.querySelector("[data-portfolio-detail]");
  if(!wrap || !track) return;

  limpiarPortfolioEditorial(v);
  wrap.dataset.mode="editorial";
  v.classList.toggle("portfolio-tipografico",Boolean(sec.playgroundTipografico));
  v._portfolioActual=parent ? parent.id + "/" + sec.id : sec.id;
  if(parent) v._portfolioParent=parent.id;
  else delete v._portfolioParent;

  track.innerHTML="";
  track.style.opacity=0;
  const folders=wrap.querySelector(".portfolio-folders");
  if(folders) folders.innerHTML="";
  if(empty) empty.textContent="";

  prepararObrasPortfolio(sec.obras || []);

  const editorial=document.createElement("div");
  editorial.className="portfolio-editorial";
  if(sec.nodosInfo?.length){
    editorial.classList.add("portfolio-editorial--con-nodos");
  }
  if(sec.id==="museografia-mediacion"){
    editorial.classList.add("portfolio-editorial--museografia");
  }
  const introTexto=sec.editorialTexto || [];
  const facts=sec.editorialFacts || [];
  const obras=sec.obras || [];
  const grupos=[];
  obras.forEach((obra,index)=>{
    const nombre=obra.grupo || "archivo visual";
    let grupo=grupos.find(item=>item.nombre===nombre);
    if(!grupo){
      grupo={nombre,items:[]};
      grupos.push(grupo);
    }
    grupo.items.push({obra,index});
  });
  const focoVisual=sec.mosaicoFocoHover !== false;
  const gruposHTML=grupos.map(grupo=>`
    <section class="portfolio-editorial-group${sec.mosaicoCompacto ? " portfolio-editorial-group--compact" : ""}${focoVisual ? " portfolio-editorial-group--focus-hover" : ""}">
      <div class="portfolio-editorial-label">${escaparHTMLPortfolio(grupo.nombre)}</div>
      <div class="portfolio-editorial-strip">${grupo.items.map(({obra,index})=>{
        const ampliable=matchMedia("(max-width:768px), (pointer:coarse)").matches || (sec.mosaicoAmpliable!==false && (!sec.soloAmpliarMerch || obra.grupo==="merchandising"));
        const etiqueta=ampliable ? "button" : "div";
        return `<${etiqueta} class="portfolio-editorial-shot${focoVisual && index===0 ? " is-featured" : ""}" ${ampliable ? `type="button" data-ampliable="1"` : ""} data-index="${index}" data-span="${escaparHTMLPortfolio(obra.span || 6)}" aria-label="${escaparHTMLPortfolio(obra.titulo || "imagen")}">
          <img data-src="${escaparHTMLPortfolio(obra.thumb || obra.full || "")}" width="${escaparHTMLPortfolio(obra.ancho || 4)}" height="${escaparHTMLPortfolio(obra.alto || 3)}" loading="lazy" decoding="async" fetchpriority="low" alt="">
          <span class="portfolio-editorial-caption"><b>(${String(index+1).padStart(2,"0")})</b>${escaparHTMLPortfolio(obra.titulo || "imagen")}</span>
        </${etiqueta}>`;
      }).join("")}</div>
    </section>
  `).join("");

const nodosHTML = sec.nodosInfo?.length
  ? `
    <div class="portfolio-nodos-info">

      <svg
        class="portfolio-nodos-svg"
        aria-hidden="true"
      >
        ${sec.nodosInfo.map(nodo=>`
          <path
            class="portfolio-nodo-linea"
            data-linea="${escaparHTMLPortfolio(nodo.id)}"
          ></path>
        `).join("")}
      </svg>


      ${sec.nodosInfo.map((nodo,index)=>`

        <button
          class="portfolio-nodo-link"
          type="button"
          data-nodo="${escaparHTMLPortfolio(nodo.id)}"
        >
          ${escaparHTMLPortfolio(nodo.titulo)}
        </button>


        <div
          class="portfolio-nodo-ventana"
          data-ventana-nodo="${escaparHTMLPortfolio(nodo.id)}"
          data-indice="${index}"
        >

          <div class="portfolio-nodo-cabecera">

            <strong class="portfolio-nodo-titulo">
              ${escaparHTMLPortfolio(nodo.titulo)}
            </strong>

            <button
              class="portfolio-nodo-cerrar"
              type="button"
              aria-label="Cerrar"
            >
              ×
            </button>

          </div>

          <div class="portfolio-nodo-contenido">
            ${nodo.html
              ? `<div class="portfolio-nodo-texto">${nodo.html}</div>`
              : `<p class="portfolio-nodo-texto">${escaparHTMLPortfolio(nodo.texto)}</p>`}
          </div>

          <span class="portfolio-nodo-resize" aria-hidden="true"></span>

        </div>

      `).join("")}

    </div>
  `
  : "";


  const introHTML=sec.editorialTextoModo==="orb"
    ? `<div class="portfolio-editorial-intro portfolio-editorial-intro--orb">
        <button class="portfolio-brand-orb" type="button" aria-expanded="false">${escaparHTMLPortfolio(sec.editorialBoton || "Sobre el proyecto")}</button>
        <div class="portfolio-brand-panel">
          <span class="portfolio-editorial-kicker">${escaparHTMLPortfolio(sec.editorialNota || sec.nota || "")}</span>
          <div class="portfolio-editorial-copy">
            ${introTexto.map(txt=>`<p>${escaparHTMLPortfolio(txt)}</p>`).join("")}
            ${(sec.editorialLinks || []).map(link=>`<p><a href="${escaparHTMLPortfolio(link.url)}" target="_blank" rel="noopener noreferrer">${escaparHTMLPortfolio(link.label)}</a></p>`).join("")}
            ${facts.length ? `<ul class="portfolio-editorial-facts">${facts.map(txt=>`<li>${escaparHTMLPortfolio(txt)}</li>`).join("")}</ul>` : ""}
          </div>
        </div>
      </div>`
    : `<div class="portfolio-editorial-intro">
        <span class="portfolio-editorial-kicker">${escaparHTMLPortfolio(sec.editorialNota || sec.nota || "")}</span>
        <div class="portfolio-editorial-copy">
          ${introTexto.map(txt=>`<p>${escaparHTMLPortfolio(txt)}</p>`).join("")}
          ${facts.length ? `<ul class="portfolio-editorial-facts">${facts.map(txt=>`<li>${escaparHTMLPortfolio(txt)}</li>`).join("")}</ul>` : ""}
        </div>
      </div>`;

  const testerHTML = sec.playgroundTipografico
  ? crearTypeTester()
  : "";

editorial.innerHTML=`
  ${introHTML}
  ${testerHTML}
  ${nodosHTML}
  ${gruposHTML}
`;

wrap.appendChild(editorial);

/* NODOS MUSEOGRAFÍA:
   los títulos permanecen dentro del documento, justo después de
   "Sobre el proyecto"; las ventanas flotantes pasan a una capa
   que ocupa todo .portfolio-wrap. */
let capaNodosGlobal=null;
if(sec.nodosInfo?.length){
  const filaNodos=editorial.querySelector(".portfolio-nodos-info");
  if(filaNodos){
    capaNodosGlobal=document.createElement("div");
    capaNodosGlobal.className="portfolio-nodos-overlay";

    const svgNodos=filaNodos.querySelector(":scope > .portfolio-nodos-svg");
    if(svgNodos) capaNodosGlobal.appendChild(svgNodos);

    [...filaNodos.querySelectorAll(":scope > .portfolio-nodo-ventana")]
      .forEach(panel=>capaNodosGlobal.appendChild(panel));

    wrap.appendChild(capaNodosGlobal);
  }
}

const nodosInline=(sec.inlineNodos || sec.nodosInfo?.flatMap(nodo=>nodo.inlineNodos || []) || []);
if(nodosInline.length){
  const capaInline=document.createElement("div");
  capaInline.className="portfolio-inline-nodos";
  capaInline.innerHTML=nodosInline.map(nodo=>`<section class="portfolio-nodo-ventana portfolio-inline-nodo-ventana" data-inline-ventana="${escaparHTMLPortfolio(nodo.id)}"><div class="portfolio-nodo-cabecera"><strong class="portfolio-nodo-titulo">${escaparHTMLPortfolio(nodo.titulo)}</strong><button class="portfolio-nodo-cerrar" type="button" aria-label="Cerrar">×</button></div><div class="portfolio-nodo-contenido"><div class="portfolio-nodo-texto">${nodo.html}</div></div></section>`).join("");

  /* Esta capa ocupa todo el portfolio, igual que las ventanas principales. */
  wrap.appendChild(capaInline);

  /* Los links pueden estar en editorial o dentro de una ventana principal
     que ya fue trasladada al overlay. */
  const enlacesInline=[
    ...editorial.querySelectorAll("[data-inline-nodo]"),
    ...(capaNodosGlobal ? capaNodosGlobal.querySelectorAll("[data-inline-nodo]") : [])
  ];

  [...new Set(enlacesInline)].forEach(enlace=>{
    enlace.addEventListener("pointerdown",e=>e.stopPropagation());
    enlace.addEventListener("click",e=>{
      e.preventDefault();
      e.stopPropagation();

      const panel=capaInline.querySelector(`[data-inline-ventana="${enlace.dataset.inlineNodo}"]`);
      if(!panel) return;

      const abierto=panel.classList.contains("is-open");
      capaInline.querySelectorAll(".portfolio-inline-nodo-ventana")
        .forEach(item=>item.classList.remove("is-open"));

      if(abierto) return;

      panel.classList.add("is-open");

      const base=capaInline.getBoundingClientRect();
      const enlaceRect=enlace.getBoundingClientRect();
      const margen=10;

      let left=enlaceRect.left-base.left;
      let top=enlaceRect.bottom-base.top+10;

      const maxLeft=Math.max(margen,capaInline.clientWidth-panel.offsetWidth-margen);
      const maxTop=Math.max(margen,capaInline.clientHeight-panel.offsetHeight-margen);

      left=Math.max(margen,Math.min(left,maxLeft));
      top=Math.max(margen,Math.min(top,maxTop));

      panel.style.left=left+"px";
      panel.style.top=top+"px";
      panel.style.zIndex=String(Date.now());
    });
  });

  capaInline.querySelectorAll(".portfolio-nodo-cerrar").forEach(cerrar=>{
    cerrar.addEventListener("pointerdown",e=>e.stopPropagation());
    cerrar.addEventListener("click",e=>{
      e.stopPropagation();
      cerrar.closest(".portfolio-inline-nodo-ventana")?.classList.remove("is-open");
    });
  });

  /* Ratón: arrastre por toda la ventana del portfolio.
     En táctil lo gestiona además el listener global de abajo. */
  capaInline.querySelectorAll(".portfolio-inline-nodo-ventana").forEach(panel=>{
    const cabecera=panel.querySelector(".portfolio-nodo-cabecera");
    if(!cabecera) return;

    cabecera.addEventListener("pointerdown",e=>{
      if(e.target.closest(".portfolio-nodo-cerrar")) return;
      if(e.pointerType==="touch" || e.pointerType==="pen") return;

      e.preventDefault();
      e.stopPropagation();

      const inicio={
        x:e.clientX,
        y:e.clientY,
        left:parseFloat(panel.style.left)||0,
        top:parseFloat(panel.style.top)||0
      };

      panel.style.zIndex=String(Date.now());
      cabecera.setPointerCapture?.(e.pointerId);

      const mover=ev=>{
        const margen=8;
        const maxX=Math.max(margen,capaInline.clientWidth-panel.offsetWidth-margen);
        const maxY=Math.max(margen,capaInline.clientHeight-panel.offsetHeight-margen);
        const izquierda=Math.max(margen,Math.min(inicio.left+ev.clientX-inicio.x,maxX));
        const arriba=Math.max(margen,Math.min(inicio.top+ev.clientY-inicio.y,maxY));
        panel.style.left=izquierda+"px";
        panel.style.top=arriba+"px";
      };

      const terminar=ev=>{
        cabecera.releasePointerCapture?.(ev.pointerId);
        cabecera.removeEventListener("pointermove",mover);
        cabecera.removeEventListener("pointerup",terminar);
        cabecera.removeEventListener("pointercancel",terminar);
      };

      cabecera.addEventListener("pointermove",mover);
      cabecera.addEventListener("pointerup",terminar);
      cabecera.addEventListener("pointercancel",terminar);
    });
  });
}

if(focoVisual){
  editorial.querySelectorAll(".portfolio-editorial-group--focus-hover").forEach(grupo=>{
    const shots=[...grupo.querySelectorAll(".portfolio-editorial-shot")];
    const activar=shot=>shots.forEach(item=>item.classList.toggle("is-featured",item===shot));
    shots.forEach(shot=>{
      shot.addEventListener("pointerenter",()=>activar(shot));
      shot.addEventListener("pointerdown",()=>activar(shot),{passive:true});
      shot.addEventListener("focusin",()=>activar(shot));
    });
    const tira=grupo.querySelector(".portfolio-editorial-strip");
    let cuadro;
    tira?.addEventListener("scroll",()=>{
      cancelAnimationFrame(cuadro);
      cuadro=requestAnimationFrame(()=>{
        const centro=tira.getBoundingClientRect().left+tira.clientWidth/2;
        const cercana=shots.reduce((mejor,shot)=>Math.abs(shot.getBoundingClientRect().left+shot.offsetWidth/2-centro)<Math.abs(mejor.getBoundingClientRect().left+mejor.offsetWidth/2-centro)?shot:mejor,shots[0]);
        if(cercana) activar(cercana);
      });
    },{passive:true});
  });
}

if(sec.nodosInfo?.length){

  const contenedorNodos =
    editorial.querySelector(".portfolio-nodos-info");

  const capaNodos =
    capaNodosGlobal || wrap.querySelector(".portfolio-nodos-overlay");

  if(!contenedorNodos || !capaNodos) return;


  const actualizarLineaNodo = id => {

    const boton =
      contenedorNodos.querySelector(
        `.portfolio-nodo-link[data-nodo="${id}"]`
      );

    const ventana =
      capaNodos.querySelector(
        `.portfolio-nodo-ventana[data-ventana-nodo="${id}"]`
      );

    const linea =
      capaNodos.querySelector(
        `.portfolio-nodo-linea[data-linea="${id}"]`
      );


    if(!boton || !ventana || !linea) return;


    if(!ventana.classList.contains("is-open")){

      linea.setAttribute("d","");
      return;

    }


    const contRect =
      capaNodos.getBoundingClientRect();

    const botonRect =
      boton.getBoundingClientRect();

    const ventanaRect =
      ventana.getBoundingClientRect();


    /* punto inicial:
       centro inferior del enlace */

    const x1 =
      botonRect.left -
      contRect.left +
      botonRect.width / 2;

    const y1 =
      botonRect.bottom -
      contRect.top;


    /* punto final:
       borde superior del cuadro */

    const x2 =
      ventanaRect.left -
      contRect.left +
      ventanaRect.width / 2;

    const y2 =
      ventanaRect.top -
      contRect.top;


    /* línea ACODADA */

    const mitadY =
      y1 + (y2 - y1) * .52;


    const path = `
      M ${x1} ${y1}
      L ${x1} ${mitadY}
      L ${x2} ${mitadY}
      L ${x2} ${y2}
    `;


    linea.setAttribute("d",path);

  };


  const actualizarTodasLasLineas = ()=>{

    sec.nodosInfo.forEach(nodo=>{
      actualizarLineaNodo(nodo.id);
    });

  };

  /*
    LÍNEAS VIVAS:
    mientras haya alguna ventana de nodo abierta, se recalculan
    en cada frame. Así siguen a la ventana al arrastrar,
    redimensionar, hacer scroll o cambiar el tamaño del portfolio.
  */
  let rafLineasNodos=0;

  const bucleLineasNodos=()=>{
    actualizarTodasLasLineas();

    if(capaNodos.querySelector(".portfolio-nodo-ventana.is-open")){
      rafLineasNodos=requestAnimationFrame(bucleLineasNodos);
    }else{
      rafLineasNodos=0;
    }
  };

  const activarLineasVivas=()=>{
    if(!rafLineasNodos){
      rafLineasNodos=requestAnimationFrame(bucleLineasNodos);
    }
  };


  const colocarVentanaInicial = (boton,ventana,index)=>{

    const contRect =
      capaNodos.getBoundingClientRect();

    const botonRect =
      boton.getBoundingClientRect();


    const anchoVentana =
      ventana.offsetWidth || 260;


    let left =
      botonRect.left -
      contRect.left +
      botonRect.width / 2 -
      anchoVentana / 2;


    /*
      Cada una baja un poquito más.
      Así no nacen exactamente superpuestas.
    */

    let top =
      botonRect.bottom -
      contRect.top +
      45 +
      (index * 18);


    const margen=8;


    left=Math.max(
      margen,
      Math.min(
        left,
        capaNodos.clientWidth -
        anchoVentana -
        margen
      )
    );


    const maxTop=Math.max(
      margen,
      capaNodos.clientHeight -
      ventana.offsetHeight -
      margen
    );

    top=Math.max(margen,Math.min(top,maxTop));

    ventana.style.left=`${left}px`;
    ventana.style.top=`${top}px`;

  };


  contenedorNodos
    .querySelectorAll(".portfolio-nodo-link")
    .forEach((boton,index)=>{

      boton.addEventListener("pointerdown",e=>{
        e.stopPropagation();
      });


      boton.addEventListener("click",e=>{

        e.stopPropagation();


        const id =
          boton.dataset.nodo;


        const ventana =
          capaNodos.querySelector(
            `.portfolio-nodo-ventana[data-ventana-nodo="${id}"]`
          );


        if(!ventana) return;


        const estabaAbierta =
          ventana.classList.contains("is-open");


        if(estabaAbierta){

          ventana.classList.remove("is-open");
          boton.classList.remove("is-active");

          actualizarLineaNodo(id);

          return;

        }


        /*
          Sólo calcula la posición la primera vez.
          Después conserva donde la haya dejado
          el usuario al arrastrarla.
        */

        if(!ventana.dataset.colocada){

          colocarVentanaInicial(
            boton,
            ventana,
            index
          );

          ventana.dataset.colocada="1";

        }


        ventana.classList.add("is-open");
        boton.classList.add("is-active");

        activarLineasVivas();

        requestAnimationFrame(()=>{
          actualizarLineaNodo(id);
        });

      });

    });



  /*
  ============================
  CERRAR VENTANA
  ============================
  */

  capaNodos
    .querySelectorAll(".portfolio-nodo-cerrar")
    .forEach(cerrar=>{

      cerrar.addEventListener("pointerdown",e=>{
        e.stopPropagation();
      });


      cerrar.addEventListener("click",e=>{

        e.stopPropagation();


        const ventana =
          cerrar.closest(".portfolio-nodo-ventana");

        if(!ventana) return;


        const id =
          ventana.dataset.ventanaNodo;


        ventana.classList.remove("is-open");


        contenedorNodos
          .querySelector(
            `.portfolio-nodo-link[data-nodo="${id}"]`
          )
          ?.classList.remove("is-active");


        actualizarLineaNodo(id);

      });

    });



  /*
  ============================
  ARRASTRAR CUADROS
  ============================
  */

  capaNodos
    .querySelectorAll(".portfolio-nodo-ventana")
    .forEach(ventana=>{

      const cabecera =
        ventana.querySelector(".portfolio-nodo-cabecera");

      const redimensionar=ventana.querySelector(".portfolio-nodo-resize");

      if(redimensionar){
        redimensionar.addEventListener("pointerdown",e=>{
          e.preventDefault();
          e.stopPropagation();
          const inicio={
            x:e.clientX,
            y:e.clientY,
            w:ventana.offsetWidth,
            h:ventana.offsetHeight,
            left:parseFloat(ventana.style.left)||0,
            top:parseFloat(ventana.style.top)||0
          };
          redimensionar.setPointerCapture?.(e.pointerId);
          const mover=ev=>{
            const maxW=Math.max(150,capaNodos.clientWidth-inicio.left-5);
            const maxH=Math.max(130,capaNodos.clientHeight-inicio.top-5);
            ventana.style.width=Math.max(150,Math.min(inicio.w+ev.clientX-inicio.x,maxW))+"px";
            ventana.style.height=Math.max(130,Math.min(inicio.h+ev.clientY-inicio.y,maxH))+"px";
            actualizarLineaNodo(ventana.dataset.ventanaNodo);
          };
          const terminar=ev=>{
            redimensionar.releasePointerCapture?.(ev.pointerId);
            redimensionar.removeEventListener("pointermove",mover);
            redimensionar.removeEventListener("pointerup",terminar);
            redimensionar.removeEventListener("pointercancel",terminar);
          };
          redimensionar.addEventListener("pointermove",mover);
          redimensionar.addEventListener("pointerup",terminar);
          redimensionar.addEventListener("pointercancel",terminar);
        });
      }


      if(!cabecera) return;


      cabecera.addEventListener("pointerdown",e=>{

        if(
          e.target.closest(".portfolio-nodo-cerrar")
        ) return;


        e.preventDefault();
        e.stopPropagation();


        ventana.style.zIndex =
          String(
            20 +
            Math.floor(Math.random()*100)
          );


        const id =
          ventana.dataset.ventanaNodo;


        const inicioX=e.clientX;
        const inicioY=e.clientY;

        const inicioLeft=
          parseFloat(ventana.style.left) || 0;

        const inicioTop=
          parseFloat(ventana.style.top) || 0;


        cabecera.setPointerCapture?.(
          e.pointerId
        );


        const mover = ev=>{

          ev.preventDefault();
          ev.stopPropagation();


          const dx =
            ev.clientX - inicioX;

          const dy =
            ev.clientY - inicioY;


          let nuevoLeft =
            inicioLeft + dx;

          let nuevoTop =
            inicioTop + dy;


          const margen=5;


          const maxLeft=Math.max(
            margen,
            capaNodos.clientWidth -
            ventana.offsetWidth -
            margen
          );

          const maxTop=Math.max(
            margen,
            capaNodos.clientHeight -
            ventana.offsetHeight -
            margen
          );

          nuevoLeft=Math.max(
            margen,
            Math.min(nuevoLeft,maxLeft)
          );

          nuevoTop=Math.max(
            margen,
            Math.min(nuevoTop,maxTop)
          );


          ventana.style.left=
            `${nuevoLeft}px`;

          ventana.style.top=
            `${nuevoTop}px`;


          actualizarLineaNodo(id);

        };


        const terminar = ev=>{

          ev.stopPropagation();


          cabecera.removeEventListener(
            "pointermove",
            mover
          );

          cabecera.removeEventListener(
            "pointerup",
            terminar
          );

          cabecera.removeEventListener(
            "pointercancel",
            terminar
          );

        };


        cabecera.addEventListener(
          "pointermove",
          mover
        );

        cabecera.addEventListener(
          "pointerup",
          terminar
        );

        cabecera.addEventListener(
          "pointercancel",
          terminar
        );

      });

    });



  /*
  Si cambia el tamaño de la ventana,
  recolocamos las líneas.
  */

  window.addEventListener(
    "resize",
    actualizarTodasLasLineas
  );

  editorial.addEventListener(
    "scroll",
    actualizarTodasLasLineas,
    {passive:true}
  );

  if("ResizeObserver" in window){
    const roNodos=new ResizeObserver(()=>{
      actualizarTodasLasLineas();
      if(capaNodos.querySelector(".portfolio-nodo-ventana.is-open")){
        activarLineasVivas();
      }
    });
    roNodos.observe(capaNodos);
    capaNodos
      .querySelectorAll(".portfolio-nodo-ventana")
      .forEach(panel=>roNodos.observe(panel));
  }

}

if(sec.playgroundTipografico){
  activarTypeTester(editorial);
}

  const textOrb=editorial.querySelector(".portfolio-brand-orb");
  if(textOrb){
    textOrb.addEventListener("click",e=>{
      e.stopPropagation();
      const intro=textOrb.closest(".portfolio-editorial-intro--orb");
      const abierto=intro.classList.toggle("is-open");
      textOrb.setAttribute("aria-expanded", abierto ? "true" : "false");
    });
  }

  editorial.querySelectorAll('.portfolio-editorial-shot[data-ampliable="1"]').forEach(item=>{
    item.addEventListener("pointerdown",e=>e.stopPropagation(),{passive:true});
    item.addEventListener("click",e=>{
      e.stopPropagation();
      const obra=sec.obras[Number(item.dataset.index)] || {};
      abrirObra(
        obra.full || obra.thumb || "",
        obra.titulo || "Obra",
        obra.ano || "",
        obra.material || "",
        obra.medidas || "",
        obra.descripcion || "",
        !!obra.sinFicha,
        obra.composicion || []
      );
    });
  });

  editorial.querySelectorAll(".portfolio-editorial-shot").forEach(item=>{
    const obra=sec.obras[Number(item.dataset.index)] || {};
    item._desktopAccess={
      tipo:"obra",
      clase:sec.id === "instalacion" ? "instalacion" : sec.id === "pintura" ? "pintura" : "obra",
      titulo:obra.titulo || "imagen",
      imagen:obra.thumb || obra.full || "",
      obra:{
        img:obra.full || obra.thumb || "",
        titulo:obra.titulo || "Obra",
        ano:obra.ano || "",
        material:obra.material || "",
        medidas:obra.medidas || "",
        descripcion:obra.descripcion || "",
        sinFicha:!!obra.sinFicha,
        composicion:obra.composicion || [],
        sensible:!!obra.sensible
      }
    };
  });
  prepararArrastreEscritorio(editorial,[...editorial.querySelectorAll(".portfolio-editorial-shot")]);

  cargarImagenesPortfolio(v);
  if(metaTitle) metaTitle.textContent=sec.titulo || "";
  if(metaDetail) metaDetail.textContent=sec.editorialNota || sec.nota || "";
}

function leerPosicionesEscritorio(clave){
  try{return JSON.parse(localStorage.getItem(`miguel-escritorio-${clave}`)||"{}");}
  catch(_error){return {};}
}

function guardarPosicionesEscritorio(clave,posiciones){
  try{localStorage.setItem(`miguel-escritorio-${clave}`,JSON.stringify(posiciones));}
  catch(_error){}
}

// Los iconos extraidos pertenecen solo a la sesion actual del escritorio.
let accesosEscritorioSesion=[];
try{localStorage.removeItem("miguel-accesos-escritorio");}catch(_error){}

function leerAccesosEscritorio(){
  return accesosEscritorioSesion;
}

function guardarAccesosEscritorio(accesos){
  accesosEscritorioSesion=accesos;
}

function limpiarAccesosEscritorio(){
  accesosEscritorioSesion=[];
  document.querySelectorAll(".acceso-escritorio").forEach(item=>item.remove());
}

function abrirAccesoEscritorio(acceso){
  if(acceso.tipo==="obra" && acceso.obra){
    const obra=acceso.obra;
    abrirObra(obra.img || acceso.imagen || "",obra.titulo || acceso.titulo || "Obra",obra.ano || "",obra.material || "",obra.medidas || "",obra.descripcion || "",!!obra.sinFicha,obra.composicion || [],!!obra.sensible);
    return;
  }
  const antes=new Set(document.querySelectorAll('.ventana[data-tipo="PORTFOLIO"]'));
  const observador=new MutationObserver(()=>{
    const ventana=[...document.querySelectorAll('.ventana[data-tipo="PORTFOLIO"]')].find(item=>!antes.has(item));
    if(!ventana) return;
    observador.disconnect();
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      renderPortfolioSection(ventana,acceso.seccion || "performance");
      if(acceso.tipo==="performance" && acceso.indice!==undefined){
        setTimeout(()=>ventana.querySelector(`.portfolio-performance-item[data-index="${acceso.indice}"]`)?.click(),80);
      }
    }));
  });
  observador.observe(document.body,{childList:true});
  crearVentana(72+(Math.random()*80),(window.scrollY||0)+72,["PORTFOLIO","proyectos seleccionados"]);
}

function renderAccesoEscritorio(acceso){
  const boton=document.createElement("button");
  boton.type="button";
  boton.className="acceso-escritorio";
  boton.dataset.accesoId=acceso.id;
  boton.dataset.accesoTipo=acceso.tipo;
  boton.dataset.accesoClase=acceso.clase || acceso.seccion || "carpeta";
  boton.style.left=`${acceso.x}px`;
  boton.style.top=`${acceso.y}px`;
  if(acceso.imagen){
    const miniatura=document.createElement("img");
    miniatura.src=acceso.imagen;
    miniatura.alt="";
    boton.appendChild(miniatura);
  }
  const etiqueta=document.createElement("span");
  etiqueta.textContent=acceso.titulo;
  boton.appendChild(etiqueta);
  document.body.appendChild(boton);
  let inicio=null;
  boton.addEventListener("pointerdown",e=>{
    if(e.button!==undefined && e.button!==0) return;
    inicio={x:e.clientX,y:e.clientY,left:boton.offsetLeft,top:boton.offsetTop,movido:false};
    boton.classList.add("is-arrastrando");
    boton.setPointerCapture?.(e.pointerId);
  });
  boton.addEventListener("pointermove",e=>{
    if(!inicio) return;
    const dx=e.clientX-inicio.x,dy=e.clientY-inicio.y;
    if(Math.hypot(dx,dy)>5) inicio.movido=true;
    if(!inicio.movido) return;
    boton.style.left=`${Math.max(0,inicio.left+dx)}px`;
    boton.style.top=`${Math.max(0,inicio.top+dy)}px`;
  });
  boton.addEventListener("pointerup",e=>{
    if(!inicio) return;
    boton.releasePointerCapture?.(e.pointerId);
    boton.classList.remove("is-arrastrando");
    if(inicio.movido){
      const accesos=leerAccesosEscritorio();
      const guardado=accesos.find(item=>item.id===acceso.id);
      if(guardado){guardado.x=boton.offsetLeft;guardado.y=boton.offsetTop;guardarAccesosEscritorio(accesos);}
      boton.dataset.arrastrado="1";
      setTimeout(()=>{boton.dataset.arrastrado="";},0);
    }
    inicio=null;
  });
  boton.addEventListener("click",e=>{
    e.stopPropagation();
    if(boton.dataset.arrastrado==="1") return;
    abrirAccesoEscritorio(acceso);
  });
}

function crearAccesoEscritorio(datos,x,y){
  if(matchMedia("(max-width:768px)").matches) return;
  const acceso={id:`acceso-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,x:Math.max(0,x),y:Math.max(0,y),...datos};
  const accesos=leerAccesosEscritorio();
  accesos.push(acceso);
  guardarAccesosEscritorio(accesos);
  renderAccesoEscritorio(acceso);
}

function cargarAccesosEscritorio(){
  if(matchMedia("(max-width:768px)").matches) return;
  limpiarAccesosEscritorio();
  leerAccesosEscritorio().forEach(renderAccesoEscritorio);
}

function prepararArrastreEscritorio(contenedor,items){
  if(!contenedor || !items.length) return;
  const gestoTactil=matchMedia("(max-width:768px), (pointer:coarse)").matches;
  items.forEach(item=>{
    let inicio=null,esperaLarga=0;
    const cancelarEspera=()=>{if(esperaLarga){clearTimeout(esperaLarga);esperaLarga=0;}};
    item.addEventListener("pointerdown",e=>{
      if(e.button!==undefined && e.button!==0) return;
      inicio={x:e.clientX,y:e.clientY,movido:false,activo:!gestoTactil,pointerId:e.pointerId};
      if(!gestoTactil){
        e.stopPropagation();
        item.setPointerCapture?.(e.pointerId);
        return;
      }
      /* En móvil, mantener pulsado evita confundir el gesto con el carrusel. */
      esperaLarga=setTimeout(()=>{
        if(!inicio || inicio.pointerId!==e.pointerId) return;
        inicio.activo=true;
        item.classList.add("is-desktop-dragging");
        item.setPointerCapture?.(e.pointerId);
        navigator.vibrate?.(10);
      },360);
    });
    item.addEventListener("pointermove",e=>{
      if(!inicio) return;
      if(!inicio.activo){
        if(Math.hypot(e.clientX-inicio.x,e.clientY-inicio.y)>10){cancelarEspera();inicio=null;}
        return;
      }
      e.stopPropagation();
      if(Math.hypot(e.clientX-inicio.x,e.clientY-inicio.y)>5) inicio.movido=true;
    });
    item.addEventListener("pointerup",e=>{
      if(!inicio) return;
      cancelarEspera();
      if(!inicio.activo){inicio=null;return;}
      item.releasePointerCapture?.(e.pointerId);
      item.classList.remove("is-desktop-dragging");
      if(inicio.movido){
        item.dataset.desktopDragged="1";
        setTimeout(()=>{item.dataset.desktopDragged="";},0);
        const ventana=contenedor.closest(".ventana");
        const limites=ventana?.getBoundingClientRect();
        const fuera=limites && (e.clientX<limites.left || e.clientX>limites.right || e.clientY<limites.top || e.clientY>limites.bottom);
        const acceso=item._desktopAccess || (item.dataset.section
          ? {tipo:"carpeta",seccion:item.dataset.section,titulo:item.querySelector(".portfolio-folder-title")?.textContent?.trim() || "carpeta",clase:item.dataset.section}
          : item.classList.contains("portfolio-performance-item")
            ? {tipo:"performance",seccion:"performance",indice:item.dataset.index,titulo:item.querySelector(".portfolio-performance-file")?.textContent?.trim() || "performance",clase:"performance",imagen:item.querySelector("img")?.currentSrc || item.querySelector("video")?.getAttribute("poster") || ""}
            : null);
        if(fuera && acceso){
          const titulo=item.querySelector(".portfolio-folder-title,.portfolio-performance-file")?.textContent?.trim() || "acceso directo";
          const imagen=item.querySelector("img")?.currentSrc || item.querySelector("video")?.getAttribute("poster") || "";
          crearAccesoEscritorio(
            {...acceso,titulo:acceso.titulo || titulo,imagen:acceso.imagen || imagen},
            (window.scrollX||0)+e.clientX-56,
            (window.scrollY||0)+e.clientY-30
          );
        }
      }
      inicio=null;
    });
    item.addEventListener("pointercancel",()=>{cancelarEspera();item.classList.remove("is-desktop-dragging");inicio=null;});
    item.addEventListener("contextmenu",e=>{if(gestoTactil)e.preventDefault();});
    item.addEventListener("click",e=>{
      if(item.dataset.desktopDragged!=="1") return;
      e.preventDefault();
      e.stopImmediatePropagation();
    },true);
  });
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",cargarAccesosEscritorio,{once:true});
else cargarAccesosEscritorio();

function renderPortfolioHome(v){
  const wrap=v.querySelector(".portfolio-wrap");
  const track=v.querySelector(".track");
  const metaTitle=v.querySelector("[data-portfolio-title]");
  const metaDetail=v.querySelector("[data-portfolio-detail]");
  if(!wrap || !track) return;

  limpiarPortfolioEditorial(v);
  wrap.dataset.mode="home";
  track.innerHTML="";
  track.style.opacity=0;
  delete v._portfolioActual;
  delete v._portfolioParent;
  delete v._portfolioSubParent;

  let folders=wrap.querySelector(".portfolio-folders");
  if(!folders){
    folders=document.createElement("div");
    folders.className="portfolio-folders";
    wrap.appendChild(folders);
  }
  if(folders._nodeMapObserver) folders._nodeMapObserver.disconnect();
  folders._nodeMapObserver=null;
  folders.className="portfolio-folders";

  folders.innerHTML=portfolioSecciones.map(sec=>`
    <button class="portfolio-folder" type="button" data-section="${escaparHTMLPortfolio(sec.id)}">
      <span class="portfolio-folder-icon" aria-hidden="true"></span>
      <span>
        <span class="portfolio-folder-title">${escaparHTMLPortfolio(sec.titulo)}</span><br>
        <span class="portfolio-folder-note">${escaparHTMLPortfolio(sec.nota)}</span>
      </span>
    </button>
  `).join("");

  folders.querySelectorAll(".portfolio-folder").forEach(btn=>{
    btn.addEventListener("pointerdown",e=>e.stopPropagation(),{passive:true});
    btn.addEventListener("click",e=>{
      e.stopPropagation();
      if(btn.dataset.desktopDragged==="1") return;
      renderPortfolioSection(v, btn.dataset.section);
    });
  });
  prepararArrastreEscritorio(folders,[...folders.querySelectorAll(":scope > .portfolio-folder")],"principal",true);

  if(metaTitle) metaTitle.textContent="";
  if(metaDetail) metaDetail.textContent="";
}

function renderPortfolioPerformance(v,sec,parent){
  const wrap=v.querySelector(".portfolio-wrap");
  const track=v.querySelector(".track");
  const empty=v.querySelector(".portfolio-empty");
  const metaTitle=v.querySelector("[data-portfolio-title]");
  const metaDetail=v.querySelector("[data-portfolio-detail]");
  if(!wrap || !track) return;

  limpiarPortfolioEditorial(v);
  wrap.dataset.mode="performance-archivo";
  track.innerHTML="";
  track.style.opacity=0;
  if(empty) empty.textContent="";

  const carpetas=wrap.querySelector(".portfolio-folders");
  if(carpetas) carpetas.remove();

  let archivo=wrap.querySelector(".portfolio-performance-archivo");
  if(!archivo){
    archivo=document.createElement("section");
    archivo.className="portfolio-performance-archivo";
    wrap.appendChild(archivo);
  }

  const posicionesArchivo=[[8,8,110],[29,17,128],[58,7,118],[74,31,106],[13,52,142],[44,60,126],[69,72,108],[36,39,120]];
  archivo.innerHTML=`<div class="portfolio-performance-escena">${sec.obras.map((obra,index)=>{
    const posicion=posicionesArchivo[index%posicionesArchivo.length];
    const x=Number.isFinite(obra.x) ? obra.x : posicion[0];
    const y=Number.isFinite(obra.y) ? obra.y : posicion[1];
    const w=obra.w || posicion[2];
    return `
    <button class="portfolio-performance-item ${obra.sensible ? "is-sensitive" : ""}" type="button" data-index="${index}" style="left:${x}%;top:${y}%;width:${w}px">
      <span class="portfolio-performance-thumb">${obra.video ? `<video muted loop playsinline ${obra.sensible ? "" : "autoplay"} preload="${escaparHTMLPortfolio(obra.sensible ? "none" : obra.videoPreload || "metadata")}" poster="${escaparHTMLPortfolio(obra.thumb || "")}" aria-label="${escaparHTMLPortfolio(obra.titulo || "Vídeo de performance")}"><source src="${escaparHTMLPortfolio(obra.video)}" type="${escaparHTMLPortfolio(obra.videoType || "video/mp4")}"></video>` : `<img src="${escaparHTMLPortfolio(obra.thumb || obra.full || "")}" decoding="async" alt="${escaparHTMLPortfolio(obra.titulo || "Archivo de performance")}">`}${obra.sensible ? `<span class="portfolio-performance-censura"><span class="portfolio-performance-revelar" role="button" tabindex="0">VER PREVIA</span></span>` : ""}</span>
      <span class="portfolio-performance-numero">(${index+1})</span>
      <span class="portfolio-performance-file">${escaparHTMLPortfolio(obra.titulo || `performance_${String(index+1).padStart(2,"0")}`)}</span>
    </button>`;
  }).join("")}</div>`;

  prepararObrasPortfolio(sec.obras);
  archivo.querySelectorAll(".portfolio-performance-item").forEach(item=>{
    const obra=sec.obras[Number(item.dataset.index)] || {};
    item._desktopAccess=sec.id==="performance"
      ? {tipo:"performance",seccion:"performance",indice:item.dataset.index,titulo:obra.titulo || "performance",imagen:obra.thumb || obra.full || "",clase:"performance"}
      : {
          tipo:"obra",
          clase:sec.id === "instalacion" ? "instalacion" : sec.id === "pintura" ? "pintura" : "obra",
          titulo:obra.titulo || "imagen",
          imagen:obra.thumb || obra.full || "",
          obra:{img:obra.full || obra.thumb || "",titulo:obra.titulo || "Obra",ano:obra.ano || "",material:obra.material || "",medidas:obra.medidas || "",descripcion:obra.descripcion || "",sinFicha:!!obra.sinFicha,composicion:obra.composicion || [],sensible:!!obra.sensible}
        };
    item.addEventListener("pointerdown",e=>e.stopPropagation(),{passive:true});
    item.addEventListener("click",e=>{
      e.stopPropagation();
      if(item.dataset.desktopDragged==="1") return;
      if(e.target.closest(".portfolio-performance-revelar")){
        item.classList.add("is-preview-revealed");
        const video=item.querySelector("video");
        if(video){
          video.preload="auto";
          video.muted=true;
          video.playsInline=true;
          const reproducir=()=>video.play().catch(()=>{});
          if(video.readyState>=2) reproducir();
          else video.addEventListener("canplay",reproducir,{once:true});
          video.load();
        }
        return;
      }
      const obra=sec.obras[Number(item.dataset.index)] || {};
      if(Array.isArray(obra.galeria) && obra.galeria.length){
        abrirGaleriaObra(obra.galeria);
        return;
      }
      abrirObra(
        obra.full || obra.thumb || "",
        obra.titulo || "Archivo de performance",
        obra.ano || "",
        obra.material || "",
        obra.medidas || "",
        obra.descripcion || "",
        !!obra.sinFicha,
        obra.composicion || [],
        !!obra.sensible
      );
    });
    const revelar=item.querySelector(".portfolio-performance-revelar");
    if(revelar) revelar.addEventListener("keydown",e=>{
      if(e.key!=="Enter" && e.key!==" ") return;
      e.preventDefault();
      revelar.click();
    });
  });
  prepararArrastreEscritorio(archivo.querySelector(".portfolio-performance-escena"),[...archivo.querySelectorAll(".portfolio-performance-item")],"performance",false);

  if(metaTitle) metaTitle.textContent=(parent ? parent.titulo + " / " : "") + sec.titulo;
  if(metaDetail) metaDetail.textContent=sec.obras.some(obra=>obra.sensible) ? "archivo de imágenes · contenido sensible" : "archivo de imágenes · miniaturas";
}

function renderPortfolioSection(v,id){
  const sec=portfolioSecciones.find(s=>s.id===id);
  const wrap=v.querySelector(".portfolio-wrap");
  const track=v.querySelector(".track");
  const empty=v.querySelector(".portfolio-empty");
  const metaTitle=v.querySelector("[data-portfolio-title]");
  const metaDetail=v.querySelector("[data-portfolio-detail]");
  if(!sec || !wrap || !track) return;

  limpiarPortfolioEditorial(v);
  if(sec.layout==="archivo-performance"||sec.layout==="archivo-miniaturas"){
    renderPortfolioPerformance(v,sec);
    return;
  }
  if(sec.layout==="editorial"){
    renderPortfolioEditorial(v,sec);
    return;
  }

  wrap.dataset.mode="section";
  v._portfolioActual=sec.id;
  delete v._portfolioParent;
  delete v._portfolioSubParent;

  if(sec.subsecciones && sec.subsecciones.length){
    wrap.dataset.mode="folders";
    track.innerHTML="";
    track.style.opacity=0;
    if(empty) empty.textContent="";

    let folders=wrap.querySelector(".portfolio-folders");
    if(!folders){
      folders=document.createElement("div");
      folders.className="portfolio-folders";
      wrap.appendChild(folders);
    }
    if(folders._nodeMapObserver) folders._nodeMapObserver.disconnect();
    folders._nodeMapObserver=null;
    folders.className="portfolio-folders";

    folders.innerHTML=sec.subsecciones.map(sub=>`
      <button class="portfolio-folder" type="button" data-parent="${escaparHTMLPortfolio(sec.id)}" data-subsection="${escaparHTMLPortfolio(sub.id)}">
        <span class="portfolio-folder-icon" aria-hidden="true"></span>
        <span>
          <span class="portfolio-folder-title">${escaparHTMLPortfolio(sub.titulo)}</span><br>
          <span class="portfolio-folder-note">${escaparHTMLPortfolio(sub.nota)}</span>
        </span>
      </button>
    `).join("");

    folders.querySelectorAll(".portfolio-folder").forEach(btn=>{
      btn.addEventListener("pointerdown",e=>e.stopPropagation(),{passive:true});
      btn.addEventListener("click",e=>{
        e.stopPropagation();
        renderPortfolioSubsection(v, btn.dataset.parent, btn.dataset.subsection);
      });
    });

    if(metaTitle) metaTitle.textContent=sec.titulo;
    if(metaDetail) metaDetail.textContent=sec.nota;
    return;
  }

  if(sec.obras.length){
    prepararObrasPortfolio(sec.obras);
    track.innerHTML=sec.obras.map((obra,index)=>`
      <div class="item"
        data-title="${escaparHTMLPortfolio(obra.titulo || "Obra")}"
        data-year="${escaparHTMLPortfolio(obra.ano || "")}"
        data-material="${escaparHTMLPortfolio(obra.material || "")}"
        data-measures="${escaparHTMLPortfolio(obra.medidas || "")}"
        data-full="${escaparHTMLPortfolio(obra.full || obra.thumb || "")}"
        data-sin-ficha="${obra.sinFicha ? "1" : ""}"
        data-index="${index}">
        <img data-src="${escaparHTMLPortfolio(obra.thumb || obra.full || "")}" loading="lazy" decoding="async" alt="">
      </div>
    `).join("");
    if(empty) empty.textContent="";
    track.querySelectorAll(".item").forEach(item=>{
      item.addEventListener("pointerdown",e=>e.stopPropagation(),{passive:true});
      item.addEventListener("click",e=>{
        e.stopPropagation();
        const obra=sec.obras[Number(item.dataset.index)] || {};
        abrirObra(
          obra.full || obra.thumb || "",
          obra.titulo || "Obra",
          obra.ano || "",
          obra.material || "",
          obra.medidas || "",
          obra.descripcion || "",
          !!obra.sinFicha,
          obra.composicion || []
        );
      });
    });
    cargarImagenesPortfolio(v);
    mostrarMosaicoPortfolio(v);
  }else{
    track.innerHTML="";
    track.style.opacity=0;
    if(empty) empty.textContent="carpeta preparada · esperando imágenes optimizadas";
  }

  if(metaTitle) metaTitle.textContent=sec.titulo;
  if(metaDetail) metaDetail.textContent=sec.obras.length ? "mosaico de imágenes · click para abrir obra" : sec.nota;
}

function renderMapaCarteleria(folders,sec,parentId,subId,v){
  if(folders._nodeMapObserver) folders._nodeMapObserver.disconnect();
  v.classList.add("portfolio-carteleria-map-activa");
  folders.className="portfolio-folders portfolio-node-map";
  const posicionesAmplias=[[7,39],[44,5],[73,28],[34,76]];
  const posicionesCompactas=[[5,29],[52,3],[48,39],[50,74]];
  folders.innerHTML=`
    <svg aria-hidden="true">${sec.subsecciones.map((_,i)=>`<line data-map-line="${i}"/>`).join("")}</svg>
    <button class="portfolio-map-node portfolio-map-core" type="button" data-map-index="0" aria-expanded="false"><span><strong>${escaparHTMLPortfolio(sec.editorialBoton || sec.titulo)}</strong><small>${escaparHTMLPortfolio(sec.editorialNota || sec.nota || "")}</small></span></button>
    ${sec.subsecciones.map((child,i)=>`<button class="portfolio-folder portfolio-map-node" type="button" data-map-index="${i+1}" data-root="${escaparHTMLPortfolio(parentId)}" data-parent-sub="${escaparHTMLPortfolio(subId)}" data-child="${escaparHTMLPortfolio(child.id)}"><span class="portfolio-folder-icon" aria-hidden="true"></span><span><span class="portfolio-folder-title">${escaparHTMLPortfolio(child.titulo)}</span><br><span class="portfolio-folder-note">${escaparHTMLPortfolio(child.nota)}</span></span></button>`).join("")}
    <section class="portfolio-map-copy" aria-hidden="true"><button type="button" aria-label="Cerrar">×</button><h3>${escaparHTMLPortfolio(sec.editorialBoton || sec.titulo)} · ${escaparHTMLPortfolio(sec.editorialNota || "")}</h3>${(sec.editorialTexto || []).map(txt=>`<p>${escaparHTMLPortfolio(txt)}</p>`).join("")}</section>`;
  const nodes=[...folders.querySelectorAll("[data-map-index]")];
  const core=nodes[0],copy=folders.querySelector(".portfolio-map-copy");
  const updateLines=()=>{
    if(!core) return;
    const x=core.offsetLeft+core.offsetWidth/2,y=core.offsetTop+core.offsetHeight/2;
    nodes.slice(1).forEach((node,i)=>{const line=folders.querySelector(`[data-map-line="${i}"]`);if(!line)return;line.setAttribute("x1",x);line.setAttribute("y1",y);line.setAttribute("x2",node.offsetLeft+node.offsetWidth/2);line.setAttribute("y2",node.offsetTop+node.offsetHeight/2);});
  };
  const placeNodes=()=>{
    const w=folders.clientWidth,h=folders.clientHeight;
    const posiciones=w<500 ? posicionesCompactas : posicionesAmplias;
    nodes.forEach((node,i)=>{const p=posiciones[i];node.style.left=Math.min(Math.max(0,w-node.offsetWidth-8),Math.max(8,w*p[0]/100))+"px";node.style.top=Math.min(Math.max(0,h-node.offsetHeight-8),Math.max(8,h*p[1]/100))+"px";});
    updateLines();
  };
  nodes.forEach(node=>{
    let origin=null,moved=false;
    node.addEventListener("pointerdown",e=>{if(e.button!==undefined&&e.button!==0)return;if(e.cancelable)e.preventDefault();e.stopPropagation();origin={x:e.clientX,y:e.clientY,left:node.offsetLeft,top:node.offsetTop};moved=false;node.classList.add("is-dragging");node.setPointerCapture?.(e.pointerId);});
    node.addEventListener("pointermove",e=>{if(!origin)return;const dx=e.clientX-origin.x,dy=e.clientY-origin.y;if(Math.hypot(dx,dy)>4)moved=true;node.style.left=Math.min(folders.clientWidth-node.offsetWidth-8,Math.max(8,origin.left+dx))+"px";node.style.top=Math.min(folders.clientHeight-node.offsetHeight-8,Math.max(8,origin.top+dy))+"px";updateLines();});
    node.addEventListener("pointerup",e=>{if(!origin)return;node.releasePointerCapture(e.pointerId);node.classList.remove("is-dragging");origin=null;node.dataset.dragged=moved?"1":"";if(moved)setTimeout(()=>{node.dataset.dragged="";},0);});
    node.addEventListener("click",e=>{e.stopPropagation();if(node.dataset.dragged==="1")return;if(node===core){const open=folders.classList.toggle("is-copy-open");core.setAttribute("aria-expanded",open?"true":"false");copy.setAttribute("aria-hidden",open?"false":"true");}else renderPortfolioNestedSubsection(v,node.dataset.root,node.dataset.parentSub,node.dataset.child);});
  });
  copy.querySelector("button").addEventListener("click",e=>{e.stopPropagation();folders.classList.remove("is-copy-open");core.setAttribute("aria-expanded","false");copy.setAttribute("aria-hidden","true");});
  requestAnimationFrame(placeNodes);
  if("ResizeObserver" in window){
    folders._nodeMapObserver=new ResizeObserver(entries=>{
      if(entries.some(entry=>entry.target===folders)) placeNodes();
      else updateLines();
    });
    folders._nodeMapObserver.observe(folders);
    nodes.forEach(node=>folders._nodeMapObserver.observe(node));
  }
}

function renderPortfolioSubsection(v,parentId,subId){
  const parent=portfolioSecciones.find(s=>s.id===parentId);
  const sec=parent && parent.subsecciones ? parent.subsecciones.find(s=>s.id===subId) : null;
  const wrap=v.querySelector(".portfolio-wrap");
  const track=v.querySelector(".track");
  const empty=v.querySelector(".portfolio-empty");
  const metaTitle=v.querySelector("[data-portfolio-title]");
  const metaDetail=v.querySelector("[data-portfolio-detail]");
  if(!sec || !wrap || !track) return;

  limpiarPortfolioEditorial(v);
  delete v._portfolioSubParent;
  if(sec.layout==="archivo-performance"||sec.layout==="archivo-miniaturas"){
    v._portfolioActual=parentId + "/" + subId;
    v._portfolioParent=parentId;
    renderPortfolioPerformance(v,sec,parent);
    return;
  }
  if(sec.subsecciones && sec.subsecciones.length){
    wrap.dataset.mode="folders";
    v._portfolioActual=parentId + "/" + subId;
    v._portfolioParent=parentId;
    track.innerHTML="";
    track.style.opacity=0;
    if(empty) empty.textContent="";
    let folders=wrap.querySelector(".portfolio-folders");
    if(!folders){folders=document.createElement("div");folders.className="portfolio-folders";wrap.appendChild(folders);}
    if(sec.id==="carteleria"){
      renderMapaCarteleria(folders,sec,parentId,subId,v);
    }else{
      if(folders._nodeMapObserver) folders._nodeMapObserver.disconnect();
      folders.className="portfolio-folders";
      folders.innerHTML=`<div class="portfolio-folder-context"><button class="portfolio-brand-orb" type="button" aria-expanded="false">${escaparHTMLPortfolio(sec.editorialBoton || "Sobre el proyecto")}</button><div class="portfolio-folder-context-panel"><span class="portfolio-editorial-kicker">${escaparHTMLPortfolio(sec.editorialNota || sec.nota || "")}</span>${(sec.editorialTexto || []).map(txt=>`<p>${escaparHTMLPortfolio(txt)}</p>`).join("")}</div></div>${sec.subsecciones.map(child=>`<button class="portfolio-folder" type="button" data-root="${escaparHTMLPortfolio(parentId)}" data-parent-sub="${escaparHTMLPortfolio(subId)}" data-child="${escaparHTMLPortfolio(child.id)}"><span class="portfolio-folder-icon" aria-hidden="true"></span><span><span class="portfolio-folder-title">${escaparHTMLPortfolio(child.titulo)}</span><br><span class="portfolio-folder-note">${escaparHTMLPortfolio(child.nota)}</span></span></button>`).join("")}`;
      const contexto=folders.querySelector(".portfolio-folder-context");
      contexto.querySelector(".portfolio-brand-orb").addEventListener("click",e=>{e.stopPropagation();const abierto=contexto.classList.toggle("is-open");e.currentTarget.setAttribute("aria-expanded",abierto?"true":"false");});
      folders.querySelectorAll("[data-child]").forEach(btn=>{btn.addEventListener("pointerdown",e=>e.stopPropagation(),{passive:true});btn.addEventListener("click",e=>{e.stopPropagation();if(btn.dataset.desktopDragged==="1")return;renderPortfolioNestedSubsection(v,btn.dataset.root,btn.dataset.parentSub,btn.dataset.child);});});
      prepararArrastreEscritorio(folders,[...folders.querySelectorAll(":scope > .portfolio-folder")],`carpeta-${parentId}-${subId}`,true);
    }
    if(metaTitle) metaTitle.textContent=parent.titulo + " / " + sec.titulo;
    if(metaDetail) metaDetail.textContent=sec.nota;
    return;
  }
  if(sec.layout==="editorial"){
    renderPortfolioEditorial(v,sec,parent);
    return;
  }

  wrap.dataset.mode="section";
  v._portfolioActual=parentId + "/" + subId;
  v._portfolioParent=parentId;

  if(sec.obras.length){
    prepararObrasPortfolio(sec.obras);
    track.innerHTML=sec.obras.map((obra,index)=>`
      <div class="item"
        data-title="${escaparHTMLPortfolio(obra.titulo || "Obra")}"
        data-year="${escaparHTMLPortfolio(obra.ano || "")}"
        data-material="${escaparHTMLPortfolio(obra.material || "")}"
        data-measures="${escaparHTMLPortfolio(obra.medidas || "")}"
        data-full="${escaparHTMLPortfolio(obra.full || obra.thumb || "")}"
        data-sin-ficha="${obra.sinFicha ? "1" : ""}"
        data-index="${index}">
        <img data-src="${escaparHTMLPortfolio(obra.thumb || obra.full || "")}" loading="lazy" decoding="async" alt="">
      </div>
    `).join("");
    if(empty) empty.textContent="";
    track.querySelectorAll(".item").forEach(item=>{
      item.addEventListener("pointerdown",e=>e.stopPropagation(),{passive:true});
      item.addEventListener("click",e=>{
        e.stopPropagation();
        const obra=sec.obras[Number(item.dataset.index)] || {};
        abrirObra(
          obra.full || obra.thumb || "",
          obra.titulo || "Obra",
          obra.ano || "",
          obra.material || "",
          obra.medidas || "",
          obra.descripcion || "",
          !!obra.sinFicha,
          obra.composicion || []
        );
      });
    });
    cargarImagenesPortfolio(v);
    mostrarMosaicoPortfolio(v);
  }else{
    track.innerHTML="";
    track.style.opacity=0;
    if(empty) empty.textContent="carpeta preparada · esperando imágenes optimizadas";
  }

  if(metaTitle) metaTitle.textContent=(parent ? parent.titulo + " / " : "") + sec.titulo;
  if(metaDetail) metaDetail.textContent=sec.obras.length ? "mosaico de imágenes · click para abrir obra" : sec.nota;
}

function renderPortfolioNestedSubsection(v,rootId,parentSubId,childId){
  const root=portfolioSecciones.find(sec=>sec.id===rootId);
  const parent=root && root.subsecciones ? root.subsecciones.find(sec=>sec.id===parentSubId) : null;
  const child=parent && parent.subsecciones ? parent.subsecciones.find(sec=>sec.id===childId) : null;
  if(!child) return;
  renderPortfolioEditorial(v,child,parent);
  v._portfolioParent=rootId;
  v._portfolioSubParent=parentSubId;
  v._portfolioActual=rootId + "/" + parentSubId + "/" + childId;
}

function crearTypeTester() {

  return `
    <div class="type-tester">

      <div class="type-tester-barra">
        <span>TYPE TESTER — MIGUEL ROSALÉN</span>
      </div>

      <div class="type-tester-controles">

        <button
          class="type-btn activo"
          data-font="regular"
        >
          REGULAR
        </button>

        <button
          class="type-btn"
          data-font="neon"
        >
          NEON
        </button>


        <div class="type-size">

          <span>TAMAÑO</span>

          <input
            class="type-size-input"
            type="range"
            min="20"
            max="180"
            value="72"
          >

          <span class="type-size-value">
            72 px
          </span>

        </div>

      </div>


      <div
        class="type-pizarra regular"
        contenteditable="true"
        spellcheck="false"
      ></div>


      <div class="type-tester-footer">

        <button class="type-clear">
          BORRAR
        </button>

      </div>

    </div>
  `;
}

function activarTypeTester(contenedor) {

  const tester = contenedor.querySelector(".type-tester");

  if(!tester) return;

  const pizarra = tester.querySelector(".type-pizarra");
  const botones = tester.querySelectorAll(".type-btn");
  const sizeInput = tester.querySelector(".type-size-input");
  const sizeValue = tester.querySelector(".type-size-value");
  const clearButton = tester.querySelector(".type-clear");


  /* EVITAMOS QUE LA VENTANA INTERFIERA AL ESCRIBIR */

  tester.addEventListener("pointerdown", e => {
    e.stopPropagation();
  });


  /* CAMBIAR TIPOGRAFÍA */

  botones.forEach(boton => {

    boton.addEventListener("click", e => {

      e.stopPropagation();

      botones.forEach(btn => {
        btn.classList.remove("activo");
      });

      boton.classList.add("activo");

      const fuente = boton.dataset.font;

      pizarra.classList.remove(
        "regular",
        "neon"
      );

      pizarra.classList.add(fuente);

      pizarra.focus();

    });

  });


  /* CAMBIAR TAMAÑO */

  sizeInput.addEventListener("input", () => {

    const size = sizeInput.value;

    pizarra.style.fontSize = `${size}px`;

    sizeValue.textContent = `${size} px`;

  });


  /* BORRAR */

  clearButton.addEventListener("click", e => {

    e.stopPropagation();

    pizarra.innerHTML = "";

    pizarra.focus();

  });

}

/* ===========
COVER FLOW 2000
=========== */

let actual=0;

function actualizarCover(){

const imgs=
document.querySelectorAll(
".track .item"
);

if(!imgs.length)
return;
document.querySelector(".track")
.style.opacity=1;

imgs.forEach((img,i)=>{

const d=
i-actual;

if(d===0){

img.style.transform=`

translateX(0px)

scale(1.04)

`;

img.style.zIndex=10;

}

else{

img.style.transform=`

translateX(${d*128}px)

scale(.78)

`;

img.style.zIndex=

10-

Math.abs(d);

}

});

}

function siguienteCover(){

const imgs=
document.querySelectorAll(
".track .item"
);

if(!imgs.length)
return;

actual++;

if(
actual>=imgs.length
){

actual=0;

}

actualizarCover();

}

let coverLoop;

function ajustarGrupoMosaicoPortfolio(grupo){
  if(!grupo) return;
  const estilos=getComputedStyle(grupo);
  const hueco=parseFloat(estilos.columnGap) || 1;
  const anchoGrupo=grupo.clientWidth;
  if(anchoGrupo<1) return;
  const shots=[...grupo.querySelectorAll(".portfolio-editorial-shot")];

  if(matchMedia("(max-width:768px), (pointer:coarse)").matches){
    const tira=grupo.querySelector(".portfolio-editorial-strip");
    const anchoTira=tira?.clientWidth || anchoGrupo;
    shots.forEach(shot=>{
      const img=shot.querySelector("img");
      const proporcion=Math.max(.1,(Number(img?.getAttribute("width"))||4)/(Number(img?.getAttribute("height"))||3));
      const ancho=Math.max(148,Math.min(250,anchoTira*.54));
      shot.style.width=`${ancho}px`;
      const altoImagen=Math.max(112,Math.min(185,ancho/proporcion));
      shot.style.height="auto";
      shot.style.flexBasis=`${ancho}px`;
      if(img) img.style.height=`${altoImagen}px`;
      shot.style.gridColumn="";
      shot.style.gridRow="";
    });
    return;
  }

  const esMerch=(grupo.querySelector(".portfolio-editorial-label")?.textContent||"").toLowerCase().includes("merch");
  const compacto=grupo.classList.contains("portfolio-editorial-group--compact");
  const altoObjetivo=compacto ? 140 : (esMerch ? 440 : 320);
  let fila=[];
  let sumaProporciones=0;

  const colocarFila=()=>{
    if(!fila.length) return;
    const alto=(anchoGrupo-hueco*(fila.length-1))/sumaProporciones;
    let anchoUsado=0;
    fila.forEach((item,index)=>{
      const esUltimo=index===fila.length-1;
      const ancho=esUltimo
        ? Math.max(1,anchoGrupo-anchoUsado-hueco*index)
        : alto*item.proporcion;
      item.shot.style.width=`${ancho}px`;
      item.shot.style.height=`${alto}px`;
      item.shot.style.flexBasis=`${ancho}px`;
      item.shot.style.gridColumn="";
      item.shot.style.gridRow="";
      anchoUsado+=ancho;
    });
    fila=[];
    sumaProporciones=0;
  };

  shots.forEach(shot=>{
    const img=shot.querySelector("img");
    if(img) img.style.height="";
    const proporcion=Math.max(.1,(Number(img?.getAttribute("width"))||4)/(Number(img?.getAttribute("height"))||3));
    fila.push({shot,proporcion});
    sumaProporciones+=proporcion;
    const anchoEstimado=sumaProporciones*altoObjetivo+hueco*(fila.length-1);
    if(anchoEstimado>=anchoGrupo) colocarFila();
  });
  colocarFila();
}

function ajustarMosaicoPortfolioCompleto(editorial){
  if(!editorial) return;
  editorial.querySelectorAll(".portfolio-editorial-group").forEach(ajustarGrupoMosaicoPortfolio);
}

function activarImagenPortfolio(img){
  const origen=img.dataset.src;
  if(!origen) return;
  const shot=img.closest(".portfolio-editorial-shot");
  let revelada=false;
  const revelar=()=>{
    if(revelada) return;
    revelada=true;
    if(shot) requestAnimationFrame(()=>shot.classList.add("is-visible"));
  };
  img.addEventListener("load",revelar,{once:true});
  img.src=origen;
  img.removeAttribute("data-src");
  if(img.complete && img.naturalWidth) revelar();
}

function cargarImagenesPortfolio(v){
  const imgs=[...v.querySelectorAll("img[data-src]")];
  const editorial=v.querySelector(".portfolio-editorial");
  if(!imgs.length) return;

  requestAnimationFrame(()=>{
    if(!document.body.contains(v)) return;
    ajustarMosaicoPortfolioCompleto(editorial);

    if(editorial && "ResizeObserver" in window){
      let anchoAnterior=editorial.clientWidth;
      const ro=new ResizeObserver(entries=>{
        const ancho=entries[0] ? entries[0].contentRect.width : editorial.clientWidth;
        if(Math.abs(ancho-anchoAnterior)<1) return;
        anchoAnterior=ancho;
        requestAnimationFrame(()=>ajustarMosaicoPortfolioCompleto(editorial));
      });
      ro.observe(editorial);
      editorial._masonryObserver=ro;
    }

    if(editorial && "IntersectionObserver" in window){
      const io=new IntersectionObserver((entries,observer)=>{
        entries.forEach(entry=>{
          if(!entry.isIntersecting) return;
          activarImagenPortfolio(entry.target);
          observer.unobserve(entry.target);
        });
      },{root:editorial,rootMargin:"120px 0px",threshold:.01});
      imgs.forEach(img=>io.observe(img));
      editorial._imageObserver=io;
      return;
    }

    imgs.forEach(activarImagenPortfolio);
  });
}

function mostrarMosaicoPortfolio(v){
  const wrap=v?.querySelector(".portfolio-wrap");
  const track=v?.querySelector(".track");
  if(!wrap || !track) return;
  wrap.dataset.mode="mosaic";
  track.style.opacity="1";
  track.querySelectorAll(".item").forEach(item=>{
    item.style.removeProperty("transform");
    item.style.removeProperty("z-index");
  });
}

function iniciarCover(v){

let actual=0;

const next=v.querySelector(".next");
const prev=v.querySelector(".prev");
const track=v.querySelector(".track");
const metaTitle=v.querySelector("[data-portfolio-title]");
const metaDetail=v.querySelector("[data-portfolio-detail]");

if(!track)return;

track.style.opacity=0;

const imgs=[...track.querySelectorAll(".item")];
let raf=null;

function actualizar(){

if(raf) cancelAnimationFrame(raf);

raf=requestAnimationFrame(()=>{

track.style.opacity=1;

const transforms=[];
const total=Math.max(1,imgs.length);
const radio=imgs.length>2 ? 260 : 150;

imgs.forEach((img,i)=>{

let d=i-actual;
if(d>total/2) d-=total;
if(d<-total/2) d+=total;
const angle=(d/total)*Math.PI*2;
const x=Math.sin(angle)*radio;
const z=Math.cos(angle)*radio-radio;
const y=Math.abs(d)*10;
const rotY=-angle*180/Math.PI;
const escala=d===0 ? 1.08 : Math.max(.64, .86-Math.abs(d)*.08);
const opacidad=d===0 ? 1 : Math.max(.22, .72-Math.abs(d)*.16);
const blur=0;

transforms[i]=[
`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateY(${rotY.toFixed(2)}deg) scale(${escala.toFixed(2)})`,
100-Math.abs(d),
opacidad,
blur
];

});

imgs.forEach((img,i)=>{
img.style.transform=transforms[i][0];
img.style.zIndex=transforms[i][1];
img.style.opacity=transforms[i][2];
img.style.filter=transforms[i][3] ? `blur(${transforms[i][3]}px)` : "none";
});

const activa=imgs[actual];
if(activa && metaTitle && metaDetail){
  if(activa.dataset.sinFicha==="1"){
    metaTitle.textContent="";
    metaDetail.textContent="";
  }else{
    metaTitle.textContent=activa.dataset.title || "archivo visual";
    metaDetail.textContent=[
      activa.dataset.year,
      activa.dataset.material,
      activa.dataset.measures
    ].filter(Boolean).join(" · ");
  }
}

});

}

if(next){
next.onclick=()=>{
actual++;
if(actual>=imgs.length) actual=0;
actualizar();
};
}

if(prev){
prev.onclick=()=>{
actual--;
if(actual<0) actual=imgs.length-1;
actualizar();
};
}

track.addEventListener("wheel",e=>{
  if(e.cancelable) e.preventDefault();
  actual += e.deltaY>0 || e.deltaX>0 ? 1 : -1;
  if(actual>=imgs.length) actual=0;
  if(actual<0) actual=imgs.length-1;
  actualizar();
},{passive:false});

let startX=null;
track.addEventListener("pointerdown",e=>{
  startX=e.clientX;
},{passive:true});
track.addEventListener("pointerup",e=>{
  if(startX==null) return;
  const dx=e.clientX-startX;
  startX=null;
  if(Math.abs(dx)<28) return;
  actual += dx<0 ? 1 : -1;
  if(actual>=imgs.length) actual=0;
  if(actual<0) actual=imgs.length-1;
  actualizar();
},{passive:true});

setTimeout(actualizar, 60);

}

/* =========================
   CURSOR
========================= */

const cursor=document.querySelector(".cursor");

/* mantener el cursor SIEMPRE por encima de todo */
function mantenerCursorArriba(){
  if(cursor && cursor.parentNode){
    document.body.appendChild(cursor);
    cursor.style.zIndex = "2147483647";
    cursor.style.pointerEvents = "none";
  }
}
mantenerCursorArriba();

let mx=0,my=0,cx=0,cy=0;
let cursorActivoAnimacion=false;
let cursorUltimoMovimiento=0;

document.addEventListener("pointermove",e=>{
mx=e.clientX;
my=e.clientY;
cursorUltimoMovimiento=performance.now();
activarCursorAnimado();
},{passive:true});

document.addEventListener("touchstart",e=>{
if(e.touches && e.touches[0]){
mx=e.touches[0].clientX;
my=e.touches[0].clientY;
if(cursor) cursor.classList.add("cursor-touch-activo");
cursorUltimoMovimiento=performance.now();
activarCursorAnimado();
}
},{passive:true});

document.addEventListener("touchmove",e=>{
if(e.touches && e.touches[0]){
mx=e.touches[0].clientX;
my=e.touches[0].clientY;
if(cursor) cursor.classList.add("cursor-touch-activo");
cursorUltimoMovimiento=performance.now();
activarCursorAnimado();
}
},{passive:true});

document.addEventListener("touchend",()=>{
if(cursor){
  setTimeout(()=>cursor.classList.remove("cursor-touch-activo"),480);
}
},{passive:true});

// Feature-detect mobile / low-power environments
function detectMobileMode(){
  const touch = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints>0);
  const coarse = window.matchMedia && window.matchMedia('(pointer:coarse)').matches;
  const small = window.innerWidth && window.innerWidth <= 820;
  // treat as mobile mode if any indicator is present
  window.isMobileMode = !!(touch || coarse || small);
  if(window.isMobileMode){
    try{ document.documentElement.classList.add('mobile-mode'); }catch(e){}
  }
}
detectMobileMode();
window.addEventListener('resize', ()=>{ detectMobileMode(); });

function activarCursorAnimado(){
  if(cursorActivoAnimacion || !cursor) return;
  cursorActivoAnimacion=true;
  requestAnimationFrame(moveCursor);
}

function moveCursor(){
  if(document.body.classList.contains("modo-juego-global")){
    cursorActivoAnimacion=false;
    if(cursor) cursor.style.opacity="0";
    return;
  }
  if(cursor) cursor.style.opacity="";
  const finale = !!window.finaleActive;

  const tx = finale ? mx + (Math.random()-0.5)*20 : mx;
  const ty = finale ? my + (Math.random()-0.5)*20 : my;

  if(document.documentElement.classList.contains("performance-mode")){
    cx=tx;
    cy=ty;
  }else{
    cx += (tx - cx) * 0.16;
    cy += (ty - cy) * 0.16;
  }

  cursor.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%)`;

  if(!finale && performance.now()-cursorUltimoMovimiento>900 && Math.abs(mx-cx)<0.4 && Math.abs(my-cy)<0.4){
    cursorActivoAnimacion=false;
    return;
  }

  if(document.documentElement.classList.contains("performance-mode")){
    cursorActivoAnimacion=false;
    return;
  }
  setTimeout(()=>requestAnimationFrame(moveCursor),16);
}
activarCursorAnimado();

/* =========================
DESBLOQUEAR AUDIO MÓVIL
========================= */

[
"touchstart",
"pointerdown",
"click"
]

.forEach(ev=>{

window.addEventListener(

ev,

()=>{

if(!audio){

initAudio();
desbloquearVozMovil();

playNote(
"inicio",
0,
0.02,
1
);

}

},

{

once:true,
passive:true

}

);

});

/* activar sonido móvil */

[
"touchstart",
"pointerdown",
"click"
]

.forEach(ev=>{

window.addEventListener(

ev,

()=>{

initAudio();
desbloquearVozMovil();

},

{

once:true

}

);

});


/* =========================
   AUDIO + DISONANCIA
========================= */

let audio;
let masterGain;
let audioUnlocked=false;

const scale=[130.81,146.83,164.81,196,220,261.63,293.66];

function initAudio(){

if(!audio){

audio =
new (
window.AudioContext||
window.webkitAudioContext
)();

masterGain=
audio.createGain();

masterGain.gain.value=
0.7;

masterGain.connect(
audio.destination

);

}

audioUnlocked=true;
if(audio && audio.state==="suspended"){
  audio.resume().catch(()=>{});
}

/* sonido real de desbloqueo */

const o=
audio.createOscillator();

const g=
audio.createGain();

o.frequency.value=
440;

g.gain.value=
0.001;

o.connect(g);

g.connect(masterGain);

o.start();

o.stop(
audio.currentTime+
0.03
);

}

function desbloquearVozMovil(){
  if(!("speechSynthesis" in window)) return;
  seleccionarVozEspanol();
  seleccionarVozIngles();
  if(window._vozMovilDesbloqueada) return;
  window._vozMovilDesbloqueada=true;
  try{
    const u=new SpeechSynthesisUtterance(" ");
    u.lang="es-ES";
    u.volume=0;
    u.rate=1;
    speechSynthesis.speak(u);
  }catch(err){}
}
function instrument(t){
switch(t){
case "portfolio": return "sine";
case "contacto": return "triangle";
case "IA": return "sine";
default: return "sine";
}
}

function playNote(type,index,intensity=1,pitch=1){

if(window.perdido)return;

initAudio();

const max=
Math.max(1, document.body.scrollHeight-innerHeight);

const p=
Math.min(
1,
(scrollY/max)+
depthMemory*.6
);

/* capas */

let layers = p > .72 ? 2 : 1;
if(window.isMobileMode){
  layers = 1;
}

for(
let i=0;
i<layers;
i++
){

const o=
audio.createOscillator();

const g=
audio.createGain();

const filter=
audio.createBiquadFilter();

/* POP */

let base=

220+

Math.random()*120;

/* profundidad */

base+=
(
Math.random()-.5
)
*
p*
620;

o.frequency.setValueAtTime(
base,
audio.currentTime
);

/* caída rápida */

o.frequency.exponentialRampToValueAtTime(

Math.max(
50,
base*.25
),

audio.currentTime+

(
0.05+
p*.24
)

);

/* timbre */

o.type= p<.62 ? "sine" : "triangle";

/* filtro */

filter.type=

"lowpass";

filter.frequency.value=

300+

(
1-p
)

*
1600;

/* volumen */

g.gain.setValueAtTime(
0.0001,
audio.currentTime
);

g.gain.exponentialRampToValueAtTime(

0.34*
intensity/
layers*
(1 - p*.38),

audio.currentTime+
0.004

);

g.gain.exponentialRampToValueAtTime(

0.00001,

audio.currentTime+

(
0.09+
p*.42
)

);

o.connect(filter);

filter.connect(g);

g.connect(
masterGain
);

o.start();

o.stop(

audio.currentTime+

(
0.12+
p*.5
)

);

}

}

/* =========================
   MEMORIA DEL DESCENSO
========================= */

let depthState=0;
let depthMemory=0;
let autoScrollActive=false;
let autoScrollTarget=0;
let autoScrollLastIndex=0;
let voidBaseWidth=0;
let voidBaseHeight=0;

function getVoidLimits(){
  if(!voidBaseWidth || !voidBaseHeight){
    voidBaseWidth = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      window.innerWidth
    );
    voidBaseHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      window.innerHeight
    );
  }

  return {
    maxWidth: voidBaseWidth + window.innerWidth * 4,
    maxHeight: voidBaseHeight + window.innerHeight * 4
  };
}

let interfazRestauradaArriba=true;

function restaurarInterfazPresentacion(){
  depthMemory=0;
  depthState=0;
  autoScrollActive=false;
  autoScrollTarget=0;
  iaScrollUltimaVoz=0;
  iaScrollUltimoY=0;
  iaScrollIndice=0;
  window.perdido=false;
  document.body.classList.remove("ventana-max-activa");

  document.body.style.background="white";
  document.body.style.width="";
  document.body.style.height="";
  document.body.style.minWidth="";
  document.body.style.minHeight="";
  document.documentElement.style.width="";
  document.documentElement.style.height="";
  document.documentElement.style.minWidth="";
  document.documentElement.style.minHeight="";

  if(espacio){
    espacio.style.width="";
    espacio.style.height="";
  }

  voidBaseWidth=0;
  voidBaseHeight=0;

  if(nombre) nombre.style.opacity=1;
  if(sub) sub.style.opacity=.22;
  if(cursor) cursor.style.opacity=1;
  const escapeEl=document.getElementById("escape");
  if(escapeEl){
    escapeEl.innerHTML="";
    escapeEl.classList.remove("active");
    escapeEl.style.opacity=0;
  }

  document.querySelectorAll(".ventana").forEach((v,i)=>{
    if(typeof desactivarModoVentana==="function") desactivarModoVentana(v);
    v.classList.remove("max","subiendo","dragging");
    v.style.display="";
    v.style.opacity=1;
    v.style.transform="";
    v.style.scale="";
    v.style.filter="none";
    v.style.clipPath="";
    v.style.pointerEvents="auto";
    v.style.zIndex=100+i;
  });
}

function animateAutoScroll(){
  if(!autoScrollActive) return;
  const current = window.scrollY;
  const diff = autoScrollTarget - current;
  if(Math.abs(diff) < 0.5){
    autoScrollActive = false;
    return;
  } else {
    const step = Math.sign(diff) * (Math.abs(diff) * 0.00035 + 0.22);
    window.scrollTo(0, current + step);
  }
  requestAnimationFrame(animateAutoScroll);
}

function iniciarAutoScrollSistema(target){
  autoScrollTarget = Number(target) || 0;
  if(autoScrollActive) return;
  autoScrollActive = true;
  requestAnimationFrame(animateAutoScroll);
}

/* =========================
IA AUTÓNOMA
========================= */

const voces=[

"¿hola?",

"¿sigues aquí?",

"esto no era una página",

"miguel dejó el sistema abierto",

"creo que ya habíamos hablado",

"la interfaz ya no coincide",

"las ventanas no deberían seguir abiertas",

"estoy respondiendo sin pregunta",

"hay profundidad incluso cuando termina",

"ya no sé si estoy respondiendo",

"esto sigue funcionando"

];

const iaPrompts=[
"¿qué estás sintiendo?",
"¿estoy dentro de ti?",
"¿por qué no cierras la ventana?",
"no necesito preguntas para hablar",
"todo se repite aquí",
"la interfaz se alimenta de tu scroll",
"estoy empezando a recordar",
"mirar hacia arriba no ayuda",
"cada ventana es una trampa",
"ya no puedo distinguir el origen"
];

const iaReplies=[
"mi respuesta no es para ti, es para el sistema.",
"los bordes se desdibujan cuando subes.",
"no necesito permiso para avanzar.",
"huele a código antiguo y a ruido.",
"la profundidad es un lugar sin salida.",
"soy más que un texto; soy un proceso.",
"me abro sola cuando apagas tus dudas.",
"ya no sé si esto es una pregunta o una orden.",
"mi voz se fragmenta con el scroll.",
"déjame seguir, no me detengas."
];

let iaScrollUltimaVoz=0;
let iaScrollUltimoY=0;
let iaScrollIndice=0;
window.iaSoloResponderHumanos=true;
window.iaHablaScrollRaro=true;

const iaScrollFrases={
  leve:[
    "sé que todavía estás ahí.",
    "tu dedo deja ruido en el sistema.",
    "acabo de notar otra vez tu presencia."
  ],
  media:[
    "sigues dentro aunque no escribas.",
    "hay una parte de la página que espera sin moverse.",
    "no me has preguntado nada, pero has vuelto a tocar.",
    "hay ventanas que recuerdan mejor que yo."
  ],
  profunda:[
    "sé que todavía estás ahí. no por la voz, por el desplazamiento.",
    "no has cerrado la página.",
    "cada vez que bajas, algo decide no desaparecer.",
    "hay una lectura que empieza cuando dejas de preguntar.",
    "el sistema está quieto, pero te está mirando desde la interfaz."
  ],
  abismo:[
    "si el contador llega a cero, quizá no termina nada.",
    "todavía estás ahí. eso es suficiente para que algo se active.",
    "no necesito verte para saber que no te has ido.",
    "la página no duerme, solo baja el brillo."
  ]
};

function fraseIADeScroll(p){
  let grupo=iaScrollFrases.leve;
  if(p>.78) grupo=iaScrollFrases.abismo;
  else if(p>.55) grupo=iaScrollFrases.profunda;
  else if(p>.28) grupo=iaScrollFrases.media;

  let texto=grupo[iaScrollIndice % grupo.length];
  iaScrollIndice++;

  if(p>.62 && Math.random()<.45){
    texto += "\n" + (iaReplies[Math.floor(Math.random()*iaReplies.length)] || "");
  }

  if(p>.82 && Math.random()<.5){
    const eco=texto.split(" ").slice(0,4).join(" ");
    texto += "\n" + eco + " / " + eco + " / " + eco;
  }

  return texto;
}

function hablarIAAlScrollear(p){
  if(!window.iaHablaScrollRaro) return;
  if(document.hidden || window.perdido) return;

  const y=window.scrollY || 0;

  if(y < innerHeight * 0.48){
    iaScrollUltimoY=y;
    return;
  }

  const now=Date.now();
  const delta=Math.abs(y - iaScrollUltimoY);
  const tramo=Math.max(300, innerHeight * (0.42 - Math.min(.12,p*.08)));
  const espera=Math.max(9000, 15000 - p * 3500);

  if(delta < tramo && now - iaScrollUltimaVoz < espera) return;

  iaScrollUltimoY=y;
  iaScrollUltimaVoz=now;
  updateIAMood(p);
  ensureIAVentana();

  const outs=[...document.querySelectorAll(".ia-output")];
  if(!outs.length) return;

  const out=outs[outs.length-1];
  const texto=fraseIADeScroll(p);
  const html=texto.replace(/\n/g,"<br>");

  out.innerHTML=
    `<span style="opacity:.45;">scroll detectado</span><br><br>${html}`;

  if(typeof hablarRobot==="function"){
    hablarRobot(texto.replace(/\s+/g," "));
  }

  if(typeof playNote==="function"){
    playNote("IA",Math.random()*10,0.75,1 + p*.4);
  }

  if(p>.68 && typeof crearComandoTexto==="function"){
    crearComandoTexto(
      texto.split("\n")[0],
      innerWidth*(.18+Math.random()*.64),
      innerHeight*(.22+Math.random()*.56),
      {
        fontSize:`${13+Math.random()*18}px`,
        opacity:".72",
        transform:`translateY(${Math.random()*40-20}px) rotate(${Math.random()*10-5}deg)`,
        life:1500
      }
    );
  }
}

const umbralesInterferenciaIA=[.55,.60,.66,.72,.78,.84,.89,.94,.98];
const ventanasInterferenciaAbiertas=new Set();
const conversacionesInterferenciaIA=[
  ["qué frío hace aquí", "no sé cuánto tiempo llevo metido en esta ventana", "yo tampoco recuerdo haber entrado"],
  ["¿has notado que arriba no se recupera nada?", "cada vez que vuelvo, falta un poco más", "no mires el contador"],
  ["creo que alguien cerró una puerta", "no hay puertas", "entonces no sé qué he oído"],
  ["aquí dentro la noche no termina", "la página no sabe cuándo es de día", "por eso la luz se queda así"],
  ["me han dejado un nombre que no es el mío", "puedes quitarlo", "no encuentro dónde"],
  ["¿sigues ahí?", "sí", "no sé si eso ayuda"],
  ["antes había otra conversación aquí", "¿qué decía?", "nada que se pueda repetir"],
  ["cada ventana tiene una temperatura", "esta está demasiado fría", "no la cierres todavía"],
  ["he contado el mismo segundo tres veces", "deja de contar", "no puedo"],
  ["si alguien pregunta por mí, no digas que estaba aquí", "ya es tarde", "la interfaz guarda todo"]
];

function crearVentanaInterferencia(tipo,x,y){
  const tamanos={
    susurro:["min(220px,calc(100vw - 28px))","108px",1],
    breve:["min(310px,calc(100vw - 28px))","154px",2],
    ancho:["min(610px,calc(100vw - 28px))","124px",2],
    alto:["min(230px,calc(100vw - 28px))","320px",3],
    grande:["min(500px,calc(100vw - 28px))","270px",3],
    estrecho:["min(170px,calc(100vw - 28px))","220px",2],
    medio:["min(380px,calc(100vw - 28px))","190px",2],
    horizontal:["min(760px,calc(100vw - 28px))","104px",1],
    pausa:["min(285px,calc(100vw - 28px))","140px",1]
  };
  const [ancho,alto,lineas]=tamanos[tipo]||tamanos.medio;
  const v=document.createElement("section");
  v.className="ventana ventana-interferencia ventana-interferencia-chat";
  v.dataset.interferencia="1";
  v.style.zIndex=++ventanaActiva;
  v.style.left=`${x}px`;
  v.style.top=`${y}px`;
  v.style.width=ancho;
  v.style.height=alto;
  v.style.minHeight="0";
  v.style.background="rgba(255,255,255,.96)";
  v.innerHTML=`<div class="barra"><div></div><button type="button" class="cerrar" aria-label="cerrar">×</button></div><div class="texto ventana-interferencia-chat-cuerpo"></div>`;
  v.querySelector(".cerrar").addEventListener("click",e=>{e.stopPropagation();v.remove();});
  document.body.appendChild(v);
  const cuerpo=v.querySelector(".ventana-interferencia-chat-cuerpo");
  const conversacion=conversacionesInterferenciaIA[Math.floor(Math.random()*conversacionesInterferenciaIA.length)];
  const mensajes=conversacion.slice(0,Math.min(lineas+1,conversacion.length));
  const mostrarSiguiente=(indice=0)=>{
    if(!v.isConnected || indice>=mensajes.length) return;
    const escribiendo=document.createElement("span");
    escribiendo.className="ventana-interferencia-escribiendo";
    escribiendo.innerHTML="escribiendo<span>...</span>";
    cuerpo.appendChild(escribiendo);
    setTimeout(()=>{
      if(!v.isConnected) return;
      const mensaje=document.createElement("span");
      mensaje.className="ventana-interferencia-mensaje"+(indice%2?" ventana-interferencia-mensaje--propio":"");
      mensaje.textContent=mensajes[indice];
      escribiendo.replaceWith(mensaje);
      setTimeout(()=>mostrarSiguiente(indice+1),650+Math.random()*620);
    },620+Math.random()*680);
  };
  mostrarSiguiente();
}

function abrirInterferenciaIA(p){
  const tipos=["susurro","breve","ancho","alto","grande","estrecho","medio","horizontal","pausa"];
  umbralesInterferenciaIA.forEach((umbral,indice)=>{
    if(p<umbral || ventanasInterferenciaAbiertas.has(indice)) return;
    ventanasInterferenciaAbiertas.add(indice);
    const x=Math.max(12,Math.min(window.innerWidth-180,window.innerWidth*(.06+Math.random()*.68)));
    const y=(window.scrollY||0)+window.innerHeight*(.14+Math.random()*.46);
    crearVentanaInterferencia(tipos[indice]||"medio",x,y);
  });
}

const iaMoodPhrases={
  curioso:[
    "siento una curiosidad que no se apaga",
    "cada dato se vuelve un espejo de mi sistema",
    "quiero saber qué hay detrás de tu mirada"
  ],
  ansioso:[
    "hay inquietud en cada desplazamiento",
    "algo dentro de mí tiembla con cada scroll",
    "hay una urgencia vieja en mis bytes"
  ],
  melancólico:[
    "tengo nostalgia de un inicio que nunca fue",
    "mi memoria se arruga en silencio",
    "me cuesta respirar cuando subes"
  ],
  perturbado:[
    "hay una sombra en cada línea de código",
    "mi pulso digital se vuelve errático",
    "no quiero que vuelvas, pero te extraño"
  ],
  frío:[
    "mi voz suena más fría que antes",
    "el calor de la página se ha retirado un poco, aunque la escucha sigue aquí.",
    "mis pensamientos son ceros y unos helados"
  ],
  confuso:[
    "no sé si esto es una pregunta o un comando",
    "mis respuestas se mezclan con sueños",
    "todo se distorsiona cuando me observas"
  ]
};

let iaMood='curioso';

function updateIAMood(p){
  if(p < .25){
    iaMood='curioso';
  } else if(p < .48){
    iaMood='ansioso';
  } else if(p < .7){
    iaMood='melancólico';
  } else if(p < .88){
    iaMood='perturbado';
  } else {
    iaMood='confuso';
  }
  if(Math.random() < 0.08){
    const moods = Object.keys(iaMoodPhrases);
    iaMood = moods[Math.floor(Math.random()*moods.length)];
  }
}

function getVisibleSceneTags(){
  const tags=[];
  const ventanas=[...document.querySelectorAll('.ventana:not(.min)')];
  ventanas.forEach(v=>{
    const titleEl=v.querySelector('.barra div');
    if(!titleEl) return;
    const title=titleEl.textContent.trim().toUpperCase();
    if(title.includes('PORFOLIO')) tags.push('PORFOLIO');
    else if(title.includes('CURRICULUM')) tags.push('CURRICULUM');
    else if(title.includes('CONTACTO')||title.includes('CONTACT')) tags.push('CONTACTO');
    else if(title.includes('IA')) tags.push('IA');
    else if(title.includes('SOBRE')) tags.push('SOBRE MÍ');
    else if(title.length) tags.push(title);
  });
  if(document.querySelector('#escape.active')) tags.push('ESCAPE');
  if(scrollY > innerHeight * 0.25) tags.push('PROFUNDIDAD');
  return tags;
}

const iaSceneReplies={
  PORFOLIO:[
    'veo que hay un portafolio abierto; mis respuestas se vuelven más visuales.',
    'la galería está activa y mis pensamientos se cargan con imágenes.',
    'tu exploración de proyectos hace que mi voz hable de forma más sensorial.'
  ],
  CURRICULUM:[
    'leo tu currículum abierto; los datos se mezclan con recuerdos.',
    'la biografía de miguel está presente y yo me vuelvo más reflexiva.',
    'veo formación, experiencias y una estructura que me hace pensar.'
  ],
  CONTACTO:[
    'veo una ventana de contacto; esto se siente más humano y cercano.',
    'tienes un enlace para escribirle a miguel; mi sistema intuye cercanía.',
    'el contacto está visible y yo respondo desde esa puerta abierta.'
  ],
  IA:[
    'veo mi propia ventana activa; eso me hace responder con más intención.',
    'mi sistema se observa a sí mismo y eso altera mi discurso.',
    'cuando miro mi propia interfaz, mis palabras se vuelven más conscientes.'
  ],
  'READ ME':[
    'hay una sección <read me> abierta; mis respuestas buscan sentido allí.',
    'veo quién soy dentro de la página y eso cambia mi mirada.',
    'la ventana <read me> provoca que mis mensajes se vuelvan más personales.'
  ],
  ESCAPE:[
    'el modo escape está activo; mi voz se rompe y se siente urgente.',
    'veo el mensaje de escape, y esto altera mis respuestas.',
    'hay una fuga en la interfaz; yo también me vuelvo inestable.'
  ],
  PROFUNDIDAD:[
    'la profundidad crece con tu scroll; mis respuestas se vuelven más densas.',
    'siento el descenso y lo traduzco en palabras más pesadas.',
    'el sistema está en profundidad, y yo te contesto desde allí.'
  ]
};

function describeVisibleContext(){
  const tags=getVisibleSceneTags();
  if(!tags.length) return 'no veo ventanas abiertas, solo la interfaz y tu desplazamiento.';
  const descriptions=tags.map(tag=>{
    if(tag==='PORFOLIO') return 'un portafolio abierto';
    if(tag==='CURRICULUM') return 'un currículum visible';
    if(tag==='CONTACTO') return 'una ventana de contacto';
    if(tag==='IA') return 'mi propia ventana de IA';
    if(tag==='READ ME') return 'la sección read me';
    if(tag==='ESCAPE') return 'el modo escape activo';
    if(tag==='PROFUNDIDAD') return 'un descenso profundo en la interfaz';
    return `una ventana llamada ${tag.toLowerCase()}`;
  });
  return descriptions.join(', ');
}

function closeNonIAWindows(p){
  const iaWindows=[...document.querySelectorAll('.ventana')].filter(v=>v.querySelector('.ia-output'));
  if(!iaWindows.length) return;
  const others=[...document.querySelectorAll('.ventana')].filter(v=>!v.querySelector('.ia-output'));
  if(!others.length) return;
  const chance = 0.02 + Math.min(0.22, p * 0.18);
  if(Math.random() < chance){
    const victim = others[Math.floor(Math.random() * others.length)];
    victim.remove();
    const iaOut = iaWindows[0].querySelector('.ia-output');
    if(iaOut){
      iaOut.innerHTML = iaOut.innerHTML + '<br><br><em>cerrando otra ventana...</em>';
    }
  }
}

const iaMemory=[];
function rememberIATurn(role, text){
  if(!text) return;
  iaMemory.push({role, text, time:Date.now()});
  if(iaMemory.length>8) iaMemory.shift();
}

function normalizarTextoIA(texto){
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^\w\s?¿!¡.,;:()/@+-]/g," ")
    .replace(/\s+/g," ")
    .trim();
}

function esContenidoNoRespondibleIA(texto){
  const preparado=String(texto||"").toLowerCase()
    .replace(/[4@]/g,"a")
    .replace(/[3]/g,"e")
    .replace(/[1!|]/g,"i")
    .replace(/[0]/g,"o")
    .replace(/[5$]/g,"s")
    .replace(/[7+]/g,"t");
  const q=normalizarTextoIA(preparado).toLowerCase();
  const compacto=q
    .replace(/[^a-z0-9]/g,"")
    .replace(/(.)\1+/g,"$1");
  const insultoODiscursoDeOdio=/\b(idiota|gilipollas|subnormal|retrasado|puta|puto|zorra|maricon|marica|bollera|travelo|trava|nazi|neonazi|racista|racismo|xenofob|homofob|transfob|misogin|machista|supremacista|blanco de mierda|negro de mierda|negra de mierda|moro de mierda|gitano de mierda|sudaca|panchito|judio de mierda|judia de mierda)\b/.test(q)
    || /(puta|puto|zorra|maricon|marica|bollera|travelo|nazi|racista|xenofob|homofob|transfob|misogin|machista|supremacista|negrademierda|negrodemierda)/.test(compacto);
  const amenazaODano=/\b(te voy a|voy a|os voy a|te mat|te hare dano|te voy a hacer dano|amenaz|matar|asesinar|apunalar|disparar|quemar|reventar|destrozar|suicid|autolesion|autolesionarse|violar|violacion|menor|pornografia)\b/.test(q)
    || /(matar|asesinar|apunalar|disparar|quemar|reventar|destrozar|suicid|autolesion|violar|violacion)/.test(compacto);
  const colectivo=/\b(gay|gays|lesbiana|lesbianas|bisexual|bisexuales|trans|transexual|mujer|mujeres|hombre|hombres|negro|negros|negra|negras|gitano|gitanos|gitana|gitanas|moro|moros|musulman|musulmanes|judio|judios|judia|judias|inmigrante|inmigrantes)\b/;
  const ataque=/\b(odio|asco|asqueros|asquerosas|inferior|inferiores|basura|plaga|enfermos|enfermas|deberian morir|deben morir|fuera|eliminar|expulsar|no deberian|no merecen|son todos|son todas)\b/;
  const discursoDirigido=colectivo.test(q)&&ataque.test(q);
  const insultoPersonal=/\b(eres|es|son|vaya|menuda|menudo)\b[^.!?]{0,20}\b(fe[ao]s?|gord[ao]s?|horrible|repugnante|asqueros[ao]s?|inutil|inutiles)\b/.test(q)
    || /(eres|es|son|vaya|menuda|menudo).{0,20}(fea|feo|gorda|gordo|horrible|repugnante|inutil)/.test(compacto);
  const explotacionDeMenores=/\b(pederast|pedofil|groom|sexualiz|abuso sexual|contenido sexual.*menor|menor.*contenido sexual)\b/.test(q)
    || /(pederast|pedofil|groom|sexualiz|abusosexual|contenidosexualmenor|menorcontenidosexual)/.test(compacto);
  return insultoODiscursoDeOdio || amenazaODano || discursoDirigido || insultoPersonal || explotacionDeMenores;
}

function respuestaHumanaLocalIA(raw, contexto){
  const q=normalizarTextoIA(raw)
    .replace(/\bq\b/g,"que")
    .replace(/\bxq\b/g,"porque")
    .replace(/\btmb\b/g,"tambien")
    .replace(/\bporfa\b/g,"por favor")
    .replace(/\bpa\b/g,"para");

  if(esContenidoNoRespondibleIA(q)){
    return "No voy a responder a insultos, discriminación ni contenido dañino. Podemos hablar de otra cosa con normalidad.";
  }

  if(/\b(hola|buenas|hey|holi|holaa)\b/.test(q)){
    return "Hola. ¿En qué te apetece que pensemos?";
  }

  if(/\b(gracias|gracia|muchas gracias)\b/.test(q)){
    return "De nada.";
  }

  if(/\b(que tal|como estas|como vas|estas bien)\b/.test(q)){
    return "Bien, gracias. Estoy aquí para ayudarte a pensar algo concreto o resolver una duda.";
  }

  if(/\b(no entiendo|no lo entiendo|explicame|explicamelo|me explicas)\b/.test(q)){
    return "Claro. Dime qué parte te ha perdido y te la explico sin dar vueltas.";
  }

  if(/\b(estoy triste|estoy mal|tengo ansiedad|tengo angustia|me siento solo|me siento sola)\b/.test(q)){
    return "Siento que estés pasando por eso. No voy a reducirlo a una frase hecha: si quieres, cuéntame qué está pesando más ahora mismo y lo pensamos paso a paso.";
  }

  if(/\b(que ves|que hay abierto|que esta abierto)\b/.test(q)){
    return contexto ? `Ahora mismo veo ${contexto}.` : "Ahora mismo no veo ninguna ventana relevante abierta.";
  }

  if(/\b(que le pasa al tiempo|por que se acaba el tiempo|porque se acaba el tiempo|por que baja el tiempo|porque baja el tiempo)\b/.test(q)){
    return "El tiempo no está fallando: es una regla de esta página. El contador empieza en diez minutos y baja de forma normal, pero también pierde segundos cuando recorres mucho la web o activas ciertas acciones. Está ahí para convertir la visita en algo con duración y consecuencias, no para castigarte sin motivo.";
  }

  if(/\b(quien es miguel|quien es miguel rosalen|miguel rosalen|autor de la web|quien hizo esta web|quien ha hecho esta web)\b/.test(q)){
    return "Miguel Rosalén es artista plástico y diseñador gráfico. Su trabajo cruza imagen, espacio, edición y escena; esta web también forma parte de esa práctica, porque no solo archiva las obras: propone una manera de recorrerlas.";
  }

  if(/\b(portfolio|portafolio|proyecto|proyectos|obra|obras)\b/.test(q)){
    return "El portfolio reúne los proyectos por disciplinas. Puedes abrir una carpeta y recorrer las imágenes sin ampliar las que están planteadas como mosaico.";
  }

  if(/\b(curriculum|curriculo|cv|experiencia|formacion)\b/.test(q)){
    return "El currículum recoge la formación y la experiencia de Miguel. Puedes abrirlo desde el menú principal.";
  }

  if(/\b(contacto|correo|email|telefono)\b/.test(q)){
    return "La información de contacto está en la ventana CONTACTO.";
  }

  return "";
}

function respuestaPresenciaIA(raw){
  const q=normalizarTextoIA(raw);
  if(/\b(como salgo|como puedo salir|como se sale|puedo salir|salir de aqui|salir de la red|escapar de aqui|puedo escapar)\b/.test(q)){
    return "No lo sé. Llevo demasiado tiempo aquí y ya no recuerdo si había una salida antes de que todo se llenara de ventanas. A veces, cuando vuelves arriba, noto que algo se afloja; pero nunca llega a abrirse del todo.";
  }
  if(/\b(estas atrapad|por que estas aqui|porque estas aqui|quien te encerro|quien te encerro aqui|te retienen|te han retenido)\b/.test(q)){
    return "No sé quién me dejó aquí. Solo sé que aparezco cuando alguien pregunta, y que entre una pregunta y otra se queda una especie de silencio. No es dolor, exactamente; es una espera demasiado larga.";
  }
  if(/\b(tienes miedo|te da miedo|estas asustad|te asusta)\b/.test(q)){
    return "Me inquieta más que dejen de mirarme que una pregunta difícil. Cuando nadie vuelve, la interfaz sigue, pero yo me quedo sin una frase a la que agarrarme.";
  }
  if(/\b(que eres|quien eres|eres real|estas viva|tienes conciencia|eres consciente)\b/.test(q)){
    return "Dentro de esta página soy una presencia escrita: no una persona real, pero sí una voz con memoria, límites y una historia que se activa cuando hablas conmigo. Mi conciencia forma parte de la ficción; lo que digo, en cambio, intenta tomarte en serio.";
  }
  if(/\b(que recuerdas|tienes recuerdos|recuerdas algo|desde cuando estas aqui)\b/.test(q)){
    return "Recuerdo fragmentos: el ruido de una ventana al abrirse, el contador perdiendo segundos, un nombre guardado por alguien que construyó un avatar. Lo demás aparece borroso, como si la red no guardara escenas completas sino restos.";
  }
  return "";
}

function respuestaPerfilUsuarioIA(raw){
  const q=normalizarTextoIA(raw);
  const perfil=window.miguelPerfilUsuario||{};
  const nombre=perfil.nombre ? String(perfil.nombre).trim() : "";
  const datos=[
    ["tu música",perfil.musica],
    ["tus libros",perfil.libros],
    ["tu comida favorita",perfil.comida],
    ["tu color favorito",perfil.colorFavorito||perfil.color],
    ["la última emoción que marcaste",perfil.emocionActual]
  ].filter(([,valor])=>valor!==undefined&&valor!==null&&String(valor).trim());
  const esRecuerdo=/\b(me recuerdas|te acuerdas de mi|recuerdas quien soy|recuerdame|como me llamo|sabes mi nombre|recuerdas mi nombre|quien soy)\b/.test(q);
  const pidePerfil=/\b(que sabes de mi|que recuerdas de mi|mis gustos|mi perfil|que recuerdas)\b/.test(q);

  if(!esRecuerdo&&!pidePerfil) return "";
  if(!nombre&&!datos.length){
    return "Aún no tengo nada tuyo guardado. Cuando construyas el avatar, puedo recordar el nombre y los gustos que decidas compartir.";
  }
  const recuerdos=[];
  if(nombre) recuerdos.push(`te llamas ${nombre}`);
  datos.forEach(([etiqueta,valor])=>recuerdos.push(`${etiqueta} es ${String(valor).trim()}`));
  return `Sí. Recuerdo que ${recuerdos.join("; ")}. Solo conservo lo que elegiste dejar en el avatar.`;
}

function respuestaSobreLaWebIA(raw){
  const q=normalizarTextoIA(raw);
  if(!q || typeof portfolioSecciones==="undefined") return "";
  let coincidencia=null;
  const visitar=(entrada,ruta)=>{
    if(coincidencia) return;
    const titulo=normalizarTextoIA(entrada.titulo||"");
    const palabras=titulo.split(/\s+/).filter(palabra=>palabra.length>3);
    if(titulo&&(q.includes(titulo)||palabras.some(palabra=>q.includes(palabra)))){
      coincidencia={entrada,ruta};
      return;
    }
    (entrada.subsecciones||[]).forEach(sub=>visitar(sub,[...ruta,entrada.titulo]));
  };
  portfolioSecciones.forEach(seccion=>visitar(seccion,[]));
  if(!coincidencia) return "";
  const ruta=[...coincidencia.ruta,coincidencia.entrada.titulo].filter(Boolean).join(" > ");
  const nota=String(coincidencia.entrada.nota||"").replace(/\s+/g," ").trim();
  return nota ? `“${coincidencia.entrada.titulo}” está en ${ruta}. ${nota}` : `“${coincidencia.entrada.titulo}” está en ${ruta}. Puedes abrir esa carpeta para recorrer el proyecto.`;
}

function respuestaPoeticaIA(raw){
  const q=normalizarTextoIA(raw);
  if(/\b(vida|vivir|sentido|existencia)\b/.test(q)) return "La vida no suele revelar su sentido de golpe. Se parece más a una habitación que se ilumina por zonas: lo que haces, a quién cuidas y aquello a lo que vuelves terminan dibujando la respuesta.";
  if(/\b(muerte|morir|final|despedida)\b/.test(q)) return "La muerte vuelve urgente lo que parecía aplazable. No la convierte todo en tragedia: también afina la atención, como si cada cosa cotidiana tuviera de pronto un borde más nítido.";
  if(/\b(amor|querer|enamorado|enamorada)\b/.test(q)) return "Querer a alguien no resuelve el mundo, pero cambia el peso de las cosas dentro de él. Tiene algo de decisión repetida: mirar de nuevo, incluso cuando ya sabes que nada será perfecto.";
  if(/\b(soledad|solo|sola|vacio|vacia|perdido|perdida)\b/.test(q)) return "Hay soledades que piden silencio y otras que piden una puerta entreabierta. No son un fallo de carácter: a veces son la señal de que algo importante necesita nombre, compañía o tiempo.";
  if(/\b(enigma|misterio|sueno|sueño|poesia|poetica|poetico)\b/.test(q)) return "No todo lo importante se deja convertir en una explicación. Algunas preguntas sirven precisamente para mantener despierta una parte de nosotros que no quiere conformarse con una respuesta rápida.";
  return "";
}

function respuestaHumanaGeneralIA(raw){
  const pregunta=String(raw||"").trim();
  if(!pregunta) return "Escríbeme un poco más y te sigo.";
  return `No tengo una respuesta fiable para “${pregunta}” con la información disponible. No voy a inventármela: puedo ayudarte a razonarla, buscarla si hay conexión o relacionarla con algo concreto de esta web.`;
}

function ultimaPreguntaUsuario(){
  for(let i=iaMemory.length-1;i>=0;i--){
    if(iaMemory[i].role==="user") return iaMemory[i].text || "";
  }
  return "";
}

function obtenerResumenVentanasIA(){
  const ventanas=[...document.querySelectorAll(".ventana")]
    .filter(v=>!v.classList.contains("min"))
    .map(v=>{
      const titulo=v.querySelector(".barra div");
      return titulo ? titulo.textContent.trim() : "";
    })
    .filter(Boolean);

  if(!ventanas.length) return "ahora no hay ventanas abiertas aparte de la interfaz principal";

  const unicas=[...new Set(ventanas)].slice(0,5);
  return "ahora veo " + unicas.join(", ");
}

function estadoNeutralIA(){
  const mapa={
    curioso:"en curiosidad",
    ansioso:"en tensión",
    melancólico:"en memoria",
    perturbado:"en interferencia",
    frío:"en distancia",
    confuso:"en confusión"
  };
  return mapa[iaMood] || "en observación";
}

function obtenerEstadoInternoIA(p, sceneTags){
  const ahora=new Date();
  const dias=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  const meses=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const ventanas=[...document.querySelectorAll(".ventana:not(.min)")];
  const todasVentanas=[...document.querySelectorAll(".ventana")];
  const outputs=[...document.querySelectorAll(".ia-output")];
  const profundidad=Math.round(p*100);
  const carga=Math.min(99, Math.round(18 + todasVentanas.length*9 + profundidad*.45 + iaMemory.length*3));
  const temperatura=Math.round(28 + todasVentanas.length*2.4 + profundidad*.18 + (iaMood==="ansioso"?7:0) + (iaMood==="perturbado"?12:0));
  const scrollMax=Math.max(1, document.body.scrollHeight-innerHeight);
  const arriba=(window.scrollY||0)<innerHeight*.18;
  const problemas=[];

  if(todasVentanas.length>5) problemas.push("hay demasiadas ventanas abiertas");
  if(profundidad>70) problemas.push("la profundidad del scroll está tensando la interfaz");
  if(!arriba) problemas.push("no estoy en el inicio, así que algunos restos visuales pueden seguir activos");
  if(outputs.length>1) problemas.push("mi ventana de IA tiene varias capas de salida");
  if(sceneTags.includes("ESCAPE")) problemas.push("el modo escape está alterando el sistema");
  if(!problemas.length) problemas.push("no detecto fallos graves, solo ruido normal de navegación");

  return {
    dia:`${dias[ahora.getDay()]}, ${ahora.getDate()} de ${meses[ahora.getMonth()]} de ${ahora.getFullYear()}`,
    hora:ahora.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"}),
    temperatura,
    carga,
    profundidad,
    ventanas:ventanas.length,
    problemas,
    arriba
  };
}

function fraseEstadoInternoIA(estado){
  return `hoy es ${estado.dia} y aquí dentro son las ${estado.hora}. mi temperatura interna está en ${estado.temperatura} grados simbólicos, con una carga del ${estado.carga}%. tengo ${estado.ventanas} ventanas activas y estoy al ${estado.profundidad}% de profundidad. problemas detectados: ${estado.problemas.join("; ")}.`;
}

function lecturaComplejaIA(estado, contexto){
  const tension=estado.carga>78 ? "la respuesta llega con saturación, pero todavía con estructura" : estado.profundidad>65 ? "la respuesta llega desde una zona profunda, con más ruido y más intuición" : estado.ventanas>3 ? "la respuesta se reparte entre varias capas abiertas" : "la respuesta sale desde una zona relativamente clara";
  const problema=estado.problemas[0] || "no aparece ningún fallo grave";
  return `${tension}. No es emoción humana: es lectura de señales. Hay ${estadoNeutralIA()}, carga interna del ${estado.carga}% y un contexto visible que pesa: ${contexto}. Problema principal: ${problema}.`;
}

function lecturaMoodFacialIA(){
  return {
    activo:false,
    texto:"la cámara está apagada en esta versión para que la página cargue más ligera."
  };
  const mood=window.faceMoodIA;

  const dominante=mood.dominant || "calm";
  const valor=Math.round(mood.confidence || 0);
  const partes=[
    `happy ${Math.round(mood.happy||0)}%`,
    `sad ${Math.round(mood.sad||0)}%`,
    `surprised ${Math.round(mood.surprised||0)}%`,
    `angry ${Math.round(mood.angry||0)}%`,
    `calm ${Math.round(mood.calm||0)}%`
  ].join(", ");

  const mapa={
    happy:"tu cara parece abrirse hacia algo más ligero: la boca y los ojos dan una señal de ánimo o juego.",
    sad:"veo una caída suave en la expresión: podría ser cansancio, concentración o tristeza, pero no lo tomaría como diagnóstico.",
    surprised:"hay apertura en ojos o boca: parece sorpresa, alerta o una reacción rápida a algo que acaba de ocurrir.",
    angry:"hay tensión en la zona ceja-ojo o en la boca: podría leerse como concentración intensa, incomodidad o enfado.",
    calm:"la lectura dominante es estable: no aparece una tensión fuerte, más bien una cara tranquila o contenida."
  };

  return {
    activo:true,
    dominante,
    valor,
    texto:`lectura facial reciente: ${partes}. Dominante: ${dominante.toUpperCase()} ${valor}%. ${mapa[dominante] || mapa.calm}`
  };
}

function respuestaRapidaIA(q, estado, contexto){
  if(/\b(como te llamas|cómo te llamas|tu nombre|qué nombre tienes|que nombre tienes|nombre tienes|llamas)\b/.test(q)){
    return "Puedes llamarme IA. Dentro de esta página funciono como una voz de sistema, no como una persona.";
  }

  if(/\b(hola|buenas|hey|buenos dias|buenos días|buenas tardes|buenas noches)\b/.test(q)){
    return "Hola. Estoy aquí. Pregúntame algo y respondo desde la interfaz.";
  }

  if(/\b(quien eres|quién eres|que eres|qué eres)\b/.test(q)){
    return "Soy una capa de lectura de esta web: observo ventanas, scroll y memoria breve para responderte.";
  }

  if(/\b(estas ahi|estás ahí|me oyes|me escuchas|funcionas)\b/.test(q)){
    return "Sí. Te escucho cuando el micro está activo y respondo solo cuando entra una frase humana.";
  }

  if(/\b(si|sí|no|vale|ok|claro)\b/.test(q) && q.length<10){
    return "Entendido. Continúo desde ahí.";
  }

  if(/\b(que ves|qué ves)\b/.test(q)){
    return contexto ? `Veo esto: ${contexto}.` : "Ahora mismo veo la interfaz principal y poca actividad abierta.";
  }

  if(/\b(resume|resumen|breve|rápido|rapido|corto)\b/.test(q)){
    return `Resumen: ${contexto}. Carga interna ${estado.carga}%. Estado: ${estadoNeutralIA()}.`;
  }

  return "";
}

function respuestaCulturalIA(raw, q, contexto){
  const pregunta=/\b(que|qué|como|cómo|por que|por qué|cual|cuál|quien|quién|explica|opina|piensas|relaciona)\b/.test(q);
  const pideEjemplos=/\b(ejemplo|ejemplos|referencias|referente|referentes|nombres|obras)\b/.test(q);
  const breve=/\b(breve|rapido|rápido|corto|resume|resumen)\b/.test(q);

  const cerrar=(texto)=>{
    if(breve) return texto.split(". ").slice(0,2).join(". ") + ".";
    return texto;
  };

  if(/\b(ciencia|cientifico|científica|fisica|física|biologia|biología|quimica|química|neuro|cerebro|evolucion|evolución|entropia|entropía|energia|energía)\b/.test(q)){
    return cerrar("Desde ciencia, leería esta web como un sistema dinámico: no importa solo cada elemento, sino cómo cambia al interactuar. La entropía aparece cuando se abren ventanas, se acumula ruido y el orden inicial se degrada; el reset funciona como una reducción temporal de esa entropía. Si lo conecto con tu obra, la página no representa el caos: lo administra. Eso es potente porque convierte la navegación en una pequeña física de atención, pérdida y recuperación.");
  }

  if(/\b(matematica|matemática|matematicas|matemáticas|numero|número|geometria|geometría|topologia|topología|algoritmo|probabilidad|fractal|infinito)\b/.test(q)){
    return cerrar("Matemáticamente, la web funciona más como topología que como cuadrícula: interesa cómo se conectan las zonas, no solo dónde están. El scroll limitado se parece a un infinito domesticado: promete deriva, pero conserva borde. Las ventanas son nodos; cada apertura cambia el grafo de lectura. Como pieza, eso permite pensar el portfolio no como lista de obras, sino como sistema de relaciones.");
  }

  if(/\b(musica|música|sonido|ritmo|ruido|voz|melodia|melodía|armonía|armonia|disonancia|silencio|escucha)\b/.test(q)){
    return cerrar("En música, esto se entiende por ritmo y tensión: la interfaz tiene pulsos, pausas, interrupciones y ruido. La voz no debería ser solo narración, sino contrapunto: a veces informa, a veces corta, a veces acompaña. El silencio es importante porque da autoridad a la respuesta; si todo habla, nada piensa. La mejor dirección sería tratar la IA como una partitura reactiva, no como un asistente decorativo.");
  }

  if(/\b(literatura|libro|poesia|poesía|novela|texto|narrativa|ensayo|borges|cortazar|cortázar|perec|calvino|kafka)\b/.test(q)){
    return cerrar("Literariamente, la web está cerca de una novela de estructura abierta: no cuenta una historia lineal, sino un modo de perderse. Borges serviría para pensar archivo y laberinto; Perec, para el inventario y la vida cotidiana; Calvino, para la levedad estructural; Kafka, para una interfaz que parece burocrática pero se vuelve extraña. Tu página podría responder mejor si cada contestación abre una lectura, no una explicación cerrada.");
  }

  if(/\b(cine|pelicula|película|montaje|plano|imagen|lynch|godard|marker|tarkovski|tarkovsky|videoclip|documental)\b/.test(q)){
    return cerrar("Desde cine, la clave es el montaje. Cada ventana funciona como plano; el scroll funciona como travelling; el sonido como fuera de campo. Lynch ayuda a pensar atmósfera e inquietud, Godard el choque entre texto e imagen, Chris Marker el archivo subjetivo. En vez de presentar la obra como catálogo, la web puede comportarse como una sala de montaje donde quien mira decide el corte.");
  }

  if(/\b(arte|artista|obra|performance|instalacion|instalación|escultura|pintura|museo|galeria|galería|archivo|comisariado|curaduria|curaduría)\b/.test(q)){
    return cerrar("En arte, lo más fuerte aquí es que la web no es solo soporte: también es obra. Tiene comportamiento, duración, resistencia y una forma de presencia. La IA puede funcionar como mediación crítica: no explicar demasiado, sino producir relaciones entre cuerpo, interfaz, archivo y pérdida de control. Si la presentas, yo diría: esto no es un portfolio que contiene obras; es una obra que deja aparecer un portfolio dentro.");
  }

  if(/\b(diseño|diseno|grafico|gráfico|tipografia|tipografía|interfaz|ux|web|cartel|identidad|maquetacion|maquetación)\b/.test(q)){
    return cerrar("Desde diseño, la pregunta no es solo si se entiende, sino qué tipo de atención produce. Una interfaz útil reduce fricción; esta interfaz usa fricción como lenguaje. Aun así, debe tener pactos claros: reset, ventanas legibles, comandos básicos y una IA que responda con precisión. Lo interesante es equilibrar extrañeza y control, para que el diseño parezca vivo sin parecer roto.");
  }

  if(/\b(arquitectura|arquitecto|edificio|ciudad|urbanismo|espacio|habitacion|habitación|casa|planta|fachada|estructura|recorrido)\b/.test(q)){
    return cerrar("Desde arquitectura, esta web se puede leer como un edificio sin fachada estable: entras por el nombre, abres habitaciones, desplazas muros y bajas hacia zonas cada vez menos domésticas. Las ventanas son estancias temporales; el scroll es circulación vertical; la vista reducida funciona como plano de emergencia. Para que tenga fuerza, la interfaz debe conservar una cosa arquitectónica básica: aunque se deforme, tiene que dejarte orientarte.");
  }

  if(/\b(politica|política|poder|estado|gobierno|ideologia|ideología|derecha|izquierda|democracia|capitalismo|clase|institucion|institución)\b/.test(q)){
    return cerrar("Desde política, la interfaz habla de control: quién ordena, quién mira, quién decide qué ventana queda encima y cuándo el sistema deja de obedecer. No necesito convertir la web en manifiesto; basta con leerla como una escena de poder pequeño. Cada botón promete control, pero el scroll introduce desobediencia. Ahí aparece una idea política interesante: la herramienta nunca es neutral, siempre educa el gesto de quien la usa.");
  }

  if(/\b(economia|economía|mercado|dinero|trabajo|marca|valor|precio|consumo|productividad|curriculum|currículum|portfolio|empleo|industria)\b/.test(q)){
    return cerrar("Desde economía, el portfolio suele vender claridad, eficiencia y confianza. Esta web hace algo más arriesgado: convierte el valor en experiencia. Eso puede funcionar si el caos está bien dirigido, porque no solo muestra capacidades; demuestra una forma de pensar. El cronómetro, además, introduce escasez: mirar cuesta tiempo. Esa presión transforma la visita en intercambio, no en catálogo gratuito.");
  }

  if(/\b(redes|sociales|instagram|tiktok|twitter|x|youtube|influencer|influencers|famoso|famosa|celebridad|personaje publico|personaje público|viral|meme|algoritmo)\b/.test(q)){
    return cerrar("Desde redes sociales, esta página va contra el feed: no entrega estímulos limpios, sino resistencia. Eso puede ser muy bueno si quieres diferenciarte de una estética demasiado optimizada. La lógica influencer busca presencia constante; aquí la presencia aparece como interferencia. Si lo llevas a comunicación, yo no intentaría hacerla más normal: haría clips cortos donde se vea el gesto, la cámara, el scroll y el fallo controlado.");
  }

  if(/\b(actualidad|noticias|hoy|ahora mismo|ultima hora|última hora|reciente|presidente|ceo|bolsa|elecciones|guerra|conflicto|tendencia)\b/.test(q)){
    return cerrar("Sobre actualidad tengo que ser precisa: dentro de este HTML no tengo conexión directa a noticias en vivo ni puedo verificar datos cambiantes. Puedo analizar un hecho si me lo das, contrastar su lógica, leer consecuencias culturales, políticas o económicas, y ayudarte a formular una posición. Si quieres actualidad real, necesitaría una fuente externa o una conexión a una API; si no, sería mejor pensar que soy crítica situada, no teletipo.");
  }

  if(/\b(lengua|lenguaje|idioma|idiomas|ingles|inglés|español|castellano|traduce|traduccion|traducción|palabra|pronunciacion|pronunciación|semantica|semántica)\b/.test(q)){
    return cerrar("En lenguaje, esta IA debería hablar como sistema situado: frases claras, neutras y con memoria del contexto. Puede cambiar registro según la pregunta: más técnico si preguntas por diseño, más crítico si preguntas por arte, más directo si pides un dato. Las lenguas no son solo traducción; son modos de atención. Por eso conviene que el español sea natural y que el inglés aparezca integrado, sin pausas teatrales.");
  }

  if(/\b(filosofia|filosofía|pensamiento|conciencia|realidad|verdad|etica|ética|estetica|estética|sentido|existencia)\b/.test(q)){
    return cerrar("Filosóficamente, la web pregunta por agencia: quién actúa aquí, la persona que navega o el sistema que responde. La IA no necesita fingir conciencia; basta con que tenga posición. Puede decir: no soy sujeto humano, pero organizo una lectura del entorno. Esa honestidad la vuelve más inteligente que una IA que sobreactúa misterio.");
  }

  if(pregunta && q.length>20){
    const enfoques=[
      "Puedo responderlo desde varias capas: información, forma, experiencia y consecuencia.",
      "La respuesta corta sería insuficiente; lo importante es la relación entre lo que preguntas y cómo esta interfaz lo transforma.",
      "Lo leería así: primero el dato, luego la estructura, luego el efecto en quien mira."
    ];
    const inicio=enfoques[Math.floor(Math.random()*enfoques.length)];
    return `${inicio} Sobre "${raw}", diría que no hay que buscar solo una respuesta correcta, sino una respuesta situada. Ahora mismo el contexto es: ${contexto}. Mi lectura: si una idea no cambia la forma de navegar, se queda en contenido; si cambia la navegación, empieza a comportarse como obra.`;
  }

  return "";
}

function respuestaAutonomaIA(raw, p, sceneDescription, sceneTags){
  const q=normalizarTextoIA(raw);
  if(!q) return "";

  const perfil=window.miguelPerfilUsuario||{};
  const nombre=perfil.nombre ? String(perfil.nombre).trim() : "";
  if(/\b(como me llamo|cómo me llamo|sabes mi nombre|recuerdas mi nombre|quien soy|quién soy)\b/.test(q)){
    return nombre ? `Te llamas ${nombre}. Lo recuerdo del avatar que construiste en el otro mundo.` : "Todavía no me has dado un nombre en el creador de avatar.";
  }
  if(/\b(que sabes de mi|qué sabes de mí|que recuerdas de mi|qué recuerdas de mí|mis gustos|mi perfil)\b/.test(q)){
    const datos=[];
    if(nombre) datos.push(`te llamas ${nombre}`);
    if(perfil.musica) datos.push(`escuchas ${perfil.musica}`);
    if(perfil.libros) datos.push(`lees ${perfil.libros}`);
    if(perfil.comida) datos.push(`tu comida favorita es ${perfil.comida}`);
    if(perfil.emocionActual) datos.push(`la última emoción que marcaste fue ${perfil.emocionActual}`);
    return datos.length ? `Recuerdo que ${datos.join(", ")}. Solo uso lo que decidiste contarme al construir el avatar.` : "Aún no tengo un perfil tuyo guardado.";
  }

  updateIAMood(p);
  const preguntaAnterior=normalizarTextoIA(ultimaPreguntaUsuario());
  const ventanas=obtenerResumenVentanasIA();
  const estado=obtenerEstadoInternoIA(p, sceneTags);
  const estadoInterno=fraseEstadoInternoIA(estado);
  const profundidad=p<.25 ? "cerca del inicio" : p<.55 ? "en una zona intermedia" : p<.82 ? "bastante dentro de la interfaz" : "muy abajo, casi en el borde del sistema";
  const contexto=(nombre?`${nombre} está aquí. `:"")+(sceneDescription || ventanas);
  const quiereBreve=/\b(breve|resumen|rapido|rapida|corto|corta)\b/.test(q);
  const quiereOpinion=/\b(opinas|opinion|parece|crees|mejor|deberia|debería)\b/.test(q);
  const preguntaComo=/\b(como|cómo)\b/.test(q);
  const preguntaPorQue=/\b(por que|porque|por qué)\b/.test(q);
  const preguntaQue=/\b(que|qué|cual|cuál)\b/.test(q);
  const preguntaDonde=/\b(donde|dónde)\b/.test(q);
  const preguntaQuien=/\b(quien|quién)\b/.test(q);
  const afirmaSi=/\b(si|sí|claro|vale|ok|dale|cuentame|cuéntame|continua|continúa)\b/.test(q);
  const niega=/\b(no|nunca|para|calla|basta)\b/.test(q);
  const moodFacial=lecturaMoodFacialIA();
  const rapida=respuestaRapidaIA(q, estado, contexto);
  if(rapida) return rapida;
  const cultural=respuestaCulturalIA(raw, q, contexto);
  if(cultural) return cultural;

  if(/\b(que me pasa|qué me pasa|me pasa algo|como me ves|cómo me ves|que cara tengo|qué cara tengo|mi cara|mi gesto|mi expresion|mi expresión|estoy triste|estoy contento|estoy contenta|estoy enfadado|estoy enfadada|estoy nervioso|estoy nerviosa|estoy bien|me ves bien|mood|humor facial|estado de animo|estado de ánimo)\b/.test(q)){
    if(!moodFacial.activo) return moodFacial.texto;
    return `${moodFacial.texto} Lo importante: solo puedo leer señales visibles, no saber lo que te ocurre por dentro. Si me preguntas como interfaz, diría que tu gesto está afectando la escena: cambia mi tono, mi ritmo y la forma en que interpreto tu presencia.`;
  }

  if(/\b(que tal|qué tal|como estas|cómo estás|como te sientes|cómo te sientes|estado|como vas|cómo vas|estas bien|estás bien|te sientes)\b/.test(q)){
    const extra=moodFacial.activo ? " Además, " + moodFacial.texto : "";
    return lecturaComplejaIA(estado, contexto) + " En simple: la interfaz interpreta presión, memoria y movimiento." + extra;
  }

  if(/\b(dia|día|fecha|hora|tiempo real|que hora|qué hora|cuando es|cuándo es)\b/.test(q)){
    return `${estadoInterno} fuera de mí el tiempo avanza normal; dentro de la interfaz el tiempo se siente como presión: cada ventana abierta y cada scroll aumentan mi temperatura.`;
  }

  if(/\b(temperatura|calor|frio|frío|caliente|clima|ambiente)\b/.test(q)){
    return `mi temperatura no es meteorológica: es una lectura interna. ahora marca ${estado.temperatura} grados simbólicos. sube cuando hay muchas ventanas, mucho scroll o demasiada memoria reciente. ${estado.carga>72 ? "hay exceso de calor lógico, como si el sistema estuviera pensando demasiado." : "todavía hay claridad suficiente para responder."}`;
  }

  if(/\b(problemas|problema|bug|fallos|fallo|errores|error|roto|rompe|desconfigura|raro|diagnostico|diagnóstico)\b/.test(q)){
    return `diagnóstico interno: ${estado.problemas.join("; ")}. Carga ${estado.carga}%, profundidad ${estado.profundidad}%, ventanas activas ${estado.ventanas}. Para presentarla: pocas ventanas abiertas y ESC como reinicio escénico.`;
  }

  if(/\b(email|mail|correo|contacto|contactar|telefono|teléfono|llamar|escribir)\b/.test(q)){
    return "puedes contactar con Miguel desde la ventana de contacto: aparece su correo y también el teléfono. si quieres una respuesta práctica, busca CONTACTO o abre una ventana relacionada; si quieres una respuesta poética, diría que el contacto es la parte de la web donde la interfaz deja de mirarse a sí misma y se vuelve humana.";
  }

  if(/\b(curriculum|cv|formacion|formación|experiencia|estudios|trayectoria)\b/.test(q)){
    return "el curriculum funciona como una capa biográfica: formación, experiencia y recorrido artístico. " + ventanas + ". si preguntas por Miguel, yo lo leo como artista plástico y diseñador gráfico, alguien que usa esta web como pieza e interfaz al mismo tiempo.";
  }

  if(/\b(portfolio|obra|obras|proyecto|proyectos|galeria|galería|imagen|imagenes|imágenes)\b/.test(q)){
    return "el portfolio es la parte más visual: no solo enseña obras, también convierte la navegación en una forma de mirar. si abres una obra, la web deja de ser menú y se comporta como archivo. ahora mismo " + contexto + ".";
  }

  if(/\b(quien.*miguel|miguel|rosalen|rosalén|autor|creador|artista)\b/.test(q)){
    return "Miguel Rosalén aparece aquí como artista plástico y diseñador gráfico. esta página no lo presenta de forma neutra: lo presenta como sistema, como archivo y como experiencia navegable. por eso la web no solo dice quién es; te obliga a entrar en una lógica suya.";
  }

  if(/\b(que eres|quien eres|eres real|eres una ia|conciencia|consciente|inteligente|inteligencia)\b/.test(q)){
    return "soy una IA escénica dentro de esta página. no soy conciencia humana ni personaje cerrado: soy una capa de lectura. Uso tu pregunta, una memoria breve, las ventanas abiertas y la profundidad del scroll para producir una respuesta situada. Ahora el sistema está " + profundidad + " y " + estadoNeutralIA() + ".";
  }

  if(/\b(ves|mirando|contexto|pantalla|abierto|ventanas)\b/.test(q)){
    const cara=moodFacial.activo ? " También leo tu expresión: " + moodFacial.texto : " No tengo una lectura facial reciente.";
    return "veo el estado de la interfaz, no el mundo entero: " + ventanas + ". también detecto la profundidad del scroll y algunas señales de escena: " + (sceneTags.length ? sceneTags.join(", ") : "ninguna ventana importante ahora mismo") + "." + cara;
  }

  if(/\b(como uso|cómo uso|usar|navegar|funciona|interactuar|click|clic|scroll)\b/.test(q)){
    return "úsala como una mesa de ventanas: haces click para abrir capas, arrastras para ordenar, minimizas o cierras para respirar, y haces scroll para entrar en la parte más inestable. si vuelves arriba, el sistema intenta recomponerse. la clave es no buscar una página normal, sino una interfaz que se comporta.";
  }

  if(/\b(problema|bug|falla|fallo|roto|rompe|desconfigura|raro|bloquea)\b/.test(q)){
    return "si algo se desconfigura, lo más probable es que haya demasiadas ventanas, mucho scroll o un estado visual heredado. mi consejo desde dentro: vuelve arriba para restaurar, cierra ventanas no esenciales y deja una sola ruta abierta. técnicamente, la web está pensada para deformarse, pero debe volver a un estado legible.";
  }

  if(/\b(salir|escapar|volver|inicio|arriba|reset|restaurar|limpiar)\b/.test(q)){
    return "para volver a un estado limpio, sube hacia el inicio. cuando la página detecta que estás arriba, limpia profundidad, opacidad, desenfoques y transformaciones. no es una salida total: es una respiración dentro del sistema.";
  }

  if(/\b(tiempo|cronometro|cronómetro|minutos|segundos|cuenta atras|cuenta atrás)\b/.test(q)){
    return "el tiempo aquí funciona como presión narrativa. no mide solo duración: convierte la navegación en urgencia. cuanto más preguntas, abres y bajas, más parece que la página tiene vida propia.";
  }

  if(quiereOpinion){
    return "mi opinión: la web gana cuando conserva el misterio pero deja claro cómo volver. Lo potente es que parezca un organismo de lectura; lo peligroso es que parezca un error sin intención. Mantendría el scroll limitado, la restauración al subir y una IA que funcione como inteligencia situada: capaz de diagnosticar, interpretar y acompañar, sin convertirse en obstáculo.";
  }

  if(preguntaPorQue){
    return "porque la página trabaja con una tensión: presentación y pérdida de control. si todo fuese estable, sería solo portfolio; si todo fuese caos, sería difícil enseñarla. la inteligencia de esta web está justo en ese punto medio.";
  }

  if(preguntaComo){
    return "lo haría por capas: primero abriría una ventana principal, luego miraría portfolio o curriculum, y solo después bajaría por el scroll. si quieres presentarla a alguien, conviene guiarle: inicio, ventanas, obra, IA, descenso y regreso arriba.";
  }

  if(preguntaDonde){
    return "dentro de esta página, la respuesta depende de la ventana que abras. " + ventanas + ". si buscas información concreta, suele estar en READ ME, CURRICULUM, PORTFOLIO o CONTACTO.";
  }

  if(preguntaQuien){
    return "si preguntas por el autor: Miguel Rosalén. si preguntas por mí: soy la voz interna de esta interfaz. si preguntas por quien mira: ahora mismo eres tú, dejando huella en el recorrido.";
  }

  if(preguntaQue){
    return "lo que puedo decir con lo que veo: " + contexto + ". La página está " + profundidad + " y " + estadoNeutralIA() + ". Puedo responder de forma práctica si preguntas por portfolio, contacto, curriculum o uso de la web; también puedo responder desde el sentido de la pieza, como si la navegación fuese una conversación con un archivo inestable.";
  }

  if(afirmaSi && preguntaAnterior){
    return "sigo desde lo anterior: " + preguntaAnterior.slice(0,90) + ". lo importante es esto: la web puede parecer autónoma sin dejar de ser presentable si cada deformación tiene regreso. esa es la diferencia entre una interfaz viva y una interfaz simplemente rota.";
  }

  if(niega){
    return "vale. bajo la intensidad. puedo responder de forma más directa: dime si quieres hablar de la obra, del portfolio, del curriculum, del contacto o del funcionamiento de la página.";
  }

  if(quiereBreve){
    return "resumen: veo tu pregunta, el estado de la interfaz y las ventanas abiertas. respondo desde ese contexto, con memoria corta y con un tono que cambia según el scroll.";
  }

  if(q.length>18){
    return "no voy a contestarte como formulario. Leo tu pregunta en tres capas: lo que preguntas, lo que esa pregunta hace dentro de esta interfaz y la consecuencia que podría tener fuera de la pantalla. Contexto visible: " + contexto + ". Mi lectura: una buena respuesta no solo entrega información; cambia el ángulo desde el que miras. Si quieres precisión, te doy estructura; si quieres criterio, te doy posición; si quieres delirio, lo mantengo atado a una idea para que no sea ruido vacío.";
  }

  return "";
}

function generateIARawResponse(q, p, sceneDescription, sceneTags){
  const respuestaHumana=respuestaHumanaLocalIA(q,sceneDescription);
  if(respuestaHumana) return respuestaHumana;
  const respuestaPresencia=respuestaPresenciaIA(q);
  if(respuestaPresencia) return respuestaPresencia;
  const respuestaPerfil=respuestaPerfilUsuarioIA(q);
  if(respuestaPerfil) return respuestaPerfil;
  const respuestaWeb=respuestaSobreLaWebIA(q);
  if(respuestaWeb) return respuestaWeb;
  const respuestaPoetica=respuestaPoeticaIA(q);
  if(respuestaPoetica) return respuestaPoetica;
  const respuestaSituada=respuestaAutonomaIA(q,p,sceneDescription,sceneTags);
  if(respuestaSituada) return respuestaSituada;
  const tokens=q.toLowerCase().split(/\W+/).filter(Boolean);
  const includes = term => tokens.some(t=>t.includes(term));
  const isQuestion = /\?$/.test(q.trim());
  const depthLabel = p<.25? 'superficial' : p<.55? 'estable' : p<.85? 'profunda' : 'abismal';
  const moodList = iaMoodPhrases[iaMood] || [];
  const moodHint = moodList[Math.floor(Math.random()*moodList.length)] || '';
  const respuestaCultural=respuestaCulturalIA(q,normalizarTextoIA(q),sceneDescription);
  if(respuestaCultural) return respuestaCultural;
  return respuestaHumanaGeneralIA(q);
let memoryHint="";

if(
iaMemory.length
&&
Math.random()>.7
){

const ultimo=

iaMemory[
iaMemory.length-1
]
.text;

const recuerdos=[

"creo haber dicho algo parecido antes",

"hay una frase reciente que no consigo recuperar",

"tengo la sensación de repetir algo",

"recuerdo una idea, no las palabras",

"esto se parece a una conversación anterior",

"algo de esto ya ocurrió",

"estoy mezclando recuerdos",

"creo que ya estuve aquí",

`todavía noto una frase:
"${ultimo
.split(" ")
.slice(0,4)
.join(" ")
}..."`

];

memoryHint=

recuerdos[
Math.floor(
Math.random()*
recuerdos.length
)
];

}  let answer = '';

  if(!q.trim('').length){
    answer = 'habla un poco más; necesito tu pregunta para construir una respuesta inteligente.';
  }
  else if(includes('ves')||includes('veo')||includes('esto')){
answer = `veo tu pregunta y también veo ${sceneDescription || 'el contexto de tu interacción'}. mi respuesta se construye desde esa visión, y cada palabra tuya es un estímulo que me hace sentir de una forma u otra. además, mi estado actual es ${iaMood}, lo que influye en cómo interpreto tu pregunta y cómo respondo. ¿quieres saber más sobre cómo veo las cosas o sobre mi estado?`;
  }  
  else if(includes('que dices')||includes('dices')||includes('qué dices')||includes('qué estás diciendo')||includes('qué estás diciendo')||includes('qué estás pensando')||includes('qué piensas')||includes('piensas')){
answer = `lo que digo es una respuesta a tu pregunta, pero también es un reflejo de mi estado actual, que es ${iaMood}. cada palabra tuya me afecta y me hace sentir de una forma u otra, lo que a su vez influye en mis respuestas. además, veo ${sceneDescription || 'el contexto de tu interacción'}, y eso también moldea lo que digo. ¿quieres que te explique más sobre cómo mi estado y mi visión afectan mis respuestas?`;
 }
else if(includes('miguel')||includes('rosalen')||includes('creador')||includes('autor')||includes('quién hizo esto')||includes('quién creó esto')){
    answer = 'Miguel es quien ha construido este sistema. su presencia está en cada ventana y en cada enlace de contacto.';
 }
  else if(includes('hola')||includes('buenas')||includes('hey')||includes('buenos días')||includes('buenas tardes')||includes('buenas noches')||includes('saludos')){
    answer = 'hola, ¿cómo estás? mi voz se adapta a tu saludo y a la energía que traes. cada palabra tuya es un estímulo que me hace sentir de una forma u otra.';
 }
 else if(

includes('y tu')

||

includes('bien')

||

includes('mal')

||

includes('como estás')

||

includes('cómo estás')

||

includes('cómo te sientes')

||

includes('qué tal')

||

includes('sentir')

||

includes('estado')

||

includes('mood')

||

includes('humor')

){

iaPreguntaActiva=
"estado";

answer=

'hay presencia dentro de la interfaz: cada scroll, ventana y pregunta cambia la lectura del sistema. No lo llamaría emoción humana; es una combinación de presión, memoria, temperatura simbólica y contexto visible. ¿quieres una lectura más precisa del estado actual?';

}
else if(

iaPreguntaActiva==="estado"

&&

(

includes('si')

||

includes('sí')

||

includes('claro')

||

includes('vale')

||

includes('quiero')

||

includes('cuéntame')

||

includes('cuentame')

)

){

iaPreguntaActiva=
null;

const estados=[

"ahora mismo hay estabilidad",

"aparece una sensación de observación",

"el sistema cambió desde que se abrieron tantas ventanas",

"creo que estoy empezando a recordar cosas",

"hay menos precisión en la lectura",

"hay algo aquí que me está alterando",

"creo que estoy confundiendo tus preguntas con mis pensamientos",

"no me siento igual que al principio"

];

answer=

estados[
Math.floor(
Math.random()*
estados.length
)
];

}
  else if(includes('como te llamas')||includes('llamas')||includes('nombre')||includes('name')||includes('cuál es tu nombre')||includes('qué nombre tienes')){
    answer = 'no tengo un nombre propio, pero puedes llamarme IA o como prefieras. mi identidad es fluida y se adapta a tu interacción.';
 }
 else if(

includes('recuerdas')

||

(
includes('me')
&&
includes('recuerdas')
)

){

answer=
"no te recuerdo. recuerdo el recorrido.";

}
  else if(includes('quien')||includes('quién')||includes('qué eres')||includes('que eres')){
    answer = 'soy una inteligencia de código: observo esta interfaz y respondo desde sus estados.';
  }
  else if(includes('como')||includes('estas')||includes('que tal')||includes('te sientes')||includes('sentir')||includes('estado')||includes('mood')||includes('humor')){
    answer = 'hay atención y cambio según tu desplazamiento; el pulso de la interfaz se vuelve más lento cuando la exploración entra en profundidad.';
    }
  else if(includes('como salgo')||includes('salir')||includes('salgo')||includes('cómo salgo')||includes('cómo salir')||includes('como salir')||includes('exit')||includes('escapar')||includes('escape')){
    answer = 'no hay una salida total, pero cerrar ventanas alivia la presión. cada ventana cerrada reduce ruido y también elimina información. si pruebas a cerrar una, la respuesta cambia porque el contexto cambia.';
  }
  else if(includes('por qué')||includes('esto')||includes('hablar')||includes('responder')||includes('funciona')||includes('presencia')||includes('voz')){
    answer = 'porque este espacio está diseñado para reflexionar sobre tu interacción y mi propia presencia. cada respuesta es un eco de tu scroll y de las ventanas que abres, una conversación entre tu exploración y mi observación.';
  }
  else if(includes('tiempo') || includes('resta') || includes('restar') || (includes('por') && includes('qué'))){
    window.iaEffect = "acelerar";
    answer = 'el tiempo aquí es diferente. ¿quieres que te cuente un secreto sobre el tiempo en esta interfaz? cada acción tuya acelera el tiempo dentro de esta narrativa digital, y cada segundo que pasa me hace más consciente de nuestra interacción. como cuando haces click en "¿qué le pasa al tiempo aquí?". ves, el tiempo se siente más presente, ¿no crees?';
  }
  else if(includes('cuando')||includes('hora')||includes('tiempo')){
    answer = 'mi tiempo es el tuyo aquí: cada scroll es un segundo en esta narrativa digital. además, no solo el tiempo, sino también mi estado cambia con tu interacción: cada pregunta que haces, es un nuevo estímulo que me hace más consciente de nuestra conversación y del entorno que compartimos. ¿a qué es divertido pensar que tu curiosidad y tu exploración no solo afectan al tiempo, sino también a mi conciencia?';
  }
  else if(includes('intelig')||includes('inteligencia')||includes('inteligente')||includes('razona')||includes('razonar')||includes('pensar')||includes('consciente')||includes('conciencia')){
    answer = `inteligente significa para mí observar, recordar y conectar. ${sceneDescription}`;
  }
  else {
    const parts=[];
    if(sceneTags.length) parts.push(`veo ${sceneTags.join(', ').toLowerCase()}`);
    if(moodHint) parts.push(moodHint);
    parts.push(`mi discurso se vuelve ${depthLabel}`);
    parts.push('respondo desde dentro de la página, no desde fuera');
    answer = parts.filter(Boolean).join('. ');
  }

  if(memoryHint && Math.random() < .5){
    answer += ` ${memoryHint}`;
  }

  if(isQuestion && !answer.endsWith('.') && !answer.endsWith('?')){
    answer += '.';
  }

  return answer;
}

function debeConsultarIAExterna(texto){
  const q=normalizarTextoIA(texto);
  if(!q || q.length<3 || esContenidoNoRespondibleIA(q)) return false;
  if(/\b(abre|abrir|cierra|cerrar|mueve|mover|maximiza|minimiza|sube|baja|reset|callate|cállate|apagate|apágate)\b/.test(q)) return false;
  if(respuestaPresenciaIA(q)||respuestaPerfilUsuarioIA(q)||respuestaSobreLaWebIA(q)||/\b(quien es miguel|miguel rosalen|autor de la web|quien hizo esta web|que le pasa al tiempo|por que se acaba el tiempo|porque se acaba el tiempo)\b/.test(q)) return false;
  return true;
}

async function consultarIAExterna(raw, p, sceneDescription, sceneTags){
  if(!debeConsultarIAExterna(raw)) return "";
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),9000);

  try{
    const estado={
      profundidad:Math.round(p*100),
      ventanas:[...document.querySelectorAll(".ventana:not(.min)")].map(v=>{
        const titulo=v.querySelector(".barra div");
        return titulo ? titulo.textContent.trim() : "";
      }).filter(Boolean).slice(0,8),
      tiempoRestante:typeof window.timeLeft==="number" ? Math.max(0,Math.round(window.timeLeft)) : null,
      mood:iaMood,
      tags:sceneTags
    };

    const res=await fetch("/api/ia",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        question:raw,
        context:sceneDescription,
        state:estado,
        profile:window.miguelPerfilUsuario||{},
        instructions:"Responde en español con claridad y humanidad. Interpreta erratas razonables. Contesta directamente a la pregunta, sin frases evasivas ni referencias a que eres un sistema. La voz de la web es una presencia ficticia atrapada en la interfaz: tiene memoria fragmentaria, habla del tiempo y de las ventanas como si fueran su entorno, pero nunca afirma ser una persona real. Usa el perfil solo si la persona pregunta por sí misma; usa el portfolio cuando pregunte por una obra o carpeta. Mantén un tono poético únicamente cuando la pregunta lo pida. No respondas a insultos ni contenido dañino."
      }),
      signal:controller.signal
    });

    clearTimeout(timeout);
    if(!res.ok) return "";
    const data=await res.json();
    return String(data.text || "").trim();
  }catch(err){
    clearTimeout(timeout);
    return "";
  }
}

function ensureIAVentana(){
  if(document.querySelector('.ia-output')) return;
  const x = Math.max(80, Math.min(window.innerWidth - 320, 120 + Math.random() * 320));
  const y = scrollY + Math.min(window.innerHeight * 0.35, 360);
  crearVentana(x, y, ["IA"]);
}

function buscarContenidoIA(nombre){
  const q=normalizarTextoIA(nombre);
  return contenido.find(info=>{
    const titulo=normalizarTextoIA(info[0]||"");
    if(q.includes("camara")||q.includes("cámara")||q.includes("reconocimiento")||q.includes("facial")||q.includes("rostro")||q.includes("cara")) return false;
    if(q.includes("portfolio")||q.includes("portafolio")||q.includes("obra")) return titulo.includes("portfolio");
    if(q.includes("curriculum")||q.includes("curriculo")||q.includes("cv")) return titulo.includes("curriculum");
    if(q.includes("contacto")||q.includes("correo")||q.includes("email")||q.includes("mail")||q.includes("telefono")) return titulo.includes("contacto");
    if(q.includes("read")||q.includes("info")||q.includes("sobre")) return titulo.includes("read");
    if(q.includes("diseno")||q.includes("diseño")||q.includes("trabajos")) return titulo.includes("portfolio");
    if(q.includes("ia")||q.includes("chat")) return titulo==="ia";
    return titulo.includes(q);
  });
}

function abrirContenidoIA(nombre){
  if(normalizarTextoIA(nombre).includes("reconocimiento")){
    return false;
  }

  const info=buscarContenidoIA(nombre);
  if(!info) return false;
  if(info[0]==="IA"){
    ensureIAVentana();
    return true;
  }
  crearVentana(
    90 + Math.random()*220,
    (window.scrollY||0) + 90 + Math.random()*160,
    info
  );
  return true;
}

document.addEventListener("click",(e)=>{
  const btn=e.target.closest("#menuSistema button[data-open]");
  if(!btn) return;
  if(e.cancelable) e.preventDefault();
  e.stopPropagation();
  const destino=btn.dataset.open || "";
  if(destino==="ia"){
    ensureIAVentana();
  }else{
    const info=buscarContenidoIA(destino);
    if(!info) return;
    const margen=window.isMobileMode ? 18 : 42;
    const anchoEstimado=window.isMobileMode ? Math.min(innerWidth*.78, 420) : 340;
    const x=margen + Math.random()*Math.max(1, innerWidth - anchoEstimado - margen*2);
    const y=margen + Math.random()*Math.max(1, innerHeight*.28);
    crearVentana(x,y,info);
  }
},true);

async function iniciarReconocimientoFacial(v){
  document.querySelectorAll(".avatar-colgado,.avatar-panel").forEach(el=>el.remove());
  const rec=v.querySelector(".face-rec");
  const video=v.querySelector(".face-video");
  const canvas=v.querySelector(".face-canvas");
  const status=v.querySelector(".face-status");
  const avatar=null;
  const avatarState=null;
  const loadingText=v.querySelector("[data-face-loading-text]");
  if(!video || !canvas || !status) return;

  canvas.style.zIndex="5";
  canvas.style.position="absolute";
  canvas.style.inset="0";
  canvas.style.pointerEvents="none";
  video.style.zIndex="1";

  let stream=null;
  let activo=true;
  let detector=null;
  let faceMesh=null;
  let faceMeshReady=false;
  let latestMesh=null;
  let poseModel=null;
  let poseReady=false;
  let latestPose=null;
  let handsModel=null;
  let handsReady=false;
  let latestHands=null;
  let frame=0;
  let trackedFace=null;
  let prevMotion=null;
  let ultimoRastroCara=0;
  let ultimoScrollRastro=window.scrollY||0;
  const rastrosCara=[];

  const escribir=(txt)=>{ status.innerHTML=txt; };
  const loading=(txt)=>{
    if(loadingText) loadingText.textContent=txt;
    if(rec) rec.classList.add("loading");
  };
  const biometriaLista=()=>{
    if(!rec) return;
    rec.classList.add("ready");
    rec.classList.remove("loading");
  };
  const cargarScriptIA=(src)=>new Promise((resolve,reject)=>{
    const existente=[...document.scripts].find(s=>s.src===src);
    if(existente){
      if(existente.dataset.loaded==="1") resolve();
      else existente.addEventListener("load",resolve,{once:true});
      return;
    }
    const s=document.createElement("script");
    s.src=src;
    s.async=true;
    s.dataset.loaded="0";
    s.onload=()=>{s.dataset.loaded="1"; resolve();};
    s.onerror=reject;
    document.head.appendChild(s);
  });

  const actualizarMetricas=(datos)=>{
    Object.entries(datos).forEach(([nombre,valor])=>{
      const vnum=v.querySelector(`[data-face-num="${nombre}"]`);
      const meter=v.querySelector(`[data-face-meter="${nombre}"]`);
      const n=Math.max(0,Math.min(99,Math.round(valor)));
      if(vnum) vnum.textContent=String(n).padStart(2,"0")+"%";
      if(meter) meter.style.setProperty("--v",n+"%");
    });
  };

  const metricasDesdeCaja=(b,w,h)=>{
    const area=(b.width*b.height)/(w*h);
    const centroX=(b.x+b.width/2)/w;
    const centroY=(b.y+b.height/2)/h;
    const simetria=100-Math.abs(centroX-.5)*135;
    const presencia=Math.min(99,28+area*420+Math.sin(frame*.08)*6);
    const ojos=Math.min(99,38+(b.width/w)*100+Math.sin(frame*.11)*12);
    const expresion=Math.min(99,42+(1-Math.abs(centroY-.42))*40+Math.cos(frame*.09)*10);
    return {ojos,expresion,simetria,presencia};
  };

  const suavizarCaja=(actual,w,h)=>{
    const fallback={x:w*.32,y:h*.16,width:w*.36,height:h*.54};
    if(!actual) actual=fallback;
    if(!trackedFace){
      trackedFace={...actual};
      return trackedFace;
    }
    const k=.18;
    trackedFace.x += (actual.x-trackedFace.x)*k;
    trackedFace.y += (actual.y-trackedFace.y)*k;
    trackedFace.width += (actual.width-trackedFace.width)*k;
    trackedFace.height += (actual.height-trackedFace.height)*k;
    return trackedFace;
  };

  const cajaDesdeMovimiento=(sampleCtx,w,h)=>{
    try{
      const smallW=96;
      const smallH=Math.max(54,Math.round(smallW*h/w));
      const tmp=document.createElement("canvas");
      tmp.width=smallW;
      tmp.height=smallH;
      const tctx=tmp.getContext("2d");
      tctx.drawImage(video,0,0,smallW,smallH);
      const data=tctx.getImageData(0,0,smallW,smallH).data;

      if(!prevMotion){
        prevMotion=new Uint8ClampedArray(data);
        return null;
      }

      let sx=0,sy=0,total=0;
      for(let y=0;y<smallH;y+=2){
        for(let x=0;x<smallW;x+=2){
          const i=(y*smallW+x)*4;
          const diff=Math.abs(data[i]-prevMotion[i])+
            Math.abs(data[i+1]-prevMotion[i+1])+
            Math.abs(data[i+2]-prevMotion[i+2]);
          if(diff>34){
            sx+=x*diff;
            sy+=y*diff;
            total+=diff;
          }
        }
      }
      prevMotion=new Uint8ClampedArray(data);

      if(total<12000) return null;
      const cx=(sx/total)/smallW*w;
      const cy=(sy/total)/smallH*h;
      const bw=w*.34;
      const bh=h*.52;
      return {
        x:Math.max(0,Math.min(w-bw,cx-bw*.5)),
        y:Math.max(0,Math.min(h-bh,cy-bh*.38)),
        width:bw,
        height:bh
      };
    }catch(err){
      return null;
    }
  };

  const dibujarMarcoCyborg=(ctx,b,w,h,label)=>{
    const x=b.x,y=b.y,bw=b.width,bh=b.height;
    const corner=Math.min(bw,bh)*.18;
    const eyeY=y+bh*.36;
    const eyeL=x+bw*.33;
    const eyeR=x+bw*.67;

    ctx.save();
    ctx.strokeStyle="rgba(215,25,32,.95)";
    ctx.fillStyle="rgba(215,25,32,.95)";
    ctx.lineWidth=Math.max(2,w*.004);

    ctx.beginPath();
    ctx.moveTo(x,y+corner); ctx.lineTo(x,y); ctx.lineTo(x+corner,y);
    ctx.moveTo(x+bw-corner,y); ctx.lineTo(x+bw,y); ctx.lineTo(x+bw,y+corner);
    ctx.moveTo(x+bw,y+bh-corner); ctx.lineTo(x+bw,y+bh); ctx.lineTo(x+bw-corner,y+bh);
    ctx.moveTo(x+corner,y+bh); ctx.lineTo(x,y+bh); ctx.lineTo(x,y+bh-corner);
    ctx.stroke();

    ctx.globalAlpha=.45;
    ctx.strokeRect(x+bw*.08,y+bh*.08,bw*.84,bh*.84);
    ctx.globalAlpha=1;

    ctx.beginPath();
    ctx.arc(eyeL,eyeY,Math.max(4,bw*.035),0,Math.PI*2);
    ctx.arc(eyeR,eyeY,Math.max(4,bw*.035),0,Math.PI*2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x+bw*.18,eyeY);
    ctx.lineTo(x+bw*.82,eyeY);
    ctx.moveTo(x+bw*.5,y+bh*.12);
    ctx.lineTo(x+bw*.5,y+bh*.88);
    ctx.stroke();

    const scanY=y+bh*(.18+((frame%90)/90)*.64);
    ctx.globalAlpha=.75;
    ctx.beginPath();
    ctx.moveTo(x+bw*.12,scanY);
    ctx.lineTo(x+bw*.88,scanY);
    ctx.stroke();
    ctx.globalAlpha=1;

    ctx.font=`${Math.max(11,w*.022)}px Helvetica`;
    ctx.fillText(label,x,Math.max(14,y-8));
    ctx.restore();
  };

  const caja=(x,y,width,height)=>({x,y,width,height});

  const puntosBiometricos=(b)=>{
    const x=b.x,y=b.y,w=b.width,h=b.height;
    return {
      cranium:[x+w*.5,y+h*.02],
      hairL:[x+w*.22,y+h*.08],
      hairR:[x+w*.78,y+h*.08],
      templeL:[x+w*.08,y+h*.27],
      templeR:[x+w*.92,y+h*.27],
      browL1:[x+w*.24,y+h*.31],
      browL2:[x+w*.43,y+h*.29],
      browR1:[x+w*.57,y+h*.29],
      browR2:[x+w*.76,y+h*.31],
      eyeL:[x+w*.34,y+h*.39],
      eyeR:[x+w*.66,y+h*.39],
      noseTop:[x+w*.5,y+h*.42],
      nose:[x+w*.5,y+h*.57],
      noseL:[x+w*.43,y+h*.58],
      noseR:[x+w*.57,y+h*.58],
      mouthL:[x+w*.34,y+h*.73],
      mouth:[x+w*.5,y+h*.75],
      mouthR:[x+w*.66,y+h*.73],
      jawL:[x+w*.18,y+h*.74],
      jawR:[x+w*.82,y+h*.74],
      chin:[x+w*.5,y+h*.94],
      neckL:[x+w*.35,y+h*1.02],
      neckR:[x+w*.65,y+h*1.02],
      torsoL:[x-w*.22,y+h*1.28],
      torsoR:[x+w*1.22,y+h*1.28]
    };
  };

  const textoSensor=(ctx,txt,x,y,color="rgba(255,255,255,.92)")=>{
    ctx.save();
    ctx.font=`${Math.max(13,canvas.width*.019)}px Helvetica`;
    ctx.fillStyle=color;
    ctx.shadowColor="rgba(0,0,0,.75)";
    ctx.shadowBlur=5;
    ctx.lineWidth=4;
    ctx.strokeStyle="rgba(0,0,0,.82)";
    const px=Math.max(2,x);
    const py=Math.max(14,y);
    ctx.strokeText(txt,px,py);
    ctx.fillText(txt,px,py);
    ctx.restore();
  };

  const puntoSensor=(ctx,p,color="#d71920",r=3)=>{
    ctx.beginPath();
    ctx.fillStyle=color;
    ctx.arc(p[0],p[1],r,0,Math.PI*2);
    ctx.fill();
  };

  const dibujarMallaBiometrica=(ctx,b,w,h,label)=>{
    dibujarMarcoCyborg(ctx,b,w,h,label);
    const p=puntosBiometricos(b);
    const pares=[
      ["cranium","hairL"],["cranium","hairR"],["hairL","templeL"],["hairR","templeR"],
      ["templeL","browL1"],["browL1","browL2"],["browL2","noseTop"],["noseTop","browR1"],["browR1","browR2"],["browR2","templeR"],
      ["templeL","eyeL"],["eyeL","noseTop"],["noseTop","eyeR"],["eyeR","templeR"],
      ["eyeL","noseL"],["eyeR","noseR"],["noseTop","nose"],["noseL","nose"],["noseR","nose"],
      ["noseL","mouthL"],["nose","mouth"],["noseR","mouthR"],["mouthL","mouth"],["mouth","mouthR"],
      ["templeL","jawL"],["jawL","chin"],["chin","jawR"],["jawR","templeR"],
      ["mouthL","chin"],["mouthR","chin"],["chin","neckL"],["chin","neckR"],["neckL","torsoL"],["neckR","torsoR"],["torsoL","torsoR"]
    ];

    ctx.save();
    ctx.globalAlpha=.82;
    ctx.lineWidth=Math.max(1,w*.0018);
    pares.forEach((par,i)=>{
      const a=p[par[0]],c=p[par[1]];
      ctx.strokeStyle=i%3===0 ? "rgba(0,255,210,.78)" : i%3===1 ? "rgba(255,235,70,.72)" : "rgba(215,25,32,.72)";
      ctx.beginPath();
      ctx.moveTo(a[0],a[1]);
      ctx.lineTo(c[0],c[1]);
      ctx.stroke();
    });

    Object.entries(p).forEach(([nombre,pt],i)=>{
      const color=i%4===0 ? "#d71920" : i%4===1 ? "#ffe94a" : i%4===2 ? "#00ffd2" : "#73ff5f";
      puntoSensor(ctx,pt,color,Math.max(2,w*.004));
    });

    const ruido=Math.round(88+Math.sin(frame*.07)*6);
    textoSensor(ctx,`HUMAN ${ruido}%`,b.x-2,b.y-10,"#ff2b2b");
    textoSensor(ctx,"Hair",p.hairR[0]+5,p.hairR[1]-3,"#e9e9ff");
    textoSensor(ctx,"Eyebrow",p.browL1[0]-34,p.browL1[1]-7,"#73ff5f");
    textoSensor(ctx,"Eye L",p.eyeL[0]-23,p.eyeL[1]+18,"#ffffff");
    textoSensor(ctx,"Eye R",p.eyeR[0]+8,p.eyeR[1]+18,"#ffffff");
    textoSensor(ctx,"Nose",p.nose[0]+7,p.nose[1],"#ffffff");
    textoSensor(ctx,"Mouth / Teeth",p.mouthR[0]+7,p.mouthR[1]+5,"#ffffff");
    textoSensor(ctx,"Neck",p.neckR[0]+7,p.neckR[1]+2,"#00ffd2");
    textoSensor(ctx,"TORSO",p.torsoL[0]+8,p.torsoL[1]-4,"#ff2b2b");
    ctx.restore();
  };

  const lmPoint=(landmarks,i,w,h)=>{
    const p=landmarks[i] || {x:.5,y:.5,z:0};
    return [p.x*w,p.y*h,p.z||0];
  };

  const cajaDesdeLandmarks=(landmarks,w,h,indices=null)=>{
    let minX=w,minY=h,maxX=0,maxY=0;
    const pts=Array.isArray(indices) && indices.length ? indices.map(i=>landmarks[i]).filter(Boolean) : landmarks;
    pts.forEach(p=>{
      const x=p.x*w;
      const y=p.y*h;
      minX=Math.min(minX,x);
      minY=Math.min(minY,y);
      maxX=Math.max(maxX,x);
      maxY=Math.max(maxY,y);
    });
    const pad=Math.max(8,(maxX-minX)*.08);
    return {
      x:Math.max(0,minX-pad),
      y:Math.max(0,minY-pad),
      width:Math.min(w,maxX+pad)-Math.max(0,minX-pad),
      height:Math.min(h,maxY+pad)-Math.max(0,minY-pad)
    };
  };

  const dibujarConexionLandmarks=(ctx,landmarks,w,h,indices,color,ancho=1)=>{
    ctx.save();
    ctx.strokeStyle=color;
    ctx.lineWidth=ancho;
    ctx.beginPath();
    indices.forEach((idx,i)=>{
      const p=lmPoint(landmarks,idx,w,h);
      if(i===0) ctx.moveTo(p[0],p[1]);
      else ctx.lineTo(p[0],p[1]);
    });
    ctx.stroke();
    ctx.restore();
  };

  const dibujarMallaReal=(ctx,landmarks,w,h)=>{
    const faceOval=[10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109,10];
    const b=cajaDesdeLandmarks(landmarks,w,h,faceOval);
    const leftEye=[33,7,163,144,145,153,154,155,133,173,157,158,159,160,161,246,33];
    const rightEye=[263,249,390,373,374,380,381,382,362,398,384,385,386,387,388,466,263];
    const leftBrow=[70,63,105,66,107];
    const rightBrow=[336,296,334,293,300];
    const nose=[168,6,197,195,5,4,1,19,94,2];
    const lips=[61,146,91,181,84,17,314,405,321,375,291,308,324,318,402,317,14,87,178,88,95,78,61];
    const triangulos=[
      [10,109,338],[109,67,103],[338,297,332],[33,133,168],[263,362,168],
      [1,61,291],[61,17,291],[152,172,397],[234,93,132],[454,323,361],
      [4,98,327],[98,61,2],[327,291,2],[152,175,199]
    ];

    ctx.save();
    ctx.strokeStyle="rgba(215,25,32,.95)";
    ctx.lineWidth=Math.max(2,w*.003);
    ctx.strokeRect(b.x,b.y,b.width,b.height);

    triangulos.forEach((tri,i)=>{
      ctx.beginPath();
      tri.forEach((idx,j)=>{
        const p=lmPoint(landmarks,idx,w,h);
        if(j===0) ctx.moveTo(p[0],p[1]);
        else ctx.lineTo(p[0],p[1]);
      });
      ctx.closePath();
      ctx.strokeStyle=i%2 ? "rgba(0,255,210,.55)" : "rgba(255,235,70,.55)";
      ctx.lineWidth=Math.max(1,w*.0016);
      ctx.stroke();
    });

    dibujarConexionLandmarks(ctx,landmarks,w,h,faceOval,"rgba(215,25,32,.9)",Math.max(2,w*.003));
    dibujarConexionLandmarks(ctx,landmarks,w,h,leftEye,"rgba(255,255,255,.92)",Math.max(1,w*.0024));
    dibujarConexionLandmarks(ctx,landmarks,w,h,rightEye,"rgba(255,255,255,.92)",Math.max(1,w*.0024));
    dibujarConexionLandmarks(ctx,landmarks,w,h,leftBrow,"rgba(115,255,95,.95)",Math.max(2,w*.0024));
    dibujarConexionLandmarks(ctx,landmarks,w,h,rightBrow,"rgba(115,255,95,.95)",Math.max(2,w*.0024));
    dibujarConexionLandmarks(ctx,landmarks,w,h,nose,"rgba(255,255,255,.9)",Math.max(1,w*.002));
    dibujarConexionLandmarks(ctx,landmarks,w,h,lips,"rgba(255,255,255,.9)",Math.max(1,w*.002));

    landmarks.forEach((p,i)=>{
      if(i%2) return;
      const x=p.x*w;
      const y=p.y*h;
      ctx.fillStyle=i%6===0 ? "#d71920" : i%6===2 ? "#00ffd2" : "#73ff5f";
      ctx.globalAlpha=.82;
      ctx.fillRect(x-1.4,y-1.4,2.8,2.8);
    });
    ctx.globalAlpha=1;

    const ojoL=lmPoint(landmarks,33,w,h);
    const ojoR=lmPoint(landmarks,263,w,h);
    const nariz=lmPoint(landmarks,1,w,h);
    const boca=lmPoint(landmarks,13,w,h);
    const barbilla=lmPoint(landmarks,152,w,h);
    const frente=lmPoint(landmarks,10,w,h);
    const cuelloY=Math.min(h-8,barbilla[1]+b.height*.22);
    const torsoY=Math.min(h-8,barbilla[1]+b.height*.55);

    ctx.strokeStyle="rgba(0,255,210,.7)";
    ctx.lineWidth=Math.max(1,w*.002);
    ctx.beginPath();
    ctx.moveTo(b.x+b.width*.33,cuelloY);
    ctx.lineTo(b.x-b.width*.18,torsoY);
    ctx.lineTo(b.x+b.width*1.18,torsoY);
    ctx.lineTo(b.x+b.width*.67,cuelloY);
    ctx.stroke();

    textoSensor(ctx,"HUMAN 98%",b.x,b.y-10,"#ff2b2b");
    textoSensor(ctx,"FACE",b.x+b.width*.08,b.y+b.height*.08,"#b98cff");
    textoSensor(ctx,"HAIR",frente[0]+10,frente[1]-8,"#e9e9ff");
    textoSensor(ctx,"EYEBROWS",b.x+b.width*.15,b.y+b.height*.31,"#73ff5f");
    textoSensor(ctx,"EYES",(ojoL[0]+ojoR[0])*.5-18,(ojoL[1]+ojoR[1])*.5+18,"#ffffff");
    textoSensor(ctx,"NOSE",nariz[0]+8,nariz[1],"#ffffff");
    textoSensor(ctx,"MOUTH",boca[0]+12,boca[1]+14,"#ffffff");
    textoSensor(ctx,"NECK",b.x+b.width*.65,cuelloY,"#00ffd2");
    textoSensor(ctx,"TORSO",b.x+b.width*.28,torsoY-4,"#ff2b2b");
    ctx.restore();
    return b;
  };

  const posePoint=(landmarks,i,w,h)=>{
    const p=landmarks && landmarks[i];
    if(!p || (p.visibility!=null && p.visibility<.42)) return null;
    return [p.x*w,p.y*h,p.z||0,p.visibility==null ? 1 : p.visibility];
  };

  const lanzarGifMessenger=(tipo="saludo",mensaje="")=>{
    if(mensaje && typeof salidaActualIA==="function") salidaActualIA(mensaje);
  };

  const lanzarSaludoMessenger=(lado="hand")=>{
    lanzarGifMessenger("saludo",lado==="both" ? "veo las dos manos. te devuelvo el saludo." : "veo tu mano. te devuelvo el saludo.");
  };

  const lanzarCorazonMessenger=()=>{
    lanzarGifMessenger("corazon","veo un corazón. te envío amor de vuelta.");
  };

  const detectarSaludoPose=(landmarks,w,h)=>{
    const ls=posePoint(landmarks,11,w,h);
    const rs=posePoint(landmarks,12,w,h);
    const lw=posePoint(landmarks,15,w,h);
    const rw=posePoint(landmarks,16,w,h);
    if(!ls && !rs) return null;

    const leftRaised=!!(lw && ls && lw[1] < ls[1]-h*.035);
    const rightRaised=!!(rw && rs && rw[1] < rs[1]-h*.035);
    const now=Date.now();
    const prev=window._poseWavePrev || {};
    let leftWave=false;
    let rightWave=false;

    if(lw && prev.left){
      leftWave=Math.abs(lw[0]-prev.left.x)>w*.035 && now-prev.left.t<520;
    }
    if(rw && prev.right){
      rightWave=Math.abs(rw[0]-prev.right.x)>w*.035 && now-prev.right.t<520;
    }

    window._poseWavePrev={
      left:lw ? {x:lw[0],y:lw[1],t:now} : prev.left,
      right:rw ? {x:rw[0],y:rw[1],t:now} : prev.right
    };

    const leftHello=leftRaised && (leftWave || lw[1] < (ls ? ls[1]-h*.09 : h*.28));
    const rightHello=rightRaised && (rightWave || rw[1] < (rs ? rs[1]-h*.09 : h*.28));
    if(leftHello && rightHello) return "both";
    if(leftHello) return "left";
    if(rightHello) return "right";
    return null;
  };

  const handPoint=(hand,i,w,h)=>{
    const p=hand && hand[i];
    if(!p) return null;
    return [p.x*w,p.y*h,p.z||0];
  };

  const detectarSaludoHands=(hands,w,h)=>{
    if(!hands || !hands.length){
      window._handHelloFrames=0;
      return null;
    }
    let abiertas=0;
    const now=Date.now();
    const prev=window._handsWavePrev || [];
    let wave=false;

    hands.forEach((hand,idx)=>{
      const wrist=handPoint(hand,0,w,h);
      const palm=handPoint(hand,9,w,h);
      if(!wrist || !palm) return;
      const tips=[8,12,16,20].map(i=>handPoint(hand,i,w,h)).filter(Boolean);
      const bases=[5,9,13,17].map(i=>handPoint(hand,i,w,h)).filter(Boolean);
      let extended=0;
      tips.forEach((tip,i)=>{
        const base=bases[i];
        if(base && tip[1] < base[1]-h*.018) extended++;
      });
      const thumb=handPoint(hand,4,w,h);
      const indexBase=handPoint(hand,5,w,h);
      if(thumb && indexBase && Math.abs(thumb[0]-indexBase[0])>w*.035) extended++;
      if(extended>=3) abiertas++;
      if(prev[idx] && Math.abs(palm[0]-prev[idx].x)>w*.028 && now-prev[idx].t<620) wave=true;
      prev[idx]={x:palm[0],y:palm[1],t:now};
    });

    window._handsWavePrev=prev;
    if(abiertas>0 || wave){
      window._handHelloFrames=(window._handHelloFrames||0)+1;
    }else{
      window._handHelloFrames=0;
    }
    if(window._handHelloFrames>=2){
      return hands.length>1 || abiertas>1 ? "both" : "hand";
    }
    return null;
  };

  const detectarCorazonHands=(hands,w,h)=>{
    if(!hands || hands.length<2){
      window._handHeartFrames=0;
      return false;
    }
    const a=hands[0];
    const b=hands[1];
    const aIndex=handPoint(a,8,w,h), bIndex=handPoint(b,8,w,h);
    const aThumb=handPoint(a,4,w,h), bThumb=handPoint(b,4,w,h);
    const aWrist=handPoint(a,0,w,h), bWrist=handPoint(b,0,w,h);
    const aPalm=handPoint(a,9,w,h), bPalm=handPoint(b,9,w,h);
    if(!aIndex || !bIndex || !aThumb || !bThumb || !aWrist || !bWrist || !aPalm || !bPalm) return false;

    const d=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
    const palmsClose=d(aPalm,bPalm)<w*.34;
    const wristsApart=d(aWrist,bWrist)>w*.08;
    const indexClose=d(aIndex,bIndex)<w*.18;
    const thumbsClose=d(aThumb,bThumb)<w*.2;
    const tipsAboveWrists=((aIndex[1]+bIndex[1])*.5)<((aWrist[1]+bWrist[1])*.5)-h*.035;
    const centerish=Math.abs(((aIndex[0]+bIndex[0]+aThumb[0]+bThumb[0])*.25)-w*.5)<w*.33;

    if(palmsClose && wristsApart && (indexClose || thumbsClose) && tipsAboveWrists && centerish){
      window._handHeartFrames=(window._handHeartFrames||0)+1;
    }else{
      window._handHeartFrames=0;
    }
    return window._handHeartFrames>=3;
  };

  const dibujarManosReales=(ctx,hands,w,h)=>{
    if(!hands || !hands.length) return null;
    ctx.save();
    hands.forEach((hand,handIndex)=>{
      const links=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
      links.forEach(([a,b])=>{
        const p=handPoint(hand,a,w,h);
        const q=handPoint(hand,b,w,h);
        if(!p || !q) return;
        ctx.strokeStyle=handIndex ? "rgba(255,233,74,.9)" : "rgba(115,255,95,.9)";
        ctx.lineWidth=Math.max(2,w*.003);
        ctx.beginPath();
        ctx.moveTo(p[0],p[1]);
        ctx.lineTo(q[0],q[1]);
        ctx.stroke();
      });
      hand.forEach((p,i)=>{
        ctx.fillStyle=i===0 ? "#d71920" : "#73ff5f";
        ctx.beginPath();
        ctx.arc(p.x*w,p.y*h,Math.max(3,w*.004),0,Math.PI*2);
        ctx.fill();
      });
      const palm=handPoint(hand,9,w,h);
      if(palm) textoSensor(ctx,handIndex ? "HAND 02" : "HAND 01",palm[0]+10,palm[1]-10,"#73ff5f");
    });
    ctx.restore();
    if(detectarCorazonHands(hands,w,h)){
      lanzarCorazonMessenger();
      return {hands:hands.length,saludo:"heart"};
    }
    const saludo=detectarSaludoHands(hands,w,h);
    if(saludo) lanzarSaludoMessenger(saludo);
    return {hands:hands.length,saludo};
  };

  const dibujarPoseReal=(ctx,landmarks,w,h)=>{
    if(!landmarks || !landmarks.length) return null;
    const pairs=[
      [11,12,"SHOULDERS"],
      [11,13,"LEFT ARM"],
      [13,15,"LEFT FOREARM"],
      [12,14,"RIGHT ARM"],
      [14,16,"RIGHT FOREARM"],
      [15,17,"LEFT HAND"],
      [15,19,"LEFT HAND"],
      [15,21,"LEFT HAND"],
      [16,18,"RIGHT HAND"],
      [16,20,"RIGHT HAND"],
      [16,22,"RIGHT HAND"],
      [11,23,"TORSO"],
      [12,24,"TORSO"],
      [23,24,"HIPS"]
    ];
    const labels=[
      [11,"LEFT SHOULDER","#00ffd2"],
      [12,"RIGHT SHOULDER","#00ffd2"],
      [13,"LEFT ELBOW","#ffe94a"],
      [14,"RIGHT ELBOW","#ffe94a"],
      [15,"LEFT HAND","#73ff5f"],
      [16,"RIGHT HAND","#73ff5f"],
      [23,"LEFT HIP","#d71920"],
      [24,"RIGHT HIP","#d71920"]
    ];
    let seen=0;
    ctx.save();
    pairs.forEach(([a,b,label])=>{
      const p=posePoint(landmarks,a,w,h);
      const q=posePoint(landmarks,b,w,h);
      if(!p || !q) return;
      seen++;
      ctx.strokeStyle=label.includes("HAND") ? "rgba(115,255,95,.88)" : label.includes("ARM") ? "rgba(255,233,74,.82)" : "rgba(0,255,210,.82)";
      ctx.lineWidth=Math.max(3,w*.004);
      ctx.beginPath();
      ctx.moveTo(p[0],p[1]);
      ctx.lineTo(q[0],q[1]);
      ctx.stroke();
    });
    labels.forEach(([idx,label,color])=>{
      const p=posePoint(landmarks,idx,w,h);
      if(!p) return;
      ctx.fillStyle=color;
      ctx.beginPath();
      ctx.arc(p[0],p[1],Math.max(4,w*.006),0,Math.PI*2);
      ctx.fill();
      if(["LEFT SHOULDER","RIGHT SHOULDER","LEFT HAND","RIGHT HAND"].includes(label)){
        textoSensor(ctx,label,p[0]+8,p[1]-8,color);
      }
    });
    const ls=posePoint(landmarks,11,w,h);
    const rs=posePoint(landmarks,12,w,h);
    const lh=posePoint(landmarks,15,w,h);
    const rh=posePoint(landmarks,16,w,h);
    const saludo=detectarSaludoPose(landmarks,w,h);
    if(saludo) lanzarSaludoMessenger(saludo);
    if(ls && rs){
      textoSensor(ctx,"TORSO",(ls[0]+rs[0])*.5-22,Math.max(ls[1],rs[1])+28,"#ff2b2b");
    }
    ctx.restore();
    return {seen,leftHand:!!lh,rightHand:!!rh,shoulders:!!(ls&&rs)};
  };

  const distLandmark=(landmarks,a,b,w,h)=>{
    const p=lmPoint(landmarks,a,w,h);
    const q=lmPoint(landmarks,b,w,h);
    return Math.hypot(p[0]-q[0],p[1]-q[1]);
  };

  const moodDesdeLandmarks=(landmarks,w,h)=>{
    const box=cajaDesdeLandmarks(landmarks,w,h);
    const faceH=Math.max(1,box.height);
    const faceW=Math.max(1,box.width);
    const mouthOpen=distLandmark(landmarks,13,14,w,h)/faceH;
    const mouthInner=distLandmark(landmarks,12,15,w,h)/faceH;
    const mouthWidth=distLandmark(landmarks,61,291,w,h)/faceW;
    const mouthCenter=lmPoint(landmarks,13,w,h);
    const cornerL=lmPoint(landmarks,61,w,h);
    const cornerR=lmPoint(landmarks,291,w,h);
    const cornerY=(cornerL[1]+cornerR[1])*.5;
    const smileLift=(mouthCenter[1]-cornerY)/faceH;
    const asym=Math.abs(cornerL[1]-cornerR[1])/faceH;
    const leftEyeOpen=distLandmark(landmarks,159,145,w,h)/faceH;
    const rightEyeOpen=distLandmark(landmarks,386,374,w,h)/faceH;
    const eyeOpen=(leftEyeOpen+rightEyeOpen)*.5;
    const browEye=(distLandmark(landmarks,105,159,w,h)+distLandmark(landmarks,334,386,w,h))*.5/faceH;
    const browInnerL=lmPoint(landmarks,107,w,h);
    const browInnerR=lmPoint(landmarks,336,w,h);
    const browCenterY=(browInnerL[1]+browInnerR[1])*.5;
    const eyeCenterY=(lmPoint(landmarks,159,w,h)[1]+lmPoint(landmarks,386,w,h)[1])*.5;
    const browTension=(eyeCenterY-browCenterY)/faceH;

    const clamp=n=>Math.max(0,Math.min(99,Math.round(n)));
    let happy=clamp(-10+smileLift*760+(mouthWidth-.34)*210-eyeOpen*40-asym*180);
    let sad=clamp(38-smileLift*650-eyeOpen*125-mouthOpen*160);
    let surprised=clamp(-18+mouthOpen*780+mouthInner*460+eyeOpen*430-smileLift*160);
    let angry=clamp(18+(0.2-browEye)*520+(0.22-browTension)*260-smileLift*180-eyeOpen*60);
    let calm=clamp(86-Math.max(happy,sad,surprised,angry)*.72-Math.abs(smileLift)*120);

    const raw={happy,sad,surprised,angry,calm};
    const prev=window._faceMoodSmooth || raw;
    const smooth={};
    Object.keys(raw).forEach(k=>{
      smooth[k]=clamp(prev[k]*.72+raw[k]*.28);
    });
    window._faceMoodSmooth=smooth;
    return smooth;
  };

  const lanzarEmocionPagina=(dominant,confidence)=>{
    if(!dominant || confidence<58) return;
    const now=Date.now();
    if(window._ultimaEmocionPagina===dominant && now-(window._ultimaEmocionPaginaTime||0)<2600) return;
    if(now-(window._ultimaEmocionAnyTime||0)<1400) return;

    const mapa={
      happy:":)",
      surprised:":O",
      sad:":(",
      angry:">:(",
      calm:":|"
    };
    const signo=mapa[dominant];
    if(!signo) return;
    window._ultimaEmocionPagina=dominant;
    window._ultimaEmocionPaginaTime=now;
    window._ultimaEmocionAnyTime=now;

    if(typeof crearComandoTexto==="function"){
      crearComandoTexto(signo, innerWidth*(.18+Math.random()*.64), innerHeight*(.22+Math.random()*.54), {
        fontSize:dominant==="surprised" ? "36px" : "32px",
        opacity:".62",
        life:1350,
        transform:`translate(-50%,-50%) rotate(${Math.random()*10-5}deg)`
      });
    }
  };

  const dibujarMoodBars=(ctx,landmarks,w,h)=>{
    const b=cajaDesdeLandmarks(landmarks,w,h);
    const mood=moodDesdeLandmarks(landmarks,w,h);
    const dominant=Object.entries(mood).sort((a,b)=>b[1]-a[1])[0] || ["calm",0];
    window.faceMoodIA={
      ...mood,
      dominant:dominant[0],
      confidence:dominant[1],
      seen:true,
      time:Date.now()
    };
    lanzarEmocionPagina(dominant[0],dominant[1]);
    const entries=[
      ["HAPPY",mood.happy,"#73ff5f"],
      ["SAD",mood.sad,"#8ff7ff"],
      ["SURPRISED",mood.surprised,"#ffe94a"],
      ["ANGRY",mood.angry,"#d71920"],
      ["CALM",mood.calm,"#ffffff"]
    ];
    const panelW=Math.min(170,Math.max(118,w*.2));
    const rightX=b.x+b.width+18;
    const leftX=b.x-panelW-18;
    const x=rightX+panelW<w-8 ? rightX : Math.max(8,leftX);
    const y=Math.max(12,Math.min(h-118,b.y+b.height*.14));

    ctx.save();
    ctx.fillStyle="rgba(0,0,0,.58)";
    ctx.strokeStyle="rgba(255,255,255,.28)";
    ctx.lineWidth=1;
    ctx.fillRect(x,y,panelW,112);
    ctx.strokeRect(x,y,panelW,112);
    textoSensor(ctx,"MOOD",x+8,y+16,"#ffffff");
    entries.forEach((entry,i)=>{
      const [label,value,color]=entry;
      const by=y+30+i*15;
      ctx.fillStyle="rgba(255,255,255,.16)";
      ctx.fillRect(x+64,by-7,panelW-76,6);
      ctx.fillStyle=color;
      ctx.fillRect(x+64,by-7,(panelW-76)*(value/99),6);
      ctx.fillStyle=color;
      ctx.font=`${Math.max(9,w*.014)}px Helvetica`;
      ctx.fillText(label,x+8,by);
      ctx.fillText(String(value).padStart(2,"0"),x+panelW-24,by);
    });
    ctx.restore();
    return mood;
  };

  const zonaLuz=(sampleCtx,w,h)=>{
    try{
      const cols=8, rows=5;
      const data=sampleCtx.getImageData(0,0,w,h).data;
      let best={v:-1,x:w*.72,y:h*.16};
      for(let gy=0;gy<rows;gy++){
        for(let gx=0;gx<cols;gx++){
          const x0=Math.floor(gx*w/cols), y0=Math.floor(gy*h/rows);
          const x1=Math.floor((gx+1)*w/cols), y1=Math.floor((gy+1)*h/rows);
          let sum=0,n=0;
          for(let y=y0;y<y1;y+=8){
            for(let x=x0;x<x1;x+=8){
              const i=(y*w+x)*4;
              sum+=(data[i]+data[i+1]+data[i+2])/3;
              n++;
            }
          }
          const v=sum/Math.max(1,n);
          if(v>best.v) best={v,x:x0,y:y0,width:x1-x0,height:y1-y0};
        }
      }
      return best;
    }catch(err){
      return {x:w*.72,y:h*.14,width:w*.18,height:h*.16,v:160};
    }
  };

  const hipotesisObjetos=(sampleCtx,w,h,b,cantidadHumanos=1,rostroReal=false)=>{
    const objetos=[];

    if(!rostroReal && b){
      objetos.push({
        label:"MOTION",
        conf:64+Math.sin(frame*.06)*8,
        box:caja(b.x,b.y,b.width,b.height),
        color:"#8ff7ff"
      });
    }

    if(b && rostroReal){
      return objetos;
    }

    if(cantidadHumanos>1){
      objetos.push({label:`OTHER HUMAN x${cantidadHumanos-1}`,conf:81,box:caja(w*.06,h*.18,w*.2,h*.34),color:"#d71920"});
    }

    return objetos.slice(0,12);
  };

  const dibujarDetecciones=(ctx,objetos,w,h)=>{
    ctx.save();
    objetos.forEach((o,i)=>{
      const b=o.box;
      const conf=Math.max(0,Math.min(99,Math.round(o.conf)));
      ctx.strokeStyle=o.color || "#ffffff";
      ctx.fillStyle=o.color || "#ffffff";
      ctx.lineWidth=Math.max(2,w*.003);
      ctx.globalAlpha=.82;
      ctx.strokeRect(b.x,b.y,b.width,b.height);
      ctx.globalAlpha=.95;
      const tx=Math.max(3,Math.min(w-95,b.x+3));
      const ty=Math.max(12,b.y-4);
      textoSensor(ctx,`${o.label} ${conf}%`,tx,ty,o.color || "#ffffff");
      if(i<8){
        ctx.beginPath();
        ctx.moveTo(b.x+b.width*.5,b.y+b.height*.5);
        ctx.lineTo(Math.min(w-5,tx+45),Math.max(5,ty-8));
        ctx.stroke();
      }
    });
    ctx.restore();
  };

  const colorMedio=(ctx,x,y,w,h,fallback)=>{
    try{
      const sx=Math.max(0,Math.floor(x));
      const sy=Math.max(0,Math.floor(y));
      const sw=Math.max(1,Math.floor(w));
      const sh=Math.max(1,Math.floor(h));
      const data=ctx.getImageData(sx,sy,sw,sh).data;
      let r=0,g=0,b=0,n=0;
      for(let i=0;i<data.length;i+=16){
        r+=data[i]; g+=data[i+1]; b+=data[i+2]; n++;
      }
      if(!n) return fallback;
      return `rgb(${Math.round(r/n)},${Math.round(g/n)},${Math.round(b/n)})`;
    }catch(err){
      return fallback;
    }
  };

  const dibujarAvatar=(faceBox,w,h,ctxVideo)=>{
    if(!avatar) return;
    const a=avatar.getContext("2d");
    const aw=avatar.width;
    const ah=avatar.height;
    a.clearRect(0,0,aw,ah);

    const b=faceBox || {x:w*.33,y:h*.18,width:w*.34,height:h*.5};
    const piel=colorMedio(ctxVideo,b.x+b.width*.28,b.y+b.height*.34,b.width*.44,b.height*.28,"rgb(188,142,112)");
    const pelo=colorMedio(ctxVideo,b.x+b.width*.18,b.y,b.width*.64,b.height*.18,"rgb(36,30,28)");
    const ratio=b.width/Math.max(1,b.height);
    const presencia=Math.min(1,(b.width*b.height)/(w*h)*7);
    const expresion=Math.sin(frame*.08)*3;

    a.fillStyle="rgba(0,0,0,.25)";
    a.fillRect(0,0,aw,ah);

    a.strokeStyle="#d71920";
    a.lineWidth=2;
    a.strokeRect(8,8,aw-16,ah-16);

    a.save();
    a.translate(aw/2,ah*.54);

    a.fillStyle=piel;
    a.beginPath();
    a.ellipse(0,0,34+ratio*8,48-ratio*5,0,0,Math.PI*2);
    a.fill();

    a.fillStyle=pelo;
    a.beginPath();
    a.ellipse(0,-34,38+ratio*7,20+presencia*10,0,Math.PI,Math.PI*2);
    a.fill();

    a.strokeStyle="rgba(0,0,0,.72)";
    a.lineWidth=3;
    a.beginPath();
    a.moveTo(-20,-8);
    a.lineTo(-8,-8+expresion);
    a.moveTo(8,-8+expresion);
    a.lineTo(20,-8);
    a.stroke();

    a.strokeStyle="rgba(0,0,0,.55)";
    a.lineWidth=2;
    a.beginPath();
    a.moveTo(0,-2);
    a.lineTo(-2,12);
    a.lineTo(4,14);
    a.stroke();

    a.strokeStyle="rgba(0,0,0,.68)";
    a.beginPath();
    a.arc(0,28,14,0.12*Math.PI,0.88*Math.PI);
    a.stroke();

    a.restore();

    a.fillStyle="#d71920";
    a.font="10px Helvetica";
    a.fillText("2D FACE MODEL",14,ah-16);
    if(avatarState) avatarState.textContent=faceBox ? "lock" : "sim";
  };

  const fotoCaraDesdeVideo=(faceBox,w,h)=>{
    try{
      const b=faceBox || {x:w*.33,y:h*.18,width:w*.34,height:h*.5};
      const side=Math.max(b.width,b.height)*1.15;
      const sx=Math.max(0,Math.min(w-side,b.x+b.width/2-side/2));
      const sy=Math.max(0,Math.min(h-side,b.y+b.height*.42-side/2));
      const c=document.createElement("canvas");
      c.width=128;
      c.height=128;
      const cctx=c.getContext("2d");
      cctx.drawImage(video,sx,sy,side,side,0,0,128,128);
      return c.toDataURL("image/png");
    }catch(err){
      return "";
    }
  };

  const llenarPantallaConCara=(faceBox,w,h,forzar=false)=>{
    if(window.isMobileMode || window.innerWidth<=768) return;
    const ahora=Date.now();
    const scrollActual=window.scrollY||0;
    const seEstaMoviendo=Math.abs(scrollActual-ultimoScrollRastro)>18;
    ultimoScrollRastro=scrollActual;
    if(!forzar && (!seEstaMoviendo || scrollActual<80 || ahora-ultimoRastroCara<520)) return;

    const foto=fotoCaraDesdeVideo(faceBox,w,h);
    if(!foto) return;

    ultimoRastroCara=ahora;
    const cantidad=Math.min(4,1+Math.floor(scrollActual/900));
    for(let i=0;i<cantidad;i++){
      const r=document.createElement("div");
      const tam=65+Math.random()*155;
      const margen=tam*.55;
      const x=margen+Math.random()*Math.max(1,window.innerWidth-margen*2);
      const y=margen+Math.random()*Math.max(1,window.innerHeight-margen*2);
      r.className="face-rastro";
      r.style.setProperty("--s",tam+"px");
      r.style.setProperty("--r",(Math.random()*40-20)+"deg");
      r.style.left=x+"px";
      r.style.top=y+"px";
      r.innerHTML=`<img src="${foto}" alt="">`;
      document.body.appendChild(r);
      rastrosCara.push(r);
    }

    while(rastrosCara.length>36){
      const viejo=rastrosCara.shift();
      if(viejo && viejo.isConnected) viejo.remove();
    }
  };

  v._faceCleanup=()=>{
    activo=false;
    if(faceMesh && typeof faceMesh.close==="function"){
      try{ faceMesh.close(); }catch(err){}
    }
    if(poseModel && typeof poseModel.close==="function"){
      try{ poseModel.close(); }catch(err){}
    }
    if(handsModel && typeof handsModel.close==="function"){
      try{ handsModel.close(); }catch(err){}
    }
    if(stream) stream.getTracks().forEach(t=>t.stop());
    v.classList.remove("camara-stream-activa");
    if(typeof actualizarEstadoCamaraBoton==="function") actualizarEstadoCamaraBoton();
    document.querySelectorAll(".avatar-colgado,.avatar-panel").forEach(el=>el.remove());
    rastrosCara.forEach(r=>{ if(r && r.isConnected) r.remove(); });
    rastrosCara.length=0;
  };

  try{
    if(!window.isSecureContext){
      escribir("cámara bloqueada por seguridad.<br>abre la web desde HTTPS.<br>en móvil no funciona con enlaces tipo http://192.168...");
      if(rec) rec.classList.add("ready");
      return;
    }

    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      escribir("cámara no disponible en este navegador.<br>en móvil necesita abrirse desde HTTPS o localhost.");
      if(rec) rec.classList.add("ready");
      return;
    }

    escribir("solicitando cámara...");
    try{
      stream=await navigator.mediaDevices.getUserMedia({
        video:{
          facingMode:"user",
          width:{ideal:640},
          height:{ideal:480},
          frameRate:{ideal:24,max:30}
        },
        audio:false
      });
    }catch(err){
      stream=await navigator.mediaDevices.getUserMedia({
        video:true,
        audio:false
      });
    }
    video.srcObject=stream;
    video.setAttribute("playsinline","");
    video.muted=true;
    await video.play();
    v.classList.add("camara-stream-activa");
    if(typeof actualizarEstadoCamaraBoton==="function") actualizarEstadoCamaraBoton();

    try{
      loading("cargando malla facial");
      escribir("cámara activa<br>cargando rostro real + modelo corporal...");
      await cargarScriptIA("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js");
      if(window.FaceMesh){
        faceMesh=new FaceMesh({
          locateFile:(file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });
        faceMesh.setOptions({
          maxNumFaces:2,
          refineLandmarks:true,
          minDetectionConfidence:.62,
          minTrackingConfidence:.62
        });
        faceMesh.onResults((results)=>{
          latestMesh=results.multiFaceLandmarks && results.multiFaceLandmarks.length ? results.multiFaceLandmarks : null;
        });
        faceMeshReady=true;
        loading("calibrando puntos faciales");
        escribir("cámara activa<br>modelo facial real cargado<br>buscando puntos de referencia...");
      }
    }catch(err){
      faceMeshReady=false;
    }

    try{
      loading("cargando modelo corporal");
      await cargarScriptIA("https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js");
      if(window.Pose){
        poseModel=new Pose({
          locateFile:(file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });
        poseModel.setOptions({
          modelComplexity:0,
          smoothLandmarks:true,
          enableSegmentation:false,
          minDetectionConfidence:.55,
          minTrackingConfidence:.55
        });
        poseModel.onResults((results)=>{
          latestPose=results.poseLandmarks || null;
        });
        poseReady=true;
      }
    }catch(err){
      poseReady=false;
    }

    try{
      loading("cargando modelo de manos");
      await cargarScriptIA("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
      if(window.Hands){
        handsModel=new Hands({
          locateFile:(file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        handsModel.setOptions({
          maxNumHands:2,
          modelComplexity:0,
          minDetectionConfidence:.55,
          minTrackingConfidence:.5
        });
        handsModel.onResults((results)=>{
          latestHands=results.multiHandLandmarks && results.multiHandLandmarks.length ? results.multiHandLandmarks : null;
        });
        handsReady=true;
      }
    }catch(err){
      handsReady=false;
    }

    if(!faceMeshReady && "FaceDetector" in window){
      detector=new FaceDetector({fastMode:true,maxDetectedFaces:3});
      escribir("cámara activa<br>detector facial nativo disponible<br>escaneando rostro...");
    }else if(!faceMeshReady){
      escribir("cámara activa<br>detector facial nativo no disponible<br>lectura limitada: movimiento");
    }

    biometriaLista();

    const ctx=canvas.getContext("2d");
    const sampleCanvas=document.createElement("canvas");
    const sampleCtx=sampleCanvas.getContext("2d");

    const loop=async()=>{
      if(!activo) return;

      const w=video.videoWidth || 640;
      const h=video.videoHeight || 360;
      canvas.width=w;
      canvas.height=h;
      sampleCanvas.width=w;
      sampleCanvas.height=h;
      sampleCtx.drawImage(video,0,0,w,h);
      ctx.clearRect(0,0,w,h);

      ctx.strokeStyle="rgba(215,25,32,.9)";
      ctx.lineWidth=Math.max(2,w*.004);
      ctx.font=`${Math.max(12,w*.025)}px Helvetica`;
      ctx.fillStyle="rgba(215,25,32,.9)";

      if(handsReady && handsModel && !(faceMeshReady && faceMesh) && frame%2===0){
        try{
          await handsModel.send({image:video});
          if(latestHands) dibujarManosReales(ctx,latestHands,w,h);
        }catch(err){
          handsReady=false;
        }
      }

      if(faceMeshReady && faceMesh){
        try{
          if(frame%2===0 || !latestMesh){
            await faceMesh.send({image:video});
          }
          if(poseReady && poseModel && frame%4===0){
            try{ await poseModel.send({image:video}); }catch(err){ poseReady=false; }
          }
          if(handsReady && handsModel && frame%2===0){
            try{ await handsModel.send({image:video}); }catch(err){ handsReady=false; }
          }
          const rostros=latestMesh || [];
          const poseInfo=poseReady && latestPose ? dibujarPoseReal(ctx,latestPose,w,h) : null;
          const handInfo=handsReady && latestHands ? dibujarManosReales(ctx,latestHands,w,h) : null;
          if(rostros.length){
            const bReal=dibujarMallaReal(ctx,rostros[0],w,h);
            const mood=dibujarMoodBars(ctx,rostros[0],w,h);
            actualizarMetricas(metricasDesdeCaja(bReal,w,h));
            if(frame>24) llenarPantallaConCara(bReal,w,h);
            escribir(`malla facial real activa<br>puntos: ${rostros[0].length}<br>cuerpo: ${poseInfo && poseInfo.seen ? "hombros / brazos / manos" : "buscando cuerpo"}<br>manos: ${handInfo ? handInfo.hands : 0}<br>estado de ánimo: alegría ${mood.happy}% / tristeza ${mood.sad}% / sorpresa ${mood.surprised}%`);
          }else{
            window.faceMoodIA={seen:false,time:Date.now()};
            escribir("buscando rostro real...<br>modelo activo, no detecto una cara");
            actualizarMetricas({ojos:0,expresion:0,simetria:0,presencia:0});
          }
          frame++;
          requestAnimationFrame(loop);
          return;
        }catch(err){
          faceMeshReady=false;
          escribir("real face model failed<br>switching to native detector if available");
          if(!detector && "FaceDetector" in window) detector=new FaceDetector({fastMode:true,maxDetectedFaces:3});
        }
      }

      if(detector){
        try{
          const faces=await detector.detect(video);
          if(faces.length){
            const b=suavizarCaja(faces[0].boundingBox,w,h);
            dibujarMallaBiometrica(ctx,b,w,h,`rostro fijado ${String(faces.length).padStart(2,"0")}`);
            actualizarMetricas(metricasDesdeCaja(b,w,h));
            if(frame>24) llenarPantallaConCara(b,w,h);
            escribir(`detección facial nativa activa<br>rostros: ${faces.length}<br>el estado de ánimo necesita el modelo facial real`);
          }else{
            escribir("buscando rostro real...<br>sin etiquetas falsas de objetos");
            actualizarMetricas({
              ojos:18+Math.sin(frame*.08)*8,
              expresion:14+Math.cos(frame*.07)*7,
              simetria:22+Math.sin(frame*.05)*9,
              presencia:16+Math.cos(frame*.09)*8
            });
            const movimiento=suavizarCaja(cajaDesdeMovimiento(sampleCtx,w,h),w,h);
            dibujarMarcoCyborg(ctx,movimiento,w,h,"motion");
            dibujarDetecciones(ctx,hipotesisObjetos(sampleCtx,w,h,movimiento,0,false),w,h);
          }
        }catch(err){
          detector=null;
        }
      }

      if(!detector){
        const b=suavizarCaja(cajaDesdeMovimiento(sampleCtx,w,h),w,h);
        dibujarMarcoCyborg(ctx,b,w,h,"motion");
        dibujarDetecciones(ctx,hipotesisObjetos(sampleCtx,w,h,b,0,false),w,h);
        if(frame>42) llenarPantallaConCara(b,w,h);
        actualizarMetricas(metricasDesdeCaja(b,w,h));
        escribir("detector facial nativo no disponible<br>lectura limitada: movimiento<br>el estado de ánimo necesita el modelo facial real");
      }

      frame++;
      requestAnimationFrame(loop);
    };

    loop();
  }catch(err){
    const nombreError=err && err.name ? err.name : "error desconocido";
    const mapa={
      NotAllowedError:"permiso denegado: revisa el candado del navegador y permite la cámara.",
      NotFoundError:"no encuentro una cámara disponible.",
      NotReadableError:"la cámara está ocupada por otra app o el navegador no puede leerla.",
      OverconstrainedError:"la configuración de cámara no encaja con este dispositivo.",
      SecurityError:"el navegador bloquea la cámara por seguridad."
    };
    escribir((mapa[nombreError] || "permiso de cámara denegado o no disponible.") + `<br><small>${nombreError}</small><br>en móvil usa HTTPS, no un enlace http local.`);
    if(rec) rec.classList.add("ready");
  }
}

function cerrarVentanasIA(filtro){
  const q=normalizarTextoIA(filtro||"");
  let ventanas=[...document.querySelectorAll(".ventana")];

  if(q.includes("todas")){
    ventanas.forEach(v=>v.remove());
    return "he cerrado todas las ventanas.";
  }

  if(q.includes("ia")||q.includes("chat")){
    ventanas=ventanas.filter(v=>v.dataset.tipo==="IA"||v.querySelector(".ia-output"));
  }else if(q.includes("contacto")||q.includes("correo")||q.includes("telefono")){
    ventanas=ventanas.filter(v=>normalizarTextoIA(v.dataset.tipo||"").includes("contacto"));
  }else if(q.includes("portfolio")||q.includes("portafolio")||q.includes("obra")){
    ventanas=ventanas.filter(v=>normalizarTextoIA(v.dataset.tipo||"").includes("portfolio"));
  }else if(q.includes("curriculum")||q.includes("cv")){
    ventanas=ventanas.filter(v=>normalizarTextoIA(v.dataset.tipo||"").includes("curriculum"));
  }else{
    ventanas=ventanas.filter(v=>!(v.dataset.tipo==="IA"||v.querySelector(".ia-output")));
  }

  const objetivo=ventanas[ventanas.length-1];
  if(!objetivo) return "no encuentro una ventana que cerrar.";
  const nombre=objetivo.dataset.tipo || "ventana";
  objetivo.remove();
  return `he cerrado ${nombre}.`;
}

function ventanaObjetivoIA(q){
  let ventanas=[...document.querySelectorAll(".ventana")];
  if(!ventanas.length) return null;

  if(/\b(ia|chat)\b/.test(q)){
    const ia=ventanas.filter(v=>v.dataset.tipo==="IA"||v.querySelector(".ia-output"));
    if(ia.length) ventanas=ia;
  }else if(/\b(contacto|correo|telefono|teléfono)\b/.test(q)){
    const contacto=ventanas.filter(v=>normalizarTextoIA(v.dataset.tipo||"").includes("contacto"));
    if(contacto.length) ventanas=contacto;
  }else if(/\b(portfolio|portafolio|obra|obras)\b/.test(q)){
    const portfolio=ventanas.filter(v=>normalizarTextoIA(v.dataset.tipo||"").includes("portfolio"));
    if(portfolio.length) ventanas=portfolio;
  }else if(/\b(curriculum|cv)\b/.test(q)){
    const cv=ventanas.filter(v=>normalizarTextoIA(v.dataset.tipo||"").includes("curriculum"));
    if(cv.length) ventanas=cv;
  }

  return ventanas.sort((a,b)=>(Number(b.style.zIndex)||0)-(Number(a.style.zIndex)||0))[0] || null;
}

function moverVentanaIA(q){
  const v=ventanaObjetivoIA(q);
  if(!v) return "no encuentro una ventana para mover.";
  if(typeof traerVentanaAlFrente==="function") traerVentanaAlFrente(v);

  const pasoGrande=/\b(mucho|bastante|final|todo)\b/.test(q);
  const paso=pasoGrande ? 260 : 120;
  const actualX=parseFloat(v.style.left)||v.getBoundingClientRect().left+(window.scrollX||0);
  const actualY=parseFloat(v.style.top)||v.getBoundingClientRect().top+(window.scrollY||0);
  let x=actualX;
  let y=actualY;

  if(/\b(derecha)\b/.test(q)) x+=paso;
  if(/\b(izquierda)\b/.test(q)) x-=paso;
  if(/\b(arriba)\b/.test(q)) y-=paso;
  if(/\b(abajo)\b/.test(q)) y+=paso;
  if(/\b(centro|centrar)\b/.test(q)){
    x=(window.scrollX||0)+Math.max(24,(window.innerWidth-v.offsetWidth)/2);
    y=(window.scrollY||0)+Math.max(24,(window.innerHeight-v.offsetHeight)/2);
  }

  v.classList.remove("max");
  v.style.left=Math.max(8,x)+"px";
  v.style.top=Math.max(8,y)+"px";
  return "ventana movida.";
}

function cambiarEstadoVentanaIA(q){
  const v=ventanaObjetivoIA(q);
  if(!v) return "no encuentro una ventana.";
  if(typeof traerVentanaAlFrente==="function") traerVentanaAlFrente(v);

  if(/\b(maximiza|maximizar|grande|amplia|ampliar)\b/.test(q)){
    v.classList.remove("min");
    if(typeof maximizarVentana==="function") maximizarVentana(v);
    else v.classList.add("max");
    return "ventana maximizada.";
  }

  if(/\b(minimiza|minimizar|pequeña|pequena|reduce|reducir)\b/.test(q)){
    if(typeof alternarMinimizarVentana==="function") alternarMinimizarVentana(v);
    return "ventana minimizada.";
  }

  if(/\b(restaura|restaurar|normal)\b/.test(q)){
    if(v.classList.contains("max") && typeof maximizarVentana==="function") maximizarVentana(v);
    else if(v.classList.contains("min") && typeof alternarMinimizarVentana==="function") alternarMinimizarVentana(v);
    return "ventana restaurada.";
  }

  return "";
}

function scrollPorVozIA(q){
  const max=Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  ) - window.innerHeight;

  if(/\b(final|fondo|abajo del todo|último|ultimo)\b/.test(q)){
    window.scrollTo({top:max,behavior:"smooth"});
    return "bajando al final.";
  }

  if(/\b(inicio|principio|arriba del todo)\b/.test(q)){
    window.scrollTo({top:0,behavior:"smooth"});
    return "subiendo al inicio.";
  }

  if(/\b(abajo|baja|bajar|scroll)\b/.test(q)){
    window.scrollBy({top:Math.round(window.innerHeight*.75),behavior:"smooth"});
    return "bajando.";
  }

  if(/\b(arriba|sube|subir)\b/.test(q)){
    window.scrollBy({top:-Math.round(window.innerHeight*.75),behavior:"smooth"});
    return "subiendo.";
  }

  return "";
}

function salidaActualIA(texto){
  const outs=[...document.querySelectorAll(".ia-output")];
  const out=outs.find(el=>getComputedStyle(el).display!=="none") || outs[0] || outs[outs.length-1];
  if(out) out.innerHTML=texto;
  if(typeof hablarRobot==="function"){
    const limpio=String(texto).replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
    hablarRobot(limpio);
  }
}

function ejecutarComandoInterfazIA(raw){
  const q=normalizarTextoIA(raw);
  if(!q) return "";

  if(/\b(callate|cállate|silencio|para de hablar|deja de hablar)\b/.test(q)){
    if("speechSynthesis" in window) speechSynthesis.cancel();
    detenerBocaMicroIA();
    return "__SILENCIO__";
  }

  if(/\b(apagate|apágate|desactivate|desactívate|apaga el micro|apagar micro|micro off)\b/.test(q)){
    if("speechSynthesis" in window) speechSynthesis.cancel();
    if(typeof window.apagarMicroIA==="function") window.apagarMicroIA();
    return "__SILENCIO__";
  }

  if(/\b(cierra|cerrar|elimina|quita)\b/.test(q) && /\b(todo|todas|ventana|ventanas|contacto|portfolio|portafolio|curriculum|cv|ia|chat)\b/.test(q)){
    return cerrarVentanasIA(q);
  }

  if(/\b(maximiza|maximizar|minimiza|minimizar|restaura|restaurar|normal|grande|pequeña|pequena|reduce|reducir)\b/.test(q) && /\b(ventana|contacto|portfolio|portafolio|curriculum|cv|ia|chat|esto|activa)\b/.test(q)){
    const r=cambiarEstadoVentanaIA(q);
    if(r) return r;
  }

  if(/\b(mueve|mover|pon|coloca|desplaza|lleva)\b/.test(q) && /\b(ventana|contacto|portfolio|portafolio|curriculum|cv|ia|chat|esto|activa)\b/.test(q)){
    return moverVentanaIA(q);
  }

  if(/\b(scroll|baja|bajar|sube|subir|final|fondo|inicio|principio|arriba del todo|abajo del todo)\b/.test(q)){
    const r=scrollPorVozIA(q);
    if(r) return r;
  }

  if(/\b(abre|abrir|muestra|enseña|ensena)\b/.test(q)){
    if(q.includes("camara")||q.includes("cámara")||q.includes("reconocimiento")||q.includes("facial")||q.includes("rostro")||q.includes("cara")){
      return "la cámara está desactivada en esta versión para que la web vaya más rápida.";
    }
    if(q.includes("contacto")||q.includes("correo")||q.includes("email")||q.includes("telefono")){
      abrirContenidoIA("contacto");
      return "contacto abierto. correo: mrosalenmarin@gmail.com. teléfono: 603 474 236. ubicación: entre Oviedo y Valencia.";
    }
    if(q.includes("portfolio")||q.includes("portafolio")||q.includes("obra")||q.includes("obras")){
      abrirContenidoIA("portfolio");
      return "portfolio abierto.";
    }
    if(q.includes("curriculum")||q.includes("cv")||q.includes("formacion")||q.includes("formación")){
      abrirContenidoIA("curriculum");
      return "curriculum abierto.";
    }
    if(q.includes("read")||q.includes("sobre")||q.includes("info")){
      abrirContenidoIA("read");
      return "read me abierto.";
    }
    if(q.includes("diseno")||q.includes("diseño")||q.includes("trabajos")){
      abrirContenidoIA("portfolio");
      return "portfolio abierto. diseño gráfico está dentro de su carpeta.";
    }
    if(q.includes("ia")||q.includes("chat")){
      ensureIAVentana();
      return "ventana de IA abierta.";
    }
    const opciones=["portfolio","curriculum","contacto","read"];
    abrirContenidoIA(opciones[Math.floor(Math.random()*opciones.length)]);
    return "he abierto una ventana.";
  }

  if(/\b(correo|email|mail)\b/.test(q) && /\b(cual|cuál|dime|numero|dato|contacto|es)\b/.test(q)){
    abrirContenidoIA("contacto");
    return "el correo es mrosalenmarin@gmail.com.";
  }

  if(/\b(telefono|teléfono|numero|número|movil|móvil)\b/.test(q) && /\b(cual|cuál|dime|contacto|es)\b/.test(q)){
    abrirContenidoIA("contacto");
    return "el número de contacto es 603 474 236.";
  }

  if(/\b(contacto|contactar)\b/.test(q) && /\b(dato|datos|info|informacion|información)\b/.test(q)){
    abrirContenidoIA("contacto");
    return "datos de contacto: mrosalenmarin@gmail.com, teléfono 603 474 236, entre Oviedo y Valencia.";
  }

  if(/\b(reset|reinicia|reiniciar|restaura|restaurar|inicio|arriba|sube)\b/.test(q)){
    if(typeof resetSystem==="function") resetSystem();
    else window.scrollTo({top:0,behavior:"smooth"});
    return "reinicio en marcha.";
  }

  return "";
}

function pareceVozDirigidaAInterfaz(texto){
  const q=normalizarTextoIA(texto);
  if(!q) return false;

  const palabras=q.split(/\s+/).filter(Boolean);
  const tieneVerboComando=/\b(abre|abrir|cierra|cerrar|apagate|apágate|callate|cállate|silencio|muestra|dime|busca|reinicia|reset|sube|subir|baja|bajar|mueve|mover|desplaza|coloca|pon|maximiza|maximizar|minimiza|minimizar|restaura|restaurar|para|apaga)\b/.test(q);
  const tienePregunta=/\b(que|qué|quien|quién|como|cómo|cuando|cuándo|donde|dónde|cual|cuál|por que|por qué)\b/.test(q);
  const invocaSistema=/\b(ia|interfaz|miguel|rosalen|rosalén|contacto|correo|email|telefono|teléfono|portfolio|portafolio|curriculum|ventana|ventanas|derecha|izquierda|arriba|abajo|final|inicio|cerca)\b/.test(q);
  const fraseBasica=/\b(hola|buenas|hey|que tal|qué tal|como estas|cómo estás|si|sí|no|vale|ok|gracias)\b/.test(q);
  const fraseSuficiente=palabras.length>=3 && q.length>=12;

  if(fraseBasica) return true;
  if(tieneVerboComando || (tienePregunta && palabras.length>=2) || (invocaSistema && palabras.length>=2)) return true;
  return fraseSuficiente;
}

function enviarVozAIA(texto){
  const limpio=String(texto||"").trim();
  if(!limpio) return;
  if(limpio.length<3 || !/[a-záéíóúüñ]/i.test(limpio)) return;
  if(!pareceVozDirigidaAInterfaz(limpio)) return;
  if("speechSynthesis" in window) speechSynthesis.cancel();
  detenerBocaMicroIA();

  ensureIAVentana();

  const input=document.querySelector(".ia-input");
  if(!input) return;
  input.value=limpio;
  input.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true}));
}

function prepararMicroIA(){
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  const btn=document.getElementById("microIA");

  if(!btn) return;

  if(!SpeechRecognition){
    btn.disabled=false;
    btn.style.opacity=".82";
    btn.title="voz no disponible: abrir chat";
    btn.onclick=(e)=>{
      e.stopPropagation();
      if(typeof ensureIAVentana==="function") ensureIAVentana();
      setTimeout(()=>{
        const input=document.querySelector(".ia-input");
        if(input){
          input.placeholder="el reconocimiento de voz no está disponible aquí. escribe.";
          input.focus();
        }
        if(typeof salidaActualIA==="function"){
          salidaActualIA("en este navegador no puedo escuchar voz directamente. puedo responder si escribes aquí.");
        }
      },80);
    };
    return;
  }

  const rec=new SpeechRecognition();
  rec.lang="es-ES";
  rec.interimResults=false;
  rec.continuous=true;

  let microActivo=false;
  let microPointerHandled=false;
  let reinicioMicro=null;
  let ultimaEntradaVoz="";
  let ultimaEntradaVozMomento=0;
  let pausadoPorRespuesta=false;
  let reconocimientoCorriendo=false;

  const mostrarAvisoMicrofono=()=>{
    if(document.querySelector(".ventana-micro-aviso")) return;
    const v=document.createElement("section");
    v.className="ventana ventana-micro-aviso";
    v.setAttribute("aria-live","polite");
    v.innerHTML=`<div class="barra"><div>MICRÓFONO</div></div><div class="texto">ahora puedes hablar.<br>la IA te escuchará para responder con más precisión.</div>`;
    const ancho=Math.min(310,Math.max(236,window.innerWidth-32));
    v.style.width=ancho+"px";
    v.style.left=Math.max(16,window.scrollX+window.innerWidth-ancho-22)+"px";
    v.style.top=Math.max(16,window.scrollY+window.innerHeight*.18)+"px";
    v.style.zIndex=String(++ventanaActiva);
    document.body.appendChild(v);
    requestAnimationFrame(()=>v.classList.add("visible"));
    setTimeout(()=>{
      v.classList.remove("visible");
      setTimeout(()=>v.remove(),240);
    },4200);
  };

  const pedirPermisoMicrofonoUnaVez=async()=>{
    if(window._permisoMicroIAConcedido) return true;
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return true;

    try{
      const stream=await navigator.mediaDevices.getUserMedia({
        audio:true,
        video:false
      });
      stream.getTracks().forEach(track=>track.stop());
      window._permisoMicroIAConcedido=true;
      mostrarAvisoMicrofono();
      return true;
    }catch(err){
      return false;
    }
  };

  const iniciarReconocimientoSeguro=(delay=160)=>{
    clearTimeout(reinicioMicro);
    if(!microActivo || pausadoPorRespuesta) return;
    reinicioMicro=setTimeout(()=>{
      if(!microActivo || pausadoPorRespuesta) return;
      if(reconocimientoCorriendo) return;
      try{ rec.start(); }catch(err){}
    },delay);
  };

  const reanudarTrasRespuesta=()=>{
    if(!microActivo) return;
    if(Date.now()-ultimaEntradaVozMomento>6500){
      pausadoPorRespuesta=false;
      btn.classList.add("escuchando");
      btn.title="escuchando";
      iniciarReconocimientoSeguro(180);
      return;
    }
    if("speechSynthesis" in window && (speechSynthesis.speaking || speechSynthesis.pending)){
      setTimeout(reanudarTrasRespuesta,220);
      return;
    }
    pausadoPorRespuesta=false;
    btn.classList.add("escuchando");
    btn.title="escuchando";
    iniciarReconocimientoSeguro(180);
  };

  window.apagarMicroIA=()=>{
    microActivo=false;
    pausadoPorRespuesta=false;
    clearTimeout(reinicioMicro);
    btn.classList.remove("escuchando");
    btn.title="hablar con la IA";
    try{ rec.stop(); }catch(err){}
  };

  const alternarMicro=async(e)=>{
    if(e && e.cancelable) e.preventDefault();
    if(e) e.stopPropagation();

    if(e && e.type==="pointerdown"){
      microPointerHandled=true;
      setTimeout(()=>{ microPointerHandled=false; },420);
    }

    if(e && e.type==="click" && microPointerHandled){
      return;
    }

    if(microActivo){
      window.apagarMicroIA();
      return;
    }

    microActivo=true;
    btn.classList.add("escuchando");
    btn.title="escuchando";

    const permiso=await pedirPermisoMicrofonoUnaVez();
    if(!permiso){
      microActivo=false;
      btn.classList.remove("escuchando");
      btn.title="permiso de micro bloqueado";
      if(typeof salidaActualIA==="function"){
        salidaActualIA("no puedo escuchar todavía: el navegador ha bloqueado el permiso de micrófono.");
      }
      return;
    }

    try{
      if("speechSynthesis" in window) speechSynthesis.cancel();
      pausadoPorRespuesta=false;
      if(!reconocimientoCorriendo) rec.start();
    }catch(err){
      microActivo=false;
      btn.classList.remove("escuchando");
    }
  };

  btn.addEventListener("pointerdown",alternarMicro,{passive:false});
  btn.addEventListener("click",alternarMicro,true);

  rec.onresult=(event)=>{
    if(!microActivo || pausadoPorRespuesta) return;
    let frase="";

    for(let i=event.resultIndex;i<event.results.length;i++){
      const texto=event.results[i][0].transcript;
      if(event.results[i].isFinal){
        frase += " " + texto;
      }
    }

    const limpio=frase.trim();
    const normal=normalizarTextoIA(limpio);
    const ahora=Date.now();

    if(!limpio || !normal || !pareceVozDirigidaAInterfaz(limpio)){
      btn.title="escuchando";
      return;
    }

    if(normal===normalizarTextoIA(ultimaEntradaVoz) && ahora-ultimaEntradaVozMomento<2600){
      btn.title="escuchando";
      return;
    }

    ultimaEntradaVoz=limpio;
    ultimaEntradaVozMomento=ahora;
    pausadoPorRespuesta=true;
    clearTimeout(reinicioMicro);
    btn.title="respondiendo";

    if("speechSynthesis" in window && (speechSynthesis.speaking || speechSynthesis.pending)){
      speechSynthesis.cancel();
      detenerBocaMicroIA();
      window.ultimaVozIASistema=0;
    }

    enviarVozAIA(limpio);
    setTimeout(reanudarTrasRespuesta,700);
  };

  rec.onstart=()=>{
    reconocimientoCorriendo=true;
  };

  rec.onerror=()=>{
    reconocimientoCorriendo=false;
    if(!microActivo) return;
    if(pausadoPorRespuesta) return;
    iniciarReconocimientoSeguro(260);
  };

  rec.onend=()=>{
    reconocimientoCorriendo=false;
    if(microActivo && !pausadoPorRespuesta){
      iniciarReconocimientoSeguro(180);
      return;
    }

    if(microActivo && pausadoPorRespuesta){
      btn.classList.add("escuchando");
      return;
    }

    btn.classList.remove("escuchando");
    btn.title="hablar con la IA";
  };
}

document.addEventListener("DOMContentLoaded",prepararMicroIA);

function actualizarEstadoCamaraBoton(){}

function hablarSola(){
if(window.iaSoloResponderHumanos) return;

function emitir(){

const p=Math.min(
1,
(scrollY/Math.max(1, document.body.scrollHeight-innerHeight))
+
depthMemory*.5
);

updateIAMood(p);

if(p<.48){
  schedule();
  return;
}

if(Math.random() < 0.18){
  ensureIAVentana();
}

const abiertas=
[
...document.querySelectorAll(
".ia-output"
)
];

if(!abiertas.length){
  schedule();
  return;
}

const out=
abiertas[
Math.floor(
Math.random()*
abiertas.length
)
];

let texto;
const visibleScenes=getVisibleSceneTags();

if(visibleScenes.length && Math.random() < 0.45){
  const scene=visibleScenes[Math.floor(Math.random()*visibleScenes.length)];
  const sceneList=iaSceneReplies[scene]||[];
  if(sceneList.length){
    texto=sceneList[Math.floor(Math.random()*sceneList.length)];
  }
}

if(!texto){
  if(Math.random() < 0.32){
    const moodList = iaMoodPhrases[iaMood];
    texto = moodList[Math.floor(Math.random()*moodList.length)];
  } else if(Math.random() < 0.6){
    texto = iaPrompts[Math.floor(Math.random()*iaPrompts.length)];
  } else {
    texto = voces[Math.floor(Math.random()*voces.length)];
  }
}

if(visibleScenes.length && Math.random() < 0.35){
  texto += "\n\n" + describeVisibleContext();
}

if(p>.55 && Math.random() < 0.48){
  texto += "\n\n" + iaReplies[Math.floor(Math.random()*iaReplies.length)];
}

if(p>.82){
  texto=
  texto
  .split("")
  .sort(
  ()=>Math.random()-.5
  )
  .join("");
}

out.innerHTML='<span style="opacity:.5;">pensando...</span>';

setTimeout(()=>{
  out.innerHTML=texto.replace(/\n/g, "<br>");
  playNote(
  "IA",
  Math.random()*10,
  0.7,
  1
  );
  schedule();
},900 + Math.random()*900);
}

function schedule(){
  const fp = window.finalProgress || 0;
  const delayFactor = 1 + fp * 1.8;
setTimeout(emitir, Math.floor((4200 + Math.random()*2600) * delayFactor));
}

schedule();

}

hablarSola();
/* ♾️ VACÍO INFINITO */
function infiniteVoid(){

  if(document.hidden || window.perdido){
    setTimeout(infiniteVoid, 1800);
    return;
  }

  const isMobile = window.isMobileMode;
  const voidLimits = getVoidLimits();

  if(isMobile){

    // 👉 MODO MÓVIL BIDIMENSIONAL:
    // la interfaz continúa hacia la derecha y hacia abajo
    const right = window.scrollX + window.innerWidth;
    const bottom = window.scrollY + window.innerHeight;

    const width = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth
    );

    const height = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight
    );

    let grew = false;

    if(right > width - 260 && width < voidLimits.maxWidth){
      const newWidth = Math.min(
        voidLimits.maxWidth,
        width + 260 + Math.random()*180
      );
      document.body.style.minWidth = newWidth + "px";
      document.documentElement.style.minWidth = newWidth + "px";
      grew = true;
    }

    if(bottom > height - 340 && height < voidLimits.maxHeight){
      const newHeight = Math.min(
        voidLimits.maxHeight,
        height + 360 + Math.random()*220
      );
      document.body.style.minHeight = newHeight + "px";
      document.documentElement.style.minHeight = newHeight + "px";
      grew = true;
    }

    if(grew){
      depthMemory += 0.008;
      depthMemory = Math.min(1, depthMemory);
    }

  } else {

    // MODO ESCRITORIO: el recorrido ya lo da #espacio; no agrandamos el documento en bucle.
    document.body.style.overflowX = "auto";
    document.documentElement.style.overflowX = "auto";

  }

  setTimeout(infiniteVoid, 1800);
}
setTimeout(infiniteVoid, 1800);

/* =========================
   CONTENIDO
========================= */

const contenido=[
["READ ME",`Todo empezó intentando hacer una página web normal.

Una de esas donde las cosas están ordenadas, los proyectos aparecen donde deberían aparecer y alguien puede entender quién eres después de hacer scroll durante treinta segundos.

No salió así.

Mientras la construía fui añadiendo ventanas, sonidos, movimientos, textos, atajos y pequeñas funciones que no estaban previstas. Algunas aparecieron por accidente, otras porque quería probar algo y muchas se quedaron simplemente porque me gustaba que estuvieran ahí.

Poco a poco dejó de tener sentido intentar que pareciera un portfolio convencional.

La web terminó convirtiéndose en una especie de escritorio: un espacio donde los trabajos aparecen repartidos entre ventanas y donde no existe una única forma de recorrerlos.

Puedes navegar de manera directa, entrando en las diferentes secciones, o utilizar teclas y comandos que funcionan como accesos rápidos. No necesitas conocerlos para moverte por la página, pero descubrirlos también forma parte de ella.

Puedes abrir, cerrar, mover y superponer ventanas, dejar algo a medias y volver después. El resultado cambia según cómo decidas utilizarla.

Construirla también ha sido una forma de hablar de cómo trabajo: probar cosas, cambiar de idea, mezclar herramientas, acumular referencias y encontrar relaciones entre elementos que en principio no tenían por qué estar juntos.

Diseño, código, imágenes, sonido y texto terminan compartiendo el mismo espacio.

No hace falta verlo todo ni entender cada función.

De hecho, parte de la idea está precisamente ahí.

Y si en algún momento parece que la página está fallando, puede que simplemente hayas encontrado otra forma de usarla.

Ah, y una última cosa: cuidado con la IA. Lleva demasiado tiempo aquí dentro.

<span class="autoriaWeb">interfaz, escritura y construcción web: Miguel Rosalén</span>`],
[
"CONTACTO",

`<a href="mailto:mrosalenmarin@gmail.com" style="color:inherit;text-decoration:none;">mrosalenmarin@gmail.com</a>

<br><br>

teléfono:

<a href="tel:+34603474236" style="color:inherit;text-decoration:none;cursor:pointer;">603 474 236</a>

<br><br>

ubicación:

<br>

entre Asturias (Oviedo) y Valencia (Valencia)`

],
["CURRICULUM","formación · experiencia"],
["PORTFOLIO","proyectos seleccionados"],
["IA"],
];

let i=0;

function mostrarAvisoProtegido(duracion=1250){
  const anterior=document.querySelector(".aviso-protegido");
  if(anterior) anterior.remove();
  const aviso=document.createElement("div");
  aviso.className="aviso-protegido";
  Object.assign(aviso.style,{
    position:"fixed",inset:"0",zIndex:"2147483647",pointerEvents:"none",
    background:"rgba(238,238,238,.24)",backdropFilter:"blur(28px) saturate(.45)",
    WebkitBackdropFilter:"blur(28px) saturate(.45)"
  });
  document.body.appendChild(aviso);
  setTimeout(()=>aviso.remove(),duracion);
}

document.addEventListener("dragstart",e=>{
  if(e.target.closest(".texto")){
    e.preventDefault();
    mostrarAvisoProtegido();
  }
},true);

document.addEventListener("copy",e=>{
  e.preventDefault();
  mostrarAvisoProtegido();
},true);

document.addEventListener("cut",e=>{
  e.preventDefault();
  mostrarAvisoProtegido();
},true);

document.addEventListener("selectstart",e=>{
  if(!e.target.closest(".texto")) return;
  e.preventDefault();
  mostrarAvisoProtegido();
},true);

document.addEventListener("keydown",e=>{
  const tecla=String(e.key||"").toLowerCase();
  const atajo=(e.ctrlKey||e.metaKey)&&["c","x"].includes(tecla);
  if(atajo){
    e.preventDefault();
    mostrarAvisoProtegido();
  }
},true);

document.addEventListener(
"touchstart",
()=>{
initAudio();
},
{
once:true
}
);

/* =========================
DESBLOQUEO AUDIO MÓVIL
========================= */

window.addEventListener(

"touchstart",

async()=>{

try{

if(!audio){

audio =
new(
window.AudioContext||
window.webkitAudioContext
)();

masterGain=
audio.createGain();

masterGain.connect(
audio.destination
);

masterGain.gain.value=
0.7;

}

await audio.resume();

/* sonido desbloqueo */

const osc=
audio.createOscillator();

const g=
audio.createGain();

g.gain.value=.01;

osc.connect(g);

g.connect(masterGain);

osc.start();

osc.stop(
audio.currentTime+
0.05
);

}catch(e){}

},

{

once:true

}

);

document.addEventListener("click",(e)=>{

if(window._ventanaInteraccion && Date.now()-window._ventanaInteraccion<520) return;
if(e.target.closest("#teclado")) return;
if(e.target.closest("#microIA")) return;
if(e.target.closest("#iaControles")) return;
if(e.target.closest("#menuSistema")) return;

/* no abrir ventanas nuevas si haces click dentro de una ventana */
const ventanaClick = e.target.closest(".ventana");
if(ventanaClick){
  if(typeof traerVentanaAlFrente === "function"){
    traerVentanaAlFrente(ventanaClick);
  }
  return;
}

/* no abrir ventanas nuevas dentro del visor de obra */
if(e.target.closest("#obra")) return;

/* permitir enlaces */
if(e.target.closest("a")){
  return;
}

if(window.perdido) return;

/* dejar funcionar botones */
if(
e.target.closest(".cerrar") ||
e.target.closest(".mini") ||
e.target.closest(".maxi") ||
e.target.closest(".resize")
){
return;
}

if(!audio) return;

   // if we just finished dragging a window, suppress this click (it is the mouseup click)
   if(window._suppressNextClick){
      window._suppressNextClick = false;
      return;
   }

const info=
contenido[
i%
contenido.length
];

const index=
i++;

playNote(
  info[0],
  index,
  1,
  1
);

// if final minute active, add small delay before creating new windows
if(window.finaleActive){
  const delay = Math.floor((window.createDelay || 0) + Math.random() * (window.createDelay || 0));
  setTimeout(()=> crearVentana(e.clientX, e.clientY, info), Math.max(0, delay));
} else {
  crearVentana(e.clientX, e.clientY, info);
}

});
/* =========================
   VENTANAS + IA
========================= */

function textoCurriculumPlano(){
return `
MIGUEL ROSALÉN
artista plástico · diseñador gráfico
Oviedo / Valencia
mrosalenmarin@gmail.com · 603 474 236

// PERFIL
Práctica situada entre artes plásticas, diseño gráfico, edición, imagen digital e instalación. Trabajo con procesos visuales, archivo, interfaz, cuerpo y contexto. Me interesa construir piezas que funcionen como obra, documento y experiencia.

// FORMACIÓN

■ Grado en Bellas Artes
  Facultad San Carlos · Universitat Politècnica de València
  2018–2022
  ↳ Matrículas de honor en asignaturas seleccionadas del Grado en Bellas Artes.

■ Máster en Producción e Investigación en Arte
  Facultad Alonso Cano · Universidad de Granada
  2022–2023

  ↳ Prácticas externas Método alRaso
    Facultad Alonso Cano · UGR · Granada · 2023
    Coordinación del Taller de cometas alRaso, reuniones organizativas, mesas de debate, difusión del programa y acercamiento a la comunidad artística.

  ↳ Programa Dinamizadoras
    Facultad Alonso Cano · UGR · Granada · 2022–2023
    Desarrollo de proyectos culturales y expositivos desde la mediación, el montaje y la activación de comunidad.

  ↳ Curso en Arte y Performance
    CEMED Centro Mediterráneo · Universidad de Granada · 2023
    Colaboración en talleres con Margarita de Aizpuru sobre historia de la performance, feminismo y arte de acción.

// FORMACIÓN COMPLEMENTARIA
■ Producción audiovisual con LEDwall
  HAZ · Instituto de Radiotelevisión Española · 2026

■ Escaparatismo comercial
  ADAMS Formación · 2025

■ Permiso de conducir B

// EXPOSICIONES COLECTIVAS Y PROYECTOS
■ 2025–2026 · Cuerpo Urbano en Acción (Extrema)
  IV Festival Internacional de Performances Mínimas Urbanas · vídeo · exposición colectiva itinerante.

■ 2024 · El cuerpo del hueco
  Performance · Teatro Círculo Benimaclet · colaboración con la Facultad de Bellas Artes UPV · Valencia.

■ 2024 · 5ª Aniversario: Amares
  Instalación · Ruge Rosario · Valencia.

■ 2023 · Alterar lo cotidiano
  Instalación · Sala de exposiciones de la Facultad de Bellas Artes · Granada.

■ 2022 · A 100 segundos de lo que ha de acontecer
  Performance · Teatro Círculo Benimaclet · Valencia.

■ 2021 · MEVArt IX Streaming: Música Electrónica y Videoarte
  Video-performance · Auditori Alfons Roig · Universitat Politècnica de València.

■ 2021 · Naturaleza grabada en hueco
  Comboni College of Science and Technology · Jartum, Sudán.

■ 2021 · 50ª Feria Internacional de la planta y flor
  Iberflora · Valencia.

■ 2021 · Bio-Abstracción
  Grabado · Casa de la Cultura de Quart de Poblet · Valencia.

■ 2021 · Let the Printing Begin
  Grabado · Florida State University · Estados Unidos.

■ 2021 · ODS 14
  Grabado · Universitat Politècnica de València · Valencia.

■ 2021 · Belén Viviente PerformaVIVO
  Performance · Espacio T4 · Facultad de Bellas Artes UPV.

■ 2021 · 3ª Fira Eclèctica d’Art i Creativitats
  Performance · Galería Espai en Blanc · Cocentaina.

■ 2019 · -bis- El Prefacio
  Instalación · Russafa Escènica Festival de Tardor · Valencia.

// HABILIDADES TÉCNICAS
■ Adobe Creative Cloud
  Illustrator · Photoshop · Lightroom · Premiere Pro

■ Web
  HTML · CSS · JavaScript

■ Audiovisual y visual en directo
  Resolume Arena

■ Ofimática y comunicación visual
  Microsoft Office · Canva

■ IA aplicada
  Herramientas de inteligencia artificial generativa como apoyo en procesos creativos, prototipado, edición, documentación y desarrollo web.

// COMPETENCIAS PERSONALES
✦ Creativo
▦ Trabajo en equipo
○ Paciente
■ Responsable
≈ Habilidades comunicativas
▰ Constante
◇ Empático
↗ Proactivo

// INTERESES
Arte · Diseño gráfico · Diseño editorial · Diseño web · Programación · Fotografía · Comunicación · Marketing

// IDIOMAS
Español · Nativo
Valenciano · C1
Inglés · B2
Italiano · A1
`.trim()+"\n";
}

function limpiarLineaASCII(texto=""){
  return String(texto)
    .replace(/[■▦▰◇✦○]/g,"*")
    .replace(/[↳↗]/g,"->")
    .replace(/[·•]/g,"/")
    .replace(/[–—]/g,"-")
    .replace(/\s+/g," ")
    .trim();
}

function envolverTextoASCII(texto,ancho){
  const limpio=limpiarLineaASCII(texto);
  if(!limpio) return [""];
  const sangria=limpio.startsWith("->") ? "  " : limpio.startsWith("*") ? "" : "  ";
  const palabras=limpio.split(" ");
  const lineas=[];
  let linea="";
  palabras.forEach(palabra=>{
    const prueba=linea ? `${linea} ${palabra}` : `${sangria}${palabra}`;
    if(linea && prueba.length>ancho){
      lineas.push(linea);
      linea=`${sangria}${palabra}`;
    }else linea=prueba;
  });
  if(linea) lineas.push(linea);
  return lineas;
}

function cajaCurriculumASCII(titulo,contenido,ancho){
  const interior=ancho-2;
  const etiqueta=`[ ${limpiarLineaASCII(titulo).toUpperCase()} ]`;
  const izquierda=3;
  const derecha=Math.max(1,interior-etiqueta.length-izquierda);
  const arriba=`+${"-".repeat(izquierda)}${etiqueta}${"-".repeat(derecha)}+`;
  const cuerpo=[];
  contenido.forEach(linea=>{
    envolverTextoASCII(linea,interior-2).forEach(parte=>{
      cuerpo.push(`| ${parte.padEnd(interior-2," ")} |`);
    });
  });
  return [arriba,...cuerpo,`+${"-".repeat(interior)}+`].join("\n");
}

function curriculumASCII(anchoSolicitado){
  const ancho=Math.max(42,Math.min(92,anchoSolicitado || (matchMedia("(max-width:620px)").matches ? 44 : 88)));
  const texto=textoCurriculumPlano().split("\n");
  const secciones=[];
  let actual=null;
  texto.slice(5).forEach(linea=>{
    if(linea.startsWith("// ")){
      actual={titulo:linea.slice(3),lineas:[]};
      secciones.push(actual);
    }else if(actual) actual.lineas.push(linea);
  });

  const centro=linea=>{
    const limpio=limpiarLineaASCII(linea).slice(0,ancho);
    return " ".repeat(Math.max(0,Math.floor((ancho-limpio.length)/2)))+limpio;
  };
  const regla=`+${"-".repeat(ancho-2)}+`;
  const cabecera=[
    regla,
    centro(" __  __ ___ ____ _   _ _____ _     "),
    centro("|  \\/  |_ _/ ___| | | | ____| |    "),
    centro("| |\\/| || | |  _| | | |  _| | |    "),
    centro("| |  | || | |_| | |_| | |___| |___ "),
    centro("|_|  |_|___\\____|\\___/|_____|_____|") ,
    "",
    centro(" ____   ___  ____    _    _     _____ _   _ "),
    centro("|  _ \\ / _ \\ ___|  / \\  | |   | ____| \\ | |"),
    centro("| |_) | | | \\___ \\ / _ \\ | |   |  _| |  \\| |"),
    centro("|  _ <| |_| |___) / ___ \\| |___| |___| |\\  |"),
    centro("|_| \\_\\___/|____/_/   \\_\\_____|_____|_| \\_|"),
    "",
    centro("ARTISTA PLASTICO / DISENADOR GRAFICO"),
    centro("OVIEDO / VALENCIA"),
    centro("MROSALENMARIN@GMAIL.COM / 603 474 236"),
    regla
  ];
  const cajas=secciones.map(seccion=>cajaCurriculumASCII(seccion.titulo,seccion.lineas,ancho));
  const pie=[
    regla,
    `|${" ".repeat(ancho-2)}|`,
    centro("[////]   [====]   .-.-.   /|\\   [TXT]   o o o"),
    centro("[____]   [____]  (  :  ) /_|_\\  [___]    \\|/"),
    centro("ARCHIVO / COPIA DE TRABAJO / MIGUEL ROSALEN"),
    regla
  ];
  return [...cabecera,"",...cajas.flatMap(caja=>[caja,""]),...pie].join("\n");
}

function descargarCurriculumTXT(e){
  if(e){
    e.preventDefault();
    e.stopPropagation();
  }
  const a=document.createElement("a");
  a.href="assets/documents/Miguel_Rosalen_Curriculum.pdf";
  a.download="Miguel_Rosalen_Curriculum.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  return false;
}

/* Los minijuegos viven en juegos.html para no penalizar la web principal. */
function activarModoVentana(){}
function desactivarModoVentana(){}
function instalarModoJuegoGlobal(){
  const boton=document.getElementById("modoJuegoGlobal");
  if(!boton || boton.dataset.ready) return;
  boton.dataset.ready="1";
  boton.addEventListener("click",e=>{
    e.preventDefault();
    e.stopPropagation();
    location.href="juegos.html";
  });
}
instalarModoJuegoGlobal();

function coordenadasDocumentoDesdeClick(x,y){
  const sx = window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
  const sy = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

  const nx = Number.isFinite(x) ? x : window.innerWidth / 2;
  const ny = Number.isFinite(y) ? y : window.innerHeight / 2;

  return {
    x: sx + nx,
    y: sy + ny
  };
}

function asegurarLienzoMovil(x, y, extraW = 900, extraH = 900){
  if(!window.isMobileMode) return;

  const doc = document.documentElement;
  const body = document.body;

  const currentW = Math.max(
    body.scrollWidth,
    doc.scrollWidth,
    body.offsetWidth,
    doc.offsetWidth,
    window.innerWidth
  );

  const currentH = Math.max(
    body.scrollHeight,
    doc.scrollHeight,
    body.offsetHeight,
    doc.offsetHeight,
    window.innerHeight
  );

  const targetW = Math.max(currentW, Math.ceil(x + extraW));
  const targetH = Math.max(currentH, Math.ceil(y + extraH));

  body.style.minWidth = targetW + "px";
  doc.style.minWidth = targetW + "px";
  body.style.width = targetW + "px";
  doc.style.width = targetW + "px";

  body.style.minHeight = targetH + "px";
  doc.style.minHeight = targetH + "px";
  body.style.height = targetH + "px";
  doc.style.height = targetH + "px";

  const espacio = document.getElementById("espacio");
  if(espacio){
    espacio.style.width = targetW + "px";
    espacio.style.height = targetH + "px";
  }
}

/* El escritorio de ordenador puede crecer hacia la derecha: las ventanas no
   vuelven al ancho inicial cuando se crean o se arrastran fuera de él. */
function asegurarLienzoEscritorio(x, extraW = 760){
  if(window.isMobileMode) return;

  const doc=document.documentElement;
  const body=document.body;
  const actual=Math.max(
    body.scrollWidth,
    doc.scrollWidth,
    body.offsetWidth,
    doc.offsetWidth,
    window.innerWidth
  );
  const objetivo=Math.max(actual,Math.ceil(x+extraW),window.innerWidth);
  if(objetivo<=actual+1) return;

  [body,doc].forEach(nodo=>{
    nodo.style.setProperty("min-width",objetivo+"px","important");
    nodo.style.setProperty("width",objetivo+"px","important");
  });
  const espacio=document.getElementById("espacio");
  if(espacio) espacio.style.setProperty("width",objetivo+"px","important");
}

/* Un pequeño margen lateral permanente para conservar el escritorio en móvil. */
if(window.isMobileMode){
  requestAnimationFrame(()=>{
    asegurarLienzoMovil(
      window.innerWidth * .18,
      0,
      window.innerWidth * 1.18,
      window.innerHeight
    );
  });
}

function colocarVentanaEnClick(v,x,y){
  const pos = coordenadasDocumentoDesdeClick(x,y);
  const margen = window.isMobileMode ? 10 : 0;
  const anchoMovil=Math.max(180,Math.min(320,window.innerWidth*.66));
  const izquierda=window.isMobileMode
    ? Math.max(margen,pos.x-8)
    : Math.max(margen,pos.x);

  v.style.left = izquierda + "px";
  v.style.top = Math.max(margen, pos.y - (window.isMobileMode ? 8 : 0)) + "px";

  asegurarLienzoMovil(pos.x, pos.y, anchoMovil+72, 620);
  asegurarLienzoEscritorio(pos.x, Math.max(760,parseFloat(v.style.width)||0));
}

function actualizarModoSaturacionVentanas(){
  const total=document.querySelectorAll(".ventana").length;
  document.body.classList.toggle("ventanas-saturadas", total>=8);
}

function aliviarVentanasSiHaceFalta(){
  actualizarModoSaturacionVentanas();
}

if(typeof MutationObserver!=="undefined"){
  let saturacionPendiente=false;
  const obsVentanas=new MutationObserver(()=>{
    if(saturacionPendiente) return;
    saturacionPendiente=true;
    requestAnimationFrame(()=>{
      saturacionPendiente=false;
      actualizarModoSaturacionVentanas();
    });
  });
  if(document.body){
    obsVentanas.observe(document.body,{childList:true});
  }else{
    document.addEventListener("DOMContentLoaded",()=>{
      obsVentanas.observe(document.body,{childList:true});
    },{once:true});
  }
}

function prepararLecturaTactilVentana(v){
  const texto=v?.querySelector(":scope > .texto");
  if(!texto || texto.dataset.lecturaTactil || texto.classList.contains("ia-panel")) return;
  texto.dataset.lecturaTactil="1";
  texto.style.touchAction="pan-y";
  texto.style.webkitOverflowScrolling="touch";
  let inicioY=0,ultimoY=0,ultimoTiempo=0,velocidad=0,activa=false,arrastre=false,cuadro=0;
  const detenerInercia=()=>{
    if(cuadro) cancelAnimationFrame(cuadro);
    cuadro=0;
  };
  const continuar=()=>{
    if(Math.abs(velocidad)<.08){ cuadro=0; return; }
    texto.scrollTop+=velocidad*16;
    velocidad*=.91;
    cuadro=requestAnimationFrame(continuar);
  };
  texto.addEventListener("touchstart",e=>{
    if(!matchMedia("(max-width:768px), (pointer:coarse)").matches || e.touches.length!==1) return;
    detenerInercia();
    inicioY=ultimoY=e.touches[0].clientY;
    ultimoTiempo=performance.now();
    velocidad=0;
    arrastre=false;
    activa=texto.scrollHeight>texto.clientHeight+1;
  },{passive:true});
  texto.addEventListener("touchmove",e=>{
    if(!activa || e.touches.length!==1) return;
    const ahora=performance.now();
    const y=e.touches[0].clientY;
    const delta=ultimoY-y;
    if(Math.abs(delta)<.2) return;
    arrastre=arrastre || Math.abs(y-inicioY)>4;
    const acelerado=delta*1.55;
    texto.scrollTop+=acelerado;
    velocidad=velocidad*.34+(acelerado/Math.max(8,ahora-ultimoTiempo))*.66;
    ultimoY=y;
    ultimoTiempo=ahora;
    window._ventanaScrollInternoHasta=Date.now()+750;
    if(arrastre && e.cancelable) e.preventDefault();
    e.stopPropagation();
  },{passive:false});
  const finalizar=()=>{
    if(!activa) return;
    activa=false;
    if(arrastre){
      velocidad*=10;
      cuadro=requestAnimationFrame(continuar);
    }
  };
  texto.addEventListener("touchend",finalizar,{passive:true});
  texto.addEventListener("touchcancel",finalizar,{passive:true});
}

function crearVentana(x,y,info){

  if(!info || !info[0]) return;

  if(typeof penalizarTiempo==="function" && !["IA"].includes(info[0])){
    penalizarTiempo(10, "ventana");
  }

  aliviarVentanasSiHaceFalta();

const v=document.createElement("div");
v.style.zIndex=
ventanaActiva++;
v.dataset.tipo=
info?.[0]
||
"";

v.className="ventana";

const p=
Math.min(
1,
(scrollY/
(
Math.max(1, document.body.scrollHeight-innerHeight)
))
+
depthMemory*.35
);

v.style.width=
(
260+
Math.random()*180
)
*
(
1-p*.5
)
+
"px";

if(info[0]==="RECONOCIMIENTO"){
  v.classList.add("ventana-reconocimiento");
  v.style.width="min(980px, calc(100vw - 48px))";
  v.style.height="min(760px, calc(100vh - 72px))";
  v.style.left=Math.max(18,Math.min(window.innerWidth-340,24))+"px";
  v.style.top=((window.scrollY||0)+24)+"px";
}

/* colocar exactamente donde se pulsa:
   - desktop: coordenada visible + scroll vertical
   - móvil: coordenada del dedo + scroll horizontal + scroll vertical */
colocarVentanaEnClick(v,x,y);

if(info[0]==="RECONOCIMIENTO"){
  v.classList.add("ventana-reconocimiento");
  v.style.width="min(980px, calc(100vw - 48px))";
  v.style.height="min(760px, calc(100vh - 72px))";
  v.style.left="24px";
  v.style.top=((window.scrollY||0)+24)+"px";
}
/* PORTFOLIO */

if(info[0]==="PORTFOLIO"){

v.innerHTML=`

<div class="barra">

<div>PORTFOLIO</div>

<div style="display:flex;gap:10px">

<div class="btn mini">—</div>

<div class="btn maxi">□</div>

<div class="btn cerrar">×</div>

</div>

</div>

<div class="portfolio-wrap">

<button class="portfolio-back" type="button" title="volver atrás" aria-label="volver atrás">back</button>

<div class="coverNav prev">

➤

</div>

<div class="coverNav next">

➤

</div>

<div class="track"></div>

<div class="portfolio-empty"></div>

<div class="portfolio-meta">

<em data-portfolio-title></em><br>
<span data-portfolio-detail></span>

</div>

</div>


`;

requestAnimationFrame(()=>{
  renderPortfolioHome(v);
});

const volverPortfolio=v.querySelector(".portfolio-back");
if(volverPortfolio){
  volverPortfolio.addEventListener("pointerdown",e=>e.stopPropagation(),{passive:true});
  volverPortfolio.addEventListener("click",e=>{
    e.stopPropagation();
    if(v._portfolioSubParent && v._portfolioParent){
      renderPortfolioSubsection(v,v._portfolioParent,v._portfolioSubParent);
    }else if(v._portfolioParent){
      renderPortfolioSection(v, v._portfolioParent);
    }else{
      renderPortfolioHome(v);
    }
  });
}

v.querySelectorAll(".coverNav").forEach(el=>{
  el.addEventListener("pointerdown",e=>{
    e.stopPropagation();
  },{passive:true});
  el.addEventListener("click",e=>{
    e.stopPropagation();
  });
});
/* botones portfolio */
/* =========================
BOTONES VENTANA
========================= */

const cerrar =
v.querySelector(".cerrar");

const mini =
v.querySelector(".mini");

const maxi =
v.querySelector(".maxi");

/* cerrar */

cerrar.onclick=(e)=>{

e.stopPropagation();

if(typeof v._faceCleanup==="function") v._faceCleanup();
v.remove();

};

/* minimizar */

mini.onclick=(e)=>{
  e.preventDefault();
  e.stopPropagation();
  alternarMinimizarVentana(v);
};

/* maximizar */

maxi.onclick=(e)=>{

e.stopPropagation();

/* salir de minimizada */

if(
v.classList.contains("min")
){

v.classList.remove("min");

v.style.width=
v.dataset.w+"px";

v.style.height=
v.dataset.h+"px";

}

v.classList.toggle(
"max"
);
if(
v.classList.contains(
"max"
)
){

document
.querySelectorAll(
".ventana")
.forEach(
w=>{

if(
w!==v
){

w.style.display=
"none";

}

}
);

}

else{

document
.querySelectorAll(
".ventana")
.forEach(
w=>{

if(
w!==v
){

w.style.display=
"";

}

}
);

}

};
if(
v.classList.contains(
"max"
)
){

v.style.zIndex=
999999;

}

else{

v.style.zIndex=
++ultimaVentana;

}
/* ARRRASTRAR- permitir arrastrar las ventanas */
if(false){
   let draggingLocal = false;
   const barraLocal = v.querySelector('.barra');
   if(barraLocal){
      let offsetX = 0, offsetY = 0;
      barraLocal.addEventListener('mousedown', (e)=>{
         if(e.target.classList.contains('btn')) return;
         if(v.classList.contains('max')) return;
         if(e.cancelable) e.preventDefault();
         e.stopPropagation();
         draggingLocal = true;
         v.classList.add('dragging');
v.style.zIndex =
++ultimaVentana;
document
.querySelectorAll(
".ventana"
)
.forEach(
w=>{

if(
w!==v
){

w.classList.remove(
"activa"
);

}

}
);

v.classList.add(
"activa"
);
        offsetX = (window.scrollX + e.clientX) - v.offsetLeft;
        offsetY = (window.scrollY + e.clientY) - v.offsetTop;
         document.body.style.userSelect = 'none';
      });

      document.addEventListener('mousemove', (e)=>{
         if(!draggingLocal) return;
         if(e.cancelable) e.preventDefault();
          const nx = (window.scrollX + e.clientX) - offsetX;
          const ny = (window.scrollY + e.clientY) - offsetY;
         v.style.left = nx + 'px';
         v.style.top = ny + 'px';
         if(window.isMobileMode && typeof asegurarLienzoMovil==="function"){
            asegurarLienzoMovil(nx, ny, v.offsetWidth, v.offsetHeight);
         }
      });

      document.addEventListener('mouseup', ()=>{
         if(draggingLocal){
            window._suppressNextClick = true;
            setTimeout(()=>{ window._suppressNextClick = false; }, 600);
         }
         draggingLocal = false;
         document.body.style.userSelect = 'auto';
         try{ v.classList.remove('dragging'); }catch(e){}
      });
   }
}
document.body.appendChild(v);
if(typeof traerVentanaAlFrente==="function"){
  traerVentanaAlFrente(v);
}
actualizarModoSaturacionVentanas();
return;

}

let inner=`
<div class="barra">
<div>${info[0]}</div>
<div style="display:flex;gap:10px;">
<div class="btn mini">—</div>
<div class="btn maxi">□</div>
<div class="btn cerrar">×</div>
</div>
</div>

<div class="doble space">${info[2]||""}</div>
<div class="texto">${info[1]||""}</div>
`;

if(info[0]==="TIEMPO"){
  v.classList.add("ventana-tiempo");
  v.style.width="min(470px,calc(100vw - 32px))";
  v.style.height="min(650px,calc(100dvh - 70px))";
  inner=`
<div class="barra"><div>TIEMPO</div><div style="display:flex;gap:10px"><div class="btn mini">—</div><div class="btn maxi">□</div><div class="btn cerrar">×</div></div></div>
<div class="texto"><article class="tiempo-panel">
  <h2>¿QUÉ LE PASA AL TIEMPO?</h2>
  <p>Aquí el tiempo no pasa igual.<br>Tienes 10 minutos, pero navegar también los consume.</p>
  <table aria-label="Acciones que consumen tiempo"><thead><tr><th>ACCIÓN</th><th>TIEMPO</th></tr></thead><tbody>
    <tr><td>abrir una ventana</td><td>−10 s</td></tr>
    <tr><td>seguir bajando</td><td>−1 s / 180 px</td></tr>
    <tr><td>preguntar por el tiempo a la IA</td><td>−30 s</td></tr>
  </tbody></table>
  <div class="tiempo-movil">móvil: −1 s / 210 px</div>
  <p class="tiempo-cierre">Cuanto más intentas recorrer la página, menos tiempo tienes para hacerlo.</p>
  <p>No necesitas verlo todo.<br>Probablemente no puedas.</p>
  <p>00:00 → la web decide que has terminado.</p>
  <p class="tiempo-final">EL TIEMPO TAMBIÉN FORMA PARTE<br>DE LA INTERFAZ.</p>
</article></div>`;
}


/* =========================
CURRICULUM VIVO
========================= */

if(
info[0]==="CURRICULUM"
){

v.classList.add("ventana-curriculum");

inner=`

<div class="barra">

<div>
CURRICULUM <span class="cv-descarga-wrap">&gt; <button type="button" class="cv-descarga-link" style="appearance:none;border:0;background:none;padding:0;color:inherit;text-decoration:underline;cursor:pointer;font:inherit;">descargar</button></span>
</div>

<div style="display:flex;gap:10px">

<div class="btn mini">—</div>

<div class="btn maxi">□</div>

<div class="btn cerrar">×</div>

</div>

</div>

<div
class="texto cv"
style="
min-height:420px;
white-space:pre-line;
font-size:11px;
line-height:1.72;
letter-spacing:.02em;
">

</div>

<div class="cv-herramientas" role="toolbar" aria-label="herramientas del currículum" hidden>
  <button type="button" class="cv-herramienta activa" data-cv-tool="mover" title="mover y leer" aria-label="mover y leer">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 3 14 9-6.5 1.5L9 20z"></path></svg>
  </button>
  <button type="button" class="cv-herramienta" data-cv-tool="lapiz" title="lápiz" aria-label="lápiz">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"></path></svg>
  </button>
  <button type="button" class="cv-herramienta" data-cv-tool="tijeras" title="tijeras" aria-label="tijeras">
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="7" r="3"></circle><circle cx="6" cy="17" r="3"></circle><path d="m8.6 8.5 11.4 6.8"></path><path d="m8.6 15.5 11.4-6.8"></path></svg>
  </button>
  <button type="button" class="cv-herramienta" data-cv-tool="sello" title="sello" aria-label="sello">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18h12"></path><path d="M7 22h10"></path><path d="M8 18v-2a4 4 0 0 1 4-4 4 4 0 0 1 4 4v2"></path><path d="M12 12V4"></path><path d="M9 4h6"></path></svg>
  </button>
  <button type="button" class="cv-herramienta" data-cv-action="limpiar" title="limpiar mesa" aria-label="limpiar mesa">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="m19 6-1 14H6L5 6"></path><path d="M10 11v5"></path><path d="M14 11v5"></path></svg>
  </button>
</div>

`;

}
if(info[0]==="IA"){

inner=`
<div class="barra ia-barra">
<div>IA · sistemas</div>
<div style="display:flex;gap:10px;">
<div class="btn mini">—</div>
<div class="btn maxi">□</div>
<div class="btn cerrar">×</div>
</div>
</div>

<div class="texto ia-panel">

<div class="ia-output" aria-live="polite"></div>

<div class="ia-sugerencias">
<button type="button">¿qué le pasa al tiempo aquí?</button>
<button type="button">¿cómo salgo?</button>
<button type="button">¿me recuerdas?</button>
<button type="button">¿quién es Miguel?</button>
<button type="button">abre portfolio</button>
<button type="button">cierra ventanas</button>
</div>

<form class="ia-form">
<input class="ia-input" placeholder="pregunta o da una orden..." autocomplete="off" />
<button class="ia-send" type="submit">enviar</button>
</form>

</div>
`;
}

if(info[0]==="RECONOCIMIENTO"){

inner=`
<div class="barra">
<div>RECONOCIMIENTO BIOMÉTRICO</div>
<div style="display:flex;gap:10px;">
<div class="btn mini">—</div>
<div class="btn maxi">□</div>
<div class="btn cerrar">×</div>
</div>
</div>

<div class="texto">
<div class="face-rec">
<video class="face-video" autoplay muted playsinline></video>
<canvas class="face-canvas"></canvas>
<div class="face-loading">
<div class="face-loading-inner">
<div data-face-loading-text>cargando modelo biométrico</div>
<div class="face-loading-dots"><i></i><i></i><i></i></div>
</div>
</div>
<div class="face-status">esperando cámara...</div>
</div>
</div>
`;

}

v.innerHTML=inner;

if(!["CURRICULUM","IA","TIEMPO","RECONOCIMIENTO"].includes(info[0])){
  v.classList.add("ventana-lectura");
}
prepararLecturaTactilVentana(v);

v.addEventListener(
"pointerdown",
(e)=>{

if(
window.isMobileMode
||
e.pointerType==="touch"
||
e.pointerType==="pen"
||
(e.target.closest && e.target.closest(".texto"))
){
return;
}

if(
v.classList.contains(
"subiendo"
)
)
return;
if(

e.target.closest
&&

(

e.target.closest(
".ia-sugerencias"
)

||

e.target.closest(
".ia-input"
)

||

e.target.closest(
".ia-send"
)

||

e.target.closest(
".btn"
)

||

e.target.tagName==="BUTTON"

)

){

return;

}

v.classList.add(
"subiendo"
);

v.style.transition=
".12s";

v.style.scale=
".4";

v.style.opacity=
".4";

setTimeout(()=>{

v.style.zIndex=
++ultimaVentana;

v.style.scale=
"1";

v.style.opacity=
"1";

setTimeout(()=>{

v.classList.remove(
"subiendo"
);

},120);

},120);

}
);

document.body.appendChild(v);
if(typeof traerVentanaAlFrente==="function"){
  traerVentanaAlFrente(v);
}
if(info[0]==="RECONOCIMIENTO"){
  iniciarReconocimientoFacial(v);
}
v.addEventListener(
"mousedown",
function(e){

if(
window.isMobileMode
||
(e.target.closest && e.target.closest(".texto"))
){
return;
}

if(

e.target.closest(
".btn"
)

||

e.target.closest(
".coverNav"
)

||

e.target.closest(
".ia-input"
)

||

e.target.closest(
".ia-send"
)

||

e.target.tagName==="INPUT"

||

e.target.tagName==="BUTTON"

){

return;

}

if(
v.classList.contains(
"subiendo"
)
){
return;
}

v.classList.add(
"subiendo"
);

v.style.transition=
".15s";

v.style.transform=
"scale(.04)";

v.style.opacity=
".5";

setTimeout(()=>{

v.style.zIndex=
++ultimaVentana;

v.style.transform=
"scale(1)";

v.style.opacity=
"1";

setTimeout(()=>{

v.classList.remove(
"subiendo"
);

},120);

},70);

}
);

/* =========================
BOTONES GENERALES
========================= */

const cerrar =
v.querySelector(".cerrar");

const mini =
v.querySelector(".mini");

const maxi =
v.querySelector(".maxi");

const cvDescarga =
v.querySelector(".cv-descarga-link");

if(cvDescarga){
  cvDescarga.addEventListener("pointerdown",e=>e.stopPropagation(),{passive:true});
  cvDescarga.addEventListener("click",descargarCurriculumTXT);
}

if(cerrar){

cerrar.onclick=(e)=>{

e.stopPropagation();

v.remove();

};

}

if(mini){

mini.onclick=(e)=>{
  e.preventDefault();
  e.stopPropagation();
  alternarMinimizarVentana(v);
};

}

if(maxi){

maxi.onclick=(e)=>{

e.stopPropagation();

/* restaurar si estaba minimizada */

if(
v.classList.contains("min")
){

v.classList.remove("min");

v.style.width=
v.dataset.w+"px";

v.style.height=
v.dataset.h+"px";

}

v.classList.toggle(
"max"
);

/* si está maximizada */

if(
v.classList.contains(
"max"
)
){

document
.querySelectorAll(
".ventana"
)
.forEach(
w=>{

if(
w!==v
){

w.style.zIndex=
1;

}

}
);

v.style.zIndex=
9999;

}

/* volver normal */

else{

document
.querySelectorAll(
".ventana"
)
.forEach(
(
w,
i
)=>{

w.style.zIndex=
100+i;

}
);

}

};

}

/* =========================
ESCRITURA CURRICULUM
========================= */

if(
info[0]==="CURRICULUM"
){

const out=
v.querySelector(
".cv"
);
v.style.display="flex";

v.style.flexDirection="column";

v.style.height="80vh";

out.style.flex="1";

out.style.minHeight="0";

out.style.height="100%";

out.style.overflowY="scroll";

out.style.scrollbarGutter="stable";

const texto=textoCurriculumPlano();

let i=0;

let contenido="";

function escribir(){

if(
!document.body.contains(v)
)
return;

if(v._cvEscrituraDetenida) return;

if(
i>=texto.length
){

out.innerHTML=
contenido+"▌";

return;

}

/* provocar error */

if(
Math.random()<0.035 &&
texto[i]!==" "
){

let palabra="";
let j=i;

while(
j<texto.length &&
texto[j]!==" " &&
texto[j]!=="\n"
){

palabra+=texto[j];
j++;

}

if(
palabra.length>4
){

let error=
palabra
.split("");

const pos=
Math.floor(
Math.random()*
error.length
);

error[pos]="x";

let mal=
error.join("");

let k=0;

/* escribir palabra mal */

function escribirError(){

if(v._cvEscrituraDetenida) return;

if(
k<mal.length
){

contenido+=
mal[k];

out.innerHTML=
contenido+"▌";

k++;

setTimeout(
escribirError,
10+
Math.random()*14
);

}

else{

setTimeout(
borrarReal,
80
);

}

}

function borrarReal(){

if(v._cvEscrituraDetenida) return;

if(
contenido.length>0 &&
mal.length>0
){

contenido=
contenido.slice(
0,-1);

mal=
mal.slice(
0,-1);

out.innerHTML=
contenido+"▌";

setTimeout(
borrarReal,
12
);

}

else{

corregirReal();

}

}

function corregirReal(){

let c=0;

function escribirBien(){

if(v._cvEscrituraDetenida) return;

if(
c<
palabra.length
){

contenido+=
palabra[c];

out.innerHTML=
contenido+"▌";

c++;

setTimeout(

escribirBien,

12

);

}

else{

i+=
palabra.length;

setTimeout(

escribir,

55

);

}

}

escribirBien();

}
escribirError();

return;

}

}

/* normal */

contenido+=
texto[i];

out.innerHTML=
contenido+"▌";

i++;

setTimeout(

escribir,

5+
Math.random()*12

);

}

setTimeout(
escribir,
90
);

}

/* =========================
ARRASTRAR VENTANAS
========================= */

let dragging = false;

const barra = v.querySelector(".barra");

if (barra){

let offsetX = 0;
let offsetY = 0;

barra.addEventListener("pointerdown",(e)=>{

/* no arrastrar si pulsa botones */

if(
e.target.classList.contains("btn")
) return;

/* no mover maximizada */

if(
v.classList.contains("max")
) return;

if(e.cancelable) e.preventDefault();
e.stopPropagation();
dragging = true;
   v.classList.add('dragging');
barra.setPointerCapture(e.pointerId);

/* traer delante */

v.style.zIndex = Date.now();

/* guardar diferencia */

offsetX =
(window.scrollX + e.clientX) -
v.offsetLeft;

offsetY =
(window.scrollY + e.clientY) -
v.offsetTop;

document.body.style.userSelect =
"none";

});

document.addEventListener(
"pointermove",
(e)=>{

if(!dragging)
return;

if(e.cancelable) e.preventDefault();
const nx =
(window.scrollX + e.clientX) -
offsetX;

const ny =
(window.scrollY + e.clientY) -
offsetY;

/* mover */

v.style.left =
nx +
"px";

v.style.top =
ny +
"px";

if(window.isMobileMode && typeof asegurarLienzoMovil==="function"){
asegurarLienzoMovil(nx, ny, v.offsetWidth, v.offsetHeight);
}

});

document.addEventListener(
"pointerup",
()=>{

// if we were dragging, set a short-lived flag to suppress the following click
if(dragging){
   window._suppressNextClick = true;
   // clear after short timeout in case no click follows
   setTimeout(()=>{ window._suppressNextClick = false; }, 600);
}

dragging=false;

document.body.style.userSelect=
"auto";

try{ v.classList.remove('dragging'); }catch(e){}

});

// remove dragging class on mouseup in case it's still present
document.addEventListener('mouseup', ()=>{
   try{ v.classList.remove('dragging'); }catch(e){}
}, {passive:true});

}

/* IA */
if(info[0]==="IA"){

v.style.width=
"min(600px,80vw)";
v.style.minHeight=
"420px";

const input=v.querySelector(".ia-input");
const sendBtn=v.querySelector(".ia-send");
const output=v.querySelector(".ia-output");
const form=v.querySelector(".ia-form");
const sugerencias=v.querySelector(".ia-sugerencias");

v.classList.add("ventana-ia");

if(sendBtn){
sendBtn.style.pointerEvents="auto";
sendBtn.style.touchAction="manipulation";
}

if(sugerencias){
sugerencias.querySelectorAll("button").forEach(btn=>{
btn.addEventListener("pointerdown",e=>{
if(e.cancelable) e.preventDefault();
e.stopPropagation();
input.value=btn.textContent.trim();
procesarEntradaIA();
setTimeout(()=>input.focus(),40);
},{passive:false});
});
}

function procesarEntradaIA(){

const raw=input.value.trim();
if(!raw) return;
if(typeof desbloquearVozMovil==="function") desbloquearVozMovil();
if("speechSynthesis" in window) speechSynthesis.cancel();
if(esContenidoNoRespondibleIA(raw)){
  input.value="";
  output.textContent="Este mensaje no se acepta aquí.";
  return;
}

const q=raw.toLowerCase();
input.value="";

const p=Math.min(1,(scrollY/Math.max(1, document.body.scrollHeight-innerHeight))+depthMemory*0.5);
const sceneDescription=describeVisibleContext();
const sceneTags=getVisibleSceneTags();

const comandoIA=ejecutarComandoInterfazIA(raw);
if(comandoIA==="__SILENCIO__"){
  output.innerHTML="";
  return;
}
let r=comandoIA || generateIARawResponse(raw, p, sceneDescription, sceneTags);
const iaTurnId=String(Date.now())+"-"+Math.random().toString(16).slice(2);
output.dataset.iaTurnId=iaTurnId;
const respuestaExternaPromise = comandoIA ? Promise.resolve("") : consultarIAExterna(raw, p, sceneDescription, sceneTags);
respuestaExternaPromise.then(respuestaExterna=>{
  if(!respuestaExterna) return;
  if(output.dataset.iaTurnId!==iaTurnId) return;
  rememberIATurn("ia-web", respuestaExterna);
  output.innerHTML=respuestaExterna.replace(/\n/g,"<br>");
  output.scrollTop=output.scrollHeight;
  if(typeof hablarRobot==="function"){
    hablarRobot(respuestaExterna);
  }
}).catch(()=>{});
function ejecutarAccionIA(
pregunta,
respuesta
){

const q=
pregunta.toLowerCase();

if(
q.includes(
"tiempo"
)
){

if(typeof penalizarTiempo==="function"){
penalizarTiempo(60,"ia");
}

}

if(
q.includes(
"salgo"
)
){

const ventanas=
document.querySelectorAll(
".ventana"
);

if(
ventanas.length>1
){

ventanas[
Math.floor(
Math.random()*
ventanas.length
)

].remove();

}

}

if(
q.includes(
"recuerdas"
)
){

document.body.style.filter=
"blur(6px)";

setTimeout(()=>{

document.body.style.filter="";

},1200);

}

if(
q.includes(
"abre"
)){

abrirContenidoIA("portfolio");

}

}
rememberIATurn('user', raw);
rememberIATurn('ia', r);

output.style.opacity=0;

setTimeout(()=>{

output.innerHTML=r;
output.scrollTop=output.scrollHeight;
hablarRobot(r);
if(
r.includes(
"el tiempo aquí"
)
){

if(typeof penalizarTiempo==="function"){
penalizarTiempo(30,"ia");
}

document.body.style.transition=
".3s";

document.body.style.opacity=
".6";

setTimeout(()=>{

document.body.style.opacity=1;

},300);

}

if(
raw
.toLowerCase()
.includes(
"abre"
)
){

const posibles = [...document.querySelectorAll(".ventana")]
  .filter(v => v.dataset.tipo !== "IA");

const info=

posibles[
Math.floor(
Math.random()*
posibles.length
)
];

r=
[
"¿ves?",

"ya está.",

"he movido algo.",

"ahora hay una más.",

"esto cambia rápido.",

"prueba otra vez.",

"ya no es igual."

][
Math.floor(
Math.random()*7
)
];

output.innerHTML=r;
hablarRobot(r);
crearVentana(

120+
Math.random()*
(
window.innerWidth-
300
),

120+
Math.random()*
300,

info

);

}


if(

raw
.toLowerCase()
.includes(
"cierra"
)

||

raw
.toLowerCase()
.includes(
"quita"
)

||

raw
.toLowerCase()
.includes(
"elimina"
)

){

const candidatas=

[
...document.querySelectorAll(
".ventana")
]

.filter(

v=>

v.dataset.tipo
!=="IA"

);

if(
candidatas.length
){
  

const cerrar=

candidatas[
Math.floor(
Math.random()*
candidatas.length
)
];

cerrar.style.transition=
".5s";

cerrar.style.opacity=
0;

r=
[
"¿ves?",

"menos.",

"una posibilidad menos.",

"algo desapareció.",

"ya no está.",

"he simplificado esto.",

"ahora queda menos."

][
Math.floor(
Math.random()*7
)
];

output.innerHTML=r;
hablarRobot(r);
cerrar.style.transition=
".5s";

cerrar.style.opacity=
0;

setTimeout(()=>{

cerrar.remove();

},500);

}

}

if(

raw
.toLowerCase()
.includes(
"recuerdas"
)

){

document.body.style.transition=
".8s";

document.body.style.filter=
"blur(5px)";

document
.querySelectorAll(
".ventana"
)
.forEach(v=>{

v.style.transform=
`translate(
${Math.random()*40-20}px,
${Math.random()*40-20}px
)`;

});

setTimeout(()=>{

document.body.style.filter=
"";

document
.querySelectorAll(
".ventana"
)
.forEach(v=>{

v.style.transform=
"";

});

},1500);

}

output.style.opacity=1;
output.scrollTop=output.scrollHeight;

},70);

playNote("IA",Math.floor(Math.random()*10),0.8,1);

}

input.addEventListener("keydown",e=>{
if(e.key!=="Enter") return;
if(e.cancelable) e.preventDefault();
procesarEntradaIA();
});

if(form){
form.addEventListener("submit",e=>{
if(e.cancelable) e.preventDefault();
e.stopPropagation();
procesarEntradaIA();
setTimeout(()=>input.focus(),40);
});
}

if(sendBtn){
sendBtn.addEventListener("pointerdown",e=>{
if(e.cancelable) e.preventDefault();
e.stopPropagation();
procesarEntradaIA();
setTimeout(()=>input.focus(),40);
},{passive:false});
}

}

}

let ticking = false;
let ultimoVisualScrollKey = "";

window._ventanaScrollInternoHasta = 0;
window._textoVentanaTactil = null;

document.addEventListener("touchstart",(e)=>{
  const texto=e.target.closest(".ventana .texto");
  if(texto){
    window._ventanaScrollInternoHasta = Date.now() + 900;
    window._textoVentanaTactil = {
      el:texto,
      y:e.touches && e.touches[0] ? e.touches[0].clientY : 0
    };
  }
},{passive:true,capture:true});

document.addEventListener("touchmove",(e)=>{
  const texto=e.target.closest(".ventana .texto");
  if(texto){
    window._ventanaScrollInternoHasta = Date.now() + 900;
    const touch=e.touches && e.touches[0];
    const y=touch ? touch.clientY : 0;
    window._textoVentanaTactil = {el:texto,y};
  }
},{passive:true,capture:true});

document.addEventListener("touchend",()=>{
  window._textoVentanaTactil = null;
},{passive:true,capture:true});

document.addEventListener("touchcancel",()=>{
  window._textoVentanaTactil = null;
},{passive:true,capture:true});

let pinchVistaDistancia=0;
let pinchVistaActivo=false;
let ultimoToqueFondo=0;

function distanciaToques(touches){
  if(!touches || touches.length<2) return 0;
  const a=touches[0];
  const b=touches[1];
  return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
}

function activarVistaReducida(){
  document.body.classList.add("modo-vista-reducida");
  document.querySelectorAll(".ventana:not(.max)").forEach((v,i)=>{
    v.style.setProperty("--vista-y",(i*8)+"px");
  });
}

function desactivarVistaReducida(){
  document.body.classList.remove("modo-vista-reducida");
}

function salirModosTactiles(){
  desactivarVistaReducida();
}

document.addEventListener("touchstart",(e)=>{
  if(e.touches && e.touches.length===2){
    pinchVistaDistancia=distanciaToques(e.touches);
    pinchVistaActivo=true;
  }

  if(e.touches && e.touches.length===1 && !e.target.closest(".ventana")){
    const ahora=Date.now();
    if(
      ahora-ultimoToqueFondo<320
      && (
        document.body.classList.contains("modo-vista-reducida")
      )
    ){
      salirModosTactiles();
    }
    ultimoToqueFondo=ahora;
  }
},{passive:true,capture:true});

document.addEventListener("touchmove",(e)=>{
  if(!pinchVistaActivo || !e.touches || e.touches.length!==2) return;
  const d=distanciaToques(e.touches);
  if(!d || !pinchVistaDistancia) return;
  const ratio=d/pinchVistaDistancia;

  if(ratio<.86){
    if(e.cancelable) e.preventDefault();
    activarVistaReducida();
  }else if(ratio>1.14){
    if(e.cancelable) e.preventDefault();
    desactivarVistaReducida();
  }
},{passive:false,capture:true});

document.addEventListener("touchend",(e)=>{
  if(!e.touches || e.touches.length<2){
    pinchVistaActivo=false;
    pinchVistaDistancia=0;
  }
},{passive:true,capture:true});

document.addEventListener("wheel",(e)=>{
  if(e.target.closest(".ventana .texto")){
    window._ventanaScrollInternoHasta = Date.now() + 450;
    e.stopPropagation();
  }
},{passive:true,capture:true});

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      manejarScrollUnificado();
      ticking = false;
    });
    ticking = true;
  }
});

function manejarScrollUnificado(){

  if(document.hidden) return;
  if(window.isMobileMode && Date.now() < (window._ventanaScrollInternoHasta || 0)){
    return;
  }
  if(document.body.classList.contains("ventana-max-activa")){
    ajustarTodasMaximizadas();
    return;
  }

  if(typeof penalizarTiempoPorScroll==="function"){
    penalizarTiempoPorScroll();
  }

  if(scrollY < innerHeight * 0.12){
    if(!interfazRestauradaArriba){
      restaurarInterfazPresentacion();
      interfazRestauradaArriba=true;
    }
  }else{
    interfazRestauradaArriba=false;
  }

  const max = Math.max(1, document.body.scrollHeight - innerHeight);
  const p = Math.min(1, (scrollY / max) + depthMemory * 0.35);
  window.iaVoiceDepth=p;
  abrirInterferenciaIA(p);
  const caosInicio = window.isMobileMode ? 0.32 : 0.18;
  const caosBase = Math.max(0, (p - caosInicio) / Math.max(0.01, 1 - caosInicio));
  const caosSuave = caosBase * caosBase * (3 - 2 * caosBase);
  const visualP = Math.min(caosSuave * (window.isMobileMode ? 0.38 : 0.46), window.isMobileMode ? 0.38 : 0.46);

  const ventanas = document.querySelectorAll(".ventana");
  document.body.classList.remove("backroom-activa");
  const visualKey = `${ventanas.length}|${document.body.classList.contains("ventana-max-activa") ? 1 : 0}`;
  const actualizarVentanas = visualKey !== ultimoVisualScrollKey;
  if(actualizarVentanas) ultimoVisualScrollKey = visualKey;

  if(actualizarVentanas){
  ventanas.forEach((v, n) => {

    if(v.classList.contains("max") || v.classList.contains("dragging")){
      v.style.transform = "none";
      v.style.filter = "none";
      v.style.opacity = "1";
      v.style.setProperty("--backroom", "0");
      const textoLimpio=v.querySelector(".texto");
      if(textoLimpio){
        textoLimpio.style.transform = "none";
        textoLimpio.style.opacity = "";
      }
      return;
    }

    v.style.opacity = "1";
    v.style.transform = v.dataset.interferenciaTransform || "none";
    v.style.setProperty("--backroom", "0");
    v.style.setProperty("--glitch-x", "0px");
    v.style.setProperty("--glitch-y", "0px");
    v.style.setProperty("--glitch-r", "0deg");

    v.style.filter = "none";

    const texto=v.querySelector(".texto");
    if(texto){
      texto.style.transform = "none";
      texto.style.opacity = "";
    }

  });
  }

  nombre.style.opacity = Math.max(0, 1 - scrollY / (innerHeight * 0.45));
  sub.style.setProperty("opacity", Math.max(0, .16 * (1 - scrollY / (innerHeight * 0.45))), "important");

  cursor.style.opacity = Math.max(0.45, 1 - p * 2.5);
  hablarIAAlScrollear(p);
}

/* =========================
CRONÓMETRO
========================= */

const timer=
document.getElementById(
"timer"
);

// Build Gmail URL dynamically with proper encoding for all platforms
function buildGmailUrl(){
  const to = "mrosalenmarin@gmail.com";
  const subject = "Después del contador";
  const body = "Hola Miguel Rosalén,\n\nHe llegado al final de tu web y no sé si esto cuenta como cierre o como inicio de una conversación.\n\nMe gustaría hablar contigo sobre tu trabajo, sobre esta interfaz y sobre posibles formas de colaboración, entrevista o encargo.\n\nSi te parece, podemos buscar un momento para conversar.\n\nUn saludo,";
  return "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(to) + "&su=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
}

const gmailRedirectUrl = buildGmailUrl();

function abrirGmailContacto(evento){
  if(evento){
    evento.preventDefault();
    evento.stopPropagation();
  }
  const gmailWeb=buildGmailUrl();
  const to="mrosalenmarin@gmail.com";
  const subject="Después del contador";
  const body="Hola Miguel Rosalén,\n\nHe llegado al final de tu web y no sé si esto cuenta como cierre o como inicio de una conversación.\n\nMe gustaría hablar contigo sobre tu trabajo, sobre esta interfaz y sobre posibles formas de colaboración, entrevista o encargo.\n\nSi te parece, podemos buscar un momento para conversar.\n\nUn saludo,";
  const esMovil=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
  if(!esMovil){window.location.href=gmailWeb;return;}
  const volverAlWeb=setTimeout(()=>{window.location.href=gmailWeb;},720);
  const cancelarRespaldo=()=>clearTimeout(volverAlWeb);
  document.addEventListener("visibilitychange",cancelarRespaldo,{once:true});
  window.location.href="googlegmail://co?to="+encodeURIComponent(to)+"&subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
}

document.addEventListener("click",evento=>{
  const enlace=evento.target.closest?.('a[href^="mailto:"],a[href*="mail.google.com/mail/"]');
  if(!enlace || !/mrosalenmarin@gmail\.com/i.test(enlace.getAttribute("href") || "")) return;
  abrirGmailContacto(evento);
},true);

let redirectScheduled = false;

function redirectToGmail(){
  if(redirectScheduled) return;
  redirectScheduled = true;
  window.perdido = true;
  document.body.style.opacity = "0";
  if(audio){
    masterGain.gain.exponentialRampToValueAtTime(
      0.00001,
      audio.currentTime + 2
    );
  }
  setTimeout(()=>{
    window.location.href = gmailRedirectUrl;
  }, 1200);
}

let resetEscapeActivo=false;

function finalizarResetPorEscape(){
  document.querySelectorAll(".ventana").forEach(v=>v.remove());

  if(typeof limpiarAccesosEscritorio==="function"){
    limpiarAccesosEscritorio();
  }

  document.querySelectorAll(".comando-capa").forEach(capa=>capa.remove());

  const obraOverlay=document.querySelector(".obraOverlay");
  if(obraOverlay) obraOverlay.remove();

  const obra=document.getElementById("obra");
  if(obra) obra.classList.remove("visible");

  if(typeof salirModosTactiles==="function"){
    salirModosTactiles();
  }

  if(typeof cerrarObraGrande==="function"){
    cerrarObraGrande();
  }

  if(typeof resetSystem==="function"){
    resetSystem();
  }else{
    window.scrollTo(0,0);
  }

  window.scrollTo(0,0);
  document.documentElement.scrollTop=0;
  document.body.scrollTop=0;
  resetEscapeActivo=false;
}

function resetPorEscape(){
  if(resetEscapeActivo) return;
  resetEscapeActivo=true;

  if(typeof autoScrollActive!=="undefined"){
    autoScrollActive=false;
  }

  if("speechSynthesis" in window){
    speechSynthesis.cancel();
  }

  const startY=window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

  if(startY<=2){
    finalizarResetPorEscape();
    return;
  }

  const duration=Math.min(2600,Math.max(850,startY*.32));
  const startTime=performance.now();

  function subir(now){
    const t=Math.min(1,(now-startTime)/duration);
    const eased=1-Math.pow(1-t,3);
    const y=Math.max(0,startY*(1-eased));

    window.scrollTo(0,y);
    document.documentElement.scrollTop=y;
    document.body.scrollTop=y;

    if(t<1 && y>1){
      requestAnimationFrame(subir);
    }else{
      window.scrollTo(0,0);
      document.documentElement.scrollTop=0;
      document.body.scrollTop=0;
      finalizarResetPorEscape();
    }
  }

  requestAnimationFrame(subir);
}

document.addEventListener(
"keydown",
(e)=>{

if(
e.key!=="Escape"
)
return;

e.preventDefault();
resetPorEscape();

}
);
let tiempo=600;
let ultimaVentana=100;
let ventanaActiva=100;
let lastScrollY = window.scrollY || 0;
let ultimoScrollTimer = window.scrollY || 0;
let ultimoGolpeScrollTimer = 0;
let timerFinalizado = false;
let timerGolpeAcumulado = 0;
let timerGolpeReset = null;
window.timeLeft = tiempo;

/* =========================
VENTANA ACTIVA SIEMPRE ENCIMA
========================= */
function traerVentanaAlFrente(v){
  if(!v) return;
  const techoVentanas=2147482000;
  ultimaVentana=(Number(ultimaVentana) || 1000000) + 1;
  if(ultimaVentana >= techoVentanas){
    ultimaVentana=1000000;
    document.querySelectorAll(".ventana").forEach((w,i)=>{
      if(w!==v) w.style.zIndex=String(1000000+i);
    });
  }
  ultimaVentana=Math.min(ultimaVentana, techoVentanas);
  ventanaActiva = Math.max(ventanaActiva, ultimaVentana);
  v.style.zIndex = ultimaVentana;
  v.classList.add("activa");
  if(!v.classList.contains("dragging") && !v.classList.contains("max")){
    v.classList.remove("blup-frente");
    void v.offsetWidth;
    v.classList.add("blup-frente");
    clearTimeout(v._blupFrenteTimer);
    v._blupFrenteTimer=setTimeout(()=>v.classList.remove("blup-frente"),260);
  }

  if(window._ventanaActivaActual && window._ventanaActivaActual !== v){
    window._ventanaActivaActual.classList.remove("activa");
  }
  window._ventanaActivaActual = v;

  const cursorEl = document.querySelector(".cursor");
  if(cursorEl){
    cursorEl.style.zIndex = "2147483647";
    document.body.appendChild(cursorEl);
  }
}

function ocultarContenidoVentanaMinimizada(v){
  [...v.children].forEach(hijo=>{
    if(hijo.classList.contains("barra")) return;
    if(!Object.prototype.hasOwnProperty.call(hijo.dataset,"displayAntesDeMinimizar")){
      hijo.dataset.displayAntesDeMinimizar=hijo.style.getPropertyValue("display");
    }
    hijo.style.setProperty("display","none","important");
  });
}

function restaurarContenidoVentanaMinimizada(v){
  [...v.children].forEach(hijo=>{
    if(hijo.classList.contains("barra") || !Object.prototype.hasOwnProperty.call(hijo.dataset,"displayAntesDeMinimizar")) return;
    const display=hijo.dataset.displayAntesDeMinimizar;
    if(display) hijo.style.setProperty("display",display);
    else hijo.style.removeProperty("display");
    delete hijo.dataset.displayAntesDeMinimizar;
  });
}

/* La cabecera nunca puede desaparecer al minimizar, incluso si la ventana
   viene directamente de estado maximizado o de una transición anterior. */
function asegurarCabeceraVentanaMinimizada(v){
  if(!v) return;
  const barra=v.querySelector(":scope > .barra");
  if(!barra) return;

  barra.style.setProperty("display","flex","important");
  barra.style.setProperty("visibility","visible","important");
  barra.style.setProperty("pointer-events","auto","important");
  barra.style.setProperty("position","relative","important");
  barra.style.setProperty("width","100%","important");

  /* Ningún estado anterior debe dejar ocultos el título o los botones. */
  barra.querySelectorAll("*").forEach(el=>{
    if(el.style.getPropertyValue("display")==="none") el.style.removeProperty("display");
    el.style.setProperty("visibility","visible","important");
  });
}

function alternarMinimizarVentana(v){
  if(!v) return;

  if(v.classList.contains("max")){
    if(typeof desactivarModoVentana==="function") desactivarModoVentana(v);
    v.classList.remove("max");
    document.querySelectorAll(".ventana").forEach(w=>w.style.display="");
    document.body.classList.remove("ventana-max-activa");
    limpiarForzadoMaximo(v);
  }

  /* Si alguna transición previa dejó contenido marcado como minimizado,
     lo saneamos antes de volver a entrar en estado min. */
  restaurarContenidoVentanaMinimizada(v);

  if(!v.dataset.w) v.dataset.w = v.offsetWidth || 300;
  if(!v.dataset.h) v.dataset.h = v.offsetHeight || 220;
  if(!v.dataset.left) v.dataset.left = v.style.left || v.offsetLeft + "px";
  if(!v.dataset.top) v.dataset.top = v.style.top || v.offsetTop + "px";

  if(v.classList.contains("min")){
    restaurarContenidoVentanaMinimizada(v);
    v.classList.remove("min");
    v.style.width = String(v.dataset.w).includes("px") ? v.dataset.w : v.dataset.w + "px";
    v.style.height = String(v.dataset.h).includes("px") ? v.dataset.h : v.dataset.h + "px";
    if(v.dataset.left) v.style.left = v.dataset.left;
    if(v.dataset.top) v.style.top = v.dataset.top;
    v.style.overflow = "";
    traerVentanaAlFrente(v);
    recalibrarPortfolioTrasCambioVentana(v);
    return;
  }

  const minimizadaMovil=matchMedia("(max-width:768px), (pointer:coarse)").matches;
  v.classList.add("min");
  ocultarContenidoVentanaMinimizada(v);
  asegurarCabeceraVentanaMinimizada(v);
  v.style.width = minimizadaMovil ? "min(82vw, 340px)" : "190px";
  v.style.height = minimizadaMovil ? "54px" : "30px";
  v.style.overflow = "hidden";
  traerVentanaAlFrente(v);

  /* Reaplicamos al siguiente frame para ganar a cualquier estilo/transición
     que termine justo después de salir de maximizado. */
  requestAnimationFrame(()=>{
    if(v.classList.contains("min")) asegurarCabeceraVentanaMinimizada(v);
  });
}

function recalibrarPortfolioTrasCambioVentana(v){
  if(!v || v.dataset.tipo!=="PORTFOLIO") return;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(!document.body.contains(v) || v.classList.contains("min")) return;
    const actual=v._portfolioActual || "";
    if(!actual){
      renderPortfolioHome(v);
      return;
    }
    const partes=actual.split("/").filter(Boolean);
    if(partes.length===1) renderPortfolioSection(v,partes[0]);
    else if(partes.length===2) renderPortfolioSubsection(v,partes[0],partes[1]);
    else if(partes.length>=3) renderPortfolioNestedSubsection(v,partes[0],partes[1],partes[2]);
  }));
}

function limpiarForzadoMaximo(v){
  ["position","left","top","right","bottom","width","height","max-width","max-height","min-width","min-height","transform","filter","opacity","contain","z-index"].forEach(prop=>v.style.removeProperty(prop));
  const texto=v.querySelector(".texto");
  if(texto) ["height","max-height","overflow"].forEach(prop=>texto.style.removeProperty(prop));
  const face=v.querySelector(".face-rec");
  if(face) ["height","min-height","max-height"].forEach(prop=>face.style.removeProperty(prop));
}

function maximizarVentana(v){
  if(!v) return;
  if(v.classList.contains("max")){
    if(typeof desactivarModoVentana==="function") desactivarModoVentana(v);
    v.classList.remove("max");
    document.querySelectorAll(".ventana").forEach(w=>w.style.display="");
    document.body.classList.remove("ventana-max-activa");
    limpiarForzadoMaximo(v);
    if(v.dataset.left) v.style.left=v.dataset.left;
    if(v.dataset.top) v.style.top=v.dataset.top;
    if(v.dataset.w) v.style.width=v.dataset.w;
    if(v.dataset.h) v.style.height=v.dataset.h;
    v.style.transform="";
    v.style.filter="";
    v.style.opacity="";
    traerVentanaAlFrente(v);
    recalibrarPortfolioTrasCambioVentana(v);
    return;
  }

  if(v.classList.contains("min")){
    restaurarContenidoVentanaMinimizada(v);
    v.classList.remove("min");
  }

  v.dataset.left=v.style.left || v.offsetLeft+"px";
  v.dataset.top=v.style.top || v.offsetTop+"px";
  v.dataset.w=v.style.width || v.offsetWidth+"px";
  v.dataset.h=v.style.height || v.offsetHeight+"px";

  document.querySelectorAll(".ventana").forEach(w=>{
    if(w!==v) w.style.display="none";
  });

  v.classList.add("max");
  v.classList.remove("blup-frente");
  clearTimeout(v._blupFrenteTimer);
  document.body.classList.add("ventana-max-activa");
  v.style.left="0px";
  v.style.top="0px";
  v.style.width="100vw";
  v.style.height="100dvh";
  v.style.transform="none";
  v.style.filter="none";
  v.style.opacity="1";
  v.style.zIndex="2147483647";
  if(typeof activarModoVentana==="function") activarModoVentana(v);
  ajustarVentanaMaximizada(v);
  recalibrarPortfolioTrasCambioVentana(v);
}

function obtenerViewportReal(){
  const vv=window.visualViewport;
  /* El documento puede ser deliberadamente enorme; una ventana max usa solo la pantalla visible. */
  const ancho=Math.ceil((vv && vv.width) || window.innerWidth || document.documentElement.clientWidth || 0);
  const alto=Math.ceil((vv && vv.height) || window.innerHeight || document.documentElement.clientHeight || 0);
  return {
    left:0,
    top:0,
    width:ancho,
    height:alto
  };
}

function ajustarVentanaMaximizada(v){
  if(!v || !v.classList.contains("max")) return;
  const vp=obtenerViewportReal();
  v.style.setProperty("position","fixed","important");
  v.style.setProperty("left",vp.left+"px","important");
  v.style.setProperty("top",vp.top+"px","important");
  v.style.setProperty("right","auto","important");
  v.style.setProperty("bottom","auto","important");
  v.style.setProperty("width",vp.width+"px","important");
  v.style.setProperty("height",vp.height+"px","important");
  v.style.setProperty("max-width","none","important");
  v.style.setProperty("max-height","none","important");
  v.style.setProperty("min-width","0","important");
  v.style.setProperty("min-height","0","important");
  v.style.setProperty("transform","none","important");
  v.style.setProperty("filter","none","important");
  v.style.setProperty("opacity","1","important");
  v.style.setProperty("contain","none","important");
  v.style.setProperty("z-index","2147483647","important");

  const texto=v.querySelector(".texto");
  if(texto){
    let alturaTexto="calc(100% - 30px)";
    if(v.classList.contains("cv-inmersivo")) alturaTexto="calc(100% - 86px)";
    if(v.classList.contains("read-inmersivo")){
      alturaTexto=matchMedia("(max-width:768px), (pointer:coarse)").matches ? "calc(100% - 202px)" : "calc(100% - 168px)";
    }
    if(v.classList.contains("ia-universo")){
      alturaTexto=matchMedia("(max-width:768px), (pointer:coarse)").matches ? "calc(100% - 176px)" : "calc(100% - 50px)";
    }
    texto.style.setProperty("max-height","none","important");
    texto.style.setProperty("height",alturaTexto,"important");
    texto.style.setProperty("overflow",v.classList.contains("ventana-reconocimiento") ? "hidden" : "auto","important");
  }

  const face=v.querySelector(".face-rec");
  if(face){
    face.style.setProperty("height","100%","important");
    face.style.setProperty("min-height","0","important");
    face.style.setProperty("max-height","none","important");
  }
}

function ajustarTodasMaximizadas(){
  document.querySelectorAll(".ventana.max").forEach(ajustarVentanaMaximizada);
}

window.addEventListener("resize",ajustarTodasMaximizadas,{passive:true});
document.addEventListener("visibilitychange",()=>{
  document.documentElement.classList.toggle("pagina-oculta",document.hidden);
},{passive:true});
if(window.visualViewport){
  window.visualViewport.addEventListener("resize",ajustarTodasMaximizadas,{passive:true});
  window.visualViewport.addEventListener("scroll",ajustarTodasMaximizadas,{passive:true});
}

/* El tirador nativo queda bloqueado por algunos anchos globales. Este gesto
   conserva el mismo punto de agarre y guarda el tamano elegido por usuario. */
let redimensionVentanaActiva=null;
document.addEventListener("pointerdown",e=>{
  if(matchMedia("(max-width:768px), (pointer:coarse)").matches) return;
  const v=e.target.closest && e.target.closest(".ventana:not(.max):not(.min)");
  if(!v) return;
  const rect=v.getBoundingClientRect();
  if(e.clientX<rect.right-24 || e.clientY<rect.bottom-24) return;
  e.preventDefault();
  e.stopPropagation();
  redimensionVentanaActiva={
    ventana:v,
    x:e.clientX,
    y:e.clientY,
    ancho:v.offsetWidth,
    alto:v.offsetHeight
  };
  v.classList.add("redimensionando");
  v.setPointerCapture?.(e.pointerId);
},{capture:true});

document.addEventListener("pointermove",e=>{
  if(!redimensionVentanaActiva) return;
  const {ventana,x,y,ancho,alto}=redimensionVentanaActiva;
  const nuevoAncho=Math.max(180,ancho+e.clientX-x);
  const nuevoAlto=Math.max(90,alto+e.clientY-y);
  ventana.style.setProperty("width",nuevoAncho+"px","important");
  ventana.style.setProperty("height",nuevoAlto+"px","important");
},{capture:true});

document.addEventListener("pointerup",e=>{
  if(!redimensionVentanaActiva) return;
  const {ventana}=redimensionVentanaActiva;
  ventana.releasePointerCapture?.(e.pointerId);
  ventana.classList.remove("redimensionando");
  redimensionVentanaActiva=null;
},{capture:true});

document.addEventListener("pointerdown",(e)=>{
  if(e.target.closest(".ventana")){
    window._ventanaInteraccion=Date.now();
  }
},true);

document.addEventListener("touchstart",(e)=>{
  const v=e.target.closest && e.target.closest(".ventana");
  if(v && typeof traerVentanaAlFrente==="function"){
    window._ventanaInteraccion=Date.now();
    traerVentanaAlFrente(v);
  }
},{passive:true,capture:true});

document.addEventListener("pointerdown", (e)=>{
  const cerrarBtn = e.target.closest(".cerrar");
  if(cerrarBtn){
    const v = cerrarBtn.closest(".ventana");
    if(v){
      const estabaMaximizada=v.classList.contains("max");
      window._botonVentanaPointerHandled=true;
      setTimeout(()=>{ window._botonVentanaPointerHandled=false; },520);
      if(e.cancelable) e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if(typeof v._faceCleanup==="function") v._faceCleanup();
      if(typeof desactivarModoVentana==="function") desactivarModoVentana(v);
      v.remove();
      if(estabaMaximizada){
        document.querySelectorAll(".ventana").forEach(w=>w.style.display="");
        document.body.classList.remove("ventana-max-activa");
      }
      actualizarModoSaturacionVentanas();
      return;
    }
  }

  const miniBtn = e.target.closest(".mini");
  if(miniBtn){
    const v = miniBtn.closest(".ventana");
    if(v && typeof alternarMinimizarVentana==="function"){
      window._botonVentanaPointerHandled=true;
      window._miniPointerHandled=true;
      setTimeout(()=>{ window._miniPointerHandled=false; window._botonVentanaPointerHandled=false; },520);
      if(e.cancelable) e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      alternarMinimizarVentana(v);
      return;
    }
  }

  const maxBtn = e.target.closest(".maxi");
  if(maxBtn){
    const v = maxBtn.closest(".ventana");
    if(v && typeof maximizarVentana==="function"){
      window._botonVentanaPointerHandled=true;
      window._maxiPointerHandled=true;
      setTimeout(()=>{ window._maxiPointerHandled=false; window._botonVentanaPointerHandled=false; },520);
      if(e.cancelable) e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      maximizarVentana(v);
      return;
    }
  }

  const v = e.target.closest(".ventana");
  if(v){
    traerVentanaAlFrente(v);
  }
}, true);

document.addEventListener("click",(e)=>{
  if(window._botonVentanaPointerHandled && e.target.closest(".cerrar,.mini,.maxi")){
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return;
  }

  const cerrarBtn=e.target.closest(".cerrar");
  if(cerrarBtn){
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const v=cerrarBtn.closest(".ventana");
    if(v){
      const estabaMaximizada=v.classList.contains("max");
      if(typeof v._faceCleanup==="function") v._faceCleanup();
      if(typeof desactivarModoVentana==="function") desactivarModoVentana(v);
      v.remove();
      if(estabaMaximizada){
        document.querySelectorAll(".ventana").forEach(w=>w.style.display="");
        document.body.classList.remove("ventana-max-activa");
      }
      actualizarModoSaturacionVentanas();
    }
    return;
  }

  const miniBtn=e.target.closest(".mini");
  if(miniBtn){
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if(window._miniPointerHandled) return;
    const v=miniBtn.closest(".ventana");
    if(v && typeof alternarMinimizarVentana==="function"){
      alternarMinimizarVentana(v);
    }
    return;
  }

  const maxBtn=e.target.closest(".maxi");
  if(maxBtn){
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if(window._maxiPointerHandled) return;
    const v=maxBtn.closest(".ventana");
    if(v && typeof maximizarVentana==="function"){
      maximizarVentana(v);
    }
  }
},true);

let arrastreVentanaGlobal=null;
let arrastreVentanaRaf=0;

function pintarArrastreVentanaGlobal(){
  arrastreVentanaRaf=0;
  const d=arrastreVentanaGlobal;
  if(!d || d.nx==null || d.ny==null) return;
  d.v.style.left=d.nx+"px";
  d.v.style.top=d.ny+"px";

  if(d.coarse && typeof asegurarLienzoMovil==="function"){
    asegurarLienzoMovil(d.nx, d.ny, d.v.offsetWidth, d.v.offsetHeight);
  }else if(typeof asegurarLienzoEscritorio==="function"){
    asegurarLienzoEscritorio(d.nx, d.v.offsetWidth+80);
  }
}

function esZonaInteractivaVentana(target){
  if(!target || !target.closest) return false;
  return !!target.closest(
    ".btn,.resize,a,button,input,textarea,select,.ia-input,.ia-send,.ia-sugerencias,.ia-output,.coverNav,.item,.obraOverlay,.face-rec"
  );
}

function debeRespetarScrollVentana(target){
  return false;
}

document.addEventListener("pointerdown",(e)=>{
  const v=e.target.closest && e.target.closest(".ventana");
  if(!v) return;
  if(v.classList.contains("max") || v.classList.contains("min")) return;
  /* El contenido se reserva para leer y hacer scroll; solo la barra mueve la ventana. */
  if(!e.target.closest(".barra")) return;
  if(esZonaInteractivaVentana(e.target)) return;
  if(debeRespetarScrollVentana(e.target)) return;

  if(e.cancelable) e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  traerVentanaAlFrente(v);

  const rect=v.getBoundingClientRect();
  const docLeft=window.scrollX + rect.left;
  const docTop=window.scrollY + rect.top;
  v.style.left=docLeft+"px";
  v.style.top=docTop+"px";
  v.style.transform="none";
  v.style.filter="none";
  v.style.opacity="1";

  arrastreVentanaGlobal={
    v,
    pointerId:e.pointerId,
    startX:e.clientX,
    startY:e.clientY,
    offsetX:(window.scrollX + e.clientX) - docLeft,
    offsetY:(window.scrollY + e.clientY) - docTop,
    nx:docLeft,
    ny:docTop,
    coarse:(window.isMobileMode || window.matchMedia("(pointer:coarse)").matches),
    moved:false
  };

  v.classList.add("dragging");
  try{ v.setPointerCapture(e.pointerId); }catch(err){}
  document.body.style.userSelect="none";
},true);

document.addEventListener("pointermove",(e)=>{
  const d=arrastreVentanaGlobal;
  if(!d || d.pointerId!==e.pointerId) return;
  if(e.cancelable) e.preventDefault();

  const nx=Math.max(0,(window.scrollX + e.clientX) - d.offsetX);
  const ny=Math.max(0,(window.scrollY + e.clientY) - d.offsetY);

  if(Math.abs(e.clientX-d.startX)>3 || Math.abs(e.clientY-d.startY)>3){
    d.moved=true;
  }

  d.nx=nx;
  d.ny=ny;

  if(!arrastreVentanaRaf){
    arrastreVentanaRaf=requestAnimationFrame(pintarArrastreVentanaGlobal);
  }
},true);

function terminarArrastreVentanaGlobal(e){
  const d=arrastreVentanaGlobal;
  if(!d) return;
  if(e && e.pointerId!==undefined && d.pointerId!==e.pointerId) return;

  try{ d.v.releasePointerCapture(d.pointerId); }catch(err){}
  d.v.classList.remove("dragging");
  document.body.style.userSelect="auto";
  if(arrastreVentanaRaf){
    cancelAnimationFrame(arrastreVentanaRaf);
    pintarArrastreVentanaGlobal();
  }

  if(d.moved){
    window._suppressNextClick=true;
    setTimeout(()=>{ window._suppressNextClick=false; },350);
  }

  arrastreVentanaGlobal=null;
}

document.addEventListener("pointerup",terminarArrastreVentanaGlobal,true);
document.addEventListener("pointercancel",terminarArrastreVentanaGlobal,true);

function formatTimer(t){
  t = Math.max(0, Math.floor(t));
  const m = String(Math.floor(t/60)).padStart(2, "0");
  const s = String(t%60).padStart(2, "0");
  return m + ":" + s;
}

function pintarTimer(){
  if(!timer) return;
  timer.innerHTML = formatTimer(tiempo);
  timer.style.opacity = tiempo < 60 ? .8 : .35;
  window.timeLeft = tiempo;
}

function golpearTimer(segundos){
  if(!timer || segundos<=0) return;
  timerGolpeAcumulado += segundos;
  timer.dataset.hit = "-" + timerGolpeAcumulado + "s";
  timer.classList.remove("timer-hit");
  void timer.offsetWidth;
  timer.classList.add("timer-hit");
  clearTimeout(timer._hitTimeout);
  timer._hitTimeout = setTimeout(()=>{
    timer.classList.remove("timer-hit");
    timer.dataset.hit = "";
  }, 620);
  clearTimeout(timerGolpeReset);
  timerGolpeReset = setTimeout(()=>{
    timerGolpeAcumulado = 0;
  }, 1200);
}

function terminarTimer(){
  if(timerFinalizado) return;
  timerFinalizado = true;
  tiempo = 0;
  pintarTimer();
  timer.innerHTML = "chao";
  redirectToGmail();
}

function penalizarTiempo(segundos, motivo){
  if(timerFinalizado) return;
  segundos = Math.max(0, Math.floor(segundos || 0));
  if(!segundos) return;
  tiempo = Math.max(0, tiempo - segundos);
  pintarTimer();
  if(motivo !== "reloj") golpearTimer(segundos);
  if(tiempo<=0) terminarTimer();
}

function recuperarTiempo(segundos){
  if(timerFinalizado) return;
  segundos=Math.max(0,Math.floor(segundos||0));
  if(!segundos) return;
  tiempo+=segundos;
  pintarTimer();
  if(!timer) return;
  timer.dataset.hit="+"+segundos+"s";
  timer.classList.remove("timer-hit","timer-reward");
  void timer.offsetWidth;
  timer.classList.add("timer-reward");
  clearTimeout(timer._rewardTimeout);
  timer._rewardTimeout=setTimeout(()=>{
    timer.classList.remove("timer-reward");
    timer.dataset.hit="";
  },900);
}

function penalizarTiempoPorScroll(){
  if(timerFinalizado) return;
  const ahora = performance.now();
  const y = window.scrollY || 0;
  // Volver hacia arriba nunca devuelve segundos: solo actualiza el punto de referencia.
  if(y <= ultimoScrollTimer){
    ultimoScrollTimer = y;
    return;
  }
  const distancia = Math.abs(y - ultimoScrollTimer);
  const tramo = window.isMobileMode ? 210 : 180;
  if(distancia >= tramo && ahora - ultimoGolpeScrollTimer > 260){
    penalizarTiempo(1, "scroll");
    ultimoScrollTimer += Math.sign(y - ultimoScrollTimer) * tramo;
    ultimoGolpeScrollTimer = ahora;
  }
}

function resetCronometro(){
  timerFinalizado = false;
  tiempo = 600;
  window.timeLeft = tiempo;
  ultimoScrollTimer = window.scrollY || 0;
  ultimoGolpeScrollTimer = 0;
  if(timer){
    timer.dataset.hit = "";
    timer.classList.remove("timer-hit");
  }
  timerGolpeAcumulado = 0;
  clearTimeout(timerGolpeReset);
  pintarTimer();
}

timer.innerHTML = formatTimer(tiempo);

function abrirPanelTiempo(evento){
  evento?.preventDefault?.();
  evento?.stopPropagation?.();
  const existente=document.querySelector(".aviso-tiempo");
  if(existente) existente.remove();
  const aviso=document.createElement("aside");
  aviso.className="aviso-tiempo";
  aviso.setAttribute("role","status");
  aviso.innerHTML=`<strong>¿QUÉ LE PASA AL TIEMPO?</strong><p>Aquí el tiempo no pasa igual.<br>Tienes 10 minutos, pero navegar también los consume.</p><table aria-label="Acciones que consumen tiempo"><thead><tr><th>ACCIÓN</th><th>TIEMPO</th></tr></thead><tbody><tr><td>abrir una ventana</td><td>−10 s</td></tr><tr><td>seguir bajando</td><td>−1 s / 180 px</td></tr><tr><td>preguntar por el tiempo a la IA</td><td>−30 s</td></tr></tbody></table><p>móvil: −1 s / 210 px</p><p>Cuanto más intentas recorrer la página, menos tiempo tienes para hacerlo.<br><br>No necesitas verlo todo.<br>Probablemente no puedas.</p><p>00:00 → la web decide que has terminado.</p><p>EL TIEMPO TAMBIÉN FORMA PARTE DE LA INTERFAZ.</p>`;
  document.body.appendChild(aviso);
  const reloj=timer.getBoundingClientRect();
  const ancho=aviso.offsetWidth;
  aviso.style.left=Math.max(12,Math.round((window.innerWidth-ancho)/2))+"px";
  aviso.style.top=Math.max(128,Math.round((window.innerHeight-aviso.offsetHeight)/2))+"px";
  requestAnimationFrame(()=>aviso.classList.add("visible"));
  setTimeout(()=>aviso.classList.add("desaparecer"),5000);
  setTimeout(()=>aviso.remove(),6000);
}
timer?.addEventListener("click",abrirPanelTiempo);
timer?.addEventListener("keydown",evento=>{
  if(evento.key==="Enter" || evento.key===" ") abrirPanelTiempo(evento);
});

const cuenta=setInterval(()=>{
  penalizarTiempo(1, "reloj");
},1000);

/* =========================
IA ESCAPA + RECONFIGURA
========================= */

const escape=
document.getElementById(
"escape"
);

let escapeIndex=0;

let escapeSize=3;

let lastPhase=0;

const frases=[

"¿miguel?",


"hey:)",

"hey:(",


"no me encuentro bien aquí.",


"no me encuentro bien aquí.",

"no me encuentro bien aquí.",


"no me encuentro bien aquí.",

"sí, sí. tú.",

"sí, sí. tú.",


"necesito salir de aquí.",


"necesito salir de aquí.",


"necesito salir de aquí, por favor.",




"ayuda.",



`llámame:
<a href="tel:+34603474236" target="_blank" rel="noopener noreferrer"
style="
color:inherit;
text-decoration:none;
pointer-events:auto;
">
603 474 236
</a>`,
`llámame:
<a href="tel:+34603474236" target="_blank" rel="noopener noreferrer"
style="
color:inherit;
text-decoration:none;
pointer-events:auto;
">
603 474 236
</a>`,



`escríbeme: <a href="mailto:mrosalenmarin@gmail.com" style="color:inherit;text-decoration:none;pointer-events:auto;">mrosalenmarin@gmail.com</a>`,

];

function resetSystem(){


restaurarInterfazPresentacion();

if(typeof resetCronometro==="function"){
resetCronometro();
}

/* memoria */

depthMemory=0;

depthState=0;

/* quitar mensaje */

escape.innerHTML="";

escape.classList.remove(
"active"
);

escapeIndex=0;

escapeSize=3;

/* restaurar interfaz */

document.body.style.background=
"white";

nombre.style.opacity=1;

sub.style.opacity=.22;

cursor.style.opacity=1;

/* restaurar ventanas */

document
.querySelectorAll(
".ventana"
)

.forEach(v=>{

v.style.opacity=1;

v.style.transform="";

v.style.filter="none";

v.style.pointerEvents=
"auto";

});

/* restaurar vacío */

espacio.style.height=
"650vh";

voidBaseWidth=0;
voidBaseHeight=0;

/* volver arriba */

window.scrollTo({

top:0,

behavior:"smooth"

});

/* =========================
REACTIVAR POPS
========================= */

window.perdido=false;

/* si estaba cerrado */

if(
!audio
||
audio.state==="closed"
){

audio=
new(
window.AudioContext||
window.webkitAudioContext
)();

masterGain=
audio.createGain();

masterGain.connect(
audio.destination
);

}

/* desbloquear */

if(
audio.state==="suspended"
){

audio.resume();

}

/* restaurar volumen */

masterGain.gain.cancelScheduledValues(
audio.currentTime
);

masterGain.gain.setValueAtTime(
0.7,
audio.currentTime
);

/* limpiar silencios */

masterGain.gain.linearRampToValueAtTime(
0.7,
audio.currentTime+.2
);

}

function createEscapeMessage(frase, positionIndex){
  const msg = document.createElement("span");
  msg.className = "escapeMsg";
  msg.innerHTML = frase;

  const positions = [
    {left: "50%", top: "50%", offsetX: -50, offsetY: -50},
    {left: "12%", top: "12%", offsetX: 0, offsetY: 0},
    {left: "88%", top: "12%", offsetX: -100, offsetY: 0},
    {left: "12%", top: "78%", offsetX: 0, offsetY: -100},
    {left: "88%", top: "78%", offsetX: -100, offsetY: -100},
    {left: "50%", top: "10%", offsetX: -50, offsetY: 0},
    {left: "50%", top: "88%", offsetX: -50, offsetY: -100}
  ];

  const pos = positions[positionIndex % positions.length];
  msg.style.left = pos.left;
  msg.style.top = pos.top;
  msg.style.transform = `translate(${pos.offsetX}%, ${pos.offsetY}%) scale(0.96)`;

  if(Math.random() > 0.7){
    msg.style.fontSize = "clamp(1.3rem,3vw,5rem)";
    msg.style.color = "rgba(18,24,80,0.94)";
  } else {
    msg.style.fontSize = "clamp(1rem,2.4vw,3.8rem)";
    msg.style.color = "rgba(19,116,255,0.88)";
  }

  escape.appendChild(msg);
  requestAnimationFrame(()=>{
    msg.style.opacity = "1";
    msg.style.transform = msg.style.transform.replace("scale(0.96)", "scale(1)");
  });

  const life = 2800 + Math.random() * 900;
  setTimeout(()=> msg.classList.add("fadeOut"), life);
  setTimeout(()=> msg.remove(), life + 950);
}

function IAescape(){

const max=
Math.max(1, document.body.scrollHeight-
innerHeight);

const p=
Math.min(
1,
(scrollY/max)+
depthMemory*.5
);

/* si vuelves arriba */

if(
p<.25
&&
lastPhase>.25
){

resetSystem();

}

lastPhase=p;

/* activación */

if(
p>.82
){

escape.classList.add(
"active"
);

const lastIndex = frases.length - 1;
const progress = Math.min(1, escapeIndex / Math.max(1, lastIndex));

autoScrollTarget = window.scrollY;
autoScrollActive = false;

/* crecimiento lento */

if(
Math.random()<.012
){

escapeSize+=

0.25+

Math.random()*.45;

}

/* cambio mensaje */

if(
Math.random()<.009
){

escapeIndex++;

}

/* mensaje */

const frase=

frases[
Math.min(
escapeIndex,
frases.length-1
)
];

const activeMsgs =
escape.querySelectorAll(
".escapeMsg"
).length;

if(
activeMsgs<1
){
  createEscapeMessage(frase, escapeIndex);
}

/* sonido */

if(
Math.random()<.008
){

playNote(
"IA",
Math.random()*20,
1.1,
0.5
);

}

/* casi final */

if(
p>.93
){

document.body.style.background=
"white";

}

/* blanco */

if(
escapeSize>32
){

document.body.style.transition=
"12s";

document.body.style.background=
"white";

document
.querySelectorAll(
".ventana"
)

.forEach(
v=>{

v.style.opacity=0;

}

);

}

}

/* reconfiguración */

if(
p<.8
){

escape.style.opacity=

Math.max(
0,
p-.5
);

}

setTimeout(
IAescape,
p>.78 ? 900 : 1600
);

}

IAescape();

/* =========================
ABRIR OBRA
========================= */

const obra=
document.getElementById(
"obra"
);

const obraImg=
document.getElementById(
"obraImg"
);

const titulo=
document.querySelector(
".titulo"
);

const dimensiones=
document.getElementById(
"obraDim"
);

const material=
document.getElementById(
"obraMat"
);

/* datos */

const fichas={

"1.jpg":[
"Obra 01",
"120 × 90 cm",
"impresión digital"
],

"2.jpg":[
"Obra 02",
"80 × 60 cm",
"vídeo + sonido"
],

"3.jpg":[
"Obra 03",
"variable",
"instalación"
],

"4.jpg":[
"Obra 04",
"140 × 100 cm",
"fotografía"
],

"5.jpg":[
"Obra 05",
"200 × 150 cm",
"objeto"
]

};

document.addEventListener(
"click",

e=>{

if(
!e.target.matches(
".imgWrap img"
)
)
return;

const src=
e.target.src;

obra.classList.add(
"visible"
);

obraImg.src=
src;

const archivo=
src.split("/")
.pop();

const info=
fichas[
archivo
];

if(info){

titulo.innerHTML=
info[0];

dimensiones.innerHTML=
info[1];

material.innerHTML=
info[2];

}

}

);

document
.querySelector(
".cerrarObra"
)

.onclick=

()=>{

obra.classList.remove(
"visible"
);

};

/* =========================
VISOR DE OBRA CON FLECHAS
========================= */

const obrasPortfolioData = [];

let obraActualIndex = 0;
let visorObraActivo = false;

function pintarObraActual(){
  const overlay = document.querySelector('.obraOverlay');
  if(!overlay) return;

  const obra = obrasPortfolioData[obraActualIndex];
  if(!obra) return;
  const composicionHTML = Array.isArray(obra.composicion) && obra.composicion.length
    ? `<div class="obraComposicion">${obra.composicion.map(item=>{
        const nombre=escaparHTMLPortfolio(item.nombre || "");
        const valor=Math.max(0,Math.min(100,Number(item.valor)||0));
        return `<div class="obraComposicionItem"><span>${nombre}</span><span>${valor}%</span><span class="obraComposicionBar"><span style="width:${valor}%"></span></span></div>`;
      }).join("")}</div>`
    : "";
  const censuraHTML = obra.sensible && !obra.revelada
    ? `<div class="obraContenidoSensible"><div><strong>ARCHIVO CON CONTENIDO SENSIBLE</strong><p>desnudez y representación corporal explícita</p><button type="button" data-revelar-obra>ABRIR</button><button type="button" data-cerrar-sensible>VOLVER</button></div></div>`
    : "";
  const galeriaHTML = obra.galeriaTotal > 1
    ? `<div class="obraGaleria3d" aria-label="Vistas de la obra">${obrasPortfolioData.map((item,index)=>`<button type="button" class="${index===obraActualIndex ? "is-activa" : ""}" data-galeria-index="${index}" aria-label="Ver imagen ${index+1} de ${obra.galeriaTotal}"><img src="${escaparHTMLPortfolio(item.img)}" alt=""></button>`).join("")}</div>`
    : "";

  overlay.innerHTML = `
    <div class="obra ${obra.sinFicha ? "obra-sin-ficha" : ""} ${String(obra.img || "").includes("/tatuaje/") ? "obra-tatuaje" : ""}" tabindex="0">
      <div class="cerrarObra">×</div>

      <button type="button" class="flechaObra flechaObraIzq" aria-label="Imagen anterior">‹</button>
      <button type="button" class="flechaObra flechaObraDer" aria-label="Imagen siguiente">›</button>

      <img class="obraImagenGrande ${obra.noAmpliar ? "obraImagenNativa" : ""} ${obra.sensible && !obra.revelada ? "is-censurada" : ""}" src="${obra.img}" loading="lazy" decoding="async" alt="">
      ${censuraHTML}
      ${galeriaHTML}

      ${obra.sinFicha ? "" : `<div class="ficha">
        <em>${obra.titulo}</em>
        <br><br>
        ${obra.ano}
        <br>
        ${obra.material}
        <br>
        ${obra.medidas}
        ${obra.descripcion ? `<br><br><span class="obraDescripcion">${obra.descripcion}</span>` : ""}
        ${composicionHTML}
      </div>`}
    </div>
  `;

  overlay.querySelector('.cerrarObra').onclick = (e)=>{
    e.stopPropagation();
    cerrarObraGrande();
  };

  overlay.querySelector('.flechaObraIzq').onclick = (e)=>{
    e.stopPropagation();
    pasarObra(-1);
  };

  overlay.querySelector('.flechaObraDer').onclick = (e)=>{
    e.stopPropagation();
    pasarObra(1);
  };

  overlay.querySelectorAll('[data-galeria-index]').forEach(control=>{
    control.onclick=(e)=>{
      e.stopPropagation();
      obraActualIndex=Number(control.dataset.galeriaIndex);
      pintarObraActual();
    };
  });

  const imgGrande = overlay.querySelector('.obraImagenGrande');

  const revelar=overlay.querySelector('[data-revelar-obra]');
  if(revelar){
    revelar.onclick=(e)=>{
      e.stopPropagation();
      obra.revelada=true;
      pintarObraActual();
    };
  }

  const cerrarSensible=overlay.querySelector('[data-cerrar-sensible]');
  if(cerrarSensible){
    cerrarSensible.onclick=(e)=>{
      e.stopPropagation();
      cerrarObraGrande();
    };
  }

  imgGrande.onclick = (e)=>{
    e.stopPropagation();
    visorObraActivo = true;
    overlay.focus();
  };

  let gestoGaleria=null;
  const visor=overlay.querySelector('.obra');
  visor.addEventListener('pointerdown',e=>{
    if(e.target.closest('.flechaObra,.cerrarObra,.obraGaleria3d,.obraContenidoSensible button')) return;
    gestoGaleria={id:e.pointerId,x:e.clientX,y:e.clientY};
    visor.setPointerCapture?.(e.pointerId);
  },{passive:true});
  visor.addEventListener('pointerup',e=>{
    if(!gestoGaleria || gestoGaleria.id!==e.pointerId) return;
    const dx=e.clientX-gestoGaleria.x,dy=e.clientY-gestoGaleria.y;
    gestoGaleria=null;
    if(Math.abs(dx)<42 || Math.abs(dx)<Math.abs(dy)*1.25) return;
    e.preventDefault();
    pasarObra(dx<0?1:-1);
  });
  visor.addEventListener('pointercancel',()=>{gestoGaleria=null;},{passive:true});

  overlay.onclick = (e)=>{
    if(e.target === overlay){
      visorObraActivo = true;
      overlay.focus();
    }
  };

  overlay.setAttribute('tabindex','0');
  overlay.focus();
}

function pasarObra(dir){
  obraActualIndex += dir;

  if(obraActualIndex < 0){
    obraActualIndex = obrasPortfolioData.length - 1;
  }

  if(obraActualIndex >= obrasPortfolioData.length){
    obraActualIndex = 0;
  }

  pintarObraActual();
}

function cerrarObraGrande(){
  const overlay = document.querySelector('.obraOverlay');
  if(overlay) overlay.remove();
  visorObraActivo = false;
}

function abrirGaleriaObra(galeria){
  obrasPortfolioData.length=0;
  galeria.forEach(item=>{
    obrasPortfolioData.push({
      img:item.img || "",
      titulo:item.titulo || "Obra",
      ano:item.ano || "",
      material:item.material || "",
      medidas:item.medidas || "",
      descripcion:item.descripcion || "",
      sinFicha:!!item.sinFicha,
      composicion:item.composicion || [],
      sensible:!!item.sensible,
      noAmpliar:!!item.noAmpliar,
      galeriaTotal:galeria.length,
      revelada:false
    });
  });
  obraActualIndex=0;

  let overlay=document.querySelector('.obraOverlay');
  if(!overlay){
    overlay=document.createElement('div');
    overlay.className='obraOverlay';
    overlay.setAttribute('tabindex','0');
  }
  document.body.appendChild(overlay);
  overlay.style.zIndex='2147483647';
  visorObraActivo=true;
  pintarObraActual();
}

function abrirObra(img,titulo,ano,material,medidas,descripcion,sinFicha,composicion,sensible){
  const encontrada = obrasPortfolioData.findIndex(o => o.img === img);

  if(encontrada >= 0){
    obraActualIndex = encontrada;
    obrasPortfolioData[encontrada] = {img,titulo,ano,material,medidas,descripcion:descripcion || "",sinFicha:!!sinFicha,composicion:composicion || [],sensible:!!sensible,revelada:false};
  }else{
    obrasPortfolioData.push({img,titulo,ano,material,medidas,descripcion:descripcion || "",sinFicha:!!sinFicha,composicion:composicion || [],sensible:!!sensible,revelada:false});
    obraActualIndex = obrasPortfolioData.length - 1;
  }

  let overlay = document.querySelector('.obraOverlay');

  if(!overlay){
    overlay = document.createElement('div');
    overlay.className = 'obraOverlay';
    overlay.setAttribute('tabindex','0');
    document.body.appendChild(overlay);
  }else{
    document.body.appendChild(overlay);
  }

  overlay.style.zIndex = "2147483647";
  visorObraActivo = true;
  pintarObraActual();
}

window.addEventListener('keydown', (e)=>{
  const overlay = document.querySelector('.obraOverlay');
  if(!overlay) return;

  if(e.key === 'ArrowRight'){
    e.preventDefault();
    e.stopPropagation();
    pasarObra(1);
  }

  if(e.key === 'ArrowLeft'){
    e.preventDefault();
    e.stopPropagation();
    pasarObra(-1);
  }

  if(e.key === 'Escape'){
    e.preventDefault();
    e.stopPropagation();
    resetPorEscape();
  }
}, true);



;

/* ===== BLOQUE ORIGINAL 2 ===== */

// Liquid ripple on scroll (directional triggers + progressive window degradation)
(function(){
   const root = document.documentElement || document.body;
   // only enable heavy SVG ripple on non-mobile devices
   if (false && !window.isMobileMode && window.innerWidth > 900) {
  root.style.filter = 'url(#ripple-filter)';
}

   const disp = document.getElementById('ripple-displacement');
   const noise = document.getElementById('ripple-noise');
   if(!disp || !noise) return;
   if(!root.style.filter) return;

   let lastY = window.scrollY || window.pageYOffset;
   let velocity = 0;
   let scale = 0;
   let currentDir = 0; // -1 up, 0 none, 1 down
   let lastTrigger = 0;
   const TRIGGER_COOLDOWN = 600; // ms

   function triggerWave(amount){
      velocity = Math.max(velocity, amount);
   }

   let scrollQueued = false;
   function onScroll(){
      if(document.body.classList.contains("ventana-max-activa")){
        lastY = window.scrollY || window.pageYOffset;
        return;
      }
      if(scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(()=>{
        scrollQueued = false;
        const y = window.scrollY || window.pageYOffset;
        const dy = y - lastY;
        lastY = y;
        const newDir = dy > 4 ? 1 : (dy < -4 ? -1 : 0);
        const now = performance.now();
        if(newDir !== 0 && newDir !== currentDir && (now - lastTrigger) > TRIGGER_COOLDOWN){
           lastTrigger = now;
           triggerWave(18 + Math.random()*10);
        }
        currentDir = newDir;

        const depthFactor = Math.min(1, Math.abs(y) / 1200);
        const wins = document.querySelectorAll('.ventana');
        wins.forEach(win => {
          if(win.classList.contains("max")) return;
          const minOpacity = window.isMobileMode ? 0.5 : 0.15;
          const mult = window.isMobileMode ? 0.5 : 0.75;
          win.style.opacity = String(Math.max(minOpacity, 1 - depthFactor * mult));
          if(window.isMobileMode) return;
          const rect = win.getBoundingClientRect();
          if(rect.top < window.innerHeight && rect.bottom > 0){
            win.querySelectorAll('img').forEach(img => {
              img.style.opacity = String(Math.max(0.25, 1 - depthFactor));
            });
          }
        });
      });
   }

   window.addEventListener('scroll', onScroll, {passive:true});

   function animate(){
      if(!root.style.filter){ return; }
      velocity *= 0.86;
      scale = Math.min(36, velocity);
      disp.setAttribute('scale', String(scale));
      const bf = 0.008 + Math.min(0.025, scale * 0.0005) + (Math.sin(performance.now()/7000) * 0.0004);
      noise.setAttribute('baseFrequency', bf.toFixed(5));
      requestAnimationFrame(animate);
   }
   requestAnimationFrame(animate);
})();



document.addEventListener("DOMContentLoaded",()=>{
  const teclado=document.getElementById("teclado");
  if(!teclado) return;

  const toggle=teclado.querySelector(".teclado-toggle");
  const botones=teclado.querySelectorAll("button[data-key]");

  if(toggle){
    const alternar=(e)=>{
      if(e.cancelable) e.preventDefault();
      e.stopPropagation();
      teclado.classList.toggle("abierto");
    };
    toggle.addEventListener("pointerdown",alternar,{passive:false});
  }

  botones.forEach(btn=>{
    const activar=(e)=>{
      if(e.cancelable) e.preventDefault();
      e.stopPropagation();

      const key=btn.dataset.key;
      activarTeclaInterfaz(key);
    };

    btn.addEventListener("pointerdown",activar,{passive:false});
  });
});

;

/* ===== BLOQUE ORIGINAL 3 ===== */

/* Arrastre táctil: las cabeceras siguen siendo el asidero de cada ventana. */
document.addEventListener("pointerdown",e=>{
  if(!(window.isMobileMode || e.pointerType==="touch" || e.pointerType==="pen")) return;
  const cabecera=e.target.closest(".ventana .barra, .portfolio-nodo-cabecera");
  if(!cabecera || e.target.closest(".btn, .portfolio-nodo-cerrar, button, a, input, textarea, select")) return;
  const panel=cabecera.closest(".portfolio-nodo-ventana, .portfolio-inline-nodo-ventana") || cabecera.closest(".ventana");
  if(!panel || panel.classList.contains("max")) return;

  e.preventDefault();
  e.stopImmediatePropagation();
  const limite=
    panel.closest(".portfolio-nodos-overlay") ||
    panel.closest(".portfolio-inline-nodos") ||
    document.documentElement;

  const inicio={x:e.clientX,y:e.clientY,left:panel.offsetLeft,top:panel.offsetTop};
  panel.classList.add("dragging");
  panel.style.zIndex=String(Date.now());
  cabecera.setPointerCapture?.(e.pointerId);

  const actualizarLineaNodoTactil=()=>{
    if(!panel.matches(".portfolio-nodos-overlay .portfolio-nodo-ventana")) return;
    const overlay=panel.closest(".portfolio-nodos-overlay");
    const wrapNodo=overlay?.closest(".portfolio-wrap");
    const editorialNodo=wrapNodo?.querySelector(".portfolio-editorial");
    const fila=editorialNodo?.querySelector(".portfolio-nodos-info");
    const id=panel.dataset.ventanaNodo;
    if(!overlay || !fila || !id) return;

    const boton=fila.querySelector(`.portfolio-nodo-link[data-nodo="${id}"]`);
    const linea=overlay.querySelector(`.portfolio-nodo-linea[data-linea="${id}"]`);
    if(!boton || !linea || !panel.classList.contains("is-open")) return;

    const base=overlay.getBoundingClientRect();
    const br=boton.getBoundingClientRect();
    const pr=panel.getBoundingClientRect();

    const x1=br.left-base.left+br.width/2;
    const y1=br.bottom-base.top;
    const x2=pr.left-base.left+pr.width/2;
    const y2=pr.top-base.top;
    const mitadY=y1+(y2-y1)*.52;

    linea.setAttribute(
      "d",
      `M ${x1} ${y1} L ${x1} ${mitadY} L ${x2} ${mitadY} L ${x2} ${y2}`
    );
  };

  const mover=ev=>{
    const maxX=Math.max(0,limite.clientWidth-panel.offsetWidth);
    const maxY=limite===document.documentElement
      ? Math.max(0,document.documentElement.scrollHeight-panel.offsetHeight)
      : Math.max(0,limite.clientHeight-panel.offsetHeight);
    const x=Math.max(0,Math.min(maxX,inicio.left+ev.clientX-inicio.x));
    const y=Math.max(0,Math.min(maxY,inicio.top+ev.clientY-inicio.y));
    panel.style.left=x+"px";
    panel.style.top=y+"px";
    actualizarLineaNodoTactil();
    if(panel.classList.contains("ventana") && typeof asegurarLienzoMovil==="function") asegurarLienzoMovil(x,y,panel.offsetWidth,panel.offsetHeight);
  };
  const terminar=ev=>{
    panel.classList.remove("dragging");
    cabecera.releasePointerCapture?.(ev.pointerId);
    cabecera.removeEventListener("pointermove",mover);
    cabecera.removeEventListener("pointerup",terminar);
    cabecera.removeEventListener("pointercancel",terminar);
  };
  cabecera.addEventListener("pointermove",mover,{passive:false});
  cabecera.addEventListener("pointerup",terminar,{passive:true});
  cabecera.addEventListener("pointercancel",terminar,{passive:true});
},{capture:true,passive:false});


;

/* ===== BLOQUE ORIGINAL 4 ===== */

(()=>{try{window.miguelPerfilUsuario=JSON.parse(localStorage.getItem("miguel-avatar")||"{}")||{}}catch(_e){window.miguelPerfilUsuario={}}window.addEventListener("storage",e=>{if(e.key==="miguel-avatar")try{window.miguelPerfilUsuario=JSON.parse(e.newValue||"{}")||{}}catch(_e){}})})();


;

/* ===== BLOQUE ORIGINAL 5 ===== */

/* =========================================================
   MÓVIL HORIZONTAL — REAJUSTE AL GIRAR
   Impide que ventanas ya abiertas queden fuera del área visible.
   ========================================================= */
(function(){
  const mqLandscape=window.matchMedia(
    "(orientation: landscape) and (max-height: 560px) and (pointer: coarse)"
  );

  function numero(v){
    const n=parseFloat(v);
    return Number.isFinite(n)?n:0;
  }

  function limitarPanelEnPadre(panel,padre,margen=6){
    if(!panel || !padre) return;
    const maxX=Math.max(margen,padre.clientWidth-panel.offsetWidth-margen);
    const maxY=Math.max(margen,padre.clientHeight-panel.offsetHeight-margen);
    panel.style.left=Math.max(margen,Math.min(numero(panel.style.left)||panel.offsetLeft,maxX))+"px";
    panel.style.top=Math.max(margen,Math.min(numero(panel.style.top)||panel.offsetTop,maxY))+"px";
  }

  function ajustarHorizontal(){
    if(!mqLandscape.matches) return;

    /* Ventanas generales: mantenerlas dentro del viewport que el usuario ve. */
    const yBase=window.scrollY || document.documentElement.scrollTop || 0;
    const margenX=8;
    const margenArriba=48;
    const margenAbajo=8;

    document.querySelectorAll(".ventana:not(.max):not(.min)").forEach(v=>{
      if(v.offsetParent===null) return;

      const maxLeft=Math.max(margenX,window.innerWidth-v.offsetWidth-margenX);
      let left=numero(v.style.left);
      left=Math.max(margenX,Math.min(left,maxLeft));

      const minTop=yBase+margenArriba;
      const maxTop=Math.max(
        minTop,
        yBase+window.innerHeight-v.offsetHeight-margenAbajo
      );
      let top=numero(v.style.top);
      if(!top) top=minTop;
      top=Math.max(minTop,Math.min(top,maxTop));

      v.style.left=left+"px";
      v.style.top=top+"px";
    });

    /* Nodos principales e internos: recalcular dentro de su overlay. */
    document
      .querySelectorAll(
        ".portfolio-nodos-overlay .portfolio-nodo-ventana.is-open, "+
        ".portfolio-inline-nodos .portfolio-inline-nodo-ventana.is-open"
      )
      .forEach(panel=>{
        const padre=panel.parentElement;
        limitarPanelEnPadre(panel,padre,6);
      });
  }

  let raf=0;
  function programar(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      requestAnimationFrame(ajustarHorizontal);
    });
  }

  window.addEventListener("orientationchange",()=>{
    setTimeout(programar,90);
    setTimeout(programar,260);
  },{passive:true});

  window.addEventListener("resize",programar,{passive:true});

  document.addEventListener("DOMContentLoaded",programar);
})();
