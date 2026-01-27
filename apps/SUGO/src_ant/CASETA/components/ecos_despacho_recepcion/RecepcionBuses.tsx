import React, { useContext, useState, useId, useEffect, useRef } from 'react'
import { Button } from 'primereact/button'
import { useForm, useWatch } from 'react-hook-form';
import { Input_Mask, Input_Select, Input_Text } from '../../../shared/components/inputs';
import useAuthStore from '../../../shared/auth/useAuthStore';
import { Loading1 } from '../../../shared/components/Loaders';
import useGeneralStore from '../../../shared/useGeneralStore';
import { RutaOptionValue, RutaDBSWAP } from '../../interfaces/Rutas';
import { UseFetchGet, UseFetchPost } from '../../../shared/helpers-HTTP';
import { GeneralContext } from '../../../shared/GeneralContext';
import { Data2Send } from '../../interfaces/EcoInOut';
import { dateToString } from '../../../shared/helpers/datesFuncs';

import { useQueryClient } from 'react-query'


const API = import.meta.env.VITE_SUGO_BackTS


const OPTS_MOTIVOS = [
    { id: 10, value: 'TERMINO DE JORNADA', name: 'TERMINO DE JORNADA'},
    { id: 11, value: 'FALTA DE RELEVO', name: 'FALTA DE RELEVO'},
    { id: 12, value: 'FALLA MÉCANICA', name: 'FALLA MÉCANICA'},
    { id: 13, value: 'VERIFICACIÓN', name: 'VERIFICACIÓN'},
    { id: 14, value: 'REEMPLACAMIENTO', name: 'REEMPLACAMIENTO'},
    { id: 15, value: 'CARGA DE DIÉSEL EN OTRO MÓDULO', name: 'CARGA DE DIÉSEL EN OTRO MÓDULO'},
    { id: 16, value: 'MINISTERIO PÚBLICO', name: 'MINISTERIO PÚBLICO'},
    { id: 17, value: 'FALTA DE COMBUSTIBLES', name: 'FALTA DE COMBUSTIBLES'},
    { id: 18, value: 'ACLARACIÓN JURIDICA', name: 'ACLARACIÓN JURIDICA'},
    { id: 19, value: 'COLISIÓN', name: 'COLISIÓN'},
    { id: 20, value: 'SEFI', name: 'SEFI'}, //? Motivo de regreso SEFI??? Seria de despacho mejor
    { id: 21, value: 'REGRESO POR AVALUO', name: 'REGRESO POR AVALUO'},

]

const motivosDiccionario = {
    10: 'terJ',     // Termino de Jornada
    11: 'falR',     // Falta de Relevo
    12: 'mmto',     // Manteniminto correctivo
    15: 'carD',     // Carga de diesel en otro modulo
    17: 'comb',     // Falta de combustible
    20: 'sefi',     // SEFI
}
const motivosInitialState = {
    terJ: false,
    falR: false,
    mmto: false,
    carD: false,
    comb: false,
    sefi: false,
}
const inputsDinamicos = [
    'ruta',
    'modalidad',
    'cc',
    'cc_other',
    'terJtipo',
    'mmtoFalla',
    'carDmod',
    'combTipo',
]

interface Form {
    origen: number;
    economico: string;
    cred: string;
    turno: string;
    tipo: number;
    extintor: string;
    ruta: { nombre: string, modalidad: string, modalidadId: number };
    modalidad: string;
    cc: string;
    cc_other?: string;
    presentacion: string;
    hr_ter_mod: string;
    motivo: string;
    observaciones: string;
    mmtoFalla?: string;
    combTipo?: string;
    terJtipo?: string;
    carDmod?: string;
}


export const RecepcionBuses = () => {
    
    const formId = useId();

    const { OPTS_RUTA, OPTS_MODS } = useContext(GeneralContext);
    const { credencial:USER_CRED, modulo } = useAuthStore( store => store.user );
    const queryClient = useQueryClient();

    const [isSendingInfo, setIsSendingInfo] = useState(false);
    const [isLoading, setIsLoading] = useState({ rutaOpt: false, ccOpt: false })
    const [rutaCcOpt, setRutaCcOpt] = useState<{name, value}[]>();
    const [showInputs, setShowInputs] = useState({
        cc_other: false,
        motivos: motivosInitialState
    });
    const [errorMsg, setErrorMsg] = useState<string[]>([]);

    const resetStates = () => {
        setRutaCcOpt(undefined);
        setShowInputs({
            cc_other: false,
            motivos: motivosInitialState
        })
        setErrorMsg([]);
    }


    const defaultValues = {
        origen: (modulo==0) ? 1 : modulo!,      // En caso de select debe ser el value, ej: 1
        economico: '',
        cred: '',
        extintor: '',
        ruta: {},
        modalidad: '',
        cc: '',
        cc_other: '',
        hr_ter_mod: '',
        motivo: '',
    };
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
    } = useForm<Form>({ defaultValues });

    const [cc, motivo] = useWatch({ control, name: ['cc', 'motivo'] });
    
    useEffect(() => {
        const mod = (modulo==0) ? 1 : modulo!;
        setValue( 'origen', mod )
    }, [])
    

    //? Mostrar y registrar los inputs dinamicos necesarios
    useEffect(() => {
        if(cc=='OTRO'){
            register('cc_other')
            setValue('cc_other', '')
            setShowInputs( obj => ({ ...obj, cc_other: true }) )
        } else {
            unregister('cc_other')
            setShowInputs( obj => ({ ...obj, cc_other: false }) )
        }
    }, [cc])

    //? Mostrar y registrar los inputs dinamicos necesarios
    useEffect(() => {
        // console.log('motivo', motivo);
        if(motivo){
            const m = OPTS_MOTIVOS.find( m => m.value == motivo )!
            const motivoName = motivosDiccionario[m.id]
            setShowInputs( s => ({
                ...s,
                motivos: {
                    ...motivosInitialState,
                    [motivoName]: true
                }
            }) )

            const { terJ, falR, mmto, carD, comb, sefi } = showInputs.motivos
            inputsDinamicos.map( input => unregister(input as any) )
            if( terJ || falR || mmto || sefi ) ['ruta', 'modalidad', 'cc'].map( input => register(input as any) );
            if(terJ) register('terJtipo');
            if(mmto) register('mmtoFalla');
            if(carD) register('carDmod');
            if(comb) register('combTipo');
        }
    }, [motivo])
    
    
    const onSubmit = async(d: Form) => {
        // setIsSendingInfo(true);
        const NOW = new Date()
        const HOY = dateToString(NOW, true)
        const data2send: Data2Send = {
            modulo_id:    d.origen,
            eco:          d.economico,
            op_cred:      d.cred,
            turno:        d.turno       || undefined,
            extintor:     d.extintor    || undefined,
            ruta_swap:    d.ruta?.nombre,
            ruta_modalidad:  d.modalidad,
            ruta_cc:      d.cc_other || d.cc,
            modulo_time:  new Date(`${HOY} ${d.hr_ter_mod}`),    // Añadir fecha del dia
            motivo:       d.motivo,
            motivo_desc:  d.mmtoFalla || d.combTipo || d.terJtipo || d.carDmod,               //#^ Esperar demas campos posibles
            cap_time:     NOW,
            cap_user:     USER_CRED!,
        }
        // console.log('data2send', data2send);
        try {
            const res = await UseFetchPost(`${API}/api/caseta/ecosBitacora/in`, data2send)
            console.log(res);
            queryClient.invalidateQueries(["ecosDespachados"]);
            queryClient.invalidateQueries(["ecosRecepcionados"]);
            reset();
            resetStates();
            document.getElementById('economico')?.focus();
        } catch (error) {
            console.error(error);
            setErrorMsg(m => [...m, error.message]);
        }
        finally {
            setIsSendingInfo(false);
        }
    };

    const cancelForm = () => {
        console.log('Cancelado');
        reset();
        resetStates();
        document.getElementById('economico')?.focus();
    }

    const handleBlurRuta = () => {
        const ruta: RutaOptionValue = getValues('ruta') as any;
        if(!ruta?.nombre) return setRutaCcOpt(undefined);

        setIsLoading( obj => ({...obj, ccOpt: true}) )
        
        //Set Modalidad
        setValue('modalidad', ruta.modalidad)
        //Set CC options
        UseFetchGet(`${API}/api/swap/rutas?ruta=${ruta.nombre}`)
            .then( (res:RutaDBSWAP[]) => {
                const ccAll = res.map( obj => [obj.cc_ori, obj.cc_des] ).flat(3)
                const ccUnicos = [...new Set(ccAll)]
                const ccNoModulos = ccUnicos.filter( c => !(c.includes('M0') || c.includes('M4')) );
                const ccOpciones = ccNoModulos.map( cc => {
                    const ccData = res.find( r => r.cc_des == cc )
                    return {name: `${cc} - ${ccData?.cc_des_name || '°'}`, value: cc}
                } );
                ccOpciones.push({name: 'OTRO', value: 'OTRO'});
                // setRutaCcOpt(cc.map( c => ({name: c, value: c}) ))
                setRutaCcOpt(ccOpciones)
                setIsLoading( obj => ({...obj, ccOpt: false}) )

            })
        .catch( err => console.error(err) )
    }

    
    return (
    <div className='relative'>

        {  isSendingInfo && 
            <div className='surface-900 opacity-50 absolute z-5 border-round-lg flex-center' style={{top: -10, right: -10, bottom: -10, left: -10,}}>
                <Loading1 fill='surface-900' title='' />
            </div>
        }

        { errorMsg.length > 0 &&
            <div className='bg-pink-200 py-1 border-round-lg'>
                <ul>
                    {errorMsg.map( (msg, i) => 
                        <li key={`errors-recepcion-${i}`} className='font-semibold'>{msg}</li>
                    )}
                </ul>
            </div>
        }

        <form id={formId} onSubmit={ handleSubmit(onSubmit) } className='mt-4 flex flex-wrap justify-content-center sm:justify-content-start gap-5'>
            <Input_Select   //* Sale de
                control={control} errors={errors} 
                options={OPTS_MODS} name='origen'  label='Encierra en' disabled={ !(modulo===0) } 
            />
            <Input_Text     //* Economico
                control={control} errors={errors} 
                name='economico' label='Economico' keyfilter='int'
                rules={{ required: `* Requerido.` }} 
            />
            <Input_Text     //* Credencial
                control={control} errors={errors} 
                name='cred' label='Credencial' keyfilter='int'
                rules={{ required: `* Requerido.` }}  
            />
            <Input_Text     //* Turno
                control={control} errors={errors} 
                name='turno' label='Turno' keyfilter='int'
            />
            <Input_Text     //* Extintor
                control={control} errors={errors} 
                name='extintor' label='No. Extintor' // keyfilter='int'
            />
            <Input_Mask     //* Hora de recepción
                control={control} errors={errors} 
                name='hr_ter_mod' mask='99:99' label='Hora de recepción' 
                rules={{ required: `* Requerido.` }} 
            />
            <Input_Select   //* Motivo
                control={control} errors={errors} 
                options={OPTS_MOTIVOS} name='motivo' label='Motivo' filter
            />

            { (showInputs.motivos.terJ || showInputs.motivos.falR || showInputs.motivos.mmto || showInputs.motivos.sefi) &&
            <>
                <Input_Select   //* Ruta
                    control={control} errors={errors} 
                    options={OPTS_RUTA} name='ruta' label='Ruta' filter 
                    onBlur={ handleBlurRuta } 
                    rules={{ required: `* Requerido.` }} 
                />
                <Input_Text     //* Modalidad
                    control={control} errors={errors} 
                    name='modalidad' label='Modalidad' disabled={true}
                    rules={{ required: `* Requerido.` }} 
                />
                <Input_Select   //* CC
                    control={control} errors={errors} 
                    options={rutaCcOpt} name='cc' label='CC' 
                    isLoading={ isLoading.ccOpt }
                    rules={{ required: `* Requerido.` }} 
                />
            </>
            }
            { showInputs.cc_other &&
                <Input_Text     //* Otro CC
                    control={control} errors={errors} 
                    name='cc_other' label='Otro'  keyfilter='alphanum'
                    onBlur={ e => setValue('cc_other', e.target.value.toUpperCase()) }
                    rules={{ required: `* Requerido.` }} 
                />
            }

            {/*             //* Motivo Termino de jornada */}
            { showInputs.motivos.terJ &&
                <Input_Select     //* terJtipo
                    control={control} errors={errors} 
                    name='terJtipo' label='Tipo' // keyfilter='int'
                    options={[{name: 'Normal', value: 'normal' }, {name: 'Discontinuo', value: 'discontinuo' }]}
                    onMount={ () => { register('terJtipo'); } }
                    onDismount={ () => { unregister('terJtipo') } }
                />
            }
            {/*             //* Motivo Mantenimiento Correctivo */}
            { showInputs.motivos.mmto &&
                <Input_Text     //* mmtoFalla
                    control={control} errors={errors} 
                    name='mmtoFalla' label='Falla' // keyfilter='int'
                    onMount={ () => { register('mmtoFalla'); } }
                    onDismount={ () => { unregister('mmtoFalla') } }
                />
            }
            {/*             //* Motivo Carga de diesel en otro modulo */}
            { showInputs.motivos.carD &&
                <Input_Select     //* carDmod
                    control={control} errors={errors} 
                    name='carDmod' label='Modulo donde cargo' // keyfilter='int'
                    options={OPTS_MODS}
                    onMount={ () => { register('carDmod'); setValue('carDmod', ''); } }
                    onDismount={ () => { unregister('carDmod') } }
                />
            }
            {/*             //* Motivo Falta de Combustible */}
            { showInputs.motivos.comb &&
                <Input_Select     //* combTipo
                    control={control} errors={errors} 
                    name='combTipo' label='Tipo' // keyfilter='int'
                    options={[ {name: 'DIÉSEL', value: 'DIÉSEL' }, {name: 'UREA ADBLUE AL 32.5%', value: 'UREA ADBLUE AL 32.5%' }, {name: 'GAS NATURAL', value: 'GAS NATURAL' } ]}
                    onMount={ () => { register('combTipo'); setValue('combTipo', ''); } }
                    onDismount={ () => { unregister('combTipo') } }
                />
            }
            
            {/* //? Para que al dar Enter envie el formulario se especifico 'submit' y se coloco dentro del Form los botones */}
            <div className='w-full flex-center gap-4'>
                <Button label='Registrar' type='submit' onClick={ handleSubmit(onSubmit) } className='w-max' disabled={isSendingInfo} />
                <Button label='Cancelar' type='button' onClick={ cancelForm } className='w-max' severity='danger' />
            </div>
        </form>
    </div>
  )
}
