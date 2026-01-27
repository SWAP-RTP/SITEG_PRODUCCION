// ---------------------------------------------------------------------
// Documentación de cambios y estructura actual
// ---------------------------------------------------------------------
// Este archivo fue modularizado para mejorar la organización y claridad.
// - Los helpers y lógica de cálculo se movieron a utils/rolesHelpers.ts
// - El modal de detalle se extrajo a components/ModalGlosario.tsx
// - El componente principal RolesCargados ahora solo gestiona la UI y estados.
// ---------------------------------------------------------------------

// Importaciones principales: React, hooks personalizados, interfaces y componentes modularizados
import React, { useState, useEffect } from 'react';
import { useRolesCargados } from '../../shared/hooks/useRolesCargados';
import { useRolesFiltrados } from '../hooks/useRolesFiltrados';
import { RolesCargadosProps } from '../../shared/interfaces/RolesCargados.interface';
import { ModalGlosario } from './ModalGlosario';
import useAuthStore from "../../../shared/auth/useAuthStore";

// Constante de módulos disponibles
const MODULOS = [1, 2, 3, 4, 5, 6, 7];

// Componente principal para visualizar roles cargados y su glosario
// Este componente gestiona la visualización de los roles, el filtrado,
// la expansión de detalles y la apertura/cierre del modal de glosario.
export const RolesCargados: React.FC<RolesCargadosProps> = ({ periodo, reload }) => {
	// Hooks para obtener roles y lógica de filtrado
	const { roles, loading, error, fetchRoles } = useRolesCargados();
	const {
		filter, setFilter,
		rolesPorModuloFiltrados,
		resumenRol,
		limpiarNotas
	} = useRolesFiltrados(roles);
	// Estados para UI: módulo abierto, rol expandido, servicio seleccionado
	const [openModulo, setOpenModulo] = useState<number | null>(null);
	const [expandedRole, setExpandedRole] = useState<number | null>(null);
	const [selectedServiceKey, setSelectedServiceKey] = useState<string | null>(null);
	const { credencial: credencial_usuario, modulo: modulo_usuario } = useAuthStore((store) => store.user); //obtienne credencial y modulo del usuario autenticado

	// Estado para modal glosario
	const [modalOpen, setModalOpen] = useState(false);
	const [modalData, setModalData] = useState<any>(null);
	const [modalTipo, setModalTipo] = useState<string>('');

	// Efecto para recargar roles cuando cambia el periodo o se solicita reload
	useEffect(() => {
		if (periodo) {
			fetchRoles(periodo.id);
		}
	}, [periodo, reload]);

	// Función para alternar el módulo abierto
	const toggleModulo = (m: number) => setOpenModulo(openModulo === m ? null : m);
	// Función para alternar el rol expandido
	const toggleRole = (id: number) => setExpandedRole(expandedRole === id ? null : id);

	// Funciones para abrir/cerrar el modal glosario
	// Al abrir, se guarda el dato y tipo a mostrar
	const abrirModalGlosario = (data: any, tipo: string) => {
		setModalData(data);
		setModalTipo(tipo);
		setModalOpen(true);
	};

	// Al cerrar, se limpian los estados del modal
	const cerrarModalGlosario = () => {
		setModalOpen(false);
		setModalData(null);
		setModalTipo('');
	};
	// Validación de módulos a mostrar según el módulo del usuario
	let modulosAMostrar: number[] = MODULOS;
	if (typeof modulo_usuario === 'number' && modulo_usuario >= 1 && modulo_usuario <= 7) {
		modulosAMostrar = [modulo_usuario];
	} else if (modulo_usuario === 0) {
		modulosAMostrar = MODULOS;
	}

	// Render principal: muestra los módulos, roles y detalles
	return (
		<div style={{ flex: 1, width: '100%', maxWidth: 1300, margin: '0 auto' }}>
			<h2>Roles cargados</h2>
			{/* Filtro activo */}
			{/* Si hay filtro, se muestra el tipo y valor, con opción de limpiar */}
			{filter && (
				<div style={{ marginBottom: 12 }}>
					<div>Filtrando por: <strong>{filter.kind}</strong> — <code>{String(filter.value)}</code> <button onClick={() => setFilter(null)} style={{ marginLeft: 8 }}>Limpiar</button></div>
				</div>
			)}
			{/* Mensajes de error y carga */}
			{error && <div style={{ color: 'red' }}>Error: {String(error)}</div>}
			{loading && <div style={{ color: '#61895e' }}>Cargando roles...</div>}
			{/* Listado de módulos y roles */}
			{modulosAMostrar.map((m) => (
				<div key={m} style={{ marginBottom: 16, border: '1px solid #ddd', borderRadius: 8 }}>
					<div
						onClick={() => toggleModulo(m)}
						style={{
							cursor: 'pointer',
							background: '#f0f4f2',
							padding: '12px 16px',
							fontWeight: 700,
							borderRadius: '8px 8px 0 0',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center'
						}}
					>
						<div>Módulo {m}</div>
						<div style={{ fontSize: 12, color: '#666' }}>{rolesPorModuloFiltrados(m).length} roles</div>
					</div>
					{openModulo === m && (
						<div style={{ padding: 12, background: '#fff' }}>
							{/* Glosario del módulo: servicios / cubredescansos / jornadas */}
							{rolesPorModuloFiltrados(m).length === 0 ? (
								<div style={{ color: '#888' }}>Sin datos cargados para este módulo.</div>
							) : (
								<div style={{ display: 'grid', gap: 12 }}>
									{rolesPorModuloFiltrados(m).map((r: any) => (
										<div
											key={r.id}
											style={{
												border: '1px solid #eee',
												borderRadius: 6,
												padding: 12,
												boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
											}}
										>
											<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
												<div>
													<strong>
														{r.RutaModalidade?.ruta?.ruta
															? `${r.RutaModalidade.ruta.ruta} (${r.RutaModalidade.modalidad?.name ?? ''})`
															: `Rol #${r.id}`}
													</strong>
													<div style={{ color: '#666', fontSize: 13 }}>
														{r.RutaModalidade?.ruta?.ruta
															? `${r.RutaModalidade.ruta.origen} - ${r.RutaModalidade.ruta.destino}`
															: 'Sin origen/destino'}
													</div>
												</div>
												<div style={{ textAlign: 'right' }}>
													<div style={{ fontSize: 13, color: '#444' }}>{resumenRol(r)}</div>
													<div style={{ marginTop: 8 }}>
														<button
															onClick={() => toggleRole(r.id)}
															style={{
																padding: '6px 10px',
																borderRadius: 6,
																border: '1px solid #ccc',
																background: expandedRole === r.id ? '#e8f5e9' : '#fff',
																cursor: 'pointer'
															}}
														>
															{expandedRole === r.id ? 'Ocultar detalles' : 'Ver detalles'}
														</button>
													</div>
												</div>
											</div>
											{/* Detalles del rol expandido */}
											{expandedRole === r.id && (
												<div style={{ marginTop: 12, borderTop: '1px dashed #eee', paddingTop: 12 }}>
													<div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
														{/* Columna izquierda: Glosario */}
														<div style={{ minWidth: 660, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
															<div style={{ minWidth: 180 }}>
																<strong style={{ display: 'block', marginBottom: 4 }}>Servicios ({(r.servicios || []).length})</strong>
																<div style={{ marginTop: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
																	{(r.servicios || []).map((s: any, i: number) => {
																		const key = s.economico ? String(s.economico) : String(s.id || i);
																		return (
																			<button key={key} onClick={() => abrirModalGlosario(s, 'servicio')}
																				style={{ textAlign: 'left', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
																				{s.economico ? `Economico: ${s.economico}` : s.sistema || `Servicio ${s.id || i}`}
																			</button>
																		);
																	})}
																</div>
															</div>
															<div style={{ minWidth: 180 }}>
																<strong style={{ display: 'block', marginBottom: 4 }}>Cubredescansos ({(r.cubredescansos || []).length})</strong>
																<div style={{ marginTop: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
																	{(r.cubredescansos || []).map((c: any, i: number) => {
																		// Generar la letra correspondiente al índice (A, B, C, ...)
																		const letra = String.fromCharCode(65 + i); // 65 es el código ASCII de 'A'
																		const key = letra; // Usar la letra como clave
																		return (
																			<button key={key} onClick={() => abrirModalGlosario(c, 'cubredescanso')}
																				style={{ textAlign: 'left', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
																				{letra}
																			</button>
																		);
																	})}
																</div>
															</div>
															<div style={{ minWidth: 180 }}>
																<strong style={{ display: 'block', marginBottom: 4 }}>Jornadas Excepcionales({(r.jornadas_excepcionales || []).length})</strong>
																<div style={{ marginTop: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
																	{(r.jornadas_excepcionales || []).map((j: any, i: number) => {
																		const key = j.operador ? String(j.operador) : String(j.id || i);
																		return (
																			<button key={key} onClick={() => abrirModalGlosario(j, 'jornada')}
																				style={{ textAlign: 'left', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
																				{`Operador: ${j.operador}`}
																			</button>
																		);
																	})}
																</div>
															</div>
														</div>
														{/* Columna derecha: Notas */}
														<div style={{ minWidth: 320, maxWidth: 600 }}>
															{r.notas && (
																<div>
																	<strong style={{ display: 'block', marginBottom: 4 }}>Notas:</strong>
																	<div
																		style={{
																			whiteSpace: 'pre-wrap',
																			color: '#333',
																			marginTop: 0,
																			textAlign: 'left',
																			fontSize: 14,
																			lineHeight: 1.5
																		}}
																	>
																		{limpiarNotas(r.notas)}
																	</div>
																</div>
															)}
														</div>
													</div>
													{/* Modal glosario */}
													{/* El modal se muestra cuando se selecciona un servicio, cubredescanso o jornada */}
													<ModalGlosario open={modalOpen} onClose={cerrarModalGlosario} data={modalData} tipo={modalTipo} periodo={periodo} />
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			))}
		</div>
	);
}