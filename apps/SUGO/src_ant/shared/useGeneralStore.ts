import { create } from "zustand";
import { UseFetchGet } from './helpers-HTTP';
import { useState } from "react";


interface Props {
    
}
interface Actions {

}

const initialState = {
    
}

const useGeneralStore = create<Props & Actions>()( (set, get): (Props & Actions) => ({
    ...initialState,

    // Add Actions (methods) 
}))


export default useGeneralStore