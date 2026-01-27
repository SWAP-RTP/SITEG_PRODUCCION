import React from 'react';
import { CubredescansoEdit } from '../interfaces/CubredescansoEdit.interface';
import { Button } from 'primereact/button';
import { cellStyle, headerCellStyle, tableStyle } from '../../../shared/styles/TableStyles';

interface CubredescansosTableProps {
  cubredescansos: CubredescansoEdit[];
}

const CubredescansosTable: React.FC<CubredescansosTableProps> = ({ cubredescansos }) => {
  const rowStyle = (idx: number) => ({
    background: idx % 2 === 0 ? '#f9f9f9' : '#fff',
    transition: 'background 0.2s',
    cursor: 'pointer'
  });

  return (
    <div style={{ marginBottom: 40, position: 'relative' }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: 3,
        justifyContent: 'space-between'
      }}>
        <div>
          <label style={{ fontWeight: 600, fontSize: 17 }}>Cubre Descansos</label>
        </div>
        <div style={{ marginTop: 12 }}>
          <Button
            label="Nuevo Cubredescanso"
            icon="pi pi-calendar-plus"
            severity="success"
            style={{
              height: 38,
              minWidth: 180
            }}
            // onClick={handleAgregarCubredescanso} // Implementa la función según tu lógica
          />
        </div>
      </div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={headerCellStyle}>No</th>
            <th style={headerCellStyle}>Económico</th>
            <th style={headerCellStyle}>Sistema</th>
            <th style={headerCellStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {(cubredescansos ?? []).map((cubredescanso, idx) => (
            <tr key={idx} style={rowStyle(idx)}>
              <td style={cellStyle}>{cubredescanso.No}</td>
              <td style={cellStyle}>{cubredescanso.Economico}</td>
              <td style={cellStyle}>{cubredescanso.Sistema}</td>
              <td style={cellStyle}>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-lg" tooltip="Editar" severity="info" />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-lg" tooltip="Borrar" severity="danger" style={{ marginLeft: 8 }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CubredescansosTable;
