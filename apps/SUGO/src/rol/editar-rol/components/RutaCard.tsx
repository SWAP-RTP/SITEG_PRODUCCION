import React, { useState } from 'react';
import { RutaEdit } from '../interfaces/RutaEdit.interface';
import { IRolCargado } from '../../shared/interfaces/RolesCargados.interface'; // Importa la interfaz correcta
import RutaHeader from './RutaHeader';
import ServiciosTable from './ServiciosTable';
import CubredescansosTable from './CubredescansosTable';
import JornadasTable from './JornadasTable';
import { useEditarRolPorPeriodo } from '../hooks/useEditarRol';
import { Calendar } from 'primereact/calendar';
import { cellStyle } from '../../../shared/styles/TableStyles'; // Importa estilos compartidos

export const RutaCard: React.FC<{ ruta: IRolCargado; onEdit?: () => void }> = ({ ruta }) => {
  // Obtén la función de mapeo del hook
  const { mapDataToRutaEdit } = useEditarRolPorPeriodo();
  // Transforma la data usando la función
  const form: RutaEdit = mapDataToRutaEdit(ruta);
  const [abierto, setAbierto] = useState(false);
  const [diasImpares, setDiasImpares] = useState<Date[] | null>(null);
  const [diasPares, setDiasPares] = useState<Date[] | null>(null);

  // Función para deshabilitar días pares en el calendario de impares
  const disablePares = (date: Date) => date.getDate() % 2 === 0;
  // Función para deshabilitar días impares en el calendario de pares
  const disableImpares = (date: Date) => date.getDate() % 2 !== 0;

  const handleToggle = () => setAbierto(a => !a);

  return (
    <div style={{ marginBottom: 24, borderRadius: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', background: '#fff' }}>
      <RutaHeader ruta={form} onEdit={handleToggle} abierto={abierto} />
      {abierto && (
        <div style={{ padding: '0 24px 24px 24px' }}>
          <ServiciosTable servicios={form.servicios} />
          <CubredescansosTable cubredescansos={form.cubredescansos} />
          <JornadasTable jornadas={form.jornadas} />
          {/* Calendarios y observaciones en un solo div compacto */}
          <div style={{
            display: 'flex',
            gap: '24px',
            marginTop: 32,
            marginBottom: 24,
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label style={{
                ...cellStyle,
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 8,
                display: 'block',
                background: '#f8f9fa',
                padding: '8px 12px',
                borderRadius: '6px'
              }}>
                LOS OPERADORES DEL PRIMER TURNO SACA LOS DÍAS: <span style={{ color: '#2f23ae', fontWeight: 700 }}>IMPAR</span>
              </label>
              <Calendar
                value={diasImpares}
                onChange={(e) => setDiasImpares(e.value)}
                selectionMode="multiple"
                disabledDates={Array.from({ length: 31 }, (_, i) => i + 1).filter(d => d % 2 === 0).map(d => {
                  const date = new Date();
                  date.setDate(d);
                  return date;
                })}
                style={{ width: '100%', marginTop: 8 }}
                inline={false}
                showIcon
                placeholder="Selecciona días impares"
              />
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label style={{
                ...cellStyle,
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 8,
                display: 'block',
                background: '#f8f9fa',
                padding: '8px 12px',
                borderRadius: '6px'
              }}>
                LOS OPERADORES DEL SEGUNDO TURNO SACAN LOS DÍAS: <span style={{ color: '#2f23ae', fontWeight: 700 }}>PAR</span>
              </label>
              <Calendar
                value={diasPares}
                onChange={(e) => setDiasPares(e.value)}
                selectionMode="multiple"
                disabledDates={Array.from({ length: 31 }, (_, i) => i + 1).filter(d => d % 2 !== 0).map(d => {
                  const date = new Date();
                  date.setDate(d);
                  return date;
                })}
                style={{ width: '100%', marginTop: 8 }}
                inline={false}
                showIcon
                placeholder="Selecciona días pares"
              />
            </div>
          </div>
          {/* Observaciones textarea debajo de los calendarios */}
          <div style={{
            marginTop: 0,
            padding: '18px 0 0 0',
            borderTop: '1px solid #e0e0e0'
          }}>
            <label style={{
              ...cellStyle,
              fontWeight: 600,
              fontSize: 16,
              marginBottom: 8,
              display: 'block'
            }}>
              Observaciones de la ruta:
            </label>
            <textarea
              rows={3}
              style={{
                ...cellStyle,
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                resize: 'vertical',
                background: '#f8f9fa'
              }}
              placeholder="Escribe aquí tus observaciones..."
            />
          </div>
        </div>
      )}
    </div>
  );
};
