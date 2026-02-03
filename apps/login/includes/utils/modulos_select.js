// export const obtenerModulos = async (url) => {
//   try {
//     const response = await fetch(url);
//     const data = await response.json();
//     console.log("Módulos cargados correctamente.", data);

//     // select de modulos
//     const selectModulos = document.getElementById("select_modulos");
//     if (selectModulos) {
//       // Limpia opciones previas
//       selectModulos.innerHTML = "";
//       // Agrega las nuevas opciones
//       data.forEach((modulo) => {
//         const optionElement = document.createElement("option");
//         optionElement.value = modulo.id;
//         optionElement.text = modulo.modulo_nombre;
//         selectModulos.appendChild(optionElement);
//       });
//     }

//     return data;
//   } catch (error) {
//     console.error("Error al cargar los módulos:", error);
//   }
// };

export const obtenerModulos = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Módulos cargados correctamente.", data);

    const selectModulos = document.getElementById("select_modulos");
    if (selectModulos) {
      // Opción por defecto
      let options = `<option value="" disabled selected>Selecciona un módulo</option>`;
      // Opciones de los módulos
      options += data
        .map(
          (modulo) =>
            `<option value="${modulo.id}">${modulo.modulo_nombre}</option>`,
        )
        .join("");
      selectModulos.innerHTML = options;
    }

    return data;
  } catch (error) {
    console.error("Error al cargar. los módulos:", error);
  }
};
