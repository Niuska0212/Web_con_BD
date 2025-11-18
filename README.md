# 🐉 Digidex – CRUD con PHP, AJAX, jQuery y API REST

Sistema web interactivo para administrar un Digidex usando PHP, MySQL, AJAX y Docker

Este proyecto implementa una aplicación web que permite gestionar una colección de Digimons mediante operaciones CRUD (crear, leer, actualizar, eliminar), autenticación de usuarios, validación mediante tokens y una interfaz dinámica basada en **AJAX + jQuery**.

El backend está construido en **PHP** con arquitectura tipo **API REST**, y puede ejecutarse fácilmente usando **Docker**.
Incluye un archivo SQL para importar la base de datos completamente.

---

## ✨ Características principales

### 🔐 **1. Autenticación**

* Login mediante usuario y contraseña
* Generación de token para validar acceso
* Cierre de sesión
* Validación continua mediante `token_check.php`

### 📄 **2. CRUD completo de Digimons**

Con operaciones REST:

| Acción     | Archivo                     |
| ---------- | --------------------------- |
| Crear      | `api/digimons_create.php`   |
| Leer todos | `api/digimons_read.php`     |
| Leer uno   | `api/digimons_read_one.php` |
| Actualizar | `api/digimons_update.php`   |
| Eliminar   | `api/digimons_delete.php`   |

Todo funciona mediante **AJAX**, sin recargar la página.

### 🔍 **3. Tabla dinámica con jQuery**

* Búsqueda en tiempo real
* Ordenamiento por columnas
* Paginación configurable
* Filtro por cantidad de registros
* Contador total de Digimons
* Modales personalizados (sin alert/confirm nativos)

### 📦 **4. Base de datos MySQL**

Incluye archivo exportable:

```
digidex_db.sql
```

Contiene:

* Tabla `digimons`
* Tabla `usuarios`
* Datos iniciales opcionales

### 🐳 **5. Compatible con Docker**

El proyecto incluye:

```
Dockerfile
php.ini
```

Permite levantar un entorno PHP configurado rápidamente.

---

## 🧰 Tecnologías utilizadas

| Tecnología              | Uso                               |
| ----------------------- | --------------------------------- |
| **HTML5 / CSS3**        | Interfaz                          |
| **JavaScript + jQuery** | AJAX, eventos, modales            |
| **PHP 8+**              | Backend REST, sesiones, seguridad |
| **MySQL**               | Almacenamiento                    |
| **Docker**              | Entorno reproducible              |
| **JSON**                | Intercambio de datos              |

---

## 📂 Estructura del proyecto

Actualizada con lo que mencionaste:

```
digidex/
│── index.html             # Interfaz principal
│── app.js                 # Lógica del frontend, AJAX y eventos
│── style.css              # Estilos visuales
│── php.ini                # Configuración PHP opcional
│── Dockerfile             # Construcción del entorno Docker
│── digidex_db.sql         # Base de datos completa exportada

│── api/                   # API REST en PHP
│     ├── db.php                   # Conexión a MySQL
│     ├── login.php                # Inicio de sesión
│     ├── logout.php               # Cierre de sesión
│     ├── token_check.php          # Validación de token
│     ├── digimons_create.php      
│     ├── digimons_read.php
│     ├── digimons_read_one.php
│     ├── digimons_update.php
│     └── digimons_delete.php
```

---

## 🗄 Instalación y ejecución

1️⃣ Clonar el repositorio
git clone https://github.com/Niuska0212/Web_con_BD
cd Web_con_DB

2️⃣ Importar la base de datos

Crear una base de datos en MySQL

Importar el archivo tablas.sql

3️⃣ Configurar conexión

Editar:

db/conexion.php


Configurar:

$host = "localhost";
$user = "root";
$pass = "";
$db = "digidex";

## 📄 Base de datos

El archivo `digidex_db.sql` contiene:

```sql
CREATE TABLE digimons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  tipo VARCHAR(50),
  nivel VARCHAR(50),
  atributo VARCHAR(50),
  evoluciones TEXT
);

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(50),
  password VARCHAR(200),
  token VARCHAR(200)
);
```

---

## 🔒 Seguridad básica

El sistema incluye:

* Tokens para validar acceso a la API
* Sesiones PHP
* Validación vía AJAX antes de mostrar datos
* Modales de confirmación antes de eliminar

---

## 📄 Licencia

Este proyecto está licenciado bajo los términos de la **MIT License**.
Se permite su uso, modificación y distribución siempre que se mantenga la atribución original.

---

## 👩‍💻 Autor

**Niuska Isabel Gonzalez Rangel**

---
