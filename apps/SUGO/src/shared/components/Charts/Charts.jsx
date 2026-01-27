import React from 'react'

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

import { RadialLinearScale } from 'chart.js';
import { PolarArea } from 'react-chartjs-2';

import { CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar } from 'react-chartjs-2';


ChartJS.register(ArcElement, Tooltip, Legend);    // Doughnut
ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);   //Polar
ChartJS.register( CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);    //Bar


const dataDonnut = {
  labels: ['#1', '#2', '#3', '#4', '#5', '#6'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 0.45)',
        'rgba(54, 162, 235, 0.45)',
        'rgba(255, 206, 86, 0.45)',
        'rgba(75, 192, 192, 0.45)',
        'rgba(153, 102, 255, 0.45)',
        'rgba(255, 159, 64, 0.45)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 3,
    },
  ],
};

const dataPolar = {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  datasets: [
    {
      data: [12, 19, 3, 5, 2, 3],
      label: 'Votes',
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)',
      ],
      borderWidth: 1,
    },
  ],
};

// Bar
export const optionsBar = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Chart.js Bar Chart',
    },
  },
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export const dataBar = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: labels.map(() => Math.random()*1000 ),
      backgroundColor: 'rgba(255, 99, 132, 0.5)',   // Rojo
    },
    {
      label: 'Dataset 2',
      data: labels.map(() => Math.random()*1000 ), 
      backgroundColor: 'rgba(53, 162, 235, 0.5)',   // Azul
    },
    {
      label: 'Dataset 3',
      data: labels.map(() => Math.random()*1000 ),
      backgroundColor: 'rgba(99, 255, 132, 0.5)',   // Verde
    },
  ],
};
// Bar -Fin




export const Charts = () => {
  return (
    <>
      <h2>Charts</h2>


      <div className='w-12   p-4 '>

        <h3 className='ml-8' >Gf 1</h3>
        <div className='surface-200 w-10 m-auto p-2 h-25rem border-3 border-dotted border-green-500' >
          <Doughnut data={dataDonnut} />
        </div>

        <h3 className='ml-8' >Gf 2</h3>
        <div className='surface-200 w-10 m-auto p-2 h-25rem border-3 border-dotted border-green-500' >
          <PolarArea data={dataPolar} />
        </div>

        <h3 className='ml-8' >Gf 3</h3>
        <div className='surface-200 w-10 m-auto p-2 h-25rem border-3 border-dotted border-green-500' >
          <Bar options={optionsBar} data={dataBar} />
        </div>


      </div>

    </>
  )
}
