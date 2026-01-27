import React, { useEffect, useState } from 'react'
import { base_getSDI, conf_getSDI, getAsistencia, getDespensa } from './SDI'
import { DynamicInput, MiniFormMaker } from '../../shared/components/FormMaker/MiniFormMaker'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from 'primereact/button'
import { convertToMXN } from '../../shared/utilities/internationalization'
import { objectToArray } from '../../shared/helpers'
import { UseFetchGet } from '../../shared/helpers-HTTP'
import { rouded } from '../../shared/utilities/maths'


interface Form {
    tipo: number 
    salario_mensual: number 
    antiguedad: number

    uma: number
    dias_trabajados: number

    vales_despensa: number
    asistencia: number
    alimentos: number
    descanso_laborado: number
    festivo_laborado: number
    prima_dominical: number
    estimulo_antiguedad: number
    retroactivo: number
    dia_asueto: number
    incentivo: number
    prima_antiguedad: number
    pago_unica_vez: number
}

const hasValueIfIsBase = (value) => {
    
}
const inputsBase: DynamicInput[] = [
    { name: 'tipo', label: 'Tipo', type: 'select', options: [{name: 'Base', value: 1}, {name: 'Confianza', value: 2}]},
    { name: 'salario_mensual', label: 'Salario mensual'},
    { name: 'antiguedad', label: 'Antiguedad'},
]
const inputsComplemento: Record<string, DynamicInput> = {
    vales_despensa: { name: 'vales_despensa', label: 'Vales de despensa'},
    asistencia: { name: 'asistencia', label: 'Asistencia'},
    alimentos: { name: 'alimentos', label: 'Alimentos'},
    descanso_laborado: { name: 'descanso_laborado', label: 'Descanso laborado'},
    festivo_laborado: { name: 'festivo_laborado', label: 'Festivo laborado'},
    prima_dominical: { name: 'prima_dominical', label: 'Prima dominical'},
    estimulo_antiguedad: { name: 'estimulo_antiguedad', label: 'Estimulo antiguedad *¹'},
    retroactivo: { name: 'retroactivo', label: 'Retroactivo'},
    dia_asueto: { name: 'dia_asueto', label: 'Dia asueto'},
    incentivo: { name: 'incentivo', label: 'incentivo'},
    prima_antiguedad: { name: 'prima_antiguedad', label: 'Prima antiguedad *¹'},
    pago_unica_vez: { name: 'pago_unica_vez', label: 'Pago unica vez'},
}

export const NominaPage = () => {

    const [SDI, setSDI] = useState(0)
    const form = useForm<Form>({defaultValues: { uma: 108.57 }})
    const { formState: {errors}, control } = form

    const onSubmit = async(e: Form) => {
        const { antiguedad, salario_mensual, tipo } = e

        const sdi_anterior = 405 //! await UseFetchGet('')

        const arr = objectToArray(e)
        const data: Form = { tipo: 0, salario_mensual: 0, antiguedad: 0, uma: 0, dias_trabajados: 0, vales_despensa: 0, asistencia: 0, alimentos: 0, descanso_laborado: 0, festivo_laborado: 0, prima_dominical: 0, estimulo_antiguedad: 0, retroactivo: 0, dia_asueto: 0, incentivo: 0, prima_antiguedad: 0, pago_unica_vez: 0 }
        arr.forEach( a => data[a[0]] = Number(a[1])||0 )
        console.log(data)

        let sdi = 0
        if(tipo==2) return sdi = conf_getSDI(salario_mensual)
        else sdi = base_getSDI({ salario_mensual, antiguedad })

        console.log(sdi)

        sdi = sdi + (
        getDespensa(data.vales_despensa, data.uma, data.dias_trabajados) + 
        getAsistencia(data.asistencia, sdi_anterior, data.dias_trabajados) + 
        // getAlimentos(data.alimentos, ???) + 
        data.descanso_laborado + 
        data.festivo_laborado + 
        data.prima_dominical + 
        data.estimulo_antiguedad + 
        data.retroactivo + 
        data.dia_asueto + 
        data.incentivo + 
        data.prima_antiguedad + 
        data.pago_unica_vez
        ) /data.dias_trabajados

        console.log( 
            'vales_despensa', getDespensa(data.vales_despensa, data.uma, data.dias_trabajados), 
            'asistencia', getAsistencia(data.asistencia, sdi_anterior, data.dias_trabajados) 
        );
        console.log(sdi)
        setSDI( rouded(sdi, 2) )
    }

    const handleReset = () => {
        form.reset()
        setSDI(0)
    }

    useEffect(() => {
        // const ejemploSDI = {salario_mensual: 10954.77, antiguedad: 0}
        // console.log( base_getSDI(ejemploSDI) )

        // const ejemplo2SDI = 13109
        // console.log( conf_getSDI(ejemplo2SDI) )
    }, [])
  

    return (
    <>
        <h1 className='text-center'>SDI <span className='text-green-600'>{SDI ? convertToMXN(SDI):''}</span></h1>

        <form onSubmit={form.handleSubmit(onSubmit)} onReset={handleReset} className='mx-auto mt-5 flex-center gap-3 row-gap-5' style={{ maxWidth: '40rem' }}>
            <MiniFormMaker form={form} inputs={inputsBase.map( i => ({...i, keyfilter: 'money', rules: { required: '*Requerido' }}) )} />

            <div className='w-12' style={{ border: '1.5px dashed #0a0' }} />

            <h2 className='w-12 text-center m-0'>Calculos variables <br /><span className='text-sm font-normal relative' style={{top: '-0.5rem'}}>(Totales del bimestre)</span></h2>
            <div className='w-12 flex-center gap-3 mb-3'>
                <MiniFormMaker form={form} inputs={[{ name: 'uma', label: 'UMA', disabled: true }, {name: 'dias_trabajados', label: 'Dias efectivamente trabajados', required: true, tooltip: 'En el bimestre (dias - ausentismos - incapacidades)'}]} />
            </div>
            <MiniFormMaker form={form} inputs={Object.values(inputsComplemento).map( i => ({...i, keyfilter: 'money'}) )} />

            <div className='w-12 flex-center gap-5'>
                <Button type='submit' icon='pi pi-calculator' rounded  />
                <Button type='reset' icon='pi pi-times' rounded severity='danger' />
            </div>
        </form>
    </>
    )
}
