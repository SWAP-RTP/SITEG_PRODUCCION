/**
* Va dentro del FormMaker 
* Requiere de PrimeFaces
* @module FormItem
*/
import { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';

import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { InputMask } from 'primereact/inputmask';
import { Sidebar } from 'primereact/sidebar';
import { classNames } from 'primereact/utils';

/**
 * Existe solo dentro de formMaker, si se requiere usar otra libreria que no sea PrimeFaces verificar que los inputs tenga onBlur y onChange, cambiar bigInfo e info 
 * @param {*} Props { cols=3, disabled=false, selectionModeForCal="single", canSelectAll=false, inputType='inputText', options=[],  callBackForRender= true, properties={} }
 * @returns un tipo de input de PrimeFaces
 */
export const FormItem2 = ({ 
  cols=3, 
  id, 
  label, 
  info, 
  bigInfo, 
  disabled=false, 
  selectionModeForCal="single", 
  canSelectAll=false, 
  control, 
  errors, 
  validaciones, 
  inputType='inputText', 
  getValues, 
  setValue, 
  watch, 
  forOnBlur, 
  callBackForOnBlur, 
  forOnChange, 
  callBackForOnChange, 
  options=[], 
  callBackForRender= true, 
  properties={}, 
  setError, 
  resetField, 
  clearErrors 
}) => {

  const [visibleSidebar, setVisibleSidebar] = useState(false)
  const [visibleTooltip, setVisibleTooltip] = useState(false)

  const render = ((typeof callBackForRender) === 'function') ? callBackForRender(watch) : callBackForRender;

  // Si no esta en la lista entoces sera del tipo: text
  const inputTypes = ["select", "multiSelect", "calendar", 'mask']

  useEffect(() => {
     (!!info) ? setVisibleTooltip(info) : setVisibleTooltip(false)
  }, [])
  

  const getFormErrorMessage = (name) => {
    return errors[name] && <small className="p-error">{errors[name].message}</small>
  };

  const rules= { 
    // required: ` Campo Requerido *`,
    ...validaciones  
  };


  return (
  <>

    <Sidebar visible={visibleSidebar} position="top" onHide={() => setVisibleSidebar(false)}> {bigInfo} </Sidebar>

    <div className={`field col-12 md:col-${cols}`}>
      <div className="flex">
        { render && 
        <span className="p-float-label mt-3 w-full">
        <Controller name={id} control={control} defaultValue="" rules={rules} render={({ field, fieldState }) => (
        <>
          {
          (inputType === 'select' ) 
          && <>
          <Dropdown id={field.name} value={field.value} onChange={(e) => { field.onChange(e.value); forOnChange(e, setValue, getValues,callBackForOnChange) }} onBlur={() => forOnBlur( setValue, getValues, callBackForOnBlur )} options={options} optionLabel="name" disabled={disabled} className={classNames({ 'p-invalid': fieldState.error }, 'text-base text-color surface-overlay p-2 border-1 border-solid  border-round appearance-none outline-none focus:border-primary hover:border-primary w-full' )}/>
          </>
          }
          {
          (inputType === 'multiSelect' ) 
          && <>
          <MultiSelect inputId={field.name} value={field.value} onChange={(e) => { field.onChange(e.value); forOnChange(e, setValue, getValues,callBackForOnChange) }} onBlur={() => forOnBlur( setValue, getValues, callBackForOnBlur )} options={options} disabled={disabled} optionLabel="name" filter showSelectAll={canSelectAll} display="chip" className={classNames({ 'p-invalid': fieldState.error }, 'w-full text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round outline-none focus:border-primary hover:border-primary')}/>
          </>
          }
          {
            (inputType === 'calendar') 
          && <>
          <Calendar showOnFocus={false} id={field.name} value={field.value} onChange={(e) => { field.onChange(e.value); forOnChange(e, setValue, getValues,callBackForOnChange) }} onBlur={() => forOnBlur( setValue, getValues, callBackForOnBlur )} selectionMode={selectionModeForCal} disabled={disabled} mask="99/99/2099" showIcon className={classNames({ 'p-invalid': fieldState.error }, 'text-color text-base surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary hover:border-primary w-full' )} inputClassName="surface-overlay border-none"/>
          </>
          }
          {
          (inputType === 'mask' ) 
          && <>
          <InputMask id={field.name} {...field} {...properties} value={field.value} onChange={(e) => { field.onChange(e.value); forOnChange(e, setValue, getValues,callBackForOnChange) }} tooltip={visibleTooltip} tooltipOptions={{position: 'bottom'}} disabled={disabled} className={classNames({ 'p-invalid': fieldState.error }, `text-base text-color surface-overlay p-3 border-1 border-solid  border-round appearance-none outline-none focus:border-primary hover:border-primary w-full` )} />
          </>
          }

          {   // Default value de 2 inputTypes (undefined y 'text')
          (!inputTypes.includes(inputType) || inputType === 'text' ) 
          && <>
          <InputText  id={field.name} {...field} {...properties} disabled={disabled} onBlur={(e) => forOnBlur(e, setValue, getValues, callBackForOnBlur, resetField, setError, clearErrors )} tooltip={visibleTooltip} tooltipOptions={{position: 'bottom'}} className={classNames({ 'p-invalid': fieldState.error }, `text-base text-color surface-overlay p-3 border-1 border-solid  border-round appearance-none outline-none focus:border-primary hover:border-primary w-full` )}/>
          </>
          } 

          <label htmlFor={id} className={classNames({ 'p-error': fieldState.error }, "justify-content-evenly text-base" )}>{ label }</label>
        </>
        )} />
        </span>
        }

        {
        !!bigInfo
        && 
        <div className='align-self-center mt-3 ml-2' >
          <Button  className='border-round-xl' icon="pi pi-info" onClick={() => setVisibleSidebar(true)}/>
        </div>
        }
      </div>
      
      <div className="w-full"> { getFormErrorMessage(`${id}`) } </div>
    </div>
  </>
  )
}

