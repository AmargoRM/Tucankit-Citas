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
     5. Mezcla segura de datos (sincronización) y empaquetado para QR

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
      // Piezas para armar plantillas con clics (constructor de mensajes).
      // Cada pieza tiene versión "tu" (tú) y "usted".
      constructor: {
        saludos: ['Hola {nombre},', '¡Hola {nombre}!', 'Buenos días {nombre},', 'Buenas tardes {nombre},', 'Saludos {nombre},'],
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

  /* ---------- Países ----------
     Código de país del teléfono, moneda y formato local de números.
     "zonas": zonas horarias, para adivinar el país la primera vez. */
  const PAISES = [
    { codigo: 'AR', nombre: 'Argentina', prefijo: '54', moneda: '$', idioma: 'es-AR', zonas: ['America/Argentina', 'America/Buenos_Aires'] },
    { codigo: 'BO', nombre: 'Bolivia', prefijo: '591', moneda: 'Bs', idioma: 'es-BO', zonas: ['America/La_Paz'] },
    { codigo: 'BR', nombre: 'Brasil', prefijo: '55', moneda: 'R$', idioma: 'pt-BR', zonas: ['America/Sao_Paulo', 'America/Manaus', 'America/Fortaleza', 'America/Recife', 'America/Bahia', 'America/Belem'] },
    { codigo: 'CA', nombre: 'Canadá', prefijo: '1', moneda: '$', idioma: 'en-CA', zonas: ['America/Toronto', 'America/Vancouver', 'America/Montreal', 'America/Edmonton', 'America/Winnipeg', 'America/Halifax'] },
    { codigo: 'CL', nombre: 'Chile', prefijo: '56', moneda: '$', idioma: 'es-CL', zonas: ['America/Santiago'] },
    { codigo: 'CO', nombre: 'Colombia', prefijo: '57', moneda: '$', idioma: 'es-CO', zonas: ['America/Bogota'] },
    { codigo: 'CR', nombre: 'Costa Rica', prefijo: '506', moneda: '₡', idioma: 'es-CR', zonas: ['America/Costa_Rica'] },
    { codigo: 'CU', nombre: 'Cuba', prefijo: '53', moneda: '$', idioma: 'es-CU', zonas: ['America/Havana'] },
    { codigo: 'EC', nombre: 'Ecuador', prefijo: '593', moneda: '$', idioma: 'es-EC', zonas: ['America/Guayaquil'] },
    { codigo: 'SV', nombre: 'El Salvador', prefijo: '503', moneda: '$', idioma: 'es-SV', zonas: ['America/El_Salvador'] },
    { codigo: 'ES', nombre: 'España', prefijo: '34', moneda: '€', idioma: 'es-ES', zonas: ['Europe/Madrid', 'Atlantic/Canary'] },
    { codigo: 'US', nombre: 'Estados Unidos', prefijo: '1', moneda: '$', idioma: 'es-US', zonas: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu'] },
    { codigo: 'GT', nombre: 'Guatemala', prefijo: '502', moneda: 'Q', idioma: 'es-GT', zonas: ['America/Guatemala'] },
    { codigo: 'HN', nombre: 'Honduras', prefijo: '504', moneda: 'L', idioma: 'es-HN', zonas: ['America/Tegucigalpa'] },
    { codigo: 'MX', nombre: 'México', prefijo: '52', moneda: '$', idioma: 'es-MX', zonas: ['America/Mexico_City', 'America/Monterrey', 'America/Cancun', 'America/Tijuana', 'America/Merida', 'America/Chihuahua', 'America/Hermosillo', 'America/Mazatlan', 'America/Bahia_Banderas', 'America/Matamoros'] },
    { codigo: 'NI', nombre: 'Nicaragua', prefijo: '505', moneda: 'C$', idioma: 'es-NI', zonas: ['America/Managua'] },
    { codigo: 'PA', nombre: 'Panamá', prefijo: '507', moneda: '$', idioma: 'es-PA', zonas: ['America/Panama'] },
    { codigo: 'PY', nombre: 'Paraguay', prefijo: '595', moneda: '₲', idioma: 'es-PY', zonas: ['America/Asuncion'] },
    { codigo: 'PE', nombre: 'Perú', prefijo: '51', moneda: 'S/', idioma: 'es-PE', zonas: ['America/Lima'] },
    { codigo: 'PT', nombre: 'Portugal', prefijo: '351', moneda: '€', idioma: 'pt-PT', zonas: ['Europe/Lisbon', 'Atlantic/Azores', 'Atlantic/Madeira'] },
    { codigo: 'PR', nombre: 'Puerto Rico', prefijo: '1', moneda: '$', idioma: 'es-PR', zonas: ['America/Puerto_Rico'] },
    { codigo: 'DO', nombre: 'República Dominicana', prefijo: '1', moneda: 'RD$', idioma: 'es-DO', zonas: ['America/Santo_Domingo'] },
    { codigo: 'UY', nombre: 'Uruguay', prefijo: '598', moneda: '$', idioma: 'es-UY', zonas: ['America/Montevideo'] },
    { codigo: 'VE', nombre: 'Venezuela', prefijo: '58', moneda: 'Bs.', idioma: 'es-VE', zonas: ['America/Caracas'] }
  ];

  /** Busca un país por su código de dos letras (ej.: "MX"). */
  const paisPorCodigo = (codigo) => PAISES.find((p) => p.codigo === codigo) || null;

  /** Bandera (emoji) a partir del código de dos letras. */
  const bandera = (codigo) => (/^[A-Z]{2}$/.test(codigo)
    ? String.fromCodePoint(...[...codigo].map((letra) => 0x1F1E6 + letra.charCodeAt(0) - 65)) : '🌐');

  /**
   * Adivina el país la primera vez: por el idioma del navegador ("es-MX")
   * o por la zona horaria del dispositivo. Si no puede, devuelve null.
   */
  function adivinarPais(idiomaNavegador = '', zonaHoraria = '') {
    const region = (String(idiomaNavegador).split('-')[1] || '').toUpperCase();
    if (paisPorCodigo(region)) return region;
    const porZona = PAISES.find((p) => p.zonas.some((z) => String(zonaHoraria).startsWith(z)));
    return porZona ? porZona.codigo : null;
  }

  /** País que corresponde a un prefijo telefónico (si hay varios, el primero de la lista). */
  const paisPorPrefijo = (prefijo) => {
    const preferidos = { 1: 'US' };
    return preferidos[prefijo] || (PAISES.find((p) => p.prefijo === String(prefijo)) || {}).codigo || null;
  };

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

  /** Separador de decimales de un idioma/país (ej.: "es-CR" → ",", "es-MX" → "."). */
  function separadorDecimal(idiomaPais = 'es-CR') {
    try {
      const parte = new Intl.NumberFormat(idiomaPais).formatToParts(1.5).find((x) => x.type === 'decimal');
      return parte ? parte.value : ',';
    } catch (error) {
      return ',';
    }
  }

  /**
   * Lee un monto escrito por una persona según la costumbre de su país.
   * Ej. en Costa Rica: "15000", "15.000", "15 000" y "15000,50".
   * Ej. en México: "15000", "15,000" y "15000.50".
   * Si después del separador de decimales hay justo 3 cifras, se toma como
   * separador de miles ("15.000" = quince mil en cualquier país).
   * Devuelve null si no hay un número válido.
   */
  function leerMonto(texto, idiomaPais = 'es-CR') {
    let limpio = String(texto ?? '').replace(/[^\d.,]/g, '');
    if (!limpio) return null;
    const decimal = separadorDecimal(idiomaPais);
    const miles = decimal === ',' ? '.' : ',';
    limpio = limpio.split(miles).join('');
    const partes = limpio.split(decimal);
    if (partes.length > 2) return null;
    if (partes.length === 2 && partes[1].length === 3) limpio = partes.join(''); // "15.000"
    else limpio = partes.join('.');
    const numero = Number(limpio);
    return Number.isFinite(numero) && numero >= 0 ? Math.round(numero * 100) / 100 : null;
  }

  /** 15000 → "₡15 000" (Costa Rica) · "$15,000" (México): según la costumbre del país. */
  function formatearMonto(numero, moneda = '₡', idiomaPais = 'es-CR') {
    if (typeof numero !== 'number' || !Number.isFinite(numero)) return '';
    let texto;
    try {
      texto = new Intl.NumberFormat(idiomaPais, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(numero);
    } catch (error) {
      texto = String(numero);
    }
    return `${moneda}${texto}`;
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

  /* =========================================================
     5. MEZCLA SEGURA DE DATOS (para QR y Google Drive)
     Cada registro (cliente, recordatorio, etiqueta, producto) tiene:
       - id: código único
       - actualizadoEn: cuándo se cambió por última vez (milisegundos)
       - dispositivoId: qué dispositivo lo cambió
       - borradoEn: cuándo se borró (null si no está borrado)
     Borrar NO elimina: marca. Así el otro dispositivo se entera.
     Al mezclar gana, registro por registro, la versión más reciente.
     ========================================================= */
  const DIAS_GUARDAR_BORRADOS = 90;

  /** Marca un registro como cambiado ahora por este dispositivo. */
  function sellar(registro, dispositivoId, ahora = Date.now()) {
    return { ...registro, actualizadoEn: ahora, dispositivoId, borradoEn: registro.borradoEn ?? null };
  }

  /** Marca un registro como borrado (no lo elimina). */
  function marcarBorrado(registro, dispositivoId, ahora = Date.now()) {
    return { ...registro, actualizadoEn: ahora, dispositivoId, borradoEn: ahora };
  }

  /** ¿Está activo (no borrado)? */
  const estaActivo = (registro) => !registro.borradoEn;

  /**
   * ¿Gana "a" sobre "b"? Gana el más reciente. Si se cambiaron en el mismo
   * milisegundo, desempata el id del dispositivo, para que todos los
   * dispositivos lleguen siempre al mismo resultado.
   */
  function gana(a, b) {
    const ta = Number(a.actualizadoEn) || 0;
    const tb = Number(b.actualizadoEn) || 0;
    if (ta !== tb) return ta > tb;
    return String(a.dispositivoId || '') > String(b.dispositivoId || '');
  }

  /** Resumen vacío para contar cambios. */
  const resumenVacio = () => ({ agregados: 0, actualizados: 0, borrados: 0 });

  /**
   * Mezcla dos listas de registros (por ejemplo, los clientes de este
   * teléfono y los que vienen de Drive). Nunca reemplaza la lista completa:
   * compara registro por registro y se queda con el más reciente.
   * Devuelve { lista, resumen } donde el resumen cuenta lo que cambió AQUÍ.
   */
  function mezclarLista(locales = [], remotos = []) {
    const resultado = new Map(locales.map((r) => [r.id, r]));
    const resumen = resumenVacio();
    for (const remoto of remotos) {
      if (!remoto || typeof remoto.id !== 'string') continue;
      const local = resultado.get(remoto.id);
      if (!local) {
        resultado.set(remoto.id, remoto);
        // Un registro que llega ya borrado no se cuenta: nunca estuvo aquí
        if (estaActivo(remoto)) resumen.agregados += 1;
        continue;
      }
      if (!gana(remoto, local)) continue;
      resultado.set(remoto.id, remoto);
      if (estaActivo(local) && !estaActivo(remoto)) resumen.borrados += 1;
      else if (!estaActivo(local) && estaActivo(remoto)) resumen.agregados += 1;
      else if (estaActivo(remoto)) resumen.actualizados += 1;
    }
    return { lista: [...resultado.values()], resumen };
  }

  /**
   * Mezcla los ajustes campo por campo. Cada ajuste guarda en "_sello"
   * cuándo se cambió cada campo: { negocio: { actualizadoEn, dispositivoId }, ... }.
   * Solo se mezclan los campos de "clavesCompartidas"; los demás son propios
   * de cada dispositivo y se quedan como están aquí.
   */
  function mezclarAjustes(local = {}, remoto = {}, clavesCompartidas = []) {
    const resultado = { ...local, _sello: { ...(local._sello || {}) } };
    let actualizados = 0;
    for (const clave of clavesCompartidas) {
      const selloRemoto = remoto._sello && remoto._sello[clave];
      if (!selloRemoto || !(clave in remoto)) continue;
      const selloLocal = resultado._sello[clave] || { actualizadoEn: 0, dispositivoId: '' };
      if (gana(selloRemoto, selloLocal)) {
        if (JSON.stringify(resultado[clave]) !== JSON.stringify(remoto[clave])) actualizados += 1;
        resultado[clave] = remoto[clave];
        resultado._sello[clave] = { ...selloRemoto };
      }
    }
    return { ajustes: resultado, actualizados };
  }

  /** Quita las marcas de borrado de más de 90 días. */
  function limpiarBorrados(lista, ahora = Date.now(), dias = DIAS_GUARDAR_BORRADOS) {
    const limite = ahora - dias * 86400000;
    return lista.filter((r) => !r.borradoEn || r.borradoEn >= limite);
  }

  /** Colecciones de registros que se sincronizan. */
  const COLECCIONES = ['clientes', 'recordatorios', 'etiquetas', 'productos'];

  /**
   * Mezcla todos los datos: { clientes, recordatorios, etiquetas, ajustes }.
   * Devuelve { datos, resumen } con el total de agregados, actualizados y borrados.
   */
  function mezclarDatos(local, remoto, clavesCompartidas = [], ahora = Date.now()) {
    const datos = {};
    const resumen = resumenVacio();
    for (const coleccion of COLECCIONES) {
      const r = mezclarLista(local[coleccion] || [], remoto[coleccion] || []);
      datos[coleccion] = limpiarBorrados(r.lista, ahora);
      resumen.agregados += r.resumen.agregados;
      resumen.actualizados += r.resumen.actualizados;
      resumen.borrados += r.resumen.borrados;
    }
    const a = mezclarAjustes(local.ajustes || {}, remoto.ajustes || {}, clavesCompartidas);
    datos.ajustes = a.ajustes;
    resumen.actualizados += a.actualizados;
    return { datos, resumen };
  }

  /* ---------- Empaquetar datos para QR: comprimir + base64url ---------- */

  /** Comprime un texto con gzip. Devuelve bytes (Uint8Array). */
  async function comprimir(texto) {
    const flujo = new Blob([texto]).stream().pipeThrough(new CompressionStream('gzip'));
    return new Uint8Array(await new Response(flujo).arrayBuffer());
  }

  /** Descomprime bytes gzip y devuelve el texto. */
  async function descomprimir(bytes) {
    const flujo = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(flujo).text();
  }

  /*
   * base64url: convierte bytes en letras, números, "-" y "_". Son caracteres
   * que se pueden poner dentro de una dirección web sin que se rompan, así
   * el QR funciona también con la cámara normal del celular.
   */
  function aBase64Url(bytes) {
    let binario = '';
    for (let i = 0; i < bytes.length; i += 1) binario += String.fromCharCode(bytes[i]);
    const b64 = typeof btoa === 'function' ? btoa(binario) : Buffer.from(binario, 'binary').toString('base64');
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function deBase64Url(texto) {
    if (!/^[A-Za-z0-9_-]*$/.test(texto)) throw new Error('Texto inválido');
    let b64 = texto.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binario = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i);
    return bytes;
  }

  /** Letras de datos por código QR. */
  const LETRAS_POR_QR = 900;

  /**
   * Parte los datos en varios códigos QR. Cada parte es una dirección web:
   *   <direccion de la app>#qr=TK4.<lote>.<número>.<total>.<datos>
   * Así, si se escanea con la cámara normal, el celular ofrece abrir la app.
   * Lo que va después de "#" nunca se envía a internet: queda en el dispositivo.
   * El lote identifica el envío, para no mezclar partes de dos envíos distintos.
   */
  function crearPartesQR(texto64, lote, direccionApp = '', letrasPorQR = LETRAS_POR_QR) {
    const total = Math.max(1, Math.ceil(texto64.length / letrasPorQR));
    const partes = [];
    for (let n = 0; n < total; n += 1) {
      partes.push(`${direccionApp}#qr=TK4.${lote}.${n + 1}.${total}.${texto64.slice(n * letrasPorQR, (n + 1) * letrasPorQR)}`);
    }
    return partes;
  }

  /**
   * Lee una parte escaneada (con o sin la dirección adelante).
   * Devuelve { lote, numero, total, datos } o null si no es nuestra.
   */
  function leerParteQR(texto) {
    const m = /TK4\.([0-9A-Z]{4,8})\.(\d{1,4})\.(\d{1,4})\.([A-Za-z0-9_-]*)\s*$/.exec(String(texto || ''));
    if (!m) return null;
    const numero = Number(m[2]);
    const total = Number(m[3]);
    if (numero < 1 || numero > total) return null;
    return { lote: m[1], numero, total, datos: m[4] };
  }

  /** Une las partes (en cualquier orden). Devuelve el texto completo o null si faltan. */
  function unirPartesQR(partes) {
    if (!partes.length) return null;
    const total = partes[0].total;
    const porNumero = new Map(partes.map((p) => [p.numero, p.datos]));
    if (porNumero.size !== total) return null;
    let texto = '';
    for (let n = 1; n <= total; n += 1) texto += porNumero.get(n);
    return texto;
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
    separadorDecimal,
    PAISES,
    paisPorCodigo,
    paisPorPrefijo,
    adivinarPais,
    bandera,
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
    esCelular,
    DIAS_GUARDAR_BORRADOS,
    COLECCIONES,
    sellar,
    marcarBorrado,
    estaActivo,
    gana,
    mezclarLista,
    mezclarAjustes,
    limpiarBorrados,
    mezclarDatos,
    comprimir,
    descomprimir,
    aBase64Url,
    deBase64Url,
    LETRAS_POR_QR,
    crearPartesQR,
    leerParteQR,
    unirPartesQR
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = TucankitCore;
  global.TucankitCore = TucankitCore;
})(typeof globalThis !== 'undefined' ? globalThis : this);
