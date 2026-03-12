function acceso() {
  const swapButton = document.getElementById("swap");
  const tainButton = document.getElementById("tain");
  const sugoButton = document.getElementById("sugo");
  // Función de manejo genérica
  const handleButtonClick = (appPath) => {
    // Redirige al puerto EXTERNO (8086), que es el proxy Nginx
    const appUrl = `${window.location.origin}/${appPath}/`;
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

  //SISTEMA FUERA DE LA ARQUITECTURA DEL SINTEG(APP-REACT/FUERA DEL SERVER)
  if (sugoButton) {
    sugoButton.addEventListener("click", () => {
      //Obtenemos el token de la cookie 
      const token = document.cookie.split("; ").find(row => row.startsWith("access_token="))?.split("=")[1];
      const sugoBase = "http://10.10.30.28:5173/";
      const url = token ? `${sugoBase}/?token=${token}` : `${sugoBase}/`;

      console.log("Abriendo SUGO...", url);
      window.open(url, "_blank");
    });
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

