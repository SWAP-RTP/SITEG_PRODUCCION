import React, { useState, useEffect, useContext } from 'react'
import { Button } from 'primereact/button'
import { LoadingDialog } from '../../../shared/components/Loaders';
import { GeneralContext } from '../../../shared/GeneralContext';
import { getReporteExtintores } from '../../utilities/Reportes/extintores';
import { getReporteEcosBitacora } from '../../utilities/Reportes/busesBitacora';
import { PreviewPDF } from '../../../shared/components/PreviewPDF';
import { Input_MultiSelect, Input_Select, Input_Text } from '../../../shared/components/inputs';
import { useForm, useWatch } from 'react-hook-form';
import useAuthStore from '../../../shared/auth/useAuthStore';
import { Input_Calendar } from '../../../shared/components/inputs/InputCalendar';
import { useQuery } from 'react-query';
import { UseFetchGet } from '../../../shared/helpers-HTTP';
import { SkeletonTable, TablaCRUD } from '../../../shared/components/Tabla';
import { Skeleton } from 'primereact/skeleton';


const API = import.meta.env.VITE_SUGO_BackTS

interface TableState {
    data: any[], 
    cols: any[], 
    title: string,
    handleExport?: (dataTable) => {bloburl, openInNewWindow: () => void}, 
    loading?: boolean
    show?: boolean
}
interface Motivos {
    motivo: string, 
    tipo: 1|2
} 
interface Form {
    modulo?:        number;
    dates:          [any, any] | any[]
    tipo_bitacora:  number[]
    economico?:      string
    cred?:           string
    ruta?:           { modalidadId: number, modalidad: string, nombre: string }
    motivo?:         string
}

const OPTS_TIPO = [
    {name: 'Despacho',  value: 1}, 
    {name: 'Recepción', value: 2}, 
]


export const ReportesCaseta = () => {
    const { modulo: user_modulo } = useAuthStore( store => store.user );
    const { OPTS_RUTA, OPTS_MODS } = useContext(GeneralContext);

    const [table, setTable] = useState<TableState>({data: [], cols: [], title: '', loading: true, show: false });
    const [isLoading, setIsLoading] = useState(false);

    const motivos = useQuery(
        'caseta-reportes-motivos', 
        () => UseFetchGet(`${API}/api/caseta/ecosBitacora/motivos`),
        { 
            staleTime: Infinity, 
            select: (data: Motivos[]) => data.map( d => ({ name: d.motivo, value: d.motivo }) ) 
        }
    );


    const defaultValues = {
        modulo: user_modulo || undefined ,
        dates: [],
        economico: '',
        cred: '',
        tipo_bitacora: [1, 2],
        motivo: '',
    };
    const {
        control,
        formState: { errors },
        handleSubmit,
        getValues,
        setValue,
        trigger,    // Trigger inputs Validations
        reset
    } = useForm<Form>({ defaultValues });

    const [dates, modulo, tipo_bitacora] = useWatch({ control, name: ['dates', 'modulo', 'tipo_bitacora'] });    

    const fakeSubmit = async() => {
        const passValidations = await trigger();
        if(!passValidations) return undefined;
        return getValues();
    }

    //& Reporte de extintores
    const getRepoExtintores = async() => {
        const form = await fakeSubmit();
        if(!form) return undefined;
        setIsLoading(true)
        getReporteExtintores({ dates, modulo: modulo! })
        .then( res => { 
            const { cols, data, makePDF } = res;
            setTable( { cols, data, title: 'Extintores', handleExport: makePDF, show: true });
            setIsLoading(false) 
        })
    }
    //& Reporte de ecos (Despacho y/o Recepciones)
    const getRepoBitacora = async() => {
        const form = await fakeSubmit();
        if(!form) return undefined;
        setIsLoading(true)
        getReporteEcosBitacora({ 
            dates: form.dates, 
            modulo: form.modulo!, 
            tipo: form.tipo_bitacora?.filter(Boolean),
            eco: form.economico,
            cred: form.cred,
            ruta: form.ruta?.nombre,
            motivo: form.motivo,
        })
        .then( res => { 
            const { cols, data, makePDF } = res;
            console.log(data);
            setTable( { cols, data, title: `${tipo_bitacora.map( i => i==1?'Despacho':i==2?'Recepcion':undefined).join(' y ')} de autobuses`, handleExport: makePDF, show: true }); 
            setIsLoading(false) 
        })
    }


    useEffect(() => {
        const dia1DelMes = new Date()
        dia1DelMes.setDate(1);

        setTimeout(() => {
            setTable( obj => ({...obj, show: true}) )
        }, 3000);

        getReporteEcosBitacora({ 
            dates:  [ dia1DelMes, new Date()], 
            modulo: 6, 
            tipo: [1,2]
        })
        .then( res => { 
            const { cols, data, makePDF } = res;
            setTable( { cols, data, title: `${tipo_bitacora.map( i => i==1?'Despacho':i==2?'Recepcion':undefined).join(' y ')} de autobuses`, handleExport: makePDF, loading: false });
        })
    }, [])
    

    return (
    <>
        <h1 className='m-0 text-center mb-6'>Generador de reportes sobre el PV</h1>
        <form onSubmit={ handleSubmit( () => undefined ) } className='max-w-max mx-auto'>
            <div className='my-3 flex-center justify-content-start gap-4' style={{maxWidth: '30rem'}}>
                <Input_Select   //* Sale de
                    control={control} errors={errors} 
                    options={OPTS_MODS} name='modulo'  label='Modulo *' 
                    disabled={ !(user_modulo===0) } 
                    rules={{ required: `* Requerido.` }} 
                />
                <Input_Calendar   //* Sale de
                    control={control} errors={errors} 
                    name='dates'  label='Selecciona fecha *'
                    rules={{ required: `* Requerido.` }} 
                    selectionMode="range" 
                />
            </div>

            <div className='w-full md:w-10 md:ml-2' style={{borderBottom: '2px solid #7BC179ab' }} />

            <div className='flex-center mt-5 mb-3 gap-4 justify-content-start align-items-start' style={{maxWidth: '30rem'}}>
                <Input_MultiSelect   //* tipo_bitacora
                    control={control} errors={errors} 
                    options={OPTS_TIPO} 
                    name='tipo_bitacora' 
                    label='Tipo *'
                    display="chip"
                    // onBlur={ handleBlurRuta } 
                    rules={{ required: `* Requerido.` }} 
                />
                <Input_Select   //* Ruta
                    control={control} errors={errors} 
                    options={OPTS_RUTA} name='ruta' label='Ruta' filter showClear
                />
                <Input_Text     //* Economico
                    control={control} errors={errors} 
                    name='economico' label='Economico' keyfilter='int'
                />
                <Input_Text     //* Credencial
                    control={control} errors={errors} 
                    name='cred' label='Credencial' keyfilter='int'
                />
                {/* <Input_Select   //* Motivos
                    control={control} errors={errors} 
                    options={motivos.data} 
                    name='motivo' label='Motivos' showClear
                    // filter 
                /> */}
            </div>
        </form>

        {/* Buttons */}
        <div className='w -12 flex-center gap-4 min-w-max mt-3'>
            <Button 
                type='button'
                icon='pi pi-times'
                label='Cancelar'
                severity="danger" 
                aria-label="Clean"
                onClick={ () => reset() }
            />
            <Button 
                type='button'
                label='Extintores' 
                disabled={ !dates[0] || !modulo }
                onClick={ () => { getRepoExtintores(); } } 
            /> 
            <Button 
                type='button'
                label='Buses' 
                disabled={ !dates[0] || !modulo }
                onClick={ () => { getRepoBitacora() } } 
            /> 
        </div>

        { table.show ? 
            <>
                <h2 className='w-12 mt-6 text-center text-wrap-balance'>
                    Reporte de {table.title} 
                    <br />
                    {/* <span className='text-xl'>Del {new Date(dates[0])?.toLocaleDateString()} al {new Date(dates[1])?.toLocaleDateString()} </span> */}
                </h2>
                <TablaCRUD 
                    // className='my-5'
                    accion={false}
                    cols={table.cols.map( col => ({...col, filter: col.header!='#'}) )}
                    data={table.data}
                    dataTableProps={ { loading: table.loading, filterDisplay: 'row' } }
                    //? Asegurar que exista table.handleExport y pasarle la data al makePDF de cada reporte, el cual regresa el metodo para abrir el PDF.
                    handleExportPDF={ dataTable => (!!table.handleExport) ? table.handleExport(dataTable).openInNewWindow() : undefined }
                />  
            </>
            :
            <>
                <Skeleton className='mt-6 mb-2 mx-auto' height='2rem' width='50%' />
                <SkeletonTable campos={ ['Capturó', 'Eco', 'Operador', 'Fecha y hora'] } className='my-3' />
            </>
        }



        {/* { !!pdf &&
            <PreviewPDF src={pdf} className='mt-4 w-full'/> 
        } */}
        <LoadingDialog isVisible={isLoading} />
    </>
    )
}
