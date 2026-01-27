import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportarGraficasPDF(selector: string, filename = 'grafica_salidas.pdf') {
	const graficas = document.querySelectorAll(selector);
	if (graficas.length === 0) return;

	const pdf = new jsPDF({
		orientation: 'portrait',
		unit: 'px',
		format: [600, 900]
	});

	let y = 30;
	for (let i = 0; i < graficas.length; i++) {
		const grafica = graficas[i] as HTMLElement;
		let titulo = '';
		const h4 = grafica.parentElement?.querySelector('h4');
		if (h4) {
			titulo = h4.textContent || '';
		}
		if (!titulo && i === 0) {
			const h3 = document.querySelector('h3.text-center');
			if (h3) {
				titulo = h3.textContent || '';
			}
		}
		if (titulo) {
			pdf.setFontSize(16);
			pdf.text(titulo, 20, y);
			y += 24;
		}
		const canvas = await html2canvas(grafica);
		const imgData = canvas.toDataURL('image/png');
		const imgWidth = 540;
		const imgHeight = (canvas.height * imgWidth) / canvas.width;
		pdf.addImage(imgData, 'PNG', 30, y, imgWidth, imgHeight);
		y += imgHeight + 10;

		if (i < graficas.length - 1 && y + 300 > pdf.internal.pageSize.getHeight()) {
			pdf.addPage();
			y = 30;
		}
	}
	pdf.save(filename);
}
