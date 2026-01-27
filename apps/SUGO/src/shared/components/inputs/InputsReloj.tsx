import React, { useEffect, useState } from 'react'
import { FieldValues, UseFormReturn, useWatch } from 'react-hook-form';
import { Input_Mask } from '.'
import { useClock } from '../../hooks';
import { dateToString } from '../../helpers';
import { Checkbox } from 'primereact/checkbox';
// import { regex_24hrs, regex_year_ddmmyyyy } from '../../helpers/regEx';
export const regex_24hrs = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
export const regex_year_ddmmyyyy = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(20[0-9]{2}|2[1-9][0-9]{2})$/;



interface Props {
    formState: UseFormReturn<any, any, undefined>,
    handleCapturaDate: (date: Date|undefined) => any
}

/**
 * NO necesita estar vinculado al formulario cuando solo se necesita la Date creada. 
 * 
 * o si para las validaciones?
 */
export const InputsReloj = ({ formState, handleCapturaDate }: Props) => {
    const { control, formState: { errors }, ...form } = formState;

    const [canEditHour, setCanEditHour] = useState(false);
    const [momentoCaptura, setMomentoCaptura] = useState<Date>();
    
    const [form_hora, form_fecha]  = useWatch({ control, name: ['time_hora', 'time_fecha']});
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

    useEffect(() => {
        handleCapturaDate(momentoCaptura);
    }, [momentoCaptura])
    


    return (
    <>
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
    </>
    )
}
