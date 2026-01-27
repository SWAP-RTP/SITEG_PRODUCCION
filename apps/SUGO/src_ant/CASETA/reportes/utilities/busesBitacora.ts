import { dateToString, hrDateToString, sumarHora } from "../../../shared/helpers";
import { UseFetchGet } from "../../../shared/helpers-HTTP";
import { exportTablePDF, getPageSizesPDF, makeHeaderColsForTablePDF } from "../../../shared/utilities/makeTablePDF";
import { EcosDespachadosConRecepcion } from "../../interfaces/EcoInOut";
import { FetchPVestados, Result } from "../../pv-estados/interfaces";


interface Params {
    dates:   Date[]
    modulo:  number
    tipo:   number[]
    eco?:    string
    cred?:   string
    ruta?:   string
    motivo?: string
};




const API = import.meta.env.VITE_SUGO_BackTS;

const convertDate = (date: string|undefined) => {
    if( !date ) return ''
    const d = new Date(date)

    return d.toLocaleString()
};

const cols = [
    {header: '#',           field: 'id'},
    // {header: 'Mod',      field: 'modulo'},
    {header: 'Capturó',     field: 'cap1'},
    {header: 'Eco',         field: 'eco1'},
    {header: 'Operador',    field: 'op_cred1'},
    {header: 'Hora',        field: 'time1'},
    {header: 'Turno',       field: 'op_turno1'},
    {header: 'Extintor',    field: 'extintor1'},
    {header: 'Ruta',        field: 'ruta1'},
    {header: 'Modalidad',   field: 'modalidad1'},
    {header: 'CC',          field: 'cc1'},
    {header: 'Motivo',      field: 'motivo1'},
    {header: 'Descripcion', field: 'motivo_descripcion1'},
];
const colsAllRecord = [
    {header: '#',           field: 'id'},
    // {header: 'Mod',      field: 'modulo'},
    {header: 'Capturó',     field: 'cap1'},
    {header: 'Eco',         field: 'eco1'},
    {header: 'Operador',      field: 'op_cred1'},
    {header: 'Fecha y hora',field: 'time1' },
    // {header: 'Turno',       field: 'op_turno1'},
    {header: 'Ext',         field: 'extintor1'},
    {header: 'Ruta',        field: 'ruta1'},
    {header: 'Modalidad',   field: 'modalidad1'},
    {header: 'CC',          field: 'cc1'},
    {header: 'Motivo',      field: 'motivo1'},
    // {header: 'Descripcion', field: 'motivo_descripcion1'},
    // {header: '',          field: 'separador', cellDef: { styles: {fillColor: '#fff', lineColor: '#fff'} }},
    {header: 'Mod',         field: 'modulo2', cellDef: { styles: { lineWidth: { top: 0.25, right: 0.25, bottom: 0.25, left: 1.0 }}}},
    {header: 'Capturó',     field: 'cap2'},
    {header: 'Eco',         field: 'eco2'},
    {header: 'Operador',      field: 'op_cred2'},
    {header: 'Fecha y hora',field: 'time2'},
    // {header: 'Turno',       field: 'op_turno2'},
    {header: 'Ext',         field: 'extintor2'},
    {header: 'Ruta',        field: 'ruta2'},
    {header: 'Modalidad',   field: 'modalidad2'},
    {header: 'CC',          field: 'cc2'},
    {header: 'Motivo',      field: 'motivo2'},
    // {header: 'Descripcion', field: 'motivo_descripcion2'},
];

const pdfTableHead = [
    [
        { content: '', colSpan: 1 },
        { content: 'Despacho', colSpan: 9 },
        { content: 'Recepción', colSpan: 10, styles: { lineWidth: { top: 0.25, right: 0.25, bottom: 0.25, left: 1.0  }} },
    ],
    makeHeaderColsForTablePDF(colsAllRecord)
];

const invertirFecha = (str: string, symbol='/') => {
    return str.split(symbol).reverse().join(symbol)
};



export const getReporteEcosBitacora = async({ 
    dates, 
    modulo, 
    tipo,
    eco,
    cred,
    ruta,
    motivo, 
}: Params)=> {
    //& Convertir fechas en strings
    const fechaIni = dateToString(dates[0], true);
    const fechaFin = dates[1] ? dateToString( sumarHora(dates[1], {hrs: 25}), true) : dateToString( sumarHora(dates[0], {hrs: 25}), true);
    const pdfFechaLabel = dates[1] ? 
        `Fechas: ${invertirFecha(fechaIni)} - ${invertirFecha(fechaFin)}`
    : `Fecha: ${invertirFecha(fechaIni)}`;

    //& Definir tipo de consulta (DESPACHOS, RECEPCIONES o ambos)
    let pdfTituloTipo = 'DESPACHOS Y RECEPCIONES';
    let consultaComplemento = '&tipo=1&complemento=true';   // Despachos(1) con su registro complemento (recepcion|null) 
    let consultaTipo = 3    // 1+2 | 'Despacho' + 'Recepcion'
    let pdfTablaCols = colsAllRecord
    let format: any = 'legal'
    let head: (any[]|undefined) = pdfTableHead

    if(tipo?.length==1 && tipo[0] === 1)  {
        pdfTituloTipo = 'DESPACHOS';
        consultaComplemento  = '&tipo=1';   // Despacho(1)
        consultaTipo=1
        pdfTablaCols = cols
        format = 'letter'
        head = undefined
    }
    if(tipo?.length==1 && tipo[0] === 2)  {
        pdfTituloTipo = 'RECEPCIONES';  // Recepcion(2)
        consultaComplemento  = '&tipo=2';   
        consultaTipo=2
        pdfTablaCols = cols
        format = 'letter'
        head = undefined
    }
    //? añadir filtros a la consulta
    if(!!eco)     consultaComplemento += `&eco=${eco}`;
    if(!!cred)    consultaComplemento += `&op_cred=${cred}`;
    if(!!ruta)    consultaComplemento += `&ruta=${ruta}`;


    //& Get data (Realizar consulta)
    let res: Result[] = []
    try {
        const respuesta: FetchPVestados = await UseFetchGet(`${API}/api/caseta/pv-estados?fecha_ini=${fechaIni}&fecha_fin=${fechaFin}&create_modulo=${modulo}&limit=false${consultaComplemento}`)
        res = respuesta.results;
    } catch (error) {
        console.error('getReporteExtintores');
        throw Error(error)
    }

    // console.log('Data fetched successfully:', res);
    //? Ajustar data de la consulta para mostrarla en la tabla
    const data = res.map( (reg, i) => {
        const data = {
            id:      i+1,
            // modulo1:     reg.modulo_id,
            cap1:        reg.createdBy,
            eco1:        reg.eco,
            op_cred1:    reg.op_cred,
            time1:       convertDate(reg.momento),
            op_turno1:   reg.op_turno,
            extintor1:   reg.extintor,
            ruta1:       reg.ruta,
            modalidad1:  reg.ruta_modalidad,
            cc1:         reg.ruta_cc,
            motivo1:     reg.pv_estados_motivo.desc,
            motivo_descripcion1: reg.motivo_desc,
            modulo: reg.modulo_origen,
            estatus: reg.estatus,
        }

        let complemento = {}
        if(consultaTipo === 3){
            complemento = {
                modulo2:     reg.complemento?.createdBy_modulo,
                cap2:        reg.complemento?.createdBy,
                eco2:        reg.complemento?.eco,
                op_cred2:    reg.complemento?.op_cred,
                time2:       convertDate(reg.complemento?.momento),
                op_turno2:   reg.complemento?.op_turno,
                extintor2:   reg.complemento?.extintor,
                ruta2:       reg.complemento?.ruta,
                modalidad2:  reg.complemento?.ruta_modalidad,
                cc2:         reg.complemento?.ruta_cc,
                motivo2:     reg.complemento?.pv_estados_motivo.desc,
                motivo_descripcion2: reg.motivo_desc,
            }
        }

        return {...data, ...complemento}
    });


    //& Generar PDF
    const makePDF = (dataTable) => {
        const { bloburl } = exportTablePDF( dataTable, pdfTablaCols, { 
            format ,
            orientation: 'l',
            autoSave: false,
            startY: 55, margin: { top: 55 },

            header: { 
                dynamicContent(pdf) {
                    const { widthCenter, width } = getPageSizesPDF(pdf)
                    pdf.setFontSize(18);
                    pdf.text(`${pdfTituloTipo} DE AUTOBUSES DEL MODULO ${modulo}`, 
                        widthCenter, 35, 
                        { align: 'center' }
                    )
                    pdf.setFontSize(12);
                    pdf.text(`${pdfFechaLabel}`, 
                        width-16, 45,
                        { align: 'right' }
                    )

                },
            },
            tableOptions: {
                columnStyles: { 
                    cap1: { cellWidth: 16 }, 
                    cap2: { cellWidth: 16 }, 
                    time1: { cellWidth: 20 }, 
                    time2: { cellWidth: 20 }, 
                    cc1: { cellWidth: 12 }, 
                    cc2: { cellWidth: 12 }, 
                    modalidad1:  { cellWidth: 22 },
                    modalidad2:  { cellWidth: 22 },
                    motivo1:  { cellWidth: 22 },
                    motivo2:  { cellWidth: 22 },
                    modulo2:  { cellWidth: 10, lineWidth: { top: 0.25, right: 0.25, bottom: 0.25, left: 1.0 } }, 
                },
                head ,
                tableLineColor: '#000',
                tableLineWidth: 1,
            }
        });
        return { bloburl, openInNewWindow: () => window.open( bloburl, '_blank' ) }
    }

    return {
        cols: pdfTablaCols,
        data,
        makePDF
    }
}

