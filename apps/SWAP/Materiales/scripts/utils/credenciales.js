export async function buscarCredencial(
  url,
  id_input_credencial,
  id_input_nombre,
  id_ul
) {
  try {
    // obtenemos los id de los elementos
    const input = document.getElementById(id_input_credencial);
    const nombreInput = document.getElementById(id_input_nombre);
    const listaCredenciales = document.getElementById(id_ul);

    // tomamos el valor del input
    input.addEventListener("input", async () => {
      const valor = input.value.trim();
      if (valor.length === 0) {
        listaCredenciales.innerHTML = "";
        nombreInput.value = "";
        return;
      }

      // llamamos al back con lo que el usuario escribe
      const response = await fetch(`${url}?q=${encodeURIComponent(valor)}`);
      const resultado = await response.json();
      listaCredenciales.innerHTML = "";

      if (resultado.length > 0) {
        resultado.forEach((credencial) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <span class="sugerencia-credencial">${credencial.trab_credencial}</span>
            <span class="sugerencia-nombre">${credencial.trab_nombre} ${credencial.trab_apaterno} ${credencial.trab_amaterno}</span>
          `;
          li.onclick = () => {
            // Solo números en el input de credencial
            input.value = credencial.trab_credencial.replace(/[^0-9]/g, '');
            nombreInput.value = `${credencial.trab_nombre} ${credencial.trab_apaterno} ${credencial.trab_amaterno}`;
            listaCredenciales.innerHTML = "";
          };
          listaCredenciales.appendChild(li);
        });
        listaCredenciales.style.display = "block";
      } else {
        listaCredenciales.style.display = "none";
      }
    });

    // Oculta la lista si se hace clic fuera
    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !listaCredenciales.contains(e.target)) {
        listaCredenciales.style.display = "none";
      }
    });
  } catch (error) {
    console.log("Error en la solicitud:", error);
  }
}