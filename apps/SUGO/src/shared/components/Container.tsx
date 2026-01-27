import React from 'react'


export const Container = ({ children }) => {
    return (
      
      <div className="min-h-screen h-full surface-ground layout-wrapper layout-wrapper-light flex flex-column p-3">
                  {children}
      </div>
    )
  }
  