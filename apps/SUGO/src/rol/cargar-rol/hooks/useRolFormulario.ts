import { useState, useEffect } from "react";
import { useSelectoresRol } from "../../shared/hooks/useSelectoresRol"; // Hook compartido para manejar selectores y validación
import { RolFormularioState } from "../interfaces/RolFormularioState"; // Interfaz del estado del formulario
import { estructurarDatosDesdeFilas, parsearHojaCompleta } from "../utils"; // Utilidades para parsear y estructurar datos
import { cargarRolCompleto } from "../services/cargaRolService"; // Servicio para cargar el rol completo
import useAuthStore from "../../../shared/auth/useAuthStore"; // Hook para obtener información del usuario autenticado


/**
 * Hook principal para la gestión del formulario de carga de roles.
 *
 * Maneja los estados de selección de periodo, módulo, archivo Excel, validación, errores,
 * carga de catálogos y lógica de envío de datos.
 *
 * Devuelve el estado completo del formulario y setters para su uso en el componente principal.
 */

export const useRolFormulario = (): RolFormularioState => {
  const {
    periodo, setPeriodo, periodos, periodoError, setPeriodoError, handlePeriodoChange,
    modulo, setModulo, modulos, moduloError, setModuloError, handleModuloChange
  } = useSelectoresRol(); // Hook unificado para los selectores y validación
  const [excel, setExcel] = useState<any>(null); // Estado para el archivo seleccionado (no usado)
  const [servicios, setServicios] = useState<any[]>([]);
  const [cubredescansos, setCubredescansos] = useState<Record<string, any[]>>({}); // Estado para los cubredescansos 
  const [jornadasExcepcionales, setJornadasExcepcionales] = useState<any[]>([]); // Estado para las jornadas excepcionales
  const [infoGeneral, setInfoGeneral] = useState<Record<string, any>>({});
  const [resultadosPorHoja, setResultadosPorHoja] = useState<any[]>([]);
  const [errores, setErrores] = useState<Record<string, any[]>>({}); // Cambia el tipo a un objeto
  const [error, setError] = useState<string>(""); // Mensaje de error general
  const [isLoading, setIsLoading] = useState<boolean>(false); // Estado de carga (loading)
  const [validatingData, setValidatingData] = useState<boolean>(false); // Estado de validación de datos
  const [canUpload, setCanUpload] = useState<boolean>(false); // Indica si se puede subir el archivo
  const [showErr, setShowErr] = useState<boolean>(false); // Indica si se deben mostrar errores
  const [cont, setCont] = useState<number>(0); // Contador auxiliar
  const [rolesSended, setRolesSended] = useState<any[]>([]); // Array de roles enviados
  const { credencial: credencial_usuario, modulo: modulo_usuario } = useAuthStore((store) => store.user); //obtienne credencial y modulo del usuario autenticado
  // Estado para forzar el reset visual del input file y mensaje de éxito
  const [fileInputKey, setFileInputKey] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);


  // Envia el rol completo al backend
  const sendData = async (excelData?: any): Promise<{ ok: boolean }> => {
    try {
      setError("");
      setErrores({}); // Ahora es válido porque errores es un objeto
      setShowErr(false);
      setValidatingData(true);

      // Parsea y estructura las hojas del archivo Excel
      const hojas = await parsearHojaCompleta(excelData ?? excel, true);
      const hojasEstructuradas = hojas.map(({ nombre, filas }) => {
        const estructuraHoja = estructurarDatosDesdeFilas(filas);
        return {
          nombre,
          encabezado: estructuraHoja.encabezado,
          servicios: estructuraHoja.servicios,
          cubredescansos: estructuraHoja.cubredescansos,
          jornadasExcepcionales: estructuraHoja.jornadasExcepcionales,
        };
      });
      // Llama al servicio para cargar el rol completo
      await cargarRolCompleto({
        nombre_archivo: excel?.name,
        subido_por: credencial_usuario,
        modulo_usuario: modulo_usuario,
        hojas: hojasEstructuradas,
        periodo,
        modulo
      });

      setErrores({}); // Limpia errores si todo está bien
      setShowErr(true);
      return { ok: true };
    } catch (e: any) {
      // Maneja errores específicos y generales
      if (e.errores) {
        const erroresPorHoja = e.errores.reduce((acc: Record<string, any[]>, err: any) => {
          const hoja = err.hoja; // Usa el nombre real de la hoja
          if (!acc[hoja]) acc[hoja] = [];
          acc[hoja].push(err);
          return acc;
        }, {});
        setErrores(erroresPorHoja); // Agrupa errores por hoja
      } else {
        setErrores({ General: [{ message: e.message || "Error desconocido" }] }); // Ahora es válido
      }
      setError(String(e.message || e));
      setShowErr(true);
      return { ok: false };
    } finally {
      setValidatingData(false);
    }
  };



  // Función para limpiar el formulario y el estado visual
  const limpiarFormulario = () => {
    // setPeriodo(null);
    setModulo(null);
    setExcel(null);
    setPeriodoError(false);
    setModuloError(false);
    setErrores({}); // Limpia errores específicos
    setError(""); // Limpia mensaje de error general
    setShowErr(false); // Oculta mensajes de error visuales
    setFileInputKey(prev => prev + 1);
    setShowSuccess(false);
  };

  // Retorna todo el estado y funciones necesarias
  return {
    periodo,
    setPeriodo,
    periodos,
    modulo,
    setModulo,
    modulos,
    excel,
    setExcel,
    infoGeneral,
    servicios,
    errores,
    error,
    isLoading,
    validatingData,
    canUpload,
    showErr,
    cont,
    sendData,
    limpiarFormulario,
    rolesSended,
    getHeaderForPrint: () => Object.assign({}, infoGeneral), // getHeaderForPrint: devuelve infoGeneral plano
    periodoError,
    setPeriodoError,
    moduloError,
    setModuloError,
    fileInputKey,
    showSuccess,
  };
}
