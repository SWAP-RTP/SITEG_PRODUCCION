// 1. Función global para el ojo de la contraseña
window.mostrarPassword = function () {
  const passInput = document.getElementById("ingresaPassword");
  const eyeIcon = document.getElementById("eyeIcon");
  if (passInput.type === "password") {
    passInput.type = "text";
    eyeIcon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    passInput.type = "password";
    eyeIcon.classList.replace("fa-eye-slash", "fa-eye");
  }
};

// EVITA QUE AL ESTAR LOGUEADO  MUESTRE EL LOGIN Y SE BLOQUEE SOLO EN LA PANTALLA DEL MENU
window.addEventListener("pageshow", function (event) {
  if (document.cookie.includes("access_token")) {
    const paginaActual = window.location.pathname.split("/").pop();
    if (
      paginaActual === "index" ||
      paginaActual === "" ||
      paginaActual === "/"
    ) {
      window.location.replace("menu.html");
    }
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loader = document.querySelector(".contenedor_carga");

  // Elementos del Toast
  const toastLiveExample = document.getElementById("myToast");
  const toastBody = document.querySelector("#myToast .toast-body");
  const toastHeader = document.querySelector("#myToast .toast-header");
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);

  // --- FUNCIÓN PARA REUTILIZAR EL TOAST ---
  const mostrarAlerta = (mensaje, tipo = 'error') => {
    toastBody.textContent = mensaje;
    // Cambiamos el color según el tipo
    if (tipo === 'warning') {
      toastHeader.className = "toast-header bg-warning text-dark";
    } else {
      toastHeader.className = "toast-header bg-danger text-white";
    }
    toastBootstrap.show();
  };

  // --- 3. VALIDAR ERRORES DE URL (SESIÓN DUPLICADA/INVALIDA) ---
  const urlParams = new URLSearchParams(window.location.search);
  const errorType = urlParams.get("error");

  if (errorType === "sesion_duplicada") {
    mostrarAlerta("Tu sesión se cerró porque ingresaste en otro dispositivo.");
    // Limpia la URL para que no se repita el mensaje al recargar
    window.history.replaceState({}, document.title, window.location.pathname);
  } else if (errorType === "sesion_invalida") {
    mostrarAlerta("La sesión ha expirado. Por favor, ingresa de nuevo.");
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // --- 4. MANEJO DEL LOGIN ---
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      loader.removeAttribute("hidden");

      const formData = new FormData(loginForm);

      try {
        const response = await fetch("auth/auth.php", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        if (response.ok && result.status === "success") {
          setTimeout(() => {
            window.location.href = "menu.html";
          }, 1500);
        } else {
          loader.setAttribute("hidden", "true");
          // Reutilizamos el toast para error de credenciales
          mostrarAlerta(result.message || "Usuario o contraseña incorrectos");
        }
      } catch (error) {
        loader.setAttribute("hidden", "true");
        console.error("Error:", error);
        mostrarAlerta("Error de conexión con el servidor.");
      }
    });
  }
});
