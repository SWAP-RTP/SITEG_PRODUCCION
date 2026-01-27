import React from 'react';
import { Button } from 'primereact/button';
import { RutaEdit } from '../interfaces/RutaEdit.interface';

interface RutaHeaderProps {
  ruta: RutaEdit;
  onEdit: () => void;
  abierto: boolean;
}

const RutaHeader: React.FC<RutaHeaderProps> = ({ ruta, onEdit, abierto }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      background: '#e8f5e9',
      cursor: 'pointer'
    }}
  >
    <div>
      <strong style={{ fontSize: 22, color: '#388e3c' }}>
        {ruta.nombre} {ruta.modalidad ? `(${ruta.modalidad})` : ''}
      </strong>
      <div style={{ color: '#666', fontSize: 16, marginTop: 4 }}>
        {ruta.origen} - {ruta.destino}
      </div>
    </div>
    <div style={{ textAlign: 'right', fontSize: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
      <Button
        label={abierto ? 'Ocultar' : 'Editar'}
        icon={abierto ? 'pi pi-chevron-up' : 'pi pi-pencil'}
        onClick={onEdit}
        className="p-button-text p-button-lg"
      />
    </div>
  </div>
);

export default RutaHeader;
