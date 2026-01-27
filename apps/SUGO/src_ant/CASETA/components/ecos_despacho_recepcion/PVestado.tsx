import React, { useContext, useEffect, useId, useState } from 'react'
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Input_Mask, Input_Select, Input_Text } from '../../../shared/components/inputs'
import { GeneralContext } from '../../../shared/GeneralContext';
import { useForm, useWatch } from 'react-hook-form';
import useAuthStore from '../../../shared/auth/useAuthStore';
import { dateToString } from '../../../shared/helpers';
import { useClock } from '../../../shared/hooks/useClock';
import { regex_year_ddmmyyyy } from '../../../shared/helpers/regEx';
import { UseFetchGet, UseFetchPost } from '../../../shared/helpers-HTTP';
import { PVestado_tablas } from './PVestado_tablas';
import { useQueryClient } from 'react-query';
import { PVestado_1eco } from './PVestado_1eco';
import { classNames } from 'primereact/utils';



const API = import.meta.env.VITE_SUGO_BackTS


export interface ModulosSWAP {
    id:        number;
    name:      string;
    direccion: null | string;
    tipo:      string;
    desc:      string;
    tipo_desc: TipoDesc;
}

export enum TipoDesc {
    AlmacenCentral = "Almacen Central",
    CentrosDeReconstruccion = "Centros de reconstruccion",
    Comercializacion = "Comercializacion",
    ControlDeBienes = "Control de bienes",
    ModuloOperativo = "Modulo operativo",
}

let OPTS_MODULOS:{value, name: string}[] = []
const OPTS_LUGAR_TIPO = [
    { value: 1, name: 'RUTA'},
    { value: 2, name: 'MODULO'},
    { value: 3, name: 'DIRECCIÓN'},
];

const OPTS_MOTIVOS_DISP = [
    { id: 1, value: 'MODULO', name: 'MODULO'},
    { id: 2, value: 'RUTA', name: 'RUTA'},
];
const OPTS_MOTIVOS_NO_DISP = [
    { id: 2, value: 'RUTA', name: 'RUTA/SERVICIO'},
    { id: 3, value: 'MANTENIMIENTO CORRECTIVO', name: 'MANTENIMIENTO CORRECTIVO'},
    { id: 6, value: 'MANTENIMIENTO PREVENTIVO', name: 'MANTENIMIENTO PREVENTIVO'},
    { id: 5, value: 'REPARACION EXTERNA', name: 'REPARACION EXTERNA'},
    { id: 7, value: 'ACCIDENTE', name: 'ACCIDENTE (Colisiones, vandalismo, etc.)'},
    { id: 4, value: 'JURIDICO', name: 'JURIDICO'},
    { id: 10, value: 'OTRO', name: 'OTRO'},
];
const MOTIVOS_IN_MODULO = ['MODULO', 'MANTENIMIENTO CORRECTIVO', 'MANTENIMIENTO PREVENTIVO', 'JURIDICO'];

interface Form {
    eco: string;
    eco_status: string;
    // ruta: { nombre: string, modalidad: string, modalidadId: number, origen: string, destino: string };
    motivo: string;
    motivo_otro?: string;
    motivo_desc: string;
    lugar_tipo: number;
    lugar: string;
    lugar_desc: string;
    time_fecha: string;
    time_hora: string;
}


export const PVestado = () => {

    const formId = useId();
    const { OPTS_RUTA } = useContext(GeneralContext);
    const { credencial:USER_CRED } = useAuthStore( store => store.user );
    const queryClient = useQueryClient();

    const [eco, setEco] = useState<string>()
    const [canEditHour, setCanEditHour] = useState(false);
    const [ecoDisponible, setEcoDisponible] = useState(false);
    const [inputTypes, setInputTypes] = useState({lugar: 'select'})
    const [opcionesLugar, setOpcionesLugar] = useState<any[]>([]);
    const [showInputs, setShowInputs] = useState({
        motivo_otro: false,
    });

    useEffect(() => {
        if(OPTS_MODULOS.length==0){
            UseFetchGet(`${API}/api/caseta/pv-estado/modulos`)
            .then( (res:ModulosSWAP[]) => OPTS_MODULOS=res.map( m => ({value: m.desc, name: m.desc}) ))
            .catch( err => console.error(err) )
        }
    }, [])

    const {
        register,
        unregister,
        control,
        formState: { errors },
        handleSubmit,
        getValues,
        setValue,
        trigger,    // Trigger inputs Validations
        reset
    } = useForm<Form>();
    
    const [motivo, lugar_tipo] = useWatch({ control, name: ['motivo', 'lugar_tipo'] });

    //? Mostrar y registrar los inputs dinamicos necesarios
    useEffect(() => {
        if(motivo=='OTRO'){
            register('motivo_otro')
            setValue('motivo_otro', '')
            setShowInputs( obj => ({ ...obj, motivo_otro: true }) )
        } else {
            unregister('motivo_otro')
            setShowInputs( obj => ({ ...obj, motivo_otro: false }) )
        }

        // console.log(motivo);
        if(motivo=='RUTA') setValue('lugar_tipo', 1);   // 'RUTA'
        else if(motivo=='REPARACION EXTERNA') setValue('lugar_tipo', 3);    // 'DIRECCION'
        else if(MOTIVOS_IN_MODULO.includes(motivo)) setValue('lugar_tipo', 2);  // 'MODULO'
        else{
            setValue('lugar_tipo', 0);
        }
    }, [motivo])

    useEffect(() => {
        let inputType = 'select'
        if(lugar_tipo == 1) setOpcionesLugar(OPTS_RUTA.map(r => ({name: r.name, value: r.value.nombre})));
        else if(lugar_tipo == 2) setOpcionesLugar(OPTS_MODULOS);
        else {
            inputType = 'text'
            setOpcionesLugar([])
        }
        setInputTypes( prev => ({...prev, lugar: inputType}))
    }, [lugar_tipo])
    


    const { time } = useClock({stop: canEditHour}); // initialTime: new Date(2024,0,31,23,59,55)
    useEffect(() => {
        // const date = new Date();
        // // date.setHours(9,5)
        setValue('time_hora',  time.toTimeString());
        setValue('time_fecha', dateToString(time));
        // console.log(time); 
    }, [time])
    

    const onSubmit = (f: Form) => {
        const date = new Date(f.time_fecha.split('/').reverse().join('/')+' '+f.time_hora)

        const data2send = {
            "eco":          f.eco,
            "eco_estatus":  ecoDisponible? 1:2,
            "motivo":       f.motivo_otro || f.motivo,
            "motivo_desc":  f.motivo_desc || undefined,
            "lugar_tipo":   f.lugar_tipo,
            "lugar":        `${f.lugar}`,
            "lugar_desc":   f.lugar_desc || undefined,
            "createdBy":    USER_CRED,
            "momento":      date,
        }

        console.log(data2send);
        UseFetchPost(`${API}/api/caseta/pv-estado`, data2send)
        .then( (res) => { console.log(res); reset(); queryClient.invalidateQueries(["estadoPV"]);} )
        .catch( err => console.error(err) )
    }

    const handleBlurEco = () => {
        const economico = getValues('eco');
        setEco(economico)
    }
    

    return (
    <>
        <h3 className='text-center'>Actualizar estado de un economico</h3>
        <form id={formId} 
            onSubmit={ handleSubmit(onSubmit) } 
            className='mt-4 flex flex-wrap justify-content-center sm:justify-content-start gap-5 mx-auto'
            style={{maxWidth: '42rem'}}
        >
            <div className='flex-center gap-2 w-full sm:w-max'>
                <Input_Text     //* Economico
                    control={control} errors={errors} 
                    name='eco' label='Economico' keyfilter='int'
                    onBlur={ handleBlurEco }
                    className='w-full sm:w-8rem'
                    inputClassName='p-float-label w-full sm:w-7rem'
                    rules={{ required: `* Requerido.` }} 
                />
                {/* <div className='ml-3'>
                    <label className={`block text-xs font-bold text-${ecoDisponible?'green':'pink'}-500`}>Tipo de moviento</label>
                    <button onClick={()=> setEcoDisponible(true)}  type='button' className={`${ecoDisponible? 'bg-green-100 font-bold':'bg-white'} cursor-pointer  border-2 border-round-left-sm  border-green-400  w-8rem text-center  hover:border-900`}>Despacho</button>
                    <button onClick={()=> setEcoDisponible(false)} type='button' className={`${ecoDisponible? 'bg-white':'bg-pink-100 font-bold'}  cursor-pointer  border-2 border-round-right-sm border-pink-400   w-8rem text-center  hover:border-900`}>Recepción</button>
                    <button onClick={()=> setEcoDisponible(false)} type='button' className={`${ecoDisponible? 'bg-white':'bg-pink-100 font-bold'}  cursor-pointer  border-2 border-round-right-sm border-pink-400   w-8rem text-center  hover:border-900`}>Actualización</button>
                </div> */}
                <div className='ml-3'>
                    <label className={`block text-xs font-bold text-${ecoDisponible?'green':'pink'}-500`}>Disponible</label>
                    <button onClick={()=> setEcoDisponible(true)}  type='button' className={`${ecoDisponible? 'bg-green-100 border-green-500 font-bold':'bg-white border-gray-500'} cursor-pointer  border-2 border-round-left-sm  w-2rem text-center  hover:border-900`}>SI</button>
                    <button onClick={()=> setEcoDisponible(false)} type='button' className={`${ecoDisponible? 'bg-white border-gray-500':'bg-pink-100 border-pink-500 font-bold'}  cursor-pointer  border-2 border-round-right-sm w-2rem text-center  hover:border-900`}>NO</button>
                </div>
            </div>

            <Input_Select   //* Motivo
                control={control} errors={errors} 
                options={ ecoDisponible ? OPTS_MOTIVOS_DISP : OPTS_MOTIVOS_NO_DISP } 
                name='motivo' label='En' filter
                rules={{ required: `* Requerido.` }} 
                // isLoading={true}
            />

            { showInputs.motivo_otro &&
                <Input_Text     //* Otro Motivo
                    control={control} errors={errors} 
                    name='motivo_otro' label='Otro motivo'  keyfilter='alphanum'
                    onBlur={ e => setValue('motivo_otro', e.target.value.toUpperCase()) }
                    // rules={{ required: `* Requerido.` }} 
                />
            }
            <Input_Text     //* Descripcion del motivo
                control={control} errors={errors} 
                name='motivo_desc' label='Descripcion del motivo'
            />

            <Input_Select   //* Lugar_tipo
                control={control} errors={errors} 
                options={ OPTS_LUGAR_TIPO } 
                name='lugar_tipo' label='Tipo de lugar'
                disabled={ motivo=='RUTA' || MOTIVOS_IN_MODULO.includes(motivo) || motivo=='REPARACION EXTERNA' }
                rules={{ required: `* Requerido.` }} 
                // isLoading={true}
            />

            {/* //* Lugar */}
            { inputTypes.lugar === 'select' ?
                <Input_Select   
                    control={control} errors={errors} 
                    options={ opcionesLugar } 
                    name='lugar' label='Lugar'
                    rules={{ required: `* Requerido.` }} 
                    // isLoading={true}
                />
                :
                <Input_Text
                    control={control} errors={errors} 
                    name='lugar' label='Lugar'
                    disabled={ !lugar_tipo  }
                />
            }
            <Input_Text     //* Descripcion del lugar
                control={control} errors={errors} 
                name='lugar_desc' label='Descripción del lugar'
            />

             <div className='flex-center gap-2'>
                <div className="flex flex-column " style={{position: 'relative', bottom: 5}}>
                    <label htmlFor="edit" className="text-xs mb-2 opacity-80">Editar</label>
                    <Checkbox inputId="edit" onChange={e => setCanEditHour(!!e.checked)} checked={canEditHour} className='mx-auto'/>
                </div>

                <Input_Mask     //* Hora de actualización ²
                    control={control} errors={errors} 
                    name='time_hora' mask='99:99:99' label='Hora' 
                    disabled={ !canEditHour }
                    className='w-max'
                    inputClassname='p-float-label'
                    style={{maxWidth: '10rem'}}
                    rules={{ 
                        required: `* Requerido.`, 
                        // pattern: { value: regex_24hrs, message: 'Formato de hora invalido.'} 
                    }} 
                />
            </div>
            <Input_Mask     //* Fecha de actualización ¹
                control={control} errors={errors} 
                name='time_fecha' label='Fecha' mask='99/99/9999'
                disabled={ !canEditHour }
                // className='w-7rem'
                rules={{ required: `* Requerido.`, pattern: { value: regex_year_ddmmyyyy, message: 'Formato de fecha invalido.'} }} 
            />
            
            <div className='w-full flex-center gap-4'>
                <Button type='submit' label='Enviar' />
                <Button type='button' label='Cancelar' severity='danger' onClick={() => reset()} />
            </div>
        </form>

        <PVestado_1eco eco={eco} className='mx-auto my-3'/>

        <PVestado_tablas />
    </>
    )
}
    )
}
