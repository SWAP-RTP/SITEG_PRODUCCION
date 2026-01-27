import { useState, useEffect } from 'react';
import { fetchPeriodos } from '../services/periodoService';
import { RolFormularioState } from '../interfaces/RolFormularioState';

export function useRolFormulario(): RolFormularioState {
    const [periodo, setPeriodo] = useState<any>(null); // Estado para el periodo seleccionado
    const [periodos, setPeriodos] = useState<any[]>([]); // Opciones disponibles de periodo
    const [modulo, setModulo] = useState<any>(null); // Estado para el módulo seleccionado
    const [modulos, setModulos] = useState<any[]>(
        [
            { name: 'M01', value: { name: 'M01', value: 1 } },
            { name: 'M02', value: { name: 'M02', value: 2 } },
            { name: 'M03', value: { name: 'M03', value: 3 } },
            { name: 'M04-A', value: { name: 'M04-A', value: 4 } },
            { name: 'M04-M', value: { name: 'M04-M', value: 4 } },
            { name: 'M05', value: { name: 'M05', value: 5 } },
            { name: 'M06', value: { name: 'M06', value: 6 } },
            { name: 'M07', value: { name: 'M07', value: 7 } }
        ]
    ); // Opciones disponibles de módulos
    const [excel, setExcel] = useState<any>(null); // Estado para el archivo Excel seleccionado
    const [errores, setErrores] = useState<any[]>([]); // Array de errores de validación
    const [error, setError] = useState<string>(''); // Mensaje de error general
    const [isLoading, setIsLoading] = useState<boolean>(false); // Estado de carga (loading)
    const [validatingData, setValidatingData] = useState<boolean>(false); // Estado de validación de datos
    const [canUpload, setCanUpload] = useState<boolean>(false); // Indica si se puede subir el archivo
    const [showErr, setShowErr] = useState<boolean>(false); // Indica si se deben mostrar errores
    const [cont, setCont] = useState<number>(0); // Contador auxiliar
    const [rolesSended, setRolesSended] = useState<any[]>([]); // Array de roles enviados

    // Cargar opciones del periodo usando el servicio
    useEffect(() => {
        const loadPeriodos = async () => {
            const data = await fetchPeriodos(); // Llama al servicio
            // Transforma los datos al formato esperado
            const formattedData = data.map((item: any) => ({
                label: item.name, 
                value: item.self    
            }));
            setPeriodos(formattedData); // Asigna las opciones transformadas
        };

        loadPeriodos();
    }, []); // Se ejecuta una vez al montar el componente

    // Función para enviar los datos
    const sendData = () => {
        // ...tu lógica para enviar datos...
    };

    // Función para limpiar el formulario
    const limpiarFormulario = () => {
        // ...tu lógica para limpiar el formulario...
    };

    return { // Retorna todo el estado y funciones necesarias
        periodo,
        setPeriodo,
        periodos,
        modulo,
        setModulo,
        modulos,
        excel,
        setExcel,
        errores,
        error,
        isLoading,
        validatingData,
        canUpload,
        showErr,
        cont,
        sendData,
        limpiarFormulario,
        rolesSended
    };
}