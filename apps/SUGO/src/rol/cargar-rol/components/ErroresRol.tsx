import React from 'react';
import { Divider } from 'primereact/divider';
import { LoadingDialog } from '../../../shared/components/Loaders';
import { ProgressBar } from 'primereact/progressbar';
import { ErroresRolProps } from '../interfaces/ErroresRolProps';

export const ErroresRol: React.FC<ErroresRolProps> = ({ errores, showErr, isLoading, validatingData, cont }) => (
    <>
        {(!showErr)
            ? null
            : Object.keys(errores).length === 0
                ? <p className='my-6 px-3 mx-auto w-12 sm:w-max p-tag bg-green-500' style={{ fontSize: '40px' }}>
                    <span className='mx-2'>Todo Ok</span>
                    &#128076;
                </p>
                : <div>
                    <Divider className='mt-6' align='center'>
                        <span className="p-tag bg-red-500">Errores</span>
                    </Divider>
                    {/* Muestra los errores agrupados por hoja con nombres específicos */}
                    {Object.entries(errores).map(([nombreHoja, erroresHoja], idx) => (
                        <div key={idx} style={{ marginBottom: '1em' }}>
                            <Divider align='center'>
                                <span className="p-tag bg-blue-500">{`Hoja de la ruta: ${nombreHoja}`}</span>
                            </Divider>
                            <ul style={{ color: 'red', fontSize: '18px', margin: '1em 0' }}>
                                {erroresHoja.map((err: any, errIdx: number) => (
                                    <li key={errIdx}>{err.message || err}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
        }
        <LoadingDialog isVisible={isLoading || validatingData}>
            <h2> {validatingData ? 'Verificando Rol' : 'Cargando...'} </h2>
            <ProgressBar value={cont} />
        </LoadingDialog>
    </>
);
