function acceso() {
  const swapButton = document.getElementById("swap");
  const tainButton = document.getElementById("tain");
  const sugoButton = document.getElementById("sugo");

  // Función de manejo genérica
  const handleButtonClick = (appPath) => {
    // Redirige al puerto EXTERNO (8086), que es el proxy Nginx
    const appUrl = "http://localhost:8086/" + appPath + "/";
    window.open(appUrl, "_blank");
  };

  if (swapButton) {
    swapButton.addEventListener("click", function () {
      handleButtonClick("app-swap");
    });
  } else {
    console.error("No se encontró el botón con ID 'swap'.");
  }

  if (tainButton) {
    tainButton.addEventListener("click", function () {
      handleButtonClick("app-tain");
    });
  } else {
    console.error("No se encontró el botón con ID 'tain'.");
  }

  if (sugoButton) {
    sugoButton.addEventListener("click", function () {
      // Obtiene el token de la cookie
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];

      // Construye la URL con el token como query param
      const url = token
        ? `http://localhost:5173/?token=${token}`
        : "http://localhost:5173/";

      console.log("Abriendo SUGO con URL:", url); // Para debug
      window.open(url, "_blank");
    });
  } else {
    console.error("No se encontró el botón con ID 'sugo'.");
  }
}

function animacion_cards() {
  const cards = document.querySelectorAll(".fade-card");

  // tiempo de aparicion entre cards
  cards.forEach((card, i) => {
    card.style.animationDelay = `${i * 0.25}s`; // 0.25s entre cada card
  });
}

document.addEventListener("DOMContentLoaded", function () {
  acceso();
  animacion_cards();
});
