# Guía para Subir el Proyecto a GitHub

## ✅ Paso 1: Commit Inicial Completado

Ya se ha creado el commit inicial con todos los archivos del proyecto.

## 📝 Paso 2: Crear Repositorio en GitHub

1. **Ve a GitHub**: Abre tu navegador y ve a [https://github.com](https://github.com)
2. **Inicia sesión**: Ingresa con tu cuenta de GitHub
3. **Crear nuevo repositorio**:
   - Haz clic en el botón **"+"** en la esquina superior derecha
   - Selecciona **"New repository"**
4. **Configurar el repositorio**:
   - **Repository name**: `sistema-autoescuela-concordia` (o el nombre que prefieras)
   - **Description**: "Sistema Web de Gestión Administrativa y Académica con Seguimiento de Progreso y Calificaciones para la Autoescuela Concordia"
   - **Visibilidad**: 
     - ✅ **Public** (si quieres que sea público)
     - ✅ **Private** (si quieres que sea privado - recomendado para proyectos académicos)
   - ⚠️ **NO marques** "Add a README file" (ya tenemos uno)
   - ⚠️ **NO marques** "Add .gitignore" (ya tenemos uno)
   - ⚠️ **NO marques** "Choose a license" (a menos que quieras agregar una)
5. **Crear**: Haz clic en el botón **"Create repository"**

## 🔗 Paso 3: Conectar el Repositorio Local con GitHub

Después de crear el repositorio en GitHub, verás una página con instrucciones. **NO sigas esas instrucciones**, en su lugar ejecuta estos comandos:

### Opción A: Si creaste un repositorio vacío (recomendado)

Ejecuta estos comandos en tu terminal (ya estás en el directorio correcto):

```bash
# Agregar el repositorio remoto (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/sistema-autoescuela-concordia.git

# Cambiar el nombre de la rama principal a 'main' (si GitHub usa 'main' en lugar de 'master')
git branch -M main

# Subir el código a GitHub
git push -u origin main
```

### Opción B: Si tu repositorio usa 'master' en lugar de 'main'

```bash
# Agregar el repositorio remoto
git remote add origin https://github.com/TU_USUARIO/sistema-autoescuela-concordia.git

# Subir el código a GitHub
git push -u origin master
```

## 🔐 Paso 4: Autenticación

Cuando ejecutes `git push`, GitHub te pedirá autenticarte. Tienes dos opciones:

### Opción 1: Personal Access Token (Recomendado)

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Genera un nuevo token con permisos `repo`
3. Copia el token y úsalo como contraseña cuando Git te lo pida

### Opción 2: GitHub CLI

Si tienes GitHub CLI instalado:
```bash
gh auth login
```

## ✅ Paso 5: Verificar

Después de ejecutar `git push`, ve a tu repositorio en GitHub y verifica que todos los archivos estén ahí.

## 📌 Comandos Útiles para el Futuro

### Subir cambios nuevos

```bash
# Ver qué archivos han cambiado
git status

# Agregar todos los cambios
git add .

# Crear un commit con un mensaje descriptivo
git commit -m "Descripción de los cambios realizados"

# Subir los cambios a GitHub
git push
```

### Ver el historial de commits

```bash
git log --oneline
```

### Ver el estado actual

```bash
git status
```

## 🆘 Solución de Problemas

### Error: "remote origin already exists"

Si ya existe un remoto llamado `origin`, primero elimínalo:
```bash
git remote remove origin
```
Luego vuelve a agregarlo con el comando del Paso 3.

### Error: "Authentication failed"

Asegúrate de usar un Personal Access Token, no tu contraseña de GitHub.

### Error: "Permission denied"

Verifica que el nombre del repositorio y tu usuario de GitHub sean correctos en la URL.

---

**¡Listo!** Tu proyecto ahora está respaldado en GitHub. 🎉






