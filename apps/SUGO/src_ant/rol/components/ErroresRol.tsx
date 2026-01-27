import { Divider } from 'primereact/divider';
import { LoadingDialog } from '../../shared/components/Loaders';
import { ProgressBar } from 'primereact/progressbar';

export const ErroresRol = ({ errores, showErr, isLoading, validatingData, cont }) => (
    <>
        {(!showErr)
            ? null
            : errores.length === 0
                ? <p className='my-6 px-3 mx-auto w-12 sm:w-max p-tag bg-green-500' style={{ fontSize: '40px' }}>
                    <span className='mx-2'>Todo Ok</span>
                    &#128076;
                </p>
                : <>
                    <Divider className='mt-6' align='center'>
                        <span className="p-tag bg-red-500">Notas</span>
                    </Divider>
                    {/* Aquí puedes agregar la visualización de errores como en tu componente original */}
                </>
        }
        <LoadingDialog isVisible={isLoading || validatingData}>
            <h2> {validatingData ? 'Verificando Rol' : 'Cargando...'} </h2>
            <ProgressBar value={cont} />
        </LoadingDialog>
    </>
);
