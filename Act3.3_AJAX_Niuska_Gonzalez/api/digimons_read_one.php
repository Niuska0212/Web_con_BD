<?php
require 'token_check.php';
require 'db.php';

header('Content-Type: application/json');

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "ID de Digimon inválido."]);
    exit();
}

try {
    $stmt = $conn->prepare("SELECT id, nombre, tipo, nivel, atributo, evoluciones FROM digimons WHERE id = :id");
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $digimon = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($digimon) {
        // Decodificar la cadena JSON de 'evoluciones'
        if (isset($digimon['evoluciones']) && !empty($digimon['evoluciones'])) {
            $decodedEvolutions = json_decode($digimon['evoluciones'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $digimon['evoluciones'] = $decodedEvolutions;
            } else {
                $digimon['evoluciones'] = [];
                error_log("Error decodificando JSON de evoluciones para Digimon ID " . $digimon['id'] . ": " . json_last_error_msg());
            }
        } else {
            $digimon['evoluciones'] = [];
        }
        echo json_encode(["data" => $digimon]);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Digimon no encontrado."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
}
?>