// AUTENTICACION
function auth(){
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData(loginForm);

        const notyf = new Notyf({
            duration: 4000,
            position: { x: 'right', y: 'top' },
        });

        $.ajax({
            url: "auth/auth.php",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            dataType: "json",
            success: function (res) {

                if (res.status === "success") {
                    notyf.success("Bienvenido(a) " + (res.usuario.name || ""));

                    $(".contenedor_carga").removeAttr('hidden');
                    $("#card_login").attr('hidden');

                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 1500);
                }else{
                    notyf.error(res.message);
                }
            },
            error: function (xhr) {
                console.log(xhr.responseText); // para ver qué respondió el servidor
                notyf.error("Error al conectar con el servidor");
            }
        });
    });
}

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
  auth();
});