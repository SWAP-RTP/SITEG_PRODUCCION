import { useQuery } from "react-query";
import { dateToString, hrDateToString, sumarHora, sumarMinutos } from "../../../shared/helpers"
import { UseFetchGet } from "../../../shared/helpers-HTTP";
import { exportTablePDF, getPageSizesPDF, makeHeaderColsForTablePDF } from "../../../pruebas/GetRepo/helper";
import { EcosDespachadosConRecepcion } from "../../interfaces/EcoInOut";
import { FetchPVestados, Result } from "../../pv-estados/interfaces";



interface Params {
    dates: Date[], 
    modulo: number
}

export interface EcosBitacora {
    id:             number;
    modulo_id:      number;
    eco:            number;
    op_cred:        number;
    modulo_time:    Date;
    turno:          number;
    extintor:       string;
    ruta_swap:      string;
    ruta_modalidad: string;
    ruta_cc:        string;
    motivo:         string;
    motivo_desc:    string | null;
    tipo:           number;
    estatus:        number;
    eco_tipo:       number | null;
    cap_time:       Date;
    cap_user:       number;
    registro_id:    number | null;
}



const API = import.meta.env.VITE_SUGO_BackTS



const colsExtintores = [
    {header: '#',           field: 'id'},
    {header: 'Extintor',    field: 'extintor'},
    {header: 'Salida',      field: 'time_out', cellDef: { styles: { lineWidth: { top: 0.25, right: 0.25, bottom: 0.25, left: 1/2 }}}},
    {header: 'Capturó',     field: 'cap_out'},
    {header: 'Eco',         field: 'eco_out'},
    {header: 'Operador',    field: 'op_cred_out'},
    {header: 'Regreso',     field: 'time_in', cellDef: { styles: { lineWidth: { top: 0.25, right: 0.25, bottom: 0.25, left: 1/2 }}}},
    {header: 'Capturó',     field: 'cap_in'},
    {header: 'Eco',         field: 'eco_in'},
    {header: 'Operador',    field: 'op_cred_in', cellDef: { styles: { lineWidth: { top: 0.25, right: 1/2, bottom: 0.25, left: 0.25 }}}},
]

const convertDate = (date) => {
    if( !date ) return ''
    const d = new Date(date)
    const fecha = dateToString(d)
    const hr = hrDateToString(d)
    // return `${hr}`
    return `${fecha} ${hr}`     //^? dejar fecha o solo hora
}

const invertirFecha = (str: string, symbol='/') => {
    return str.split(symbol).reverse().join(symbol)
}


export const getReporteExtintores = async(params: Params) => {
    const { dates, modulo } = params;
    if( !dates[0] ) throw Error( `Hace falta aunque sea 1 fecha. dates = [${dates}]` );
    //& Convertir fechas en strings
    const fechaIni = dateToString(dates[0], true);
    const fechaFin = dates[1] ? dateToString( sumarHora(dates[1], {hrs: 25}), true) : dateToString( sumarHora(dates[0], {hrs: 25}), true);
    const pdfFechaLabel = dates[1] ? 
        `Fechas: ${invertirFecha(fechaIni)} - ${invertirFecha(fechaFin)}`
    : `Fecha: ${invertirFecha(fechaIni)}`;

    //& Get data (Realizar consulta)
    let res: Result[] = []
    try {
        const respuesta: FetchPVestados = await UseFetchGet(`${API}/api/caseta/pv-estados?fecha_ini=${fechaIni}&fecha_fin=${fechaFin}&create_modulo=${modulo}&tipo=1&complemento=true&limit=false`)
        res = respuesta.results;
    } catch (error) {
        console.error('getReporteExtintores fail fetch');
        throw Error(error)
    }

    //? Ajustar data
    const data = res.map( (despacho, i) => {
        const recepcion = despacho.complemento
        return {
            id:          i+1,
            extintor:    despacho.extintor || 'Sin extintor',
            // // time_out:    convertDate(despacho.modulo_time),
            time_out:    convertDate(despacho.momento),
            // // cap_out:     despacho.cap_user,
            cap_out:     despacho.createdBy,
            eco_out:     despacho.eco,
            op_cred_out: despacho.op_cred,
            time_in:     convertDate(recepcion?.momento),
            // // cap_in:      recepcion?.cap_user,
            cap_in:      recepcion?.createdBy,
            eco_in:      recepcion?.eco,
            op_cred_in:  recepcion?.op_cred,
        }
    });

    //& Generar PDF
    const makePDF = (dataTable) =>{
        // const { bloburl } = exportTablePDF( data, colsExtintores, { 
        const { bloburl } = exportTablePDF( dataTable, colsExtintores, { 
            autoSave: false,
            header: { 
                dynamicContent(pdf) {
                    const { widthCenter, width } = getPageSizesPDF(pdf)
                    pdf.setFontSize(18);
                    pdf.text(`CONTROL DE ENTREGA Y RECEPCION DE EXTINTORES DE MODULO ${modulo}`, 
                        widthCenter, 35, 
                        { align: 'center', maxWidth: 180 }
                    )
                    pdf.setFontSize(12);
                    pdf.text(pdfFechaLabel, width-16, 50, {align: 'right'})
    
                },
            },
            startY: 55,
            margin: { top: 55 },
            tableOptions: {
                // tableLineColor: '#000',  //[231, 76, 60],
                // tableLineWidth: 1,
                columnStyles: { 
                    time_out: { cellWidth: '20', lineWidth: { top: 0.25, right: 0.25, bottom: 0.25, left: 1/2 } }, 
                    time_in:  { cellWidth: '20', lineWidth: { top: 0.25, right: 0.25, bottom: 0.25, left: 1/2 } },
                    op_cred_in: { lineWidth: { top: 0.25, right: 1/2, bottom: 0.25, left: 0.25  } }, 
                },
                head: [
                    [
                        {
                            content: '',
                            // dataKey: 'id',
                            colSpan : 2,
                            styles: {
                                fillColor: '#fff',
                                lineWidth: 0,
                                lineColor: 'black',
                            },
                        },
                        {
                            content: 'Despacho',
                            colSpan : 4,
                            styles: { lineWidth: { top: 0.25, right: 0.25, bottom: 0.25, left: 1/2  }},
                        },
                        {
                            content: 'Recepción',
                            colSpan : 4,
                            styles: { lineWidth: { top: 0.25, right: 1/2, bottom: 0.25, left: 1/2  }},
                        },
                    ],
                    makeHeaderColsForTablePDF(colsExtintores)
                ],
                // footStyles: {
                //     lineWidth: 1,
                //     // fillColor: [241, 196, 15],
                //     // fontSize: 15,
                // },
                // foot: [
                //     [
                //         {
                //             content: '',
                //             // dataKey: 'id',
                //             colSpan : 1,
                //             styles: {
                //                 fillColor: '#fff',
                //                 lineWidth: { top: 0.25, right: 0, bottom: 0, left: 0 },
                //             },
                //         },
                //         {
                //             content: '',
                //             colSpan : 4,
                //             styles: { fillColor: '#fff', lineWidth: { top: 1, right: 0, bottom: 0, left: 0 }},
                //         },
                //         {
                //             content: '',
                //             colSpan : 4,
                //             styles: { fillColor: '#fff', lineWidth: { top: 1, right: 0, bottom: 0, left: 0 }},
                //         },
                //     ],
                // ],
            }
        });

        return { bloburl, openInNewWindow: () => window.open( bloburl, '_blank' ) }
    } 

    return {
        cols: colsExtintores,
        data,
        makePDF
    }
}
