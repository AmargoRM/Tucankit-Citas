/* =========================================================
   Tucankit Citas — Excel (importar y descargar clientes)

   Funciones puras, sin pantalla ni base de datos:
   - crear un archivo de Excel (.xlsx) con una tabla de clientes;
   - leer un archivo de Excel (.xlsx) o CSV (.csv) y convertirlo en filas;
   - convertir esas filas en clientes, revisando nombre y teléfono.

   Un archivo .xlsx es una carpeta comprimida (formato ZIP) con textos
   en formato XML adentro. Aquí se arma y se lee a mano, sin bibliotecas
   ni conexiones a internet. Para descomprimir se usa la función del
   navegador "DecompressionStream".
   ========================================================= */
(function (global) {
  'use strict';

  const codificar = (texto) => new TextEncoder().encode(texto);
  const decodificar = (bytes) => new TextDecoder('utf-8').decode(bytes);

  /* ---------------------------------------------------------
     1. ZIP (la "carpeta comprimida" del .xlsx)
     --------------------------------------------------------- */

  /** Tabla para calcular el CRC32 (número de control que exige el formato ZIP). */
  const TABLA_CRC = (() => {
    const tabla = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      tabla[n] = c >>> 0;
    }
    return tabla;
  })();

  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = TABLA_CRC[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  /**
   * Arma un ZIP sin comprimir con los archivos dados ({ ruta: texto }).
   * Devuelve los bytes (Uint8Array).
   */
  function crearZip(archivos) {
    const partes = [];
    const centrales = [];
    let posicion = 0;
    Object.entries(archivos).forEach(([ruta, contenido]) => {
      const nombre = codificar(ruta);
      const datos = typeof contenido === 'string' ? codificar(contenido) : contenido;
      const crc = crc32(datos);
      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true); // firma de archivo
      local.setUint16(4, 20, true);         // versión necesaria
      local.setUint16(6, 0x0800, true);     // nombres en UTF-8
      local.setUint16(8, 0, true);          // sin compresión
      local.setUint16(10, 0, true);         // hora
      local.setUint16(12, 0x21, true);      // fecha (1980-01-01)
      local.setUint32(14, crc, true);
      local.setUint32(18, datos.length, true);
      local.setUint32(22, datos.length, true);
      local.setUint16(26, nombre.length, true);
      local.setUint16(28, 0, true);
      partes.push(new Uint8Array(local.buffer), nombre, datos);

      const central = new DataView(new ArrayBuffer(46));
      central.setUint32(0, 0x02014b50, true);
      central.setUint16(4, 20, true);
      central.setUint16(6, 20, true);
      central.setUint16(8, 0x0800, true);
      central.setUint16(10, 0, true);
      central.setUint16(12, 0, true);
      central.setUint16(14, 0x21, true);
      central.setUint32(16, crc, true);
      central.setUint32(20, datos.length, true);
      central.setUint32(24, datos.length, true);
      central.setUint16(28, nombre.length, true);
      central.setUint32(42, posicion, true);
      centrales.push(new Uint8Array(central.buffer), nombre);
      posicion += 30 + nombre.length + datos.length;
    });
    const tamanoCentral = centrales.reduce((s, p) => s + p.length, 0);
    const fin = new DataView(new ArrayBuffer(22));
    fin.setUint32(0, 0x06054b50, true);
    fin.setUint16(8, Object.keys(archivos).length, true);
    fin.setUint16(10, Object.keys(archivos).length, true);
    fin.setUint32(12, tamanoCentral, true);
    fin.setUint32(16, posicion, true);
    return unir([...partes, ...centrales, new Uint8Array(fin.buffer)]);
  }

  function unir(partes) {
    const total = new Uint8Array(partes.reduce((s, p) => s + p.length, 0));
    let i = 0;
    partes.forEach((p) => { total.set(p, i); i += p.length; });
    return total;
  }

  /** Descomprime datos "deflate" (el método que usan Excel y Google Sheets). */
  async function descomprimir(bytes) {
    const flujo = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(flujo).arrayBuffer());
  }

  /**
   * Lee un ZIP y devuelve una función para pedir cada archivo por su ruta:
   * leer('xl/workbook.xml') → texto, o null si no existe.
   */
  function abrirZip(bytes) {
    const vista = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let fin = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
      if (vista.getUint32(i, true) === 0x06054b50) { fin = i; break; }
    }
    if (fin < 0) throw new Error('no-es-zip');
    const cantidad = vista.getUint16(fin + 10, true);
    let p = vista.getUint32(fin + 16, true);
    const entradas = {};
    for (let n = 0; n < cantidad; n++) {
      if (vista.getUint32(p, true) !== 0x02014b50) throw new Error('zip-danado');
      const metodo = vista.getUint16(p + 10, true);
      const tamano = vista.getUint32(p + 20, true);
      const largoNombre = vista.getUint16(p + 28, true);
      const largoExtra = vista.getUint16(p + 30, true);
      const largoComentario = vista.getUint16(p + 32, true);
      const local = vista.getUint32(p + 42, true);
      const ruta = decodificar(bytes.subarray(p + 46, p + 46 + largoNombre));
      entradas[ruta] = { metodo, tamano, local };
      p += 46 + largoNombre + largoExtra + largoComentario;
    }
    return async (ruta) => {
      const e = entradas[ruta];
      if (!e) return null;
      const inicio = e.local + 30 + vista.getUint16(e.local + 26, true) + vista.getUint16(e.local + 28, true);
      const datos = bytes.subarray(inicio, inicio + e.tamano);
      if (e.metodo === 0) return decodificar(datos);
      if (e.metodo === 8) return decodificar(await descomprimir(datos));
      throw new Error('zip-metodo');
    };
  }

  /* ---------------------------------------------------------
     2. Crear un .xlsx
     --------------------------------------------------------- */

  const escaparXml = (texto) => String(texto)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    // caracteres de control que Excel no acepta
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

  /** Letra de columna de Excel: 0 → A, 1 → B, ... 26 → AA. */
  function letraColumna(n) {
    let letras = '';
    for (n += 1; n > 0; n = Math.floor((n - 1) / 26)) letras = String.fromCharCode(65 + ((n - 1) % 26)) + letras;
    return letras;
  }

  /**
   * Una hoja: "filas" es una lista de listas de textos. La primera fila es el
   * encabezado (en negrita, con fondo amarillo y fija al bajar).
   * Todas las celdas tienen formato "Texto" para que Excel no cambie los
   * teléfonos (no les quita el + ni los ceros, ni los pasa a 5,06E+10).
   */
  function hojaXml(filas, anchos) {
    const columnas = anchos.map((a, i) => `<col min="${i + 1}" max="${i + 1}" width="${a}" style="1" customWidth="1"/>`).join('');
    const datos = filas.map((fila, f) => `<row r="${f + 1}">${fila.map((valor, c) =>
      `<c r="${letraColumna(c)}${f + 1}" t="inlineStr" s="${f === 0 ? 2 : 1}"><is><t xml:space="preserve">${escaparXml(valor)}</t></is></c>`
    ).join('')}</row>`).join('');
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
      + '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
      + `<cols>${columnas}</cols><sheetData>${datos}</sheetData></worksheet>`;
  }

  /**
   * Crea un archivo .xlsx. "hojas" es una lista de { nombre, filas, anchos }.
   * Devuelve los bytes (Uint8Array).
   */
  function crearXlsx(hojas) {
    const ns = 'http://schemas.openxmlformats.org';
    const archivos = {
      '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + `<Types xmlns="${ns}/package/2006/content-types">`
        + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        + '<Default Extension="xml" ContentType="application/xml"/>'
        + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
        + hojas.map((h, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')
        + '</Types>',
      '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + `<Relationships xmlns="${ns}/package/2006/relationships">`
        + `<Relationship Id="rId1" Type="${ns}/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>`
        + '</Relationships>',
      'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + `<workbook xmlns="${ns}/spreadsheetml/2006/main" xmlns:r="${ns}/officeDocument/2006/relationships"><sheets>`
        + hojas.map((h, i) => `<sheet name="${escaparXml(h.nombre)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')
        + '</sheets></workbook>',
      'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + `<Relationships xmlns="${ns}/package/2006/relationships">`
        + hojas.map((h, i) => `<Relationship Id="rId${i + 1}" Type="${ns}/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')
        + `<Relationship Id="rId${hojas.length + 1}" Type="${ns}/officeDocument/2006/relationships/styles" Target="styles.xml"/>`
        + '</Relationships>',
      // Estilos: 0 normal, 1 texto, 2 encabezado (texto en negrita con fondo amarillo)
      'xl/styles.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + `<styleSheet xmlns="${ns}/spreadsheetml/2006/main">`
        + '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
        + '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>'
        + '<fill><patternFill patternType="solid"><fgColor rgb="FFFCCC02"/><bgColor indexed="64"/></patternFill></fill></fills>'
        + '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
        + '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        + '<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
        + '<xf numFmtId="49" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'
        + '<xf numFmtId="49" fontId="1" fillId="2" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1"/></cellXfs>'
        + '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'
    };
    hojas.forEach((h, i) => { archivos[`xl/worksheets/sheet${i + 1}.xml`] = hojaXml(h.filas, h.anchos || h.filas[0].map(() => 20)); });
    return crearZip(archivos);
  }

  /* ---------------------------------------------------------
     3. Leer un .xlsx o un .csv → lista de filas (listas de textos)
     --------------------------------------------------------- */

  const desescaparXml = (texto) => texto
    .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

  /** Junta todo el texto de las etiquetas <t> (sin las guías fonéticas <rPh>). */
  const textoDe = (xml) => (xml.replace(/<rPh\b[\s\S]*?<\/rPh>/g, '').match(/<t\b[^>]*>[\s\S]*?<\/t>/g) || [])
    .map((t) => desescaparXml(t.replace(/<[^>]+>/g, ''))).join('');

  /** Número de columna desde la referencia de celda: "C7" → 2. */
  function columnaDe(referencia) {
    const letras = (referencia.match(/^[A-Z]+/i) || ['A'])[0].toUpperCase();
    return [...letras].reduce((n, l) => n * 26 + l.charCodeAt(0) - 64, 0) - 1;
  }

  /** Un número de Excel como texto, sin notación científica (5.0688881111E10 → 50688881111). */
  function numeroATexto(valor) {
    if (!/e/i.test(valor)) return valor.replace(/\.0+$/, '');
    const n = Number(valor);
    return Number.isFinite(n) && Number.isInteger(n) ? BigInt(n).toString() : valor;
  }

  /** Lee la primera hoja de un .xlsx. Devuelve una promesa con la lista de filas. */
  async function leerXlsx(bytes) {
    const leer = abrirZip(bytes);
    // Hoja 1 según el libro (por si no se llama sheet1.xml)
    let ruta = 'xl/worksheets/sheet1.xml';
    const libro = await leer('xl/workbook.xml');
    const relaciones = await leer('xl/_rels/workbook.xml.rels');
    if (libro && relaciones) {
      const id = (libro.match(/<sheet\b[^>]*\br:id="([^"]+)"/) || [])[1];
      const rel = id && relaciones.match(new RegExp(`<Relationship\\b[^>]*\\bId="${id}"[^>]*>`));
      const destino = rel && (rel[0].match(/Target="([^"]+)"/) || [])[1];
      if (destino) ruta = destino.startsWith('/') ? destino.slice(1) : 'xl/' + destino;
    }
    const hoja = await leer(ruta);
    if (!hoja) throw new Error('sin-hoja');
    const compartidosXml = await leer('xl/sharedStrings.xml');
    const compartidos = compartidosXml ? (compartidosXml.match(/<si\b[\s\S]*?<\/si>/g) || []).map(textoDe) : [];

    const filas = [];
    // (las filas vacías "<row .../>" se quitan antes, para no confundirlas)
    (hoja.replace(/<row\b[^>]*\/>/g, '').match(/<row\b[^>]*>[\s\S]*?<\/row>/g) || []).forEach((filaXml) => {
      const numero = Number((filaXml.match(/^<row\b[^>]*\br="(\d+)"/) || [])[1]) || filas.length + 1;
      const fila = [];
      const celdas = filaXml.match(/<c\b[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g) || [];
      celdas.forEach((celda, i) => {
        const apertura = celda.match(/^<c\b[^>]*?\/?>/)[0];
        const ref = (apertura.match(/\br="([^"]+)"/) || [])[1];
        const tipo = (apertura.match(/\bt="([^"]+)"/) || [])[1] || 'n';
        const v = (celda.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
        let valor = '';
        if (tipo === 's') valor = compartidos[Number(v)] || '';
        else if (tipo === 'inlineStr') valor = textoDe(celda);
        else if (v !== undefined) valor = tipo === 'n' ? numeroATexto(desescaparXml(v)) : desescaparXml(v);
        fila[ref ? columnaDe(ref) : i] = valor;
      });
      filas[numero - 1] = Array.from(fila, (x) => x || '');
    });
    return Array.from(filas, (x) => x || []);
  }

  /**
   * Lee un CSV. Excel en español lo guarda con ";" y otros programas con ",":
   * se elige el separador que más aparece en la primera línea.
   */
  function leerCsv(texto) {
    texto = texto.replace(/^﻿/, '');
    const primera = texto.split(/\r?\n/)[0] || '';
    const separador = [';', ',', '\t'].reduce((mejor, s) => (primera.split(s).length > primera.split(mejor).length ? s : mejor), ';');
    const filas = [];
    let fila = [];
    let celda = '';
    let entreComillas = false;
    for (let i = 0; i < texto.length; i++) {
      const ch = texto[i];
      if (entreComillas) {
        if (ch === '"' && texto[i + 1] === '"') { celda += '"'; i++; } else if (ch === '"') entreComillas = false;
        else celda += ch;
      } else if (ch === '"') entreComillas = true;
      else if (ch === separador) { fila.push(celda); celda = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && texto[i + 1] === '\n') i++;
        fila.push(celda); filas.push(fila); fila = []; celda = '';
      } else celda += ch;
    }
    if (celda || fila.length) { fila.push(celda); filas.push(fila); }
    return filas;
  }

  /** Texto de un archivo CSV: UTF-8, o la codificación vieja de Windows si no es UTF-8. */
  function textoDeCsv(bytes) {
    try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch (e) {
      return new TextDecoder('windows-1252').decode(bytes);
    }
  }

  /**
   * Lee un archivo (bytes + nombre) y devuelve las filas.
   * Acepta .xlsx y .csv; el .xls viejo no se puede leer sin bibliotecas.
   */
  async function leerArchivo(bytes, nombre) {
    const esZip = bytes[0] === 0x50 && bytes[1] === 0x4B;
    if (esZip) return leerXlsx(bytes);
    if (/\.xls$/i.test(nombre) || (bytes[0] === 0xD0 && bytes[1] === 0xCF)) throw new Error('xls-viejo');
    return leerCsv(textoDeCsv(bytes));
  }

  /* ---------------------------------------------------------
     4. Filas ⇄ clientes
     --------------------------------------------------------- */

  const normal = (texto) => String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

  /** Columnas de la plantilla (el orden en que se descargan). */
  const COLUMNAS = ['Nombre', 'Teléfono', 'Nota', 'Etiquetas', 'Acepta novedades'];

  /** Reconoce el encabezado aunque esté escrito distinto ("Celular", "Notas", "Grupo"...). */
  const RECONOCER = {
    nombre: /^(nombre|cliente)/,
    telefono: /^(telefono|celular|movil|whatsapp|numero|tel\b)/,
    nota: /^(nota|comentario|observacion)/,
    etiquetas: /^(etiqueta|grupo)/,
    novedades: /^(acepta|novedad|permiso)/
  };

  /** "Sí", "si", "x", "1", "yes", "true" = acepta. Vacío o cualquier otra cosa = no acepta. */
  const esSi = (texto) => /^(si|s|x|1|yes|y|true|verdadero|acepta)$/.test(normal(texto).replace(/[.!]/g, ''));

  /** Las filas que empiezan con "EJEMPLO" en el nombre se ignoran (son de la plantilla). */
  const esEjemplo = (nombre) => normal(nombre).startsWith('ejemplo');

  /**
   * Convierte las filas leídas en clientes.
   * codigoPais: el código del país del negocio, para números escritos sin "+".
   * Devuelve { clientes: [{ fila, nombre, telefono, nota, etiquetas, aceptaNovedades }], errores: [{ fila, motivo, nombre }] }
   * motivo: 'sinNombre' | 'telefono' | 'repetidoArchivo'.
   */
  function filasAClientes(filas, codigoPais, normalizarTelefono, telefonoValido) {
    // Buscar el encabezado en las primeras 5 filas; si no hay, se usa el orden de la plantilla
    let inicio = 0;
    let cols = { nombre: 0, telefono: 1, nota: 2, etiquetas: 3, novedades: 4 };
    for (let f = 0; f < Math.min(5, filas.length); f++) {
      const encontrado = {};
      (filas[f] || []).forEach((celda, c) => {
        Object.entries(RECONOCER).forEach(([campo, regla]) => {
          if (encontrado[campo] === undefined && regla.test(normal(celda))) encontrado[campo] = c;
        });
      });
      if (encontrado.nombre !== undefined && encontrado.telefono !== undefined) {
        cols = { nota: -1, etiquetas: -1, novedades: -1, ...encontrado };
        inicio = f + 1;
        break;
      }
    }

    const clientes = [];
    const errores = [];
    const vistos = new Set();
    for (let f = inicio; f < filas.length; f++) {
      const fila = filas[f] || [];
      const celda = (c) => (c >= 0 ? String(fila[c] || '').trim() : '');
      const nombre = celda(cols.nombre).slice(0, 80);
      const telefonoEscrito = celda(cols.telefono);
      if (!nombre && !telefonoEscrito) continue; // fila vacía
      if (esEjemplo(nombre)) continue;
      const numeroFila = f + 1; // como lo muestra Excel
      if (!nombre) { errores.push({ fila: numeroFila, motivo: 'sinNombre', nombre: telefonoEscrito }); continue; }
      const telefono = normalizarTelefono(telefonoEscrito, codigoPais);
      if (!telefonoValido(telefono)) { errores.push({ fila: numeroFila, motivo: 'telefono', nombre }); continue; }
      if (vistos.has(telefono)) { errores.push({ fila: numeroFila, motivo: 'repetidoArchivo', nombre }); continue; }
      vistos.add(telefono);
      const etiquetas = [...new Set(celda(cols.etiquetas).split(/[,;/]/).map((e) => e.trim().slice(0, 30)).filter(Boolean))];
      clientes.push({ fila: numeroFila, nombre, telefono, nota: celda(cols.nota).slice(0, 500), etiquetas, aceptaNovedades: esSi(celda(cols.novedades)) });
    }
    return { clientes, errores };
  }

  /**
   * Filas para descargar: encabezado + un cliente por fila.
   * formatear: cómo escribir el teléfono (por defecto "+" y los dígitos).
   */
  function clientesAFilas(clientes, formatear = (digitos) => '+' + digitos) {
    return [COLUMNAS, ...clientes.map((c) => [c.nombre, formatear(c.telefono), c.nota || '', (c.etiquetas || []).join(', '), c.aceptaNovedades ? 'Sí' : 'No'])];
  }

  const TucankitExcel = { crc32, crearZip, abrirZip, crearXlsx, leerXlsx, leerCsv, leerArchivo, COLUMNAS, filasAClientes, clientesAFilas };

  if (typeof module !== 'undefined' && module.exports) module.exports = TucankitExcel;
  global.TucankitExcel = TucankitExcel;
})(typeof globalThis !== 'undefined' ? globalThis : this);
