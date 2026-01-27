import React, { useEffect, useRef, useState } from 'react'
import  './styles.css';
import { Button, ButtonProps } from 'primereact/button';

import { Data2PostNewEcoState, FetchPVestados, Result } from './interfaces';
import { TablasDespachosRecepciones, TablaEcosEnRuta, TablaPVestado, PVestadosMotivos, PVestadosRutas, SalidasporDia, SalidasRutas, COLS, rowClassName } from './components';
import { FormNewEcoEstado, SubmitState } from './components/FormNewEcoEstado';

import { UseFetchGet, UseFetchPost } from '../../shared/helpers-HTTP'
import useAuthStore from '../../shared/auth/useAuthStore';
import { Dropdown } from 'primereact/dropdown';
import { EcosConSuModalidad } from './components/EcosConSuModalidad';
import { ReportesCaseta } from '../reportes';
import { Dialog } from 'primereact/dialog';
import { removeHTMLelements } from '../../shared/helpers/forHTML';
import { useForm, useWatch } from 'react-hook-form';
import { MiniFormMaker } from '../../shared/components/FormMaker/MiniFormMaker';
import { objectPropsDatesTo } from '../../shared/helpers/funcsObjects';
import { TablaCRUD } from '../../shared/components/Tabla';
// import { fakePromise } from '../../shared/utilities/fakePromise';



const API = import.meta.env.VITE_SUGO_BackTS


export const OPTS_MODS = [ 
    { name: 'OC', value: 0},
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
    0: [],  // Se añadio para cuando sea 'OC' no cause error en setPuerta
    1: [{name: 'M01', value: 'M01'}],
    2: [{name: 'Todas', value: 0}, {name: 'M02', value: 'M02'}, {name: 'CRD', value: 'CRD'}],
    3: [{name: 'M03', value: 'M03'}],
    4: [{name: 'Todas', value: 0}, {name: 'M04-Minas', value: 'M04-Minas'}, {name: 'M04-Alfa', value: 'M04-Alfa'}],
    5: [{name: 'M05', value: 'M05'}],
    6: [{name: 'Todas', value: 0}, {name: 'M06', value: 'M06'}, {name: 'M06-Anexo', value: 'M06-Anexo'}, {name: 'M06-46', value: 'M06-46'}],
    7: [{name: 'Todas', value: 0}, {name: 'M07', value: 'M07'}, {name: 'M07-Anexo', value: 'M07-Anexo'}, {name: 'M07-33', value: 'M07-33'}],
    30: [{name: 'M30', value: 'M30'}],
}
const botones: ButtonProps[] = [
    { label: 'Despachos & Recepciones' },
    { label: 'Registros Realizados' },
    { label: 'PV' },
];


export const PVestados = () => {
    const userModulo = useAuthStore( s => s.user.modulo )
    const { sugo2cas0b1, sugo2cas0b2 } = useAuthStore( s => s.permisosSUGO )

    // Panel 0 y 2
    const [panel, setPanel] = useState(1)
    const [modulo, setModulo] = useState(0)
    const [puerta, setPuerta] = useState('')
    const [showPanels, setShowPanels] = useState(true)

    useEffect(() => {
        // Cada vez que cambie modulo y sea numero, setPuerta al valor de la primera opcion     
        if(!isNaN(modulo)) setPuerta(OPTS_MODS_PUERTAS[modulo][0]?.value || '')
    }, [modulo])

    useEffect(() => {
        setShowPanels(false)
        setTimeout(() => {
            setShowPanels(true)
        }, 10)
    }, [modulo, puerta])
    


    return (
    <> 
        {  (sugo2cas0b1 || sugo2cas0b2) &&
        <div className='w-12 flex-center gap-4 h-4rem px-2 mb-4 border-round-md shadow-1 lg:justify-content-end'>
            { sugo2cas0b1 && <PVestadosMotivos/> }
            { sugo2cas0b2 && <DialogReportes />  }
        </div>
        }

        <FormNewEcoEstado handleSubmit={ onFormSubmit } />
        {/* -------------------- DIVIDER ---------------- */}
        <div className='mx-auto my-3 w-12 border-none border-top-2 border-dashed border-green-500'/>

        {/* <FormulaCalculator /> */}


        <div className='flex flex-wrap justify-content-between align-items-stretch gap-3'>
            { userModulo === 0 ?
            <div className='flex-center gap-3'>
                <span className="p-float-label mt-3 w-8rem">
                    <Dropdown inputId="modulo" value={modulo} onChange={(e) => setModulo(e.value)} options={OPTS_MODS} optionLabel="name" className="w-full" />
                    <label htmlFor="modulo">Modulo</label>
                </span>
                
                { OPTS_MODS_PUERTAS[modulo] && OPTS_MODS_PUERTAS[modulo].length > 1 &&
                <span className="p-float-label mt-3 w-8rem">
                    <Dropdown inputId="modulo_puerta" value={puerta} onChange={(e) => setPuerta(e.value)} options={OPTS_MODS_PUERTAS[modulo]} optionLabel="name" className="w-full" />
                    <label htmlFor="modulo_puerta">Puerta</label>
                </span>
                }
            </div>
            : <div className='w-1rem h-1rem' />
            }
            <div className='flex-center align-items-stretch gap-2'>
                { botones.map( (btn, i) => (
                    <Button
                        key={`pv-tablas-btn-${i+1}`} style={{width: '8rem'}} 
                        outlined={panel!=i} 
                        onClick={() => setPanel(i)} 
                        {...btn} 
                    />
                ))}
            </div>

            <div className='w-1rem h-1rem' />
        </div>

        { showPanels && panel == 0 &&
            <TablasDespachosRecepciones moduloInput={modulo} puerta={puerta} />
        }
        { showPanels && panel == 1 &&
            <TablaPVestado moduloInput={modulo} puerta={puerta} />
        }
        { showPanels && panel == 2 &&
            <TablaEcosEnRuta moduloInput={modulo} puerta={puerta} />
        }
        { !showPanels && <div className='h-30rem'/> }
    </>
    )
}


const onFormSubmit = (e: SubmitState) => {
    const { formData:d, resetForm, regPrev, regNext, form, queryClient, toast, setButtonDisabled } = e

    //& setData
    const data: Data2PostNewEcoState = {
        momento:    new Date(d.time_fecha.split('/').reverse().join('-') +' '+ d.time_hora),
        tipo:               d.regTipo,
        eco:                Number(d.eco),
        eco_tipo:           d.eco_tipo,
        eco_estatus:        d.motivo.eco_disponible ? 1:2,
        motivo_id:          d.motivo.id,
        motivo_tipo:        d.motivo.tipo,
        motivo_desc:        !!d.dynamicInputs ? JSON.stringify(d.dynamicInputs): undefined,
        modulo:             (d.regTipo===2||d.regTipo===4) ? d.modulo : undefined,
        direccion:          d.direccion,
        ruta:               d.ruta?.nombre || d.ruta,   // viene del select || del input string de Metrobus
        ruta_modalidad:     d.ruta_modalidad,
        ruta_cc:            d.other_cc || d.ruta_cc || undefined,
        op_cred:            d.op_cred,
        op_turno:           d.op_turno,
        extintor:           d.extintor2 ? `${d.extintor},${d.extintor2}`:d.extintor,
        createdBy:          d.user_cred as number, 
        createdBy_modulo:   d.modulo || d.user_modulo as number,
        modulo_puerta:      d.modulo_puerta,
        reg_previo:         (regPrev) ? {id: regPrev.id, tipo: regPrev.tipo as 1|2|3|4}:undefined,       
        reg_siguiente:      undefined,
    };
    console.log('data sended', JSON.parse(JSON.stringify(data)));
    
    // & Send data
    // setButtonDisabled(false)
    // return
    // fakePromise()
    UseFetchPost(`${API}/api/caseta/pv-estados`, data)
    .then( res => { 
        console.log('res', res);
        toast.current?.show({severity: 'success', life: 5000, summary: `Eco ${d.eco} tiene un nuevo estado!`})
        resetForm();
        // refetch some stale queries:
        queryClient.refetchQueries({ queryKey: 'pv', stale: true, active: true})
        // Focus in ecoInput
        document.getElementById('eco')?.focus(); 
    })
    .catch( err => {
      console.error(err); 
      toast.current?.show({severity: 'error', summary: `Error al registrar el eco ${d.eco}`, sticky: true})
    })
    .finally( () => setButtonDisabled(false) );
}






const botonesReportes: ButtonProps[] = [
    { label: 'Registros realizados' },
    { label: 'Despacho & Recepcion' },
    { label: 'Extintores' },
    { label: 'Economicos' },
    { label: 'Rutas SWAP' },
    { label: 'Salidas por Día' },
    { label: 'Salidas por Ruta' },
]


const DialogReportes = () => {
    const [visible, setVisible] = useState(false)
    const [panel, setPanel] = useState(0)

    const paneles = [
        <></>,
        <ReportePVestados />,
        <ReportesCaseta buses />,
        <ReportesCaseta extintores />,
        <EcosConSuModalidad />,
        <PVestadosRutas />,
        <SalidasporDia />,
        <SalidasRutas />
    ]

    // Eliminar elemento "clearFilter" de las tablas creadas con <tablaCRUD>
    useEffect(() => {
        setTimeout(() => {
            panel && removeHTMLelements('#reporte-panel', '.p-column-filter-clear-button')
        }, 200);
    }, [panel])

    return (
        <div className="card flex justify-content-center">
            <Button label="Reportes" severity='secondary' onClick={() => setVisible(true)} />
            {/* <Dialog header="Header" visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)}> */}
            <Dialog id='caseta-dialog-reportes' modal maximizable  position='right' visible={visible} header='' onHide={() => setVisible(false)} style={{ minWidth: '50rem', width: '50vw', height: '60vh' }} pt={{ footer: { className: 'p-2' }}}>
                <h1 className='m-0 text-center mb-6'>Reportes sobre el PV</h1>

                <div className='flex-center align-items-stretch gap-2  max-w-26rem mx-auto'>
                    { botonesReportes.map( (btn, i) => (
                        <Button
                            key={`pv-tablas-btn-${i+1}`} style={{width: '8rem'}} 
                            outlined={panel != i+1} 
                            onClick={() => setPanel(i+1)} 
                            {...btn} 
                        />
                    ))}
                </div>

                <div className='my-3 mx-auto w-12' style={{borderBottom: '2px solid #7BC179' }} />

                <div id='reporte-panel'>
                    { paneles[panel] }
                </div>

            </Dialog>
        </div>
    )
}


interface TableState {
    data:    Result[]
    loading: boolean
    error:   string
    show:    boolean
}
interface Form {
    eco:        number
    fecha_ini:  Date
    fecha_fin:  Date
}

const ReportePVestados = () => {
    const userModulo = useAuthStore(s => s.user.modulo)
    const [table, setTable] = useState<TableState>({
        data: [],
        loading: false,
        error: '',
        show: false
    })
    const form = useForm<Form>()
    const fechas = useWatch({ control: form.control, name: ['fecha_ini', 'fecha_fin'] })

    const onSubmit = async(d: Form) => {
        const { fecha_ini: fecha_ini_raw , fecha_fin: fecha_fin_raw } = d
        fecha_ini_raw ?  fecha_fin_raw.setHours( 0,0,0,0 ) : undefined
        fecha_fin_raw ?  fecha_fin_raw.setHours( 23,59,59,999 ) : undefined
        const data = objectPropsDatesTo( d, date => date.toISOString() )
        console.log(data);
        let fecha_ini = data.fecha_ini as unknown as string
        let fecha_fin = data.fecha_fin as unknown as string
        if(!fecha_ini){
            const date = new Date()
            date.setDate(1); date.setHours( 0,0,0,0 )
            fecha_ini = date.toISOString()
        }
        if(!fecha_fin){
            const date = new Date()
            date.setMonth( date.getMonth()+1)
            date.setDate(0); date.setHours( 23,59,59,999 )
            fecha_fin = date.toISOString()
        }
        let query = `eco=${data.eco}&fecha_ini=${fecha_ini}&fecha_fin=${fecha_fin}&estatus=all`

        // console.log('query', query)

        try {
            const resp: FetchPVestados = await UseFetchGet(`${API}/api/caseta/pv-estados?create_modulo=${userModulo}&${query}`)
            // console.log('resp', resp)
            setTable({
                data: resp.results.map( reg => ({
                    ...reg, 
                    estatus: ['ELIMINADO', 'ACTUAL', 'PREVIO'][reg.estatus],
                    eco_estatus: {1: 'DISPONIBLE', 2: 'NO DISPONIBLE'}[reg.eco_estatus] as any,
                    eco_tipo_desc: ['-', 'PLANTA', 'POSTURA'][reg.eco_tipo||0] as any,  
                    // Solo muestra "(no disponible)" si origen está vacío/nulo/undefined
                    origen: !reg.origen ? '(no disponible)' : reg.origen,
                    momento: new Date(reg.momento).toLocaleString()
                })),
                loading: false,
                error: '',
                show: true
            })
        } catch (error) {
            console.error(error)
            setTable({
                data: [],
                loading: false,
                error: error,
                show: false
            })
        }
    }

    useEffect(() => {
        ( (fechas[0] && !fechas[1]) || fechas[0] > fechas[1] ) &&  form.setValue('fecha_fin', fechas[0])
    }, [ fechas[0] ])
    

    return (
    <>
        <h3 className='text-center '>Registros realizados por economico</h3>
        <form onSubmit={form.handleSubmit( onSubmit )} className='flex-center gap-3 mt-5'>
            <MiniFormMaker 
                form={form}
                inputs={[ 
                    // {name: 'modulo', label: 'Modulo', type: 'select', options: OPTS_MODS},
                    {name: 'eco', label: 'Eco*', keyfilter: 'money', required: true },
                    {name: 'fecha_ini', label: 'Fecha inicial', type: 'calendar', tooltip: 'Mayor al 25 de Marzo de 2024', tooltipOptions: {position: 'bottom'}, minDate: new Date("2024-03-25T06:00:00.000Z"), showButtonBar: true},
                    {name: 'fecha_fin', label: 'Fecha final',   type: 'calendar', tooltip: 'Mayor al 25 de Marzo de 2024', tooltipOptions: {position: 'bottom'}, minDate: new Date("2024-03-25T06:00:00.000Z"), showButtonBar: true},
                ]}
            />

            <div className='w-12 flex-center'>
                <Button type='submit' label='Buscar' icon='pi pi-search' rounded />
            </div>
        </form>

        { table.show ?
            !table.error ?
                <TablaCRUD 
                    data={table.data} cols={COLS} 
                    accion={false}
                    className='my-5'
                    multiSortMeta={ [{field: 'id', order: -1}] }
                    dataTableProps={{ rowClassName, resizableColumns: false, loading: table.loading }} 
                />
                : <h3 className='bg-pink-100 py-2 text-center capitalize'>{table.error}</h3>
            :<></>
        }
    </>
    )
}





const FormulaCalculator = () => {
  const [sueldo, setSueldo] = useState('0');
  const [dias, setDias] = useState('1');
  const [formula, setFormula] = useState('');
  const [result, setResult] = useState('');

  const v = {
    x: 5,
    y: 10,
    z: 15
  };

    const x = 5;
    const y = 10;
    const z = 15;
    const SUELDO_DIARIO = 320;
    const DIAS = 14
    const IMPUESTO = 0.16;
    const GET_SUELDO = 'SUELDO_DIARIO*DIAS*(1-IMPUESTO)';

  const handleChange = (event) => {
    setFormula(event.target.value);
  };
  const handleChangeSueldo = (event) => {
    setSueldo(event.target.value);
  };
  const handleChangeDias = (event) => {
    setDias(event.target.value);
  };

  const calculateFormula = () => {
    try {
      const calculatedResult = eval(formula);
    //   const calculatedResult = eval(GET_SUELDO);
      setResult(`$${calculatedResult}`);
    } catch (error) {
      setResult('Error al calcular la fórmula');
    }
  };

  return (
    <div className='flex-center max-w-16rem'>
        <div>
            <span>Dias: </span>
            <input type="text" value={dias} onChange={handleChangeDias} />
        </div>
        <div>
            <span>Sueldo: </span>
            <input type="text" value={sueldo} onChange={handleChangeSueldo} />
        </div>
        <div className='mt-4'>
            <span>Formula: </span>
            <input type="text" value={formula} onChange={handleChange} />
        </div>
      <button onClick={calculateFormula}>Calcular</button>
      <p>Resultado: {result}</p>
    </div>
  );
};