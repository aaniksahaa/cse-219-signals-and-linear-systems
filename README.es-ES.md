

# CSE 219 · Señales y Sistemas Lineales

Un sitio web estático del curso para demostraciones interactivas de Señales y Sistemas Lineales. El 
sitio se construye con HTML, CSS y JavaScript puros, por lo que se ejecuta completamente en el 
navegador sin backend, sin pasos de compilación y sin instalación de paquetes.

Las páginas están diseñadas para uso en el curso: los estudiantes pueden abrir una demostración, 
manipular las señales visualmente y escuchar o ver el resultado localmente en su navegador. Los 
datos cargados o grabados se mantienen en la máquina del usuario.

## Ejecutar localmente

La opción más rápida es abrir `index.html` directamente en un navegador.

Para funciones que requieren un contexto seguro del navegador, como la grabación de micrófono, 
sirve la carpeta a través de `localhost`:

```bash
./serve.sh
```

Luego abre:

```text
http://localhost:8000
```

También puedes elegir un puerto diferente:

```bash
./serve.sh 9000
```

## Estructura del proyecto

```text
.
├── index.html                  # Página de inicio con enlaces a las demos
├── *.html                      # Páginas individuales de demos interactivas
├── assets/
│   ├── site.css                # Estilos compartidos de estructura y diseño del sitio
│   ├── site.js                 # Barra lateral, navegación y pie de página compartidos
│   ├── audio-fourier.js        # Funciones auxiliares compartidas de audio/Procesamiento Digital de Señales (DSP) del lado del cliente
│   └── audios/
│       ├── library.json        # Manifiesto de clips de audio
│       └── *.mp3               # Clips de audio almacenados
├── docs/                       # Notas de apoyo
├── ref/                        # Archivos fuente de referencia
├── favicon.svg
└── serve.sh                    # Script auxiliar para servidor estático local
```

## Editar el sitio

La barra lateral se genera a partir de `assets/site.js`. Actualiza la marca, los enlaces de 
navegación o el pie de página allí y todas las páginas que usen la barra lateral compartida lo 
reflejarán automáticamente.

Cada página de demostración debe incluir:

```html
<link rel="stylesheet" href="assets/site.css" />
<script src="assets/site.js" defer></script>
<aside class="sidebar" id="siteSidebar"></aside>
```

Las páginas de audio utilizan `assets/audio-fourier.js` para reproducción compartida, formas de 
onda, espectro, FFT/STFT y funciones auxiliares de la biblioteca de audio. Los clips almacenados 
se listan en `assets/audios/library.json`.

## Despliegue

El sitio puede alojarse en cualquier host de archivos estáticos. Para GitHub Pages:

1. Sube los archivos a un repositorio de GitHub.
2. Abre la configuración del repositorio (Settings) -> Pages.
3. Elige "Deploy from a branch."
4. Selecciona la rama y la carpeta que contienen `index.html`.
5. Guarda.

No se requiere ningún entorno de ejecución en el servidor; `index.html` es la página de inicio y 
toda la interactividad se ejecuta del lado del cliente.
