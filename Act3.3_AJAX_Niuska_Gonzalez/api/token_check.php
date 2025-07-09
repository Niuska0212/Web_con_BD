<?php
session_start();

// Obtener la ruta del script actual
$current_script = basename($_SERVER['PHP_SELF']);

// Rutas que requieren autenticación (escritura/modificación)
$protected_routes = [
    'digimons_create.php',
    'digimons_update.php',
    'digimons_delete.php',
    'logout.php' // Logout también puede requerir token para invalidar la sesión
];

// Rutas que permiten acceso sin token (lectura)
$public_routes = [
    'digimons_read.php',
    'digimons_read_one.php',
    'login.php' // Login es siempre público para permitir el inicio de sesión
];

// Si la ruta actual es una de las protegidas
if (in_array($current_script, $protected_routes)) {
    // Verificar si hay un token en el header de autorización
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        http_response_code(401); // Unauthorized
        echo json_encode(["error" => "Acceso no autorizado. Se requiere un token."]);
        exit();
    }

    $token = $matches[1];

    // Aquí deberías validar el $token (ej. contra una base de datos, JWT, etc.)
    // Por simplicidad, aquí solo verificamos si existe en la sesión
    if (!isset($_SESSION['token']) || $_SESSION['token'] !== $token) {
        http_response_code(401); // Unauthorized
        echo json_encode(["error" => "Token inválido o expirado."]);
        exit();
    }
}


?>
