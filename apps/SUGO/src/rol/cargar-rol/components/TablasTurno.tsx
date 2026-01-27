// -------------------------------------------------------------
// Componente modularizado: TablasTurno
// Este componente muestra las tablas de horarios y registros de caseta
// para cada turno y día, con indicadores de cumplimiento y captura.
// Extraído desde RolesCargados.tsx para mejorar la organización.
// -------------------------------------------------------------

import React, { useState } from 'react';
import { getCasetaRegistros } from '../services/casetaService';
import { getDiaSemana, compararHoraSalida, getDiasLaborados, getDiasCumplidos } from '../utils/rolesHelpers';

// Constantes de días y encabezados de tabla
const dias = ["Lunes a Viernes", "Sabado", "Domingo"];
const encabezados = [
    { key: "hora_inicio", label: "Hora inicio" },
    { key: "hora_inicio_cc", label: "Hora inicio CC" },
    { key: "lugar_inicio", label: "Lugar inicio" },
    { key: "hora_termino", label: "Hora término" },
    { key: "hora_termino_cc", label: "Hora término CC" },
    { key: "termino_modulo", label: "Término módulo" },
    { key: "lugar_termino_cc", label: "Lugar término CC" }
];

// Componente principal TablasTurno
export const TablasTurno: React.FC<{ data: any, turno: number, periodo: any }> = ({ data, turno, periodo }) => {
    // Buscar operador correspondiente al turno
    const operador = (data.operadores_servicios || []).find((op: any) => Number(op.turno) === turno);
    if (!operador) return null;

    // Estados para captura y registros de caseta
    const [casetaCaptura, setCasetaCaptura] = useState<'capturado' | 'no-capturado' | null>(null);
    const [casetaRegistros, setCasetaRegistros] = useState<any[]>([]);

    // Efecto para buscar registros en caseta según periodo y operador
    React.useEffect(() => {
        const eco = data.economico;
        const op_cred = operador.operador;
        if (!eco || !op_cred || !periodo?.fecha_inicio || !periodo?.fecha_fin) {
            setCasetaCaptura(null);
            setCasetaRegistros([]);
            return;
        }
        getCasetaRegistros({
            fecha_inicio: periodo.fecha_inicio,
            fecha_fin: periodo.fecha_fin,
            eco,
            op_cred,
            tipo: 1
        }).then(registros => {
            setCasetaCaptura(registros.length > 0 ? 'capturado' : 'no-capturado');
            setCasetaRegistros(registros);
        });
    }, [data.economico, operador.operador, periodo]);

    // Descansos del operador y lógica para ocultar días
    const descansos = Array.isArray(operador.descansos) ? operador.descansos.map((d: string) => d.trim().toLowerCase()) : [];
    const descansaSabado = descansos.includes('s') || descansos.includes('sábado') || descansos.includes('sabado');
    const descansaDomingo = descansos.includes('d') || descansos.includes('domingo');

    // Cálculo de días laborados, cumplidos y porcentaje
    const diasLaborados = getDiasLaborados(periodo);
    const diasCumplidos = getDiasCumplidos(casetaRegistros);
    const porcentaje = diasLaborados > 0 ? Math.round((diasCumplidos / diasLaborados) * 100) : 0;

    // Render principal: tablas de horarios y registros de caseta
    return (
        <div key={turno} style={{ marginBottom: 32 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
                Turno {turno} — Operador: {operador.operador} — Descansos: {Array.isArray(operador.descansos) ? operador.descansos.join(', ') : '-'}
                {diasLaborados > 0 && (
                    <span style={{ marginLeft: 16, fontWeight: 400, color: '#1976d2', fontSize: 15 }}>
                        Cumplimiento: <b>{porcentaje}%</b> ({diasCumplidos}/{diasLaborados} días)
                    </span>
                )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                {dias.map(dia => {
                    if (
                        (dia === "Sabado" && descansaSabado) ||
                        (dia === "Domingo" && descansaDomingo)
                    ) {
                        return null;
                    }
                    const horario = (data.horarios || []).find((h: any) => h.turno === turno && h.dias_servicios === dia);
                    return (
                        <table key={dia} style={{ width: 260, borderCollapse: 'collapse', fontSize: 13, marginBottom: 0 }}>
                            <thead>
                                <tr style={{ background: '#f7f7f7' }}>
                                    <th colSpan={encabezados.length} style={{ border: '1px solid #eee', padding: 6, textAlign: 'center' }}>{dia}</th>
                                </tr>
                                <tr>
                                    {encabezados.map(e => (
                                        <th key={e.key} style={{ border: '1px solid #eee', padding: 6 }}>{e.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {encabezados.map(e => (
                                        <td key={e.key} style={{ border: '1px solid #eee', padding: 6 }}>{horario ? (horario[e.key] ?? '-') : '-'}</td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    );
                })}
            </div>
            <div style={{ marginTop: 8, textAlign: 'center', fontWeight: 600 }}>
                {casetaCaptura === 'capturado' && <span style={{ color: '#43a047' }}>Capturado en caseta</span>}
                {casetaCaptura === 'no-capturado' && <span style={{ color: '#d32f2f' }}>No capturado en caseta</span>}
                {casetaCaptura === null && <span style={{ color: '#888' }}>Sin información de caseta</span>}
            </div>
            {casetaRegistros.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    <table style={{ width: 800, borderCollapse: 'collapse', fontSize: 13, background: '#f9f9f9', margin: '0 auto' }}>
                        <thead>
                            <tr style={{ background: '#f7f7f7' }}>
                                <th style={{ border: '1px solid #eee', padding: 6 }}>Día</th>
                                <th style={{ border: '1px solid #eee', padding: 6 }}>Fecha</th>
                                <th style={{ border: '1px solid #eee', padding: 6 }}>Hora salida</th>
                                <th style={{ border: '1px solid #eee', padding: 6 }}>Ruta</th>
                                <th style={{ border: '1px solid #eee', padding: 6 }}>Ruta modalidad</th>
                                <th style={{ border: '1px solid #eee', padding: 6 }}>Turno</th>
                                <th style={{ border: '1px solid #eee', padding: 6 }}>¿Salió a tiempo?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {casetaRegistros.map((reg: any, idx: any) => {
                                const fechaObj = reg.momento ? new Date(reg.momento) : null;
                                const diaSemana = fechaObj ? getDiaSemana(reg.momento) : '-';
                                const fecha = fechaObj ? fechaObj.toLocaleDateString() : '-';
                                const horaSalida = fechaObj ? fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
                                let horarioDia = null;
                                if (diaSemana === 'Domingo') {
                                    horarioDia = (data.horarios || []).find((h: any) => h.turno === turno && h.dias_servicios === 'Domingo');
                                } else if (diaSemana === 'Sabado' || diaSemana === 'Sábado') {
                                    horarioDia = (data.horarios || []).find((h: any) => h.turno === turno && h.dias_servicios === 'Sabado');
                                } else {
                                    horarioDia = (data.horarios || []).find((h: any) => h.turno === turno && h.dias_servicios === 'Lunes a Viernes');
                                }
                                const horaInicio = horarioDia ? horarioDia.hora_inicio : null;
                                const comparacion = compararHoraSalida(horaInicio, reg.momento);
                                let color = '#888';
                                let texto = 'Sin dato';
                                if (comparacion.status === 'a-tiempo') {
                                    color = '#43a047';
                                    texto = 'A tiempo';
                                } else if (comparacion.status === 'retraso-moderado') {
                                    color = '#fbc02d';
                                    texto = `Retraso moderado (${comparacion.minutos} min)`;
                                } else if (comparacion.status === 'retraso') {
                                    color = '#d32f2f';
                                    texto = `Retraso (${comparacion.minutos} min)`;
                                } else if (comparacion.status === 'adelantado') {
                                    color = '#1976d2';
                                    texto = `Adelantado (${comparacion.minutos} min)`;
                                }
                                return (
                                    <tr key={idx}>
                                        <td style={{ border: '1px solid #eee', padding: 6 }}>{diaSemana}</td>
                                        <td style={{ border: '1px solid #eee', padding: 6 }}>{fecha}</td>
                                        <td style={{ border: '1px solid #eee', padding: 6 }}>{horaSalida}</td>
                                        <td style={{ border: '1px solid #eee', padding: 6 }}>{reg.ruta || '-'}</td>
                                        <td style={{ border: '1px solid #eee', padding: 6 }}>{reg.ruta_modalidad || '-'}</td>
                                        <td style={{ border: '1px solid #eee', padding: 6 }}>{reg.op_turno || '-'}</td>
                                        <td style={{ border: '1px solid #eee', padding: 6, color, fontWeight: 600 }}>{texto}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
