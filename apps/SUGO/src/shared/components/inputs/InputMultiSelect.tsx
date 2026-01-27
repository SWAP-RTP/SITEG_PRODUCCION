import { MultiSelect, MultiSelectProps } from 'primereact/multiselect';
import { ProgressSpinner } from 'primereact/progressspinner';
import { classNames } from 'primereact/utils';
import React, { useId, useEffect } from 'react'
import { Controller, FieldValues, RegisterOptions } from 'react-hook-form';



const CustomeSpinner = () => (
    <ProgressSpinner 
        className='w-2rem ml-2'
        style={{width: '25px', height: '25px'}} 
        strokeWidth="4" 
        fill="var(--surface-ground)" 
        animationDuration="1.5s" 
    />
)



interface Props extends MultiSelectProps {
    label: string,
    options,
    optionLabel?: string,
    optionValue?: string,
    disabled?: boolean,
    showClear?: boolean,
    filter?: boolean,
    name: string,
    control
    errors,
    onChange?,
    rules?: Omit<RegisterOptions<FieldValues, string>, "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"> | undefined,
    onMount?: () => void,
    onDismount?: () => void,
    isLoading?: boolean,
}

export const Input_MultiSelect = ({
    label, 
    options,
    name, 
    control, 
    errors,
    rules,
    optionLabel = "name",
    optionValue = "value",
    disabled = false,
    showClear = false,
    filter = false,
    isLoading = false,
    onChange,
    onMount,
    onDismount,
    ...rest
}: Props) => {

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
                <div id={id} className="flex flex-column w-full sm:w-auto">
                        <span className="p-float-label w-full">
                            <MultiSelect 
                                name={inputId}
                                inputId={inputId}
                                id={field.name}
                                value={field.value} 
                                onChange={(e) => {field.onChange(e.value); onChange && onChange(e.value)}} 
                                options={options} 
                                optionLabel={optionLabel}
                                optionValue={optionValue} 
                                disabled={disabled}
                                showClear={showClear && field.value} 
                                filter={filter}
                                className={ classNames( { 'p-invalid': fieldState.error }, 'w-full')}
                                pt={{ 
                                    token: { className: 'bg-green-50 text-black font-medium border-2 border-green-400 border-solid' }, 
                                    removeTokenIcon: { className: 'text-gray-500 hover:text-red-400' } 
                                }}
                                {...rest}
                            />
                            <label htmlFor={inputId}>{label}</label>
                        </span>

                        { isLoading && <CustomeSpinner/> }
                    {getFormErrorMessage(name)}
                </div>
            )}
        />
    </>
    )
}
