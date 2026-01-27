import React, { useState } from 'react'

import { Dialog } from 'primereact/dialog';
import { Loading1 } from './Loading1';
        

interface Props {
    isVisible: boolean;
    handleCross?: () => void,
    title?: string,
    titleLoading?: string,
    sizeLoading?: number,
    children?: JSX.Element | JSX.Element[]
}

export const LoadingDialog = ( { 
    isVisible, 
    handleCross,
    title = '',
    titleLoading = 'Cargando...', 
    sizeLoading = 100, 
    children
}:Props ) => {

    const func = !!handleCross ? handleCross : () => { console.log('clic cross'); };

    return (
        <div className="card flex justify-content-center">
            <Dialog header={title} 
                visible={isVisible} 
                onHide={func}
                style={{ width: '50vw' }} 
            >
                <Loading1 title={titleLoading} size={sizeLoading}/>
                {children}
            </Dialog>
        </div>
    )
}
