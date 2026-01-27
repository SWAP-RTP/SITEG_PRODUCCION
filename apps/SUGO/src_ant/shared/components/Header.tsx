import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";


// Importaciones de prime
import { Menubar } from 'primereact/menubar';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';

// import Logo_RTP_y_Movilidad_Integrada from '../../assets/Logo_RTP_y_Movilidad_Integrada.png'

import useAuthStore from '../auth/useAuthStore';
import { MenuItem } from 'primereact/menuitem';


/**
 * HeaderComponent
 * @param {array?} links array de {label: 'abc', icon: 'pi pi-check', command: () => { navigate('/abc'); }  },
*/

export const Header = ({links=undefined}:{links?: any[]}) => {

  const { user, logout } = useAuthStore()
  const { sugo12cas, sugo12cum, sugo12pru, sugo12rol, sugo12capRol } = useAuthStore( state => state.permisosSUGO )
  const navigate = useNavigate();
  
  const allMenu: MenuItem[] = []

  // carga de roles
  if(sugo12rol) allMenu.push({
    label: 'Rol',
    icon: 'pi pi-calendar',
    command: () => {
      navigate('/rol');
    }  
  })
  // cumplimiento
  if(sugo12cum) allMenu.push({
    label: 'Cumplimiento',
    icon: 'pi pi-chart-bar',
    command: () => {
      navigate('/cumplimiento');
    }  
  }) 
  // caseta
  if(sugo12cas) allMenu.push({
    label: 'Caseta',
    icon: 'pi pi-flag',
    command: () => {
      navigate('/caseta');
    }  
  }) 
  // NUEVO ROL
  if(sugo12rol) allMenu.push({
    label: 'ROL',
    icon: 'pi pi-flag',
    command: () => {
      navigate('/rolNuevo');
    }  
  }) 
  // // pruebas
  // if(sugo12pru) allMenu.push({
  //   label: 'Pruebas',
  //   icon: 'pi pi-cog',
  //   command: () => {
  //     navigate('/pruebas');
  //   }  
  // }) 
 


  const items = links || allMenu
  // [
    // {
    //   label: 'Analisis',
    //   icon: 'pi pi-chart-bar',
    //   items: [
    //     {
    //       label: 'Cumplimiento',
    //       icon: 'pi pi-chart-bar',
    //       command: () => {
    //         navigate('/cumplimiento');
    //       }  
    //     },
    //     {
    //       label: 'Pruebas',
    //       icon: 'pi pi-cog',
    //       command: () => {
    //         navigate('/pruebas');
    //       }  
    //     },
    //   ]
    // },
  // ];

  //  const start = <span className='h-1rem'><img src={Logo_RTP_y_Movilidad_Integrada} /></span>
   const end = <span className='flex align-items-center justify-content-between' > 
      <h3> {user.nombre} <span className='text-green-400' >M{user.modulo}</span> </h3>
      <Avatar icon="pi pi-user" className="mr-5 ml-2 p-avatar-primary"/>
      <Button tooltip='Cerrar Sesión' tooltipOptions={{position: 'bottom'}} icon="pi pi-sign-out" className="p-button-text p-button-lg" onClick={logout} />
    </span>
 
 
   return (
    <div>
      <Menubar className='surface-overlay mb-2' model={items} end={end} />
    </div>
  )
}


Header.propTypes = { 
  links: PropTypes.arrayOf( PropTypes.shape( 
    { 
      label: PropTypes.string,
      icon: PropTypes.string,
      command: PropTypes.func,
    }
   ) ),
 }