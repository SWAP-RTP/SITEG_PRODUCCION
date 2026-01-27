export const mostrarTotalesEnBarra = {
	id: 'mostrarTotalesEnBarra',
	afterDatasetsDraw: (chart: any) => {
		const ctx = chart.ctx;
		chart.data.datasets.forEach((dataset: any, i: number) => {
			const meta = chart.getDatasetMeta(i);
			meta.data.forEach((bar: any, index: number) => {
				const value = dataset.data[index];
				if (value === undefined || value === null) return;
				ctx.save();
				ctx.font = 'bold 14px Arial';
				ctx.fillStyle = '#fff';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				const x = bar.x;
				const y = bar.y + (bar.height ? bar.height / 2 : 0);
				ctx.fillText(value, x, y);
				ctx.restore();
			});
		});
	}
};

export const mostrarTotalesEnLinea = {
	id: 'mostrarTotalesEnLinea',
	afterDatasetsDraw: (chart: any) => {
		const ctx = chart.ctx;
		chart.data.datasets.forEach((dataset: any, i: number) => {
			const meta = chart.getDatasetMeta(i);
			meta.data.forEach((point: any, index: number) => {
				const value = dataset.data[index];
				if (value === undefined || value === null) return;
				ctx.save();
				ctx.font = 'bold 14px Arial';
				ctx.fillStyle = dataset.borderColor || '#000';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'bottom';
				const x = point.x;
				const y = point.y - 8;
				ctx.fillText(value, x, y);
				ctx.restore();
			});
		});
	}
};
