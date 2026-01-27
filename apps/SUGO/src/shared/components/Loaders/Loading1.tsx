import React from 'react'
// import PropTypes from 'prop-types';
import { ProgressSpinner } from 'primereact/progressspinner';
        
/**
 * Loading spinner
 * @param {string | undefined} title
 * @param {number | undefined} size Tamaño del spinner en px [100]
 * @param {number | undefined} strokeWidth Ancho de linea del spinner 1-10 [5]
*/
// @returns Componente "loader"
export const Loading1 = ({
    title='Cargando...',
    size= 100,
    strokeWidth= 5,
    classname = '',
    style = {},
    fill='surface-ground'
}) => {
  return (
    <div className="text-center">
        { !!title &&
            <h2> {title} </h2>
        }
        <ProgressSpinner style={{width: `${size}px`, height: `${size}px`, ...style }} className={classname} strokeWidth={`${strokeWidth}`} fill={`var(--${fill})`} />

    </div>
  )
}


// Loading1.propTypes = { 
//   title: PropTypes.string,
//   size: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
//   strokeWidth: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
// }