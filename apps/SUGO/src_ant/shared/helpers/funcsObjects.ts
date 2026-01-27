import { objectToArray } from "./funcsToArrays"

type Func = (date: Date) => any
export const objectPropsDatesTo = <T extends {}>( object: T, func: Func ) => {
    const arr = objectToArray(object)
    const resp: T = {...object}

    arr.forEach( ([key, value]) => {
        if(!(resp[key] instanceof Date)) return
        resp[key] = func(value)
    })
    return resp
}