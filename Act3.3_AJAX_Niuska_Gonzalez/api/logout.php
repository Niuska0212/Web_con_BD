<?php
session_start();
session_unset(); // Elimina todas las variables de sesión
session_destroy(); // Destruye la sesión

echo json_encode(["message" => "Sesión cerrada correctamente"]);
?>
