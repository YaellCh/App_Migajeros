# Migajeros — primera vertical navegable

Aplicación móvil creada con Expo, React Native y TypeScript a partir de los wireframes del MVP.

## Lo que ya se puede probar

- Confirmación 18+ y lectura como visitante.
- Feed **Para ti / Siguiendo / Recientes**.
- Lectura de Historias formadas por una o varias Migajas.
- Cuenta de demostración con nickname local.
- Crear una Historia pública o anónima y añadir continuaciones.
- Reaccionar, comentar, seguir perfiles, buscar y guardar Historias.
- Perfil propio y perfil público.

Los datos viven únicamente en memoria: se reinician al cerrar o recargar la aplicación. El distintivo **DEMO** evita confundir esta versión con una cuenta o publicación real.

## Ejecutar

Requiere Node.js 22.13 o posterior.

```bash
npm install
npm start
```

Después:

- Escanea el QR con Expo Go para abrirla en un teléfono compatible.
- Presiona `a` para Android.
- Presiona `i` para iOS desde macOS.
- Presiona `w` para la versión web.

También puedes ejecutar directamente `npm run android`, `npm run ios` o `npm run web`.

## Verificación

```bash
npm test
npm run typecheck
npm run verify
```

`npm run verify` genera los bundles de Android, iOS y web dentro de `dist/`.

## Siguiente etapa

Conectar Supabase para autenticación, correo verificado, base de datos, imágenes y políticas de seguridad. Las claves públicas deben colocarse mediante variables de entorno; nunca deben escribirse directamente en el repositorio.
