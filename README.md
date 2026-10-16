# Cronómetro de Lectura

App para registrar sesiones de lectura: libro, minutos, avance (%) y tiempo restante según Kindle. Se instala como app en el celular o la computadora (PWA), **funciona con y sin conexión** y guarda todo en una hoja de Google mediante Apps Script.

## Cómo funciona

- **Esta repo** contiene solo la interfaz (HTML, service worker, manifiesto e iconos). Se publica con GitHub Pages.
- **Apps Script** (Code.gs, asociado a la hoja de cálculo) es la base de datos: responde en JSON con la lista de libros y las métricas, y recibe las sesiones nuevas.
- **Sin conexión:** el service worker guarda la app en el dispositivo y cada sesión se guarda primero ahí. Cuando vuelve la señal se envía sola a la hoja, con su fecha real y sin duplicarse.
- **La dirección de Apps Script no está en este repositorio.** Se pide una vez por dispositivo y se guarda localmente.

## Mi ritmo, metas y aviso de libro terminado

- **Mi ritmo** (sección plegable al final): gráfica de los últimos 7 días, minutos de hoy contra la meta diaria, total de la semana y la racha de días seguidos leyendo. Cada barra se divide por colores como el anillo: los primeros minutos de la meta en verde, los siguientes en dorado, azul y violeta; un día que no llegó a la meta queda en gris.
- **Metas:** diaria (minutos) y anual (libros). Se guardan en cada dispositivo y se pueden cambiar ahí mismo.
- **Libros terminados:** cuenta los libros que llegaron al 100 % en la hoja de sesiones durante el año actual, más el número que escribas en *Terminados sin cronómetro* (para igualarlo con tu Excel; se reinicia solo cada año).
- **Anillo del cronómetro:** muestra la meta diaria. Cada vuelta completa es una meta; las vueltas extra se dibujan encima con otro color (dorado, azul, violeta).
- **Aviso al terminar:** al guardar una sesión con 100 % aparece una pantalla de felicitación con los minutos de la sesión, el total del libro y cuántos llevas en el año.
- Todo funciona sin conexión: usa los datos guardados más las sesiones pendientes de enviar.

## Archivos

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | La app completa (interfaz y lógica) |
| `sw.js` | Service worker: guarda la app para abrirla sin conexión |
| `manifest.json` | Datos para instalarla como app |
| `icon-192.png`, `icon-512.png` | Iconos normales |
| `icon-maskable-512.png`, `apple-touch-icon.png` | Iconos para Android (recortables) e iPhone |

## Puesta en marcha

1. **Hoja de Google:** una pestaña llamada `Sesiones` con las columnas Fecha, Libro, Minutos, Avance y KindleFalta.
2. **Apps Script:** en la hoja, *Extensiones → Apps Script*, pega `Code.gs`. Ve a *Implementar → Nueva implementación → Aplicación web*, con **Ejecutar como: Yo** y **Acceso: Cualquier persona**. Copia la dirección que termina en `/exec`.
3. **GitHub Pages:** en *Settings → Pages*, publica la rama principal.
4. **Primera apertura:** abre la página con internet y pega la dirección `/exec` cuando la pida. Después instálala (*Instalar app* en Chrome/Android, *Compartir → Agregar a pantalla de inicio* en iPhone).

## Clave de acceso (opcional)

Para que solo tus dispositivos puedan leer y escribir datos:

1. En Apps Script abre *Configuración del proyecto → Propiedades de la secuencia de comandos* y agrega la propiedad `CLAVE` con la clave que quieras.
2. Abre la app: pedirá la clave una vez por dispositivo y la recordará.

Si no existe la propiedad `CLAVE`, la app funciona sin clave. Es una protección ligera, no un sistema de autenticación.

## Uso

- `?libro=Titulo` al final de la dirección abre la app con ese libro seleccionado.
- `?reset=1` borra la dirección de Apps Script y la clave guardadas en ese dispositivo, para configurarlas de nuevo.
- Las sesiones guardadas sin conexión aparecen como "pendientes de enviar" hasta que se sincronizan.

## Actualizar la app

Al cambiar archivos de esta repo, la app muestra primero la versión guardada y descarga la nueva en segundo plano: el cambio se ve en la **segunda** apertura. Si algo no se actualiza, cierra la app por completo y ábrela de nuevo.

## Si algo falla

- **"No se pudieron cargar los libros"** con la consola mostrando un error de CORS: la implementación de Apps Script debe tener acceso *Cualquier persona* y estar publicada con una **nueva versión** tras cada cambio de `Code.gs`. Si ocurre solo en un navegador, prueba una ventana de incógnito: una extensión puede estar interfiriendo.
- **La app no abre sin conexión:** ábrela una vez con internet y confirma que `sw.js` esté en la misma carpeta que `index.html`.
