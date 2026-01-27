import React, { useEffect, useId, useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ColsProps, TablaCRUD } from '../../../shared/components/Tabla';
import { DynamicInput, MiniFormMaker, PVEstadosMotivos } from './PVestados';
import { Panel } from 'primereact/panel';
import useAuthStore from '../../../shared/auth/useAuthStore';
import { Loading1 } from '../../../shared/components/Loaders';
import { UseFetchDelete, UseFetchPost } from '../../../shared/helpers-HTTP';
import { useQueryClient } from 'react-query';


const API = import.meta.env.VITE_SUGO_BackTS


interface Props {
    data: {
        name: string;
        value: PVEstadosMotivos;
    }[] | undefined
}

const COLS: ColsProps[] = [
    { field: 'id', header: 'id',  },
    { field: 'desc', header: 'Desc', filter: true },
    { field: 'tipo', header: 'Tipo', filter: true },
    { field: 'eco_disponible', header: 'Eco disponible', align: 'center' }
];
const tipos = [null, 'Despacho', 'Recepción', 'act fuera', 'act dentro'];
const inputsForUpdate = [
    {id: 'id', label: 'id', disabled: true},
    {id: 'desc', label: 'Desc'},
    {id: 'tipo', label: 'Tipo', inputType: 'select', optionsforSelect: [{name: 'Fuera de modulo', value: 'Fuera de modulo'}, {name: 'Dentro de modulo', value: 'Dentro de modulo'}]},
    {id: 'eco_disponible', label: 'Eco disponible',inputType: 'select', optionsforSelect: [{name: 'SI', value: 'SI'}, {name: 'NO', value: 'NO'}]}
];
const inputsForAdd: DynamicInput[] = [
    {name: 'desc', label: 'Descripcion'},
    {name: 'tipo', label: 'Tipo', type: 'select', options: [
        {name: 'Despacho', value: 1}, {name: 'Recepción', value: 2},
        {name: 'Actualización fuera de modulo', value: 3}, {name: 'Actualización dentro de modulo', value: 4}
    ]},
    {name: 'eco_disponible', label: '¿Eco disponible?', type: 'select', options: [{name: 'SI', value: true}, {name: 'No', value: false}]},
];



export const PVestadosMotivos = ({ data }: Props) => {
    const [visible, setVisible] = useState(false);
    const [dataTable, setDataTable] = useState<any[]>([])

    useEffect(() => {
        if(data){
            const dataNecesaria = data.map( d => {
                const { id, desc, tipo, eco_disponible } = d.value
                return { id, desc, tipo: tipos[tipo], eco_disponible: eco_disponible?'SI':'NO'  }
            })
            setDataTable(dataNecesaria)
        }
    }, [data])
    
    const headerElement = (
        <div className="inline-flex align-items-center justify-content-center gap-2">
            {/* <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle" /> */}
            <span className="font-bold white-space-nowrap">Motivos</span>
        </div>
    );

    const footerContent = (
    <>
        <Button 
            label="Close" 
            // icon="pi pi-check" 
            severity='info'
            onClick={() => setVisible(false)}
            autoFocus 
        />
    </>
    );

    const user_cred = useAuthStore( s => s.user.credencial )
    const queryClient = useQueryClient()
    const formId = useId();
    const form = useForm();
    const [isSendingInfo, setIsSendingInfo] = useState(false)
    const onSubmit = (data) => {
        setIsSendingInfo(true)
        // console.log('New motivo', {createdBy: usr_cred, ...data});
        UseFetchPost(`${API}/api/caseta/pv-estados/motivos`, {"createdBy": user_cred, ...data})
        .then( async(res) => {
            form.reset()
            await queryClient.refetchQueries({ queryKey: "PV-estado-motivos" })
            // console.log(res);    
        })
        .catch( err => console.error(err))
        .finally( () => setIsSendingInfo(false))
    }
    const onDelete = (data) => { 
        // console.error(data);
        UseFetchDelete( `${API}/api/caseta/pv-estados/motivos/${data.id}?cred=${user_cred}` )
        .then( async(res) => {
            await queryClient.refetchQueries({ queryKey: "PV-estado-motivos" })
            console.log('res', res);
        })
        .catch( err => console.error(err) )
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

        <Dialog modal maximizable  position='right' visible={visible} header='Motivos' footer={footerContent} onHide={() => setVisible(false)} style={{ minWidth: '50rem', width: '50vw', height: '60vh' }} pt={{ footer: { className: 'p-2' }}}>
            <TablaCRUD 
                data={dataTable} 
                cols={COLS} 
                className='my-2'
                inputs={inputsForUpdate}
                editb={false}
                // callBackForUpdate={ (e) => { console.warn(e.data); }}
                callBackForDelete={ onDelete }
                multiSortMeta={ [{field: 'id', order: 1}] }
                dataTableProps={{ 
                    resizableColumns: false 
                }} 
            />

            { isSendingInfo &&
            <div className='surface-900 opacity-50 absolute z-5 border-round-lg flex-center' style={{top: -10, right: -10, bottom: -10, left: -10,}}>
                <Loading1 fill='surface-900' title='' />
            </div>
            }

            <Panel header="Añadir otro motivo" toggleable collapsed className='my-5'>
                <form id={formId} onSubmit={ form.handleSubmit(onSubmit) } className='flex-center gap-3 mt-3'>
                    <MiniFormMaker control={form.control} errors={form.formState.errors} inputs={inputsForAdd} />
                    <div className='flex-center gap-3'>
                        <Button type='submit' label='Enviar' disabled={isSendingInfo} />
                        <Button type='reset'  label='Cancelar' severity='danger' onClick={() => form.reset()} disabled={isSendingInfo} />
                    </div>
                </form>
            </Panel>
        </Dialog>
    </>
    )
}
