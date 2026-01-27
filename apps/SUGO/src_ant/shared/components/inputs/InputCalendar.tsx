import React, { useEffect, useId } from 'react'
import { InputText, InputTextProps } from 'primereact/inputtext';
import { Controller, FieldValues, RegisterOptions } from 'react-hook-form';
import { Calendar, CalendarProps } from 'primereact/calendar';
import { classNames } from 'primereact/utils';
import { addLocale } from 'primereact/api';
        

interface Props extends CalendarProps {
    name: string,
    control
    errors,
    rules?: Omit<RegisterOptions<FieldValues, string>, "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"> | undefined
    label?: string 
    onChange?,
    onMount?: () => void
    onDismount?: () => void
}

addLocale('es', {
    firstDayOfWeek: 1,
    // showMonthAfterYear: true,
    dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    today: 'Hoy',
    clear: 'Limpiar'
});

export const Input_Calendar = ({
    name, 
    control, 
    errors,
    rules, 
    label, 
    disabled=false, 
    onChange,
    onMount,
    onDismount,
    ...rest
}: Props) => {

    const id = useId();

    useEffect(() => {
        !!onMount && onMount()
        
        return () => {
        !!onDismount && onDismount() 
      } 
    }, [])
    

    const getFormErrorMessage = (name) => {
        return errors[name] ? <small className="p-error">{errors[name].message}</small> : <></>
    };

    return (
    <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
            <div id={id} className='flex flex-column w-full sm:w-max'>
                <span className="p-float-label w-full lg:w-12rem">
                    <Calendar 
                        inputId={field.name} 
                        value={field.value || ''} 
                        onChange={(e) => { field.onChange(e.target.value); onChange && onChange(e.value)} } 
                        className={ classNames( 'w-full', { 'p-invalid': fieldState.error }, '')}
                        readOnlyInput
                        dateFormat="dd/mm/yy"
                        locale="es"
                        {...rest}
                    />
                    <label htmlFor={field.name}>{label}</label>
                </span>
                
                {getFormErrorMessage(name)}
            </div>
        )}
    />
    )
}