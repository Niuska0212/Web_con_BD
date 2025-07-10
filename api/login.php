<?php
session_start();
$data = json_decode(file_get_contents("php://input"), true);

if ($data['usuario'] === "admin" && $data['password'] === "admin") {
    $_SESSION['token'] = bin2hex(random_bytes(16));
    echo json_encode(["token" => $_SESSION['token']]);
} else {
    http_response_code(401);
    echo json_encode(["error" => "Credenciales inválidas"]);
}
?>
