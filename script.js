// Endpoint de producción en Railway
const API_URL = "https://primerapirest-production.up.railway.app/productos";

// Elementos de la interfaz
const tablaProductos = document.getElementById("tablaProductos");
const productoForm = document.getElementById("productoForm");
const contadorProductos = document.getElementById("contadorProductos");

// 1. Obtener y renderizar productos (GET)
// Variable global temporal para saber si estamos creando o editando un producto
let editandoId = null;

async function obtenerProductos() {
  try {
    const response = await fetch(API_URL);
    const productos = await response.json();

    contadorProductos.textContent = `${productos.length} ${
      productos.length === 1 ? "Producto" : "Productos"
    }`;
    tablaProductos.innerHTML = "";

    if (productos.length === 0) {
      tablaProductos.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: var(--text-secundario); padding: 2rem;">
                        El catálogo está vacío. ¡Agrega tu primer producto!
                    </td>
                </tr>`;
      return;
    }

    productos.forEach((p) => {
      tablaProductos.innerHTML += `
                <tr>
                    <td style="color: var(--text-secundario); font-weight: bold;">${
                      p.id
                    }</td>
                    <td style="font-weight: 500;">${p.nombre}</td>
                    <td style="color: var(--azul); font-weight: bold;">${parseFloat(
                      p.precio
                    ).toFixed(2)} €</td>
                    <td style="text-align: center; display: flex; gap: 0.5rem; justify-content: center;">
                        <!-- BOTÓN EDITAR -->
                        <button class="btn-editar" onclick="cargarFormularioEditar(${
                          p.id
                        }, '${p.nombre}', ${p.precio})">Editar</button>
                        <!-- BOTÓN BORRAR -->
                        <button class="btn-borrar" onclick="eliminarProducto(${
                          p.id
                        })">Borrar</button>
                    </td>
                </tr>
            `;
    });
  } catch (error) {
    console.error("Error al obtener los productos:", error);
  }
}

// Función que se ejecuta al pulsar el botón azul "Editar"
function cargarFormularioEditar(id, nombre, precio) {
  editandoId = id; // Guardamos el ID del producto que se va a modificar
  document.getElementById("nombre").value = nombre;
  document.getElementById("precio").value = precio;

  // Cambiamos el texto del botón del formulario para avisar al usuario
  const boton = document.querySelector(".btn-guardar");
  boton.textContent = "Actualizar Producto";
  boton.style.backgroundColor = "#e1a32a"; // Color naranja de edición
}

// 2. Escuchar el envío del formulario para agregar productos (POST)
// PEGA ESTE NUEVO BLOQUE EN SU LUGAR:
productoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const precio = document.getElementById("precio").value;

  const urlFinal = editandoId ? `${API_URL}/${editandoId}` : API_URL;
  const metodo = editandoId ? "PUT" : "POST";

  try {
    const response = await fetch(urlFinal, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, precio }),
    });

    if (response.ok) {
      // === ¡AÑADE ESTA LÍNEA AQUÍ ABAJO! ===
      mostrarAlerta(
        editandoId
          ? "¡Producto actualizado con éxito!"
          : "¡Producto guardado con éxito!",
        "success"
      );

      productoForm.reset();
      editandoId = null;

      const boton = document.querySelector(".btn-guardar");
      boton.textContent = "Guardar Producto";
      boton.style.backgroundColor = "#1f6feb";

      obtenerProductos();
    }
  } catch (error) {
    console.error("Error al procesar el producto:", error);
  }
});

// 3. Eliminar un producto buscando por ID (DELETE)
async function eliminarProducto(id) {
  if (
    !confirm(
      "¿Estás seguro de que deseas eliminar permanentemente este producto del catálogo?"
    )
  )
    return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      // === ¡AÑADE ESTA LÍNEA AQUÍ ABAJO! ===
      mostrarAlerta("Producto eliminado correctamente.", "error");

      obtenerProductos();
    }
  } catch (error) {
    console.error("Error al intentar eliminar el producto:", error);
  }
}

// Inicializar la carga de datos al abrir la web
obtenerProductos();
// Escuchar lo que el usuario escribe en la barra de búsqueda
document.getElementById("buscador").addEventListener("input", (e) => {
  const textoBusqueda = e.target.value.toLowerCase().trim();
  const filas = document.querySelectorAll("#tablaProductos tr");

  filas.forEach((filasProducto) => {
    // Obtenemos el texto de la segunda columna (Nombre del producto)
    const columnaNombre = filasProducto.querySelector("td:nth-child(2)");

    if (columnaNombre) {
      const nombreProducto = columnaNombre.textContent.toLowerCase();

      // Si el nombre contiene el texto buscado, se muestra; si no, se oculta
      if (nombreProducto.includes(textoBusqueda)) {
        filasProducto.style.display = "";
      } else {
        filasProducto.style.display = "none";
      }
    }
  });
});
// Función para mostrar mensajes flotantes profesionales
function mostrarAlerta(mensaje, tipo = "success") {
  const contenedor = document.getElementById("alerta-contenedor");
  const alerta = document.createElement("div");

  // Aplicamos estilos según si es éxito (verde) o error (rojo)
  alerta.style.backgroundColor = tipo === "success" ? "#3fb950" : "#f85149";
  alerta.style.color = "#ffffff";
  alerta.style.padding = "1rem 2rem";
  alerta.style.borderRadius = "8px";
  alerta.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
  alerta.style.fontWeight = "bold";
  alerta.style.fontSize = "1.05rem";
  alerta.style.transition = "all 0.3s ease";
  alerta.textContent = mensaje;

  contenedor.appendChild(alerta);

  // Hacer que desaparezca suavemente a los 3 segundos
  setTimeout(() => {
    alerta.style.opacity = "0";
    setTimeout(() => alerta.remove(), 3000);
  }, 3000);
}
