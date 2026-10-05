/* =========================================================
   Tucankit Citas — lógica de la app
   JavaScript puro, sin librerías. Todo se guarda en el dispositivo.

   Índice de secciones:
     1. Textos de la interfaz
     2. Atajos y utilidades
     3. Base de datos (IndexedDB) y reorganización de datos viejos
     4. Guardar cambios (sellados para la sincronización)
     5. Agenda: lista de recordatorios y pestañas
     6. Formulario de recordatorio
     7. Clientes, ficha e historial
    7b. Servicios y productos
     8. Envío a WhatsApp y estados de respuesta
     9. Envío en fila a un grupo
    10. Ajustes, plantillas y constructor con clics
    11. Copias de seguridad, copias automáticas y borrar todo
   11b. Pasar datos por código QR
   11c. Sincronización con Google Drive
    12. Instalación, uso sin internet y almacenamiento
    13. Inicio de la app
   (Fechas, teléfonos, plantillas, montos y la mezcla segura están en core.js)
   ========================================================= */
'use strict';

/* =========================================================
   1. TEXTOS DE LA INTERFAZ
   Todos los textos visibles están aquí.
   Para agregar otro idioma (por ejemplo portugués):
     - copiar el bloque "es" completo y llamarlo "pt",
     - hacer lo mismo con los datos de idioma de core.js,
     - traducir los textos (sin tocar lo que está entre { }),
     - cambiar IDIOMA a 'pt'.
   ========================================================= */
const IDIOMA = 'es';

const {
  TIPOS, VARIABLES_COMUNES, variablesDeTipo, armarMensaje, plantillaPorDefecto,
  opcionesPorDefecto, construirPlantilla, textoEnlacesRespuesta, leerMonto, formatearMonto,
  FORMATO_FECHA, FORMATO_HORA, hoyTexto, mananaTexto, sumarDias, fechaATexto,
  fechaAmigable, horaAmigable, momentoAmigable,
  normalizarTelefono, telefonoValido, formatearTelefono, enlaceWhatsApp,
  sellar, marcarBorrado, estaActivo, mezclarDatos
} = TucankitCore;
TucankitCore.usarIdioma(IDIOMA);

const TEXTOS = {
  es: {
    // Encabezado, pie y navegación
    nombreProducto: 'Citas',
    instalar: 'Instalar app',
    ajustes: 'Ajustes',
    privacidad: 'Política de privacidad',
    navAgenda: 'Agenda',
    navClientes: 'Clientes',
    navGrupos: 'Grupos',

    // Tipos de recordatorio
    tipo_cita: 'Cita',
    tipo_entrega: 'Entrega',
    tipo_cobro: 'Cobro',
    tipo_seguimiento: 'Seguimiento',
    tipo_llego: 'Ya llegó',
    filtroTodos: 'Todos',

    // Agenda
    pestanaManana: 'Mañana',
    pestanaHoy: 'Hoy',
    pestanaProximas: 'Próximas',
    pestanaTodas: 'Todas',
    tituloManana: 'Mañana · {fecha}',
    tituloHoy: 'Hoy · {fecha}',
    tituloProximas: 'Próximos recordatorios',
    tituloTodas: 'Todos los recordatorios',
    grupoHoy: 'Hoy · {fecha}',
    grupoManana: 'Mañana · {fecha}',
    vacioManana: 'No hay recordatorios para mañana.',
    vacioHoy: 'No hay recordatorios para hoy.',
    vacioProximas: 'No hay recordatorios próximos.',
    vacioTodas: 'Todavía no hay recordatorios. Toque «+ Nuevo» para crear el primero.',
    nuevoRecordatorio: '+ Nuevo',
    nuevoCliente: '+ Nuevo cliente',

    // Tarjeta de recordatorio
    enviarRecordatorio: 'Enviar recordatorio',
    reenviarRecordatorio: 'Volver a enviar',
    recordatorioEnviado: '✓ Enviado: {momento}',
    desmarcar: 'Desmarcar',
    editar: 'Editar',
    eliminar: 'Eliminar',
    sinHora: 'Sin hora',
    respuestaTitulo: 'Respuesta:',
    resp_confirmo: 'Confirmó',
    resp_cancelo: 'Canceló',
    resp_pago: 'Pagó',
    resp_respondio: 'Respondió',

    // Formulario de recordatorio
    tituloNuevoRecordatorio: 'Nuevo recordatorio',
    tituloEditarRecordatorio: 'Editar recordatorio',
    campoTipo: 'Tipo',
    campoCliente: 'Cliente',
    cambiar: 'Cambiar',
    buscarOCrearCliente: 'Escriba el nombre o teléfono',
    crearClienteCon: '+ Crear cliente «{texto}»',
    crearClienteNuevo: '+ Cliente nuevo',
    clienteNuevoTitulo: 'Cliente nuevo',
    campoNombre: 'Nombre',
    campoTelefono: 'Teléfono (WhatsApp)',
    campoFecha: 'Fecha',
    horaObligatoria: 'Hora',
    horaOpcional: 'Hora (opcional)',
    campoMonto: 'Monto ({moneda})',
    campoPago: 'Forma de pago',
    ejemploMonto: 'Ej.: 15.000',
    ejemploPagoCorto: 'Ej.: transferencia',
    detalle_cita: 'Servicio',
    detalle_entrega: 'Qué se entrega',
    detalle_cobro: 'Concepto (opcional)',
    detalle_seguimiento: 'Sobre qué (opcional)',
    detalle_llego: 'Qué llegó',
    ejemploDetalle_cita: 'Ej.: limpieza dental',
    ejemploDetalle_entrega: 'Ej.: 2 blusas talla M',
    ejemploDetalle_cobro: 'Ej.: vestido azul',
    ejemploDetalle_seguimiento: 'Ej.: el vestido',
    ejemploDetalle_llego: 'Ej.: zapatos talla 38',
    campoNota: 'Nota (opcional)',
    ejemploNombre: 'Ej.: María Rodríguez',
    ejemploTelefono: 'Número de WhatsApp',
    ejemploNota: 'Algo que quiera recordar',
    seEnviaraA: 'Se enviará a {numero}',
    errorNombre: 'Escriba el nombre.',
    errorTelefono: 'Escriba un teléfono válido.',
    errorFecha: 'Elija la fecha.',
    errorHora: 'Elija la hora.',
    errorMonto: 'Escriba el monto.',
    errorCliente: 'Elija un cliente o cree uno nuevo.',
    errorTelefonoRepetido: 'Ese teléfono ya es de {nombre}. Elíjalo de la lista.',
    guardar: 'Guardar',
    cancelar: 'Cancelar',
    guardado: 'Guardado.',
    eliminado: 'Eliminado.',
    confirmarEliminarTitulo: '¿Eliminar este recordatorio?',
    confirmarEliminarTexto: '{tipo} de {nombre} ({fecha}).\nEsto no se puede deshacer.',
    siEliminar: 'Sí, eliminar',

    // Datos que se usan en el mensaje si están vacíos
    servicioGenerico: 'atención',
    negocioGenerico: 'nuestro negocio',
    pagoGenerico: 'el medio de pago acordado',
    recordatorioMarcado: 'Marcado como enviado.',
    recordatorioDesmarcado: 'Desmarcado.',

    // Clientes
    buscarCliente: 'Buscar por nombre, teléfono o etiqueta',
    etiquetasTodas: 'Todas',
    tituloClientes: '{cantidad} clientes',
    tituloClientesUno: '1 cliente',
    vacioClientes: 'Todavía no hay clientes. Toque «+ Nuevo cliente».',
    vacioBusqueda: 'No se encontró ningún cliente.',
    pendientesCliente: '{cantidad} próximos',
    nuevoRecordatorioCliente: '+ Recordatorio',
    abrirChat: 'Abrir chat',
    historial: 'Historial',
    historialVacio: 'Este cliente todavía no tiene recordatorios.',
    confirmarEliminarClienteTitulo: '¿Eliminar a {nombre}?',
    confirmarEliminarClienteTexto: 'Se eliminará el cliente y sus {cantidad} recordatorios.\nEsto no se puede deshacer.',
    tituloNuevoCliente: 'Nuevo cliente',
    tituloEditarCliente: 'Editar cliente',
    campoEtiquetas: 'Etiquetas',
    ejemploEtiqueta: 'Ej.: VIP',
    agregar: 'Agregar',
    campoNotaCliente: 'Nota del cliente',
    ejemploNotaCliente: 'Talla, preferencias, alergias…',

    // Grupos (envío en fila)
    grupoTitulo: 'Mensaje a un grupo',
    grupoExplicacion: 'WhatsApp no permite enviar a muchas personas a la vez sin pagar. La app le prepara cada mensaje y usted toca «enviar» en cada uno.',
    grupoPaso1: '1. ¿A quiénes?',
    grupoPaso2: '2. Mensaje',
    grupoPaso3: '3. Enviar uno por uno',
    grupoTodos: 'Todos los clientes',
    vistaPreviaPrimero: 'Vista previa (con el primer cliente)',
    grupoMensajeInicial: 'Hola {nombre}, ',
    grupoElegir: 'Elija a quiénes enviar.',
    grupoProgreso: 'Enviados: {enviados} de {total}',
    grupoEnviarA: 'Enviar a {nombre} ({numero} de {total})',
    grupoListo: '¡Listo! Se envió a los {total}.',
    grupoReiniciar: 'Empezar de nuevo',
    grupoVacio: 'No hay clientes en este grupo.',
    grupoEnviado: '✓ Enviado',
    grupoEnviar: 'Enviar',
    grupoErrorMensaje: 'Escriba el mensaje.',

    // Ajustes
    volver: '← Volver',
    ajustesTitulo: 'Ajustes',
    ajustesNegocio: 'Su negocio',
    campoNegocio: 'Nombre del negocio',
    campoAtiende: 'Quién atiende',
    ejemploNegocio: 'Ej.: Tienda Bella',
    ejemploAtiende: 'Ej.: Laura',
    ayudaAtiende: 'Se usa en los mensajes con {atiende}.',
    campoDireccion: 'Dirección',
    ejemploDireccion: 'Ej.: Calle 5, frente al parque central',
    campoCodigoPais: 'Código de país',
    campoMoneda: 'Moneda',
    ayudaCodigoPais: 'Se agrega a los teléfonos que no lo tengan.',
    campoPais: 'País',
    ayudaPais: 'Define el código telefónico, la moneda y cómo se escriben los montos. Cada uno se puede cambiar.',
    paisOtro: '🌐 Otro país (escribir el código)',
    errorCodigoPais: 'Solo números, de 1 a 4.',
    campoPagoHabitual: 'Forma de pago habitual',
    ejemploPago: 'Ej.: transferencia a la cuenta 123-456, efectivo',
    ajustesWhatsapp: 'WhatsApp',
    campoWhatsappComputadora: 'En computadora, abrir',
    opcionWhatsappWeb: 'WhatsApp Web (siempre en la misma pestaña)',
    opcionWhatsappApp: 'App de WhatsApp de escritorio',
    campoEnlacesRespuesta: 'Agregar enlaces para que el cliente responda con un toque',
    ayudaEnlacesRespuesta: 'Al final del mensaje aparecen enlaces como «✅ Confirmar». Al tocarlos, al cliente se le abre WhatsApp con la respuesta ya escrita hacia su número; solo toca enviar.',
    campoTelefonoNegocio: 'Su número de WhatsApp (para recibir respuestas)',
    errorTelefonoNegocio: 'Escriba su número para poder usar los enlaces de respuesta.',
    ajustesFirma: 'Firma',
    campoFirmaActiva: 'Agregar la firma al final de los mensajes',
    campoFirma: 'Texto de la firma',
    ejemploFirma: 'Ej.: — {atiende}, {negocio}',
    ayudaFirma: 'Puede usar {atiende} y {negocio}.',
    ajustesMensaje: 'Mensajes',
    ayudaPlantillas: 'Cada tipo de recordatorio tiene su propio mensaje. Elija el tipo:',
    constructorTitulo: 'Armar con clics (reemplaza el texto de abajo)',
    constructorSaludo: 'Saludo',
    constructorCierre: 'Despedida',
    sinCierre: '(sin despedida)',
    tratoTu: 'Tú',
    tratoUsted: 'Usted',
    constructorConfirmar: 'Pedir que responda SÍ para confirmar',
    constructorDireccion: 'Incluir la dirección',
    campoPlantilla: 'Mensaje',
    plantillaEditadaAMano: '✎ Editado a mano',
    ayudaVariables: 'Toque una palabra para agregarla. Se reemplaza por el dato real:',
    restaurarPlantilla: 'Volver al mensaje original',
    vistaPrevia: 'Vista previa (con datos de ejemplo)',
    errorPlantilla: 'El mensaje no puede quedar vacío.',
    guardarAjustes: 'Guardar ajustes',
    ajustesGuardados: 'Ajustes guardados.',
    ajustesSinCambios: 'Todo guardado',
    ajustesConCambios: 'Hay cambios sin guardar',
    salirSinGuardarTitulo: '¿Guardar los cambios?',
    salirSinGuardarTexto: 'Hizo cambios en Ajustes que todavía no guardó. Si sale sin guardar, se pierden.',
    guardarYSalir: 'Guardar',
    salirSinGuardar: 'Salir sin guardar',
    ejemploNombreCliente: 'María',
    ejemploServicio: 'limpieza dental',
    ejemploDetalle: 'vestido azul',
    ajustesDispositivo: 'Este dispositivo',
    campoNombreDispositivo: 'Nombre de este dispositivo',
    ejemploNombreDispositivo: 'Ej.: Celular de Ana',
    ayudaNombreDispositivo: 'Sirve para saber desde dónde se hizo cada cambio al sincronizar.',

    // Copia de seguridad
    copiaTitulo: 'Copia de seguridad',
    copiaExplicacion: 'Sus datos existen solo en este dispositivo (y en su Google Drive si activa la sincronización). Descargue una copia de vez en cuando y guárdela en un lugar seguro.',
    copiaNunca: 'Todavía no ha descargado ninguna copia.',
    copiaUltima: 'Última copia descargada: {momento}',
    descargarCopia: 'Descargar copia',
    restaurarCopia: 'Restaurar copia',
    copiaDescargada: 'Copia descargada.',
    avisoCopia: 'Hace más de 7 días que no descarga una copia de seguridad. Le tomará un segundo y protege sus datos.',
    ahoraNo: 'Ahora no',
    errorArchivo: 'Ese archivo no es una copia válida de Tucankit Citas. No se cambió nada.',
    confirmarRestaurarTitulo: '¿Cómo quiere usar esta copia?',
    confirmarRestaurarTexto: 'La copia es del {momento} y tiene {clientes} clientes y {recordatorios} recordatorios.\n\n«Mezclar» suma la copia a sus datos sin perder lo más nuevo (recomendado).\n«Reemplazar todo» deja todo como en la copia y BORRA lo que no esté en ella (también en sus otros dispositivos si sincroniza).\n\nEn ambos casos, antes se guarda una copia automática.',
    mezclarCopia: 'Mezclar (recomendado)',
    reemplazarTodo: 'Reemplazar todo',
    copiaRestaurada: 'Copia aplicada. {resumen}',
    resumenCambios: 'Se agregaron {agregados}, se actualizaron {actualizados}, se borraron {borrados}.',

    // Copias automáticas
    copiasAutoTitulo: 'Copias automáticas',
    copiasAutoExplicacion: 'Antes de cada sincronización, restauración o borrado, la app guarda sola una copia de sus datos. Se conservan las últimas 5.',
    copiasAutoVacio: 'Todavía no hay copias automáticas.',
    copiaAutoFila: '{momento} · {motivo} · {cantidad} recordatorios',
    volverACopia: 'Volver a esta',
    volverAnteriorSync: 'Volver a la copia anterior a la última sincronización',
    motivo_migracion: 'antes de actualizar la app',
    motivo_sincronizacion: 'antes de sincronizar',
    motivo_restaurar: 'antes de restaurar una copia',
    motivo_borrar: 'antes de borrar todo',
    motivo_volver: 'antes de volver a una copia',
    motivo_qr: 'antes de recibir por QR',
    confirmarVolverTitulo: '¿Volver a esta copia?',
    confirmarVolverTexto: 'Sus datos quedarán como estaban el {momento}.\n\nIMPORTANTE: si usa sincronización, esto también se aplicará en sus otros dispositivos: lo que se hizo después de esa copia se deshará en todos.\n\nAntes de cambiar, se guarda una copia de lo actual.',
    siVolver: 'Sí, volver',
    copiaVuelta: 'Listo, se volvió a la copia. {resumen}',

    // Borrar todo
    peligroTitulo: 'Borrar todos los datos',
    peligroExplicacion: 'Elimina todos los clientes, recordatorios y ajustes. Descargue una copia antes si quiere conservarlos.',
    borrarTodo: 'Borrar todo',
    confirmarBorrarTitulo: '¿Borrar todos los datos?',
    confirmarBorrarTexto: 'Se eliminarán {clientes} clientes y {recordatorios} recordatorios.\n\nSi sincroniza, también se borrarán en sus otros dispositivos. Antes se guarda una copia automática.',
    siBorrar: 'Sí, borrar todo',
    todoBorrado: 'Se borraron todos los datos.',

    // Pasar datos por QR
    qrTitulo: 'Pasar datos a otro dispositivo',
    qrExplicacion: 'Sin internet: un dispositivo muestra códigos QR y el otro los escanea con la cámara. Los datos se mezclan sin borrar lo que ya tiene el otro.',
    qrMostrar: 'Mostrar QR',
    qrEscanear: 'Escanear QR',
    qrQueEnviar: '¿Qué quiere enviar?',
    qrTodo: 'Todo',
    qr30Dias: 'Solo próximos 30 días y sus clientes',
    qrGenerar: 'Generar códigos',
    qrInstruccionMostrar: 'Apunte la cámara del otro dispositivo a esta pantalla. Si hay varios códigos, pasan solos: déjela apuntando hasta que termine.',
    qrContador: 'QR {numero} de {total}',
    qrPausar: 'Pausar',
    qrSeguir: 'Seguir',
    qrInstruccionEscanear: 'Apunte la cámara a los códigos del otro dispositivo. Se pueden leer en cualquier orden.',
    qrBuscando: 'Buscando códigos…',
    qrRecibidas: 'Recibidos {recibidas} de {total}',
    qrAplicando: 'Aplicando los datos…',
    qrListo: 'Datos recibidos',
    qrInvalido: 'Los códigos se leyeron pero los datos no son válidos. No se cambió nada.',
    qrSinPermiso: 'La app no tiene permiso para usar la cámara. Puede darle permiso en los ajustes del navegador, o pasar los datos con Google Drive o con la copia de seguridad.',
    qrSinCamara: 'No se encontró una cámara en este dispositivo. Pase los datos con Google Drive o con la copia de seguridad.',
    qrSinCompresion: 'Este navegador es muy antiguo para generar los códigos. Actualícelo, o use Google Drive o la copia de seguridad.',
    cerrar: 'Cerrar',

    // Google Drive
    driveTitulo: 'Sincronizar con Google Drive',
    driveExplicacion: 'Opcional. Mantiene iguales sus datos en el celular y la computadora usando SU propio Google Drive. La app solo puede ver el archivo que ella crea («Tucankit Citas - sincronizacion.json»). Tucankit no tiene servidores ni acceso a sus datos.',
    driveConectar: 'Conectar con Google Drive',
    driveSincronizarAhora: 'Sincronizar ahora',
    driveDesconectar: 'Desconectar',
    driveReconectar: 'Volver a conectar',
    driveEstado_desconectado: 'Desconectado',
    driveEstado_conectado: '✓ Conectado',
    driveEstado_sincronizando: 'Sincronizando…',
    driveEstado_pendiente: 'Pendiente de sincronizar (sin internet)',
    driveEstado_reconectar: 'El permiso de Google venció',
    driveEstado_error: 'No se pudo sincronizar: {error}',
    driveAviso_pendiente: 'Pendiente de sincronizar: no hay internet. Sus cambios están guardados aquí y se enviarán al volver la conexión.',
    driveAviso_reconectar: 'El permiso de Google Drive venció (dura una hora). Sus datos están a salvo aquí; toque para volver a conectar y seguir sincronizando.',
    driveAviso_error: 'No se pudo sincronizar con Google Drive: {error}',
    driveCuenta: 'Cuenta: {cuenta}',
    driveUltima: 'Última sincronización: {momento}',
    driveNunca: 'Todavía no se sincronizó',
    driveSinConfigurar: 'Falta configurar el ID de cliente de Google en el archivo config.js. Siga la guía docs/google-drive.md.',
    driveSinInternet: 'Para conectar con Google Drive necesita internet.',
    driveNoConectado: 'No se pudo conectar con Google Drive. Intente de nuevo.',
    driveDesconectarTitulo: '¿Dejar de sincronizar?',
    driveDesconectarTexto: 'Este dispositivo deja de sincronizar. Sus datos aquí NO se borran.\n\nEl archivo «Tucankit Citas - sincronizacion.json» queda en su Google Drive; si quiere, puede borrarlo desde drive.google.com.',

    // Servicios y productos
    productosTitulo: 'Servicios y productos',
    productosExplicacion: 'Su lista para elegir con un toque al crear un recordatorio, en vez de escribir. El precio es opcional: en un cobro se suma solo al monto. Se guarda al instante.',
    ejemploProducto: 'Ej.: Corte de cabello',
    ejemploPrecio: 'Precio',
    productosVacio: 'Todavía no hay servicios ni productos.',
    guardarCambio: 'Guardar cambio',
    errorProducto: 'Escriba el nombre del servicio o producto.',
    productoRepetido: 'Ya está en la lista.',
    confirmarEliminarProducto: '¿Quitar «{nombre}» de la lista?',
    productoEliminarTexto: 'Los recordatorios que ya lo usan no cambian.',

    // Avisos
    avisoActualizacion: 'Hay una versión nueva. Toque para actualizar.',
    avisoNegocio: 'Complete en Ajustes el nombre de su negocio y su país, para que los mensajes y los teléfonos salgan bien.',
    irAjustes: 'Ir a Ajustes',
    avisoIphone: 'Para instalar la app en su iPhone: toque el botón Compartir (el cuadrado con la flecha) y luego «Agregar a inicio».',
    avisoMigracion: 'La app se actualizó: sus {citas} citas ahora son recordatorios de tipo «Cita» y se crearon {clientes} clientes. Por si acaso, se guardó una copia automática (Ajustes → Copias automáticas).',
    avisoDireccion: 'Está usando la dirección de PRUEBA de la app (github.io). Los navegadores guardan los datos por dirección web: cuando la app se mude a su dirección definitiva, sus datos no pasarán solos. Antes del cambio, descargue una copia de seguridad o active la sincronización con Google Drive.',
    entendido: 'Entendido',
    appInstalada: 'App instalada.',
    errorBD: 'No se pudo abrir el almacenamiento del dispositivo. Si está en modo incógnito o privado, abra la app en una ventana normal.',
    errorGuardar: 'No se pudo guardar. Intente de nuevo.'
  }
};

/* =========================================================
   2. ATAJOS Y UTILIDADES
   ========================================================= */

/** Busca un elemento de la página por su id. */
const $ = (id) => document.getElementById(id);

/** Devuelve un texto de la interfaz, reemplazando las palabras entre { }. */
function t(clave, datos = {}) {
  const textos = TEXTOS[IDIOMA] || TEXTOS.es;
  const texto = textos[clave] ?? TEXTOS.es[clave] ?? clave;
  return String(texto).replace(/\{(\w+)\}/g, (completo, nombre) => (nombre in datos ? datos[nombre] : completo));
}

/** Pone los textos de TEXTOS en los elementos que tienen data-t. */
function aplicarTextos() {
  document.documentElement.lang = IDIOMA;
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
  document.querySelectorAll('[data-t-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.tPlaceholder); });
}

/** Crea un elemento con clase y texto (atajo para armar listas). */
function crear(etiqueta, clase = '', texto = '') {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto) el.textContent = texto;
  return el;
}

/** Crea un código único. */
function nuevoId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
}

/** Texto sin tildes y en minúsculas, para buscar. */
const paraBuscar = (texto) => String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Muestra un mensaje corto abajo de la pantalla. */
let temporizadorToast = null;
function avisar(texto, segundos = 2.6) {
  const toast = $('toast');
  toast.textContent = texto;
  toast.hidden = false;
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => { toast.hidden = true; }, segundos * 1000);
}

/** Muestra un error grande arriba. */
function mostrarError(texto) {
  const aviso = $('aviso-error');
  aviso.textContent = texto;
  aviso.hidden = false;
}

/** Texto del resumen de una mezcla: "Se agregaron X, se actualizaron Y, se borraron Z." */
const textoResumen = (r) => t('resumenCambios', r);

/**
 * Ventana de confirmación. Devuelve una promesa:
 *   true = botón principal, 'alt' = botón alternativo, false = cancelar.
 */
function confirmar({ titulo, texto, botonSi, botonAlt = '', peligroso = true, soloAviso = false }) {
  return new Promise((resolver) => {
    const dialogo = $('dialogo-confirmar');
    const si = $('confirmar-si');
    const alt = $('confirmar-alt');
    const no = $('confirmar-no');
    $('confirmar-titulo').textContent = titulo;
    $('confirmar-texto').textContent = texto;
    si.textContent = botonSi;
    no.textContent = t('cancelar');
    si.classList.toggle('no-peligroso', !peligroso);
    no.hidden = soloAviso;
    alt.hidden = !botonAlt;
    alt.textContent = botonAlt;

    const terminar = (respuesta) => {
      si.onclick = null; alt.onclick = null; no.onclick = null; dialogo.oncancel = null;
      if (dialogo.open) dialogo.close();
      resolver(respuesta);
    };
    si.onclick = () => terminar(true);
    alt.onclick = () => terminar('alt');
    no.onclick = () => terminar(false);
    dialogo.oncancel = (evento) => { evento.preventDefault(); terminar(false); };
    dialogo.showModal();
    (soloAviso ? si : no).focus(); // el foco en "Cancelar" evita confirmar sin querer
  });
}

/** Muestra (o quita) el mensaje de error de un campo. El contenedor tiene id "campo-<nombre>". */
function marcarError(campo, mensaje) {
  const contenedor = $('campo-' + campo);
  const error = contenedor.querySelector('.error');
  contenedor.classList.toggle('invalido', Boolean(mensaje));
  error.textContent = mensaje;
  error.hidden = !mensaje;
}

/* =========================================================
   3. BASE DE DATOS (IndexedDB, dentro del dispositivo)
   Cajones (versión 2 de la base):
     - clientes, recordatorios, etiquetas: un registro por cosa.
       Cada uno tiene actualizadoEn, dispositivoId y borradoEn
       (borrar marca, no elimina, para que la sincronización se entere).
     - ajustes: dos fichas:
         "compartidos": se sincronizan (negocio, plantillas, firma...)
         "locales": propios de este dispositivo (su id y nombre, etc.)
     - copiasAuto: copias automáticas (las últimas 5).
   La versión 1 tenía un cajón "citas"; al abrir esta versión
   se reorganiza solo (ver migrarDesdeV1).
   ========================================================= */
const BD_NOMBRE = 'tucankit-citas';
const BD_VERSION = 3; // 3: se agregó el cajón "productos" (servicios y productos)
const MAX_COPIAS_AUTO = 5;
let bd = null;

/** Plantilla de citas por defecto de la versión 1 (para reconocerla al migrar). */
const PLANTILLA_V1 = 'Hola {nombre}, le recordamos su cita de {servicio} el {fecha} a las {hora} en {negocio}. Por favor responda SÍ para confirmar. ¡Gracias!';

/** Ajustes que se sincronizan entre dispositivos (campo por campo). */
const CLAVES_COMPARTIDAS = [
  'negocio', 'atiende', 'direccion', 'pais', 'codigoPais', 'moneda', 'pagoHabitual',
  'telefonoNegocio', 'enlacesRespuesta', 'firmaActiva', 'firma',
  ...TIPOS.map((tipo) => 'plantilla_' + tipo),
  ...TIPOS.map((tipo) => 'opciones_' + tipo)
];

/** Ajustes compartidos con sus valores iniciales. */
/** País de este dispositivo adivinado por idioma y zona horaria (Costa Rica si no se sabe). */
function paisInicial() {
  let zona = '';
  try { zona = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (error) { zona = ''; }
  return TucankitCore.adivinarPais(navigator.language || '', zona) || 'CR';
}

function compartidosPorDefecto() {
  const pais = TucankitCore.paisPorCodigo(paisInicial());
  const a = {
    negocio: '', atiende: '', direccion: '', pais: pais.codigo, codigoPais: pais.prefijo, moneda: pais.moneda,
    pagoHabitual: '', telefonoNegocio: '', enlacesRespuesta: false, firmaActiva: false, firma: '',
    _sello: {}
  };
  TIPOS.forEach((tipo) => {
    a['opciones_' + tipo] = opcionesPorDefecto(tipo);
    a['plantilla_' + tipo] = plantillaPorDefecto(tipo);
  });
  return a;
}

/** Ajustes propios de este dispositivo con sus valores iniciales. */
function localesPorDefecto() {
  return {
    dispositivoId: nuevoId(),
    nombreDispositivo: '',
    whatsappComputadora: 'web',
    ayudaIphoneOculta: false,
    avisoDireccionOculto: false,
    ultimaCopia: null,
    primerUso: Date.now(),
    envioGrupo: { grupo: '', mensaje: t('grupoMensajeInicial'), enviados: [] },
    // Google Drive (propio de este dispositivo; nunca se sincroniza)
    driveActivo: false,
    driveToken: '',        // permiso temporal de Google (~1 hora)
    driveTokenVence: 0,
    driveArchivoId: '',
    driveCuenta: '',
    driveUltimaSync: null,
    drivePendiente: false
  };
}

/** Limpia las opciones del constructor (por si vienen de un archivo). */
function limpiarOpciones(o, tipo) {
  const base = opcionesPorDefecto(tipo);
  if (!o || typeof o !== 'object') return base;
  return {
    saludo: Number.isInteger(o.saludo) ? o.saludo : base.saludo,
    trato: o.trato === 'usted' ? 'usted' : 'tu',
    confirmar: typeof o.confirmar === 'boolean' ? o.confirmar : base.confirmar,
    direccion: typeof o.direccion === 'boolean' ? o.direccion : base.direccion,
    cierre: Number.isInteger(o.cierre) ? o.cierre : base.cierre
  };
}

/** Revisa y completa los ajustes compartidos (de la base o de un archivo). */
function normalizarCompartidos(a = {}) {
  const r = compartidosPorDefecto();
  ['negocio', 'atiende', 'direccion', 'pagoHabitual', 'firma'].forEach((k) => {
    if (typeof a[k] === 'string') r[k] = a[k];
  });
  if (/^\d{1,4}$/.test(String(a.codigoPais || ''))) r.codigoPais = String(a.codigoPais);
  if (typeof a.moneda === 'string' && a.moneda.trim()) r.moneda = a.moneda.trim().slice(0, 4);
  // País: si no estaba guardado (versiones anteriores), se deduce del código telefónico
  if (a.pais === 'OTRO' || TucankitCore.paisPorCodigo(a.pais)) r.pais = a.pais;
  else if (a.codigoPais) r.pais = TucankitCore.paisPorPrefijo(String(a.codigoPais)) || 'OTRO';
  if (typeof a.telefonoNegocio === 'string' && telefonoValido(a.telefonoNegocio)) r.telefonoNegocio = a.telefonoNegocio;
  r.enlacesRespuesta = a.enlacesRespuesta === true;
  r.firmaActiva = a.firmaActiva === true;
  TIPOS.forEach((tipo) => {
    r['opciones_' + tipo] = limpiarOpciones(a['opciones_' + tipo], tipo);
    const p = a['plantilla_' + tipo];
    r['plantilla_' + tipo] = typeof p === 'string' && p.trim() ? p : construirPlantilla(tipo, r['opciones_' + tipo]);
  });
  // Sellos: cuándo se cambió cada campo (para mezclar campo por campo)
  if (a._sello && typeof a._sello === 'object') {
    CLAVES_COMPARTIDAS.forEach((k) => {
      const s = a._sello[k];
      if (s && typeof s.actualizadoEn === 'number') r._sello[k] = { actualizadoEn: s.actualizadoEn, dispositivoId: String(s.dispositivoId || '') };
    });
  }
  return r;
}

/** Revisa y completa los ajustes locales. */
function normalizarLocales(a = {}) {
  const r = localesPorDefecto();
  if (typeof a.dispositivoId === 'string' && a.dispositivoId) r.dispositivoId = a.dispositivoId;
  if (typeof a.nombreDispositivo === 'string') r.nombreDispositivo = a.nombreDispositivo;
  if (a.whatsappComputadora === 'app') r.whatsappComputadora = 'app';
  r.ayudaIphoneOculta = a.ayudaIphoneOculta === true;
  r.avisoDireccionOculto = a.avisoDireccionOculto === true;
  if (typeof a.ultimaCopia === 'number') r.ultimaCopia = a.ultimaCopia;
  if (typeof a.primerUso === 'number') r.primerUso = a.primerUso;
  r.driveActivo = a.driveActivo === true;
  r.drivePendiente = a.drivePendiente === true;
  ['driveToken', 'driveArchivoId', 'driveCuenta'].forEach((k) => { if (typeof a[k] === 'string') r[k] = a[k]; });
  if (typeof a.driveTokenVence === 'number') r.driveTokenVence = a.driveTokenVence;
  if (typeof a.driveUltimaSync === 'number') r.driveUltimaSync = a.driveUltimaSync;
  const g = a.envioGrupo;
  if (g && typeof g === 'object') {
    r.envioGrupo = {
      grupo: typeof g.grupo === 'string' ? g.grupo : '',
      mensaje: typeof g.mensaje === 'string' ? g.mensaje : r.envioGrupo.mensaje,
      enviados: Array.isArray(g.enviados) ? g.enviados.filter((x) => typeof x === 'string') : []
    };
  }
  return r;
}

/**
 * Reorganiza los datos de la versión 1 (una lista de "citas" con nombre y
 * teléfono adentro) en clientes + recordatorios. No pierde nada:
 *  - crea un cliente por cada teléfono distinto (con el primer nombre usado),
 *  - si otra cita con el mismo teléfono tenía otro nombre, lo anota en la nota,
 *  - cada cita pasa a ser un recordatorio de tipo "cita".
 * Se usa al actualizar la app y al restaurar copias de la versión 1.
 */
function migrarDesdeV1(citas, ajustesV1, dispositivoId, ahora = Date.now()) {
  const clientesPorTelefono = new Map();
  const recordatorios = [];
  const ordenadas = [...citas].sort((a, b) => (a.creada || 0) - (b.creada || 0));

  for (const c of ordenadas) {
    let cliente = clientesPorTelefono.get(c.telefono);
    if (!cliente) {
      cliente = {
        id: nuevoId(), nombre: c.nombre, telefono: c.telefono, nota: '', etiquetaIds: [],
        creadoEn: c.creada || ahora, actualizadoEn: ahora, dispositivoId, borradoEn: null
      };
      clientesPorTelefono.set(c.telefono, cliente);
    }
    const otroNombre = c.nombre && c.nombre !== cliente.nombre ? `Nombre en la cita: ${c.nombre}` : '';
    recordatorios.push({
      id: c.id || nuevoId(),
      tipo: 'cita',
      clienteId: cliente.id,
      fecha: c.fecha,
      hora: c.hora,
      detalle: c.servicio || '',
      monto: null,
      pago: '',
      nota: [otroNombre, c.nota || ''].filter(Boolean).join('\n'),
      enviado: c.recordatorioEnviado === true,
      enviadoEn: c.recordatorioEnviado === true ? (c.recordatorioFecha || ahora) : null,
      respuesta: '',
      respuestaEn: null,
      creadoEn: c.creada || ahora,
      actualizadoEn: ahora,
      dispositivoId,
      borradoEn: null
    });
  }

  // Ajustes: si usaba el mensaje original (con "usted"), se mantiene "usted" en todos los tipos
  const a = ajustesV1 || {};
  const compartidos = compartidosPorDefecto();
  ['negocio', 'direccion'].forEach((k) => { if (typeof a[k] === 'string') compartidos[k] = a[k]; });
  if (/^\d{1,4}$/.test(String(a.codigoPais || ''))) compartidos.codigoPais = String(a.codigoPais);
  const vieja = typeof a.plantilla === 'string' ? a.plantilla.trim() : '';
  const usabaOriginal = !vieja || vieja === PLANTILLA_V1;
  if (vieja && usabaOriginal) {
    TIPOS.forEach((tipo) => {
      compartidos['opciones_' + tipo] = { ...opcionesPorDefecto(tipo), trato: 'usted' };
      compartidos['plantilla_' + tipo] = construirPlantilla(tipo, compartidos['opciones_' + tipo]);
    });
  } else if (vieja) {
    compartidos.plantilla_cita = vieja; // la había personalizado: se respeta tal cual
  }
  CLAVES_COMPARTIDAS.forEach((k) => { compartidos._sello[k] = { actualizadoEn: ahora, dispositivoId }; });

  const locales = {
    ultimaCopia: typeof a.ultimaCopia === 'number' ? a.ultimaCopia : null,
    primerUso: typeof a.primerUso === 'number' ? a.primerUso : ahora,
    ayudaIphoneOculta: a.ayudaIphoneOculta === true
  };
  return { clientes: [...clientesPorTelefono.values()], recordatorios, etiquetas: [], productos: [], compartidos, locales };
}

/** Abre la base de datos y, si viene de la versión 1, la reorganiza. */
function abrirBD() {
  return new Promise((resolver, rechazar) => {
    if (!('indexedDB' in window)) { rechazar(new Error('Sin IndexedDB')); return; }
    const pedido = indexedDB.open(BD_NOMBRE, BD_VERSION);
    let migracion = null;

    pedido.onupgradeneeded = (evento) => {
      const base = pedido.result;
      const tx = pedido.transaction;
      // Venía de la versión 2: copia automática ANTES de agregar el cajón nuevo
      if (evento.oldVersion === 2) {
        const pedidos = ['clientes', 'recordatorios', 'etiquetas'].map((n) => tx.objectStore(n).getAll());
        const pedidoComp = tx.objectStore('ajustes').get('compartidos');
        pedidoComp.onsuccess = () => {
          const ahora = Date.now();
          const [clientes, recordatorios, etiquetas] = pedidos.map((x) => x.result || []);
          const ajustes = { ...(pedidoComp.result || {}) };
          delete ajustes.clave;
          tx.objectStore('copiasAuto').put({
            id: ahora, creadaEn: ahora, motivo: 'migracion', formato: 2,
            datos: { app: 'tucankit-citas', version: 2, creada: ahora, datos: { clientes, recordatorios, etiquetas, productos: [], ajustes } },
            cantidad: recordatorios.filter((r) => !r.borradoEn).length
          });
        };
      }
      TucankitCore.COLECCIONES.forEach((nombre) => {
        if (!base.objectStoreNames.contains(nombre)) base.createObjectStore(nombre, { keyPath: 'id' });
      });
      if (!base.objectStoreNames.contains('ajustes')) base.createObjectStore('ajustes', { keyPath: 'clave' });
      if (!base.objectStoreNames.contains('copiasAuto')) base.createObjectStore('copiasAuto', { keyPath: 'id' });

      // Venía de la versión 1: reorganizar "citas" en clientes + recordatorios.
      // Todo ocurre dentro de esta misma operación: si algo falla, se deshace entero.
      if (evento.oldVersion === 1 && base.objectStoreNames.contains('citas')) {
        const pedidoCitas = tx.objectStore('citas').getAll();
        const pedidoAjustes = tx.objectStore('ajustes').get('principal');
        pedidoAjustes.onsuccess = () => {
          const ahora = Date.now();
          const citas = pedidoCitas.result || [];
          const ajustesV1 = pedidoAjustes.result || {};
          const locales = { ...localesPorDefecto() };
          // 1) Copia automática ANTES de cambiar nada (datos exactamente como estaban)
          tx.objectStore('copiasAuto').put({
            id: ahora, creadaEn: ahora, motivo: 'migracion', formato: 1,
            datos: { citas, ajustes: ajustesV1 }, cantidad: citas.length
          });
          // 2) Reorganizar
          const nuevo = migrarDesdeV1(citas, ajustesV1, locales.dispositivoId, ahora);
          nuevo.clientes.forEach((c) => tx.objectStore('clientes').put(c));
          nuevo.recordatorios.forEach((r) => tx.objectStore('recordatorios').put(r));
          tx.objectStore('ajustes').delete('principal');
          tx.objectStore('ajustes').put({ ...nuevo.compartidos, clave: 'compartidos' });
          tx.objectStore('ajustes').put({ ...locales, ...nuevo.locales, clave: 'locales' });
          base.deleteObjectStore('citas');
          if (citas.length) migracion = { citas: citas.length, clientes: nuevo.clientes.length };
        };
      }
    };
    pedido.onsuccess = () => resolver({ base: pedido.result, migracion });
    pedido.onerror = () => rechazar(pedido.error);
    pedido.onblocked = () => rechazar(new Error('Base de datos bloqueada por otra pestaña'));
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

const leerTodoBD = (cajon) => esperarPedido(bd.transaction(cajon, 'readonly').objectStore(cajon).getAll());
const leerUnoBD = (cajon, clave) => esperarPedido(bd.transaction(cajon, 'readonly').objectStore(cajon).get(clave));

/** Guarda varios registros en uno o más cajones, todo junto o nada. */
async function guardarVariosBD(cambios) {
  const cajones = Object.keys(cambios);
  const tx = bd.transaction(cajones, 'readwrite');
  cajones.forEach((cajon) => cambios[cajon].forEach((registro) => tx.objectStore(cajon).put(registro)));
  await esperarTransaccion(tx);
}

/** Reemplaza los cajones de datos por los indicados (usado tras una mezcla). */
async function escribirDatosBD(datos) {
  const tx = bd.transaction([...TucankitCore.COLECCIONES, 'ajustes'], 'readwrite');
  TucankitCore.COLECCIONES.forEach((cajon) => {
    const store = tx.objectStore(cajon);
    store.clear();
    (datos[cajon] || []).forEach((r) => store.put(r));
  });
  const compartidos = datos.compartidos;
  tx.objectStore('ajustes').put({ ...compartidos, clave: 'compartidos' });
  await esperarTransaccion(tx);
}

/* =========================================================
   4. GUARDAR CAMBIOS
   Todo cambio pasa por aquí: se "sella" con la hora y el id de este
   dispositivo, se guarda y se actualiza la memoria.
   ========================================================= */

/** Lo que la app tiene en memoria mientras está abierta. */
const estado = {
  clientes: [],          // incluye los borrados (marcados); la pantalla muestra solo activos
  recordatorios: [],
  etiquetas: [],
  productos: [],          // servicios y productos (lista preestablecida)
  compartidos: compartidosPorDefecto(),
  locales: localesPorDefecto(),
  vista: 'agenda',
  vistaAnterior: 'agenda',
  pestana: 'manana',
  filtroTipo: 'todos',
  busqueda: '',
  filtroEtiqueta: '',
  clienteAbierto: null,
  // Formulario de recordatorio
  editandoRecordatorioId: null,
  recTipo: 'cita',
  recClienteId: null,
  recClienteNuevo: false,
  // Formulario de cliente
  editandoClienteId: null,
  cliEtiquetaIds: [],
  cliEtiquetasNuevas: [],
  // Editor de plantillas
  editorTipo: 'cita',
  editorPlantillas: {},
  editorOpciones: {}
};

const idDispositivo = () => estado.locales.dispositivoId;

/** Idioma/país para escribir y leer montos (ej.: "es-MX"). */
const idiomaMontos = (pais = estado.compartidos.pais) => (TucankitCore.paisPorCodigo(pais) || { idioma: 'es' }).idioma;
const monto = (numero) => formatearMonto(numero, estado.compartidos.moneda, idiomaMontos());

/* Listas activas (sin los borrados) */
const clientesActivos = () => estado.clientes.filter(estaActivo);
const recordatoriosActivos = () => estado.recordatorios.filter(estaActivo);
const etiquetasActivas = () => estado.etiquetas.filter(estaActivo)
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
const clientePorId = (id) => estado.clientes.find((c) => c.id === id);
const etiquetaPorId = (id) => estado.etiquetas.find((e) => e.id === id);

/** Reemplaza (o agrega) un registro en una lista de la memoria. */
function ponerEnMemoria(lista, registro) {
  const i = estado[lista].findIndex((r) => r.id === registro.id);
  if (i >= 0) estado[lista][i] = registro;
  else estado[lista].push(registro);
}

/**
 * Guarda registros nuevos o cambiados: los sella, los guarda en la base
 * y en memoria. "cambios" es { clientes: [...], recordatorios: [...], etiquetas: [...] }.
 */
async function guardarCambios(cambios, { borrar = false } = {}) {
  const ahora = Date.now();
  const sellados = {};
  Object.entries(cambios).forEach(([cajon, lista]) => {
    sellados[cajon] = lista.map((r) => (borrar ? marcarBorrado(r, idDispositivo(), ahora) : sellar(r, idDispositivo(), ahora)));
  });
  await guardarVariosBD(sellados);
  Object.entries(sellados).forEach(([cajon, lista]) => lista.forEach((r) => ponerEnMemoria(cajon, r)));
  alCambiarDatos();
}

/** Guarda los ajustes compartidos, sellando solo los campos que cambiaron. */
async function guardarCompartidos(nuevos) {
  const ahora = Date.now();
  const sello = { ...(estado.compartidos._sello || {}) };
  CLAVES_COMPARTIDAS.forEach((k) => {
    if (JSON.stringify(nuevos[k]) !== JSON.stringify(estado.compartidos[k])) {
      sello[k] = { actualizadoEn: ahora, dispositivoId: idDispositivo() };
    }
  });
  const final = { ...nuevos, _sello: sello };
  await guardarVariosBD({ ajustes: [{ ...final, clave: 'compartidos' }] });
  estado.compartidos = final;
  alCambiarDatos();
}

/** Guarda los ajustes propios de este dispositivo. */
async function guardarLocales(cambios) {
  estado.locales = { ...estado.locales, ...cambios };
  await guardarVariosBD({ ajustes: [{ ...estado.locales, clave: 'locales' }] });
}

/**
 * Se llama después de cada cambio en los datos. Por ahora solo redibuja;
 * la sincronización con Google Drive se engancha aquí.
 */
function alCambiarDatos() {
  revisarAvisos();
  if (typeof programarSincronizacion === 'function') programarSincronizacion();
}

/* =========================================================
   5. AGENDA: LISTA DE RECORDATORIOS Y PESTAÑAS
   ========================================================= */

/** Ícono de cada tipo de recordatorio. */
const ICONOS = { cita: '📅', entrega: '📦', cobro: '💰', seguimiento: '💬', llego: '🛍️' };

/** Respuestas que se pueden marcar en cada tipo. */
const RESPUESTAS_POR_TIPO = {
  cita: ['confirmo', 'cancelo'],
  entrega: ['confirmo'],
  cobro: ['pago'],
  seguimiento: ['respondio'],
  llego: ['confirmo']
};

/** Ordena por fecha y hora (los "sin hora" van primero en su día). */
function ordenarRecordatorios(lista) {
  return [...lista].sort((a, b) =>
    (a.fecha + ' ' + (a.hora || '')).localeCompare(b.fecha + ' ' + (b.hora || '')) || a.creadoEn - b.creadoEn);
}

/** Recordatorios de una pestaña (y del tipo elegido en el filtro). */
function recordatoriosDePestana(pestana) {
  const hoy = hoyTexto();
  const manana = mananaTexto();
  const filtros = {
    manana: (r) => r.fecha === manana,
    hoy: (r) => r.fecha === hoy,
    proximas: (r) => r.fecha >= hoy, // el texto AAAA-MM-DD se compara directo
    todas: () => true
  };
  return ordenarRecordatorios(recordatoriosActivos()
    .filter(filtros[pestana])
    .filter((r) => estado.filtroTipo === 'todos' || r.tipo === estado.filtroTipo));
}

/** Botones de filtro por tipo (Todos, Cita, Entrega...). */
function dibujarFiltroTipos() {
  const contenedor = $('filtro-tipos');
  contenedor.replaceChildren();
  ['todos', ...TIPOS].forEach((tipo) => {
    const b = crear('button', 'ficha', tipo === 'todos' ? t('filtroTodos') : `${ICONOS[tipo]} ${t('tipo_' + tipo)}`);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(estado.filtroTipo === tipo));
    b.addEventListener('click', () => { estado.filtroTipo = tipo; dibujarAgenda(); });
    contenedor.append(b);
  });
}

/** Dibuja la agenda según la pestaña y el filtro elegidos. */
function dibujarAgenda() {
  const hoy = hoyTexto();
  const manana = mananaTexto();
  dibujarFiltroTipos();

  document.querySelectorAll('.pestana').forEach((boton) => {
    const nombre = boton.dataset.pestana;
    boton.setAttribute('aria-selected', String(nombre === estado.pestana));
    const cantidad = recordatoriosDePestana(nombre).length;
    boton.querySelector('.contador').textContent = cantidad ? String(cantidad) : '';
  });

  const titulos = {
    manana: t('tituloManana', { fecha: fechaAmigable(manana) }),
    hoy: t('tituloHoy', { fecha: fechaAmigable(hoy) }),
    proximas: t('tituloProximas'),
    todas: t('tituloTodas')
  };
  $('titulo-lista').textContent = titulos[estado.pestana];

  const lista = $('lista-recordatorios');
  lista.replaceChildren();
  const recordatorios = recordatoriosDePestana(estado.pestana);
  if (!recordatorios.length) {
    const vacios = { manana: 'vacioManana', hoy: 'vacioHoy', proximas: 'vacioProximas', todas: 'vacioTodas' };
    lista.append(crear('p', 'vacio', t(vacios[estado.pestana])));
    return;
  }

  // En "Próximas" y "Todas" se agrupan por día
  const agrupar = estado.pestana === 'proximas' || estado.pestana === 'todas';
  let diaAnterior = null;
  recordatorios.forEach((r) => {
    if (agrupar && r.fecha !== diaAnterior) {
      let titulo = fechaAmigable(r.fecha);
      if (r.fecha === hoy) titulo = t('grupoHoy', { fecha: titulo });
      else if (r.fecha === manana) titulo = t('grupoManana', { fecha: titulo });
      lista.append(crear('h3', 'grupo-fecha', titulo));
      diaAnterior = r.fecha;
    }
    lista.append(crearTarjeta(r, { mostrarFecha: false }));
  });
}

/** Línea de detalle de la tarjeta según el tipo. */
function textoDetalle(r) {
  if (r.tipo === 'cobro') {
    return [monto(r.monto), r.pago, r.detalle].filter(Boolean).join(' · ');
  }
  return r.detalle;
}

/** Arma la tarjeta de un recordatorio a partir del molde de index.html. */
function crearTarjeta(r, { mostrarFecha }) {
  const tarjeta = $('plantilla-recordatorio').content.firstElementChild.cloneNode(true);
  const parte = (clase) => tarjeta.querySelector('.' + clase);
  const cliente = clientePorId(r.clienteId);
  tarjeta.dataset.id = r.id;
  tarjeta.dataset.tipo = r.tipo;
  tarjeta.classList.toggle('pasada', r.fecha < hoyTexto());
  tarjeta.classList.toggle('cancelada', r.respuesta === 'cancelo');

  parte('tipo-insignia').textContent = `${ICONOS[r.tipo]} ${t('tipo_' + r.tipo)}`;
  parte('cita-hora').textContent = r.hora ? horaAmigable(r.hora) : t('sinHora');
  parte('cita-hora').classList.toggle('sin-hora', !r.hora);
  parte('cita-fecha').textContent = mostrarFecha ? fechaAmigable(r.fecha) : '';
  parte('cita-nombre').textContent = cliente ? cliente.nombre : '—';
  parte('cita-detalle').textContent = textoDetalle(r);
  parte('cita-detalle').hidden = !textoDetalle(r);
  parte('cita-telefono').textContent = cliente ? formatearTelefono(cliente.telefono, estado.compartidos.codigoPais) : '';
  parte('cita-nota').textContent = r.nota;
  parte('cita-nota').hidden = !r.nota;
  parte('accion-enviar').textContent = t('enviarRecordatorio');
  parte('accion-editar').textContent = t('editar');
  parte('accion-eliminar').textContent = t('eliminar');
  parte('accion-desmarcar').textContent = t('desmarcar');

  if (r.enviado) {
    tarjeta.classList.add('enviada');
    parte('cita-enviado').hidden = false;
    parte('cita-enviado-texto').textContent = t('recordatorioEnviado', { momento: momentoAmigable(r.enviadoEn) });
    const enviar = parte('accion-enviar');
    enviar.textContent = t('reenviarRecordatorio');
    enviar.classList.replace('boton-accion', 'boton-secundario');
  }

  // Respuesta del cliente (se marca a mano)
  if (r.respuesta) {
    const insignia = parte('respuesta-insignia');
    insignia.hidden = false;
    insignia.textContent = t('resp_' + r.respuesta);
    insignia.dataset.respuesta = r.respuesta;
  }
  const respuestas = parte('cita-respuestas');
  parte('cita-respuestas-titulo').textContent = t('respuestaTitulo');
  (RESPUESTAS_POR_TIPO[r.tipo] || []).forEach((resp) => {
    const b = crear('button', 'ficha ficha-chica accion-respuesta', t('resp_' + resp));
    b.type = 'button';
    b.dataset.respuesta = resp;
    b.setAttribute('aria-pressed', String(r.respuesta === resp));
    respuestas.append(b);
  });
  return tarjeta;
}

/** Cuando se toca un botón dentro de una tarjeta, se busca qué recordatorio es. */
function alTocarTarjeta(evento) {
  const boton = evento.target.closest('button');
  const tarjeta = evento.target.closest('.cita');
  if (!boton || !tarjeta) return;
  const r = estado.recordatorios.find((x) => x.id === tarjeta.dataset.id);
  if (!r) return;
  const clase = (c) => boton.classList.contains(c);
  if (clase('accion-enviar')) enviarRecordatorio(r);
  else if (clase('accion-desmarcar')) marcarEnviado(r, false);
  else if (clase('accion-respuesta')) marcarRespuesta(r, boton.dataset.respuesta);
  else if (clase('accion-editar')) abrirFormularioRecordatorio(r);
  else if (clase('accion-eliminar')) eliminarRecordatorio(r);
  else if (clase('accion-cliente')) abrirFicha(r.clienteId);
}

async function eliminarRecordatorio(r) {
  const cliente = clientePorId(r.clienteId);
  const seguro = await confirmar({
    titulo: t('confirmarEliminarTitulo'),
    texto: t('confirmarEliminarTexto', {
      tipo: t('tipo_' + r.tipo), nombre: cliente ? cliente.nombre : '—', fecha: fechaAmigable(r.fecha)
    }),
    botonSi: t('siEliminar')
  });
  if (!seguro) return;
  try {
    await guardarCambios({ recordatorios: [r] }, { borrar: true });
    redibujar();
    avisar(t('eliminado'));
  } catch (error) {
    console.error(error);
    mostrarError(t('errorGuardar'));
  }
}

/* =========================================================
   6. FORMULARIO DE RECORDATORIO
   ========================================================= */

/** Abre el formulario. Sin recordatorio = nuevo. Con clienteId = cliente ya elegido. */
function abrirFormularioRecordatorio(r = null, clienteId = null) {
  estado.editandoRecordatorioId = r ? r.id : null;
  estado.recTipo = r ? r.tipo : (estado.filtroTipo !== 'todos' ? estado.filtroTipo : 'cita');
  estado.recClienteId = r ? r.clienteId : clienteId;
  estado.recClienteNuevo = false;
  $('rec-titulo').textContent = t(r ? 'tituloEditarRecordatorio' : 'tituloNuevoRecordatorio');

  const fechaInicial = estado.pestana === 'hoy' || estado.recTipo === 'llego' ? hoyTexto() : mananaTexto();
  $('rec-fecha').value = r ? r.fecha : fechaInicial;
  $('rec-hora').value = r ? r.hora : '';
  $('rec-detalle').value = r ? r.detalle : '';
  $('rec-monto').value = r && r.monto != null ? formatearMonto(r.monto, '', idiomaMontos()) : '';
  $('rec-pago').value = r ? r.pago : estado.compartidos.pagoHabitual;
  $('rec-nota').value = r ? r.nota : '';
  $('rec-cliente-buscar').value = '';
  $('rec-nombre').value = '';
  $('rec-telefono').value = '';

  ['cliente', 'recnombre', 'rectelefono', 'fecha', 'hora', 'monto'].forEach((c) => marcarError(c, ''));
  dibujarTiposFormulario();
  aplicarTipoAlFormulario();
  dibujarClienteFormulario();
  dibujarProductosFormulario();
  $('dialogo-recordatorio').showModal();
}

/** Botones para elegir el tipo dentro del formulario. */
function dibujarTiposFormulario() {
  const contenedor = $('rec-tipos');
  contenedor.replaceChildren();
  TIPOS.forEach((tipo) => {
    const b = crear('button', 'ficha', `${ICONOS[tipo]} ${t('tipo_' + tipo)}`);
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(estado.recTipo === tipo));
    b.addEventListener('click', () => {
      estado.recTipo = tipo;
      dibujarTiposFormulario();
      aplicarTipoAlFormulario();
      dibujarProductosFormulario();
    });
    contenedor.append(b);
  });
}

/** Cambia etiquetas y campos del formulario según el tipo. */
function aplicarTipoAlFormulario() {
  const tipo = estado.recTipo;
  $('rec-hora-etiqueta').textContent = t(tipo === 'cita' ? 'horaObligatoria' : 'horaOpcional');
  $('rec-detalle-etiqueta').textContent = t('detalle_' + tipo);
  $('rec-detalle').placeholder = t('ejemploDetalle_' + tipo);
  $('rec-cobro').hidden = tipo !== 'cobro';
  $('rec-monto-etiqueta').textContent = t('campoMonto', { moneda: estado.compartidos.moneda });
}

/** Parte del formulario que elige el cliente. */
function dibujarClienteFormulario() {
  const cliente = estado.recClienteId ? clientePorId(estado.recClienteId) : null;
  $('rec-cliente-elegido').hidden = !cliente;
  $('rec-cliente-busqueda').hidden = Boolean(cliente) || estado.recClienteNuevo;
  $('rec-nuevo').hidden = !estado.recClienteNuevo;
  if (cliente) {
    $('rec-cliente-nombre').textContent = cliente.nombre;
    $('rec-cliente-telefono').textContent = formatearTelefono(cliente.telefono, estado.compartidos.codigoPais);
  }
  if (!cliente && !estado.recClienteNuevo) dibujarSugerencias();
  if (estado.recClienteNuevo) actualizarNumeroFinal('rec-telefono', 'rec-numero-final');
}

/** ¿El cliente coincide con lo buscado? (nombre, teléfono, etiquetas o nota) */
function clienteCoincide(cliente, busqueda) {
  const q = paraBuscar(busqueda).trim();
  if (!q) return true;
  const etiquetas = (cliente.etiquetaIds || []).map((id) => (etiquetaPorId(id) || {}).nombre || '').join(' ');
  const digitos = q.replace(/\D/g, '');
  return paraBuscar(`${cliente.nombre} ${etiquetas} ${cliente.nota}`).includes(q)
    || (digitos.length >= 3 && cliente.telefono.includes(digitos));
}

/** Lista de clientes sugeridos mientras se escribe, más la opción de crear uno. */
function dibujarSugerencias() {
  const texto = $('rec-cliente-buscar').value.trim();
  const contenedor = $('rec-sugerencias');
  contenedor.replaceChildren();
  const encontrados = clientesActivos()
    .filter((c) => clienteCoincide(c, texto))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    .slice(0, 6);
  encontrados.forEach((c) => {
    const b = crear('button', 'sugerencia');
    b.type = 'button';
    b.append(crear('strong', '', c.nombre), crear('small', '', formatearTelefono(c.telefono, estado.compartidos.codigoPais)));
    b.addEventListener('click', () => { estado.recClienteId = c.id; marcarError('cliente', ''); dibujarClienteFormulario(); });
    contenedor.append(b);
  });
  const nuevo = crear('button', 'sugerencia sugerencia-nueva', texto ? t('crearClienteCon', { texto }) : t('crearClienteNuevo'));
  nuevo.type = 'button';
  nuevo.addEventListener('click', () => {
    estado.recClienteNuevo = true;
    // Si lo escrito parece un teléfono, va al campo teléfono; si no, al nombre
    if (/^[\d\s()+-]{6,}$/.test(texto)) $('rec-telefono').value = texto;
    else $('rec-nombre').value = texto;
    marcarError('cliente', '');
    dibujarClienteFormulario();
    $(texto && /^[\d\s()+-]{6,}$/.test(texto) ? 'rec-nombre' : 'rec-telefono').focus();
  });
  contenedor.append(nuevo);
}

/** Muestra debajo de un campo de teléfono cómo quedará el número final. */
function actualizarNumeroFinal(idCampo, idTexto, codigo = estado.compartidos.codigoPais) {
  const digitos = normalizarTelefono($(idCampo).value, codigo);
  $(idTexto).textContent = telefonoValido(digitos)
    ? t('seEnviaraA', { numero: formatearTelefono(digitos, codigo) })
    : '';
}

/** Busca otro cliente activo con el mismo teléfono. */
const clienteConTelefono = (telefono, exceptoId = null) =>
  clientesActivos().find((c) => c.telefono === telefono && c.id !== exceptoId);

async function guardarFormularioRecordatorio(evento) {
  evento.preventDefault();
  const tipo = estado.recTipo;
  const fecha = $('rec-fecha').value;
  const hora = $('rec-hora').value.slice(0, 5);
  const montoLeido = leerMonto($('rec-monto').value, idiomaMontos());
  const errores = {
    fecha: FORMATO_FECHA.test(fecha) ? '' : t('errorFecha'),
    hora: (hora && !FORMATO_HORA.test(hora)) || (tipo === 'cita' && !hora) ? t('errorHora') : '',
    monto: tipo === 'cobro' && montoLeido == null ? t('errorMonto') : '',
    cliente: '', recnombre: '', rectelefono: ''
  };

  // Cliente: elegido o nuevo
  let clienteNuevo = null;
  if (estado.recClienteNuevo) {
    const nombre = $('rec-nombre').value.trim();
    const telefono = normalizarTelefono($('rec-telefono').value, estado.compartidos.codigoPais);
    if (!nombre) errores.recnombre = t('errorNombre');
    if (!telefonoValido(telefono)) errores.rectelefono = t('errorTelefono');
    else if (clienteConTelefono(telefono)) errores.rectelefono = t('errorTelefonoRepetido', { nombre: clienteConTelefono(telefono).nombre });
    if (!errores.recnombre && !errores.rectelefono) {
      clienteNuevo = { id: nuevoId(), nombre, telefono, nota: '', etiquetaIds: [], creadoEn: Date.now() };
    }
  } else if (!estado.recClienteId) {
    errores.cliente = t('errorCliente');
  }

  Object.entries(errores).forEach(([campo, mensaje]) => marcarError(campo, mensaje));
  if (Object.values(errores).some(Boolean)) return;

  const anterior = estado.recordatorios.find((x) => x.id === estado.editandoRecordatorioId);
  const r = {
    ...(anterior || { id: nuevoId(), enviado: false, enviadoEn: null, respuesta: '', respuestaEn: null, creadoEn: Date.now() }),
    tipo,
    clienteId: clienteNuevo ? clienteNuevo.id : estado.recClienteId,
    fecha,
    hora,
    detalle: $('rec-detalle').value.trim(),
    monto: tipo === 'cobro' ? montoLeido : null,
    pago: tipo === 'cobro' ? $('rec-pago').value.trim() : '',
    nota: $('rec-nota').value.trim()
  };
  // Si cambió el día o la hora, el recordatorio enviado ya no vale
  if (anterior && (anterior.fecha !== fecha || anterior.hora !== hora)) {
    r.enviado = false;
    r.enviadoEn = null;
  }

  try {
    const cambios = { recordatorios: [r] };
    if (clienteNuevo) cambios.clientes = [clienteNuevo];
    await guardarCambios(cambios);
    $('dialogo-recordatorio').close();
    redibujar();
    avisar(t('guardado'));
  } catch (error) {
    console.error(error);
    mostrarError(t('errorGuardar'));
  }
}

/* =========================================================
   7. CLIENTES, FICHA E HISTORIAL
   ========================================================= */

/** Recordatorios activos de hoy en adelante de un cliente. */
const proximosDeCliente = (id) => recordatoriosActivos().filter((r) => r.clienteId === id && r.fecha >= hoyTexto());

/** Botones de filtro por etiqueta (en Clientes). */
function dibujarFiltroEtiquetas() {
  const contenedor = $('filtro-etiquetas');
  contenedor.replaceChildren();
  const etiquetas = etiquetasActivas();
  contenedor.hidden = !etiquetas.length;
  [{ id: '', nombre: t('etiquetasTodas') }, ...etiquetas].forEach((e) => {
    const b = crear('button', 'ficha', e.id ? `🏷️ ${e.nombre}` : e.nombre);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(estado.filtroEtiqueta === e.id));
    b.addEventListener('click', () => { estado.filtroEtiqueta = e.id; dibujarClientes(); });
    contenedor.append(b);
  });
}

/** Chips de etiquetas de un cliente. */
function chipsEtiquetas(cliente) {
  const contenedor = crear('div', 'etiquetas');
  (cliente.etiquetaIds || []).map(etiquetaPorId).filter((e) => e && estaActivo(e))
    .forEach((e) => contenedor.append(crear('span', 'etiqueta', e.nombre)));
  return contenedor;
}

/** Dibuja la lista de clientes con buscador y filtro. */
function dibujarClientes() {
  dibujarFiltroEtiquetas();
  if (estado.filtroEtiqueta && !etiquetasActivas().some((e) => e.id === estado.filtroEtiqueta)) estado.filtroEtiqueta = '';
  const lista = $('lista-clientes');
  lista.replaceChildren();
  const todos = clientesActivos();
  const clientes = todos
    .filter((c) => !estado.filtroEtiqueta || (c.etiquetaIds || []).includes(estado.filtroEtiqueta))
    .filter((c) => clienteCoincide(c, estado.busqueda))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  $('titulo-clientes').textContent = clientes.length === 1 ? t('tituloClientesUno') : t('tituloClientes', { cantidad: clientes.length });
  if (!clientes.length) {
    lista.append(crear('p', 'vacio', t(todos.length ? 'vacioBusqueda' : 'vacioClientes')));
    return;
  }
  clientes.forEach((c) => {
    const fila = crear('button', 'cliente-fila');
    fila.type = 'button';
    const texto = crear('div', 'cliente-fila-texto');
    texto.append(crear('strong', '', c.nombre), crear('small', '', formatearTelefono(c.telefono, estado.compartidos.codigoPais)), chipsEtiquetas(c));
    fila.append(texto);
    const proximos = proximosDeCliente(c.id).length;
    if (proximos) fila.append(crear('span', 'contador-pendientes', t('pendientesCliente', { cantidad: proximos })));
    fila.addEventListener('click', () => abrirFicha(c.id));
    lista.append(fila);
  });
}

/** Abre la ficha de un cliente con su historial. */
function abrirFicha(id) {
  estado.clienteAbierto = id;
  mostrarVista('cliente');
}

function dibujarFicha() {
  const c = clientePorId(estado.clienteAbierto);
  if (!c || !estaActivo(c)) { mostrarVista('clientes'); return; }
  $('ficha-nombre').textContent = c.nombre;
  $('ficha-telefono').textContent = formatearTelefono(c.telefono, estado.compartidos.codigoPais);
  $('ficha-etiquetas').replaceChildren(...chipsEtiquetas(c).childNodes);
  $('ficha-nota').textContent = c.nota;
  $('ficha-nota').hidden = !c.nota;

  // Historial: lo más nuevo primero
  const historial = $('ficha-historial');
  historial.replaceChildren();
  const suyos = ordenarRecordatorios(recordatoriosActivos().filter((r) => r.clienteId === c.id)).reverse();
  if (!suyos.length) historial.append(crear('p', 'vacio', t('historialVacio')));
  suyos.forEach((r) => historial.append(crearTarjeta(r, { mostrarFecha: true })));
}

/** Abre el formulario de cliente. */
function abrirFormularioCliente(cliente = null) {
  estado.editandoClienteId = cliente ? cliente.id : null;
  estado.cliEtiquetaIds = cliente ? [...(cliente.etiquetaIds || [])] : [];
  estado.cliEtiquetasNuevas = [];
  $('cli-titulo').textContent = t(cliente ? 'tituloEditarCliente' : 'tituloNuevoCliente');
  $('cli-nombre').value = cliente ? cliente.nombre : '';
  $('cli-telefono').value = cliente ? '+' + cliente.telefono : '';
  $('cli-nota').value = cliente ? cliente.nota : '';
  $('cli-etiqueta-nueva').value = '';
  ['clinombre', 'clitelefono'].forEach((c) => marcarError(c, ''));
  actualizarNumeroFinal('cli-telefono', 'cli-numero-final');
  dibujarEtiquetasFormulario();
  $('dialogo-cliente').showModal();
  if (!cliente) $('cli-nombre').focus();
}

/** Etiquetas elegibles en el formulario de cliente (tocar = poner/quitar). */
function dibujarEtiquetasFormulario() {
  const contenedor = $('cli-etiquetas');
  contenedor.replaceChildren();
  const todas = [...etiquetasActivas(), ...estado.cliEtiquetasNuevas];
  todas.forEach((e) => {
    const b = crear('button', 'ficha', e.nombre);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(estado.cliEtiquetaIds.includes(e.id)));
    b.addEventListener('click', () => {
      estado.cliEtiquetaIds = estado.cliEtiquetaIds.includes(e.id)
        ? estado.cliEtiquetaIds.filter((x) => x !== e.id)
        : [...estado.cliEtiquetaIds, e.id];
      dibujarEtiquetasFormulario();
    });
    contenedor.append(b);
  });
}

/** Agrega una etiqueta escrita (si ya existe con ese nombre, usa la existente). */
function agregarEtiquetaEscrita() {
  const nombre = $('cli-etiqueta-nueva').value.trim().slice(0, 30);
  if (!nombre) return;
  const existente = [...etiquetasActivas(), ...estado.cliEtiquetasNuevas]
    .find((e) => paraBuscar(e.nombre) === paraBuscar(nombre));
  const etiqueta = existente || { id: nuevoId(), nombre };
  if (!existente) estado.cliEtiquetasNuevas.push(etiqueta);
  if (!estado.cliEtiquetaIds.includes(etiqueta.id)) estado.cliEtiquetaIds.push(etiqueta.id);
  $('cli-etiqueta-nueva').value = '';
  dibujarEtiquetasFormulario();
}

async function guardarFormularioCliente(evento) {
  evento.preventDefault();
  if ($('cli-etiqueta-nueva').value.trim()) agregarEtiquetaEscrita();
  const nombre = $('cli-nombre').value.trim();
  const telefono = normalizarTelefono($('cli-telefono').value, estado.compartidos.codigoPais);
  const repetido = clienteConTelefono(telefono, estado.editandoClienteId);
  marcarError('clinombre', nombre ? '' : t('errorNombre'));
  marcarError('clitelefono', !telefonoValido(telefono) ? t('errorTelefono')
    : repetido ? t('errorTelefonoRepetido', { nombre: repetido.nombre }) : '');
  if (!nombre || !telefonoValido(telefono) || repetido) return;

  const anterior = clientePorId(estado.editandoClienteId);
  const cliente = {
    ...(anterior || { id: nuevoId(), creadoEn: Date.now() }),
    nombre,
    telefono,
    nota: $('cli-nota').value.trim(),
    etiquetaIds: [...estado.cliEtiquetaIds]
  };
  const nuevasUsadas = estado.cliEtiquetasNuevas.filter((e) => cliente.etiquetaIds.includes(e.id));
  try {
    await guardarCambios({ clientes: [cliente], ...(nuevasUsadas.length ? { etiquetas: nuevasUsadas } : {}) });
    $('dialogo-cliente').close();
    redibujar();
    avisar(t('guardado'));
  } catch (error) {
    console.error(error);
    mostrarError(t('errorGuardar'));
  }
}

async function eliminarCliente() {
  const c = clientePorId(estado.clienteAbierto);
  if (!c) return;
  const suyos = recordatoriosActivos().filter((r) => r.clienteId === c.id);
  const seguro = await confirmar({
    titulo: t('confirmarEliminarClienteTitulo', { nombre: c.nombre }),
    texto: t('confirmarEliminarClienteTexto', { cantidad: suyos.length }),
    botonSi: t('siEliminar')
  });
  if (!seguro) return;
  try {
    await guardarCambios({ clientes: [c], recordatorios: suyos }, { borrar: true });
    mostrarVista('clientes');
    avisar(t('eliminado'));
  } catch (error) {
    console.error(error);
    mostrarError(t('errorGuardar'));
  }
}

/* =========================================================
   7b. SERVICIOS Y PRODUCTOS (lista preestablecida)
   Se eligen con un toque al crear un recordatorio. Si tienen precio,
   en un cobro se suma solo al monto. Se sincronizan como los clientes.
   ========================================================= */
const productosActivos = () => estado.productos.filter(estaActivo)
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

/** Lista de productos en Ajustes (tocar = editar; × = eliminar). */
function dibujarProductos() {
  const lista = $('lista-productos');
  lista.replaceChildren();
  const productos = productosActivos();
  if (!productos.length) lista.append(crear('p', 'ayuda', t('productosVacio')));
  productos.forEach((x) => {
    const fila = crear('div', 'cliente-fila cliente-fila-estatica');
    const texto = crear('button', 'cliente-fila-texto enlace-fila');
    texto.type = 'button';
    texto.append(crear('strong', '', x.nombre));
    if (x.precio != null) texto.append(crear('small', 'producto-precio', monto(x.precio)));
    texto.addEventListener('click', () => {
      estado.editandoProductoId = x.id;
      $('producto-nombre').value = x.nombre;
      $('producto-precio').value = x.precio != null ? formatearMonto(x.precio, '', idiomaMontos()) : '';
      $('producto-agregar').textContent = t('guardarCambio');
      $('producto-nombre').focus();
    });
    const quitar = crear('button', 'boton boton-fantasma-peligro boton-chico', '×');
    quitar.type = 'button';
    quitar.setAttribute('aria-label', t('eliminar'));
    quitar.addEventListener('click', () => eliminarProducto(x));
    fila.append(texto, quitar);
    lista.append(fila);
  });
}

/** Agrega un producto nuevo o guarda el que se está editando. */
async function guardarProducto() {
  const nombre = $('producto-nombre').value.trim().slice(0, 80);
  if (!nombre) { avisar(t('errorProducto')); $('producto-nombre').focus(); return; }
  const repetido = productosActivos().find((x) => paraBuscar(x.nombre) === paraBuscar(nombre) && x.id !== estado.editandoProductoId);
  if (repetido) { avisar(t('productoRepetido')); return; }
  const textoPrecio = $('producto-precio').value.trim();
  const precio = textoPrecio ? leerMonto(textoPrecio, idiomaMontos()) : null;
  const anterior = estado.productos.find((x) => x.id === estado.editandoProductoId);
  try {
    await guardarCambios({ productos: [{ ...(anterior || { id: nuevoId() }), nombre, precio }] });
    estado.editandoProductoId = null;
    $('producto-nombre').value = '';
    $('producto-precio').value = '';
    $('producto-agregar').textContent = t('agregar');
    dibujarProductos();
    avisar(t('guardado'));
  } catch (error) {
    console.error(error);
    mostrarError(t('errorGuardar'));
  }
}

async function eliminarProducto(x) {
  const seguro = await confirmar({ titulo: t('confirmarEliminarProducto', { nombre: x.nombre }), texto: t('productoEliminarTexto'), botonSi: t('siEliminar') });
  if (!seguro) return;
  await guardarCambios({ productos: [x] }, { borrar: true });
  dibujarProductos();
}

/** Partes del campo "detalle", separadas por coma. */
const partesDetalle = () => $('rec-detalle').value.split(',').map((x) => x.trim()).filter(Boolean);

/** Botones de productos dentro del formulario de recordatorio. */
function dibujarProductosFormulario() {
  const productos = productosActivos();
  const contenedor = $('rec-productos');
  contenedor.replaceChildren();
  contenedor.hidden = !productos.length;
  const elegidos = partesDetalle().map(paraBuscar);
  productos.forEach((x) => {
    const texto = x.precio != null && estado.recTipo === 'cobro' ? `${x.nombre} · ${monto(x.precio)}` : x.nombre;
    const b = crear('button', 'ficha', texto);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(elegidos.includes(paraBuscar(x.nombre))));
    b.addEventListener('click', () => alTocarProducto(x));
    contenedor.append(b);
  });
  $('sugerencias-productos').replaceChildren(...productos.map((x) => new Option(x.nombre)));
}

/**
 * Tocar un producto lo agrega al detalle (o lo quita si ya estaba).
 * En un cobro, su precio se suma (o se resta) del monto.
 */
function alTocarProducto(x) {
  const partes = partesDetalle();
  const i = partes.findIndex((p) => paraBuscar(p) === paraBuscar(x.nombre));
  const agregar = i < 0;
  if (agregar) partes.push(x.nombre); else partes.splice(i, 1);
  $('rec-detalle').value = partes.join(', ');
  if (estado.recTipo === 'cobro' && x.precio != null) {
    const actual = leerMonto($('rec-monto').value, idiomaMontos()) || 0;
    const nuevo = Math.max(0, actual + (agregar ? x.precio : -x.precio));
    $('rec-monto').value = nuevo ? formatearMonto(nuevo, '', idiomaMontos()) : '';
  }
  dibujarProductosFormulario();
}

/* =========================================================
   8. ENVÍO A WHATSAPP Y ESTADOS DE RESPUESTA
   La app NO envía mensajes sola: abre WhatsApp con el mensaje
   escrito y la persona toca "enviar" (regla 4 de CLAUDE.md).
   ========================================================= */

/** Nombre fijo de la pestaña de WhatsApp Web: así se reusa siempre la misma. */
const PESTANA_WHATSAPP = 'tucankit-whatsapp';

/**
 * Abre WhatsApp con el mensaje ya escrito.
 *  - Celular: enlace wa.me (abre la app).
 *  - Computadora: WhatsApp Web en la misma pestaña, o la app de escritorio (según Ajustes).
 */
function abrirWhatsApp(numero, mensaje) {
  const celular = TucankitCore.esCelular(navigator.userAgent, navigator.platform, navigator.maxTouchPoints);
  if (celular || estado.locales.whatsappComputadora === 'app') {
    window.open(enlaceWhatsApp(numero, mensaje, 'app'), '_blank', 'noopener');
    return;
  }
  // Sin "noopener": es lo que permite que el navegador reuse la pestaña con este nombre
  const pestana = window.open(enlaceWhatsApp(numero, mensaje, 'web'), PESTANA_WHATSAPP);
  if (pestana) pestana.focus();
}

/** Datos para reemplazar en el mensaje. */
function datosParaMensaje(r, cliente) {
  const a = estado.compartidos;
  return {
    nombre: cliente.nombre,
    servicio: r.detalle || t('servicioGenerico'),
    detalle: r.detalle,
    fecha: fechaAmigable(r.fecha),
    hora: r.hora ? horaAmigable(r.hora) : '',
    monto: monto(r.monto),
    pago: r.pago || a.pagoHabitual || t('pagoGenerico'),
    negocio: a.negocio || t('negocioGenerico'),
    atiende: a.atiende,
    direccion: a.direccion
  };
}

/** Firma y enlaces de respuesta según Ajustes. */
const firmaActual = () => (estado.compartidos.firmaActiva ? estado.compartidos.firma : '');
const enlacesActuales = (tipo, datos) => (estado.compartidos.enlacesRespuesta
  ? textoEnlacesRespuesta(tipo, estado.compartidos.telefonoNegocio, datos) : '');

/** Arma el mensaje completo de un recordatorio. */
function mensajeDe(r, cliente) {
  const datos = datosParaMensaje(r, cliente);
  return armarMensaje(estado.compartidos['plantilla_' + r.tipo], datos, firmaActual(), enlacesActuales(r.tipo, datos));
}

function enviarRecordatorio(r) {
  const cliente = clientePorId(r.clienteId);
  if (!cliente) return;
  // Se abre primero (antes de cualquier espera) para que el navegador no lo bloquee
  abrirWhatsApp(cliente.telefono, mensajeDe(r, cliente));
  marcarEnviado(r, true);
}

async function marcarEnviado(r, enviado) {
  try {
    await guardarCambios({ recordatorios: [{ ...r, enviado, enviadoEn: enviado ? Date.now() : null }] });
    redibujar();
    avisar(t(enviado ? 'recordatorioMarcado' : 'recordatorioDesmarcado'));
  } catch (error) {
    console.error(error);
    mostrarError(t('errorGuardar'));
  }
}

/** Marca (o quita, si ya estaba) la respuesta del cliente. */
async function marcarRespuesta(r, respuesta) {
  const nueva = r.respuesta === respuesta ? '' : respuesta;
  try {
    await guardarCambios({ recordatorios: [{ ...r, respuesta: nueva, respuestaEn: nueva ? Date.now() : null }] });
    redibujar();
  } catch (error) {
    console.error(error);
    mostrarError(t('errorGuardar'));
  }
}

/* =========================================================
   9. ENVÍO EN FILA A UN GRUPO
   WhatsApp gratis no permite enviar a muchos a la vez: la app
   prepara cada mensaje y la persona toca enviar uno por uno.
   El avance se guarda en este dispositivo.
   ========================================================= */

/** Clientes del grupo elegido ("*" = todos; si no, un id de etiqueta). */
function clientesDelGrupo(grupo) {
  if (!grupo) return [];
  return clientesActivos()
    .filter((c) => grupo === '*' || (c.etiquetaIds || []).includes(grupo))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

/** Mensaje de grupo para un cliente. */
function mensajeDeGrupo(cliente) {
  const a = estado.compartidos;
  const datos = { nombre: cliente.nombre, negocio: a.negocio || t('negocioGenerico'), atiende: a.atiende, direccion: a.direccion };
  return armarMensaje(estado.locales.envioGrupo.mensaje, datos, firmaActual());
}

function dibujarGrupos() {
  const g = estado.locales.envioGrupo;
  // 1. Elegir grupo
  const elegir = $('grupo-etiquetas');
  elegir.replaceChildren();
  [{ id: '*', nombre: t('grupoTodos') }, ...etiquetasActivas()].forEach((e) => {
    const b = crear('button', 'ficha', e.id === '*' ? e.nombre : `🏷️ ${e.nombre}`);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(g.grupo === e.id));
    b.addEventListener('click', () => cambiarGrupo(e.id));
    elegir.append(b);
  });

  // 2. Mensaje y vista previa
  if (document.activeElement !== $('grupo-mensaje')) $('grupo-mensaje').value = g.mensaje;
  const clientes = clientesDelGrupo(g.grupo);
  const ejemplo = clientes[0] || { nombre: t('ejemploNombreCliente') };
  $('grupo-vista-previa').textContent = mensajeDeGrupo(ejemplo);

  // 3. Avance
  const enviados = clientes.filter((c) => g.enviados.includes(c.id)).length;
  const siguiente = clientes.find((c) => !g.enviados.includes(c.id));
  const boton = $('grupo-siguiente');
  if (!g.grupo) {
    $('grupo-progreso').textContent = t('grupoElegir');
    boton.hidden = true;
  } else if (!clientes.length) {
    $('grupo-progreso').textContent = t('grupoVacio');
    boton.hidden = true;
  } else {
    $('grupo-progreso').textContent = siguiente ? t('grupoProgreso', { enviados, total: clientes.length }) : t('grupoListo', { total: clientes.length });
    boton.hidden = !siguiente;
    if (siguiente) boton.textContent = t('grupoEnviarA', { nombre: siguiente.nombre, numero: enviados + 1, total: clientes.length });
  }
  $('grupo-reiniciar').hidden = !enviados;

  // Lista con el estado de cada uno
  const lista = $('grupo-lista');
  lista.replaceChildren();
  clientes.forEach((c) => {
    const fila = crear('div', 'cliente-fila cliente-fila-estatica');
    const texto = crear('div', 'cliente-fila-texto');
    texto.append(crear('strong', '', c.nombre), crear('small', '', formatearTelefono(c.telefono, estado.compartidos.codigoPais)));
    fila.append(texto);
    if (g.enviados.includes(c.id)) {
      fila.append(crear('span', 'grupo-hecho', t('grupoEnviado')));
    } else {
      const b = crear('button', 'boton boton-secundario boton-chico', t('grupoEnviar'));
      b.type = 'button';
      b.addEventListener('click', () => enviarAGrupo(c));
      fila.append(b);
    }
    lista.append(fila);
  });
}

async function cambiarGrupo(grupo) {
  // Cambiar de grupo empieza la fila de nuevo
  await guardarLocales({ envioGrupo: { ...estado.locales.envioGrupo, grupo, enviados: [] } });
  dibujarGrupos();
}

/** Envía al cliente indicado (un toque = un mensaje) y lo marca como hecho. */
function enviarAGrupo(cliente) {
  if (!estado.locales.envioGrupo.mensaje.trim()) { avisar(t('grupoErrorMensaje')); return; }
  abrirWhatsApp(cliente.telefono, mensajeDeGrupo(cliente));
  const g = estado.locales.envioGrupo;
  guardarLocales({ envioGrupo: { ...g, enviados: [...g.enviados, cliente.id] } })
    .then(dibujarGrupos)
    .catch((error) => { console.error(error); mostrarError(t('errorGuardar')); });
}

function enviarSiguienteDelGrupo() {
  const g = estado.locales.envioGrupo;
  const siguiente = clientesDelGrupo(g.grupo).find((c) => !g.enviados.includes(c.id));
  if (siguiente) enviarAGrupo(siguiente);
}

/* =========================================================
   10. AJUSTES, PLANTILLAS Y CONSTRUCTOR CON CLICS
   ========================================================= */

/** Cambia de pantalla. */
function mostrarVista(vista) {
  if (vista === 'ajustes' && estado.vista !== 'ajustes') estado.vistaAnterior = estado.vista;
  estado.vista = vista;
  ['agenda', 'clientes', 'cliente', 'grupos', 'ajustes'].forEach((v) => { $('vista-' + v).hidden = v !== vista; });
  document.querySelectorAll('.navegacion button').forEach((b) => {
    const activa = b.dataset.vista === vista || (vista === 'cliente' && b.dataset.vista === 'clientes');
    b.setAttribute('aria-current', activa ? 'page' : 'false');
  });
  $('btn-ajustes').hidden = vista === 'ajustes';
  const flotante = $('btn-nueva');
  flotante.hidden = !['agenda', 'clientes'].includes(vista);
  flotante.textContent = t(vista === 'clientes' ? 'nuevoCliente' : 'nuevoRecordatorio');
  if (vista === 'ajustes') cargarFormularioAjustes();
  redibujar();
  window.scrollTo(0, 0);
}

/** Redibuja la pantalla que está a la vista. */
function redibujar() {
  if (estado.vista === 'agenda') dibujarAgenda();
  else if (estado.vista === 'clientes') dibujarClientes();
  else if (estado.vista === 'cliente') dibujarFicha();
  else if (estado.vista === 'grupos') dibujarGrupos();
  else if (estado.vista === 'ajustes') { dibujarCopiasAuto(); dibujarProductos(); }
  revisarAvisos();
}

/** Pone los ajustes guardados en los campos de la pantalla de Ajustes. */
function cargarFormularioAjustes() {
  const a = estado.compartidos;
  $('aj-negocio').value = a.negocio;
  $('aj-atiende').value = a.atiende;
  $('aj-direccion').value = a.direccion;
  $('aj-pais').value = a.pais;
  $('aj-codigo').value = a.codigoPais;
  $('campo-codigo').hidden = a.pais !== 'OTRO';
  $('aj-moneda').value = a.moneda;
  $('aj-pago').value = a.pagoHabitual;
  $('aj-whatsapp-computadora').value = estado.locales.whatsappComputadora;
  $('aj-enlaces').checked = a.enlacesRespuesta;
  $('aj-telnegocio').value = a.telefonoNegocio ? '+' + a.telefonoNegocio : '';
  $('aj-firma-activa').checked = a.firmaActiva;
  $('aj-firma').value = a.firma;
  $('aj-dispositivo').value = estado.locales.nombreDispositivo;
  marcarAjustesSinGuardar(false);
  estado.editorPlantillas = {};
  estado.editorOpciones = {};
  TIPOS.forEach((tipo) => {
    estado.editorPlantillas[tipo] = a['plantilla_' + tipo];
    estado.editorOpciones[tipo] = { ...a['opciones_' + tipo] };
  });
  ['codigo', 'plantilla', 'telnegocio'].forEach((c) => marcarError(c, ''));
  actualizarNumeroFinal('aj-telnegocio', 'aj-telnegocio-final');
  dibujarEditorPlantilla();
  mostrarUltimaCopia();
  dibujarCopiasAuto();
  estado.editandoProductoId = null;
  $('producto-agregar').textContent = t('agregar');
  dibujarProductos();
}

/** Lista de países para elegir (con bandera y código). */
function llenarPaises() {
  const lista = $('aj-pais');
  const opciones = TucankitCore.PAISES.map((p) => new Option(`${TucankitCore.bandera(p.codigo)} ${p.nombre} (+${p.prefijo})`, p.codigo));
  opciones.push(new Option(t('paisOtro'), 'OTRO'));
  lista.replaceChildren(...opciones);
}

/** Al elegir otro país: se ajustan el código telefónico y la moneda. */
function alCambiarPais() {
  const pais = TucankitCore.paisPorCodigo($('aj-pais').value);
  $('campo-codigo').hidden = Boolean(pais);
  if (pais) {
    $('aj-codigo').value = pais.prefijo;
    $('aj-moneda').value = pais.moneda;
  }
  actualizarNumeroFinal('aj-telnegocio', 'aj-telnegocio-final', $('aj-codigo').value.trim());
  actualizarVistaPrevia();
}

/** Muestra si hay cambios sin guardar en Ajustes. */
function marcarAjustesSinGuardar(hay) {
  estado.ajustesSinGuardar = hay;
  $('barra-guardar').classList.toggle('sin-guardar', hay);
  $('ajustes-estado-guardado').textContent = t(hay ? 'ajustesConCambios' : 'ajustesSinCambios');
}

/**
 * Cambia de pantalla, pero si se sale de Ajustes con cambios sin guardar,
 * pregunta antes: Guardar / Salir sin guardar / Cancelar.
 */
async function irA(vista) {
  if (estado.vista === 'ajustes' && vista !== 'ajustes' && estado.ajustesSinGuardar) {
    const eleccion = await confirmar({
      titulo: t('salirSinGuardarTitulo'), texto: t('salirSinGuardarTexto'),
      botonSi: t('guardarYSalir'), botonAlt: t('salirSinGuardar'), peligroso: false
    });
    if (!eleccion) return;
    if (eleccion === true && !(await guardarAjustes())) return;
    marcarAjustesSinGuardar(false);
  }
  mostrarVista(vista);
}

/** Opciones de las listas del constructor (saludo y despedida). */
function llenarOpcionesConstructor() {
  const piezas = TucankitCore.IDIOMAS[IDIOMA].constructor;
  const saludo = $('con-saludo');
  saludo.replaceChildren(...piezas.saludos.map((s, i) => new Option(s.replace('{nombre}', t('ejemploNombreCliente')), String(i))));
  const cierre = $('con-cierre');
  cierre.replaceChildren(...piezas.cierres.map((c, i) => new Option(c || t('sinCierre'), String(i))));
}

/** Dibuja el editor de la plantilla del tipo elegido. */
function dibujarEditorPlantilla() {
  const tipo = estado.editorTipo;
  const o = estado.editorOpciones[tipo];

  // Tipos
  const tipos = $('plantilla-tipos');
  tipos.replaceChildren();
  TIPOS.forEach((x) => {
    const b = crear('button', 'ficha', `${ICONOS[x]} ${t('tipo_' + x)}`);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(x === tipo));
    b.addEventListener('click', () => {
      estado.editorPlantillas[estado.editorTipo] = $('aj-plantilla').value;
      estado.editorTipo = x;
      dibujarEditorPlantilla();
    });
    tipos.append(b);
  });

  // Constructor
  $('con-saludo').value = String(o.saludo);
  $('con-cierre').value = String(o.cierre);
  document.querySelectorAll('.segmentado [data-trato]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.trato === o.trato)));
  $('con-confirmar').checked = o.confirmar;
  $('con-direccion').checked = o.direccion;

  // Texto y palabras
  $('aj-plantilla').value = estado.editorPlantillas[tipo];
  const variables = $('variables');
  variables.replaceChildren();
  variablesDeTipo(tipo).forEach((nombre) => {
    const b = crear('button', 'variable', `{${nombre}}`);
    b.type = 'button';
    b.addEventListener('click', () => insertarVariable($('aj-plantilla'), nombre, actualizarVistaPrevia));
    variables.append(b);
  });
  actualizarVistaPrevia();
}

/** Cuando se toca una opción del constructor, se rearma el texto. */
function alCambiarConstructor(cambio) {
  const tipo = estado.editorTipo;
  estado.editorOpciones[tipo] = { ...estado.editorOpciones[tipo], ...cambio };
  estado.editorPlantillas[tipo] = construirPlantilla(tipo, estado.editorOpciones[tipo]);
  dibujarEditorPlantilla();
}

/** Inserta una palabra como {nombre} donde está el cursor. */
function insertarVariable(campo, nombre, despues) {
  const inicio = campo.selectionStart ?? campo.value.length;
  const fin = campo.selectionEnd ?? campo.value.length;
  campo.setRangeText(`{${nombre}}`, inicio, fin, 'end');
  campo.focus();
  despues();
}

/** Vista previa del mensaje del tipo elegido, con datos de ejemplo. */
function actualizarVistaPrevia() {
  const tipo = estado.editorTipo;
  const texto = $('aj-plantilla').value;
  estado.editorPlantillas[tipo] = texto;
  $('plantilla-editada').hidden = texto === construirPlantilla(tipo, estado.editorOpciones[tipo]);
  const datos = {
    nombre: t('ejemploNombreCliente'),
    servicio: t('ejemploServicio'),
    detalle: t('ejemploDetalle'),
    fecha: fechaAmigable(mananaTexto()),
    hora: horaAmigable('15:30'),
    monto: formatearMonto(15000, $('aj-moneda').value.trim() || '$', idiomaMontos($('aj-pais').value)),
    pago: $('aj-pago').value.trim() || t('pagoGenerico'),
    negocio: $('aj-negocio').value.trim() || t('negocioGenerico'),
    atiende: $('aj-atiende').value.trim(),
    direccion: $('aj-direccion').value.trim()
  };
  const firma = $('aj-firma-activa').checked ? $('aj-firma').value : '';
  const telNegocio = normalizarTelefono($('aj-telnegocio').value, $('aj-codigo').value.trim());
  const enlaces = $('aj-enlaces').checked && telefonoValido(telNegocio) ? textoEnlacesRespuesta(tipo, telNegocio, datos) : '';
  $('vista-previa-texto').textContent = armarMensaje(texto, datos, firma, enlaces);
}

async function guardarAjustes(evento) {
  if (evento) evento.preventDefault();
  estado.editorPlantillas[estado.editorTipo] = $('aj-plantilla').value;
  const codigo = $('aj-codigo').value.trim();
  const telNegocio = normalizarTelefono($('aj-telnegocio').value, codigo);
  const enlaces = $('aj-enlaces').checked;
  const vacia = TIPOS.find((tipo) => !estado.editorPlantillas[tipo].trim());

  const errorCodigo = /^\d{1,4}$/.test(codigo) ? '' : t('errorCodigoPais');
  const errorTel = $('aj-telnegocio').value.trim() && !telefonoValido(telNegocio) ? t('errorTelefono')
    : enlaces && !telefonoValido(telNegocio) ? t('errorTelefonoNegocio') : '';
  marcarError('codigo', errorCodigo);
  marcarError('telnegocio', errorTel);
  marcarError('plantilla', vacia ? t('errorPlantilla') : '');
  if (vacia) { estado.editorTipo = vacia; dibujarEditorPlantilla(); marcarError('plantilla', t('errorPlantilla')); }
  if (errorCodigo || errorTel || vacia) {
    (errorCodigo ? $('aj-codigo') : errorTel ? $('aj-telnegocio') : $('aj-plantilla')).focus();
    return false;
  }

  const nuevos = {
    ...estado.compartidos,
    negocio: $('aj-negocio').value.trim(),
    atiende: $('aj-atiende').value.trim(),
    direccion: $('aj-direccion').value.trim(),
    pais: $('aj-pais').value,
    codigoPais: codigo,
    moneda: $('aj-moneda').value.trim() || '₡',
    pagoHabitual: $('aj-pago').value.trim(),
    telefonoNegocio: telefonoValido(telNegocio) ? telNegocio : '',
    enlacesRespuesta: enlaces,
    firmaActiva: $('aj-firma-activa').checked,
    firma: $('aj-firma').value.trim()
  };
  TIPOS.forEach((tipo) => {
    nuevos['plantilla_' + tipo] = estado.editorPlantillas[tipo].trim();
    nuevos['opciones_' + tipo] = { ...estado.editorOpciones[tipo] };
  });
  try {
    await guardarCompartidos(nuevos);
    await guardarLocales({
      whatsappComputadora: $('aj-whatsapp-computadora').value === 'app' ? 'app' : 'web',
      nombreDispositivo: $('aj-dispositivo').value.trim()
    });
    marcarAjustesSinGuardar(false);
    avisar(t('ajustesGuardados'));
    return true;
  } catch (error) {
    console.error(error);
    mostrarError(t('errorGuardar'));
  }
}

/* =========================================================
   11. COPIAS DE SEGURIDAD, COPIAS AUTOMÁTICAS Y BORRAR TODO
   Formato del archivo de copia:
     versión 1 (app v1): { app, version: 1, citas, ajustes }
     versión 2 (actual): { app, version: 2, creada, dispositivo, datos: { clientes,
                           recordatorios, etiquetas, ajustes } }
   Se aceptan ambas.
   ========================================================= */
const COPIA_APP = 'tucankit-citas';
const COPIA_VERSION = 2;
const DIAS_AVISO_COPIA = 7;
let avisoCopiaCerrado = false;

/** Datos actuales listos para guardar en un archivo, QR o Drive. */
function paqueteDatos() {
  return {
    app: COPIA_APP,
    version: COPIA_VERSION,
    creada: Date.now(),
    dispositivo: { id: idDispositivo(), nombre: estado.locales.nombreDispositivo },
    datos: {
      clientes: estado.clientes,
      recordatorios: estado.recordatorios,
      etiquetas: estado.etiquetas,
      productos: estado.productos,
      ajustes: estado.compartidos
    }
  };
}

function mostrarUltimaCopia() {
  const ultima = estado.locales.ultimaCopia;
  $('copia-ultima').textContent = ultima ? t('copiaUltima', { momento: momentoAmigable(ultima) }) : t('copiaNunca');
}

async function descargarCopia() {
  const archivo = new Blob([JSON.stringify(paqueteDatos(), null, 2)], { type: 'application/json' });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(archivo);
  enlace.download = `tucankit-citas-copia-${hoyTexto()}.json`;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 10000);
  try { await guardarLocales({ ultimaCopia: Date.now() }); } catch (error) { console.error(error); }
  mostrarUltimaCopia();
  revisarAvisos();
  avisar(t('copiaDescargada'));
}

const textoO = (v, porDefecto = '') => (typeof v === 'string' ? v : porDefecto);
const numeroO = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Campos de sincronización de un registro (los inventa si faltan). */
function metaDe(x, dispositivoId, ahora) {
  return {
    actualizadoEn: numeroO(x.actualizadoEn) || ahora,
    dispositivoId: textoO(x.dispositivoId) || dispositivoId,
    borradoEn: numeroO(x.borradoEn)
  };
}

/**
 * Revisa un paquete de datos (de un archivo, un QR o Drive).
 * Devuelve { clientes, recordatorios, etiquetas, ajustes, creada } limpios
 * o lanza un error si algo está mal. Solo se toman los campos conocidos.
 */
function validarPaquete(paquete) {
  if (!paquete || typeof paquete !== 'object' || paquete.app !== COPIA_APP) throw new Error('No es de Tucankit Citas');
  const ahora = Date.now();
  const disp = paquete.dispositivo && typeof paquete.dispositivo.id === 'string' ? paquete.dispositivo.id : 'copia';

  // Versión 1: lista de citas → se reorganiza igual que al actualizar la app
  if (paquete.version === 1) {
    if (!Array.isArray(paquete.citas)) throw new Error('Faltan las citas');
    paquete.citas.forEach((c, i) => {
      const valida = c && typeof c.id === 'string' && typeof c.nombre === 'string' && c.nombre.trim()
        && typeof c.telefono === 'string' && telefonoValido(c.telefono)
        && FORMATO_FECHA.test(String(c.fecha)) && FORMATO_HORA.test(String(c.hora));
      if (!valida) throw new Error(`Cita ${i + 1} incompleta`);
    });
    // Se fechan con el día de la copia (no "ahora") para que, al mezclar, no le ganen a cambios más nuevos
    const m = migrarDesdeV1(paquete.citas, paquete.ajustes || {}, idDispositivo(), numeroO(paquete.creada) || 1);
    return { clientes: m.clientes, recordatorios: m.recordatorios, etiquetas: [], productos: [], ajustes: m.compartidos, creada: numeroO(paquete.creada) };
  }

  if (paquete.version !== 2 || !paquete.datos || typeof paquete.datos !== 'object') throw new Error('Versión desconocida');
  const d = paquete.datos;
  ['clientes', 'recordatorios', 'etiquetas'].forEach((k) => { if (!Array.isArray(d[k])) throw new Error(`Faltan ${k}`); });

  // Productos: las copias anteriores no los tienen (lista vacía)
  const productos = (Array.isArray(d.productos) ? d.productos : []).map((x, i) => {
    if (!x || typeof x.id !== 'string' || typeof x.nombre !== 'string') throw new Error(`Producto ${i + 1} incompleto`);
    return { id: x.id, nombre: x.nombre.trim().slice(0, 80), precio: numeroO(x.precio), ...metaDe(x, disp, ahora) };
  });
  const etiquetas = d.etiquetas.map((e, i) => {
    if (!e || typeof e.id !== 'string' || typeof e.nombre !== 'string') throw new Error(`Etiqueta ${i + 1} incompleta`);
    return { id: e.id, nombre: e.nombre.trim().slice(0, 30), ...metaDe(e, disp, ahora) };
  });
  const clientes = d.clientes.map((c, i) => {
    const valido = c && typeof c.id === 'string' && typeof c.nombre === 'string'
      && typeof c.telefono === 'string' && (telefonoValido(c.telefono) || c.borradoEn);
    if (!valido) throw new Error(`Cliente ${i + 1} incompleto`);
    return {
      id: c.id, nombre: c.nombre.trim(), telefono: c.telefono, nota: textoO(c.nota),
      etiquetaIds: Array.isArray(c.etiquetaIds) ? c.etiquetaIds.filter((x) => typeof x === 'string') : [],
      creadoEn: numeroO(c.creadoEn) || ahora, ...metaDe(c, disp, ahora)
    };
  });
  const respuestasValidas = ['', 'confirmo', 'cancelo', 'pago', 'respondio'];
  const recordatorios = d.recordatorios.map((r, i) => {
    const valido = r && typeof r.id === 'string' && TIPOS.includes(r.tipo) && typeof r.clienteId === 'string'
      && FORMATO_FECHA.test(String(r.fecha)) && (r.hora === '' || FORMATO_HORA.test(String(r.hora)));
    if (!valido) throw new Error(`Recordatorio ${i + 1} incompleto`);
    return {
      id: r.id, tipo: r.tipo, clienteId: r.clienteId, fecha: r.fecha, hora: r.hora,
      detalle: textoO(r.detalle), monto: numeroO(r.monto), pago: textoO(r.pago), nota: textoO(r.nota),
      enviado: r.enviado === true, enviadoEn: r.enviado === true ? (numeroO(r.enviadoEn) || ahora) : null,
      respuesta: respuestasValidas.includes(r.respuesta) ? r.respuesta : '', respuestaEn: numeroO(r.respuestaEn),
      creadoEn: numeroO(r.creadoEn) || ahora, ...metaDe(r, disp, ahora)
    };
  });
  return { clientes, recordatorios, etiquetas, productos, ajustes: normalizarCompartidos(d.ajustes || {}), creada: numeroO(paquete.creada) };
}

/** Guarda una copia automática de los datos actuales (se conservan las últimas 5). */
async function guardarCopiaAuto(motivo) {
  const ahora = Date.now();
  const tx = bd.transaction('copiasAuto', 'readwrite');
  const cajon = tx.objectStore('copiasAuto');
  cajon.put({
    id: ahora, creadaEn: ahora, motivo, formato: COPIA_VERSION,
    datos: paqueteDatos(), cantidad: recordatoriosActivos().length
  });
  const claves = await esperarPedido(cajon.getAllKeys());
  claves.sort((a, b) => a - b).slice(0, Math.max(0, claves.length - MAX_COPIAS_AUTO)).forEach((k) => cajon.delete(k));
  await esperarTransaccion(tx);
}

/**
 * Aplica datos que llegaron de afuera (copia, QR o Drive) con la mezcla segura:
 * registro por registro gana el más reciente. Antes guarda una copia automática.
 * Devuelve el resumen de cambios.
 */
async function aplicarMezcla(remoto, motivo) {
  await guardarCopiaAuto(motivo);
  const local = { ...datosLocalesParaMezcla() };
  const remotoLimpio = { ...remoto, ajustes: remoto.ajustes };
  const { datos, resumen } = mezclarDatos(local, remotoLimpio, CLAVES_COMPARTIDAS);
  const compartidos = normalizarCompartidos(datos.ajustes);
  await escribirDatosBD({ ...datos, compartidos });
  TucankitCore.COLECCIONES.forEach((k) => { estado[k] = datos[k]; });
  estado.compartidos = compartidos;
  return resumen;
}

/**
 * Impone un conjunto de datos (al "Reemplazar todo" o "Volver a una copia"):
 * lo que está en la copia se marca como cambio nuevo, y lo que no está se
 * marca como borrado. Así, si hay sincronización, se aplica en todos los
 * dispositivos. Antes guarda una copia automática.
 */
async function imponerDatos(objetivo, motivo) {
  await guardarCopiaAuto(motivo);
  const ahora = Date.now();
  const disp = idDispositivo();
  const resumen = { agregados: 0, actualizados: 0, borrados: 0 };
  const resultado = {};
  TucankitCore.COLECCIONES.forEach((k) => {
    const actuales = new Map(estado[k].map((r) => [r.id, r]));
    const nuevos = new Map((objetivo[k] || []).map((r) => [r.id, { ...r, actualizadoEn: ahora, dispositivoId: disp }]));
    nuevos.forEach((r, id) => {
      const antes = actuales.get(id);
      if (!antes || !estaActivo(antes)) { if (estaActivo(r)) resumen.agregados += 1; } else if (!estaActivo(r)) resumen.borrados += 1;
      else if (JSON.stringify({ ...antes, actualizadoEn: 0, dispositivoId: '' }) !== JSON.stringify({ ...r, actualizadoEn: 0, dispositivoId: '' })) resumen.actualizados += 1;
    });
    actuales.forEach((r, id) => {
      if (!nuevos.has(id)) {
        if (estaActivo(r)) resumen.borrados += 1;
        nuevos.set(id, estaActivo(r) ? marcarBorrado(r, disp, ahora) : r);
      }
    });
    resultado[k] = [...nuevos.values()];
  });
  const compartidos = normalizarCompartidos(objetivo.ajustes || {});
  CLAVES_COMPARTIDAS.forEach((k) => { compartidos._sello[k] = { actualizadoEn: ahora, dispositivoId: disp }; });
  await escribirDatosBD({ ...resultado, compartidos });
  Object.assign(estado, { ...resultado, compartidos });
  alCambiarDatos();
  return resumen;
}

/**
 * Prepara una copia de seguridad para "Mezclar": quien restaura quiere recuperar.
 *  - Lo borrado aquí que en la copia está vivo, vuelve (se marca como cambio nuevo).
 *  - Los ajustes que aquí están vacíos o como de fábrica se completan con los de la copia.
 * Todo lo demás se mezcla con la regla normal (gana lo más reciente).
 */
function prepararCopiaParaRecuperar(copia) {
  const ahora = Date.now();
  const resultado = { ...copia };
  TucankitCore.COLECCIONES.forEach((k) => {
    const locales = new Map(estado[k].map((r) => [r.id, r]));
    resultado[k] = (copia[k] || []).map((r) => {
      const local = locales.get(r.id);
      return local && !estaActivo(local) && estaActivo(r) ? { ...r, actualizadoEn: ahora, dispositivoId: idDispositivo() } : r;
    });
  });
  const fabrica = compartidosPorDefecto();
  const ajustes = { ...copia.ajustes, _sello: { ...(copia.ajustes._sello || {}) } };
  CLAVES_COMPARTIDAS.forEach((k) => {
    const localDeFabrica = JSON.stringify(estado.compartidos[k]) === JSON.stringify(fabrica[k]);
    const copiaDistinta = JSON.stringify(copia.ajustes[k]) !== JSON.stringify(fabrica[k]);
    if (localDeFabrica && copiaDistinta) ajustes._sello[k] = { actualizadoEn: ahora, dispositivoId: idDispositivo() };
  });
  resultado.ajustes = ajustes;
  return resultado;
}

/** Cuando la persona elige un archivo de copia. */
async function restaurarCopia(evento) {
  const entrada = evento.target;
  const archivo = entrada.files && entrada.files[0];
  entrada.value = '';
  if (!archivo) return;

  let copia;
  try {
    copia = validarPaquete(JSON.parse(await archivo.text()));
  } catch (error) {
    console.warn('Copia rechazada:', error.message);
    await confirmar({ titulo: t('restaurarCopia'), texto: t('errorArchivo'), botonSi: t('entendido'), peligroso: false, soloAviso: true });
    return;
  }

  const eleccion = await confirmar({
    titulo: t('confirmarRestaurarTitulo'),
    texto: t('confirmarRestaurarTexto', {
      momento: copia.creada ? momentoAmigable(copia.creada) : '?',
      clientes: copia.clientes.filter(estaActivo).length,
      recordatorios: copia.recordatorios.filter(estaActivo).length
    }),
    botonSi: t('mezclarCopia'),
    botonAlt: t('reemplazarTodo'),
    peligroso: false
  });
  if (!eleccion) return;
  try {
    const resumen = eleccion === 'alt' ? await imponerDatos(copia, 'restaurar') : await aplicarMezcla(prepararCopiaParaRecuperar(copia), 'restaurar');
    if (eleccion !== 'alt') alCambiarDatos();
    cargarFormularioAjustes();
    redibujar();
    avisar(t('copiaRestaurada', { resumen: textoResumen(resumen) }), 6);
  } catch (error) {
    console.error(error);
    mostrarError(t('errorGuardar'));
  }
}

/** Lista de copias automáticas, con "Volver a esta". */
async function dibujarCopiasAuto() {
  if (!bd) return;
  const copias = (await leerTodoBD('copiasAuto')).sort((a, b) => b.creadaEn - a.creadaEn);
  const lista = $('copias-auto');
  lista.replaceChildren();
  if (!copias.length) lista.append(crear('p', 'ayuda', t('copiasAutoVacio')));
  copias.forEach((copia) => {
    const fila = crear('div', 'cliente-fila cliente-fila-estatica');
    fila.append(crear('small', 'cliente-fila-texto', t('copiaAutoFila', {
      momento: momentoAmigable(copia.creadaEn), motivo: t('motivo_' + copia.motivo), cantidad: copia.cantidad
    })));
    const b = crear('button', 'boton boton-fantasma-oscuro boton-chico', t('volverACopia'));
    b.type = 'button';
    b.addEventListener('click', () => volverACopia(copia));
    fila.append(b);
    lista.append(fila);
  });
  const ultimaSync = copias.find((c) => c.motivo === 'sincronizacion' || c.motivo === 'qr');
  $('btn-volver-sync').hidden = !ultimaSync;
  $('btn-volver-sync').onclick = ultimaSync ? () => volverACopia(ultimaSync) : null;
}

/** Vuelve a una copia automática (se aplica en todos los dispositivos si hay sincronización). */
async function volverACopia(copia) {
  const seguro = await confirmar({
    titulo: t('confirmarVolverTitulo'),
    texto: t('confirmarVolverTexto', { momento: momentoAmigable(copia.creadaEn) }),
    botonSi: t('siVolver')
  });
  if (!seguro) return;
  try {
    // Las copias de la migración guardan el formato viejo (versión 1)
    const paquete = copia.formato === 1
      ? { app: COPIA_APP, version: 1, citas: copia.datos.citas, ajustes: copia.datos.ajustes }
      : copia.datos;
    const datos = validarPaquete(paquete);
    const resumen = await imponerDatos(datos, 'volver');
    cargarFormularioAjustes();
    redibujar();
    avisar(t('copiaVuelta', { resumen: textoResumen(resumen) }), 6);
  } catch (error) {
    console.error(error);
    mostrarError(t('errorGuardar'));
  }
}

/** Borra todo (marca todo como borrado, para que se aplique también al sincronizar). */
async function borrarTodo() {
  const seguro = await confirmar({
    titulo: t('confirmarBorrarTitulo'),
    texto: t('confirmarBorrarTexto', { clientes: clientesActivos().length, recordatorios: recordatoriosActivos().length }),
    botonSi: t('siBorrar')
  });
  if (!seguro) return;
  try {
    await imponerDatos({ clientes: [], recordatorios: [], etiquetas: [], productos: [], ajustes: compartidosPorDefecto() }, 'borrar');
    cargarFormularioAjustes();
    redibujar();
    avisar(t('todoBorrado'));
  } catch (error) {
    console.error(error);
    mostrarError(t('errorGuardar'));
  }
}

/** Muestra u oculta los avisos de arriba. */
function revisarAvisos() {
  $('aviso-negocio').hidden = Boolean(estado.compartidos.negocio);
  const referencia = estado.locales.ultimaCopia || estado.locales.primerUso;
  const dias = referencia ? (Date.now() - referencia) / 86400000 : 0;
  $('aviso-copia').hidden = avisoCopiaCerrado || !recordatoriosActivos().length || dias <= DIAS_AVISO_COPIA;
  revisarAyudaIphone();
  // Dirección de prueba (github.io): avisar que los datos no se mudan solos de dirección
  $('aviso-direccion').hidden = !location.hostname.endsWith('github.io') || estado.locales.avisoDireccionOculto;
}

/* =========================================================
   11b. PASAR DATOS POR CÓDIGO QR (sin internet)
   Mostrar: datos → gzip → Base45 → partes "TK3:..." → QR en secuencia.
   Escanear: cámara → BarcodeDetector (si existe) o jsQR → juntar partes
   en cualquier orden → mezcla segura.
   Las bibliotecas (vendor/) se cargan solo al abrir estas ventanas.
   ========================================================= */
const MS_POR_QR = 700;
const qrMostrar = { partes: [], indice: 0, temporizador: null, pausado: false };
const qrEscaneo = { flujo: null, activo: false, lotes: new Map(), detector: null, lienzo: null };

/** Carga un archivo de vendor/ una sola vez. */
const scriptsCargados = new Map();
function cargarScript(ruta) {
  if (!scriptsCargados.has(ruta)) {
    scriptsCargados.set(ruta, new Promise((resolver, rechazar) => {
      const s = document.createElement('script');
      s.src = ruta;
      s.onload = resolver;
      s.onerror = () => { scriptsCargados.delete(ruta); rechazar(new Error('No se pudo cargar ' + ruta)); };
      document.head.append(s);
    }));
  }
  return scriptsCargados.get(ruta);
}

/** Datos a enviar: todo (incluye borrados, para que viajen) o solo los próximos 30 días. */
function paqueteParaQR(alcance) {
  const paquete = paqueteDatos();
  if (alcance !== '30') return paquete;
  const hoy = hoyTexto();
  const limite = sumarDias(hoy, 30);
  const recordatorios = recordatoriosActivos().filter((r) => r.fecha >= hoy && r.fecha <= limite);
  const idsClientes = new Set(recordatorios.map((r) => r.clienteId));
  const clientes = clientesActivos().filter((c) => idsClientes.has(c.id));
  const idsEtiquetas = new Set(clientes.flatMap((c) => c.etiquetaIds || []));
  paquete.datos = { ...paquete.datos, recordatorios, clientes, etiquetas: etiquetasActivas().filter((e) => idsEtiquetas.has(e.id)) };
  return paquete;
}

function abrirMostrarQR() {
  $('qr-opciones').hidden = false;
  $('qr-mostrando').hidden = true;
  $('qr-mostrar-error').hidden = true;
  $('dialogo-qr-mostrar').showModal();
}

async function generarQR() {
  try {
    if (!('CompressionStream' in window)) throw new Error(t('qrSinCompresion'));
    await cargarScript('vendor/qrcode-generator/qrcode.js');
    const alcance = document.querySelector('input[name="qr-alcance"]:checked').value;
    const bytes = await TucankitCore.comprimir(JSON.stringify(paqueteParaQR(alcance)));
    const lote = Math.random().toString(36).slice(2, 7).toUpperCase().replace(/[^0-9A-Z]/g, 'X').padEnd(5, '0');
    qrMostrar.partes = TucankitCore.crearPartesQR(TucankitCore.aBase45(bytes), lote);
    qrMostrar.indice = 0;
    qrMostrar.pausado = false;
    $('qr-opciones').hidden = true;
    $('qr-mostrando').hidden = false;
    $('qr-pausa').hidden = qrMostrar.partes.length < 2;
    $('qr-pausa').textContent = t('qrPausar');
    dibujarQRActual();
    clearInterval(qrMostrar.temporizador);
    if (qrMostrar.partes.length > 1) {
      qrMostrar.temporizador = setInterval(() => {
        if (qrMostrar.pausado) return;
        qrMostrar.indice = (qrMostrar.indice + 1) % qrMostrar.partes.length;
        dibujarQRActual();
      }, MS_POR_QR);
    }
  } catch (error) {
    console.error(error);
    $('qr-mostrar-error').textContent = error.message || String(error);
    $('qr-mostrar-error').hidden = false;
  }
}

/** Dibuja el QR actual en el lienzo (cuadritos negros sobre blanco, con margen). */
function dibujarQRActual() {
  const texto = qrMostrar.partes[qrMostrar.indice];
  const qr = qrcode(0, 'L'); // tamaño automático; corrección "L" (pantallas limpias)
  qr.addData(texto, 'Alphanumeric');
  qr.make();
  const modulos = qr.getModuleCount();
  const lienzo = $('qr-lienzo');
  const margen = 4;
  const celda = Math.max(2, Math.floor(680 / (modulos + margen * 2)));
  const lado = celda * (modulos + margen * 2);
  lienzo.width = lado;
  lienzo.height = lado;
  const g = lienzo.getContext('2d');
  g.fillStyle = '#fff';
  g.fillRect(0, 0, lado, lado);
  g.fillStyle = '#000';
  for (let fila = 0; fila < modulos; fila += 1) {
    for (let col = 0; col < modulos; col += 1) {
      if (qr.isDark(fila, col)) g.fillRect((col + margen) * celda, (fila + margen) * celda, celda, celda);
    }
  }
  $('qr-contador').textContent = t('qrContador', { numero: qrMostrar.indice + 1, total: qrMostrar.partes.length });
}

function cerrarMostrarQR() {
  clearInterval(qrMostrar.temporizador);
  qrMostrar.partes = [];
  if ($('dialogo-qr-mostrar').open) $('dialogo-qr-mostrar').close();
}

/* ---------- Escanear ---------- */

async function abrirEscanearQR() {
  qrEscaneo.lotes = new Map();
  $('qr-escanear-error').hidden = true;
  $('qr-barra').style.width = '0';
  $('qr-estado').textContent = t('qrBuscando');
  $('dialogo-qr-escanear').showModal();
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw Object.assign(new Error('sin cámara'), { name: 'NotFoundError' });
    // Lector propio del navegador si existe y entiende QR; si no, jsQR
    qrEscaneo.detector = null;
    if ('BarcodeDetector' in window) {
      try {
        const formatos = await window.BarcodeDetector.getSupportedFormats();
        if (formatos.includes('qr_code')) qrEscaneo.detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      } catch (error) { qrEscaneo.detector = null; }
    }
    if (!qrEscaneo.detector) await cargarScript('vendor/jsqr/jsQR.js');
    qrEscaneo.flujo = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    const video = $('qr-video');
    video.srcObject = qrEscaneo.flujo;
    await video.play();
    qrEscaneo.activo = true;
    buclesDeEscaneo();
  } catch (error) {
    console.warn('Cámara:', error);
    const sinPermiso = error && (error.name === 'NotAllowedError' || error.name === 'SecurityError');
    $('qr-escanear-error').textContent = t(sinPermiso ? 'qrSinPermiso' : 'qrSinCamara');
    $('qr-escanear-error').hidden = false;
    $('qr-estado').textContent = '';
    detenerCamara();
  }
}

/** Lee un cuadro de la cámara cada ~150 ms hasta completar o cerrar. */
async function buclesDeEscaneo() {
  if (!qrEscaneo.activo) return;
  const video = $('qr-video');
  try {
    if (video.readyState >= 2) {
      const textos = await leerQRDelVideo(video);
      for (const texto of textos) {
        const terminado = await recibirParteQR(texto);
        if (terminado) return;
      }
    }
  } catch (error) {
    console.warn('Lectura QR:', error);
  }
  setTimeout(buclesDeEscaneo, 150);
}

/** Devuelve los textos de los QR que se ven en el cuadro actual. */
async function leerQRDelVideo(video) {
  if (qrEscaneo.detector) {
    const encontrados = await qrEscaneo.detector.detect(video);
    return encontrados.map((x) => x.rawValue);
  }
  // jsQR trabaja con una imagen: se copia el cuadro a un lienzo (achicado para ir rápido)
  const escala = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight));
  const ancho = Math.round(video.videoWidth * escala);
  const alto = Math.round(video.videoHeight * escala);
  if (!qrEscaneo.lienzo) qrEscaneo.lienzo = document.createElement('canvas');
  const lienzo = qrEscaneo.lienzo;
  lienzo.width = ancho;
  lienzo.height = alto;
  const g = lienzo.getContext('2d', { willReadFrequently: true });
  g.drawImage(video, 0, 0, ancho, alto);
  const imagen = g.getImageData(0, 0, ancho, alto);
  const resultado = window.jsQR(imagen.data, ancho, alto, { inversionAttempts: 'dontInvert' });
  return resultado ? [resultado.data] : [];
}

/**
 * Guarda una parte leída. Junta por "lote" (cada envío tiene el suyo).
 * Cuando un lote está completo, aplica los datos. Devuelve true al terminar.
 */
async function recibirParteQR(texto) {
  const parte = TucankitCore.leerParteQR(texto);
  if (!parte) return false;
  if (!qrEscaneo.lotes.has(parte.lote)) qrEscaneo.lotes.set(parte.lote, new Map());
  const lote = qrEscaneo.lotes.get(parte.lote);
  lote.set(parte.numero, parte);
  $('qr-barra').style.width = `${Math.round((lote.size / parte.total) * 100)}%`;
  $('qr-estado').textContent = t('qrRecibidas', { recibidas: lote.size, total: parte.total });
  const completo = TucankitCore.unirPartesQR([...lote.values()]);
  if (completo == null) return false;

  qrEscaneo.activo = false;
  detenerCamara();
  $('qr-estado').textContent = t('qrAplicando');
  try {
    const paquete = JSON.parse(await TucankitCore.descomprimir(TucankitCore.deBase45(completo)));
    const datos = validarPaquete(paquete);
    const resumen = await aplicarMezcla(datos, 'qr');
    alCambiarDatos();
    $('dialogo-qr-escanear').close();
    redibujar();
    await confirmar({ titulo: t('qrListo'), texto: textoResumen(resumen), botonSi: t('entendido'), peligroso: false, soloAviso: true });
  } catch (error) {
    console.error(error);
    $('qr-escanear-error').textContent = t('qrInvalido');
    $('qr-escanear-error').hidden = false;
  }
  return true;
}

function detenerCamara() {
  qrEscaneo.activo = false;
  if (qrEscaneo.flujo) qrEscaneo.flujo.getTracks().forEach((pista) => pista.stop());
  qrEscaneo.flujo = null;
  $('qr-video').srcObject = null;
}

function cerrarEscanearQR() {
  detenerCamara();
  if ($('dialogo-qr-escanear').open) $('dialogo-qr-escanear').close();
}

/* =========================================================
   11c. SINCRONIZACIÓN CON EL GOOGLE DRIVE DEL USUARIO
   - Solo funciona si la persona la activa (regla 3 de CLAUDE.md).
   - Inicio de sesión: Google Identity Services, en el navegador, sin servidor.
   - Permiso pedido: SOLO "drive.file" (la app solo ve los archivos que ella creó).
   - Un único archivo: "Tucankit Citas - sincronizacion.json".
   - Proceso: descargar → mezclar (mezcla segura) → guardar aquí → subir.
     Si el archivo cambió en Drive mientras tanto, se vuelve a mezclar antes de subir.
   ========================================================= */
const DRIVE_PERMISO = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_ARCHIVO = 'Tucankit Citas - sincronizacion.json';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_SUBIDA = 'https://www.googleapis.com/upload/drive/v3';
const GOOGLE_SCRIPT = 'https://accounts.google.com/gsi/client';
const ESPERA_TRAS_CAMBIO_MS = 4000;   // agrupa varios cambios seguidos
const MARGEN_VENCIMIENTO_MS = 60000;  // el permiso se considera vencido 1 minuto antes

const drive = {
  estado: 'desconectado', // desconectado | conectado | sincronizando | pendiente | reconectar | error
  mensajeError: '',
  temporizador: null,
  enCurso: null,           // sincronización en marcha (para no hacer dos a la vez)
  otraVez: false,          // hubo cambios durante una sincronización: repetir al terminar
  tiempoMaximoMs: 30000    // si Drive no responde en 30 s, se corta (internet inestable)
};

/** Error especial: el permiso de Google venció o fue retirado. */
class ErrorPermisoDrive extends Error {}

const idClienteGoogle = () => (window.TUCANKIT_CONFIG && window.TUCANKIT_CONFIG.googleClientId) || '';
const idClienteConfigurado = () => /\.apps\.googleusercontent\.com$/.test(idClienteGoogle()) && !idClienteGoogle().startsWith('TU-ID');
const tokenVigente = () => estado.locales.driveToken && estado.locales.driveTokenVence > Date.now() + MARGEN_VENCIMIENTO_MS;

/**
 * Pide a Google un permiso temporal (dura ~1 hora). Abre la ventanita de Google,
 * por eso solo se llama cuando la persona toca un botón.
 */
async function pedirPermisoGoogle({ elegirCuenta = false } = {}) {
  await cargarScript(GOOGLE_SCRIPT);
  return new Promise((resolver, rechazar) => {
    const cliente = window.google.accounts.oauth2.initTokenClient({
      client_id: idClienteGoogle(),
      scope: DRIVE_PERMISO,
      callback: (respuesta) => {
        if (respuesta.error || !respuesta.access_token) { rechazar(new Error(respuesta.error || 'sin permiso')); return; }
        if (!window.google.accounts.oauth2.hasGrantedAllScopes(respuesta, DRIVE_PERMISO)) { rechazar(new Error('permiso no concedido')); return; }
        resolver({ token: respuesta.access_token, vence: Date.now() + (Number(respuesta.expires_in) || 3600) * 1000 });
      },
      error_callback: (error) => rechazar(new Error((error && error.type) || 'ventana cerrada'))
    });
    cliente.requestAccessToken({ prompt: elegirCuenta ? 'select_account' : '' });
  });
}

/** Llamada a la API de Drive con el permiso actual. */
async function pedirDrive(url, opciones = {}) {
  if (!tokenVigente()) throw new ErrorPermisoDrive('vencido');
  // Sin respuesta en el tiempo máximo, se corta: así una conexión trabada no frena todo
  const corte = new AbortController();
  const reloj = setTimeout(() => corte.abort(), drive.tiempoMaximoMs);
  let respuesta;
  try {
    respuesta = await fetch(url, {
      ...opciones,
      signal: corte.signal,
      headers: { ...(opciones.headers || {}), Authorization: `Bearer ${estado.locales.driveToken}` }
    });
  } catch (error) {
    throw new TypeError('Sin conexión con Drive'); // se trata como "sin internet": queda pendiente
  } finally {
    clearTimeout(reloj);
  }
  if (respuesta.status === 401) throw new ErrorPermisoDrive('vencido');
  if (!respuesta.ok) throw new Error(`Drive respondió ${respuesta.status}`);
  return respuesta;
}

/** Busca el archivo de sincronización (la app solo ve los archivos que ella creó). */
async function buscarArchivoDrive() {
  const q = encodeURIComponent(`name='${DRIVE_ARCHIVO}' and trashed=false`);
  const r = await pedirDrive(`${DRIVE_API}/files?q=${q}&spaces=drive&orderBy=modifiedTime desc&fields=files(id,version)`);
  const { files } = await r.json();
  return files && files.length ? files[0].id : null;
}

/** Versión actual del archivo en Drive (cambia cada vez que alguien lo sube). */
async function versionArchivoDrive(id) {
  const r = await pedirDrive(`${DRIVE_API}/files/${id}?fields=id,version,trashed`);
  const meta = await r.json();
  return meta.trashed ? null : String(meta.version);
}

async function descargarArchivoDrive(id) {
  const r = await pedirDrive(`${DRIVE_API}/files/${id}?alt=media`);
  return r.text();
}

/** Crea el archivo en Drive. Devuelve su id. */
async function crearArchivoDrive(contenido) {
  const limite = 'tucankit' + Math.random().toString(36).slice(2);
  const metadatos = { name: DRIVE_ARCHIVO, mimeType: 'application/json', description: 'Datos de Tucankit Citas. Lo usa la app para sincronizar sus dispositivos.' };
  const cuerpo = `--${limite}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadatos)}\r\n`
    + `--${limite}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${contenido}\r\n--${limite}--`;
  const r = await pedirDrive(`${DRIVE_SUBIDA}/files?uploadType=multipart&fields=id,version`, {
    method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${limite}` }, body: cuerpo
  });
  return (await r.json()).id;
}

async function actualizarArchivoDrive(id, contenido) {
  await pedirDrive(`${DRIVE_SUBIDA}/files/${id}?uploadType=media&fields=id,version`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body: contenido
  });
}

/** Datos de este dispositivo en el formato de la mezcla. */
function datosLocalesParaMezcla() {
  const datos = { ajustes: estado.compartidos };
  TucankitCore.COLECCIONES.forEach((k) => { datos[k] = estado[k]; });
  return datos;
}

/** ¿La mezcla cambia algo? */
const hayCambios = (r) => r.agregados + r.actualizados + r.borrados > 0;

/**
 * Sincroniza ahora. "interactivo" = la persona tocó un botón (se puede abrir
 * la ventanita de Google si el permiso venció).
 */
async function sincronizarDrive({ interactivo = false } = {}) {
  if (!estado.locales.driveActivo) return;
  if (drive.enCurso) { drive.otraVez = true; return drive.enCurso; }
  const tarea = (async () => {
    try {
      if (!navigator.onLine) { await marcarPendiente(); return; }
      if (!tokenVigente()) {
        if (!interactivo) { ponerEstadoDrive('reconectar'); return; }
        const permiso = await pedirPermisoGoogle();
        await guardarLocales({ driveToken: permiso.token, driveTokenVence: permiso.vence });
      }
      ponerEstadoDrive('sincronizando');

      let resumenTotal = { agregados: 0, actualizados: 0, borrados: 0 };
      for (let intento = 1; intento <= 4; intento += 1) {
        // 1) Encontrar el archivo (o saber que no existe todavía)
        let id = estado.locales.driveArchivoId || await buscarArchivoDrive();
        let version = id ? await versionArchivoDrive(id).catch(() => null) : null;
        if (id && version == null) { id = await buscarArchivoDrive(); version = id ? await versionArchivoDrive(id) : null; }

        // 2) Descargar y mezclar con lo de aquí
        if (id) {
          const remoto = validarPaquete(JSON.parse(await descargarArchivoDrive(id)));
          const previa = mezclarDatos(datosLocalesParaMezcla(), remoto, CLAVES_COMPARTIDAS);
          if (hayCambios(previa.resumen)) {
            const resumen = await aplicarMezcla(remoto, 'sincronizacion'); // guarda copia automática antes
            resumenTotal = {
              agregados: resumenTotal.agregados + resumen.agregados,
              actualizados: resumenTotal.actualizados + resumen.actualizados,
              borrados: resumenTotal.borrados + resumen.borrados
            };
          }
          // ¿Lo de aquí trae algo que Drive no tiene? Si no, no hace falta subir
          const haciaDrive = mezclarDatos(remoto, datosLocalesParaMezcla(), CLAVES_COMPARTIDAS);
          if (!hayCambios(haciaDrive.resumen)) { await terminarSincronizacion(id, resumenTotal); return; }
        }

        // 3) Antes de subir: si el archivo cambió en Drive mientras tanto, repetir
        if (id && (await versionArchivoDrive(id)) !== version) continue;
        const contenido = JSON.stringify(paqueteDatos());
        if (id) await actualizarArchivoDrive(id, contenido);
        else id = await crearArchivoDrive(contenido);
        await terminarSincronizacion(id, resumenTotal);
        return;
      }
      throw new Error('El archivo de Drive cambia demasiado seguido; se intentará de nuevo.');
    } catch (error) {
      if (error instanceof ErrorPermisoDrive) {
        await guardarLocales({ driveToken: '', driveTokenVence: 0 });
        ponerEstadoDrive('reconectar');
      } else if (!navigator.onLine || error instanceof TypeError) {
        await marcarPendiente(); // TypeError = falló la conexión
      } else {
        console.error('Sincronización:', error);
        drive.mensajeError = error.message || String(error);
        ponerEstadoDrive('error');
      }
    }
  })();
  // El turno se libera cuando la tarea termina de verdad (aunque haya terminado al instante)
  drive.enCurso = tarea;
  tarea.finally(() => {
    if (drive.enCurso === tarea) drive.enCurso = null;
    if (drive.otraVez) { drive.otraVez = false; programarSincronizacion(); }
  });
  return tarea;
}

async function terminarSincronizacion(id, resumen) {
  await guardarLocales({ driveArchivoId: id, driveUltimaSync: Date.now(), drivePendiente: false });
  ponerEstadoDrive('conectado');
  if (hayCambios(resumen)) {
    redibujar();
    avisar(textoResumen(resumen), 5);
  }
}

async function marcarPendiente() {
  await guardarLocales({ drivePendiente: true });
  ponerEstadoDrive('pendiente');
}

/** Se llama después de cada cambio: sincroniza unos segundos después (agrupando cambios). */
function programarSincronizacion() {
  if (!estado.locales || !estado.locales.driveActivo) return;
  clearTimeout(drive.temporizador);
  drive.temporizador = setTimeout(() => sincronizarDrive(), ESPERA_TRAS_CAMBIO_MS);
  if (!navigator.onLine) marcarPendiente().catch(console.error);
}

/** Botón "Conectar con Google Drive". */
async function conectarDrive() {
  if (!idClienteConfigurado()) {
    await confirmar({ titulo: t('driveTitulo'), texto: t('driveSinConfigurar'), botonSi: t('entendido'), peligroso: false, soloAviso: true });
    return;
  }
  if (!navigator.onLine) { avisar(t('driveSinInternet'), 4); return; }
  try {
    const permiso = await pedirPermisoGoogle({ elegirCuenta: true });
    await guardarLocales({ driveActivo: true, driveToken: permiso.token, driveTokenVence: permiso.vence, driveArchivoId: '' });
    // Nombre de la cuenta (para mostrarlo en Ajustes)
    try {
      const r = await pedirDrive(`${DRIVE_API}/about?fields=user(emailAddress,displayName)`);
      const { user } = await r.json();
      await guardarLocales({ driveCuenta: (user && (user.emailAddress || user.displayName)) || '' });
    } catch (error) { console.warn('No se pudo leer la cuenta:', error); }
    await sincronizarDrive({ interactivo: true });
  } catch (error) {
    console.warn('Conectar Drive:', error);
    avisar(t('driveNoConectado'), 5);
  }
  dibujarDrive();
}

/** Botón "Volver a conectar" (cuando el permiso de Google venció). */
async function reconectarDrive() {
  try {
    const permiso = await pedirPermisoGoogle();
    await guardarLocales({ driveToken: permiso.token, driveTokenVence: permiso.vence });
    await sincronizarDrive({ interactivo: true });
  } catch (error) {
    console.warn('Reconectar Drive:', error);
    avisar(t('driveNoConectado'), 5);
  }
}

/** Botón "Desconectar": deja de sincronizar. Los datos de este dispositivo no se tocan. */
async function desconectarDrive() {
  const seguro = await confirmar({ titulo: t('driveDesconectarTitulo'), texto: t('driveDesconectarTexto'), botonSi: t('driveDesconectar'), peligroso: false });
  if (!seguro) return;
  const token = estado.locales.driveToken;
  if (token && window.google && window.google.accounts) {
    try { window.google.accounts.oauth2.revoke(token, () => {}); } catch (error) { console.warn(error); }
  }
  clearTimeout(drive.temporizador);
  await guardarLocales({ driveActivo: false, driveToken: '', driveTokenVence: 0, driveArchivoId: '', driveCuenta: '', drivePendiente: false });
  ponerEstadoDrive('desconectado');
}

/** Cambia el estado visible de la sincronización. */
function ponerEstadoDrive(nuevo) {
  drive.estado = nuevo;
  dibujarDrive();
}

/** Dibuja la tarjeta de Drive en Ajustes y el aviso de arriba. */
function dibujarDrive() {
  const l = estado.locales;
  const activo = Boolean(l.driveActivo);
  const estadoVisible = activo ? drive.estado : 'desconectado';
  $('drive-estado').dataset.estado = estadoVisible;
  $('drive-estado').textContent = t('driveEstado_' + estadoVisible, { error: drive.mensajeError });
  const partes = [];
  if (activo && l.driveCuenta) partes.push(t('driveCuenta', { cuenta: l.driveCuenta }));
  if (activo) partes.push(l.driveUltimaSync ? t('driveUltima', { momento: momentoAmigable(l.driveUltimaSync) }) : t('driveNunca'));
  $('drive-detalle').textContent = partes.join(' · ');
  $('btn-drive-conectar').hidden = activo;
  $('btn-drive-sincronizar').hidden = !activo;
  $('btn-drive-desconectar').hidden = !activo;
  $('btn-drive-sincronizar').disabled = drive.estado === 'sincronizando';

  // Aviso de arriba: solo cuando hace falta que la persona haga algo
  const aviso = $('aviso-drive');
  const necesitaAccion = activo && (drive.estado === 'reconectar' || drive.estado === 'pendiente' || drive.estado === 'error');
  aviso.hidden = !necesitaAccion;
  if (necesitaAccion) {
    $('aviso-drive-texto').textContent = t('driveAviso_' + drive.estado, { error: drive.mensajeError });
    $('aviso-drive-boton').textContent = t(drive.estado === 'reconectar' ? 'driveReconectar' : 'driveSincronizarAhora');
  }
}

/** Al abrir la app: si la sincronización está activa, sincroniza. */
function iniciarDrive() {
  window.addEventListener('online', () => sincronizarDrive());
  window.addEventListener('offline', () => { if (estado.locales.driveActivo) marcarPendiente().catch(console.error); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sincronizarDrive(); });
  if (!estado.locales.driveActivo) { ponerEstadoDrive('desconectado'); return; }
  ponerEstadoDrive(estado.locales.drivePendiente ? 'pendiente' : 'conectado');
  sincronizarDrive();
}

/* =========================================================
   12. INSTALACIÓN, USO SIN INTERNET Y ALMACENAMIENTO
   ========================================================= */
let eventoInstalacion = null;
let actualizacionPedida = false;

function prepararInstalacion() {
  window.addEventListener('beforeinstallprompt', (evento) => {
    evento.preventDefault();
    eventoInstalacion = evento;
    $('btn-instalar').hidden = false;
  });
  $('btn-instalar').addEventListener('click', async () => {
    if (!eventoInstalacion) return;
    eventoInstalacion.prompt();
    try { await eventoInstalacion.userChoice; } catch (error) { /* la persona cerró la ventana */ }
    eventoInstalacion = null;
    $('btn-instalar').hidden = true;
  });
  window.addEventListener('appinstalled', () => {
    $('btn-instalar').hidden = true;
    avisar(t('appInstalada'));
  });
}

function esIphone() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function estaInstalada() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function revisarAyudaIphone() {
  $('aviso-iphone').hidden = !esIphone() || estaInstalada() || estado.locales.ayudaIphoneOculta;
}

/** Registra el service worker (sw.js). Solo funciona en https:// o en localhost. */
function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (actualizacionPedida) window.location.reload();
  });
  navigator.serviceWorker.register('sw.js').then((registro) => {
    if (registro.waiting && navigator.serviceWorker.controller) avisarActualizacion(registro.waiting);
    registro.addEventListener('updatefound', () => {
      const nuevo = registro.installing;
      if (!nuevo) return;
      nuevo.addEventListener('statechange', () => {
        if (nuevo.state === 'installed' && navigator.serviceWorker.controller) avisarActualizacion(nuevo);
      });
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') registro.update().catch(() => {});
    });
  }).catch((error) => console.warn('No se pudo activar el modo sin internet:', error));
}

function avisarActualizacion(versionNueva) {
  const aviso = $('aviso-actualizacion');
  aviso.hidden = false;
  aviso.onclick = () => {
    actualizacionPedida = true;
    aviso.disabled = true;
    versionNueva.postMessage({ tipo: 'ACTIVAR_VERSION_NUEVA' });
  };
}

/** Pide al navegador que no borre los datos para liberar espacio. */
async function pedirAlmacenamientoPersistente() {
  try {
    if (navigator.storage && navigator.storage.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist();
    }
  } catch (error) {
    console.warn('No se pudo pedir almacenamiento persistente:', error);
  }
}

/* =========================================================
   13. INICIO DE LA APP
   ========================================================= */

/** Conecta cada botón con lo que debe hacer. */
function conectarEventos() {
  // Navegación
  document.querySelectorAll('.navegacion button').forEach((b) => b.addEventListener('click', () => irA(b.dataset.vista)));
  document.querySelectorAll('.pestana').forEach((b) => b.addEventListener('click', () => { estado.pestana = b.dataset.pestana; dibujarAgenda(); }));
  $('btn-ajustes').addEventListener('click', () => mostrarVista('ajustes'));
  $('btn-volver').addEventListener('click', () => irA(estado.vistaAnterior === 'ajustes' ? 'agenda' : estado.vistaAnterior));
  $('aviso-negocio-ir').addEventListener('click', () => mostrarVista('ajustes'));
  $('btn-nueva').addEventListener('click', () => (estado.vista === 'clientes' ? abrirFormularioCliente() : abrirFormularioRecordatorio()));

  // Tarjetas (agenda e historial)
  $('lista-recordatorios').addEventListener('click', alTocarTarjeta);
  $('ficha-historial').addEventListener('click', alTocarTarjeta);

  // Formulario de recordatorio
  $('form-recordatorio').addEventListener('submit', guardarFormularioRecordatorio);
  $('rec-cancelar').addEventListener('click', () => $('dialogo-recordatorio').close());
  $('rec-cliente-buscar').addEventListener('input', dibujarSugerencias);
  $('rec-cliente-cambiar').addEventListener('click', () => { estado.recClienteId = null; dibujarClienteFormulario(); $('rec-cliente-buscar').focus(); });
  $('rec-telefono').addEventListener('input', () => actualizarNumeroFinal('rec-telefono', 'rec-numero-final'));

  // Clientes
  $('buscar-cliente').addEventListener('input', (e) => { estado.busqueda = e.target.value; dibujarClientes(); });
  $('btn-volver-clientes').addEventListener('click', () => mostrarVista('clientes'));
  $('ficha-recordatorio').addEventListener('click', () => abrirFormularioRecordatorio(null, estado.clienteAbierto));
  $('ficha-whatsapp').addEventListener('click', () => { const c = clientePorId(estado.clienteAbierto); if (c) abrirWhatsApp(c.telefono, ''); });
  $('ficha-editar').addEventListener('click', () => abrirFormularioCliente(clientePorId(estado.clienteAbierto)));
  $('ficha-eliminar').addEventListener('click', eliminarCliente);
  $('form-cliente').addEventListener('submit', guardarFormularioCliente);
  $('cli-cancelar').addEventListener('click', () => $('dialogo-cliente').close());
  $('cli-telefono').addEventListener('input', () => actualizarNumeroFinal('cli-telefono', 'cli-numero-final'));
  $('cli-etiqueta-agregar').addEventListener('click', agregarEtiquetaEscrita);
  $('cli-etiqueta-nueva').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); agregarEtiquetaEscrita(); } });

  // Grupos
  $('grupo-mensaje').addEventListener('input', (e) => {
    estado.locales.envioGrupo = { ...estado.locales.envioGrupo, mensaje: e.target.value };
    dibujarGrupos();
  });
  $('grupo-mensaje').addEventListener('change', () => guardarLocales({}).catch(console.error));
  $('grupo-siguiente').addEventListener('click', enviarSiguienteDelGrupo);
  $('grupo-reiniciar').addEventListener('click', () => cambiarGrupo(estado.locales.envioGrupo.grupo));
  const variablesGrupo = $('grupo-variables');
  VARIABLES_COMUNES.forEach((nombre) => {
    const b = crear('button', 'variable', `{${nombre}}`);
    b.type = 'button';
    b.addEventListener('click', () => insertarVariable($('grupo-mensaje'), nombre, () => {
      estado.locales.envioGrupo = { ...estado.locales.envioGrupo, mensaje: $('grupo-mensaje').value };
      guardarLocales({}).catch(console.error);
      dibujarGrupos();
    }));
    variablesGrupo.append(b);
  });

  // Ajustes
  llenarOpcionesConstructor();
  llenarPaises();
  $('aj-pais').addEventListener('change', alCambiarPais);
  // Cualquier cambio en el formulario de Ajustes queda "sin guardar" hasta tocar Guardar
  ['input', 'change'].forEach((tipo) => $('form-ajustes').addEventListener(tipo, () => marcarAjustesSinGuardar(true)));
  $('form-ajustes').addEventListener('click', (e) => { if (e.target.closest('.segmentado button, #plantilla-tipos .ficha, .variable, #btn-plantilla-defecto')) marcarAjustesSinGuardar(true); });
  window.addEventListener('beforeunload', (e) => { if (estado.ajustesSinGuardar) { e.preventDefault(); e.returnValue = ''; } });
  $('form-ajustes').addEventListener('submit', guardarAjustes);
  ['aj-negocio', 'aj-atiende', 'aj-direccion', 'aj-moneda', 'aj-pago', 'aj-firma', 'aj-plantilla', 'aj-telnegocio', 'aj-codigo']
    .forEach((id) => $(id).addEventListener('input', actualizarVistaPrevia));
  ['aj-firma-activa', 'aj-enlaces'].forEach((id) => $(id).addEventListener('change', actualizarVistaPrevia));
  $('aj-telnegocio').addEventListener('input', () => actualizarNumeroFinal('aj-telnegocio', 'aj-telnegocio-final', $('aj-codigo').value.trim()));
  $('con-saludo').addEventListener('change', (e) => alCambiarConstructor({ saludo: Number(e.target.value) }));
  $('con-cierre').addEventListener('change', (e) => alCambiarConstructor({ cierre: Number(e.target.value) }));
  $('con-confirmar').addEventListener('change', (e) => alCambiarConstructor({ confirmar: e.target.checked }));
  $('con-direccion').addEventListener('change', (e) => alCambiarConstructor({ direccion: e.target.checked }));
  document.querySelectorAll('.segmentado [data-trato]').forEach((b) => b.addEventListener('click', () => alCambiarConstructor({ trato: b.dataset.trato })));
  $('btn-plantilla-defecto').addEventListener('click', () => {
    const tipo = estado.editorTipo;
    estado.editorOpciones[tipo] = opcionesPorDefecto(tipo);
    estado.editorPlantillas[tipo] = plantillaPorDefecto(tipo);
    dibujarEditorPlantilla();
  });

  // Servicios y productos
  $('producto-agregar').addEventListener('click', guardarProducto);
  ['producto-nombre', 'producto-precio'].forEach((id) => $(id).addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); guardarProducto(); } }));
  $('rec-detalle').addEventListener('input', dibujarProductosFormulario);

  // Copias y borrar todo
  $('btn-descargar').addEventListener('click', descargarCopia);
  $('aviso-copia-descargar').addEventListener('click', descargarCopia);
  $('aviso-copia-cerrar').addEventListener('click', () => { avisoCopiaCerrado = true; revisarAvisos(); });
  $('btn-restaurar').addEventListener('click', () => $('archivo-restaurar').click());
  $('archivo-restaurar').addEventListener('change', restaurarCopia);
  $('btn-borrar-todo').addEventListener('click', borrarTodo);

  // QR
  $('btn-qr-mostrar').addEventListener('click', abrirMostrarQR);
  $('qr-generar').addEventListener('click', generarQR);
  $('qr-mostrar-cerrar').addEventListener('click', cerrarMostrarQR);
  $('dialogo-qr-mostrar').addEventListener('close', cerrarMostrarQR);
  $('qr-pausa').addEventListener('click', () => {
    qrMostrar.pausado = !qrMostrar.pausado;
    $('qr-pausa').textContent = t(qrMostrar.pausado ? 'qrSeguir' : 'qrPausar');
  });
  $('btn-qr-escanear').addEventListener('click', abrirEscanearQR);
  $('qr-escanear-cerrar').addEventListener('click', cerrarEscanearQR);
  $('dialogo-qr-escanear').addEventListener('close', detenerCamara);

  // Google Drive
  $('btn-drive-conectar').addEventListener('click', conectarDrive);
  $('btn-drive-sincronizar').addEventListener('click', () => sincronizarDrive({ interactivo: true }));
  $('btn-drive-desconectar').addEventListener('click', desconectarDrive);
  $('aviso-drive-boton').addEventListener('click', () => (drive.estado === 'reconectar' ? reconectarDrive() : sincronizarDrive({ interactivo: true })));

  // Avisos e instalación
  prepararInstalacion();
  $('aviso-iphone-cerrar').addEventListener('click', () => guardarLocales({ ayudaIphoneOculta: true }).then(revisarAyudaIphone));
  $('aviso-direccion-cerrar').addEventListener('click', () => guardarLocales({ avisoDireccionOculto: true }).then(revisarAvisos));
  $('aviso-migracion-cerrar').addEventListener('click', () => { $('aviso-migracion').hidden = true; });

  // Si la app queda abierta y pasa la medianoche, "hoy" y "mañana" cambian
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') redibujar(); });
}

/** Lee todos los datos de la base a la memoria. */
async function cargarDatos() {
  const [clientes, recordatorios, etiquetas, productos, compartidos, locales] = await Promise.all([
    leerTodoBD('clientes'), leerTodoBD('recordatorios'), leerTodoBD('etiquetas'), leerTodoBD('productos'),
    leerUnoBD('ajustes', 'compartidos'), leerUnoBD('ajustes', 'locales')
  ]);
  Object.assign(estado, {
    clientes, recordatorios, etiquetas, productos,
    compartidos: normalizarCompartidos(compartidos || {}),
    locales: normalizarLocales(locales || {})
  });
  // Primera vez: guardar los ajustes iniciales (incluye el id de este dispositivo)
  if (!locales || !compartidos) {
    await guardarVariosBD({ ajustes: [{ ...estado.compartidos, clave: 'compartidos' }, { ...estado.locales, clave: 'locales' }] });
  }
}

async function iniciar() {
  aplicarTextos();
  conectarEventos();
  registrarServiceWorker();
  pedirAlmacenamientoPersistente();
  try {
    const abierta = await abrirBD();
    bd = abierta.base;
    await cargarDatos();
    if (abierta.migracion) {
      $('aviso-migracion-texto').textContent = t('avisoMigracion', abierta.migracion);
      $('aviso-migracion').hidden = false;
    }
  } catch (error) {
    console.error(error);
    mostrarError(t('errorBD'));
    return;
  }
  mostrarVista('agenda');
  iniciarDrive();
}

iniciar();
