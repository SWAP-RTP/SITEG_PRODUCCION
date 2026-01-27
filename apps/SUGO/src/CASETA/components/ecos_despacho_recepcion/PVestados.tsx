import React, { useContext, useEffect, useId, useRef, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { Control, FieldErrors, FieldValues, RegisterOptions, useForm, useWatch } from 'react-hook-form';
import { UseFetchGet, UseFetchPost } from '../../../shared/helpers-HTTP'
import { ColsProps, TablaCRUD } from '../../../shared/components/Tabla';
import { Input_Mask, Input_Select, Input_Text, Input_Text_Props } from '../../../shared/components/inputs';
import { GeneralContext } from '../../../shared/GeneralContext';
import { RadioButton } from 'primereact/radiobutton';
import { classNames } from 'primereact/utils';
import { Checkbox } from 'primereact/checkbox';
import { regex_24hrs, regex_year_ddmmyyyy, regex_year_yyyymmdd } from '../../../shared/helpers/regEx';
import { useClock } from '../../../shared/hooks/useClock';
import { dateToString, groupByRepeatedValue } from '../../../shared/helpers';
import { InputTextProps } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ToggleButton } from 'primereact/togglebutton';
import { DropdownProps } from 'primereact/dropdown';
import { RutaDBSWAP } from '../../interfaces/Rutas';
import useAuthStore from '../../../shared/auth/useAuthStore';
import { PVestadosMotivos } from './PVestadosMotivos';
import { Carousel } from 'primereact/carousel';
import { PVestado_1eco } from './PVestado_1eco';
import  './styles.css';
import { useDebounceValue } from '../../../shared/hooks/useDebounceValue';
import { Toast } from 'primereact/toast';
        

const API = import.meta.env.VITE_SUGO_BackTS


export interface Result {
    id:                number;              //!
    momento:           string; // Date;     
    tipo:              number;       //!
    eco:               number;              
    eco_tipo?:         1|2;     
    eco_estatus:       number | string;     // Del motivo
    motivo_id:         number;              // Del motivo
    motivo_desc?:      string;              // JSON.stringify de inputs 'motivo_desc_*'
    modulo?:           number;              // Del motivo  cuando motivo.tipo=2  y es = createdBy_modulo
    direccion?:        string;              // especificar la direccion, ej: motivo = accidente
    ruta?:             string;              
    ruta_modalidad?:   string;              
    ruta_cc?:          string;              
    op_cred?:          number;              
    op_turno?:         number;              
    extintor?:         string;              
    estatus:           number | string;     //!
    createdAt:         string; // Date;     //!
    createdBy:         number;              
    createdBy_modulo:  number;              
    updatedAt:         string; // Date;     //!
    updatedBy?:        number;              // Al editar registro
    pv_estados_motivo: PVEstadosMotivos;    // //            
}
export interface PVEstadosMotivos {
    id:             number;
    desc:           string;
    tipo:           number;
    eco_disponible: boolean;
    createdBy:      number;
    updatedBy?:     number;
    prev_values?:   string;
    createdAt:      Date;
    updatedAt:      Date;
}
interface DynamicPvInputs {
    ruta: { nombre: any; modalidad: any; modalidadId?: any;};
    other_cc: string;

    // motivo_desc_modulo_carga_comb: number;
    motivo_desc_falla_mec: string;
    motivo_desc_falta_combustible_tipo: string;
    motivo_desc_falta_combustible_modulo: string;
    motivo_desc_tipo_termino: string;
    motivo_desc_sefi_origen:    string;
    motivo_desc_sefi_destino:   string;
    motivo_desc_observaciones:  string;
}
type Form = Result&{ modulo: number,motivo: PVEstadosMotivos, time_hora: string, time_fecha: string }&DynamicPvInputs

interface FetchPVestados { info: Record<string, number>, results: Result[] }

type RegistroTipo = 1|2|3|4
interface Data2PostNewEcoState {
    momento:        Date;
    tipo:           RegistroTipo;
    eco:            number;
    eco_estatus:    0|1|2;
    eco_tipo?:      1|2;
    motivo_id:      number;
    motivo_tipo:    number;         //^ <-----------
    motivo_desc?:   string; //JSON
    modulo?:        number;
    direccion?:     string;
    ruta?:          string;
    ruta_modalidad?:string;
    ruta_cc?:       string;
    op_cred?:       number;
    op_turno?:      number;
    extintor?:      string;
    createdBy:      number;
    createdBy_modulo: number;
    // registro_id:    number|null;
    reg_previo?:    {id: number, tipo: 1|2|3|4};  //tipo: RegistroTipo, registro_id: number|null},
    reg_siguiente?: {id: number, tipo: 1|2|3|4};  //tipo: RegistroTipo, registro_id: number|null},
}


const COLS: ColsProps[] = [
    { field: "id", header: "id",                    align: 'center' },
    // About economico
    { field: "eco", header: "eco",                  filter: true, align: 'center', bodyClassName: 'max-w-6rem' },
    { field: "eco_tipo_desc", header: "eco_tipo_desc",        align: 'center', bodyClassName: 'max-w-6rem' },
    { field: "eco_estatus", header: "eco_estatus",  filter: true, align: 'center', bodyClassName: 'max-w-6rem' },
    // About registro
    { field: "momento", header: "momento",          align: 'center', bodyClassName: 'max-w-6rem'},
    //! { field: "tipo", header: "tipo" },
    { field: "tipo_desc", header: "Tipo de registro", align: 'center', bodyClassName: 'max-w-7rem'},
    // About motivo
    // { field: "motivo_id", header: "motivo_id" },
    { field: "pv_estados_motivo.desc", header: "MOTIVO", filter: true, align: 'center', bodyClassName: 'max-w-6rem' },
    { field: "motivo_desc", header: "motivo_desc" },
    // About lugar
    { field: "modulo", header: "modulo" },
    { field: "direccion", header: "direccion" },
    { field: "ruta", header: "ruta" },
    { field: "ruta_modalidad", header: "ruta_modalidad" },
    { field: "ruta_cc", header: "ruta_cc" },
    // About operador y extintor
    { field: "op_cred", header: "op_cred" },
    { field: "op_turno", header: "op_turno" },
    { field: "extintor", header: "extintor" },
    // About registro (meta datos)
    { field: "estatus", header: "estatus",          filter: true, align: 'center', bodyClassName: 'max-w-6rem' },
    { field: "createdAt", header: "createdAt",      align: 'center', bodyClassName: 'max-w-6rem'},
    { field: "createdBy", header: "createdBy",      align: 'center', bodyClassName: 'max-w-6rem'},
    { field: "createdBy_modulo", header: "createdBy_modulo", align: 'center', bodyClassName: 'max-w-6rem' },
    { field: "updatedAt", header: "updatedAt",      align: 'center', bodyClassName: 'max-w-6rem'},
    { field: "updatedBy", header: "updatedBy",      align: 'center', bodyClassName: 'max-w-6rem'},
];
const OPT = {
    eco_tipos: ['-', 'planta', 'postura'],
    eco_estatus: ['Baja', 'Disponible', 'NO disponible'],
    tipos: [null, 'Despacho', 'Recepción', 'Actualización'],
    estatus: ['Eliminado', 'Actual', 'Previo']
}

const badgeColors =     ['gray', 'green', 'blue', 'gray', 'gray'];
const tiposRegistros =  ['Actualización', 'Despacho', 'Recepcion', 'Actualización fuera de modulo', 'Actualización dentro de modulo'];
const definirtipoDeRegistro = (prev: number|undefined, next: number): (1|2|3|4) => {
    let tipo: (1|2|3|4) = 3              // Actualizacion
    if(prev==2 && next==1) tipo=1      // Despacho
    if(prev==1 && next==2) tipo=2      // Recepcion
    return tipo
}

const getMotivosDesc = (formData: Record<string, any>, str='motivo_desc_') => {
    const obj: any = {}

    const allKeys = Object.keys(formData);
    const keys = allKeys.filter( key => key.includes(str) );

    if(keys.length===0) return null

    keys.forEach(key => {
        const shortKey = key.replace( str, '' );
        obj[shortKey] = formData[key] || undefined
    });

    const res = JSON.stringify(obj)==='{}' ? 'null':JSON.stringify(obj)

    return JSON.parse(res)
}

const rowClassName = (data: Result) => {
    const className: string[] = []
    if(data.tipo == 1) className.push('text-green-600 font-bold')
    if(data.tipo == 2) className.push('text-blue-600 font-bold')

    return className.join(' ')
}




// --------------------------- ↓ Empieza componente ↓ ---------------------------

export const PVestados = () => {
    const toast = useRef<Toast>(null);

    // ToDo: pasar al contexto. Para CRUD motivos y opciones del input Motivos
    const motivos = useQuery<PVEstadosMotivos[], any, { name: string, value: PVEstadosMotivos }[]>(
        ['PV-estado-motivos'], 
        () => UseFetchGet(`${API}/api/caseta/pv-estados/motivos`),
        {
            select(data) {
                return data.map( obj =>({ name: obj.desc, value: obj }) )
            },
            refetchInterval: false,
            staleTime: Infinity,
        }
    )


    // Para Formulario
    const { OPTS_RUTA, OPTS_MODS } = useContext(GeneralContext);
    const user_modulo = useAuthStore( s => s.user.modulo )
    const user_cred = useAuthStore( s => s.user.credencial )
    const formId = useId();
    const [prevRegTipo, setPrevRegTipo] = useState<0|1|2|3|4>(0);
    const [ingredient, setIngredient] = useState<0|1|2|3|4>(0);
    // const [regTipo, setRegTipo] = useState<1|2|3|4>(3);
    const [showInputs, _setShowInputs] = useState({
        other_cc: false
    })
    const [subInputs, setSubInputs] = useState<DynamicInput[]>([])
    const [canEditHour, setCanEditHour] = useState(false);

    const setShowInputs = (name: keyof { other_cc }, value: boolean) => {
        _setShowInputs(prev => ({...prev, [name]: value}))
    }

    const defaultValues = {
        modulo: user_modulo||1,
    };
    const { control, formState: { errors }, ...form } = useForm<Form>({ defaultValues });

    const motivo   = useWatch({ control, name: 'motivo'});
    const ecoInput = useWatch({ control, name: 'eco'});
    const eco = useDebounceValue(ecoInput);
    const [rutaOpt, ccOpt] = useWatch({ control, name: ['ruta', 'ruta_cc']});


    const queryClient = useQueryClient();
    const prev = queryClient.getQueryData<{info: Record<string, number>, results: Result[]}>( ["PV-1-eco", eco, "prev"]);
    const next = queryClient.getQueryData<{info: Record<string, number>, results: Result[]}>( ["PV-1-eco", eco, "next"]);

    
    const onSubmit = (d: Form) => {
        // ToDo:  show toast: Tipo de registro invalido
        if(ingredient == 0) return   toast.current?.show({ severity: 'info', summary: 'Registro invalido' });
        // ToDo:  show toast: Imposible crear, existe un registro posterior
        const regPrev = prev?.results[0]
        const regNext = next?.results[0]
        if(!!regNext)  return toast.current?.show({ severity: 'error', life: 10*1000,  summary: 'Imposible crear nuevo', detail: 'Existe un registro posterior' });
        

        const dynamicInputs = getMotivosDesc(d);

        const data: Data2PostNewEcoState = {
            momento:    new Date(d.time_fecha.split('/').reverse().join('-') +' '+ d.time_hora),
            tipo:               ingredient,
            eco:                Number(d.eco),
            eco_tipo:           d.eco_tipo,
            eco_estatus:        d.motivo.eco_disponible ? 1:2,
            motivo_id:          d.motivo.id,
            motivo_tipo:        d.motivo.tipo,
            motivo_desc:        !!dynamicInputs ? JSON.stringify(dynamicInputs): undefined,
            modulo:             d.motivo.tipo===2 ? d.modulo : undefined,
            direccion:          d.direccion,
            ruta:               d.ruta?.nombre,
            ruta_modalidad:     d.ruta_modalidad,
            ruta_cc:            d.other_cc || d.ruta_cc,
            op_cred:            d.op_cred,
            op_turno:           d.op_turno,
            extintor:           d.extintor,
            createdBy:          user_cred as number, 
            createdBy_modulo:   user_modulo as number,
            reg_previo:         (regPrev) ? {id: regPrev.id, tipo: regPrev.tipo as 1|2|3|4}:undefined,       
            reg_siguiente:      undefined,
        };
        console.log('data sended', JSON.parse(JSON.stringify(data)));
        
        //& Send data
        // return
        UseFetchPost(`${API}/api/caseta/pv-estados`, data)
        .then( res => { 
            console.log('res', res);
            // Reset form
            form.reset(); 
            setIngredient(0);
            subInputs.length>0 ? subInputs.forEach( input => form.unregister(input.name as any) ) : undefined;
            pvEstado.refetch() 
            
            // Focus in...
            document.getElementById('eco')?.focus(); 
        } )
        .catch( err => console.error(err) );
    }
    const cancelForm = () => {
        form.reset(defaultValues);
        setIngredient(0);
        document.getElementById('eco')?.focus()
    }

    useEffect(() => {
        form.setValue("motivo", undefined!);
    }, [ingredient])
    
    useEffect(() => {
        const prevTipo = prev?.results[0]?.pv_estados_motivo.tipo || 0;
        //@ts-ignore
        setPrevRegTipo(prevTipo);
        //@ts-ignore
        setIngredient(0);
    }, [prev])


    // ToDo: mover al contexto o helper o hook*¹ o a un componente*²
    //& Dynamic form inputs:
    //* Inputs base. Tienen que ver con dar servicio
    const subInputs_base: DynamicInput[] = [
        { name:'op_cred', label: 'Credencial', keyfilter: 'int' },
        { name:'op_turno', label: 'Turno', type:'text', keyfilter: 'int' },
        { name:'extintor', label: 'No. Extintor', type:'text', keyfilter: 'int' },
        { name:'ruta', label: 'Ruta', type:'select', options: OPTS_RUTA, filter: true },              //! Dynamic
        { name:'ruta_modalidad', label: 'Modalidad', type:'text', disabled: true },
        { name:'ruta_cc', label: 'CC', type:'select', options: [] },                //! Dynamic
    ]    

    // ToDo: Como hacer el splice para insertar "eco_tipo" en inputs base?
    // Salida a servicio/Ruta (id 1)   
    const subInputs_servicio = [...subInputs_base];
    subInputs_servicio.splice(2,0, { name:'eco_tipo', label: 'Eco de', type:'select', options: [{name:'PLANTA', value:1}, {name:'POSTURA', value:2}] });
    // // Recepcion por carga de diesel en otro modulo (id 2)
    // // const subInputs_cargaDiesel: DynamicInput[] = [
    // //     { name:'motivo_desc_modulo_carga_comb', label: 'Modulo donde cargo', type:'select', options: OPTS_MODS }
    // // ];
    // Termino de jornada (id 9)
    const subInputs_terminoJornada: DynamicInput[] = [...subInputs_base, 
        { name:'motivo_desc_tipo_termino', label: 'Tipo de termino', type:'select', options: [{name:'Normal', value:'Normal'}, {name:'Discontinuo', value:'Discontinuo'}] }
    ]
    // Recepcion por falla mecanica (id's 5 y 11)
    const subInputs_accidente: DynamicInput[] = [
        { name:'direccion', label: 'Lugar' },
        { name:'motivo_desc_observaciones', label: 'Descripción del lugar' }
    ];
    // Recepcion por falla mecanica (id 6)
    const subInputs_fallaMec: DynamicInput[] = [
        { name:'motivo_desc_falla_mec', label: 'Falla' }
    ];
    // Actualizacion por falta de combustible (id 16)
    const subInputs_faltaCombustibleIn: DynamicInput[] = [
        { name:'motivo_desc_falta_combustible_tipo', label: 'Tipo', type:'select', options: [{name: 'DIÉSEL', value: 'DIÉSEL' }, {name: 'UREA ADBLUE AL 32.5%', value: 'UREA ADBLUE AL 32.5%' }, {name: 'GAS NATURAL', value: 'GAS NATURAL' }] },
        { name:'motivo_desc_observaciones', label: 'Observaciones' }
    ];
    // Actualizacion por falta de combustible (id 17)
    const subInputs_faltaCombustibleOut: DynamicInput[] = [
        { name:'motivo_desc_falta_combustible_tipo', label: 'Tipo', type:'select', options: [{name: 'DIÉSEL', value: 'DIÉSEL' }, {name: 'UREA ADBLUE AL 32.5%', value: 'UREA ADBLUE AL 32.5%' }, {name: 'GAS NATURAL', value: 'GAS NATURAL' }] },
        { name:'motivo_desc_falta_combustible_modulo', label: 'Se dirige a', type:'select', options: OPTS_MODS },
        { name:'motivo_desc_observaciones', label: 'Observaciones' }
    ];
    // Actualizacion por falta de combustible (id 18)
    const subInputs_sefi: DynamicInput[] = [
        { name:'motivo_desc_sefi_origen', label: 'Origen'},
        { name:'motivo_desc_sefi_destino', label: 'Destino'},
        { name:'motivo_desc_observaciones', label: 'Observaciones'},
    ];
    // // Falta de relevo (id 10)
    // // const subInputs_faltaRelevo = [...subInputs_base];

    //& Input motivo: Añadir inputs dinamicos segun el motivo
    useEffect(() => {
        // Decidir subInputs a usar -> unregister inputs -> register nuevos inputs -> setear inputs al MiniFM 
        let subInputsToUse: DynamicInput[] = []

        if(ingredient==0)  subInputsToUse = []
        if(ingredient==1)  subInputsToUse = subInputs_servicio
        if(ingredient==2)  subInputsToUse = subInputs_terminoJornada
  
        const subInputsCatalogo = {
            // 1:  subInputs_servicio,
            // // 2:  subInputs_cargaDiesel,
            5:   subInputs_accidente,
            6:   subInputs_fallaMec,
            // 9:   subInputs_terminoJornada,
            // // 10: subInputs_faltaRelevo,
            11:  subInputs_accidente,
            12:  subInputs_fallaMec,
            16:  subInputs_faltaCombustibleOut,
            17:  subInputs_faltaCombustibleIn,
            // 18:  subInputs_sefi, 
            21:  subInputs_sefi, 
            23:  subInputs_fallaMec,
        }
        if(motivo?.id)  subInputsToUse.push( ...(subInputsCatalogo[motivo.id] || []) );

        if(motivo?.id === 18) subInputsToUse = [
            ...subInputs_servicio.slice(0, subInputs_base.length-3),
            ...subInputs_sefi
        ]

        subInputs.length>0      ? subInputs.forEach( input => form.unregister(input.name as any) ) : undefined;
        subInputsToUse.length>0 ? subInputsToUse.forEach( input => form.register(input.name as any) ) : undefined;

        console.log({ingredient, subInputsToUse});
        setSubInputs(subInputsToUse);         
    }, [ motivo?.id])
    // ToDo: mover al contexto o a un hook*¹


    //& Input ruta: setear la modalidad y las opciones de CC
    useEffect(() => {
        if(rutaOpt){
            form.setValue('ruta_modalidad', rutaOpt.modalidad)
            const inputIndex = subInputs.findIndex( obj => obj.name === 'ruta_cc' )
            subInputs[inputIndex].disabled = true
            //@ts-ignore    Si existe la prop en DropdDownProps
            subInputs[inputIndex].isLoading = true

            UseFetchGet(`${API}/api/swap/rutas?ruta=${rutaOpt.nombre}`)
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
                subInputs[inputIndex].options = ccOpciones
                subInputs[inputIndex].disabled = false
                //@ts-ignore    Si existe la prop 'options' en DropdDownProps
                subInputs[inputIndex].isLoading = false
            })
            .catch( err => console.error(err) );
        }
    }, [rutaOpt?.nombre])

    //& Input CC: añadir input de otro_CC
    useEffect(() => {
        if(ccOpt==='OTRO'){
            form.register('other_cc')
            setShowInputs( 'other_cc', true );
        } else {
            form.unregister('other_cc')
            setShowInputs( 'other_cc', false )
        }
    }, [ccOpt])
    // ToDo: mover a un componente*²
    

    //& Reloj
    const [form_hora, form_fecha]  = useWatch({ control, name: ['time_hora', 'time_fecha']});
    const [momentoCaptura, setMomentoCaptura] = useState<Date>();
    const { time } = useClock({stop: canEditHour}); 
    useEffect(() => {
        form.setValue('time_hora',  time.toTimeString());
        form.setValue('time_fecha', dateToString(time));
    }, [time]);
    useEffect(() => {
        if(canEditHour && regex_year_ddmmyyyy.test(form_fecha) && regex_24hrs.test(form_hora?.split(' ')[0])){
            const fecha = form_fecha?.split('/').reverse().join('-');
            const hora  = form_hora?.split(' ')[0];
            const momento = new Date(fecha+' '+hora);
            setMomentoCaptura(momento);
        }
        if(!canEditHour && momentoCaptura) setMomentoCaptura(undefined);
    }, [canEditHour, form_fecha, form_hora]);


    //& -------------------- TABLAS --------------------
    const [panel, setPanel] = useState(1);

    //& Panel 0
    const [getAllRecords, setGetAllRecords] = useState(false)
    const despachos = useQuery<FetchPVestados, any, Result[]>(
        'pvDespachos',
        () => UseFetchGet(`${API}/api/caseta/pv-estados?tipo=1&complemento=null`),
        {

            select: (data) => data.results.map( d => ({...d, momento: new Date(d.momento).toLocaleString()}) ),
        }
    )

    const recepciones = useQuery<FetchPVestados, any, Result[]>(
        'pvRecepciones',
        //ToDo: por dia laboral
        () => {
            const hrBase = new Date();
            hrBase.setHours( 3, 0 )
            const startFrom = new Date();
            if(startFrom < hrBase) startFrom.setDate( startFrom.getDate() - 1 );
            //? Traer todas las recepciones
            if(getAllRecords) startFrom.setTime(1704088800000); // enero 1 de 2024
            const fecha = dateToString(startFrom, true);
            return UseFetchGet(`${API}/api/caseta/pv-estados?tipo=2&fecha_ini=${fecha}`)
        },
        {
            select: (data) => data.results.map( d => ({...d, momento: new Date(d.momento).toLocaleString()}) ),
        }
    )

    useEffect(() => {
        if(recepciones.data) recepciones.refetch() 
    }, [getAllRecords])
    

    // {field: keyof (Result&{'pv_estados_motivo.desc'}), header: string}[]
    const ColsDespRecep: ColsProps[] = [
        {field:'id', header: 'ID'},
        {field:'createdBy_modulo', header: 'Modulo'},
        {field:'eco', header: 'eco'},
        {field:'op_cred', header: 'op_cred'},
        {field:'momento', header: 'Hora', bodyClassName: 'text-sm'},
        {field:'extintor', header: 'extintor'},
        {field:'pv_estados_motivo.desc', header: 'Motivo', bodyClassName: 'text-sm'},
        {field:'ruta', header: 'ruta'},
    ]

    //& Panel 1
    const pvEstado = useQuery<FetchPVestados, any, Result[]>(
        ['PV-estado'], 
        () => UseFetchGet(`${API}/api/caseta/pv-estados`),
        {
            select(data) {
                const limiteEdicion = new Date();
                limiteEdicion.setHours( limiteEdicion.getHours() -72);
                return data.results.map( obj => ({
                    ...obj, 
                    editButton: new Date(obj.momento)>=limiteEdicion,
                    deleteButton: new Date(obj.momento)>=limiteEdicion,
                    eco_tipo_desc: OPT.eco_tipos[obj.eco_tipo||0], 
                    eco_estatus: OPT.eco_estatus[obj.eco_estatus], 
                    momento: new Date(obj.momento).toLocaleString(),
                    tipo_desc: OPT.tipos[obj.tipo], 
                    estatus: OPT.estatus[obj.estatus], 
                    createdAt: new Date(obj.createdAt).toLocaleString(),
                    updatedAt: new Date(obj.updatedAt).toLocaleString(),
                }) )
            },
        }
    )

    //& Panel 2
    interface TableProps {
        loading:        boolean;
        data:           {id: number, ruta: string, ecos: number}[];
        ecosTotales:    number;
        ecosEnRuta:    number;
    };
    const initTableState = {
        loading: true,
        data: [],
        ecosTotales: 0,
        ecosEnRuta: 0
    }
    const [ecosEnRuta, setEcosEnRuta] = useState<TableProps>(initTableState);
    useEffect(() => {
        if(despachos.data){
            const ecosRuta = despachos.data.filter( obj => obj.pv_estados_motivo.id === 1 )
            const ecosXruta = groupByRepeatedValue(ecosRuta, 'ruta').map( (arr: any[],i) => ({ id: i, ruta: arr[0]?.ruta ?? 'Ruta no asignada', ecos: arr.length }))
            // console.log('data', ecosXruta);
            const ecosXrutaExtended = ecosXruta.map( obj => {
                const ruta = OPTS_RUTA.find( R => R.value.nombre==obj.ruta )
                const data = { 
                    ...obj,
                    origen:    ruta?.value.origen_desc  || '',
                    destino:   ruta?.value.destino_desc ||'',
                    modalidad: ruta?.value.modalidad    ||''
                }
                return data
            });
            let ecos = 0;
            ecosXruta.forEach( obj => ecos+=obj.ecos );
            setEcosEnRuta({
                loading: false,
                data: ecosXrutaExtended,
                ecosEnRuta: ecos,
                ecosTotales: despachos.data.length,
            }); 
        }
    }, [despachos.data])
    


    return (
    <> 
        <div className='w-12 flex-center h-4rem px-2 mb-4 border-round-md shadow-1 lg:justify-content-end'>
            <PVestadosMotivos data={ motivos.data }/>
        </div>

        <div className='container'>

        <PVestado_1eco id='child-1' eco={eco} momento={momentoCaptura} className='ml-auto child-1' style={{left: 0}} />
        
        <form id={formId} onSubmit={ form.handleSubmit(onSubmit) } className={classNames('child-2 relative mx-auto flex-center gap-5 py-2 border-round-lg shadow-3', { 'bg-green-100': ingredient==1, 'bg-blue-100': ingredient==2, 'bg-gray-200': ingredient>2 || !ingredient})} style={{maxWidth: '43rem'}}>
            <div className='w-full m-0 text-center text-xl font-semibold'><div className='mx-auto' style={{maxWidth: '51%'}}>Registrar nuevo estado del economico</div></div>
            <span className={`absolute max-w-8rem p-2 py-1 font-bold text-center text-xs text-white border-round-sm bg-${badgeColors[ingredient]}-500`} style={{top: '.75rem', right:'.75rem'}}>{tiposRegistros[ingredient]}</span>

            {/* //& Formulario */}
            <Input_Select   //* Modulo
                control={control} errors={errors} 
                name='modulo' label='Modulo' 
                options={OPTS_MODS}
                disabled={ user_modulo!=0 }
                className='md:max-w-6rem'
                rules={{ required: `* Requerido.` }} 
            />

            <Input_Text     //* Economico
                control={control} errors={errors} 
                name='eco' label='Eco' keyfilter='int'
                className='md:max-w-5rem'
                rules={{ required: `* Requerido.` }} 
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
                                onChange={(e) => setIngredient(e.value)} 
                                checked={ingredient === 1} 
                                />
                            <label htmlFor="ingredient1" className={`ml-1 ${ingredient === 1 ? 'font-bold':''}`}>Despacho</label>
                        </div>
                        {/* //*     Actualizacion [in]    */}
                        <div className="flex-center">
                            <RadioButton 
                                inputId="ingredient4" 
                                name="pizza" value={4} 
                                onChange={(e) => setIngredient(e.value)} 
                                checked={ingredient === 4} 
                            />
                            <label htmlFor="ingredient4" className={`ml-1 ${ingredient === 4 ? 'font-bold':''}`}>Actualizacion [in]</label>
                        </div>
                    </>
                    :   prevRegTipo == 1 || prevRegTipo == 3 ?
                    <>
                        {/* //*     Recepcion    */}
                        <div className="flex-center">
                            <RadioButton 
                                inputId="ingredient2" 
                                name="pizza" value={2} 
                                onChange={(e) => setIngredient(e.value)} 
                                checked={ingredient === 2} 
                            />
                            <label htmlFor="ingredient2" className={`ml-1 ${ingredient === 2 ? 'font-bold':''}`}>Recepción</label>
                        </div>
                        {/* //*     Actualizacion [out]    */}
                        <div className="flex-center">
                            <RadioButton 
                                inputId="ingredient3" 
                                name="pizza" value={3} 
                                onChange={(e) => setIngredient(e.value)} 
                                checked={ingredient === 3} 
                            />
                            <label htmlFor="ingredient3" className={`ml-1 ${ingredient === 3 ? 'font-bold':''}`}>Actualizacion [out]</label>
                        </div>
                    </>
                    : <> </>
                }                
            </div>

            {/* //& Motivos */}
            <Input_Select   //* Motivo
                control={control} errors={errors} 
                name='motivo' label='Motivo' 
                options={motivos.data?.filter( m => m.value.tipo==ingredient).sort((a,b) => a.name>b.name ? 1: a.name<b.name ? -1:0) || []}
                disabled={ingredient==0}
                rules={{ required: `* Requerido.` }} 
            />

            { subInputs.length>0 ?
            <>
                <MiniFormMaker 
                    control={control} 
                    errors={errors} 
                    inputs={ [...subInputs] } 
                />
                { showInputs.other_cc &&
                <Input_Text     //* Otro CC
                    control={control} errors={errors} 
                    name='other_cc' label='Otro CC' keyfilter='alphanum'
                    onBlur={ e => form.setValue('other_cc', e.target.value.toUpperCase()) }  
                    rules={{ required: `* Requerido.` }} 
                />
                }
            </> 
            : <></>
            }

            {/* //& Reloj */}
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

            {/* //& Botones de formulario */}
            <div className='w-12 flex-center gap-5'>
                <Button type='submit' label='Enviar'/>
                <Button type='button' severity='danger' label='Cancelar' onClick={ cancelForm }/>
            </div>
        </form>

        <PVestado_1eco id='child-3' eco={eco} momento={momentoCaptura} getNext className='mr-auto child-3' style={{left: 0}} />
        </div>

        <div className='mx-auto my-3 w-12 border-none border-top-2 border-dashed border-green-500'/>

        {/* //& -------------------- TABLAS ---------------- */}
        <div className='flex-center align-items-stretch gap-2'>
            <Button onClick={() => setPanel(0)} outlined={panel!=0} style={stl.tabButton} label='Despachos & Recepciones' />
            <Button onClick={() => setPanel(1)} outlined={panel!=1} style={stl.tabButton} label='Registros Realizados' />
            <Button onClick={() => setPanel(2)} outlined={panel!=2} style={stl.tabButton} label='Economicos en Ruta' />
        </div>

        { panel == 0 &&
            <div className='flex-center align-items-start'>
                <div className='w-12 p-2 md:w-6'>
                    <h2>Despachos</h2>
                    { despachos.data?.length!=0 ?
                        <TablaCRUD 
                            data={despachos.data}
                            cols={ColsDespRecep}
                            accion={false}
                            dataTableProps={{ resizableColumns: false }} 
                        />
                        :
                        <ClipoMsg txt='No hay ecos Despachados pendientes de recepción' />
                    }
                </div>
                <div className='w-12 p-2 md:w-6'>
                    <h2>Recepciones <Checkbox checked={getAllRecords} onChange={e => setGetAllRecords(!!e.checked)} icon='pi pi-eye' style={stl.checkBtn} pt={{input: {className: 'border-none'}}}></Checkbox> </h2>
                    { recepciones.data?.length!=0 ?
                        <TablaCRUD 
                            data={recepciones.data}
                            cols={ColsDespRecep}
                            accion={false}
                            dataTableProps={{ resizableColumns: false }} 
                        />
                        :
                        <ClipoMsg txt='No hay ecos Recepcionados el día de hoy' />
                    }
                </div>
            </div>
        }
        { panel == 1 &&
        <>
            <h2 className='text-center mt-5 uppercase'>Registros de actualizaciones realizados</h2>
            <TablaCRUD 
                data={pvEstado.data} cols={COLS} 
                inputs={[
                    {id: 'id', label: 'id', disabled: true},
                    {id: 'eco', label: 'eco' },
                    {id:'eco_tipo', label: 'eco_tipo', inputType: 'select', optionsforSelect:[{name: 'PLANTA', value:1}, {name: 'POSTURA', value:2}]},
                    {id:'eco_estatus', label: 'eco_estatus', disabled: true},
                    {id:'motivo_id', label: 'motivo_id'},
                    {id:'pv_estados_motivo.desc', label: 'motivo'},
                    {id:'motivo_desc', label: 'motivo_desc'},
                    {id:'modulo', label: 'modulo'},
                    {id:'direccion', label: 'direccion'},
                    {id:'ruta', label: 'ruta'},
                    {id:'ruta_modalidad', label: 'ruta_modalidad'},
                    {id:'ruta_cc', label: 'ruta_cc'},
                    {id:'op_cred', label: 'op_cred'},
                    {id:'op_turno', label: 'op_turno'},
                    {id:'extintor', label: 'extintor'}
                ]}
                // deleteb={false} 
                dataTableProps={{ rowClassName, resizableColumns: false }} 
            /> 
        </>
        }
        { panel == 2 &&
            <div className='w-12 md:max-w-30rem mx-auto my-4'>
                {/* <p className='text-center m-0' style={{fontSize: '5rem'}}>Ecos en ruta del dia</p> */}
                <h2 className='text-center m- p-2 bg-green-100 text-3xl' >Economicos dando servicio en Ruta</h2>
                <TablaCRUD 
                    cols={[
                        { header: 'Ruta', field: 'ruta' },
                        { header: 'Ecos', field: 'ecos' },
                        { header: 'Modalidad', field: 'modalidad' },
                        { header: 'Origen', field: 'origen' },
                        { header: 'Destino', field: 'destino' },
                    ]} 
                    data={ecosEnRuta.data}
                    accion={ false }
                    dataTableProps={{ 
                            // Totales: <b>{ecosEnRuta.ecosTotales}</b> <span className='mx-3'/>
                        header: () => <p>En ruta: <b>{ecosEnRuta.ecosEnRuta}</b></p>, 
                        paginator: false, 
                        loading: ecosEnRuta.loading
                    }}
                />
            </div>
        }


        <Toast ref={toast} />
    </>
    )
}

//& -------------------- TABLAS styles inline --------------------
const stl: Record<string, React.CSSProperties> = {
    tabButton: {
        maxWidth: '8rem',
    },
    checkBtn: { left: '.5rem', bottom: '.25rem' }
}


//& ------------------------ MiniFormMaker -----------------------

interface Props {
    // control: Control,
    // errors: FieldErrors,
    control ,
    errors ,
    inputs: DynamicInput[]
}
export type DynamicInput = {
    name:  string;
    label: string;
    rules?: Omit<RegisterOptions<FieldValues, string>, "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"> | undefined;
} & (
    | { type?: 'text', onMount?: () => void, onDismount?: () => void, inputClassName?: string } & InputTextProps
    | { type:  'select', options: {name, value}[], isLoading?: boolean } & DropdownProps
)

export const MiniFormMaker = ({
    control,
    errors,
    inputs
}: Props) => {

    return (
    <>
        { inputs.map( (input, index) => {
            const { name, label, rules, ...rest } = input

            if(input.type==='select') return (
            <Input_Select
                key={name+index}
                control={control} errors={errors} 
                name={name} label={label}  
                { ...rest as { options: {name, value}[] } & DropdownProps }
            />
            )

            return (
                <Input_Text
                    key={name+index}
                    control={control} errors={errors} 
                    name={name} label={label} 
                    rules={rules} 
                    {...rest as {onMount?: () => void, onDismount?: () => void, inputClassName?: string } & InputTextProps}
                />
            )
        })
        }
    </>
    )
}

//& ------------------------ Clipo -----------------------
interface ClipoProps { txt: string }
const ClipoMsg = ({txt}: ClipoProps) => {
    return (
        <div className='flex flex-wrap align-items-center opacity-60 min-w-max'>
            <p className='m-0' style={{fontSize: '6rem'}}>📎</p>
            <p 
                className='m-0 p-2 w-min md:w-auto text-xl font-bold bg-yellow-300 border-round-xl'
                style={{ minWidth: '5rem', maxWidth: '18rem'}}
            >
                {txt}
            </p>
        </div>
    )
}