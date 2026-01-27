import { UseFetchGet } from "../../../shared/helpers-HTTP"


const API = import.meta.env.VITE_SUGO_BackTS


type Params = {
    getNext?: boolean
} & (
    | { eco: number, momento?: Date} 
    // | { id: number } 
)

export const getPrevOrNextReg = ({
    eco, 
    momento = new Date(), 
    getNext = false
}: Params) => {

    return UseFetchGet(`${API}/api/caseta/pv-estados?eco=${eco}&${getNext? 'fecha_ini':'fecha_fin'}=${ momento || new Date()}&limit=1${getNext? '&order=ASC':''}`)
}