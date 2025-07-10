<?php
require 'db.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

$id = isset($input['id']) ? (int)$input['id'] : null;
$nombre = isset($input['nombre']) ? trim($input['nombre']) : '';
$tipo = isset($input['tipo']) ? trim($input['tipo']) : '';
$nivel = isset($input['nivel']) ? trim($input['nivel']) : '';
$atributo = isset($input['atributo']) ? trim($input['atributo']) : '';
$evolucionesRaw = isset($input['evoluciones']) ? $input['evoluciones'] : '[]'; // Espera una cadena JSON

if (empty($nombre) || $id === null) {
    http_response_code(400);
    echo json_encode(["error" => "ID y nombre son obligatorios."]);
    exit();
}

// Validar que evolucionesRaw sea un JSON válido
$evolucionesDecoded = json_decode($evolucionesRaw);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["error" => "El formato de evoluciones no es un JSON válido: " . json_last_error_msg()]);
    exit();
}
// Opcional: Re-codificar para asegurar que el formato sea consistente (ej. sin espacios extra)
$evolucionesToSave = json_encode($evolucionesDecoded);

try {
    $stmt = $conn->prepare("UPDATE digimons SET nombre = :nombre, tipo = :tipo, nivel = :nivel, atributo = :atributo, evoluciones = :evoluciones WHERE id = :id");
    
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->bindValue(':nombre', $nombre, PDO::PARAM_STR);
    $stmt->bindValue(':tipo', $tipo, PDO::PARAM_STR);
    $stmt->bindValue(':nivel', $nivel, PDO::PARAM_STR);
    $stmt->bindValue(':atributo', $atributo, PDO::PARAM_STR);
    $stmt->bindValue(':evoluciones', $evolucionesToSave, PDO::PARAM_STR); // Guardar como cadena JSON
    $stmt->execute();

    echo json_encode(["message" => "Digimon actualizado exitosamente.", "id" => $id]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al actualizar Digimon: " . $e->getMessage()]);
}
?>
