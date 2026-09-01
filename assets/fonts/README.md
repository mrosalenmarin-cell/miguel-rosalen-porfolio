Coloca aquí los archivos de fuente TTF usados por el proyecto.

Nombres esperados (renómbralos si hace falta):
- MiguelRosalenFont-Regular.ttf
- MiguelRosalenNeon-Color.ttf

Ejemplo PowerShell para mover y renombrar desde tu carpeta de descargas:

```powershell
mkdir -Force .\assets\fonts
Move-Item -Path "$env:USERPROFILE\Downloads\MiguelRosalenFont-Regular.ttf" -Destination ".\assets\fonts\MiguelRosalenFont-Regular.ttf"
Move-Item -Path "$env:USERPROFILE\Downloads\MiguelRosalenNeon-Color(1).ttf" -Destination ".\assets\fonts\MiguelRosalenNeon-Color.ttf"
```

Después de copiar los .ttf, recarga la página para que se apliquen las tipografías.
