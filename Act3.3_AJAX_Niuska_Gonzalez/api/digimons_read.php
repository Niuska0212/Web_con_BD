<?php
require 'token_check.php';
require 'db.php';

header('Content-Type: application/json');

$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$search = isset($_GET['search']) ? $_GET['search'] : '';
$sort = isset($_GET['sort']) ? $_GET['sort'] : 'id';
$order = (isset($_GET['order']) && strtoupper($_GET['order']) === 'DESC') ? 'DESC' : 'ASC';

$offset = ($page - 1) * $limit;

// Columnas permitidas para evitar SQL Injection en orden
$allowedSort = ['id', 'nombre', 'tipo', 'nivel', 'atributo'];
if (!in_array($sort, $allowedSort)) $sort = 'id';

// Columnas permitidas para la búsqueda, excluyendo 'id'
$searchableColumns = ['nombre', 'tipo', 'nivel', 'atributo'];
$whereClauses = [];
foreach ($searchableColumns as $column) {
    $whereClauses[] = "$column LIKE :search";
}
$whereSql = '';
if (!empty($search)) {
    $whereSql = "WHERE " . implode(' OR ', $whereClauses);
}

try {
    // Consulta para obtener datos con filtro de búsqueda, incluyendo la columna 'evoluciones'
    // Asumimos que 'evoluciones' es una columna en la tabla 'digimons' que guarda un JSON string
    $sql = "SELECT id, nombre, tipo, nivel, atributo, evoluciones FROM digimons $whereSql ORDER BY $sort $order LIMIT :limit OFFSET :offset";
    $stmt = $conn->prepare($sql);

    // Bindea el valor de búsqueda a cada cláusula LIKE
    if (!empty($search)) {
        $stmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $digimons = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Decodificar la cadena JSON de 'evoluciones' para cada Digimon
    foreach ($digimons as &$digimon) {
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
    }
    unset($digimon);

    // Total de registros filtrados
    $countSql = "SELECT COUNT(*) FROM digimons $whereSql";
    $countStmt = $conn->prepare($countSql);

    if (!empty($search)) {
        $countStmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
    }
    $countStmt->execute();
    $total = $countStmt->fetchColumn();

    echo json_encode([
        "total" => (int)$total,
        "data" => $digimons
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
}
?>
