import { useEffect, useState, useCallback } from "react";
import { fetchPeriodos } from "../services/periodoService";
import { fetchModulos } from "../services/moduloService";

/**
 * Hook unificado para selectores de periodo y módulo con validación de errores.
 */

export function useSelectoresRol() {
    const [periodoError, setPeriodoError] = useState(false);
    const [moduloError, setModuloError] = useState(false);
    const [periodo, setPeriodo] = useState<any>(null);
    const [periodos, setPeriodos] = useState<any[]>([]);
    const [modulo, setModulo] = useState<any>(null);
    const [modulos, setModulos] = useState<any[]>([]);

    // Cargar módulos
    useEffect(() => {
        const loadModulos = async () => {
            const data = await fetchModulos();
            const formattedData = data.map((item: any) => ({
                label: item.name,
                value: item.id,
            }));
            setModulos(formattedData);
        };
        loadModulos();
    }, []);

    // Cargar periodos
    useEffect(() => {
        const loadPeriodos = async () => {
            const data = await fetchPeriodos();
            const formattedData = data.map((item: any) => ({
                label: item.name,
                value: item.self,
            }));
            setPeriodos(formattedData);

            // Selección automática del periodo actual
            const hoy = new Date();
            const periodoActual = formattedData.find((p: any) => {
                // Suponiendo que value.fecha_inicio y value.fecha_fin están en formato dd/mm/aaaa
                const [diaIni, mesIni, anioIni] = p.value.fecha_inicio.split("/");
                const [diaFin, mesFin, anioFin] = p.value.fecha_fin.split("/");
                const ini = new Date(`${anioIni}-${mesIni}-${diaIni}`);
                const fin = new Date(`${anioFin}-${mesFin}-${diaFin}`);
                return ini <= hoy && hoy <= fin;
            });
            if (periodoActual) {
                setPeriodo(periodoActual.value);
            }
        };
        loadPeriodos();
    }, []);

    // Handlers con validación
    const handlePeriodoChange = useCallback((periodo: any) => {
        setPeriodo(periodo);
        if (periodo) setPeriodoError(false);
    }, [setPeriodo, setPeriodoError]);

    const handleModuloChange = useCallback((modulo: any) => {
        setModulo(modulo);
        if (modulo?.name || modulo) setModuloError(false);
    }, [setModulo, setModuloError]);


    // Retornar estado y handlers
    return {
        periodo,
        setPeriodo,
        periodos,
        periodoError,
        setPeriodoError,
        handlePeriodoChange,
        modulo,
        setModulo,
        modulos,
        moduloError,
        setModuloError,
        handleModuloChange,
    };
}
