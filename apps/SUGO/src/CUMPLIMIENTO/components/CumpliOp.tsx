import React, { useState, useEffect } from 'react'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext';
import { Fieldset } from 'primereact/fieldset';
import './styles_cumpliOp.css';
import { OpCalendario, Res_Periodos } from './cumpliOp.interfaces'
import { Loading1, LoadingDialog } from '../../shared/components/Loaders'
import { UseFetchPost, UseFetchGet } from '../../shared/helpers-HTTP'
import { fixN } from '../../shared/helpers'





const apiSugoBackTS = import.meta.env.VITE_SUGO_BackTS  //Mntener abierto el archivo custom.d.ts para el error

const tradOpEstado = { L: 'Laboral', D:'Descanso' }

export const CumpliOp = () => {

    const [isLoadingChart, setIsLoadingChart] = useState(false)
    const [periodo, setPeriodo] = useState<any>();                // new Date(2023,3,3)    03 de abril del 2023
    const [periodoOpt, setPeriodoOpt] = useState<any[]>([]);
    const [cred, setCred] = useState<string>('4081, 3715, 6518');

    const [data_op, setdata_op] = useState<OpCalendario[]>([]);

    //& Setear opciones a input periodos
    useEffect(() => {
        UseFetchGet(`${apiSugoBackTS}/api/periodos`)
            .then( (res: Res_Periodos[]) => {
                const d = new Date()
                const periodoActual = res.findIndex( ({fecha_inicio, fecha_fin}) => new Date(fecha_inicio) < d && d < new Date(fecha_fin) )
                const n = (periodoActual === 0) ? 0 : 1;
                const periodosToShow = res.slice( periodoActual-n, periodoActual+2 );
                setPeriodoOpt(periodosToShow.map( obj => ({
                    ...obj, 
                    name: `${`${obj.serial}`.padStart(2, '0')} - del ${obj.fecha_inicio} al ${obj.fecha_fin}`,
                    value: {...obj}
                }) )) 
            })
            .catch( err => console.error(err) )
        .finally( () => {} )
    }, [])

    //& 
    const send = async() => {
        const data2send = { periodo, op_creds: cred.split(',').map( n => Number(n.trim())) }
        console.log(data2send);
        if( !periodo || !cred ) return console.log('Missing data')
        try {
            // // : { op_cred: any; tjtData: TarjetaData[]; calendarioRol: DiaCalOp[]; }[] 
            const data = await UseFetchPost(`${apiSugoBackTS}/api/cumpli/op`, data2send)
            // // const cumpliOp = res.map( obj => {
            // //     const { op_cred, tjtData, calendarioRol } = obj
            // //     const cump = new CumplimientoRol( tjtData, calendarioRol, periodo )
            // //     const cumpliOp = cump.getCumlimientoXcred( op_cred )
            // //     return {op_cred, ...cumpliOp};
            // // } )
            // // console.log('cumpliOp', cumpliOp);
            console.log('res', data);
            setdata_op(data)
            
        } catch (error) {
            console.error(error);
        }
    }


    return (
    <>
        <h2 className='sticky top-0 z-5 bg-white pb-2 m-0'>Cumplimiento del Operador</h2>

        <div className='flex-center justify-content-between md:justify-content-start mt-5 gap-3' >   {/* //? Formulario */}
            <span className="p-float-label">
                <Dropdown 
                    inputId="dd-periodo" 
                    value={periodo} onChange={(e) => setPeriodo(e.value)} 
                    options={periodoOpt} 
                    optionLabel="name" optionValue='value'
                    className="w-17rem" 
                />
                <label htmlFor="dd-periodo">Selecciona un Periodo</label>
            </span>

            <span className="p-float-label">
                <InputText 
                    id="cred" 
                    value={cred} onChange={(e) => setCred(e.target.value)}
                />
                <label htmlFor="cred">Credencial</label>
            </span>
            
            <Button 
                icon="pi pi-check" rounded raised
                disabled= { !1 }
                onClick={ send } 
            />
            <Button 
                icon="pi pi-trash" rounded raised severity='danger'
                disabled= { !1 }
                onClick={ () => { setPeriodo(null); setCred(''); setdata_op([]) } } 
            />
        </div>
        { isLoadingChart && <Loading1 size={40} title='' /> }    

        { data_op.length > 0 &&
            data_op.map( d => {
                const { op_cred, op_cumplimiento, op_cumplimientoXdia } = d
                const color = (op_cumplimiento<0.4) ? 'pink': (op_cumplimiento<0.55) ? 'yellow': 'green';
                return (
                <Fieldset 
                    toggleable 
                    legend={`Operador ${op_cred} tiene ${fixN(op_cumplimiento*100, 2)}%`} 
                    key={op_cred} 
                    className={`${color} p-2 my-3 red`}
                >
                    <p className='m-0 mb-4'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero harum voluptatibus, nobis labore dignissimos sint quas, repudiandae cumque id explicabo, velit error modi obcaecati suscipit! Amet odit quisquam sit eius?</p>
                    <div className="cumpli-operador">
                        {op_cumplimientoXdia.map( obj => {
                            const { dia, op_cumplimiento: op_cumplimientoXdia, cumplimiento, cumplimientoDesc } = obj
                            const isDescanso = cumplimientoDesc.op_estado === 'D';
                            let color = (op_cumplimientoXdia<0.6) ? 'pink': (op_cumplimientoXdia<0.8) ? 'yellow': 'green';
                            color = isDescanso ? 'blue': color;
                            return (
                                <p className={`${color} m-0 px-3 py-1`} key={`${op_cred}-${(dia as unknown as string)}`}>
                                    {(dia as unknown as string).split('-').reverse().join('/')} <br />
                                    {!isDescanso ? `${fixN(op_cumplimientoXdia*100, 2)}%` : ''} <br />
                                    <br />
                                    { tradOpEstado[cumplimientoDesc.op_estado] }
                                </p>
                            )
                        } )}
                    </div>
                </Fieldset>
                )
            } )
        }
    </>
    )
}

