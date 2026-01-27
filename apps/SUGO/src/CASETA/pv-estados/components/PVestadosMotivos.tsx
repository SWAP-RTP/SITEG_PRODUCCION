import React, { useContext, useEffect, useId, useRef, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Panel } from 'primereact/panel';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { PVEstadosMotivos } from '../interfaces';
import { ColsProps, TablaCRUD } from '../../../shared/components/Tabla';
import useAuthStore from '../../../shared/auth/useAuthStore';
import { Loading1 } from '../../../shared/components/Loaders';
import { UseFetchDelete, UseFetchGet, UseFetchPost } from '../../../shared/helpers-HTTP';
import { DynamicInput, MiniFormMaker } from '../../../shared/components/FormMaker/MiniFormMaker';
import { GeneralContext } from '../../../shared/GeneralContext';
import { removeHTMLelements } from '../../../shared/helpers/forHTML';



interface Form { 
    desc: string, 
    tipo: 1|2|3|4, 
    eco_disponible: boolean 
}
interface ColFields { 
    id: number, 
    desc: string, 
    tipo: string, 
    eco_disponible: string
}


const API = import.meta.env.VITE_SUGO_BackTS


const COLS: ColsProps[] = [
    { field: 'id', header: 'id', filter: true, style: {width: '10rem'} },
    { field: 'desc', header: 'Desc', filter: true },
    { field: 'tipo', header: 'Tipo', filter: true, style: {width: '10rem'} },
    { field: 'eco_disponible', header: 'Eco disponible', align: 'center', style: {width: '5rem'} }
];
const tipos = [null, 'Despacho', 'Recepción', 'act fuera', 'act dentro'];
const inputsForUpdate = [
    {id: 'id', label: 'id', disabled: true},
    {id: 'desc', label: 'Desc'},
    {id: 'tipo', label: 'Tipo', inputType: 'select', optionsforSelect: [{name: 'Fuera de modulo', value: 'Fuera de modulo'}, {name: 'Dentro de modulo', value: 'Dentro de modulo'}]},
    {id: 'eco_disponible', label: 'Eco disponible',inputType: 'select', optionsforSelect: [{name: 'SI', value: 'SI'}, {name: 'NO', value: 'NO'}]}
];
const inputsForAdd: DynamicInput[] = [
    {name: 'desc', label: 'Descripcion', rules: { required: `* Requerido.` }  },
    {name: 'tipo', label: 'Tipo', type: 'select', rules: { required: `* Requerido.` }, options: [
        {name: 'Despacho', value: 1}, {name: 'Recepción', value: 2},
        {name: 'Actualización fuera de modulo', value: 3}, {name: 'Actualización dentro de modulo', value: 4}
    ]},
    {name: 'eco_disponible', label: '¿Eco disponible?', type: 'select', rules: {  validate: value => typeof value === 'boolean' || '* Requerido.' }, options: [
            {name: 'SI', value: true}, 
            {name: 'No', value: false}
        ]
    },
];



export const PVestadosMotivos = () => {
    const { toast } = useContext(GeneralContext);
    const [visible, setVisible] = useState(false);
    const [dataTable, setDataTable] = useState<any[]>([])

    // get Motivos
    const { data, refetch } = useQuery<PVEstadosMotivos[], any, { name: string, value: PVEstadosMotivos }[]>(
        ['pv','motivos'], 
        () => UseFetchGet(`${API}/api/caseta/pv-estados/motivos`),
        {
            select(data) {
                return data.map( obj =>({ name: obj.desc, value: obj }) )
            },
            refetchInterval: false,
            staleTime: Infinity,
        }
    )

    // Set Motivos
    useEffect(() => {
        if(data){
            const data2table = data.map( d => {
                const { id, desc, tipo, eco_disponible } = d.value
                return { id, desc, tipo: tipos[tipo], eco_disponible: eco_disponible?'SI':'NO'  }
            })
            setDataTable(data2table)
        }
    }, [data])

    useEffect(() => {
        setTimeout(() => {
            visible && removeHTMLelements('#dialog-motivos', '.p-column-filter-clear-button')
        }, 200);
    }, [visible])
    
    
    const user_cred = useAuthStore( s => s.user.credencial )
    const formId = useId();
    const form = useForm<Form>();
    const [isSendingInfo, setIsSendingInfo] = useState(false)

    const createMotivo = (data: Form) => {
        // return console.log({...data, desc: data.desc.toUpperCase()})
        setIsSendingInfo(true)
        // console.log('New motivo', {createdBy: usr_cred, ...data});
        UseFetchPost(`${API}/api/caseta/pv-estados/motivos`, {"createdBy": user_cred, ...data, desc: data.desc.toUpperCase()})
        .then( async(res) => {
            console.log(res);
            form.reset()
            toast.current?.show({severity: 'success', summary: 'Motivo creado!'})
            refetch(); 
        })
        .catch( err => console.error(err))
        .finally( () => setIsSendingInfo(false))
    }

    // const onUpdate = (e) => {
    //     const { data, reset } = e
    // }

    const onDelete = (data:ColFields) => { 
        // console.log(data);
        UseFetchDelete( `${API}/api/caseta/pv-estados/motivos/${data.id}?cred=${user_cred}` )
        .then( async(res) => {
            toast.current?.show({severity: 'warn', summary: `Motivo "${data.desc}" eliminado`, life: 3500})
            console.log('res', res);
            refetch();
        })
        .catch( err => {
            console.error(err)
            toast.current?.show({severity: 'error', summary: 'Error', detail: `Error al eliminar el motivo ${data.desc}`, sticky: true})
        } )
    }

    const handleHide = () => {
        setVisible(false)
        form.reset()
    }


    if(!data) return <>No data</>
    return (
    <>
        <Button 
            label="Motivos" 
            icon="pi pi-external-link" 
            severity='help'
            onClick={() => setVisible(true)} 
            // className='lg:p-1 lg:px-2 lg:max-w-6rem'
            // pt={{ label: { className: 'm-0 text-sm' }}}
        /> 

        {/* Es un elemento flotante y oculto al inicio */}
        <Dialog id='dialog-motivos' modal maximizable  position='right' visible={visible} header='Motivos' onHide={ handleHide } style={{ minWidth: '50rem', height: '75vh' }} pt={{ footer: { className: 'p-2' }}}>
            <TablaCRUD 
                data={dataTable} 
                cols={COLS} 
                className='my-2 mx-auto'
                inputs={inputsForUpdate}
                editb={false}
                // callBackForUpdate={ onUpdate }
                callBackForDelete={ onDelete }
                multiSortMeta={ [{field: 'id', order: 1}] }
                dataTableProps={{ 
                    resizableColumns: false,
                    style: { maxWidth: '40rem' } 
                }} 
            />

            <Panel header="Añadir otro motivo" toggleable collapsed className='my-5'>
                <form id={formId} onSubmit={ form.handleSubmit(createMotivo) } className='flex-center gap-3 mt-3'>
                    <MiniFormMaker form={form} inputs={inputsForAdd} />
                    <div className='flex-center gap-3'>
                        <Button type='submit' label='Enviar' disabled={isSendingInfo} />
                        <Button type='reset'  label='Cancelar' severity='danger' onClick={() => form.reset()} disabled={isSendingInfo} />
                    </div>
                </form>
            </Panel>


            { isSendingInfo &&
            <div className='surface-900 opacity-50 absolute z-5 border-round-lg flex-center' style={{top: -10, right: -10, bottom: -10, left: -10,}}>
                <Loading1 fill='surface-900' title='' />
            </div>
            }
        </Dialog>
    </>
    )
}
