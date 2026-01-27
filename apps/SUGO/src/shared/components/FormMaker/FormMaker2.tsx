/**
* Requiere el formItem
* // @module FormMaker
*/
import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { useForm } from "react-hook-form";
import { FormItem2 } from "./FormItem";
import PropTypes from 'prop-types';


interface Props {
    inputs:                 any[],
    setSubmitObj?:           (data: any) => void,
    getAndsetValues?:        (obj:{setValue: any, getValues: any}) => void,
    deps4getAndsetValues?:   any[],
    callBackForSubmit?:      (obj: {data: any, reset: () => void}) => void,
    newProps?:               {key: 'string', prop: any}[],
    defaultValues?:          {[key:string]: any},
    forButton?:              { label: string, estilo:'danger ó success ó...', icon:'', iconPosicion:'left'|'right', posicion: 'text-center'|'text-left' },
    boton2?:                 { label: string, estilo:'danger ó success ó...', icon:'', iconPosicion:'left'|'right', onClick: () => void },
}

/**
 * Se puede crear gran variedad de formularios con ayuda de un array de objetos con propiedades que crearán inputs especificos 
 * @function functionalComponent FormMaker
 * @param {array<object>} inputs * array creado en un helper y se envia por Props al formMaker
 * @param {setValue} setSubmitObj espera el Set de un useState, setea un estado al objeto generado por el submit 
 * @param {Function} callBackForSubmit * funcion que se ejecuta al hacer submit, es opcional, envia como atributos {data, reset} (desestructurar el obj)
 * @param {Function} getAndsetValues funcion ...
 * @param {array} deps4getAndsetValues Para useEffect que contiene getAndsetValues  ...
 * @param {array<{key: string, prop}>} newProps cada objeto debe ser {key: 'string', prop: any}
 * @param {object} defaultValues la Key de cada propiedad debe coincidir con el id del input para colocar ahi el Value
 * @param {object} forButton Boton para hacer submit, valor predeterminado: { label:"Guardar", posicion: 'text-center', estilo:'', icon:"pi pi-check", iconPosicion:"left" } ; el objeto enviado solo debe tener lo que se desea modificar
 * @param {object} boton2 Boton secundario, requiere { label:"", estilo:'danger ó success ó...', icon:"", iconPosicion:"", onClick: metodo }
 * @returns un formulario con 1 boton (submit)
 */
export const FormMaker = ( { 
    inputs, 
    setSubmitObj=undefined, 
    getAndsetValues=undefined, 
    deps4getAndsetValues=[], 
    callBackForSubmit=undefined, 
    newProps=[], 
    defaultValues={}, 
    forButton, 
    boton2 
}: Props) => {

  // Customizacion del botón, si es que es pasado un objeto, con ayuda de PrimeFaces se ajusta la posición del boton (left, center, right)
  const [boton, setBoton] = useState( { label:"Guardar", posicion: 'text-center', estilo:'', icon:"pi pi-check", iconPosicion:"left" } )
  useEffect(() => {
    if ( forButton ){
      Boolean(forButton.posicion) && ( forButton.posicion = `${forButton.posicion}` );
      setBoton( (botonDefault) => ({...botonDefault, ...forButton}) )
    } 
  }, [])  

  // variables usadas en myHandleSubmit
  let calendars = [];
  let selects = [];
  let unReginputs = []; // Inputs a quitar del submit.

  const { handleSubmit, control, formState:{errors}, setValue, getValues, reset, watch, resetField, setError, clearErrors } = useForm({defaultValues:defaultValues})

  // Tener las funciones  setValue y getValues fuera del componente
  useEffect(() => {
    !!getAndsetValues && getAndsetValues({setValue, getValues})
    
  }, [...deps4getAndsetValues])
  

   //Funcion para convertir fecha(s) de formato ISO a formato YYYY-MM-DD
  const convertDate = (inputDate) => {  
    //si es un array con varias fechas, ajusta cada una y devuelvelas en un array
    if( inputDate.length > 1 ){    
      inputDate.map( (fecha) => {
        let date, month, year;
        date = fecha.getDate();
        month = fecha.getMonth() + 1;
        year = fecha.getFullYear();
        date = date.toString().padStart(2, '0');
        month = month.toString().padStart(2, '0');
        inputDate.push( `${year}/${month}/${date}` ) // todo Cambiar el modo de fecha
      } )

      const dateArray = inputDate.slice(inputDate.length/2);
      return dateArray;
    }
    //si solo es una fecha, ajustala
    let date, month, year;
    date = inputDate.getDate();
    month = inputDate.getMonth() + 1;
    year = inputDate.getFullYear();
      date = date.toString().padStart(2, '0');
      month = month.toString().padStart(2, '0');
    return `${date}/${month}/${year}`;
  }

  //^Las funciones forOnBlur y forOnChange reciben sus parametros en ese orden. Esto porque en principio no se volverá a tocar el codigo del formMaker
  //Funcion que espera un CallBack (metodo en los inputs del Helper) para ejecutarlo al onBlur de los inputs
  const forOnBlur = (e,setValue, getValues, callBackForOnBlur: any='', resetField, setError, clearErrors) => {
    if ( Boolean(callBackForOnBlur) ){
      callBackForOnBlur( {e,setValue, getValues, resetField, setError, clearErrors} )
      return 
    }
  }
  //Funcion que espera un CallBack (metodo en los inputs del Helper) para ejecutarlo al onChange de los inputs
  const forOnChange = (e, setValue, getValues, callBackForOnChange: any='') => {
    if ( Boolean(callBackForOnChange) ){
      callBackForOnChange( {e, setValue, getValues} )
      return 
    }
  }

  const myHandleSubmit = (data) => {
    //Convertir todos los inputType == calendar al formato de fecha solicitado
    calendars.map( (id) => {
      data[id] = convertDate(data[id])
      return data
    } )

    //De todos los inputType == selects su valor sea el del code
    selects.map( (id) => {
      data[id] = (data[id].code)
      return data
    } )

    //Eliminar los unregister Inputs
    unReginputs.map( (id) => {
      delete data[id];
      return data
    } )

    //Añadir registros que no sean Inputs
    newProps.map( (newProp) => {
      data[newProp.key] = newProp.prop ;
      return data
    } )
    //Si existe, setear el estado fuera de este componente al valor de la da
    setSubmitObj && setSubmitObj(data)
    callBackForSubmit && callBackForSubmit({data, reset})
    //Si existe, realizar la función que esta fuera del componente. Se envia la data del formulario y la func reset para resetear el form cuando se desee
    
  }

  const onClicB2 = () => {
    boton2?.onClick()
  }

  return (
    <>
        <form onSubmit={handleSubmit(myHandleSubmit)} className={ `${boton.flex} ` } >
            <div className="card formgrid grid my-2 w-full">
            {
            inputs.map( (input, i) => {
                //si tiene value setealo, esta buggeado
                Boolean(input.value ) && setValue(`${input.id}`, `${input.value}`);
                //Segun la coincidencia de cada input, agregarlo a una lista 
                Boolean(input.unregister ) && unReginputs.push(input.id);
                (input.inputType === 'calendar' ) && calendars.push(input.id); 
                (input.inputType === 'select' ) && selects.push(input.id);  
                            


                return(
                <FormItem2 key={i} cols={input.cols} id={input.id} label={input.label} value={input.value} info={input.info} bigInfo={input.bigInfo} canSelectAll={input.canSelectAll} callBackForOnBlur={input.callBackForOnBlur} validaciones={input.validaciones} disabled={input.disabled} selectionModeForCal={input.selectionModeForCal} inputType={input.inputType} options={input.optionsforSelect}  control={control} errors={errors} setValue={setValue} getValues={getValues} watch={watch}  forOnBlur={forOnBlur} callBackForOnChange={input.callBackForOnChange} callBackForRender={input.callBackForRender} forOnChange={forOnChange} properties={input.properties} clearErrors={clearErrors} setError={setError} resetField={resetField}   />
                )
            })
            }
            </div>
        <div className={`${boton.posicion} my-5 ${ Boolean(boton2) && 'flex flex-wrap justify-content-center '} `}>
          <Button 
            label={boton.label} icon={boton.icon} iconPos={boton.iconPosicion} 
            className={`p-button-${boton.estilo} hover:border-green-400 hover:bg-green-200 focus:border-green-400 focus:bg-green-200 `} 
            onClick={handleSubmit(myHandleSubmit)} 
          />
          {
            Boolean(boton2)
             && <Button label={boton2.label} icon={boton2.icon} iconPos={boton2.iconPosicion} className={`ml-8 p-button-${Boolean(boton2.estilo) ? boton2.estilo: ''}`} onClick={onClicB2} />
          }
        </div>
        </form>
        
    </>
  )
}

// FormMaker.propTypes = { 
//   inputs: PropTypes.arrayOf( PropTypes.shape( 
//     { 
//       cols: PropTypes.number,
//       disabled: PropTypes.bool,
//       selectionModeForCal: PropTypes.oneOf( ['single', 'multiple', 'range'] ),
//       canSelectAll: PropTypes.bool,
//       inputType: PropTypes.oneOf( ['inputText', "select", "multiSelect", "calendar", "mask"] ),
//       options: PropTypes.array,
//       callBackForRender: PropTypes.bool,
//       properties: PropTypes.object
//     }
//    ) ),
//   setSubmitObj: PropTypes.func,
//   callBackForSubmit: PropTypes.func,
//   getAndsetValues: PropTypes.func,
//   deps4getAndsetValues: PropTypes.array,
//   newProps: PropTypes.arrayOf( PropTypes.shape( {key: PropTypes.string, prop: PropTypes.any} ) ),
//   defaultValues: PropTypes.shape({id: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]) }),
//   forButton: PropTypes.object,
//   button2: PropTypes.object
// }