/* =========================================================
   Tucankit Citas — núcleo reutilizable (core.js)

   Funciones "puras": no tocan la pantalla, ni IndexedDB, ni internet.
   Por eso se pueden reutilizar tal cual en otro lugar
   (por ejemplo, una extensión de Chrome).

   Contiene:
     1. Datos de idioma: fechas, piezas de mensajes y respuestas
     2. Plantillas de mensaje (constructor con clics) y montos de dinero
     3. Fechas y horas
     4. Teléfonos y enlace de WhatsApp

   Cómo se usa:
     - En una página: <script src="core.js"></script> y luego
       TucankitCore.fechaAmigable('2026-10-07')
     - En Node (pruebas): const TucankitCore = require('./core.js')
   ========================================================= */
(function (global) {
  'use strict';

  /* =========================================================
     1. DATOS DE IDIOMA
     Nombres de días y meses, formato de hora y plantilla por defecto.
     Para agregar portugués: copiar el bloque "es" como "pt", traducirlo
     y llamar a usarIdioma('pt'). (Los textos de pantalla están en app.js.)
     ========================================================= */
  const IDIOMAS = {
    es: {
      dias: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
      meses: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
        'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
      am: 'a. m.',
      pm: 'p. m.',
      fechaFormato: '{dia} {numero} de {mes}',
      fechaFormatoConAnio: '{dia} {numero} de {mes} de {anio}',
      momentoFormato: '{fecha}, {hora}',
      // Separadores de miles y decimales para mostrar montos (₡15.000,50)
      separadorMiles: '.',
      separadorDecimal: ',',
      // Piezas para armar plantillas con clics (constructor de mensajes).
      // Cada pieza tiene versión "tu" (tú) y "usted".
      constructor: {
        saludos: ['Hola {nombre},', '¡Hola {nombre}!', 'Buenos días {nombre},', 'Buenas tardes {nombre},', 'Pura vida {nombre},'],
        cuerpos: {
          cita: {
            tu: 'te recuerdo tu cita de {servicio} el {fecha} a las {hora} en {negocio}.',
            usted: 'le recordamos su cita de {servicio} el {fecha} a las {hora} en {negocio}.'
          },
          entrega: {
            tu: 'te aviso que tu pedido ({detalle}) llega el {fecha}.',
            usted: 'le avisamos que su pedido ({detalle}) llega el {fecha}.'
          },
          cobro: {
            tu: 'te recuerdo el saldo pendiente de {monto} ({detalle}). Puedes pagarlo por {pago}.',
            usted: 'le recordamos el saldo pendiente de {monto} ({detalle}). Puede pagarlo por {pago}.'
          },
          seguimiento: {
            tu: '¿qué tal te quedó {detalle}? Me encantaría saber tu opinión.',
            usted: '¿qué tal le quedó {detalle}? Nos encantaría saber su opinión.'
          },
          llego: {
            tu: 'ya llegó tu encargo ({detalle}). Avísame cuándo puedes pasar a recogerlo o si prefieres envío.',
            usted: 'ya llegó su encargo ({detalle}). Avísenos cuándo puede pasar a recogerlo o si prefiere envío.'
          }
        },
        pedirConfirmacion: { tu: 'Por favor responde SÍ para confirmar.', usted: 'Por favor responda SÍ para confirmar.' },
        direccion: { tu: 'Te espero en {direccion}.', usted: 'Le esperamos en {direccion}.' },
        cierres: ['¡Gracias!', '¡Muchas gracias!', '¡Gracias por confiar en {negocio}!', 'Saludos.', '']
      },
      // Opciones con que se arma la plantilla original de cada tipo
      opcionesOriginales: {
        cita: { saludo: 0, trato: 'tu', confirmar: true, direccion: false, cierre: 0 },
        entrega: { saludo: 0, trato: 'tu', confirmar: false, direccion: false, cierre: 0 },
        cobro: { saludo: 0, trato: 'tu', confirmar: false, direccion: false, cierre: 1 },
        seguimiento: { saludo: 0, trato: 'tu', confirmar: false, direccion: false, cierre: 2 },
        llego: { saludo: 1, trato: 'tu', confirmar: false, direccion: false, cierre: 0 }
      },
      // Enlaces de respuesta que se pueden agregar al final del mensaje.
      // El cliente toca uno y se abre WhatsApp con ese texto ya escrito hacia el negocio.
      respuestas: {
        cita: [
          { etiqueta: '✅ Confirmar', texto: 'Confirmo mi cita del {fecha} a las {hora}' },
          { etiqueta: '❌ Cancelar', texto: 'Necesito cancelar mi cita del {fecha} a las {hora}' }
        ],
        entrega: [
          { etiqueta: '✅ Confirmar', texto: 'Confirmo que puedo recibir el pedido el {fecha}.' }
        ],
        cobro: [
          { etiqueta: '💰 Ya pagué', texto: 'Ya pagué el saldo de {monto}.' }
        ],
        seguimiento: [],
        llego: [
          { etiqueta: '✅ Voy por él', texto: '¡Gracias! Paso a recoger mi encargo.' }
        ]
      },
      tocaParaResponder: 'Toca para responder:'
    }
  };

  let idioma = 'es';

  /** Elige el idioma para las fechas (si no existe, se queda en español). */
  function usarIdioma(codigo) {
    idioma = IDIOMAS[codigo] ? codigo : 'es';
  }

  /** Devuelve un dato del idioma actual. */
  const dato = (clave) => IDIOMAS[idioma][clave] ?? IDIOMAS.es[clave];

  /* Tipos de recordatorio. El orden es el que se muestra en pantalla. */
  const TIPOS = ['cita', 'entrega', 'cobro', 'seguimiento', 'llego'];

  /** Opciones originales del constructor para un tipo. */
  const opcionesPorDefecto = (tipo = 'cita') => ({ ...(dato('opcionesOriginales')[tipo] || dato('opcionesOriginales').cita) });

  /** Pone en mayúscula la primera letra (saltando signos como ¿ o ¡). */
  const mayusculaInicial = (texto) => texto.replace(/^([¿¡"«]*)(\p{L})/u, (todo, signos, letra) => signos + letra.toUpperCase());

  /**
   * Arma una plantilla con las opciones elegidas con clics:
   *   saludo (número de la lista), trato ("tu" o "usted"),
   *   confirmar (sí/no), direccion (sí/no), cierre (número de la lista).
   */
  function construirPlantilla(tipo, opciones = {}) {
    const piezas = dato('constructor');
    const o = { ...opcionesPorDefecto(tipo), ...opciones };
    const trato = o.trato === 'usted' ? 'usted' : 'tu';
    const saludo = piezas.saludos[o.saludo] ?? piezas.saludos[0];
    let cuerpo = (piezas.cuerpos[tipo] || piezas.cuerpos.cita)[trato];
    // Después de "¡Hola Ana!" la frase empieza con mayúscula; después de "Hola Ana," no
    if (/[!.]$/.test(saludo)) cuerpo = mayusculaInicial(cuerpo);
    const partes = [saludo, cuerpo];
    if (o.confirmar) partes.push(piezas.pedirConfirmacion[trato]);
    if (o.direccion) partes.push(piezas.direccion[trato]);
    const cierre = piezas.cierres[o.cierre] ?? '';
    if (cierre) partes.push(cierre);
    return partes.join(' ');
  }

  /** La plantilla de mensaje original de un tipo (por defecto, "cita"). */
  const plantillaPorDefecto = (tipo = 'cita') => construirPlantilla(tipo, opcionesPorDefecto(tipo));

  /**
   * Texto con enlaces de respuesta para el cliente (ej.: "✅ Confirmar: https://wa.me/...").
   * Cada enlace abre WhatsApp hacia el número del negocio con la respuesta ya escrita.
   * Devuelve '' si el tipo no tiene respuestas o no hay número del negocio.
   */
  function textoEnlacesRespuesta(tipo, numeroNegocio, datos = {}) {
    const respuestas = dato('respuestas')[tipo] || [];
    if (!numeroNegocio || !respuestas.length) return '';
    const lineas = respuestas.map((r) =>
      `${r.etiqueta}: ${enlaceWhatsApp(numeroNegocio, reemplazarVariables(r.texto, datos), 'app')}`);
    return [dato('tocaParaResponder'), ...lineas].join('\n');
  }

  /* =========================================================
     2. PLANTILLAS DE MENSAJE
     ========================================================= */

  /** Palabras que se pueden usar en cualquier plantilla. */
  const VARIABLES_COMUNES = ['nombre', 'negocio', 'atiende', 'direccion'];

  /** Palabras propias de cada tipo de recordatorio. */
  const VARIABLES_POR_TIPO = {
    cita: ['servicio', 'fecha', 'hora'],
    entrega: ['detalle', 'fecha', 'hora'],
    cobro: ['monto', 'pago', 'detalle', 'fecha'],
    seguimiento: ['detalle', 'fecha'],
    llego: ['detalle', 'fecha']
  };

  /** Todas las palabras que entiende una plantilla de un tipo. */
  const variablesDeTipo = (tipo) => (VARIABLES_POR_TIPO[tipo] || []).concat(VARIABLES_COMUNES);

  /** Todas las palabras conocidas (sin repetir). */
  const VARIABLES = [...new Set(TIPOS.flatMap(variablesDeTipo))];

  /**
   * Reemplaza las palabras entre { } por los datos.
   * Las palabras que no conoce las deja tal cual.
   * Ejemplo: reemplazarVariables('Hola {nombre}', { nombre: 'Ana' }) → 'Hola Ana'
   */
  function reemplazarVariables(texto, datos = {}) {
    return String(texto).replace(/\{(\w+)\}/g, (completo, nombre) => (nombre in datos ? datos[nombre] : completo));
  }

  /**
   * Arma el mensaje final:
   *  - reemplaza las palabras entre { },
   *  - si se pasa un bloque extra (ej.: enlaces de respuesta), lo agrega al final,
   *  - si se pasa una firma, la agrega al final (en una línea aparte),
   *  - limpia restos de datos vacíos: "()" sueltos, espacios dobles
   *    y espacios antes de un signo (" ." → ".").
   */
  function armarMensaje(plantilla, datos, firma = '', extra = '') {
    let texto = reemplazarVariables(plantilla, datos);
    if (extra) texto = texto.trimEnd() + '\n\n' + extra.trim();
    const firmaLista = reemplazarVariables(String(firma || ''), datos).trim();
    if (firmaLista) texto = texto.trimEnd() + '\n\n' + firmaLista;
    return texto
      .replace(/\(\s*\)/g, '')            // paréntesis vacíos
      .replace(/[ \t]{2,}/g, ' ')           // espacios dobles
      .replace(/[ \t]+([.,;:!?)])/g, '$1')  // espacio antes de un signo
      .replace(/[ \t]+\n/g, '\n')           // espacios al final de una línea
      .trim();
  }

  /* ---------- Montos de dinero ---------- */

  /**
   * Lee un monto escrito por una persona y lo convierte en número.
   * Acepta "15000", "15.000", "15 000", "15.000,50" y "15000.50".
   * Devuelve null si no hay un número válido.
   */
  function leerMonto(texto) {
    let limpio = String(texto ?? '').replace(/[^\d.,]/g, '');
    if (!limpio) return null;
    if (limpio.includes(',')) {
      // Con coma: la coma es el decimal y los puntos son miles
      limpio = limpio.replace(/\./g, '').replace(',', '.').replace(/,/g, '');
    } else if (/^\d{1,3}(\.\d{3})+$/.test(limpio)) {
      // "15.000" o "1.500.000": los puntos son miles
      limpio = limpio.replace(/\./g, '');
    }
    const numero = Number(limpio);
    return Number.isFinite(numero) && numero >= 0 ? Math.round(numero * 100) / 100 : null;
  }

  /** 15000 → "₡15.000" · 15000.5 → "₡15.000,50" */
  function formatearMonto(numero, moneda = '₡') {
    if (typeof numero !== 'number' || !Number.isFinite(numero)) return '';
    const [entero, decimales] = numero.toFixed(2).split('.');
    const conMiles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, dato('separadorMiles'));
    const parteDecimal = decimales === '00' ? '' : dato('separadorDecimal') + decimales;
    return `${moneda}${conMiles}${parteDecimal}`;
  }

  /* =========================================================
     3. FECHAS Y HORAS
     IMPORTANTE: las fechas se manejan como texto "AAAA-MM-DD" y las horas
     como "HH:MM". Nunca se usa new Date("AAAA-MM-DD") porque el navegador
     lo interpreta en hora UTC y en Costa Rica (UTC-6) la cita aparecería
     un día antes. Siempre se arma la fecha con año, mes y día locales.
     ========================================================= */
  const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
  const FORMATO_HORA = /^\d{2}:\d{2}$/;

  /** Agrega un cero adelante si hace falta: 7 → "07". */
  const dosDigitos = (n) => String(n).padStart(2, '0');

  /** Convierte una fecha local del dispositivo en texto "AAAA-MM-DD". */
  function fechaATexto(fecha) {
    return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
  }

  /** Convierte "AAAA-MM-DD" en una fecha local (a medianoche del dispositivo). */
  function textoAFechaLocal(texto) {
    const [anio, mes, dia] = texto.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
  }

  /** Suma (o resta) días a una fecha "AAAA-MM-DD". */
  function sumarDias(texto, dias) {
    const fecha = textoAFechaLocal(texto);
    fecha.setDate(fecha.getDate() + dias);
    return fechaATexto(fecha);
  }

  /** La fecha de hoy según el reloj del dispositivo, como "AAAA-MM-DD". */
  const hoyTexto = () => fechaATexto(new Date());

  /** La fecha de mañana según el reloj del dispositivo, como "AAAA-MM-DD". */
  const mananaTexto = () => sumarDias(hoyTexto(), 1);

  /** "2026-10-07" → "miércoles 7 de octubre" (agrega el año si no es el actual). */
  function fechaAmigable(texto) {
    const fecha = textoAFechaLocal(texto);
    const datos = {
      dia: dato('dias')[fecha.getDay()],
      numero: fecha.getDate(),
      mes: dato('meses')[fecha.getMonth()],
      anio: fecha.getFullYear()
    };
    const esteAnio = new Date().getFullYear();
    return reemplazarVariables(dato(datos.anio === esteAnio ? 'fechaFormato' : 'fechaFormatoConAnio'), datos);
  }

  /** "15:30" → "3:30 p. m." */
  function horaAmigable(texto) {
    const [horas, minutos] = texto.split(':').map(Number);
    const sufijo = horas < 12 ? dato('am') : dato('pm');
    const horas12 = horas % 12 || 12;
    return `${horas12}:${dosDigitos(minutos)} ${sufijo}`;
  }

  /** Un instante guardado (milisegundos) → "lunes 6 de octubre, 3:30 p. m." */
  function momentoAmigable(milisegundos) {
    const d = new Date(milisegundos);
    return reemplazarVariables(dato('momentoFormato'), {
      fecha: fechaAmigable(fechaATexto(d)),
      hora: horaAmigable(`${dosDigitos(d.getHours())}:${dosDigitos(d.getMinutes())}`)
    });
  }

  /* =========================================================
     4. TELÉFONOS Y WHATSAPP
     ========================================================= */

  /**
   * Limpia un teléfono y le agrega el código de país si hace falta.
   * Devuelve solo dígitos, listo para WhatsApp (ej.: "50688888888").
   * Reglas:
   *  1. Si empieza con "+", ya es internacional: solo se quitan los símbolos.
   *  2. Si no: se quitan símbolos y un 0 inicial si lo tiene.
   *  3. Si ya empieza con el código de país y le siguen al menos 8 dígitos, se deja.
   *  4. Si no, se le agrega el código de país configurado.
   */
  function normalizarTelefono(texto, codigoPais) {
    const limpio = String(texto || '').trim();
    if (limpio.startsWith('+')) return limpio.replace(/\D/g, '');

    const digitos = limpio.replace(/\D/g, '').replace(/^0/, '');
    if (!digitos) return '';
    const codigo = String(codigoPais || '').replace(/\D/g, '');
    if (digitos.startsWith(codigo) && digitos.length >= codigo.length + 8) return digitos;
    return codigo + digitos;
  }

  /** Un número internacional válido tiene entre 8 y 15 dígitos. */
  const telefonoValido = (digitos) => /^\d{8,15}$/.test(String(digitos));

  /** "50688888888" → "+506 8888 8888" (para mostrarlo bonito en pantalla). */
  function formatearTelefono(digitos, codigoPais) {
    const codigo = String(codigoPais || '');
    if (codigo && digitos.startsWith(codigo)) {
      const resto = digitos.slice(codigo.length).replace(/(\d{4})(?=\d)/g, '$1 ');
      return `+${codigo} ${resto}`;
    }
    return `+${digitos}`;
  }

  /**
   * Arma el enlace oficial de WhatsApp con el mensaje ya escrito.
   *  - destino "app" (celular): https://wa.me/<numero>?text=<mensaje>
   *    abre la app de WhatsApp directamente.
   *  - destino "web" (computadora): https://web.whatsapp.com/send?phone=...&text=...
   *    abre WhatsApp Web sin pasar por la página intermedia de api.whatsapp.com.
   */
  function enlaceWhatsApp(numero, mensaje, destino = 'app') {
    const texto = encodeURIComponent(mensaje);
    if (destino === 'web') return `https://web.whatsapp.com/send?phone=${numero}&text=${texto}`;
    return `https://wa.me/${numero}?text=${texto}`;
  }

  /** ¿Es un celular o tablet? (allí conviene abrir la app de WhatsApp) */
  function esCelular(agente = '', plataforma = '', puntosTactiles = 0) {
    return /android|iphone|ipad|ipod|mobile/i.test(agente)
      || (plataforma === 'MacIntel' && puntosTactiles > 1); // iPad nuevo se presenta como Mac
  }

  /* ---------- Lo que este archivo ofrece hacia afuera ---------- */
  const TucankitCore = {
    IDIOMAS,
    usarIdioma,
    plantillaPorDefecto,
    opcionesPorDefecto,
    construirPlantilla,
    textoEnlacesRespuesta,
    TIPOS,
    VARIABLES,
    VARIABLES_COMUNES,
    VARIABLES_POR_TIPO,
    variablesDeTipo,
    leerMonto,
    formatearMonto,
    reemplazarVariables,
    armarMensaje,
    FORMATO_FECHA,
    FORMATO_HORA,
    dosDigitos,
    fechaATexto,
    textoAFechaLocal,
    sumarDias,
    hoyTexto,
    mananaTexto,
    fechaAmigable,
    horaAmigable,
    momentoAmigable,
    normalizarTelefono,
    telefonoValido,
    formatearTelefono,
    enlaceWhatsApp,
    esCelular
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = TucankitCore;
  global.TucankitCore = TucankitCore;
})(typeof globalThis !== 'undefined' ? globalThis : this);
