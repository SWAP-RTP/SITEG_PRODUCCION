import React, {useState, useEffect} from 'react'
import { Button } from 'primereact/button';
import { useShallow } from 'zustand/react/shallow'
import useStore, { dec, setMeal, useMeals } from './useStore';

export const StorePage = () => {
  const { count, name, setName, inc, reset } = useStore();
  
  return (
    <>
      { !!name &&
        <h2>Name {name}</h2>
      }
      <h2>ZustandPage {count}</h2>
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
      <Button label='inc' onClick={inc} />
      <Button label='dec' onClick={dec} className='mx-4'/>
      <Button label='change name' onClick={() => setName('David')} />
      <Button label='Clean' onClick={() => setName('')} className='mx-4'/>
      <Button label='reset' onClick={reset} />
      <BearNames />
      <Button label='Change meal' onClick={() => setMeal()} className='mx-4'/>

    </>
  )
}

const BearNames = () => {
  // const names = useMeals((state) => Object.keys(state)); 
  const names = useMeals(useShallow((state) => Object.keys(state))); 
  useEffect(() => {
    console.log('re render');

  }, [names])
  

  return <>
    {names.join(', ')}
  </>
}