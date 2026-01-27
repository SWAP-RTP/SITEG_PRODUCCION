import { useEffect, useState } from 'react';
import { UseFetchPost } from '../hooks/UseFetchPost';
import { CubreDescanso, ExcelRows } from '../interfaces/excelRowsInterface';
import { sumarMinutos } from './datesFuncs';
import { BodyRolV5_2, Header } from '../interfaces/excelRowsInterfaceV3';

 
export const postRows = (rows: BodyRolV5_2[], header: Header,  api: string, fechas:[Date, Date], mod: number|string=0 ) => {

    let ok: Number[]     = [];
    let errors: Array<string | Number | {reg: number, message: string}> = [];
    let totalBodyRol = 0;       // Ts detecta el tipado
    let messageRol = '';
    let messageCD = '';

    let regi:any = {}

    const { moduloClave } = JSON.parse( sessionStorage.getItem('user')! )

    //^ ------------ Obtener data de filas necesarias ------------
    const bodyRol: BodyRolV5_2[] = rows.filter( fila =>  !!Number(fila.servicio) && (Object.keys(fila).length > 2) );

    // const bodyCD = rows.filter( fila => !!fila.servicio && !Number(fila.servicio) && (fila.servicio.length == 1)  );
    // const cubreDescansos: CubreDescanso[] = bodyCD.map( fila => ({
    //         servicio: fila.servicio, 
    //         economico: fila.economico, 
    //         credenciales: fila.credenciales, 
    //         cubrirServicios: fila.descansos, 
    //     })
    // );

    
    //^ ------------ POST registros del ROL ------------
    if (bodyRol.length > 0){
        // console.log(bodyRol);
        totalBodyRol = bodyRol.length;
        bodyRol.forEach( (reg, i) => {

            // Para lugarTerminoLabores dentro de data2send
            const ter1 = (reg.lun_vie?.lugInicio2 == 'Discontinuo') ? 'Mod': null ;
            const descansos = Object.fromEntries(
                Object.entries(reg.descansos).filter(([key, value]) => value == 'D')
              );

            const data2send = {
                "validez_fechaIni": fechas[0],
                "validez_fechaFin": fechas[1],

                "idServicio": reg.servicio,
                "economico": reg.economico,
                "ruta": header.ruta,
                "servicioTipo": header.modalidad,
                // "modulo": `0${moduloClave}`,
                "modulo": `0${mod}`,
                "primerTurnoCredencial": reg.credenciales.turno1cred,
                "segundoTurnoCredencial": reg.credenciales.turno2cred ?? null,
                "tercerTurnoCredencial": reg.credenciales.turno3cred ?? null,
                "sistema": reg.sistema,
                "primerDescanso": Object.keys(descansos)[0] ?? null,
                "segundoDescanso": Object.keys(descansos)[1] ?? null,
    
                "inicioPrimerTurno":          reg.lun_vie?.hrInicio1,
                "salidaModulo":               sumarMinutos(reg.lun_vie?.hrInicio1!) ,
                "inicioCierreCircuito":       reg.lun_vie?.hrInicioCC,
                "lugarInicioServicio":        reg.lun_vie?.lugInicio1,
                "horaTerminoLabores":         reg.lun_vie?.hrTermino1,            
                "lugarTerminoLabores":        (ter1 || reg.lun_vie?.lugInicio2 || reg.lun_vie?.lugTerCC) ?? null,
    
                "inicioLaboresSegundoTurno":  reg.lun_vie?.hrInicio2 ?? null,
                "lugarInicioSegundo":         reg.lun_vie?.lugInicio2 ?? null,
                "horaTerminoSegundo":         reg.lun_vie?.hrTermino2 ?? null,   
                "lugarTerminoSegundo":        (reg.lun_vie?.lugInicio3 || reg.lun_vie?.lugTerCC) ?? null,
    
                "inicioLaboresTercerTurno":   reg.lun_vie?.hrInicio3 ?? null,
                "lugarInicioTercerTurno":     reg.lun_vie?.lugInicio3 ?? null,
                "horaTerminoTercero":         (!!reg.lun_vie?.hrInicio3) ? reg.lun_vie?.hrTerT : null,
                "lugarTerminoTercero":        (!!reg.lun_vie?.hrInicio3) ? reg.lun_vie?.lugTerCC : "null",    //! No puede ser Null Sequelize 
                "terminoModulo":              reg.lun_vie?.hrTerMod,
    
                "s_inicioPrimerTurno":          reg.sab?.s_hrInicio1,
                "s_salidaModulo":               sumarMinutos(reg.sab?.s_hrInicio1!) ,
                "s_inicioCierreCircuito":       reg.sab?.s_hrInicioCC,
                "s_lugarInicioServicio":        reg.sab?.s_lugInicio1,
                "s_horaTerminoLabores":         reg.sab?.s_hrTermino1,            
                "s_lugarTerminoLabores":        (reg.sab?.s_lugInicio2 || reg.sab?.s_lugTerCC) ?? null,
                "s_inicioLaboresSegundoTurno":  reg.sab?.s_hrInicio2 ?? null,
                "s_lugarInicioSegundo":         reg.sab?.s_lugInicio2 ?? null,
                "s_horaTerminoSegundo":         reg.sab?.s_hrTermino2 ?? null,   
                "s_lugarTerminoSegundo":        (reg.sab?.s_lugInicio3 || reg.sab?.s_lugTerCC) ?? null,
                "s_inicioLaboresTercerTurno":   reg.sab?.s_hrInicio3 ?? null,
                "s_lugarInicioTercerTurno":     reg.sab?.s_lugInicio3 ?? null,
                "s_horaTerminoTercero":         (!!reg.sab?.s_hrInicio3) ? reg.sab?.s_hrTerT : null,
                "s_lugarTerminoTercero":        (!!reg.sab?.s_hrInicio3) ? reg.sab?.s_lugTerCC : "null",    //! No puede ser Null Sequelize 
                "s_terminoModulo":              reg.sab?.s_hrTerMod,
    
                "d_inicioPrimerTurno":          reg.dom?.d_hrInicio1,
                "d_salidaModulo":               sumarMinutos(reg.dom?.d_hrInicio1!) ,
                "d_inicioCierreCircuito":       reg.dom?.d_hrInicioCC,
                "d_lugarInicioServicio":        reg.dom?.d_lugInicio1,
                "d_horaTerminoLabores":         reg.dom?.d_hrTermino1,            
                "d_lugarTerminoLabores":        (reg.dom?.d_lugInicio2 || reg.dom?.d_lugTerCC) ?? null,
                "d_inicioLaboresSegundoTurno":  reg.dom?.d_hrInicio2 ?? null,
                "d_lugarInicioSegundo":         reg.dom?.d_lugInicio2 ?? null,
                "d_horaTerminoSegundo":         reg.dom?.d_hrTermino2 ?? null,   
                "d_lugarTerminoSegundo":        (reg.dom?.d_lugInicio3 || reg.dom?.d_lugTerCC) ?? null,
                "d_inicioLaboresTercerTurno":   reg.dom?.d_hrInicio3 ?? null,
                "d_lugarInicioTercerTurno":     reg.dom?.d_lugInicio3 ?? null,
                "d_horaTerminoTercero":         (!!reg.dom?.d_hrInicio3) ? reg.dom?.d_hrTerT : null,
                "d_lugarTerminoTercero":        (!!reg.dom?.d_hrInicio3) ? reg.dom?.d_lugTerCC : "null",    //! No puede ser Null Sequelize 
                "d_terminoModulo":              reg.dom?.d_hrTerMod,
            }
            console.log('data2send', i+1, data2send);
            // UseFetchPost( api , data2send)
            //     .then( () => { ok.push(i+1); console.log('ok', i+1); } )
            //     .catch( (err) => { console.log("error en", i+1); errors.push({reg: i+1, message: err})} );

            messageRol = 'Se enviaron datos de registros de la programación de Op'
            // regi = data2send
        } )

    } else { messageRol = 'No se obtuvieron datos de registros de la programación de Op' }
    //^ --FIN  POST registros del ROL 


  return {
    ok,
    errors,
    totalBodyRol,
    messageRol,
    messageCD,

    regi
  }
}
