import React, { useEffect, useId } from 'react'
import { InputText, InputTextProps } from 'primereact/inputtext';
import { Controller, FieldValues, RegisterOptions, UseFormReturn } from 'react-hook-form';
        

export type Input_Text_Props<T extends FieldValues> = InputTextProps & {
    name: string,
    control
    errors,
    formHook?: UseFormReturn<T, any, undefined>,
    rules?: Omit<RegisterOptions<FieldValues, string>, "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"> | undefined
    label?: string 
    onMount?: (formHook) => void
    onDismount?: (formHook) => void
    onChange?: (value: any) => void,    // Hacer al onChange
    onChangeSetValue?: (value: string) => string    // Transformar el valor antes de setearlo como valor del campo
    inputValue?: string
    inputClassName?
}

// ToDo: quitar control y errors, desestructurar de form.  O dejarlo asi 
export const Input_Text = <Form extends FieldValues>({
    name, 
    control, 
    errors,
    formHook, 
    rules, 
    label, 
    disabled=false, 
    keyfilter,
    onMount,
    onDismount,
    onChange,
    onChangeSetValue, 
    className='',
    inputValue, 
    inputClassName='',
    ...rest
}: Input_Text_Props<Form>) => {

    const id = useId();

    useEffect(() => {
        inputValue ? formHook?.setValue(name as any, inputValue as any): undefined
        !!onMount && onMount(formHook)
        
        return () => {
        !!onDismount && onDismount(formHook) 
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
                <span className={inputClassName || `p-float-label w-full`}>
                    <InputText 
                        id={field.name} 
                        value={field.value || ''} 
                        onChange={(e) => { 
                            field.onChange( onChangeSetValue ? onChangeSetValue(e.target.value):e.target.value ); 
                            onChange && onChange(e.target.value)
                        }} 
                        disabled={disabled}
                        keyfilter={keyfilter}
                        className={ `w-full ${fieldState.error ? 'p-invalid' :''} ${className}`}
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