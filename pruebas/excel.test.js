/* =========================================================
   Pruebas automáticas de excel.js (no forman parte de la app).
   Se ejecutan con:  node pruebas/excel.test.js
   ========================================================= */
'use strict';
const assert = require('node:assert/strict');
const zlib = require('node:zlib');
const X = require('../excel.js');
const C = require('../core.js');

let pasadas = 0;
async function prueba(nombre, fn) {
  try { await fn(); pasadas += 1; console.log('✓', nombre); } catch (error) {
    console.error('✗', nombre); console.error(error); process.exitCode = 1;
  }
}

/** Arma un ZIP comprimido (como lo guarda Excel) con zlib de Node. */
function zipComprimido(archivos) {
  const partes = []; const centrales = []; let pos = 0;
  for (const [ruta, texto] of Object.entries(archivos)) {
    const nombre = Buffer.from(ruta); const crudo = Buffer.from(texto); const datos = zlib.deflateRawSync(crudo);
    const crc = X.crc32(crudo);
    const l = Buffer.alloc(30); l.writeUInt32LE(0x04034b50, 0); l.writeUInt16LE(20, 4); l.writeUInt16LE(8, 8);
    l.writeUInt32LE(crc, 14); l.writeUInt32LE(datos.length, 18); l.writeUInt32LE(crudo.length, 22); l.writeUInt16LE(nombre.length, 26);
    const c = Buffer.alloc(46); c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(8, 10); c.writeUInt32LE(crc, 16);
    c.writeUInt32LE(datos.length, 20); c.writeUInt32LE(crudo.length, 24); c.writeUInt16LE(nombre.length, 28); c.writeUInt32LE(pos, 42);
    partes.push(l, nombre, datos); centrales.push(c, nombre); pos += 30 + nombre.length + datos.length;
  }
  const cd = Buffer.concat(centrales); const f = Buffer.alloc(22); f.writeUInt32LE(0x06054b50, 0);
  f.writeUInt16LE(Object.keys(archivos).length, 8); f.writeUInt16LE(Object.keys(archivos).length, 10); f.writeUInt32LE(cd.length, 12); f.writeUInt32LE(pos, 16);
  return new Uint8Array(Buffer.concat([...partes, cd, f]));
}

const convertir = (filas) => X.filasAClientes(filas, '506', C.normalizarTelefono, C.telefonoValido);

(async () => {
  await prueba('crear y volver a leer un Excel (.xlsx)', async () => {
    const filas = [X.COLUMNAS, ['Ana <Pérez> & Cía', '+506 8888 1111', 'Nota "con" comillas', 'VIP, Zapatos', 'Sí']];
    const bytes = X.crearXlsx([{ nombre: 'Clientes', filas }, { nombre: 'Instrucciones', filas: [['Hola']] }]);
    const leidas = await X.leerArchivo(bytes, 'clientes.xlsx');
    assert.deepEqual(leidas, filas);
  });

  await prueba('leer un Excel guardado por Excel (comprimido, textos compartidos y números)', async () => {
    const bytes = zipComprimido({
      'xl/workbook.xml': '<workbook xmlns:r="x"><sheets><sheet name="Hoja1" sheetId="1" r:id="rId7"/></sheets></workbook>',
      'xl/_rels/workbook.xml.rels': '<Relationships><Relationship Id="rId7" Type="w" Target="worksheets/hoja.xml"/></Relationships>',
      'xl/sharedStrings.xml': '<sst><si><t>Nombre</t></si><si><t>Celular</t></si><si><r><t>María</t></r><r><t xml:space="preserve"> José</t></r></si><si><t>Notas</t></si></sst>',
      'xl/worksheets/hoja.xml': '<worksheet><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="D1" t="s"><v>3</v></c></row>'
        + '<row r="2"/><row r="3"><c r="A3" t="s"><v>2</v></c><c r="B3"><v>5.0688882222E10</v></c><c r="D3" t="str"><v>a &amp; b</v></c></row></sheetData></worksheet>'
    });
    const filas = await X.leerArchivo(bytes, 'de-excel.xlsx');
    assert.deepEqual(filas[0], ['Nombre', 'Celular', '', 'Notas']);
    assert.deepEqual(filas[2], ['María José', '50688882222', '', 'a & b']);
    const { clientes } = convertir(filas);
    assert.deepEqual(clientes.map((c) => [c.nombre, c.telefono, c.nota]), [['María José', '50688882222', 'a & b']]);
  });

  await prueba('leer CSV de Excel en español (punto y coma, comillas, acentos de Windows)', async () => {
    const texto = 'Nombre;Teléfono;Nota;Etiquetas\r\n"Pérez; Luis";8888 3333;"dice ""hola""";VIP\r\n';
    assert.deepEqual(X.leerCsv(texto)[1], ['Pérez; Luis', '8888 3333', 'dice "hola"', 'VIP']);
    const windows = Uint8Array.from([0x4E, 0x6F, 0x6D, 0x62, 0x72, 0x65, 0x2C, 0x54, 0x65, 0x6C, 0xE9, 0x66, 0x6F, 0x6E, 0x6F, 0x0A, 0x4A, 0x6F, 0x73, 0xE9, 0x2C, 0x38, 0x38, 0x38, 0x38, 0x34, 0x34, 0x34, 0x34]);
    assert.deepEqual(await X.leerArchivo(windows, 'x.csv'), [['Nombre', 'Teléfono'], ['José', '88884444']]);
  });

  await prueba('filas a clientes: ejemplo, errores, repetidos y etiquetas', () => {
    const { clientes, errores } = convertir([
      ['Instrucciones: complete la tabla'],
      ['NOMBRE', 'Whatsapp', 'Nota', 'Grupo'],
      ['EJEMPLO (borre esta fila)', '8888 0000', '', ''],
      ['Ana', '8888-1111', 'Prefiere mañanas', 'VIP, Zapatos; VIP'],
      ['', '8888 2222'],
      ['Beto', '123'],
      ['Carla', '+52 55 1234 5678', '', ''],
      ['Ana otra vez', '88881111'],
      ['', '']
    ]);
    assert.deepEqual(clientes.map((c) => [c.fila, c.nombre, c.telefono, c.etiquetas]), [
      [4, 'Ana', '50688881111', ['VIP', 'Zapatos']],
      [7, 'Carla', '525512345678', []]
    ]);
    assert.deepEqual(errores.map((e) => [e.fila, e.motivo]), [[5, 'sinNombre'], [6, 'telefono'], [8, 'repetidoArchivo']]);
  });

  await prueba('sin encabezado se usa el orden de la plantilla', () => {
    assert.equal(convertir([['Diego', '88885555', 'nota']]).clientes[0].telefono, '50688885555');
  });

  await prueba('descargar clientes y volver a importarlos da lo mismo', async () => {
    const originales = [
      { nombre: 'Ana', telefono: '50688881111', nota: 'x', etiquetas: ['VIP'], aceptaNovedades: true },
      { nombre: 'Beto', telefono: '50688882222', nota: '', etiquetas: [], aceptaNovedades: false }
    ];
    const bytes = X.crearXlsx([{ nombre: 'Clientes', filas: X.clientesAFilas(originales) }]);
    const { clientes } = convertir(await X.leerArchivo(bytes, 'a.xlsx'));
    assert.deepEqual(clientes.map(({ fila, ...c }) => c), originales);
  });

  await prueba('columna «Acepta novedades»: Sí, x, vacío y No', () => {
    const { clientes } = convertir([
      ['Nombre', 'Teléfono', 'Acepta novedades'],
      ['Ana', '88881111', 'Sí'], ['Beto', '88882222', 'x'], ['Caro', '88883333', ''], ['Dani', '88884444', 'No']
    ]);
    assert.deepEqual(clientes.map((c) => c.aceptaNovedades), [true, true, false, false]);
  });

  console.log(`\n${pasadas} pruebas pasaron.`);
})();
