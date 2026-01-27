import React, { useContext, useEffect, useState } from 'react'
import { Accordion, AccordionTab } from 'primereact/accordion';
import { DespachoBuses } from './DespachoBuses';
import { RecepcionBuses } from './RecepcionBuses';
import { ReportesCaseta } from './Reportes';
import { EstadoParqueVehicularResumen } from './EstadoParqueVehicularResumen';
import { TablasEdoBuses } from './TablaEdoBuses';
import useAuthStore from '../../../shared/auth/useAuthStore';
import { GeneralContext } from '../../../shared/GeneralContext';
import { Dropdown } from 'primereact/dropdown';
import { EcosDespachoRecepcionContext } from '../../context/EcosDespachoRecepcion.context';



const hr = new Date()
const hrBase = new Date()
hrBase.setHours( 11, 0 )

export const MainEcosDespachoRecepciones = () => {
    const { modulo } = useAuthStore( store => store.user );


  return (
  <>
    <div className='flex-center gap-4 md:flex-row-reverse' >
        <Accordion 
          id='caseta-despacho-ecos-accordion'
        //   activeIndex={ (hr<=hrBase) ? 1 : 3 } 
          activeIndex={2}
          multiple={false} 
          className='w-12 md:w-8'
        >
            <AccordionTab header='Despacho' headerClassName='accordion-tab-header-despacho' >
                <Info />
                <DespachoBuses />
            </AccordionTab>
            <AccordionTab header='Recepción'  headerClassName='accordion-tab-header-recepcion'>
                <Info/>
                <RecepcionBuses />
            </AccordionTab>
            { modulo === 0 &&
            <AccordionTab header='Reportes'>
                <ReportesCaseta />
            </AccordionTab>
            }
        </Accordion>
        
        <EstadoParqueVehicularResumen />
    </div>

    { modulo === 0 &&
        <SelectModulo />
    }

    <TablasEdoBuses />
  </>
  )
}


const mensajes = [
  'Puedes usar la tecla Tab para desplazarte por los diferentes campos del formulario',
  'En algunos campos, como “Ruta” y “CC”, puedes escribir parte del nombre para filtrar las opciones',
]
const Info = () => {
    //style={{ listStyle: 'none' }}>
    return (
    <ul className='px-0 m-0 mb-6' style={{ listStyle: 'none' }} >  
        { 
            mensajes.map( (m, i) => <li key={`info-li-${i}`} className='mt-2'>- {m}</li> )
        }
        
    </ul>
    )
}


const SelectModulo = () => {
    const { OPTS_MODS } = useContext(GeneralContext);
    const { mod, setMod } = useContext(EcosDespachoRecepcionContext);

    return (
        <span className="p-float-label p-fluid">
            <Dropdown
                name={'tables_select_modulo'} inputId='tables_select_mod'
                value={mod} onChange={(e) => { setMod(e.value); }}
                options={OPTS_MODS}
                optionLabel='name' optionValue='value'
                filter={true}
                className='max-w-6rem mt-5 ml-2'
            />
            <label htmlFor={'tables_select_mod'}>Modulo</label>
        </span>    
    )
}
