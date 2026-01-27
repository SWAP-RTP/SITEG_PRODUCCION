import { Dropdown, DropdownProps } from 'primereact/dropdown'
import { ProgressSpinner } from 'primereact/progressspinner';
import React, { useId, useEffect, useState } from 'react'
import { Controller, FieldValues, RegisterOptions, UseFormReturn } from 'react-hook-form';



const CustomeSpinner = () => (
    <ProgressSpinner 
        className='w-2rem ml-2'
        style={{width: '25px', height: '25px'}} 
        strokeWidth="4" 
        fill="var(--surface-ground)" 
        animationDuration="1.5s" 
    />
)



type Input_Select_Props<T extends FieldValues> = DropdownProps & {
    name: string,
    label: string,
    options,
    control,
    errors,
    formHook?: UseFormReturn<T, any, undefined>,
    rules?: Omit<RegisterOptions<FieldValues, string>, "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"> | undefined,
    optionLabel?: string,
    optionValue?: string,
    disabled?: boolean,
    showClear?: boolean,
    filter?: boolean,
    onMount?: () => void,
    onDismount?: () => void,
    onChange?: (value: any) => void,    // Hacer al onChange
    onChangeSetValue?: (value: any) => void,    // Transformar el valor antes de setearlo como valor del campo
    inputValue?: any,
    isLoading?: boolean,

}

// ToDo: quitar control y errors, desestructurar de form.  O dejarlo asi 
export const Input_Select = <Form extends FieldValues>({
    label, 
    options,
    name, 
    control, 
    errors,
    formHook, 
    rules,
    optionLabel = "name",
    optionValue = "value",
    disabled = false,
    showClear = false,
    filter = false,
    isLoading = false,
    className,
    onMount,
    onDismount,
    onChange,
    onChangeSetValue,
    ...rest
}: Input_Select_Props<Form>) => {

    const id = useId();
    const inputId = useId();   

    useEffect(() => {
        !!onMount && onMount()
        
        return () => {
        !!onDismount && onDismount() 
      } 
    }, [])
    

    const getFormErrorMessage = (name) => {
        return errors[name] ? <small className="p-error">{errors[name].message}</small> : <></>
    };

    
    return(
    <>
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState }) => (
                <div id={id} className={`flex flex-column estupido-dropdawn ${className}`}>
                        <div className='flex flex-row'>
                        <span className="p-float-label w-full">
                            <Dropdown
                                name={inputId}
                                inputId={inputId}
                                id={field.name}
                                value={field.value}
                                // @ts-ignore
                                onChange={(e) => {
                                    field.onChange(onChangeSetValue ? onChangeSetValue(e.value):e.value); 
                                    onChange && onChange(e.value)
                                }}
                                options={options}
                                optionLabel={optionLabel}
                                optionValue={optionValue}
                                disabled={disabled}
                                showClear={showClear && field.value} 
                                filter={filter}
                                // focusInputRef={field.ref}
                                className={ `w-full ${fieldState.error ? 'p-invalid' :''} `}
                                // style={{ minWidth: '12.4rem', maxWidth: '12.4rem'}}
                                {...rest}
                                />
                            <label htmlFor={inputId}>{label}</label>
                        </span>

                        { isLoading && <CustomeSpinner/> }
                        </div>
                    {getFormErrorMessage(name)}
                </div>
            )}
        />
    </>
    )
}


