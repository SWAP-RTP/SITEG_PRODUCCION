import React, { useContext, useEffect, useId, useRef, useState } from 'react'
import { UseFormReturn, useForm, useWatch } from 'react-hook-form';
import { QueryClient, useQuery, useQueryClient } from 'react-query';
import { RadioButton } from 'primereact/radiobutton';
import { Button } from 'primereact/button';

import { Estado1Eco, PVestado_1eco } from './PVestado_1eco'
import { RutaDBSWAP } from '../../interfaces/Rutas';       //! ←  Interfaces  ↓
import { Form, PVEstadosMotivos, PV_Ecos } from '../interfaces';

import useAuthStore from '../../../shared/auth/useAuthStore';
import { GeneralContext } from '../../../shared/GeneralContext';
import { Input_Select, Input_Text, InputsReloj } from '../../../shared/components/inputs'
import { DynamicInput, MiniFormMaker } from '../../../shared/components/FormMaker/MiniFormMaker';
import { useDebounceValue } from '../../../shared/hooks';
import { UseFetchGet } from '../../../shared/helpers-HTTP';
import { Toast } from 'primereact/toast';
import { subInputsCatalogo } from '../utilities/FormNewEstadoInputs';
import { confirmDialog } from 'primereact/confirmdialog';



export interface SubmitState {
    formData
    form: UseFormReturn<Form, any, undefined>,
    regPrev: Estado1Eco | undefined,
    regNext: Estado1Eco | undefined,
    resetForm: () => void,
    setButtonDisabled: (value: boolean) => void,
    queryClient: QueryClient,
    toast: React.RefObject<Toast>
}
interface Props {
    handleSubmit( state: SubmitState ): void;
}
type PV = {
    all: PV_Ecos[]
    activo: number[]
    modular: number[]
} 



const API = import.meta.env.VITE_SUGO_BackTS


//& Helpers 
const badgeColors =     ['gray', 'green', 'blue', 'gray', 'gray'];
const tiposRegistros =  ['Actualización', 'Despacho', 'Recepcion', 'Actualización fuera de modulo', 'Actualización dentro de modulo'];
const OPTS_MODS = [ 
    { name: 'M01', value: 1},
    { name: 'M02', value: 2},
    { name: 'M03', value: 3},
    { name: 'M04-M', value: 4},
    // { name: 'M04-A', value: 8},
    { name: 'M05', value: 5},
    { name: 'M06', value: 6},
    { name: 'M07', value: 7},
    { name: 'M30', value: 30},
]
const OPTS_MODS_PUERTAS = {
    1: [{name: 'M01', value: 'M01'}],
    2: [{name: 'M02', value: 'M02'}, {name: 'CRD', value: 'CRD'}],
    3: [{name: 'M03', value: 'M03'}],
    4: [{name: 'M04-Minas', value: 'M04-Minas'}, {name: 'M04-Alfa', value: 'M04-Alfa'}],
    5: [{name: 'M05', value: 'M05'}],
    6: [{name: 'M06', value: 'M06'}, {name: 'M06-Anexo', value: 'M06-Anexo'}, {name: 'M06-46', value: 'M06-46'}],
    7: [{name: 'M07', value: 'M07'}, {name: 'M07-Anexo', value: 'M07-Anexo'}, {name: 'M07-33', value: 'M07-33'}],
    30: [{name: 'M30', value: 'M30'}],
}

const groupPropsThatKeysHas = <T extends object>(str: string, formData: T): Record<string, any>|undefined => {
    const obj = {}
    const allKeys = Object.keys(formData);
    const keys = allKeys.filter( key => key.includes(str) );

    if(keys.length===0) return undefined;

    keys.forEach(key => {
        const shortKey = key.replace( str, '' );
        obj[shortKey] = formData[key] || undefined
    });

    const res_stringify = JSON.stringify(obj) 

    return (res_stringify==='{}') ? undefined:JSON.parse(res_stringify);
}

const deletePropsThatKeysHas = <T extends object>(str: string, initObject: T): Record<string, any>|undefined => {
    const obj = {...initObject}
    const allKeys = Object.keys(initObject);

    allKeys.forEach(key => {
        key.includes(str) ? delete obj[key] :undefined;
    });

    return obj;
}





export const FormNewEcoEstado = ({ handleSubmit }:Props) => {
    
    const { sugo1cas0p1 } = useAuthStore( s => s.permisosSUGO )
    const { toast } = useContext(GeneralContext)
    const user_modulo = useAuthStore( s => s.user.modulo )
    const user_cred = useAuthStore( s => s.user.credencial )
    const formId = useId()
    const [buttonDisabled, _setButtonDisabled] = useState(false)
    const setButtonDisabled = (value: boolean) => { _setButtonDisabled(value) }
    const [prevRegTipo, setPrevRegTipo] = useState<0|1|2|3|4>(0)
    const [regTipo, setRegTipo] = useState<0|1|2|3|4>(0)
    const [subInputs, setSubInputs] = useState<DynamicInput[]>([])
    const [momentoCaptura, setMomentoCaptura] = useState<Date>()

    const toastTopCenter = useRef<Toast>(null);


    const pv = useQuery<PV_Ecos[], any, PV>(
        ['ecos','all'], 
        () => UseFetchGet(`${API}/api/caseta/pv-ecos`),
        {
            select(data) {
                const activo = data.map( d => d.eco )
                const modular = data.filter( d => d.modulo == user_modulo ).map( d => d.eco)
                return {
                    all: data,
                    activo,
                    modular
                }
            },
            refetchInterval: false,
            staleTime: Infinity,
        }
    )

    const motivos = useQuery<PVEstadosMotivos[], any, { name: string, value: PVEstadosMotivos }[]>(
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

    const modalidades = useQuery<string[], any, { name: string, value: string }[]>(
        'rutas-modalidades', 
        () => UseFetchGet(`${API}/api/swap/modalidades`),
        {
            select(data) {
                return data.map( d =>({ name: d, value: d }) )
            },
            refetchInterval: false,
            staleTime: Infinity,
        }
    )


    // useForm
    const [defaultValues] = useState({ modulo: user_modulo||1 })
    const f = useForm<Form>({ defaultValues })
    const { control, formState: { errors }, ...form } = f

    // useForm: watch inputs
    const motivoInput   = useWatch({ control, name: 'motivo'})
    const [modalidadInput, rutaInput, ccInput] = useWatch({ control, name: ['ruta_modalidad', 'ruta', 'ruta_cc']})
    const moduloInput = useWatch({ control, name: 'modulo'})
    const ecoInput = useWatch({ control, name: 'eco'})
    const eco = useDebounceValue(ecoInput)
    const puertaInput = useWatch({ control, name: 'modulo_puerta'})
  
    // States prev & next (registros)
    const queryClient = useQueryClient()
    const [prev, setPrev] = useState<Estado1Eco>()
    const [next, setNext] = useState<Estado1Eco>()
    
    const reset = () => {
        const puerta = puertaInput
        form.reset() 
        setButtonDisabled(false)
        setRegTipo(0)
        form.setValue('modulo_puerta', puerta)
        subInputs.length>0 ? subInputs.forEach( input => form.unregister(input.name as any) ) : undefined
    }

    const onSubmit = (d: Form) => {
        //& Middlewares
        if(!sugo1cas0p1) {
            toast.current?.show({ severity: 'info', summary: 'Faalo del servidor', detail: 'sugo 1cas0p1' })
            throw Error('Sin permisos para crear')
        }
        else if(regTipo == 0) {
            toast.current?.show({ severity: 'info', summary: 'Registro invalido', detail: 'Selecciona un tipo de registro' })
            throw Error('Registro invalido: regTipo == 0')
        }
        // Si existe regPrevio & el eco no esta Disponible & es un despacho & no es despacho por reparacion externa
        else if(prev && prev.eco_estatus!=1 && regTipo==1 && d.motivo.id!=7) {
            toast.current?.show({ severity: 'error', life: 10*1000,  summary: 'No es posible despachar', detail: 'El economico NO esta disponible' })
            throw new Error('Registro invalido: El economico NO esta disponible')
        }
        // Si existe siguiente  
        else if(!!next) {
            toast.current?.show({ severity: 'error', life: 10*1000,  summary: 'Imposible crear nuevo', detail: 'Existe un registro posterior' })
            throw Error('Registro invalido: existe "Next"')
        }  
        // Si el eco no pertenece al modulo
        else if( !(pv.data?.modular.includes(Number(eco))) ) {
            confirmDialog({
                header: <span className='uppercase font-normal'>Eco {eco} <b>no</b> es de tu modulo</span>,
                message: <span>El economico <b>{eco}</b> no pertenece a tu modulo, desea continuar?</span>,
                // icon: 'pi pi-info-circle',
                // // defaultFocus: 'reject',
                rejectLabel: 'Si',
                reject: () =>  setTimeout(() => submit(d), 100), 
                // 'Continua'
                acceptClassName: 'p-button-danger',
                acceptLabel: 'No',
                accept: () => document.getElementById('eco')?.focus(),     // 'Focus ecoInput'
            })
        } 
        else {
            submit(d)
        }
    }

    const submit = (data: Form) => {
        if(!sugo1cas0p1) return undefined
        setButtonDisabled(true)
        const dynamicInputs = groupPropsThatKeysHas('motivo_desc_', data)
        const data2 = deletePropsThatKeysHas('motivo_desc_', data)

        if(handleSubmit) handleSubmit({
            formData: {...data2, user_cred, user_modulo, regTipo, dynamicInputs},
            form: f,
            regPrev: prev,
            regNext: next,
            resetForm: reset,
            setButtonDisabled,
            queryClient,
            toast
        })
        else console.log('Use handleSubmit');
    }


    // SET puerta input value
    useEffect(() => {
        moduloInput && form.setValue('modulo_puerta', OPTS_MODS_PUERTAS[moduloInput][0].value)
    }, [moduloInput])

    // Validate Eco
    useEffect(() => {
        eco ? form.trigger('eco'): undefined
    }, [eco])  
    
    // Alert  Ruta programada del Eco
    useEffect(() => {
        if( regTipo === 1 && eco)  {
            const date = momentoCaptura || new Date()
            const fecha = date.toLocaleDateString().split('/').reverse().join('-')
            
            UseFetchGet(`${API}/api/rol/eco-${eco}/ruta?fecha=${fecha}`)
            .then( res => {
                if(!res) return toastTopCenter.current!.show({severity:'warn', summary: `Eco ${eco} sin programación`, life: 2500})
                toastTopCenter.current!.show({severity:'info', summary: `Info del Eco ${res.eco}`, detail:<span>Programado para ruta <b>{res.ruta} - {res.modalidad}</b></span>, life: 25000})
            })
            .catch( err => console.error(err) )
        } 
    }, [regTipo, eco, momentoCaptura])  
    
    
    // Get "tipo de registro" del previo y reset el "tipo de registro" del actual
    useEffect(() => {
        const prevTipo = prev?.pv_estados_motivo.tipo || 0;
        //@ts-ignore
        setPrevRegTipo(prevTipo);
        //@ts-ignore
        setRegTipo(0);
    }, [prev])

    //& Añadir inputs dinamicos segun el motivo
    useEffect(() => {
        //? Definir inputs a usar segun tipo de registro y motivo
        let subInputsToUse: DynamicInput[] = []
        if(regTipo==0)  subInputsToUse = []

        if(motivoInput?.id)  subInputsToUse.push( ...(subInputsCatalogo[motivoInput.id] || []) );

        //? Unregister old inputs & Register new inputs 
        subInputs.length>0      ? subInputs.forEach( input => form.unregister(input.name as any) ) : undefined;
        subInputsToUse.length>0 ? subInputsToUse.forEach( input => form.register(input.name as any) ) : undefined;

        //? SET value inputs (debe ser despues de logica de unregister y resgister)
        // SET options to ruta_modalidad
        const modalidadInputIndex = subInputsToUse.findIndex( obj => obj.name === 'ruta_modalidad' )
        if(modalidadInputIndex>=0){
            //@ts-expect-error  Si existe la prop options
            subInputsToUse[modalidadInputIndex].options = modalidades.data
        } 

        //? Añadir que todos son requeridos y setear inputs
        setSubInputs(subInputsToUse.map( input => ({...input, rules: { required: `* Requerido.` } })));         
    }, [ motivoInput?.id])

    //& SET opciones para ruta
    useEffect(() => {

        rutaInput ? form.setValue('ruta', '' as any) : undefined
        ccInput ? form.setValue('ruta_cc', '' as any) : undefined
        if(modalidadInput){
            const rutaInputIndex = subInputs.findIndex( obj => obj.name === 'ruta' )
            const ccInputIndex = subInputs.findIndex( obj => obj.name === 'ruta_cc' )
            //@ts-expect-error  Si existe la prop options
            if(ccInputIndex>=0)  subInputs[ccInputIndex].options = []
            if (subInputs[rutaInputIndex].type == 'select')  {
                UseFetchGet(`
                    ${API}/api/swap/rutas?modulo=${moduloInput}&modalidad=${modalidadInput}
                `).then( res => {
                    const rutasOpt = res.map( r =>({ 
                        name: `${r.nombre} - ${r.cc_ori_name}-${r.cc_des_name}`, 
                        value: r 
                    }))
                    //@ts-expect-error  Si existe la prop options
                    subInputs[rutaInputIndex].options = rutasOpt
                    console.log(rutasOpt);
                    setSubInputs( prev => [...prev])
                })
                .catch( err => console.error(err) )
            }
        }
    }, [modalidadInput])
    

    //& SET opciones para  CC
    useEffect(() => {
        if(rutaInput) setCcOptions()
    }, [rutaInput?.nombre])
    
    const setCcOptions = () => {
        const ccInputIndex = subInputs.findIndex( obj => obj.name === 'ruta_cc' )
        if(ccInputIndex<0) return undefined;
        
        //@ts-ignore    Si existe la prop en DropdDownProps
        subInputs[ccInputIndex].isLoading = true
        subInputs[ccInputIndex].disabled = true
        UseFetchGet(`${API}/api/swap/rutas?ruta=${rutaInput.nombre}`)
        .then( (res:RutaDBSWAP[]) => {
            const ccAll = res.map( obj => [obj.cc_ori, obj.cc_des] ).flat(3)
            const ccUnicos = [...new Set(ccAll)]
            const ccNoModulos = ccUnicos.filter( c => !(c.includes('M0') || c.includes('M4')) );
            const ccOpciones = ccNoModulos.map( cc => {
                const ccData = res.find( r => r.cc_des == cc )
                return {name: `${cc} - ${ccData?.cc_des_name || '°'}`, value: cc}
            });
            ccOpciones.push({name: 'OTRO', value: 'OTRO'});
            // subInputs.splice(inputIndex, 1, { name:'ruta_cc', label: 'CC', type:'select', options: ccOpciones })
            //@ts-ignore    Si existe la prop en DropdDownProps
            subInputs[ccInputIndex].options = ccOpciones
            //@ts-ignore    Si existe la prop 'options' en DropdDownProps
            subInputs[ccInputIndex].isLoading = false
            subInputs[ccInputIndex].disabled = false
            // Para que vuelva a renderizar los Inputs con su nuevo estado seteado ↑
            setSubInputs( prev => [...prev])
        })
        .catch( err => console.error(err) );
    }

    //& Añadir input de otro_CC (despues de cc_other)
    useEffect(() => {
        if(ccInput==='OTRO'){
            form.register('other_cc');
            const ccInputIndex = subInputs.findIndex( obj => obj.name === 'ruta_cc' );
            const inputOtherCC = { 
                name:'other_cc', 
                label: 'Otro CC', 
                keyfilter: 'alphanum' as 'alphanum',
                onBlur: e => form.setValue('other_cc', e.target.value.toUpperCase())   ,
                rules: { required: `* Requerido.` }
            }
            subInputs.splice(ccInputIndex+1, 0, inputOtherCC );
        } else {
            form.unregister('other_cc')
            const ccOtherInputIndex = subInputs.findIndex( obj => obj.name === 'other_cc' );
            if(ccOtherInputIndex >= 0) subInputs.splice(ccOtherInputIndex, 1);
        }
        // Para que vuelva a renderizar los Inputs con su nuevo estado seteado ↑
        setSubInputs( prev => [...prev])
    }, [ccInput])

    //& SET opciones de Motivos
    const [motivosOpt, setMotivosOpt] = useState<{ name, value }[]>([])
    const motivosTop = ['SERVICIO', 'SERVICIO MB', 'TERMINO DE JORNADA']
    useEffect(() => {
        if( motivos.data && motivos.data.length>0 ){
            // Filtrar segun el tipo de registro
            const optionsAll = motivos.data.filter( m => m.value.tipo==regTipo)
            // Obtener los motivos que se requieran hasta arriba
            const optionsTop = optionsAll.filter( opt => motivosTop.includes(opt.value.desc) )
            // ordenar alfabeticamente los demas motivos
            const optionsRest = optionsAll.filter( opt => !motivosTop.includes(opt.value.desc) )
            .sort((a,b) => a.name>b.name ? 1: a.name<b.name ? -1:0)
    
            setMotivosOpt([ ...optionsTop, ...optionsRest]);
        }

        // Reset input "Motivos"
        form.setValue("motivo", undefined!);
    }, [regTipo])
    

    return (
    <div className='container'>
        <PVestado_1eco id='child-1' eco={eco} momento={momentoCaptura} handleSetData={setPrev} className='ml-auto child-1' style={{left: 0}} />
        
        <form id={formId} onSubmit={ form.handleSubmit(onSubmit) } className={`child-2 relative mx-auto flex-center gap-3 row-gap-5 p-2 border-round-lg shadow-3  ${ regTipo==1 ? 'bg-green-100':regTipo==2 ? 'bg-blue-100':'bg-gray-200' }`} style={{maxWidth: '43rem'}}>
            <div className='w-full m-0 text-center text-xl font-semibold'><div className='mx-auto' style={{maxWidth: '51%'}}>Registrar nuevo estado del economico</div></div>
            <span className={`absolute max-w-8rem p-2 py-1 font-bold text-center text-xs text-white border-round-sm bg-${badgeColors[regTipo]}-500`} style={{top: '.75rem', right:'.75rem'}}>{tiposRegistros[regTipo]}</span>

            {/* //& Formulario */}
            <Input_Select   //* Modulo
                control={control} errors={errors} 
                name='modulo' label='Modulo' 
                options={OPTS_MODS}
                disabled={ user_modulo!=0 }
                // className='md:max-w-6rem'
                rules={{ required: `* Requerido.` }} 
            />
            { OPTS_MODS_PUERTAS[moduloInput].length>1  &&  
                <Input_Select   //* Modulo Puerta
                    control={control} errors={errors} 
                    name='modulo_puerta' label='Puerta' 
                    className='md:max-w-26rem'
                    options={OPTS_MODS_PUERTAS[moduloInput]}
                    rules={{ required: `* Requerido.` }} 
                />
            }

            <Input_Text     //* Economico
                control={control} errors={errors} 
                name='eco' label='Eco' keyfilter='int'
                // className='md:max-w-6rem font-bold'   style={{ background: BG_ECOSxMODALIDAD_COLORS[prev?.eco_modalidad?.name||''] }}
                rules={{ 
                    required: `* Requerido.`, 
                    validate: { 
                        exist: eco => (pv.data?.activo||[]).includes(Number(eco)) || 'Eco inexistente'
                    } 
                }} 
            />

            {/* //& Radio buttons */}
            <div className='flex-center justify-content-start gap-1' style={{width: '12rem'}}>
                {   !prevRegTipo || prevRegTipo == 2 || prevRegTipo == 4 ?
                    <>
                        {/* //*     Despacho    */}
                        <div className="flex-center">
                            <RadioButton 
                                inputId="ingredient1" 
                                name="pizza" value={1} 
                                onChange={(e) => setRegTipo(e.value)} 
                                checked={regTipo === 1} 
                                />
                            <label htmlFor="ingredient1" className={`ml-1 ${regTipo === 1 ? 'font-bold':''}`}>Despacho</label>
                        </div>
                        {/* //*     Actualizacion [in]    */}
                        <div className="flex-center">
                            <RadioButton 
                                inputId="ingredient4" 
                                name="pizza" value={4} 
                                onChange={(e) => setRegTipo(e.value)} 
                                checked={regTipo === 4} 
                            />
                            <label htmlFor="ingredient4" className={`ml-1 ${regTipo === 4 ? 'font-bold':''}`}>Actualizacion <span className='text-50'>3</span></label>
                        </div>
                    </>
                    :   prevRegTipo == 1 || prevRegTipo == 3 ?
                    <>
                        {/* //*     Recepcion    */}
                        <div className="flex-center">
                            <RadioButton 
                                inputId="ingredient2" 
                                name="pizza" value={2} 
                                onChange={(e) => setRegTipo(e.value)} 
                                checked={regTipo === 2} 
                            />
                            <label htmlFor="ingredient2" className={`ml-1 ${regTipo === 2 ? 'font-bold':''}`}>Recepción</label>
                        </div>
                        {/* //*     Actualizacion [out]    */}
                        <div className="flex-center">
                            <RadioButton 
                                inputId="ingredient3" 
                                name="pizza" value={3} 
                                onChange={(e) => setRegTipo(e.value)} 
                                checked={regTipo === 3} 
                            />
                            <label htmlFor="ingredient3" className={`ml-1 ${regTipo === 3 ? 'font-bold':''}`}>Actualizacion <span className='text-50'>4</span></label>
                        </div>
                    </>
                    : <> </>
                }                
            </div>

            {/* //& Motivos */}
            <Input_Select   //* Motivo
                control={control} errors={errors} 
                name='motivo' label='Motivo' 
                options={ motivosOpt }
                disabled={regTipo==0}
                rules={{ required: `* Requerido.` }} 
            />

            { subInputs.length>0 ?      // MiniFormMaker
                <MiniFormMaker 
                    form={f} 
                    inputs={ [...subInputs] } 
                />
            : <></>
            }

            {/* //& Reloj */}
            <InputsReloj formState={f} handleCapturaDate={setMomentoCaptura} />

            {/* //& Botones de formulario */}
            <div className='w-12 flex-center gap-5'>
                { sugo1cas0p1 && <Button type='submit' label='Enviar' disabled={buttonDisabled} /> }
                <Button type='button' severity='danger' label='Cancelar' onClick={ reset }/>
            </div>
        </form>

        <PVestado_1eco id='child-3' eco={eco} momento={momentoCaptura} handleSetData={setNext} getNext className='mr-auto child-3' style={{left: 0}} />
    
        
        <Toast ref={toastTopCenter} position="top-center" />
    </div>
    )
}
