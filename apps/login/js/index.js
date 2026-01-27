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

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loader = document.querySelector(".contenedor_carga");

  // toast de bootstrap
  const toastTrigger = document.getElementById("btn_toast");
  const toastLiveExample = document.getElementById("myToast");
  let toastBootstrap = null;

  if (toastTrigger) {
    toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
    toastTrigger.addEventListener("click", () => {
      toastBootstrap.show();
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      loader.removeAttribute("hidden");
      document.getElementById('card_login').style.opacity = '50';
      const formData = new FormData(loginForm);

      try {
        const response = await fetch("auth/auth.php", {
          method: "POST",
          body: formData,
        });
        const result = await response.text();

        if (response.ok && result.trim() === "success") {
          setTimeout(() => {
            window.location.href = "menu.html";
          }, 1500);
        } else {
          loader.setAttribute('hidden', 'true');
          if (toastBootstrap) toastBootstrap.show();
        }
      } catch (error) {
        console.error("Error:", error);
        if (toastBootstrap) toastBootstrap.show();
      }
    });
  }
});
