export const modulos_sistema = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Módulos del sistema cargados correctamente.", data);
    return data;
  } catch (error) {
    console.error("Error al cargar los módulos del sistema:", error);
  }
};
