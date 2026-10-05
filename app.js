/* =========================================================
   Tucankit Citas — lógica de la app
   JavaScript puro, sin librerías. Todo se guarda en el teléfono.

   Índice de secciones:
     1. Textos de la interfaz
     2. Atajos y utilidades
     9. Inicio de la app
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
    confirmarEliminarTexto: 'Se eliminará la cita de {nombre} del {fecha} a las {hora}.\nEsto no se puede deshacer.',
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
    copiaUltima: 'Última copia descargada: {momento}.',
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

/* =========================================================
   9. INICIO DE LA APP
   ========================================================= */
function iniciar() {
  aplicarTextos();
}

iniciar();
