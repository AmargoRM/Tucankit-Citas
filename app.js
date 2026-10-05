/* =========================================================
   Tucankit Citas — lógica de la app
   JavaScript puro, sin librerías. Todo se guarda en el teléfono.

   Índice de secciones:
     1. Textos de la interfaz
     2. Atajos y utilidades
     (Fechas, teléfonos y plantillas están en core.js)
     3. Base de datos (IndexedDB)
     4. Lista de citas y pestañas
     5. Formulario de cita
     6. Recordatorio por WhatsApp
     7. Ajustes y plantilla del mensaje
     8. Copia de seguridad, restaurar y borrar todo
    10. Inicio de la app
   ========================================================= */
'use strict';

/* =========================================================
   1. TEXTOS DE LA INTERFAZ
   Todos los textos visibles están aquí.
   Para agregar otro idioma (por ejemplo portugués):
     - copiar el bloque "es" completo y llamarlo "pt",
     - hacer lo mismo con los datos de idioma de core.js (fechas y plantilla),
     - traducir los textos (sin tocar lo que está entre { }),
     - cambiar IDIOMA a 'pt'.
   Lo que está entre { } se reemplaza por datos reales.
   ========================================================= */
const IDIOMA = 'es';

/* Funciones de fechas, teléfonos y plantillas: vienen de core.js
   (que se carga antes que este archivo en index.html). */
const {
  VARIABLES, armarMensaje, plantillaPorDefecto,
  FORMATO_FECHA, FORMATO_HORA, hoyTexto, mananaTexto, sumarDias,
  fechaAmigable, horaAmigable, momentoAmigable,
  normalizarTelefono, telefonoValido, formatearTelefono, enlaceWhatsApp
} = TucankitCore;
TucankitCore.usarIdioma(IDIOMA);

const TEXTOS = {
  es: {
    // (Los nombres de días y meses y la plantilla por defecto están en core.js)

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
function confirmar({ titulo, texto, botonSi, peligroso = true, soloAviso = false }) {
  return new Promise((resolver) => {
    const dialogo = $('dialogo-confirmar');
    const si = $('confirmar-si');
    const no = $('confirmar-no');
    $('confirmar-titulo').textContent = titulo;
    $('confirmar-texto').textContent = texto;
    si.textContent = botonSi;
    no.textContent = t('cancelar');
    si.classList.toggle('no-peligroso', !peligroso);
    no.hidden = soloAviso; // un aviso informativo solo tiene un botón

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
    (soloAviso ? si : no).focus(); // el foco queda en "Cancelar" para evitar confirmar sin querer
  });
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
    plantilla: plantillaPorDefecto(),
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

  // Si ya se envió el recordatorio, la tarjeta se ve distinta (borde verde y ✓)
  if (cita.recordatorioEnviado) {
    tarjeta.classList.add('enviada');
    parte('cita-enviado').hidden = false;
    parte('cita-enviado-texto').textContent = t('recordatorioEnviado', {
      momento: momentoAmigable(cita.recordatorioFecha)
    });
    const enviar = parte('accion-enviar');
    enviar.textContent = t('reenviarRecordatorio');
    enviar.classList.replace('boton-accion', 'boton-secundario');
  }

  return tarjeta;
}

/** Cuando se toca un botón dentro de una tarjeta, se busca qué cita es. */
function alTocarLista(evento) {
  const boton = evento.target.closest('button');
  const tarjeta = evento.target.closest('.cita');
  if (!boton || !tarjeta) return;
  const cita = estado.citas.find((c) => c.id === tarjeta.dataset.id);
  if (!cita) return;

  if (boton.classList.contains('accion-enviar')) enviarRecordatorio(cita);
  else if (boton.classList.contains('accion-desmarcar')) marcarRecordatorio(cita, false);
  else if (boton.classList.contains('accion-editar')) abrirFormulario(cita);
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
  const fechaInicial = estado.pestana === 'hoy' ? hoyTexto() : mananaTexto();

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
   6. RECORDATORIO POR WHATSAPP
   (armarMensaje y enlaceWhatsApp están en core.js)
   La app NO envía mensajes sola. Abre WhatsApp con el mensaje
   ya escrito (enlace oficial wa.me) y la persona toca "enviar".
   ========================================================= */

/** Los datos de una cita listos para poner en el mensaje. */
function datosParaMensaje(cita) {
  return {
    nombre: cita.nombre,
    servicio: cita.servicio || t('servicioGenerico'),
    fecha: fechaAmigable(cita.fecha),
    hora: horaAmigable(cita.hora),
    negocio: estado.ajustes.negocio || t('negocioGenerico'),
    direccion: estado.ajustes.direccion || ''
  };
}

function enviarRecordatorio(cita) {
  const mensaje = armarMensaje(estado.ajustes.plantilla, datosParaMensaje(cita));
  // Se abre primero (antes de cualquier espera) para que el navegador no lo bloquee
  window.open(enlaceWhatsApp(cita.telefono, mensaje), '_blank', 'noopener');
  marcarRecordatorio(cita, true);
}

/** Marca (true) o desmarca (false) el recordatorio de una cita y lo guarda. */
async function marcarRecordatorio(cita, enviado) {
  const actualizada = {
    ...cita,
    recordatorioEnviado: enviado,
    recordatorioFecha: enviado ? Date.now() : null,
    modificada: Date.now()
  };
  try {
    await guardarCitaBD(actualizada);
    estado.citas = estado.citas.map((c) => (c.id === cita.id ? actualizada : c));
    mostrarCitas();
    avisar(t(enviado ? 'recordatorioMarcado' : 'recordatorioDesmarcado'));
  } catch (error) {
    console.error(error);
    mostrarError(t('errorGuardar'));
  }
}

/* =========================================================
   7. AJUSTES Y PLANTILLA DEL MENSAJE
   ========================================================= */

/** Cambia entre la lista de citas y la pantalla de Ajustes. */
function mostrarVista(vista) {
  const enAjustes = vista === 'ajustes';
  $('vista-citas').hidden = enAjustes;
  $('vista-ajustes').hidden = !enAjustes;
  $('btn-nueva').hidden = enAjustes;
  $('btn-ajustes').hidden = enAjustes;
  if (enAjustes) cargarFormularioAjustes();
  else mostrarCitas();
  window.scrollTo(0, 0);
}

/** Pone los ajustes guardados en los campos de la pantalla de Ajustes. */
function cargarFormularioAjustes() {
  const a = estado.ajustes;
  $('aj-negocio').value = a.negocio;
  $('aj-direccion').value = a.direccion;
  $('aj-codigo').value = a.codigoPais;
  $('aj-plantilla').value = a.plantilla;
  ['codigo', 'plantilla'].forEach((campo) => marcarError(campo, ''));
  actualizarVistaPrevia();
  mostrarUltimaCopia();
}

/** Muestra cómo quedaría el mensaje con datos de ejemplo. */
function actualizarVistaPrevia() {
  const datosEjemplo = {
    nombre: t('ejemploNombreCliente'),
    servicio: t('ejemploServicioCita'),
    fecha: fechaAmigable(mananaTexto()),
    hora: horaAmigable('15:30'),
    negocio: $('aj-negocio').value.trim() || t('negocioGenerico'),
    direccion: $('aj-direccion').value.trim()
  };
  $('vista-previa-texto').textContent = armarMensaje($('aj-plantilla').value, datosEjemplo);
}

/** Inserta una palabra como {nombre} donde está el cursor en la plantilla. */
function insertarVariable(nombre) {
  const campo = $('aj-plantilla');
  const texto = `{${nombre}}`;
  const inicio = campo.selectionStart ?? campo.value.length;
  const fin = campo.selectionEnd ?? campo.value.length;
  campo.setRangeText(texto, inicio, fin, 'end');
  campo.focus();
  actualizarVistaPrevia();
}

/** Crea los botones de las palabras {nombre}, {fecha}, etc. */
function crearBotonesVariables() {
  const contenedor = $('variables');
  VARIABLES.forEach((nombre) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'variable';
    boton.textContent = `{${nombre}}`;
    boton.addEventListener('click', () => insertarVariable(nombre));
    contenedor.append(boton);
  });
}

async function guardarAjustes(evento) {
  evento.preventDefault();
  const codigo = $('aj-codigo').value.trim();
  const plantilla = $('aj-plantilla').value.trim();

  const errorCodigo = /^\d{1,4}$/.test(codigo) ? '' : t('errorCodigoPais');
  const errorPlantilla = plantilla ? '' : t('errorPlantilla');
  marcarError('codigo', errorCodigo);
  marcarError('plantilla', errorPlantilla);
  if (errorCodigo) { $('aj-codigo').focus(); return; }
  if (errorPlantilla) { $('aj-plantilla').focus(); return; }

  const nuevos = {
    ...estado.ajustes,
    negocio: $('aj-negocio').value.trim(),
    direccion: $('aj-direccion').value.trim(),
    codigoPais: codigo,
    plantilla
  };
  try {
    await guardarAjustesBD(nuevos);
    estado.ajustes = nuevos;
    revisarAvisos();
    avisar(t('ajustesGuardados'));
  } catch (error) {
    console.error(error);
    mostrarError(t('errorGuardar'));
  }
}

/* =========================================================
   8. COPIA DE SEGURIDAD, RESTAURAR Y BORRAR TODO
   La copia es un archivo .json con todas las citas y los ajustes.
   ========================================================= */
const COPIA_APP = 'tucankit-citas';
const COPIA_VERSION = 1;
const DIAS_AVISO_COPIA = 7;
let avisoCopiaCerrado = false; // "Ahora no" lo oculta hasta que se vuelva a abrir la app

/** Muestra cuándo se descargó la última copia. */
function mostrarUltimaCopia() {
  const ultima = estado.ajustes.ultimaCopia;
  $('copia-ultima').textContent = ultima
    ? t('copiaUltima', { momento: momentoAmigable(ultima) })
    : t('copiaNunca');
}

/** Genera y descarga el archivo de copia. */
async function descargarCopia() {
  const copia = {
    app: COPIA_APP,
    version: COPIA_VERSION,
    creada: Date.now(),
    citas: ordenarCitas(estado.citas),
    ajustes: estado.ajustes
  };
  const archivo = new Blob([JSON.stringify(copia, null, 2)], { type: 'application/json' });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(archivo);
  enlace.download = `tucankit-citas-copia-${hoyTexto()}.json`;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 10000);

  // Recordar cuándo se hizo, para el aviso de los 7 días
  estado.ajustes = { ...estado.ajustes, ultimaCopia: Date.now() };
  try { await guardarAjustesBD(estado.ajustes); } catch (error) { console.error(error); }
  mostrarUltimaCopia();
  revisarAvisos();
  avisar(t('copiaDescargada'));
}

/** Devuelve el texto si es un texto; si no, el valor por defecto. */
const textoO = (valor, porDefecto = '') => (typeof valor === 'string' ? valor : porDefecto);
/** Devuelve el número si es un número válido; si no, null. */
const numeroO = (valor) => (typeof valor === 'number' && Number.isFinite(valor) ? valor : null);

/**
 * Revisa que un archivo de copia tenga el formato correcto.
 * Devuelve { citas, ajustes, creada } limpios, o lanza un error si algo está mal.
 * Solo se copian los campos conocidos: lo demás se ignora.
 */
function validarCopia(datos) {
  if (!datos || typeof datos !== 'object') throw new Error('No es un objeto');
  if (datos.app !== COPIA_APP) throw new Error('No es una copia de Tucankit Citas');
  if (!Number.isInteger(datos.version) || datos.version < 1 || datos.version > COPIA_VERSION) {
    throw new Error('Versión de copia desconocida');
  }
  if (!Array.isArray(datos.citas)) throw new Error('Faltan las citas');

  const citas = datos.citas.map((c, posicion) => {
    const valida = c && typeof c === 'object'
      && typeof c.id === 'string' && c.id
      && typeof c.nombre === 'string' && c.nombre.trim()
      && typeof c.telefono === 'string' && telefonoValido(c.telefono)
      && typeof c.fecha === 'string' && FORMATO_FECHA.test(c.fecha)
      && typeof c.hora === 'string' && FORMATO_HORA.test(c.hora);
    if (!valida) throw new Error(`Cita ${posicion + 1} con datos incompletos`);
    return {
      id: c.id,
      nombre: c.nombre.trim(),
      telefono: c.telefono,
      fecha: c.fecha,
      hora: c.hora,
      servicio: textoO(c.servicio),
      nota: textoO(c.nota),
      recordatorioEnviado: c.recordatorioEnviado === true,
      recordatorioFecha: c.recordatorioEnviado === true ? numeroO(c.recordatorioFecha) || Date.now() : null,
      creada: numeroO(c.creada) || Date.now(),
      modificada: numeroO(c.modificada) || Date.now()
    };
  });

  const a = datos.ajustes && typeof datos.ajustes === 'object' ? datos.ajustes : {};
  const base = ajustesPorDefecto();
  const ajustes = {
    ...base,
    negocio: textoO(a.negocio),
    direccion: textoO(a.direccion),
    codigoPais: /^\d{1,4}$/.test(textoO(a.codigoPais)) ? a.codigoPais : base.codigoPais,
    plantilla: textoO(a.plantilla).trim() || base.plantilla,
    primerUso: numeroO(a.primerUso) || Date.now(),
    ayudaIphoneOculta: a.ayudaIphoneOculta === true,
    ultimaCopia: Date.now() // quien restaura, tiene la copia en la mano
  };

  return { citas, ajustes, creada: numeroO(datos.creada) };
}

/** Se ejecuta cuando la persona elige un archivo para restaurar. */
async function restaurarCopia(evento) {
  const entrada = evento.target;
  const archivo = entrada.files && entrada.files[0];
  entrada.value = ''; // permite elegir el mismo archivo otra vez
  if (!archivo) return;

  let copia;
  try {
    copia = validarCopia(JSON.parse(await archivo.text()));
  } catch (error) {
    console.warn('Copia rechazada:', error.message);
    await confirmar({ titulo: t('restaurarCopia'), texto: t('errorArchivo'), botonSi: t('entendido'), peligroso: false, soloAviso: true });
    return;
  }

  const seguro = await confirmar({
    titulo: t('confirmarRestaurarTitulo'),
    texto: t('confirmarRestaurarTexto', {
      momento: copia.creada ? momentoAmigable(copia.creada) : '?',
      cantidad: copia.citas.length,
      actuales: estado.citas.length
    }),
    botonSi: t('siRestaurar')
  });
  if (!seguro) return;

  try {
    await reemplazarTodoBD(copia.citas, copia.ajustes);
    estado.citas = copia.citas;
    estado.ajustes = copia.ajustes;
    cargarFormularioAjustes();
    revisarAvisos();
    avisar(t('copiaRestaurada'));
  } catch (error) {
    console.error(error);
    mostrarError(t('errorGuardar'));
  }
}

/** Borra todas las citas y ajustes (pide confirmación antes). */
async function borrarTodo() {
  const seguro = await confirmar({
    titulo: t('confirmarBorrarTitulo'),
    texto: t('confirmarBorrarTexto', { cantidad: estado.citas.length }),
    botonSi: t('siBorrar')
  });
  if (!seguro) return;
  try {
    const nuevos = { ...ajustesPorDefecto(), primerUso: Date.now() };
    await reemplazarTodoBD([], nuevos);
    estado.citas = [];
    estado.ajustes = nuevos;
    cargarFormularioAjustes();
    revisarAvisos();
    avisar(t('todoBorrado'));
  } catch (error) {
    console.error(error);
    mostrarError(t('errorGuardar'));
  }
}

/** Muestra u oculta los avisos de arriba según la situación. */
function revisarAvisos() {
  const a = estado.ajustes;
  $('aviso-negocio').hidden = Boolean(a.negocio);

  // Aviso de copia: si hay citas y pasaron más de 7 días desde la última copia
  // (o desde el primer uso, si nunca se descargó una)
  const referencia = a.ultimaCopia || a.primerUso;
  const dias = referencia ? (Date.now() - referencia) / 86400000 : 0;
  $('aviso-copia').hidden = avisoCopiaCerrado || !estado.citas.length || dias <= DIAS_AVISO_COPIA;
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

  // Ajustes
  crearBotonesVariables();
  $('btn-ajustes').addEventListener('click', () => mostrarVista('ajustes'));
  $('btn-volver').addEventListener('click', () => mostrarVista('citas'));
  $('aviso-negocio-ir').addEventListener('click', () => mostrarVista('ajustes'));
  $('form-ajustes').addEventListener('submit', guardarAjustes);
  ['aj-negocio', 'aj-direccion', 'aj-plantilla'].forEach((id) => $(id).addEventListener('input', actualizarVistaPrevia));
  // Copia de seguridad y borrar todo
  $('btn-descargar').addEventListener('click', descargarCopia);
  $('aviso-copia-descargar').addEventListener('click', descargarCopia);
  $('aviso-copia-cerrar').addEventListener('click', () => { avisoCopiaCerrado = true; revisarAvisos(); });
  $('btn-restaurar').addEventListener('click', () => $('archivo-restaurar').click());
  $('archivo-restaurar').addEventListener('change', restaurarCopia);
  $('btn-borrar-todo').addEventListener('click', borrarTodo);

  $('btn-plantilla-defecto').addEventListener('click', () => {
    $('aj-plantilla').value = plantillaPorDefecto();
    actualizarVistaPrevia();
  });

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
  revisarAvisos();
}

iniciar();
