import React from 'react'
import { Control, FieldErrors, FieldValues, RegisterOptions, UseFormReturn } from 'react-hook-form';
import { Input_Select, Input_Text } from '../inputs';
import { InputTextProps } from 'primereact/inputtext';
import { DropdownProps } from 'primereact/dropdown';
import { Input_Calendar } from '../inputs/InputCalendar';
import { CalendarProps } from 'primereact/calendar';


export interface SelectOption {name: any, value: any}
export type DynamicInput = {
    name:  string;
    label: string;
    rules?: Omit<RegisterOptions<FieldValues, string>, "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"> | undefined;
    onMount?: (formHook) => void;
    onDismount?: (formHook) => void;
} & (
    | { type?: 'text', inputClassName?: string, onChangeSetValue?: (value: string) => string } & InputTextProps
    | { type:  'calendar' } & CalendarProps
    | { type:  'select', options: SelectOption[], isLoading?: boolean } & DropdownProps
)
interface Props<T extends FieldValues> {
    // control: Control<any, any>,
    // errors: FieldErrors,
    form: UseFormReturn<T, any, undefined>, 
    inputs: DynamicInput[]
}


export const MiniFormMaker = <Form extends FieldValues>({
    form, 
    inputs
}: Props<Form>) => {
    const { control, formState: { errors }, } = form

    return (
    <>
        { inputs.map( (input, index) => {
            const { name, label, rules, value, ...rest } = input

            if(input.type==='select') return (
            <Input_Select
                key={name+index}
                control={control} errors={errors} 
                name={name} label={label}  
                rules={rules}
                { ...rest as { options: {name, value}[] } & DropdownProps }
            />
            )
            else if(input.type==='calendar') return (
            <Input_Calendar
                key={name+index}
                control={control} errors={errors} 
                name={name} label={label}  
                rules={rules}
                { ...rest as CalendarProps }
            />
            )

            return (
                <Input_Text
                    key={name+index}
                    control={control} errors={errors} 
                    formHook={form}
                    name={name} label={label} 
		    inputValue={value}
                    rules={rules}
                    {...rest as {onMount?: () => void, onDismount?: () => void, inputClassName?: string } & InputTextProps}
                />
            )
        })
        }
    </>
    )
}