import React, { useState, useEffect, useContext } from 'react'
import { useForm, useWatch } from 'react-hook-form';
import { useQuery } from 'react-query';

import { Button } from 'primereact/button'
import { Skeleton } from 'primereact/skeleton';

import { LoadingDialog } from '../../shared/components/Loaders';
import { GeneralContext } from '../../shared/GeneralContext';
import { PreviewPDF } from '../../shared/components/PreviewPDF';
import { Input_MultiSelect, Input_Select, Input_Text } from '../../shared/components/inputs';
import useAuthStore from '../../shared/auth/useAuthStore';
import { Input_Calendar } from '../../shared/components/inputs/InputCalendar';
import { UseFetchGet } from '../../shared/helpers-HTTP';
import { SkeletonTable, TablaCRUD } from '../../shared/components/Tabla';

import { getReporteEcosBitacora, getReporteExtintores } from './utilities';
import { PVEstadosMotivos } from '../pv-estados/interfaces';
import { scrollDown } from '../../shared/utilities/scrollMotion';



interface TableState {
    data: any[], 
    cols: any[], 
    title: string,
    subtitle: string,
    handleExport?: (dataTable) => {bloburl, openInNewWindow: () => void}, 
    loading?: boolean
    show?: boolean
}
interface Motivos {
    motivo: string, 
    tipo: 1|2
} 
interface Form {
    modulo?:        number
    date_ini:       Date
    date_fin:       Date
    tipo_bitacora:  number[]
    economico?:      string
    cred?:           string
    ruta?:           { modalidadId: number, modalidad: string, nombre: string }
    motivo?:         string
}

const OPTS_MODS = [ 
    { name: 'M01', value: 1},
    { name: 'M02', value: 2},
    { name: 'M03', value: 3},
    { name: 'M04-M', value: 4},
    // { name: 'M04-A', value: 8},
    { name: 'M05', value: 5},
    { name: 'M06', value: 6},
    { name: 'M07', value: 7}
]
const OPTS_TIPO = [
    {name: 'Despacho',  value: 1}, 
    {name: 'Recepción', value: 2}, 
]

const tableInitialState = {
    data: [], 
    cols: [], 
    title: '', 
    subtitle: '', 
    loading: true, 
    show: false 
}


export const ReportesCaseta = ({buses=false, extintores=false}) => {
    const { modulo: user_modulo } = useAuthStore( store => store.user );
    const { OPTS_RUTA } = useContext(GeneralContext);

    const [table, setTable] = useState<TableState>(tableInitialState);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setTable(tableInitialState)
    }, [buses, extintores])
    

    const defaultValues = {
        modulo: user_modulo || 0,
        tipo_bitacora: [1, 2],
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

    const dates = useWatch({ control, name: ['date_ini', 'date_fin'] });    
    const [modulo, tipo_bitacora] = useWatch({ control, name: ['modulo', 'tipo_bitacora'] });

    useEffect(() => {
        (dates[0] > dates[1]) &&  setValue('date_fin', dates[0])
    }, [ dates ])
    
    const fakeSubmit = async() => {
        const passValidations = await trigger();
        if(!passValidations) return undefined;
        return getValues();
    }

    /**
     * Desplazarse hacia abajo para ver la data (si el contenedor es chico)
    */
    const goDown = () => {
        const element = document.querySelector('#caseta-reportes');
        const elementPadre = element?.parentElement;    // Quien tiene el scroll en el Dialog
        const elementAbuelo = elementPadre?.parentElement;  // Quien delimita la altura en el Dialog
        const elementPadreId = elementPadre?.id ? '#'+elementPadre?.id:'';
        const scrollHeight = elementAbuelo?.scrollHeight || 0;
        if(scrollHeight>600) return
        scrollDown(elementPadreId, { distance: 460 })
    }

    //& Reporte de extintores
    const getRepoExtintores = async() => {
        const form = await fakeSubmit();
        if(!form) return undefined;
        setIsLoading(true)

        const res = await getReporteExtintores({ dates, modulo: form.modulo! })
        const { cols, data, makePDF } = res;
        const [dateIni, dateFin] = dates
        let subtitle = `Del ${dateIni.toLocaleDateString()}`
        if(dateFin) subtitle += ` al ${dateFin.toLocaleDateString()}`
        setTable( { 
            cols, 
            data, 
            title: form.modulo ? 'Extintores M'+form.modulo : 'Extintores OC', 
            subtitle , 
            handleExport: makePDF, 
            show: true 
        });

        setIsLoading(false)
    }

    //& Reporte de ecos (Despacho y/o Recepciones)
    const getRepoBitacora = async() => {
        const form = await fakeSubmit();
        if(!form) return undefined;
        setIsLoading(true)

        const res = await getReporteEcosBitacora({ 
            dates, 
            modulo: form.modulo!, 
            tipo: form.tipo_bitacora?.filter(Boolean),
            eco: form.economico,
            cred: form.cred,
            ruta: form.ruta?.nombre,
            motivo: form.motivo,
        })
        const { cols, data, makePDF } = res;
        console.log(data);
        const [dateIni, dateFin] = dates
        let subtitle = `Del ${dateIni.toLocaleDateString()}`
        if(dateFin) subtitle += ` al ${dateFin.toLocaleDateString()}`
        setTable( { 
            cols, 
            data, 
            title: `${form.tipo_bitacora.map( i => i==1?'Despacho':i==2?'Recepcion':undefined).join(' y ')} de autobuses ${form.modulo ? 'M'+form.modulo:'OC'}`, 
            subtitle ,
            handleExport: makePDF, 
            show: true 
        })

        setIsLoading(false) 
    }
    

    return (
    <div id='caseta-reportes'>
        <form onSubmit={ handleSubmit( () => undefined ) } className='max-w-max mx-auto mt-5'>
            <div className='my-3 flex-center justify-content-start gap-4' style={{maxWidth: '36rem'}}>
                <Input_Select   //* Sale de
                    control={control} errors={errors} 
                    options={[{name: 'OC', value: 0}, ...OPTS_MODS]} name='modulo'  label='Modulo *' 
                    className='md:max-w-6rem'
                    disabled={ !(user_modulo===0) } 
                    rules={{ required: `* Requerido.` }} 
                />
                <Input_Calendar   //* Dates
                    control={control} errors={errors} 
                    name='date_ini'  label='Selecciona fecha inicial *'
                    rules={{ required: `* Requerido.` }} 
                />
                <Input_Calendar   //* Dates
                    control={control} errors={errors} 
                    name='date_fin'  label='Selecciona fecha final'
                    // rules={{ required: `* Requerido.` }} 
                />
            </div>


            <div className={`flex-center mt-5 mb-3 gap-4 justify-content-start align-items-start ${buses ? '':'hidden'}`} style={{maxWidth: '30rem'}}>
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
                className={ extintores ? '':'hidden' }
                disabled={ (!modulo&&modulo!=0) || !dates || !dates[0] || !tipo_bitacora[0] }
                onClick={ () => { getRepoExtintores(); } } 
            /> 
            <Button 
                type='button'
                label='Buses' 
                className={ buses ? '':'hidden' }
                disabled={ (!modulo&&modulo!=0) || !dates || !dates[0] || !tipo_bitacora[0] }
                onClick={ () => { getRepoBitacora() } } 
            />
        </div>

        { table.show ? 
            <>
                <h2 className='w-12 mt-6 text-center text-wrap-balance'>
                    Reporte de {table.title} 
                    <br />
                    <span className='text-xl'>
                        {table.subtitle}
                    </span>
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
                <h2>ㅤ</h2>
                <SkeletonTable campos={ ['Capturó', 'Eco', 'Operador', 'Fecha y hora'] } className='my-3' />
            </>
        }



        {/* { !!pdf &&
            <PreviewPDF src={pdf} className='mt-4 w-full'/> 
        } */}
        <LoadingDialog isVisible={isLoading} />
    </div>
    )
}
