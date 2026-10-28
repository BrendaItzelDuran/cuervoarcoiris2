/* Formulario "Tu imagen favorita"
   - Valida con atributos HTML5 + reglas propias en JS
   - Intercepta el envío con preventDefault()
   - Muestra retroalimentación dinámica en el DOM
   - Usa SweetAlert2 para los avisos y localStorage para recordar la elección */

const ILUSTRACIONES = {
  "spider-punk": { titulo: "Spider-Punk: In case it don't work out", mini: "img/spider-punk-mini.jpg", pagina: "spider-punk.html" },
  "bosque-bambu": { titulo: "Melodía en el bosque de bambú", mini: "img/kitsune-mini.jpg", pagina: "kitsune.html" },
  "sirena-lava": { titulo: "Sirena sobre la lava", mini: "img/sirena-lava-mini.jpg", pagina: "sirena-lava.html" },
  "cascada": { titulo: "Espíritu de la cascada", mini: "img/cascada-mini.jpg", pagina: "cascada.html" },
  "Sobre mi": { titulo: "Sobre mi", mini: "img/felina-mini.jpg", pagina: "felina.html" }
};

const CLAVE_GUARDADO = "cuervosarcoiris_favorita";

const form = document.querySelector("#form-favorita");
const campoNombre = document.querySelector("#nombre");
const campoCorreo = document.querySelector("#correo");
const campoFavorita = document.querySelector("#favorita");
const campoComentario = document.querySelector("#comentario");
const radiosMotivo = document.querySelectorAll('input[name="motivo"]');
const errorMotivo = document.querySelector("#error-motivo");
const contador = document.querySelector("#contador");
const vistaPrevia = document.querySelector("#vista-previa");
const resultado = document.querySelector("#resultado");
const botonLimpiar = document.querySelector("#btn-limpiar");

/* ---------- Mensajes de error por campo ---------- */
const MENSAJES = {
  nombre: "Escribe tu nombre (mínimo 3 letras).",
  correo: "Escribe un correo válido, por ejemplo nombre@correo.com.",
  favorita: "Elige cuál fue tu ilustración favorita.",
  comentario: "Cuéntanos por qué en al menos 10 caracteres."
};

function marcarCampo(campo, esValido) {
  campo.classList.toggle("is-valid", esValido);
  campo.classList.toggle("is-invalid", !esValido);
  const aviso = campo.parentElement.querySelector(".invalid-feedback");
  if (aviso) aviso.textContent = MENSAJES[campo.id];
  return esValido;
}

function validarNombre() {
  return marcarCampo(campoNombre, campoNombre.value.trim().length >= 3);
}

function validarCorreo() {
  return marcarCampo(campoCorreo, campoCorreo.checkValidity() && campoCorreo.value.trim() !== "");
}

function validarFavorita() {
  return marcarCampo(campoFavorita, campoFavorita.value !== "");
}

function validarComentario() {
  return marcarCampo(campoComentario, campoComentario.value.trim().length >= 10);
}

function validarMotivo() {
  const elegido = document.querySelector('input[name="motivo"]:checked');
  errorMotivo.classList.toggle("d-block", !elegido);
  return Boolean(elegido);
}

/* ---------- Eventos en vivo ---------- */
campoNombre.addEventListener("input", validarNombre);
campoCorreo.addEventListener("input", validarCorreo);
campoComentario.addEventListener("input", () => {
  contador.textContent = campoComentario.value.length;
  validarComentario();
});
radiosMotivo.forEach((radio) => radio.addEventListener("change", validarMotivo));

campoFavorita.addEventListener("change", () => {
  validarFavorita();
  const elegida = ILUSTRACIONES[campoFavorita.value];
  if (elegida) {
    vistaPrevia.src = elegida.mini;
    vistaPrevia.alt = "Vista previa de la ilustración " + elegida.titulo;
    vistaPrevia.classList.remove("d-none");
  } else {
    vistaPrevia.classList.add("d-none");
  }
});

/* ---------- Mostrar resultado en el DOM ---------- */
function mostrarResultado(datos) {
  const elegida = ILUSTRACIONES[datos.favorita];
  if (!elegida) return;

  resultado.replaceChildren();

  const fila = document.createElement("div");
  fila.className = "d-flex flex-column flex-sm-row align-items-sm-center gap-3";

  const imagen = document.createElement("img");
  imagen.src = elegida.mini;
  imagen.alt = "Ilustración " + elegida.titulo;

  const texto = document.createElement("div");

  const titulo = document.createElement("h3");
  titulo.className = "h4 mb-2";
  titulo.textContent = "Tu imagen favorita es: " + elegida.titulo;

  const detalle = document.createElement("p");
  detalle.className = "mb-2";
  detalle.textContent = datos.nombre + ", la elegiste por su " + datos.motivo.toLowerCase() + ". Dijiste: “" + datos.comentario + "”";

  const enlace = document.createElement("a");
  enlace.href = elegida.pagina;
  enlace.className = "fw-bold";
  enlace.textContent = "Volver a ver esta ilustración";

  texto.append(titulo, detalle, enlace);
  fila.append(imagen, texto);
  resultado.append(fila);
  resultado.classList.remove("d-none");
}

function guardar(datos) {
  try { localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(datos)); } catch (error) { /* sin almacenamiento */ }
}

function cargarGuardado() {
  try {
    const texto = localStorage.getItem(CLAVE_GUARDADO);
    return texto ? JSON.parse(texto) : null;
  } catch (error) {
    return null;
  }
}

function limpiarTodo() {
  form.reset();
  form.querySelectorAll(".is-valid, .is-invalid").forEach((el) => el.classList.remove("is-valid", "is-invalid"));
  errorMotivo.classList.remove("d-block");
  vistaPrevia.classList.add("d-none");
  resultado.classList.add("d-none");
  resultado.replaceChildren();
  contador.textContent = "0";
  try { localStorage.removeItem(CLAVE_GUARDADO); } catch (error) { /* sin almacenamiento */ }
}

/* ---------- Envío ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const resultados = [validarNombre(), validarCorreo(), validarFavorita(), validarMotivo(), validarComentario()];
  const todoBien = resultados.every(Boolean);

  if (!todoBien) {
    const primerError = form.querySelector(".is-invalid") || errorMotivo;
    if (primerError.focus) primerError.focus();
    Swal.fire({
      icon: "error",
      title: "Faltan datos",
      text: "Revisa los campos marcados en rojo para poder enviar tu respuesta.",
      background: "#2B1A3A",
      color: "#F6ECF3",
      confirmButtonText: "Entendido",
      buttonsStyling: false,
      customClass: { confirmButton: "btn btn-rosa btn-swal" }
    });
    return;
  }

  const datos = {
    nombre: campoNombre.value.trim(),
    correo: campoCorreo.value.trim(),
    favorita: campoFavorita.value,
    motivo: document.querySelector('input[name="motivo"]:checked').value,
    comentario: campoComentario.value.trim()
  };

  guardar(datos);
  mostrarResultado(datos);

  Swal.fire({
    icon: "success",
    title: "¡Gracias, " + datos.nombre + "!",
    text: "Tu favorita fue: " + ILUSTRACIONES[datos.favorita].titulo,
    background: "#2B1A3A",
    color: "#F6ECF3",
    confirmButtonText: "Genial",
    buttonsStyling: false,
    customClass: { confirmButton: "btn btn-rosa btn-swal" }
  });
});

botonLimpiar.addEventListener("click", limpiarTodo);

/* ---------- Al cargar la página ---------- */
const guardado = cargarGuardado();
if (guardado) mostrarResultado(guardado);
