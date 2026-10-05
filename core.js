/* =========================================================
   Tucankit Citas — núcleo reutilizable (core.js)

   Funciones "puras": no tocan la pantalla, ni IndexedDB, ni internet.
   Por eso se pueden reutilizar tal cual en otro lugar
   (por ejemplo, una extensión de Chrome).

   Contiene:
     1. Datos de idioma para fechas y la plantilla por defecto
     2. Plantillas de mensaje
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
      plantillaPorDefecto: 'Hola {nombre}, le recordamos su cita de {servicio} el {fecha} a las {hora} en {negocio}. Por favor responda SÍ para confirmar. ¡Gracias!'
    }
  };

  let idioma = 'es';

  /** Elige el idioma para las fechas (si no existe, se queda en español). */
  function usarIdioma(codigo) {
    idioma = IDIOMAS[codigo] ? codigo : 'es';
  }

  /** Devuelve un dato del idioma actual. */
  const dato = (clave) => IDIOMAS[idioma][clave] ?? IDIOMAS.es[clave];

  /** La plantilla de mensaje original del idioma actual. */
  const plantillaPorDefecto = () => dato('plantillaPorDefecto');

  /* =========================================================
     2. PLANTILLAS DE MENSAJE
     ========================================================= */

  /** Palabras que se pueden usar en la plantilla del mensaje. */
  const VARIABLES = ['nombre', 'servicio', 'fecha', 'hora', 'negocio', 'direccion'];

  /**
   * Reemplaza las palabras entre { } por los datos.
   * Las palabras que no conoce las deja tal cual.
   * Ejemplo: reemplazarVariables('Hola {nombre}', { nombre: 'Ana' }) → 'Hola Ana'
   */
  function reemplazarVariables(texto, datos = {}) {
    return String(texto).replace(/\{(\w+)\}/g, (completo, nombre) => (nombre in datos ? datos[nombre] : completo));
  }

  /** Arma el mensaje final y quita espacios dobles si algún dato venía vacío. */
  function armarMensaje(plantilla, datos) {
    return reemplazarVariables(plantilla, datos).replace(/[ \t]{2,}/g, ' ').trim();
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

  /** Arma el enlace oficial de WhatsApp: https://wa.me/<numero>?text=<mensaje> */
  function enlaceWhatsApp(numero, mensaje) {
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  }

  /* ---------- Lo que este archivo ofrece hacia afuera ---------- */
  const TucankitCore = {
    IDIOMAS,
    usarIdioma,
    plantillaPorDefecto,
    VARIABLES,
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
    enlaceWhatsApp
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = TucankitCore;
  global.TucankitCore = TucankitCore;
})(typeof globalThis !== 'undefined' ? globalThis : this);
