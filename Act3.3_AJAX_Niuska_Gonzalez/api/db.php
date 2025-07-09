<?php
$host = "localhost";
$dbname = "digidex_db";
$user = "root";
$pass = ""; // Cambia si tienes contraseña

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error en la conexión: " . $e->getMessage()]);
    exit;
}
