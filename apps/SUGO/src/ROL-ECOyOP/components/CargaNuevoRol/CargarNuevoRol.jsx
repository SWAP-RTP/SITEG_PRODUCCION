import './styles.css';
import { useEffect, useRef, useState } from 'react';

import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import { Dropdown } from 'primereact/dropdown';
import { Wrapper } from './Wrapper';
import { Desc } from './Desc';
import useValidateRoles from './useValidateRoles';
import { LoadingDialog } from '../../../shared/components/Loaders';
import { UseFetchGet, UseFetchPost } from '../../../shared/helpers-HTTP'
import { ShowYDeleteRoles } from '../ShowYDeleteRoles';
import { RutasSemovi } from '../RutasSemovi';
import { groupByRepeatedValue } from '../../../shared/helpers';
import { PVestadosRutas } from '../../../CASETA/pv-estados/components';
import { PeriodosRol } from '../PeriodosRol';


const api_base = import.meta.env.VITE_SUGO_BackTS
const OPTS_MODS = [ 
    { name: 'M01', value: { name: 'M01', value: 1}},
    { name: 'M02', value: { name: 'M02', value: 2}},
    { name: 'M03', value: { name: 'M03', value: 3}},
    { name: 'M04-A', value: { name: 'M04-A', value: 4}},
    { name: 'M04-M', value: { name: 'M04-M', value: 4}},
    { name: 'M05', value: { name: 'M05', value: 5}},
    { name: 'M06', value: { name: 'M06', value: 6}},
    { name: 'M07', value: { name: 'M07', value: 7}}
]


export const CargarNuevoRol = () => {

    const uploadComp = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isRaw, setIsRaw] = useState(false);
    const [periodo, setPeriodo] = useState();
    const [periodoOpt, setPeriodoOpt] = useState([]);
    const [mod, setMod] = useState();
    const [excel, setExcel] = useState()
    const [error, setError] = useState([])
    const [rolesSended, setRolesSended] = useState(0);

    useEffect(() => {
        UseFetchGet(`${api_base}/api/periodos`)
            .then(res => {
                console.log('Respuesta de la API:', res); // Log temporal para inspeccionar los datos
                const d = new Date();
                const periodoActual = res.findIndex(({ fecha_inicio, fecha_fin }) =>
                    new Date(fecha_inicio) < d && d < new Date(fecha_fin)
                );
                const n = periodoActual === 0 ? 0 : 1;
                const periodosToShow = res.slice(periodoActual - n, periodoActual + 2);
                setPeriodoOpt(
                    periodosToShow.map(obj => ({
                        ...obj,
                        self: { ...obj },
                        name: `${`${obj.serial}`.padStart(2, '0')} - del ${obj.fecha_inicio} al ${obj.fecha_fin}`
                    }))
                );
            })
            .catch(err => console.error('Error al cargar los periodos:', err));
    }, [])


    /**
     * Hook personalizado que valida automáticamente el archivo Excel cargado.
     * Revisa el formato, encabezados y datos del archivo según el módulo y periodo seleccionados.
     * Si encuentra errores, los muestra en pantalla y bloquea el envío hasta que el archivo sea corregido.
     * Si todo es correcto, prepara los datos para ser enviados al backend.
     */
    const {cleanStates, errores, rolData, isLoading: validatingData, showErr, canUpload, cont} = useValidateRoles(excel, mod?.value, periodo)

    // const fileSelected = () => {
    //     setTimeout(() => {
    //         //? Si no esta dentro del setTimeOut NO toma el archivo, quien sabe porque
    //         const files = uploadComp.current.getFiles()
    //         console.log('fileSelected', files);
    //         console.log(files.length>0);
    //     }, 1);
    // }
    

    const customUploader = async({files}) => {
        const file = files[0];
        console.log(file);
        setExcel(file)
    }

    const [bool, setBool] = useState(false)

    const sendData = () => {
        console.log('Sending Roles...');
        console.log('mod', mod, 'mod sliced', mod.name.slice(2));
        // console.log('rolData', rolData);
        // console.log('errores', errores);

        setIsLoading(true)
        UseFetchPost(`${api_base}/api/rol/calendarios_excel`, { data: rolData, modulo: mod.name.slice(2) })
            .then(  res => { 
                console.warn(res); 
                setRolesSended( n => n+=1 ) 
            } )
            .catch( err => { 
                console.error(err); 
                console.log(groupByRepeatedValue(err.desc, 'op_cred').map( arr => ({ op_cred: arr[0].op_cred, data: arr }) ));
                setError( e => [...e, err.message]);   
            } )
        .finally( () => {
            setIsLoading(false)
            console.log('------- FIN -----------', rolesSended)
        } )
    }

  return (
    <>
        <div className='w-12 flex-center gap-4 h-4rem px-2 mb-4 border-round-md shadow-1 lg:justify-content-end'>
            <PeriodosRol inDialog/>
            <RutasSemovi/>
            <PVestadosRutas inDialog/>
        </div>

        { error[0] &&
            <div className='bg-red-600 mt-2 mb-6 py-2 px-4 border-round-md shadow-3 text-100' >
                {error.map( (err, i) => <p className='font-medium' key={i+err} >{err}</p> )}
            </div>
        }
        
        <div className='flex flex-wrap flex-column-reverse md:flex-row md:justify-content-between' >
            <div className="flex flex-wrap align-content-start gap-4 mt-5 w-12 md:w-5">
                <span className="p-float-label">
                    <Dropdown 
                        value={periodo} 
                        onChange={(e) => setPeriodo(e.value)} 
                        options={periodoOpt} optionLabel="name" optionValue='self'
                        placeholder="Select a Country" 
                        // filter 
                        className="w-full sm:w-20rem" 
                    />
                    <label htmlFor="validez_rol">Periodo</label>
                </span>
                <span className="p-float-label w-7rem">
                    <Dropdown inputId="dd-modulo" 
                        value={mod} onChange={(e) => setMod(e.value)} 
                        options={OPTS_MODS} 
                        optionLabel="name" optionValue='value' 
                        className="w-full" 
                    />
                    <label htmlFor="dd-modulo">Modulo</label>
                </span>
                <FileUpload 
                    ref={uploadComp} name="demo[]" 
                    // accept="xlsx/*" 
                    // onSelect={ fileSelected }
                    disabled={!canUpload || !periodo || !mod }
                    customUpload uploadHandler={customUploader}  
                    mode="basic"  maxFileSize={10000000} 
                />
                <Button 
                    label='Send' icon='pi pi-send' iconPos='left' severity='help' 
                    onClick={sendData} 
                    disabled={error[0] || !showErr || !mod.name  } 
                />
                <Button label='Limpiar' icon='pi ' severity='danger'
                    onClick={ () => {
                        uploadComp.current.clear()
                        setExcel()
                        setError([])
                        cleanStates()
                        setBool(false)
                    } } 
                />
                {/* //& --FIN     Upload          */}
            </div>

            <ShowYDeleteRoles periodo={periodo} modulo={mod?.name.slice(2)} deps={[rolesSended]} />
        </div>


        {  !bool &&
            !showErr ? <></> : errores.length == 0 
            ?
            <p className='my-6 px-3 mx-auto w-12 sm:w-max p-tag bg-green-500' style={{fontSize:'40px'}}>
                <span className='mx-2'>Todo Ok</span>
                &#128076; 
            </p> 
            :
            <>
                <Divider className='mt-6' align='center'> <span className="p-tag bg-red-500">Notas</span> </Divider>
                <div className='flex-center justify-content-end gap-2 '>
                    <span className='font-semibold' >Raw</span>
                    <InputSwitch checked={isRaw} onChange={(e) => setIsRaw(e.value)}/>
                </div>
                <div className='w-full xl:grid'>
                    <div className='inline-block xl:h-1rem xl:col-2' />
                    <div className='inline-block max-w-max xl:col-9 col-12'>
                        { errores.map( ({hoja, err}, i1) => (
                            <Wrapper  
                                legend={`Errores en ${hoja}`} 
                                key={`wp-err-${hoja}-${i1+1}`}
                                insideKey={`title-err-${hoja}-${i1+1}`}
                                className='mb-4'
                                showRaw={isRaw}
                            >
                                <ol>
                                {
                                    err.map( ({msg, desc, canNotDismiss}, i2) => (
                                            <li key={`desc-err-${hoja}-${i2+1}`} 
                                                className='my-1 ml-3 text-lg font-semibold'
                                            > 
                                                {msg}
                                                <ul className='my-1 ml-6 text-md font-normal' >
                                                    {!desc ? <></> : desc.map( (descTxt, i3) => (
                                                        <li key={`desc_item-err-${hoja}-${i3+1}`}> 
                                                            <Desc 
                                                                key={`desc_txt_item-err-${hoja}-${i3+1}`} 
                                                                text={descTxt} dismiss={!canNotDismiss} 
                                                                raw={isRaw} 
                                                            />
                                                        </li>
                                                    ) )}
                                                </ul>
                                            </li>
                                    ) )
                                }
                                </ol>
                            </Wrapper>
                        ))}
                    </div>
                    <div className='inline-block xl:h-1rem xl:col-1' />
                </div>
            </>
        }


        <LoadingDialog isVisible={isLoading || validatingData} >
            <h2> { validatingData ? 'Verificando Rol' : 'Cargando...'} </h2>
            <ProgressBar value={cont} />
        </LoadingDialog>
    </>
  )
}
