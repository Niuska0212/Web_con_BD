<?php

require 'db.php'; // Conexión a la base de datos

header('Content-Type: application/json');

// Obtener los datos del cuerpo de la solicitud JSON
$input = json_decode(file_get_contents('php://input'), true);

$id = isset($input['id']) ? (int)$input['id'] : 0;

// Validar que se haya proporcionado un ID válido
if ($id <= 0) {
    http_response_code(400); // Bad Request
    echo json_encode(["error" => "ID de Digimon inválido."]);
    exit();
}

try {
    // Preparar la consulta SQL para eliminar el registro
    $stmt = $conn->prepare("DELETE FROM digimons WHERE id = :id");
    
    // Vincular el parámetro ID
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    
    // Ejecutar la consulta
    $stmt->execute();

    // Verificar si se eliminó algún registro
    if ($stmt->rowCount() > 0) {
        echo json_encode(["message" => "Digimon eliminado exitosamente."]);
    } else {
        http_response_code(404); // Not Found
        echo json_encode(["error" => "Digimon con ID " . $id . " no encontrado."]);
    }

} catch (PDOException $e) {
    // Capturar y manejar cualquier error de la base de datos
    http_response_code(500); // Internal Server Error
    echo json_encode(["error" => "Error al eliminar Digimon: " . $e->getMessage()]);
}
?>
