#!/usr/bin/env python3
"""
Genera los íconos de Tucankit Citas sin instalar nada (solo Python 3).

Uso (desde la carpeta raíz del proyecto):
    python3 tools/generar_iconos.py

Crea en la carpeta icons/:
    icon-192.png           ícono normal 192x192 (esquinas redondeadas)
    icon-512.png           ícono normal 512x512 (esquinas redondeadas)
    icon-maskable-512.png  ícono "maskable": fondo completo y dibujo más chico,
                           para que Android pueda recortarlo en círculo sin cortar el dibujo
    apple-touch-icon.png   180x180 con fondo completo, para iPhone

El dibujo: una "T" cuya barra de arriba es el pico de un tucán
(naranja y amarillo), el palo de color crema, un ojo verde azulado y fondo negro.
Es el mismo dibujo que el logo del encabezado en index.html (medidas de 0 a 100).
"""
import os
import struct
import zlib

# Colores de la marca (rojo, verde, azul)
NEGRO = (0x1C, 0x1D, 0x21)
NARANJA = (0xF2, 0x8C, 0x1B)
AMARILLO = (0xFF, 0xC9, 0x3C)
CREMA = (0xF6, 0xF4, 0xEF)
VERDE_AZULADO = (0x12, 0xA3, 0xA5)

MUESTRAS = 4  # puntos por lado dentro de cada píxel, para bordes suaves


def dentro_poligono(x, y, puntos):
    """Dice si el punto (x, y) está dentro del polígono (regla del rayo)."""
    dentro = False
    j = len(puntos) - 1
    for i in range(len(puntos)):
        xi, yi = puntos[i]
        xj, yj = puntos[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            dentro = not dentro
        j = i
    return dentro


def dentro_rect_redondeado(x, y, radio):
    """Rectángulo de 0 a 100 con esquinas redondeadas."""
    cx = min(max(x, radio), 100 - radio)
    cy = min(max(y, radio), 100 - radio)
    return (x - cx) ** 2 + (y - cy) ** 2 <= radio ** 2


# Figuras del dibujo, en medidas de 0 a 100 (igual que el SVG del encabezado)
PICO = [(20, 24), (70, 24), (86, 36), (70, 40), (20, 40)]
PICO_BRILLO = [(20, 24), (70, 24), (78, 30), (20, 30)]


def color_en(x, y):
    """Color del dibujo en el punto (x, y). Devuelve None si es fondo."""
    if (x - 30) ** 2 + (y - 32) ** 2 <= 4 ** 2:
        return VERDE_AZULADO
    if dentro_poligono(x, y, PICO_BRILLO):
        return AMARILLO
    if dentro_poligono(x, y, PICO):
        return NARANJA
    if 40 <= x <= 56 and 40 <= y <= 78:
        return CREMA
    return None


def dibujar(tamano, fondo_completo, escala):
    """
    Devuelve los píxeles (RGBA) del ícono.
    fondo_completo: True = cuadrado lleno; False = esquinas redondeadas transparentes.
    escala: tamaño del dibujo (1 = normal; menos de 1 = más chico y centrado).
    """
    filas = []
    for py in range(tamano):
        fila = bytearray()
        for px in range(tamano):
            r = g = b = a = 0
            for sy in range(MUESTRAS):
                for sx in range(MUESTRAS):
                    # Punto de muestra en medidas de 0 a 100
                    x = (px + (sx + 0.5) / MUESTRAS) / tamano * 100
                    y = (py + (sy + 0.5) / MUESTRAS) / tamano * 100
                    if not fondo_completo and not dentro_rect_redondeado(x, y, 22):
                        continue  # transparente
                    # Coordenadas del dibujo (achicado hacia el centro si escala < 1)
                    dx = 50 + (x - 50) / escala
                    dy = 50 + (y - 50) / escala
                    color = color_en(dx, dy) or NEGRO
                    r += color[0]
                    g += color[1]
                    b += color[2]
                    a += 255
            n = MUESTRAS * MUESTRAS
            if a:
                # Promedio de color solo de las muestras visibles
                visibles = a // 255
                fila += bytes((r // visibles, g // visibles, b // visibles, a // n))
            else:
                fila += bytes((0, 0, 0, 0))
        filas.append(bytes(fila))
    return filas


def guardar_png(ruta, tamano, filas):
    """Escribe un archivo PNG a mano (formato RGBA de 8 bits)."""
    def bloque(tipo, datos):
        contenido = tipo + datos
        return struct.pack('>I', len(datos)) + contenido + struct.pack('>I', zlib.crc32(contenido) & 0xFFFFFFFF)

    crudo = b''.join(b'\x00' + fila for fila in filas)
    png = b'\x89PNG\r\n\x1a\n'
    png += bloque(b'IHDR', struct.pack('>IIBBBBB', tamano, tamano, 8, 6, 0, 0, 0))
    png += bloque(b'IDAT', zlib.compress(crudo, 9))
    png += bloque(b'IEND', b'')
    with open(ruta, 'wb') as archivo:
        archivo.write(png)


def main():
    carpeta = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'icons')
    os.makedirs(carpeta, exist_ok=True)
    iconos = [
        # nombre, tamaño, fondo completo, escala del dibujo
        ('icon-192.png', 192, False, 1.0),
        ('icon-512.png', 512, False, 1.0),
        # El "maskable" debe tener lo importante dentro del 80 % central
        ('icon-maskable-512.png', 512, True, 0.78),
        ('apple-touch-icon.png', 180, True, 0.9),
    ]
    for nombre, tamano, completo, escala in iconos:
        ruta = os.path.join(carpeta, nombre)
        guardar_png(ruta, tamano, dibujar(tamano, completo, escala))
        print('Creado', os.path.normpath(ruta))


if __name__ == '__main__':
    main()
