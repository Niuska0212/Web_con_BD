let token = "";
let page = 1;
let sort = "id";
let order = "ASC";
let pendingAction = null; // Para almacenar la acción pendiente después de un login

function mostrarMensaje(message, type = "info") {
    $("#messageText").text(message);
    $("#messageBox").css("border-color", type === "error" ? "red" : (type === "success" ? "green" : "#ccc"));
    $("#messageBox").show();
    console.error("Mensaje de error/info mostrado:", message, "Tipo:", type); // Log para depuración
}

// Función para mostrar confirmaciones personalizadas (reemplaza confirm)
let confirmCallback = null;
function mostrarConfirmacion(message, callback) {
    $("#confirmText").text(message);
    confirmCallback = callback;
    $("#confirmBox").show();
}

$("#confirmYes").click(function() {
    $("#confirmBox").hide();
    if (confirmCallback) {
        confirmCallback();
    }
    confirmCallback = null; // Limpiar callback
});

$("#confirmNo").click(function() {
    $("#confirmBox").hide();
    confirmCallback = null; // Limpiar callback
});

// Login inicial
$("#btnLogin").click(function () {
    $.ajax({
        url: "api/login.php",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            usuario: $("#usuario").val(),
            password: $("#password").val()
        }),
        success: function (res) {
            token = res.token;
            localStorage.setItem('digidexToken', token); // Guardar token en localStorage
            $("#login").hide(); // Ocultar el formulario de login
            $("#digimonApp").show(); // Mostrar la aplicación principal
            cargarTabla(); // Cargar la tabla una vez logueado
            mostrarMensaje("Login exitoso. ¡Bienvenido al Digidex!", "success");
        },
        error: function (xhr) {
            let errorMessage = "Error desconocido al iniciar sesión.";
            if (xhr.responseJSON && xhr.responseJSON.error) {
                errorMessage = xhr.responseJSON.error;
            } else if (xhr.responseText) {
                errorMessage = "Respuesta del servidor: " + xhr.responseText;
            }
            mostrarMensaje("Login fallido: " + errorMessage, "error");
        }
    });
});

// Cargar tabla (siempre requiere token ahora)
function cargarTabla() {
    const headers = { Authorization: `Bearer ${token}` };

    $.ajax({
        url: `api/digimons_read.php?page=${page}&limit=${$("#limit").val()}&search=${$("#search").val()}&sort=${sort}&order=${order}`,
        headers: headers,
        success: function (res) {
            let rows = "";
            res.data.forEach(d => {
                let evolucionesHtml = "";
                if (Array.isArray(d.evoluciones) && d.evoluciones.length > 0) {
                    evolucionesHtml = "<ul>";
                    d.evoluciones.forEach(evo => {
                        evolucionesHtml += `<li>${evo.nombre}`;
                        if (evo.requerimiento) {
                            evolucionesHtml += ` (${evo.requerimiento})`;
                        }
                        evolucionesHtml += `</li>`;
                    });
                    evolucionesHtml += "</ul>";
                } else {
                    evolucionesHtml = "N/A";
                }

                const actionButtons = `
                    <button class="action-btn edit-btn" onclick="editar(${d.id})">Editar</button>
                    <button class="action-btn delete-btn" onclick="eliminar(${d.id})">Eliminar</button>
                `;

                rows += `
                    <tr>
                        <td>${d.id}</td>
                        <td>${d.nombre}</td>
                        <td>${d.tipo || ""}</td>
                        <td>${d.nivel || ""}</td>
                        <td>${d.atributo || ""}</td>
                        <td>${evolucionesHtml}</td>
                        <td>${actionButtons}</td>
                    </tr>
                `;
            });
            $("#tabla tbody").html(rows);
            mostrarPaginacion(res.total);
            updateSortArrows(); // Actualizar las flechas de ordenamiento
            // Actualizar el total de registros en el footer de la tabla
            $("#totalCount").text(`Total de Digimons: ${res.total}`); // Usa el ID correcto 'totalCount'
        },
        error: function(xhr) {
            let errorMessage = "Error desconocido al cargar la tabla.";
            if (xhr.status === 401) {
                errorMessage = "Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.";
                token = ""; // Limpiar el token
                localStorage.removeItem('digidexToken'); // Eliminar token del localStorage
                $("#digimonApp").hide();
                $("#login").show();
            } else if (xhr.responseJSON && xhr.responseJSON.error) {
                errorMessage = xhr.responseJSON.error;
            } else if (xhr.responseText) {
                errorMessage = "Respuesta del servidor: " + xhr.responseText;
            }
            mostrarMensaje("Error al cargar la tabla: " + errorMessage, "error");
        }
    });
}


function mostrarPaginacion(total) {
    let totalPages = Math.ceil(total / $("#limit").val());
    let paginacionHtml = "";

    if (page > 1) {
        paginacionHtml += `<button class="pagination-btn" onclick="irPagina(${page - 1})">Anterior</button>`;
    } else {
        paginacionHtml += `<button class="pagination-btn disabled" disabled>Anterior</button>`;
    }

    paginacionHtml += ` <span class="page-info">Página ${page} de ${totalPages}</span> `;

    if (page < totalPages) {
        paginacionHtml += `<button class="pagination-btn" onclick="irPagina(${page + 1})">Siguiente</button>`;
    } else {
        paginacionHtml += `<button class="pagination-btn disabled" disabled>Siguiente</button>`;
    }
    $("#paginacion").html(paginacionHtml);
}

function irPagina(n) {
    page = n;
    cargarTabla();
}

// Actualizar flechas de ordenamiento
function updateSortArrows() {
    $("#tabla th[data-sort]").each(function() {
        const header = $(this);
        const column = header.data("sort");
        let arrow = '';

        if (column === sort) {
            arrow = order === "ASC" ? ' &#x25B2;' : ' &#x25BC;'; // ▲ (asc) o ▼ (desc)
        }
        header.find(".sort-arrow").html(arrow);
    });
}

// Eventos de búsqueda, cantidad por página y ordenamiento
$("#limit").change(() => { page = 1; cargarTabla(); });
$("#search").on("input", () => { page = 1; cargarTabla(); });
$("#tabla th[data-sort]").click(function () {
    const nuevoSort = $(this).data("sort");
    if (sort === nuevoSort) {
        order = (order === "ASC") ? "DESC" : "ASC";
    } else {
        sort = nuevoSort;
        order = "ASC";
    }
    cargarTabla();
});

// Logout
$("#logoutBtn").click(function () {
    $.ajax({
        url: "api/logout.php",
        success: function () {
            token = "";
            localStorage.removeItem('digidexToken'); // Eliminar token de localStorage
            mostrarMensaje("Sesión cerrada correctamente. Por favor, inicia sesión para acceder.", "info");
            $("#digimonApp").hide(); // Ocultar la app
            $("#login").show(); // Mostrar el formulario de login
        },
        error: function(xhr) {
            let errorMessage = "Error desconocido al cerrar sesión.";
            if (xhr.responseJSON && xhr.responseJSON.error) {
                errorMessage = xhr.responseJSON.error;
            } else if (xhr.responseText) {
                errorMessage = "Respuesta del servidor: " + xhr.responseText;
            }
            mostrarMensaje("Error al cerrar sesión: " + errorMessage, "error");
        }
    });
});

// Eliminar digimon (asume que ya hay token)
function eliminar(id) {
    mostrarConfirmacion("¿Seguro que deseas eliminar este Digimon?", function() {
        $.ajax({
            url: "api/digimons_delete.php",
            type: "POST",
            contentType: "application/json",
            headers: { Authorization: `Bearer ${token}` },
            data: JSON.stringify({ id }),
            success: function () {
                cargarTabla();
                mostrarMensaje("Digimon eliminado exitosamente.", "success");
            },
            error: function (xhr) {
                let errorMessage = "Error desconocido al eliminar Digimon.";
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage = xhr.responseJSON.error;
                } else if (xhr.responseText) {
                    errorMessage = "Respuesta del servidor: " + xhr.responseText;
                }
                mostrarMensaje("Error al eliminar Digimon: " + errorMessage, "error");
            }
        });
    });
}

// Abrir modal para agregar (asume que ya hay token)
$("#btnAgregar").click(function() {
    $("#modalTitle").text("Agregar Digimon");
    $("#digimonId").val(""); // Limpiar ID para nueva entrada
    $("#digimonNombre").val("");
    $("#digimonTipo").val("");
    $("#digimonNivelSelect").val(""); // Vaciar el selector de Nivel
    $("#digimonAtributoSelect").val(""); // Vaciar el selector de Atributo
    $("#digimonEvoluciones").val(""); // Vaciar el campo para nueva entrada
    $("#modalForm").show();
});

// Editar digimon (asume que ya hay token)
function editar(id) {
    $.ajax({
        url: `api/digimons_read_one.php?id=${id}`,
        headers: { Authorization: `Bearer ${token}` },
        success: function(res) {
            if (res.data) {
                const d = res.data;
                $("#modalTitle").text("Editar Digimon");
                $("#digimonId").val(d.id);
                $("#digimonNombre").val(d.nombre);
                $("#digimonTipo").val(d.tipo || "");
                // Establecer valor del selector de Nivel
                $("#digimonNivelSelect").val(d.nivel || "");
                // Establecer valor del selector de Atributo
                $("#digimonAtributoSelect").val(d.atributo || "");
                
                // Convertir el array de evoluciones a una cadena separada por comas
                if (Array.isArray(d.evoluciones) && d.evoluciones.length > 0) {
                    const evoNames = d.evoluciones.map(evo => evo.nombre);
                    $("#digimonEvoluciones").val(evoNames.join(", "));
                } else {
                    $("#digimonEvoluciones").val("");
                }
                
                $("#modalForm").show();
            } else {
                mostrarMensaje("Digimon no encontrado.", "error");
            }
        },
        error: function(xhr) {
            let errorMessage = "Error desconocido al cargar datos del Digimon para editar.";
            if (xhr.responseJSON && xhr.responseJSON.error) {
                errorMessage = xhr.responseJSON.error;
            } else if (xhr.responseText) {
                errorMessage = "Respuesta del servidor: " + xhr.responseText;
            }
            mostrarMensaje("Error al cargar datos del Digimon para editar: " + errorMessage, "error");
        }
    });
}

// Guardar (Agregar/Editar) Digimon (asume que ya hay token)
$("#guardarBtn").click(function() {
    const id = $("#digimonId").val();
    const nombre = $("#digimonNombre").val();
    const tipo = $("#digimonTipo").val();
    // Obtener valores de los selectores
    const nivel = $("#digimonNivelSelect").val();
    const atributo = $("#digimonAtributoSelect").val();
    const evolucionesRawString = $("#digimonEvoluciones").val(); // Obtener la cadena separada por comas

    // Validar que los selectores no estén vacíos
    if (!nombre) { // Asegurarse de que el nombre no esté vacío
        mostrarMensaje("El Nombre es obligatorio.", "error");
        return;
    }
    if (!nivel) {
        mostrarMensaje("El Nivel es obligatorio. Por favor, selecciona un nivel.", "error");
        return;
    }
    if (!atributo) {
        mostrarMensaje("El Atributo es obligatorio. Por favor, selecciona un atributo.", "error");
        return;
    }

    let evolucionesFormattedForDB = [];
    if (evolucionesRawString) {
        // Convertir la cadena separada por comas a un array de objetos JSON
        const evoNames = evolucionesRawString.split(',').map(name => name.trim()).filter(name => name !== '');
        evolucionesFormattedForDB = evoNames.map(name => ({ nombre: name, requerimiento: "" }));
    }

    const data = {
        nombre: nombre,
        tipo: tipo,
        nivel: nivel, // Usar el valor del selector
        atributo: atributo, // Usar el valor del selector
        evoluciones: JSON.stringify(evolucionesFormattedForDB) // Convertir a string JSON para la base de datos
    };

    let url = "";
    let successMessage = "";

    if (id) {
        url = "api/digimons_update.php";
        data.id = id;
        successMessage = "Digimon actualizado exitosamente.";
    } else {
        url = "api/digimons_create.php";
        successMessage = "Digimon agregado exitosamente.";
    }

    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        headers: { Authorization: `Bearer ${token}` },
        data: JSON.stringify(data),
        success: function(res) {
            $("#modalForm").hide();
            cargarTabla();
            mostrarMensaje(res.message || successMessage, "success");
        },
        error: function(xhr) {
            let errorMessage = "Error desconocido al guardar Digimon.";
            if (xhr.responseJSON && xhr.responseJSON.error) {
                errorMessage = xhr.responseJSON.error;
            } else if (xhr.responseText) {
                errorMessage = "Respuesta del servidor: " + xhr.responseText;
            }
            mostrarMensaje("Error al guardar Digimon: " + errorMessage, "error");
        }
    });
});

// Cancelar modal
$("#cancelarBtn").click(function() {
    $("#modalForm").hide();
});

// Al cargar el documento, se verifica si hay un token en localStorage
$(document).ready(function() {
    const storedToken = localStorage.getItem('digidexToken');
    if (storedToken) {
        token = storedToken;
        $("#login").hide(); // Ocultar el formulario de login
        $("#digimonApp").show(); // Mostrar la aplicación principal
        cargarTabla(); // Cargar la tabla con el token existente
        mostrarMensaje("Sesión restaurada. ¡Bienvenido de nuevo!", "info");
    } else {
        $("#login").show(); // Mostrar el login si no hay token
        $("#digimonApp").hide(); // Asegurarse de que la app esté oculta
    }
});
