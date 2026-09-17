# Instalar y probar Migajeros en Windows

Esta guía sirve para ejecutar la primera versión de Migajeros en un teléfono Android, un iPhone o el navegador. No necesitas Android Studio para comenzar.

## 1. Programas necesarios

Instala lo siguiente:

1. **Node.js LTS**: versión 22.13 o posterior. Durante la instalación conserva las opciones predeterminadas.
2. **Visual Studio Code**.
3. **Expo Go** en tu teléfono, desde Google Play o App Store.

No instales el antiguo paquete global `expo-cli`. Este proyecto usa `npx` y la versión de Expo incluida en sus dependencias.

## 2. Comprobar Node.js

Abre PowerShell y ejecuta:

```powershell
node --version
npm --version
```

Si PowerShell indica que no reconoce `node`, reinicia Windows después de instalar Node.js.

Si bloquea `npm.ps1` por la política de ejecución, usa una sola vez:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Cierra PowerShell, vuelve a abrirlo y repite `npm --version`.

## 3. Preparar el proyecto

Descomprime `MigajerosApp-v0.1.zip`. Después abre PowerShell dentro de la carpeta descomprimida o usa:

```powershell
cd "$HOME\Documents\MigajerosApp"
npm install
```

La instalación puede tardar algunos minutos. Las advertencias que empiecen con `npm warn` no siempre son errores; sólo detente si termina con `npm error`.

## 4. Revisar la instalación

```powershell
npm run typecheck
npm test
npx expo-doctor
```

El resultado esperado es:

- TypeScript termina sin errores.
- Aparecen 3 pruebas aprobadas.
- Expo Doctor muestra `21/21 checks passed`.

## 5. Abrir la aplicación en el teléfono

```powershell
npm start
```

Expo mostrará un código QR.

### Android

Abre Expo Go y utiliza **Scan QR code**.

### iPhone

Abre la aplicación Cámara, escanea el QR y toca el enlace de Expo Go. En Windows no existe simulador oficial de iOS; para probar iOS se utiliza un iPhone físico o posteriormente una compilación en la nube.

El equipo y el teléfono deben estar en la misma red Wi-Fi.

## 6. Si el teléfono no se conecta

Prueba, en este orden:

1. Permite Node.js en el Firewall de Windows cuando aparezca el aviso.
2. Confirma que computadora y teléfono usan la misma red.
3. Desactiva temporalmente VPNs.
4. Prueba usando el punto de acceso de tu teléfono.
5. Ejecuta el modo túnel:

```powershell
npx expo start --tunnel
```

La primera vez puede pedir permiso para instalar una dependencia de túnel.

## 7. Abrir la versión web

```powershell
npm run web
```

También puedes ejecutar `npm start` y presionar la tecla `w`.

## 8. Detener Expo

Regresa a la terminal y presiona:

```text
Ctrl + C
```

## 9. Qué funciona en esta versión

La aplicación utiliza datos de demostración guardados temporalmente en memoria. Puedes leer, publicar, comentar, reaccionar, seguir, buscar y guardar contenido durante la sesión. Al cerrar o recargar la aplicación, los cambios se reinician.

La siguiente etapa será conectar Supabase para crear cuentas reales, verificar correos y guardar la información de forma permanente.
