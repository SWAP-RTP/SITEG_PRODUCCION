import { useEffect } from "react"
import { Control, useWatch } from "react-hook-form"


interface Options<T extends Object> {
    onChange: (value: any) => void
    control: Control<T, any>
}

export const useFormInputValueChange = <T extends Object>(input: string, opt: Options<T>) => {
    const { control, onChange } = opt

    const inputValue = useWatch({ control, name: (input as any) })
    useEffect(() => {
        onChange(inputValue)
    }, [inputValue])
    
    return {
        
    }
}
