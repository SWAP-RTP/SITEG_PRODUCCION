import { InputMask, InputMaskProps } from 'primereact/inputmask'
import { classNames } from 'primereact/utils'
import React, { useId } from 'react'
import { Controller, FieldValues, RegisterOptions } from 'react-hook-form'
import './styles.css'

interface Props extends InputMaskProps {
    label?: string 
    mask?: string 
    helpLabel?: string, 
    disabled?: boolean,
    keyfilter?: RegExp | "int" | "pint" | "num" | "pnum" | "money" | "hex" | "alpha" | "alphanum" | "email",
    name: string,
    control
    errors,
    rules?: Omit<RegisterOptions<FieldValues, string>, "disabled" | "valueAsNumber" | 
    "valueAsDate" | "setValueAs"> | undefined
    inputClassname?: string
}

/**
 *  a is for alphabetic characters, 9 is for numeric characters and * is for alphanumberic characters, ? anything after the question mark optional
 */
export const Input_Mask = ({ 
    name, 
    control, 
    errors,
    rules, 
    label, 
    mask,
    helpLabel, 
    keyfilter,
    disabled,
    className,
    inputClassname,
    ...rest 
}: Props) => {

    const id = useId();

    const getFormErrorMessage = (name) => {
        return errors[name] ? <small className="p-error">{errors[name].message}</small> : <></>
    };


    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState }) => (
                <div id={id} className={`flex flex-column w-full sm:w-max ${className}`}>
                    <span className={ inputClassname || `p-float-label w-full lg:w-12rem`}>
                        <InputMask 
                            id={field.name} 
                            value={field.value} 
                            onChange={(e) => field.onChange(e.target.value)}
                            mask={mask}  
                            disabled={disabled}
                            keyfilter={keyfilter}
                            // className='(p-invalid) w-full'
                            className={ `w-full ${fieldState.error ? 'p-invalid' :''}  `}
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
