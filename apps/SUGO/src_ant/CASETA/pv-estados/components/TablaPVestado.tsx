import React, { useCallback, useContext, useEffect } from 'react'
import { ColsProps, TablaCRUD } from '../../../shared/components/Tabla'
import { FetchPVestados, Result } from '../interfaces';
import { useQuery } from 'react-query';
import { UseFetchDelete, UseFetchGet } from '../../../shared/helpers-HTTP';
import useAuthStore from '../../../shared/auth/useAuthStore';
import { GeneralContext } from '../../../shared/GeneralContext';


interface ColFields {
    id
    eco
    eco_tipo_desc
    eco_estatus
    momento
    tipo_desc
    pv_estados_motivo
    modulo
    ruta
    ruta_modalidad
    ruta_cc
    op_cred
    op_turno
    extintor
    estatus
    createdBy
    createdBy_modulo
}



const API = import.meta.env.VITE_SUGO_BackTS


export const COLS: ColsProps[] = [
    { field: "id", header: "ID",                    align: 'center' },
    { field: "modulo_puerta", header: "Puerta",     filter: true, align: 'center', bodyClassName: 'max-w-6rem' },
    // About economico
    { field: "eco", header: "Eco",                  filter: true, align: 'center', bodyClassName: 'max-w-6rem' },
    { field: "eco_tipo_desc", header: "Planta o postura",        align: 'center', bodyClassName: 'max-w-6rem' },
    { field: "eco_estatus", header: "Estado del eco",  filter: true, align: 'center', bodyClassName: 'max-w-6rem' },
    // About registro
    { field: "momento", header: "Momento",          align: 'center', bodyClassName: 'max-w-6rem'},
    //! { field: "tipo", header: "tipo" },
    { field: "tipo_desc", header: "Tipo de registro", align: 'center', bodyClassName: 'max-w-7rem'},
    // About motivo
    // { field: "motivo_id", header: "motivo_id" },
    { field: "pv_estados_motivo.desc", header: "Motivo", filter: true, align: 'center', bodyClassName: 'max-w-6rem' },
    // { field: "motivo_desc", header: "Descripcion" },
    // About lugar
    { field: "modulo", header: "Modulo" },
    // { field: "direccion", header: "Direccion" },
    { field: "ruta", header: "Ruta" },
    { field: "ruta_modalidad", header: "Modalidad" },
    { field: "ruta_cc", header: "CC" },
    // About operador y extintor
    { field: "op_cred", header: "Operador" },
    { field: "op_turno", header: "Turno" },
    { field: "extintor", header: "Extintor" },
    // About registro (meta datos)
    { field: "estatus", header: "Tipo de estado",          filter: true, align: 'center', bodyClassName: 'max-w-6rem' },
    // { field: "createdAt", header: "createdAt",      align: 'center', bodyClassName: 'max-w-6rem'},
    { field: "createdBy", header: "Creador por",      align: 'center', bodyClassName: 'max-w-6rem'},
    { field: "createdBy_modulo", header: "Modulo de creacion", align: 'center', bodyClassName: 'max-w-6rem' },
    // { field: "updatedAt", header: "updatedAt",      align: 'center', bodyClassName: 'max-w-6rem'},
    // { field: "updatedBy", header: "updatedBy",      align: 'center', bodyClassName: 'max-w-6rem'},
];

export const rowClassName = (data: Result) => {
    const className: string[] = []
    if(data.tipo == 1) className.push('text-green-600 font-bold')
    if(data.tipo == 2) className.push('text-blue-600 font-bold')

    return className.join(' ')
}

export const OPT = {
    eco_tipos: ['-', 'planta', 'postura'],
    eco_estatus: ['Baja', 'Disponible', 'NO disponible'],
    tipos: [null, 'Despacho', 'Recepción', 'Actualización'],
    estatus: ['Eliminado', 'Actual', 'Previo']
}
export const tranformarRegistrosCreados = (data: FetchPVestados): Result[] => {
    const limiteParaEditar = new Date();
    limiteParaEditar.setHours( limiteParaEditar.getHours() -72);
    
    return data.results.map( obj => ({
        ...obj, 
        editButton: new Date(obj.momento)>=limiteParaEditar,
        deleteButton: new Date(obj.momento)>=limiteParaEditar,
        eco_tipo_desc: OPT.eco_tipos[obj.eco_tipo||0], 
        eco_estatus: OPT.eco_estatus[obj.eco_estatus], 
        momento: new Date(obj.momento).toLocaleString(),
        tipo_desc: OPT.tipos[obj.tipo], 
        estatus: OPT.estatus[obj.estatus], 
        createdAt: new Date(obj.createdAt).toLocaleString(),
        updatedAt: new Date(obj.updatedAt).toLocaleString(),
    }) )
}



export const TablaPVestado = ({moduloInput, puerta}) => {
    const credencial = useAuthStore( s => s.user.credencial )
    const modulo = useAuthStore( s => s.user.modulo )
    const { sugo3cas0p10t2, sugo4cas0p10t2 } = useAuthStore( s => s.permisosSUGO )
    const { toast } = useContext(GeneralContext);

    const pvEstado = useQuery<FetchPVestados, any, Result[]>(
        ['pv','estado'], 
        () => UseFetchGet(`${API}/api/caseta/pv-estados?create_modulo=${moduloInput||modulo}&modulo_puerta=${puerta||0}`),
        {
            select: tranformarRegistrosCreados
        }
    )    

    const deleteRegistro = (d: ColFields) => {
        UseFetchDelete(`${API}/api/caseta/pv-estados/${d.id}?cred=${credencial}`)
        .then( res => {
            // console.log(res)
            toast.current?.show({severity: 'warn', summary: `Registro ${d.id} eliminado`, life: 3500})
            pvEstado.refetch();
        } )
        .catch( (err: {status, msg, desc}) => {
            toast.current?.show({severity: 'error', summary: `Error al eliminar el registro ${d.id}`, detail: err.msg, sticky: true})
        })
    }

    return (
    <>
        <h2 className='text-center mt-5 uppercase'>Registros de actualizaciones realizados</h2>
        <TablaCRUD 
            data={pvEstado.data} cols={COLS} 
            // inputs={[        // edit row inputs
            //     {id: 'id', label: 'id', disabled: true},
            //     {id: 'eco', label: 'eco' },
            //     {id:'eco_tipo', label: 'eco_tipo', inputType: 'select', optionsforSelect:[{name: 'PLANTA', value:1}, {name: 'POSTURA', value:2}]},
            //     {id:'eco_estatus', label: 'eco_estatus', disabled: true},
            //     {id:'motivo_id', label: 'motivo_id'},
            //     {id:'pv_estados_motivo.desc', label: 'motivo'},
            //     {id:'motivo_desc', label: 'motivo_desc'},
            //     {id:'modulo', label: 'modulo'},
            //     {id:'direccion', label: 'direccion'},
            //     {id:'ruta', label: 'ruta'},
            //     {id:'ruta_modalidad', label: 'ruta_modalidad'},
            //     {id:'ruta_cc', label: 'ruta_cc'},
            //     {id:'op_cred', label: 'op_cred'},
            //     {id:'op_turno', label: 'op_turno'},
            //     {id:'extintor', label: 'extintor'}
            // ]}
            accion={sugo3cas0p10t2||sugo4cas0p10t2}
            editb={false && sugo3cas0p10t2}
            deleteb={sugo4cas0p10t2}
            callBackForDelete={ deleteRegistro }
            multiSortMeta={ [{field: 'id', order: -1}] }
            dataTableProps={{ rowClassName, resizableColumns: false }} 
        /> 
    </>
    )
}
