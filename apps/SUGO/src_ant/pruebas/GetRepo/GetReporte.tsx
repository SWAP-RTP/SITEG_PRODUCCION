import React, { useEffect, useState } from 'react'
import { Button } from 'primereact/button';

import { ecosRecepcionadosHoy } from './fakeData';
import jsPDF from 'jspdf';
import { Tabla } from '../tabla/Tabla';
import { TablaCRUD } from '../../shared/components/Tabla';
import { addFooterPDF, addHeaderPDF, exportTablePDF, getPageSizesPDF, putFirmas } from '../../shared/utilities/makeTablePDF';


const convertDate = (date) => {
  const d = new Date(date);
  return d.toLocaleString();
}

//& Tabla
const columnas = [
  { header: '#', field: 'id', filter: true },
  { header: 'Modulo', field: 'modulo_id', filter: true },
  { header: 'Bus', field: 'eco', filter: true },
  { header: 'Operador', field: 'op_cred', filter: true },
  { header: 'Hora', field: 'modulo_time', filter: true, }, // body: (rowData) => convertDate(rowData.modulo_time) },
  { header: 'Extintor', field: 'extintor', filter: true },
  { header: 'Ruta', field: 'ruta_swap', filter: true },
  { header: 'Motivo', field: 'motivo', filter: true },
]
const dataTable = [
  ...ecosRecepcionadosHoy, ...ecosRecepcionadosHoy,
  ...ecosRecepcionadosHoy, ...ecosRecepcionadosHoy,
  // ...ecosRecepcionadosHoy, ...ecosRecepcionadosHoy,
  // ...ecosRecepcionadosHoy, ...ecosRecepcionadosHoy,
  ...ecosRecepcionadosHoy, ...ecosRecepcionadosHoy
].map( (obj, i) => ({...obj, id: i+1, modulo_time: convertDate(obj.modulo_time) }) )


// const dynamicInitialContent = (pdf) => {
//   const txt = 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise,'
//   //& Dynamic initial content 
//   pdf.setFont("helvetica", "normal");
//   pdf.setFontSize(16);
//   pdf.text( `H2 2`, 32, 47 );

//   pdf.setFont("helvetica");
//   pdf.setFontSize(14);
//   pdf.text( `H3 2`, 32, 57 );

//   pdf.setFont("helvetica");
//   pdf.setFontSize(12);
//   //? Obtener el ancho de la pagina actual
//   const pageSize = pdf.internal.pageSize
//   const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth()
//   // split Text To page width - margen
//   const textoSplited = pdf.splitTextToSize( txt, pageWidth - 32)
//   pdf.text(textoSplited, 16, 65)
// }


const firmas = [
  { cargo: 'Tecnico C - JUD DS', nombre: 'Juan David Caballero Frias', actividad: 'Ayudó' },
  { cargo: 'Asistente Tecnico C - JUD Desarrollo de Sisitemas', nombre: 'Juan David Caballero Frias', actividad: 'Elaboró' },
  { cargo: 'Tecnico C - JUD DS', nombre: 'Juan David Caballero Frias', actividad: 'Confirmó' },
  // { cargo: 'Asistente Tecnico C - JUD DS', nombre: 'Juan David Caballero Frias', actividad: 'Elaboró' },
  // { cargo: 'Tecnico C - JUD DS', nombre: 'Juan David Caballero Frias', actividad: 'Confirmó' },
]

export const GetReporte = () => {
  const [pdf, setPdf] = useState<any>();

  //? Ejemplo 1
  const rederTablePDF = () => {
    const { bloburl } = exportTablePDF(dataTable, columnas, { autoSave: false, title: 'Ejemplo simple' });
    
    setPdf(bloburl)
  }

  //? Ejemplo 2
  const rederTablePDF2 = () => {
    const { bloburl } = exportTablePDF(dataTable, columnas, { 
      // format: 'legal',
      // orientation: 'l',
      autoSave: false, 
      title: 'Ejemplo con contenido inicio-final',
      startY: 73,
      margin: { top: 35, right: 16, left: 16, bottom: 70 },  // margin top afecta solo si se crean mas hojas y NO afecta a la primera
      dynamicInitialContent(pdf) {
        const page = getPageSizesPDF(pdf);

        pdf.setFont('Helvetica', 'normal')
        pdf.setFontSize(12);
        pdf.text('Ejemplo de parrafo. ', 16, 45);
        pdf.text('Sit amet consectetur adipisicing elit. Animi, iste, similique ut quisquam et, placeat consequatur ipsa impedit praesentium alias laborum expedita ex doloremque reiciendis repellat optio hic vero a.', 
          16, 52, { maxWidth: page.width-(16*2) }
        );
        pdf.text('Ut quisquam et, placeat consequatur ipsa impedit praesentium alias laborum expedita ex doloremque reiciendis repellat optio hic vero a.', 
          16, 62, { maxWidth: page.width-(16*2) }
        );
      }, 
      dynamicFinalContent(pdf, h) {
        const page = getPageSizesPDF(pdf)

        pdf.setFont('Helvetica', 'normal')
        pdf.setFontSize(12);
        pdf.text('Animi, iste, similique ut quisquam et, placeat consequatur ipsa impedit praesentium alias laborum expedita ex doloremque reiciendis.', 
        16, h, { maxWidth: page.width-(16*2) }
        );
        pdf.setFont('Helvetica', 'bold')
        pdf.text('Gracias. FIN ', 16, h+17);
        pdf.setFont('Helvetica', 'normal')

        // putFirmas(pdf, firmas);  //! *¹
      },
      footer: {
        dynamicContent(pdf) {
          putFirmas(pdf, firmas, { lengthLine: 45 }) //! *¹
        },
      }
    });

    setPdf(bloburl)
  }

  //? Ejemplo 3
  const renderLargeCustomePDF = () => {
    //@ts-ignore
    const doc = new jsPDF({
      orientation: 'p' , 
      format: 'legal',      //'a4'==[ 297, 210] | letter==[279, 216]
      unit: 'mm',
      compress: true, 
    });
    doc.setProperties({
      title: 'PDF 2',
      subject: 'Generado con jsPDF',
      author: 'JUD DS',
      keywords: 'javascript, PDF',
      creator: 'SUGO',
    });
    //? Hoja 1
    addHeaderPDF(doc)
    addFooterPDF(doc, {page: 1})
    doc.text('Hoja oficio', 16, 32);
    
    //? Hoja 2 - N
    doc.addPage('letter', 'p');
    const { bloburl, actualPage } = exportTablePDF(dataTable, columnas, { autoSave: false, doc, initialNumberPage: 2 });
    
    //? Hoja N+1
    doc.addPage('legal', 'l')
    addHeaderPDF(doc);
    addFooterPDF(doc, {page: actualPage+1});
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20); 
    doc.text('Hii', 16, 36);
    
    setPdf(doc.output('bloburl'))
  }


  useEffect(() => {
    // rederTablePDF();
    rederTablePDF2();
    // renderLargeCustomePDF();
    console.log({dataTable, columnas});
  }, [])


  return (
  <div className='flex flex-column' style={{minHeight: '70vh'}}>
    <h1>GetReporte</h1>
    { 
      pdf && <iframe title="Preview" src={pdf} width="100%" height="100%" className='flex-grow-1' /> 
    }

    {/* <TablaCRUD data={dataTable} cols={columnas} /> */}

    {/* <Tabla /> */}
  </div>
  )
}