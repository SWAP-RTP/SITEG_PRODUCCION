import React, { useEffect, useRef, useState } from 'react'

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

import { 
    Chart as ChartJS,
    Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title 
} from 'chart.js';
import { Bar, getDatasetAtEvent, getElementAtEvent } from 'react-chartjs-2';

ChartJS.register( CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);    //Bar



type Data = { label: string, value: string|number }[] | [undefined]
type BarChartElement = {element:any, index:any, datasetIndex:any, data: any};

interface Props {
    data: Data, 
    title?: string,
    previewTitle?: string,
    legend?: string,
    colorBar?: string ,
    onCleanChart?: () => void,     // Funcion
    onClickBar?: (e:BarChartElement) => void,
}

//! (*1)    lines: 53
export const BarChartReu = ({ 
        data=[], 
        title = 'Grafica',
        previewTitle = 'Grafica',
        legend = '',    // [title]
        colorBar = '#A155B9',
        onCleanChart,     // Funcion
        onClickBar,
    }:Props) => {

    const chartRef = useRef()


    //^ Bar
    const optionsBar = {
        responsive: true,
        plugins: {
            legend: {
                // position: "top",
            },
            title: {
                display: true,
                text: legend,
            },
        },
        scales: {           //! Esto no esta factorizado
            y: {
              max: 100,
              ticks: {
                callback: value => `${value / 1} %`
              }
            },
        }
        
    };

    const dataBar = {
        labels: data.map( i => i.label ),
        datasets: [
        {
            label: 'Cumplimiento',
            data: data.map( i => i.value ),
            backgroundColor: colorBar,   // Verde
            // backgroundColor: 'rgba(99, 255, 132, 0.5)',   // Verde
        },
        ],
    };
    //^ --Fin Bar

    const handleClic = (event) => {
        // console.log('chartRef', title,  chartRef);

        //^ getDatasetAtEvent devuelve los elementos de la grafica
        // console.log('event', getDatasetAtEvent(chartRef.current, event) );
        //^ getElementAtEvent devuelve el elemento clickeado
        // console.log('event2', getElementAtEvent(chartRef.current, event) );
        
        const [element] = getElementAtEvent(chartRef.current!, event)
        if(!!element){
            
            !!onClickBar && onClickBar({...element, data: data[element.index] })
        }

    }


    const headerChart = (data.length > 0 ) ?
        <div className='w-full flex justify-content-between'>
            <h3 className='ml-3' > {title} </h3>
            { !!onCleanChart &&
                <Button icon="pi pi-trash" rounded raised severity='danger'
                // style={stl.bCheck} 
                className='mx-4 mt-2'
                onClick={ () => { onCleanChart(); } } 
                />
            }
        </div>
    :   <h3 className='ml-3 ' >{previewTitle}</h3>



return (
    <>
    <div className='flex justify-content-start sm:justify-content-center w-full overflow-x-auto  ' >
        <Card header={headerChart} className=' w-10 lg:w-11 border-bottom-2 border-200' style={{minHeight: '300px', minWidth: '500px'}} >
            
            <div className=' w-full flex justify-content-center cursor-pointer overflow-x-auto'  >
            <Bar options={optionsBar} data={dataBar} 
                className='mx-2 my-1 max-h-24rem h-auto'
                ref={chartRef}
                onClick={handleClic}
            />
            </div>
            
        </Card>
    </div>
    </>
)
}


