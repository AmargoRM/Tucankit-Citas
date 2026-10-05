/* =========================================================
   Pruebas automáticas de core.js (no forman parte de la app).
   Se ejecutan con:  node pruebas/core.test.js
   No necesitan instalar nada.
   ========================================================= */
'use strict';
process.env.TZ = 'America/Costa_Rica';
const assert = require('node:assert/strict');
const C = require('../core.js');

let pasadas = 0;
async function prueba(nombre, fn) {
  try {
    await fn();
    pasadas += 1;
    console.log('✓', nombre);
  } catch (error) {
    console.error('✗', nombre);
    console.error(error);
    process.exitCode = 1;
  }
}

(async () => {
  await prueba('teléfonos', () => {
    assert.equal(C.normalizarTelefono('8888-8888', '506'), '50688888888');
    assert.equal(C.normalizarTelefono('+1 (305) 555-1234', '506'), '13055551234');
    assert.equal(C.normalizarTelefono('0 8888 8888', '506'), '50688888888');
    assert.equal(C.normalizarTelefono('506 8888 8888', '506'), '50688888888');
    assert.equal(C.formatearTelefono('50688888888', '506'), '+506 8888 8888');
  });

  await prueba('fechas sin corrimiento de zona horaria', () => {
    assert.equal(C.fechaAmigable('2026-10-07').startsWith('miércoles 7 de octubre'), true);
    assert.equal(C.horaAmigable('15:30'), '3:30 p. m.');
    assert.equal(C.sumarDias('2026-12-31', 1), '2027-01-01');
  });

  await prueba('montos según el país', () => {
    // Costa Rica: coma decimal
    assert.equal(C.leerMonto('15.000', 'es-CR'), 15000);
    assert.equal(C.leerMonto('15 000', 'es-CR'), 15000);
    assert.equal(C.leerMonto('15000,50', 'es-CR'), 15000.5);
    // México: punto decimal
    assert.equal(C.leerMonto('15,000', 'es-MX'), 15000);
    assert.equal(C.leerMonto('15000.50', 'es-MX'), 15000.5);
    assert.equal(C.leerMonto('15.000', 'es-MX'), 15000); // 3 cifras = miles en cualquier país
    assert.equal(C.formatearMonto(15000, '$', 'es-MX'), '$15,000');
    assert.match(C.formatearMonto(15000, '₡', 'es-CR'), /^₡15\s?000$/u);
    assert.equal(C.formatearMonto(15000, '€', 'es-ES'), '€15.000');
  });

  await prueba('países', () => {
    assert.equal(C.adivinarPais('es-MX', ''), 'MX');
    assert.equal(C.adivinarPais('es', 'America/Costa_Rica'), 'CR');
    assert.equal(C.adivinarPais('es-419', 'Asia/Tokyo'), null);
    assert.equal(C.paisPorPrefijo('506'), 'CR');
    assert.equal(C.bandera('MX'), '🇲🇽');
  });

  await prueba('mensaje con firma y datos vacíos', () => {
    const texto = C.armarMensaje(C.plantillaPorDefecto('entrega'), { nombre: 'Ana', detalle: '', fecha: 'martes' }, '— Laura');
    assert.equal(texto, 'Hola Ana, te aviso que tu pedido llega el martes. ¡Gracias!\n\n— Laura');
  });

  const A = 'dispositivo-A';
  const B = 'dispositivo-B';

  await prueba('mezcla: cambios distintos en cada dispositivo no se pierden', () => {
    const base = C.sellar({ id: 'r1', detalle: 'original' }, A, 1000);
    const enA = [base, C.sellar({ id: 'r2', detalle: 'nuevo en A' }, A, 2000)];
    const enB = [base, C.sellar({ id: 'r3', detalle: 'nuevo en B' }, B, 2100)];
    const { lista, resumen } = C.mezclarLista(enA, enB);
    assert.deepEqual(lista.map((r) => r.id).sort(), ['r1', 'r2', 'r3']);
    assert.deepEqual(resumen, { agregados: 1, actualizados: 0, borrados: 0 });
  });

  await prueba('mezcla: conflicto en el mismo registro gana el más reciente (en ambos sentidos)', () => {
    const enA = [C.sellar({ id: 'r1', detalle: 'cambio de A' }, A, 5000)];
    const enB = [C.sellar({ id: 'r1', detalle: 'cambio de B' }, B, 6000)];
    assert.equal(C.mezclarLista(enA, enB).lista[0].detalle, 'cambio de B');
    assert.equal(C.mezclarLista(enB, enA).lista[0].detalle, 'cambio de B');
    assert.equal(C.mezclarLista(enA, enB).resumen.actualizados, 1);
  });

  await prueba('mezcla: empate exacto da el mismo resultado en ambos dispositivos', () => {
    const enA = [C.sellar({ id: 'r1', detalle: 'A' }, A, 7000)];
    const enB = [C.sellar({ id: 'r1', detalle: 'B' }, B, 7000)];
    assert.equal(C.mezclarLista(enA, enB).lista[0].detalle, C.mezclarLista(enB, enA).lista[0].detalle);
  });

  await prueba('mezcla: un borrado viaja al otro dispositivo', () => {
    const original = C.sellar({ id: 'r1', detalle: 'x' }, A, 1000);
    const borradoEnA = C.marcarBorrado(original, A, 3000);
    const { lista, resumen } = C.mezclarLista([original], [borradoEnA]);
    assert.equal(C.estaActivo(lista[0]), false);
    assert.equal(resumen.borrados, 1);
  });

  await prueba('mezcla: un cambio viejo no resucita un borrado más nuevo', () => {
    const borrado = C.marcarBorrado({ id: 'r1' }, A, 5000);
    const viejo = C.sellar({ id: 'r1', detalle: 'viejo' }, B, 4000);
    assert.equal(C.estaActivo(C.mezclarLista([borrado], [viejo]).lista[0]), false);
  });

  await prueba('limpieza de borrados de más de 90 días', () => {
    const ahora = Date.UTC(2026, 9, 5);
    const viejo = C.marcarBorrado({ id: 'v' }, A, ahora - 91 * 86400000);
    const reciente = C.marcarBorrado({ id: 'n' }, A, ahora - 10 * 86400000);
    assert.deepEqual(C.limpiarBorrados([viejo, reciente], ahora).map((r) => r.id), ['n']);
  });

  await prueba('ajustes se mezclan campo por campo y respetan los campos propios', () => {
    const local = {
      negocio: 'Garúa', atiende: 'Ana', nombreDispositivo: 'Celular',
      _sello: { negocio: { actualizadoEn: 9000, dispositivoId: A }, atiende: { actualizadoEn: 1000, dispositivoId: A } }
    };
    const remoto = {
      negocio: 'Viejo', atiende: 'Laura', nombreDispositivo: 'Computadora',
      _sello: { negocio: { actualizadoEn: 5000, dispositivoId: B }, atiende: { actualizadoEn: 6000, dispositivoId: B } }
    };
    const { ajustes, actualizados } = C.mezclarAjustes(local, remoto, ['negocio', 'atiende']);
    assert.equal(ajustes.negocio, 'Garúa');
    assert.equal(ajustes.atiende, 'Laura');
    assert.equal(ajustes.nombreDispositivo, 'Celular');
    assert.equal(actualizados, 1);
  });

  await prueba('mezclarDatos suma el resumen de todo', () => {
    const local = { clientes: [], recordatorios: [], etiquetas: [], ajustes: {} };
    const remoto = {
      clientes: [C.sellar({ id: 'c1' }, B, 1)],
      recordatorios: [C.sellar({ id: 'r1' }, B, 1), C.marcarBorrado({ id: 'r2' }, B, Date.now())],
      etiquetas: [C.sellar({ id: 'e1' }, B, 1)],
      ajustes: {}
    };
    const { datos, resumen } = C.mezclarDatos(local, remoto, []);
    assert.deepEqual(resumen, { agregados: 3, actualizados: 0, borrados: 0 });
    assert.equal(datos.recordatorios.length, 2); // el borrado se guarda como marca
  });

  await prueba('QR: comprimir + base64url + partir (con dirección web) + unir en desorden', async () => {
    // Datos variados (un texto repetido se comprime demasiado y cabría en un solo QR)
    const original = JSON.stringify(Array.from({ length: 300 }, (_, i) => ({ id: `id-${i * 7919}`, nombre: `Clienta Ñandú ${i}`, monto: i * 1371 % 9973 })));
    const bytes = await C.comprimir(original);
    const texto64 = C.aBase64Url(bytes);
    assert.match(texto64, /^[A-Za-z0-9_-]+$/, 'solo caracteres seguros para una dirección web');
    const partes = C.crearPartesQR(texto64, 'AB12', 'https://amargorm.github.io/Tucankit-Citas/', 200);
    assert.ok(partes.length > 2, 'debería necesitar varias partes');
    assert.ok(partes[0].startsWith('https://amargorm.github.io/Tucankit-Citas/#qr=TK4.AB12.1.'));
    assert.ok(!/\s/.test(partes[0]), 'sin espacios (si no, la cámara no lo reconoce como enlace)');
    const desordenadas = [...partes].reverse().map(C.leerParteQR);
    const unido = C.unirPartesQR(desordenadas);
    assert.equal(await C.descomprimir(C.deBase64Url(unido)), original);
    assert.equal(C.unirPartesQR(desordenadas.slice(1)), null, 'si falta una parte no debe unir');
    assert.equal(C.leerParteQR('https://otra-cosa.com'), null);
  });

  console.log(`\n${pasadas} pruebas pasaron.`);
})();
