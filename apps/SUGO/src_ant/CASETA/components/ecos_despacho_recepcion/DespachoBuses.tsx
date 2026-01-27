import React, { useId, useEffect, useState, useContext, useRef } from 'react'
import { Button } from 'primereact/button';
import { useForm, useWatch } from 'react-hook-form';
import { Input_Mask, Input_Select, Input_Text } from '../../../shared/components/inputs';
import useAuthStore from '../../../shared/auth/useAuthStore';
import { UseFetchGet, UseFetchPost } from '../../../shared/helpers-HTTP';
import { OperadorJornada } from '../../interfaces/Operador';
import { RutaOptionValue, RutasDBSUGO, RutaDBSWAP } from '../../interfaces/Rutas';
import { dateToString } from '../../../shared/helpers';
import { GeneralContext } from '../../../shared/GeneralContext';
// import { ToastMessage } from 'primereact/toast';
import { Data2Send } from '../../interfaces/EcoInOut';

import { useQueryClient } from 'react-query'
import { Loading1 } from '../../../shared/components/Loaders';


const API = import.meta.env.VITE_SUGO_BackTS



const OPTS_ECO_TIPO = [ {name: 'Planta', value:1}, {name: 'Postura', value:2} ];
const OPTS_MOTIVO = [ 
    { id:10, name: 'RUTA',  value: 'RUTA/ROL', }, 
    { id:1, name: 'RE EMPLACAMIENTO',  value: 'RE EMPLACAMIENTO', }, 
    { id:2, name: 'VERIFICACION',  value: 'VERIFICACION', }, 
    // { id:2, name: 'ETC...',  value: 'ETC...', }, 
];





interface OpDataRes {
    eco?,
    turno?
}

interface Form {
    origen: number;
    eco: string;
    eco_tipo;
    cred: string;
    turno: string;
    tipo: number;
    extintor //: string;
    ruta: { nombre: string, modalidad: string, modalidadId: number };
    modalidad: string;
    cc: string;
    cc_other?: string;
    presentacion: string;
    hr_ini_mod: string;
    motivo: string;
    observaciones: string;
    mmtoFalla?: string;
    combTipo?: string;
    terJtipo?: string;
    carDmod?: string;
}


export const DespachoBuses = () => {

    const formId = useId();
    const { OPTS_RUTA, OPTS_MODS } = useContext(GeneralContext);
    // const { toast } = useContext(GeneralContext);    
    const { credencial:USER_CRED, modulo } = useAuthStore( store => store.user );
    
    const [isLoading, setIsLoading] = useState({ rutaOpt: false, ccOpt: false })
    const [isSendingInfo, setIsSendingInfo] = useState(false);
    const [showInputs, setShowInputs] = useState({
        cc_other: false,
        rolInputs: false
    });
    const [opData, setOpData] = useState<OpDataRes>();
    const [rutaCcOpt, setRutaCcOpt] = useState<{name, value}[]>();
    const [errorMsg, setErrorMsg] = useState<string[]>([]);

    const queryClient = useQueryClient();

    const defaultValues = {
        origen: (modulo==0) ? 1 : modulo!,      // En caso de select debe ser el value, ej: 1
        eco: '',
        cred: '',
        turno: '',
        eco_tipo: 1,
        extintor: null,
        ruta: {},
        modalidad: '',
        cc: '',
        cc_other: '',
        // hr_ini_t: '',
        hr_ini_mod: '',
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
        
    useEffect(() => {
        if(cc=='OTRO'){
            register('cc_other')
            setShowInputs( obj => ({ ...obj, cc_other: true }) )
        } else {
            unregister('cc_other')
            setShowInputs( obj => ({ ...obj, cc_other: false }) )
        }
    }, [cc])
        
    useEffect(() => {
        if(motivo=='RUTA/ROL'){
            register('ruta');
            register('modalidad');
            register('cc');
            setShowInputs( obj => ({ ...obj, rolInputs: true }) );
        } else {
            unregister('ruta');
            unregister('modalidad');
            unregister('cc');
            setShowInputs( obj => ({ ...obj, rolInputs: false }) );
        }
    }, [motivo])
    
    const resetStates = () => {
        setOpData(undefined);
        setRutaCcOpt(undefined);
        setShowInputs({
            cc_other: false,
            rolInputs: false
        })
        setErrorMsg([]);
    }

    const onSubmit = async(d:Form) => {
        setIsSendingInfo(true);
        const NOW = new Date()
        const HOY = dateToString(NOW, true)
        const data2send: (Data2Send & {eco_tipo}) = {
            modulo_id:    d.origen,
            eco:          d.eco,
            eco_tipo:     d.eco_tipo,
            op_cred:      d.cred,
            turno:        d.turno    || undefined,
            extintor:     d.extintor || undefined,
            ruta_swap:    d.ruta?.nombre,
            ruta_modalidad:  d.modalidad,
            ruta_cc:      d.cc_other || d.cc,
            modulo_time:  new Date(`${HOY} ${d.hr_ini_mod}`),    // Añadir fecha del dia
            motivo:       d.motivo,
            motivo_desc:  d.mmtoFalla || d.combTipo || d.terJtipo || d.carDmod,               // Esperar demas campos posibles
            cap_time:     NOW,
            cap_user:     USER_CRED!,
        }
        try {
            const res = await UseFetchPost(`${API}/api/caseta/ecosBitacora/out`, data2send)
            console.log(res);
            queryClient.invalidateQueries(["ecosDespachados"])
            queryClient.invalidateQueries(["ecosRecepcionados"])
            reset();
            resetStates();
            document.getElementById('cred')?.focus();
        } catch (error) {
            console.error(error);
            setErrorMsg(m => [...m, error.message]);
        }
        finally {
            setIsSendingInfo(false);
        }
    };
    
    const cancelForm = () => {
        console.log('Cancel');
        reset();
        resetStates();
        document.getElementById('cred')?.focus();
    }

    const handleBlurCred = async(cred) => {
        if(!cred) return

        const today = dateToString(new Date(), true)

        try {
            const opData: OperadorJornada[] = await UseFetchGet(`${API}/api/rol/cal/cred/${cred}?fechaIni=${today}&fechaFin=${today}`)
            if(!opData[0]) return setOpData(undefined);
            const { eco, turno, hr_ini_t } = opData[0]
            console.log('handleBlurCred', { eco, turno, hr_ini_t });
            setOpData({eco})
            setValue('turno', `${turno}`);
            // setValue('hr_ini_t', `${hr_ini_t.slice(0,5)}`);
            if(eco) {
                setValue('eco', eco);
                setValue('eco_tipo', 1);
            } else {
                setValue('eco_tipo', 2);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleBlurEco = (eco) => {
        if( eco && eco == opData?.eco ){
            setValue('eco_tipo', 1);
        } else {
            setValue('eco_tipo', 2);
        }
    }
    
    const handleBlurRuta = () => {
        const ruta: RutaOptionValue = getValues('ruta') as any;
        if(!ruta?.nombre) return

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

        {/* //& Mi Block UI */}
        {  isSendingInfo && 
            <div className='surface-900 opacity-50 absolute z-5 border-round-lg flex-center' style={{top: -10, right: -10, bottom: -10, left: -10,}}>
                <Loading1 fill='surface-900' title='' />
            </div>
        }
        
        {/* //& Mensajes de error */}
        { errorMsg.length > 0 &&
            <div className='bg-pink-200 py-1 border-round-lg'>
                <ul>
                    {errorMsg.map( (msg, i) => 
                        <li key={`errors-despacho-${i}`} className='font-semibold'>{msg}</li>
                    )}
                </ul>
            </div>
        }
        
        <form id={formId} onSubmit={ handleSubmit(onSubmit) } className='mt-5 mb-3 flex flex-wrap justify-content-center sm:justify-content-start gap-5'>
            <Input_Select   //* Sale de
                control={control} errors={errors} 
                options={OPTS_MODS} name='origen'  label='Sale de' disabled={ !(modulo===0) } 
            />
            <Input_Text     //* Credencial
                control={control} errors={errors} 
                name='cred' label='Credencial' keyfilter='int'
                onBlur={ e => handleBlurCred(e.target.value) }
                rules={{ required: `* Requerido.` }}  
            />
            <Input_Text     //* Economico
                control={control} errors={errors} 
                name='eco' label='Economico' keyfilter='int'
                onBlur={ e => handleBlurEco(e.target.value) }
                rules={{ required: `* Requerido.` }} 
            />
            <Input_Text     //* Turno
                control={control} errors={errors} 
                name='turno' label='Turno' keyfilter='int'
            />
            <Input_Select   //* Tipo
                control={control} errors={errors} 
                options={OPTS_ECO_TIPO} name='eco_tipo' label='Tipo' // disabled={true}
            />

            <Input_Text     //* Extintor
                control={control} errors={errors} 
                name='extintor' label='No. Extintor'  // keyfilter='num'
            /> 
            <Input_Mask     //* Hora de Salida
                control={control} errors={errors} 
                name='hr_ini_mod' mask='99:99' label='Hora de Salida' 
                rules={{ required: `* Requerido.` }} 
            />
            <Input_Select   //* Motivo
                control={control} errors={errors} 
                options={OPTS_MOTIVO} name='motivo' label='Motivo' showClear={false}
                rules={{ required: `* Requerido.` }} 
            />

            { showInputs.rolInputs &&
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
                    options={rutaCcOpt} name='cc' label='CC' showClear={false}
                    isLoading={ isLoading.ccOpt }
                    rules={{ required: `* Requerido.` }} 
                />
            </>
            }
            { showInputs.cc_other &&
                <Input_Text     //* Otro CC
                    control={control} errors={errors} 
                    name='cc_other' label='Otro' keyfilter='alphanum'
                    onBlur={ e => setValue('cc_other', e.target.value.toUpperCase()) }  
                    rules={{ required: `* Requerido.` }} 
                />
            }

            {/* <Input_Mask     //* Presentación en modulo      //? En otro formulario
                control={control} errors={errors} 
                name='presentacion' mask='99:99' label='Presentación en modulo' 
                rules={{ required: `* Requerido.` }} 
            /> */}

            {/* <Input_Text     //* Inicio de labores del operador  //? No es necesario
                control={control} errors={errors} 
                name='hr_ini_t' label='Inicio de labores' disabled
                rules={{ required: `* Requerido.` }} 
            /> */}

            {/* <Input_Text     //* Observaciones
                control={control} errors={errors} 
                name='observaciones' label='Observaciones' keyfilter='int'
            /> */}
            
            {/* //? Para que al dar Enter envie el formulario */}
            <button className='hidden'/>
        </form>

        {/* //& Botones */}
        <div className='flex-center gap-4'>
            <Button label='Enviar' type='submit' onClick={ handleSubmit(onSubmit) } className='w-max' disabled={isSendingInfo} />
            <Button label='Cancelar' type='button' onClick={ cancelForm } className='w-max' severity='danger' />
        </div>
    </div>
  )
}
