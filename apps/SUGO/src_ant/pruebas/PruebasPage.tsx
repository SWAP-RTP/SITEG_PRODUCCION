import React from 'react'
import { TabView, TabPanel } from 'primereact/tabview';
import { Container, Header } from '../shared/components'
import { StorePage } from './ZUSTAND/StorePage';
import { Comp } from './Fetch permisos/Comp';
import { OnChangeComp } from './OnChange/OnChangeComp';
import { GetReporte } from './GetRepo/GetReporte';
import { MakePeriodos } from './makePeriodos/MakePeriodos';
import { ActualizarRutas } from './Actualizar Rutas/ActualizarRutas';
import { GetRutas } from './Actualizar Rutas/GetRutas';
import { Reloj } from './Reloj/Reloj';
import { AsignarRol, CrearUsuarios } from './SAU';
import { FetchServerPage } from './fecthServerToServer/FetchServerPage';
import { NominaPage } from './Nomina';


export const PruebasPage = () => {
  return (
    <Container>
      <Header />
      <TabView>
        <TabPanel header="SDI">
          <NominaPage />
        </TabPanel>
        <TabPanel header="Fetch 2 servers">
          <FetchServerPage />
        </TabPanel>
        <TabPanel header="Actualizar Rutas">
          <ActualizarRutas />
          <GetRutas />
        </TabPanel>
        <TabPanel header="Get Reporte Ecos">
          <GetReporte />
        </TabPanel>
        <TabPanel header="Periodos 100">
          <MakePeriodos />
        </TabPanel>
        <TabPanel header="SAU">
          <CrearUsuarios />
          <AsignarRol />
        </TabPanel>
        <TabPanel header="onChange">
          <OnChangeComp />
        </TabPanel>
        <TabPanel header="Fetch Permisos">
          <Comp />
        </TabPanel>
        <TabPanel header="Zustand">
          <StorePage />
        </TabPanel>
      </TabView>

    </Container>
  )
}
