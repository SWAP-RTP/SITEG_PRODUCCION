import React, { useEffect, useState } from 'react'
import './styles.css'
import { TabView, TabPanel } from 'primereact/tabview';
import { Container, Header } from '../shared/components'
import { MainEcosDespachoRecepciones, PVestado } from './components/ecos_despacho_recepcion';
import { PVestados } from './pv-estados'
// import { PVestados } from './components/ecos_despacho_recepcion'
import { EcosDespachoRecepcionProvider } from './context/EcosDespachoRecepcion.context';
// import { ReportesCaseta } from './components/ecos_despacho_recepcion/Reportes';
import { ReportesCaseta } from './reportes';

import { useWindowSizes } from '../shared/hooks/useWindowSizes';


export const CasetaPage = () => {

    // const [isScrollable, setIsScrollable] = useState(false)
    // const window = useWindowSizes();
    
    // useEffect(() => {
    //         const div = document.getElementsByClassName('p-tabview-nav-content')[0]
    //         const ul = document.getElementsByClassName('p-tabview-nav')[0]
    //         let w = 0
    //         for (let i = 0; i < ul.children.length-1; i++) {
    //         const e = ul.children[i];
    //         w = w+e.clientWidth
    //     }
    //     if( w>div.clientWidth ) setIsScrollable(true)
    //     else setIsScrollable(false)
    // }, window)
    
    
    return (
    <Container>
        <Header />

        <TabView>  
            {/* scrollable={isScrollable}> */}
            <TabPanel header='PV'>
                <PVestados />
            </TabPanel>
                        
            {/* <TabPanel header='Reportes'>
                <ReportesCaseta /> 
            </TabPanel> */}
           
            {/*            
            <TabPanel header='Estatus del Parque Vehicular'>
                <PVestado />
            </TabPanel>

            <TabPanel header='Despacho & Recepción'>
                <EcosDespachoRecepcionProvider>
                    <MainEcosDespachoRecepciones />
                </EcosDespachoRecepcionProvider>
            </TabPanel> 
            */}
        </TabView>
    </Container>
    )
}
