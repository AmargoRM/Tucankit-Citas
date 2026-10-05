/* =========================================================
   Tucankit Citas — lógica de la app
   JavaScript puro, sin librerías. Todo se guarda en el teléfono.

   Índice de secciones:
     1. Textos de la interfaz
     2. Atajos y utilidades (fechas, horas y teléfonos)
     3. Base de datos (IndexedDB)
     4. Lista de citas y pestañas
     5. Formulario de cita
    10. Inicio de la app
   ========================================================= */
'use strict';

/* =========================================================
   1. TEXTOS DE LA INTERFAZ
   Todos los textos visibles están aquí.
   Para agregar otro idioma (por ejemplo portugués):
     - copiar el bloque "es" completo y llamarlo "pt",
     - traducir los textos (sin tocar lo que está entre { }),
     - cambiar IDIOMA a 'pt'.
   Lo que está entre { } se reemplaza por datos reales.
   ========================================================= */
const IDIOMA = 'es';

const TEXTOS = {
  es: {
    // Nombres de días y meses para mostrar fechas
    dias: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    meses: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
      'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    am: 'a. m.',
    pm: 'p. m.',
    fechaFormato: '{dia} {numero} de {mes}',
    fechaFormatoConAnio: '{dia} {numero} de {mes} de {anio}',
    momentoFormato: '{fecha}, {hora}',

    // Encabezado y pie
    nombreProducto: 'Citas',
    instalar: 'Instalar app',
    ajustes: 'Ajustes',
    privacidad: 'Política de privacidad',

    // Pestañas y lista
    pestanaManana: 'Mañana',
    pestanaHoy: 'Hoy',
    pestanaProximas: 'Próximas',
    pestanaTodas: 'Todas',
    tituloManana: 'Mañana · {fecha}',
    tituloHoy: 'Hoy · {fecha}',
    tituloProximas: 'Próximas citas',
    tituloTodas: 'Todas las citas',
    grupoHoy: 'Hoy · {fecha}',
    grupoManana: 'Mañana · {fecha}',
    vacioManana: 'No hay citas para mañana.',
    vacioHoy: 'No hay citas para hoy.',
    vacioProximas: 'No hay citas próximas.',
    vacioTodas: 'Todavía no hay citas. Toque «+ Nueva cita» para crear la primera.',
    nuevaCita: '+ Nueva cita',

    // Tarjeta de cita
    enviarRecordatorio: 'Enviar recordatorio',
    reenviarRecordatorio: 'Volver a enviar',
    recordatorioEnviado: '✓ Recordatorio enviado: {momento}',
    desmarcar: 'Desmarcar',
    editar: 'Editar',
    eliminar: 'Eliminar',

    // Formulario de cita
    tituloNuevaCita: 'Nueva cita',
    tituloEditarCita: 'Editar cita',
    campoNombre: 'Nombre del cliente',
    campoTelefono: 'Teléfono (WhatsApp)',
    campoFecha: 'Fecha',
    campoHora: 'Hora',
    campoServicio: 'Servicio',
    campoNota: 'Nota (opcional)',
    ejemploNombre: 'Ej.: María Rodríguez',
    ejemploTelefono: 'Ej.: 8888 8888',
    ejemploServicio: 'Ej.: limpieza dental',
    ejemploNota: 'Algo que quiera recordar de esta cita',
    seEnviaraA: 'Se enviará a {numero}',
    errorNombre: 'Escriba el nombre del cliente.',
    errorTelefono: 'Escriba un teléfono válido.',
    errorFecha: 'Elija la fecha.',
    errorHora: 'Elija la hora.',
    guardar: 'Guardar',
    cancelar: 'Cancelar',
    citaGuardada: 'Cita guardada.',
    citaEliminada: 'Cita eliminada.',

    // Confirmaciones
    confirmarEliminarTitulo: '¿Eliminar esta cita?',
    confirmarEliminarTexto: 'Se eliminará la cita de {nombre} ({fecha}, {hora}).\nEsto no se puede deshacer.',
    siEliminar: 'Sí, eliminar',

    // Recordatorio por WhatsApp
    // Si la cita no tiene servicio escrito, se usa esta palabra en el mensaje
    servicioGenerico: 'atención',
    // Si no se configuró el nombre del negocio, se usa esto en el mensaje
    negocioGenerico: 'nuestro negocio',
    plantillaPorDefecto: 'Hola {nombre}, le recordamos su cita de {servicio} el {fecha} a las {hora} en {negocio}. Por favor responda SÍ para confirmar. ¡Gracias!',
    recordatorioMarcado: 'Marcado como enviado.',
    recordatorioDesmarcado: 'Recordatorio desmarcado.',

    // Ajustes
    volver: '← Volver',
    ajustesTitulo: 'Ajustes',
    ajustesNegocio: 'Su negocio',
    campoNegocio: 'Nombre del negocio',
    campoDireccion: 'Dirección',
    ejemploNegocio: 'Ej.: Clínica Dental Sonrisa',
    ejemploDireccion: 'Ej.: San José, 200 m norte del parque',
    campoCodigoPais: 'Código de país',
    ayudaCodigoPais: 'Se agrega a los teléfonos que no lo tengan. Costa Rica = 506.',
    errorCodigoPais: 'Escriba solo números, de 1 a 4 dígitos.',
    ajustesMensaje: 'Mensaje de recordatorio',
    campoPlantilla: 'Plantilla del mensaje',
    ayudaVariables: 'Toque una palabra para agregarla. Se reemplaza por el dato real de cada cita:',
    restaurarPlantilla: 'Volver al mensaje original',
    vistaPrevia: 'Vista previa (con datos de ejemplo)',
    errorPlantilla: 'El mensaje no puede quedar vacío.',
    guardarAjustes: 'Guardar ajustes',
    ajustesGuardados: 'Ajustes guardados.',
    ejemploNombreCliente: 'María',
    ejemploServicioCita: 'limpieza dental',

    // Copia de seguridad
    copiaTitulo: 'Copia de seguridad',
    copiaExplicacion: 'Sus citas existen solo en este teléfono. Si se pierde o se borra el navegador, se pierden. Descargue una copia de vez en cuando y guárdela en un lugar seguro (correo, nube, computadora).',
    copiaNunca: 'Todavía no ha descargado ninguna copia.',
    copiaUltima: 'Última copia descargada: {momento}',
    descargarCopia: 'Descargar copia',
    restaurarCopia: 'Restaurar copia',
    copiaDescargada: 'Copia descargada.',
    avisoCopia: 'Hace más de 7 días que no descarga una copia de seguridad. Le tomará un segundo y protege sus citas.',
    ahoraNo: 'Ahora no',
    errorArchivo: 'Ese archivo no es una copia válida de Tucankit Citas. No se cambió nada.',
    confirmarRestaurarTitulo: '¿Reemplazar sus datos con esta copia?',
    confirmarRestaurarTexto: 'La copia es del {momento} y tiene {cantidad} citas.\n\nATENCIÓN: esto BORRA las {actuales} citas y los ajustes que tiene ahora en este teléfono y los reemplaza por los de la copia. No se puede deshacer.',
    siRestaurar: 'Sí, reemplazar',
    copiaRestaurada: 'Copia restaurada.',

    // Borrar todo
    peligroTitulo: 'Borrar todos los datos',
    peligroExplicacion: 'Elimina todas las citas y ajustes de este teléfono. Descargue una copia antes si quiere conservarlos.',
    borrarTodo: 'Borrar todo',
    confirmarBorrarTitulo: '¿Borrar todos los datos?',
    confirmarBorrarTexto: 'Se eliminarán las {cantidad} citas y todos los ajustes de este teléfono.\n\nSi no tiene una copia descargada, no hay forma de recuperarlos.',
    siBorrar: 'Sí, borrar todo',
    todoBorrado: 'Se borraron todos los datos.',

    // Avisos
    avisoActualizacion: 'Hay una versión nueva. Toque para actualizar.',
    avisoNegocio: 'Escriba el nombre de su negocio en Ajustes para que aparezca en los mensajes.',
    irAjustes: 'Ir a Ajustes',
    avisoIphone: 'Para instalar la app en su iPhone: toque el botón Compartir (el cuadrado con la flecha) y luego «Agregar a inicio».',
    entendido: 'Entendido',
    appInstalada: 'App instalada.',
    errorBD: 'No se pudo abrir el almacenamiento del teléfono. Si está en modo incógnito o privado, abra la app en una ventana normal.',
    errorGuardar: 'No se pudo guardar. Intente de nuevo.'
  }
};

/* =========================================================
   2. ATAJOS Y UTILIDADES
   ========================================================= */

/** Busca un elemento de la página por su id. */
const $ = (id) => document.getElementById(id);

/**
 * Devuelve un texto de la interfaz en el idioma actual.
 * Si se le pasan datos, reemplaza las palabras entre { }.
 * Ejemplo: t('seEnviaraA', { numero: '+506 8888 8888' })
 */
function t(clave, datos = {}) {
  const textos = TEXTOS[IDIOMA] || TEXTOS.es;
  const texto = textos[clave] ?? TEXTOS.es[clave] ?? clave;
  if (typeof texto !== 'string') return texto; // listas como "dias" o "meses"
  return texto.replace(/\{(\w+)\}/g, (completo, nombre) => (nombre in datos ? datos[nombre] : completo));
}

/** Pone los textos de TEXTOS en los elementos de la página que tienen data-t. */
function aplicarTextos() {
  document.documentElement.lang = IDIOMA;
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
  document.querySelectorAll('[data-t-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.tPlaceholder); });
}

/** Crea un código único para cada cita. */
function nuevoId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/** Muestra un mensaje corto abajo de la pantalla por unos segundos. */
let temporizadorToast = null;
function avisar(texto) {
  const toast = $('toast');
  toast.textContent = texto;
  toast.hidden = false;
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => { toast.hidden = true; }, 2600);
}

/** Muestra un error grande arriba (por ejemplo, si no se puede guardar). */
function mostrarError(texto) {
  const aviso = $('aviso-error');
  aviso.textContent = texto;
  aviso.hidden = false;
}

/**
 * Ventana de confirmación. Devuelve una promesa que vale true si la
 * persona tocó el botón de confirmar y false si canceló.
 */
function confirmar({ titulo, texto, botonSi, peligroso = true }) {
  return new Promise((resolver) => {
    const dialogo = $('dialogo-confirmar');
    const si = $('confirmar-si');
    const no = $('confirmar-no');
    $('confirmar-titulo').textContent = titulo;
    $('confirmar-texto').textContent = texto;
    si.textContent = botonSi;
    no.textContent = t('cancelar');
    si.classList.toggle('no-peligroso', !peligroso);

    const terminar = (respuesta) => {
      si.onclick = null;
      no.onclick = null;
      dialogo.oncancel = null;
      if (dialogo.open) dialogo.close();
      resolver(respuesta);
    };
    si.onclick = () => terminar(true);
    no.onclick = () => terminar(false);
    dialogo.oncancel = (evento) => { evento.preventDefault(); terminar(false); };
    dialogo.showModal();
    no.focus(); // el foco queda en "Cancelar" para evitar confirmar sin querer
  });
}

/* ---------- Fechas y horas ----------
   IMPORTANTE: las fechas se guardan como texto "AAAA-MM-DD" y las horas
   como "HH:MM". Nunca se usa new Date("AAAA-MM-DD") porque el navegador
   lo interpreta en hora UTC y en Costa Rica (UTC-6) la cita aparecería
   un día antes. Siempre se arma la fecha con año, mes y día locales. */

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const FORMATO_HORA = /^\d{2}:\d{2}$/;

/** Agrega un cero adelante si hace falta: 7 → "07". */
const dosDigitos = (n) => String(n).padStart(2, '0');

/** Convierte una fecha local del teléfono en texto "AAAA-MM-DD". */
function fechaATexto(fecha) {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

/** Convierte "AAAA-MM-DD" en una fecha local (a medianoche del teléfono). */
function textoAFechaLocal(texto) {
  const [anio, mes, dia] = texto.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

/** La fecha de hoy según el reloj del teléfono, como "AAAA-MM-DD". */
const hoyTexto = () => fechaATexto(new Date());

/** Suma (o resta) días a una fecha "AAAA-MM-DD". */
function sumarDias(texto, dias) {
  const fecha = textoAFechaLocal(texto);
  fecha.setDate(fecha.getDate() + dias);
  return fechaATexto(fecha);
}

/** "2026-10-07" → "miércoles 7 de octubre" (agrega el año si no es el actual). */
function fechaAmigable(texto) {
  const fecha = textoAFechaLocal(texto);
  const datos = {
    dia: t('dias')[fecha.getDay()],
    numero: fecha.getDate(),
    mes: t('meses')[fecha.getMonth()],
    anio: fecha.getFullYear()
  };
  const esteAnio = new Date().getFullYear();
  return t(datos.anio === esteAnio ? 'fechaFormato' : 'fechaFormatoConAnio', datos);
}

/** "15:30" → "3:30 p. m." */
function horaAmigable(texto) {
  const [horas, minutos] = texto.split(':').map(Number);
  const sufijo = horas < 12 ? t('am') : t('pm');
  const horas12 = horas % 12 || 12;
  return `${horas12}:${dosDigitos(minutos)} ${sufijo}`;
}

/** Un instante guardado (milisegundos) → "lunes 6 de octubre, 3:30 p. m." */
function momentoAmigable(milisegundos) {
  const d = new Date(milisegundos);
  return t('momentoFormato', {
    fecha: fechaAmigable(fechaATexto(d)),
    hora: horaAmigable(`${dosDigitos(d.getHours())}:${dosDigitos(d.getMinutes())}`)
  });
}

/* ---------- Teléfonos ---------- */

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

  let digitos = limpio.replace(/\D/g, '').replace(/^0/, '');
  if (!digitos) return '';
  const codigo = String(codigoPais || '').replace(/\D/g, '');
  if (digitos.startsWith(codigo) && digitos.length >= codigo.length + 8) return digitos;
  return codigo + digitos;
}

/** Un número internacional válido tiene entre 8 y 15 dígitos. */
const telefonoValido = (digitos) => /^\d{8,15}$/.test(digitos);

/** "50688888888" → "+506 8888 8888" (para mostrarlo bonito en pantalla). */
function formatearTelefono(digitos, codigoPais) {
  const codigo = String(codigoPais || '');
  if (codigo && digitos.startsWith(codigo)) {
    const resto = digitos.slice(codigo.length).replace(/(\d{4})(?=\d)/g, '$1 ');
    return `+${codigo} ${resto}`;
  }
  return `+${digitos}`;
}

/* =========================================================
   3. BASE DE DATOS (IndexedDB, dentro del teléfono)
   Hay dos "cajones":
     - "citas": una ficha por cita, identificada por su id.
     - "ajustes": una sola ficha con clave "principal".
   ========================================================= */
const BD_NOMBRE = 'tucankit-citas';
const BD_VERSION = 1;
let bd = null;

/** Ajustes que tiene la app la primera vez que se abre. */
function ajustesPorDefecto() {
  return {
    negocio: '',
    direccion: '',
    codigoPais: '506',
    plantilla: t('plantillaPorDefecto'),
    ultimaCopia: null,        // cuándo se descargó la última copia de seguridad
    primerUso: null,          // cuándo se abrió la app por primera vez
    ayudaIphoneOculta: false  // si ya cerró la ayuda de instalación en iPhone
  };
}

/** Abre (o crea la primera vez) la base de datos. */
function abrirBD() {
  return new Promise((resolver, rechazar) => {
    if (!('indexedDB' in window)) { rechazar(new Error('Sin IndexedDB')); return; }
    const pedido = indexedDB.open(BD_NOMBRE, BD_VERSION);
    pedido.onupgradeneeded = () => {
      const base = pedido.result;
      if (!base.objectStoreNames.contains('citas')) base.createObjectStore('citas', { keyPath: 'id' });
      if (!base.objectStoreNames.contains('ajustes')) base.createObjectStore('ajustes', { keyPath: 'clave' });
    };
    pedido.onsuccess = () => resolver(pedido.result);
    pedido.onerror = () => rechazar(pedido.error);
  });
}

/** Convierte un pedido a la base de datos en una promesa. */
function esperarPedido(pedido) {
  return new Promise((resolver, rechazar) => {
    pedido.onsuccess = () => resolver(pedido.result);
    pedido.onerror = () => rechazar(pedido.error);
  });
}

/** Espera a que una operación de escritura termine de guardarse. */
function esperarTransaccion(transaccion) {
  return new Promise((resolver, rechazar) => {
    transaccion.oncomplete = () => resolver();
    transaccion.onerror = () => rechazar(transaccion.error);
    transaccion.onabort = () => rechazar(transaccion.error);
  });
}

function leerCitasBD() {
  return esperarPedido(bd.transaction('citas', 'readonly').objectStore('citas').getAll());
}

async function guardarCitaBD(cita) {
  const tx = bd.transaction('citas', 'readwrite');
  tx.objectStore('citas').put(cita);
  await esperarTransaccion(tx);
}

async function borrarCitaBD(id) {
  const tx = bd.transaction('citas', 'readwrite');
  tx.objectStore('citas').delete(id);
  await esperarTransaccion(tx);
}

async function leerAjustesBD() {
  const guardados = await esperarPedido(
    bd.transaction('ajustes', 'readonly').objectStore('ajustes').get('principal')
  );
  const ajustes = { ...ajustesPorDefecto(), ...(guardados || {}) };
  delete ajustes.clave;
  return ajustes;
}

async function guardarAjustesBD(ajustes) {
  const tx = bd.transaction('ajustes', 'readwrite');
  tx.objectStore('ajustes').put({ ...ajustes, clave: 'principal' });
  await esperarTransaccion(tx);
}

/** Borra todo y guarda en su lugar las citas y ajustes indicados (en un solo paso). */
async function reemplazarTodoBD(citas, ajustes) {
  const tx = bd.transaction(['citas', 'ajustes'], 'readwrite');
  const cajonCitas = tx.objectStore('citas');
  const cajonAjustes = tx.objectStore('ajustes');
  cajonCitas.clear();
  cajonAjustes.clear();
  citas.forEach((cita) => cajonCitas.put(cita));
  cajonAjustes.put({ ...ajustes, clave: 'principal' });
  await esperarTransaccion(tx);
}

/* =========================================================
   4. LISTA DE CITAS Y PESTAÑAS
   ========================================================= */

/** Lo que la app tiene en memoria mientras está abierta. */
const estado = {
  citas: [],
  ajustes: ajustesPorDefecto(),
  pestana: 'manana',   // pestaña elegida: manana, hoy, proximas o todas
  editandoId: null     // id de la cita que se está editando (null = cita nueva)
};

/** Ordena por fecha y hora (y por nombre si coinciden). */
function ordenarCitas(citas) {
  return [...citas].sort((a, b) =>
    (a.fecha + ' ' + a.hora).localeCompare(b.fecha + ' ' + b.hora) || a.nombre.localeCompare(b.nombre)
  );
}

/** Devuelve las citas que corresponden a una pestaña, ya ordenadas. */
function citasDePestana(pestana) {
  const hoy = hoyTexto();
  const manana = sumarDias(hoy, 1);
  const filtros = {
    manana: (c) => c.fecha === manana,
    hoy: (c) => c.fecha === hoy,
    proximas: (c) => c.fecha >= hoy, // el texto AAAA-MM-DD se puede comparar directamente
    todas: () => true
  };
  return ordenarCitas(estado.citas.filter(filtros[pestana]));
}

/** Dibuja de nuevo la lista según la pestaña elegida. */
function mostrarCitas() {
  const hoy = hoyTexto();
  const manana = sumarDias(hoy, 1);

  // Pestañas: marcar la elegida y poner la cantidad de citas de cada una
  document.querySelectorAll('.pestana').forEach((boton) => {
    const nombre = boton.dataset.pestana;
    boton.setAttribute('aria-selected', String(nombre === estado.pestana));
    const cantidad = citasDePestana(nombre).length;
    boton.querySelector('.contador').textContent = cantidad ? String(cantidad) : '';
  });

  // Título de la lista
  const titulos = {
    manana: t('tituloManana', { fecha: fechaAmigable(manana) }),
    hoy: t('tituloHoy', { fecha: fechaAmigable(hoy) }),
    proximas: t('tituloProximas'),
    todas: t('tituloTodas')
  };
  $('titulo-lista').textContent = titulos[estado.pestana];

  // Contenido
  const lista = $('lista-citas');
  lista.replaceChildren();
  const citas = citasDePestana(estado.pestana);

  if (!citas.length) {
    const vacio = document.createElement('p');
    vacio.className = 'vacio';
    const mensajes = { manana: 'vacioManana', hoy: 'vacioHoy', proximas: 'vacioProximas', todas: 'vacioTodas' };
    vacio.textContent = t(mensajes[estado.pestana]);
    lista.append(vacio);
    return;
  }

  // En "Próximas" y "Todas" se agrupan las citas por día
  const agrupar = estado.pestana === 'proximas' || estado.pestana === 'todas';
  let diaAnterior = null;
  citas.forEach((cita) => {
    if (agrupar && cita.fecha !== diaAnterior) {
      const titulo = document.createElement('h3');
      titulo.className = 'grupo-fecha';
      if (cita.fecha === hoy) titulo.textContent = t('grupoHoy', { fecha: fechaAmigable(cita.fecha) });
      else if (cita.fecha === manana) titulo.textContent = t('grupoManana', { fecha: fechaAmigable(cita.fecha) });
      else titulo.textContent = fechaAmigable(cita.fecha);
      lista.append(titulo);
      diaAnterior = cita.fecha;
    }
    lista.append(crearTarjeta(cita, { mostrarFecha: false, pasada: cita.fecha < hoy }));
  });
}

/** Arma la tarjeta de una cita a partir del molde que está en index.html. */
function crearTarjeta(cita, { mostrarFecha, pasada }) {
  const tarjeta = $('plantilla-cita').content.firstElementChild.cloneNode(true);
  const parte = (clase) => tarjeta.querySelector('.' + clase);
  tarjeta.dataset.id = cita.id;
  tarjeta.classList.toggle('pasada', pasada);

  parte('cita-hora').textContent = horaAmigable(cita.hora);
  parte('cita-fecha').textContent = mostrarFecha ? fechaAmigable(cita.fecha) : '';
  parte('cita-nombre').textContent = cita.nombre;
  parte('cita-servicio').textContent = cita.servicio;
  parte('cita-servicio').hidden = !cita.servicio;
  parte('cita-telefono').textContent = formatearTelefono(cita.telefono, estado.ajustes.codigoPais);
  parte('cita-nota').textContent = cita.nota;
  parte('cita-nota').hidden = !cita.nota;

  parte('accion-enviar').textContent = t('enviarRecordatorio');
  parte('accion-editar').textContent = t('editar');
  parte('accion-eliminar').textContent = t('eliminar');
  parte('accion-desmarcar').textContent = t('desmarcar');

  return tarjeta;
}

/** Cuando se toca un botón dentro de una tarjeta, se busca qué cita es. */
function alTocarLista(evento) {
  const boton = evento.target.closest('button');
  const tarjeta = evento.target.closest('.cita');
  if (!boton || !tarjeta) return;
  const cita = estado.citas.find((c) => c.id === tarjeta.dataset.id);
  if (!cita) return;

  if (boton.classList.contains('accion-editar')) abrirFormulario(cita);
  else if (boton.classList.contains('accion-eliminar')) eliminarCita(cita);
}

async function eliminarCita(cita) {
  const seguro = await confirmar({
    titulo: t('confirmarEliminarTitulo'),
    texto: t('confirmarEliminarTexto', {
      nombre: cita.nombre, fecha: fechaAmigable(cita.fecha), hora: horaAmigable(cita.hora)
    }),
    botonSi: t('siEliminar')
  });
  if (!seguro) return;
  try {
    await borrarCitaBD(cita.id);
    estado.citas = estado.citas.filter((c) => c.id !== cita.id);
    mostrarCitas();
    avisar(t('citaEliminada'));
  } catch (error) {
    console.error(error);
    mostrarError(t('errorGuardar'));
  }
}

/* =========================================================
   5. FORMULARIO DE CITA (crear y editar)
   ========================================================= */

/** Abre la ventana del formulario. Sin cita = nueva; con cita = editar. */
function abrirFormulario(cita = null) {
  estado.editandoId = cita ? cita.id : null;
  $('dialogo-cita-titulo').textContent = t(cita ? 'tituloEditarCita' : 'tituloNuevaCita');

  // Por defecto, una cita nueva es para mañana (o para hoy si está en la pestaña Hoy)
  const fechaInicial = estado.pestana === 'hoy' ? hoyTexto() : sumarDias(hoyTexto(), 1);

  $('cita-nombre').value = cita ? cita.nombre : '';
  // Al editar, el número guardado ya es internacional: se muestra con "+"
  $('cita-telefono').value = cita ? '+' + cita.telefono : '';
  $('cita-fecha').value = cita ? cita.fecha : fechaInicial;
  $('cita-hora').value = cita ? cita.hora : '';
  $('cita-servicio').value = cita ? cita.servicio : '';
  $('cita-nota').value = cita ? cita.nota : '';

  ['nombre', 'telefono', 'fecha', 'hora'].forEach((campo) => marcarError(campo, ''));
  actualizarNumeroFinal();
  $('dialogo-cita').showModal();
  if (!cita) $('cita-nombre').focus();
}

/** Muestra (o quita) el mensaje de error de un campo del formulario. */
function marcarError(campo, mensaje) {
  const contenedor = $('campo-' + campo);
  const error = contenedor.querySelector('.error');
  contenedor.classList.toggle('invalido', Boolean(mensaje));
  error.textContent = mensaje;
  error.hidden = !mensaje;
}

/** Muestra debajo del teléfono cómo quedará el número final. */
function actualizarNumeroFinal() {
  const digitos = normalizarTelefono($('cita-telefono').value, estado.ajustes.codigoPais);
  $('numero-final').textContent = telefonoValido(digitos)
    ? t('seEnviaraA', { numero: formatearTelefono(digitos, estado.ajustes.codigoPais) })
    : '';
}

async function guardarFormulario(evento) {
  evento.preventDefault();

  const nombre = $('cita-nombre').value.trim();
  const telefono = normalizarTelefono($('cita-telefono').value, estado.ajustes.codigoPais);
  const fecha = $('cita-fecha').value;
  const hora = $('cita-hora').value.slice(0, 5); // algunos navegadores agregan segundos

  // Validar los campos obligatorios
  const errores = {
    nombre: nombre ? '' : t('errorNombre'),
    telefono: telefonoValido(telefono) ? '' : t('errorTelefono'),
    fecha: FORMATO_FECHA.test(fecha) ? '' : t('errorFecha'),
    hora: FORMATO_HORA.test(hora) ? '' : t('errorHora')
  };
  Object.entries(errores).forEach(([campo, mensaje]) => marcarError(campo, mensaje));
  const primerError = Object.keys(errores).find((campo) => errores[campo]);
  if (primerError) { $('cita-' + primerError).focus(); return; }

  const anterior = estado.citas.find((c) => c.id === estado.editandoId);
  const ahora = Date.now();
  const cita = {
    id: anterior ? anterior.id : nuevoId(),
    nombre,
    telefono,
    fecha,
    hora,
    servicio: $('cita-servicio').value.trim(),
    nota: $('cita-nota').value.trim(),
    recordatorioEnviado: anterior ? anterior.recordatorioEnviado : false,
    recordatorioFecha: anterior ? anterior.recordatorioFecha : null,
    creada: anterior ? anterior.creada : ahora,
    modificada: ahora
  };

  // Si se cambió el día o la hora, el recordatorio enviado ya no vale
  if (anterior && (anterior.fecha !== fecha || anterior.hora !== hora)) {
    cita.recordatorioEnviado = false;
    cita.recordatorioFecha = null;
  }

  try {
    await guardarCitaBD(cita);
    estado.citas = estado.citas.filter((c) => c.id !== cita.id).concat(cita);
    $('dialogo-cita').close();
    mostrarCitas();
    avisar(t('citaGuardada'));
  } catch (error) {
    console.error(error);
    mostrarError(t('errorGuardar'));
  }
}

/* =========================================================
   10. INICIO DE LA APP
   ========================================================= */

/** Conecta cada botón con lo que debe hacer. */
function conectarEventos() {
  document.querySelectorAll('.pestana').forEach((boton) => {
    boton.addEventListener('click', () => {
      estado.pestana = boton.dataset.pestana;
      mostrarCitas();
    });
  });
  $('lista-citas').addEventListener('click', alTocarLista);
  $('btn-nueva').addEventListener('click', () => abrirFormulario());
  $('form-cita').addEventListener('submit', guardarFormulario);
  $('cita-cancelar').addEventListener('click', () => $('dialogo-cita').close());
  $('cita-telefono').addEventListener('input', actualizarNumeroFinal);

  // Si la app queda abierta y pasa la medianoche, "hoy" y "mañana" cambian
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') mostrarCitas();
  });
}

async function iniciar() {
  aplicarTextos();
  conectarEventos();

  try {
    bd = await abrirBD();
    estado.ajustes = await leerAjustesBD();
    if (!estado.ajustes.primerUso) {
      estado.ajustes.primerUso = Date.now();
      await guardarAjustesBD(estado.ajustes);
    }
    estado.citas = await leerCitasBD();
  } catch (error) {
    console.error(error);
    mostrarError(t('errorBD'));
    return;
  }
  mostrarCitas();
}

iniciar();
