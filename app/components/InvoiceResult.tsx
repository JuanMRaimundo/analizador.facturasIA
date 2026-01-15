"use client";

interface InvoiceData {
	invoiceNumber: string;
	date: string;
	time: string;
	vendorName: string;
	totalAmount: number;
	currency: string;
	items: Array<{
		description: string;
		quantity: number;
		unitPrice: number;
		total: number;
	}>;
}

export default function InvoiceResult({ data }: { data: InvoiceData }) {
	// Función para formatear dinero
	const formatMoney = (amount: number, currency: string) => {
		return new Intl.NumberFormat("es-AR", {
			style: "currency",
			currency: currency || "ARS",
		}).format(amount);
	};

	// Función para descargar en Excel/CSV
	const downloadCSV = () => {
		const headers = ["Descripción", "Cantidad", "Precio Unitario", "Total"];
		const rows = data.items.map((item) => [
			`"${item.description}"`, // Comillas para evitar errores con comas
			item.quantity,
			item.unitPrice,
			item.total,
		]);

		const csvContent = [
			headers.join(","),
			...rows.map((row) => row.join(",")),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `factura_${data.invoiceNumber || "temp"}.csv`;
		link.click();
	};

	return (
		<div className="w-full max-w-4xl bg-white text-gray-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
			{/* Encabezado de la Factura */}
			<div className="bg-gray-50 p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">
						{data.vendorName || "Proveedor Desconocido"}
					</h2>
					<p className="text-sm text-gray-500">Fecha: {data.date}</p>
					<p className="text-sm text-gray-500">Hora: {data.time}</p>
					<p className="text-sm text-gray-500">
						N° Comprobante: {data.invoiceNumber}
					</p>
				</div>
				<div className="text-right">
					<p className="text-sm text-gray-500 uppercase font-semibold">
						Total a Pagar
					</p>
					<p
						className={`text-4xl font-bold ${
							data.totalAmount <= 60000 ? "text-green-600" : "text-red-600"
						} `}
					>
						{formatMoney(data.totalAmount, data.currency)}
					</p>
				</div>
			</div>

			{/* Tabla de Items */}
			<div className="p-6 overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="border-b border-gray-200 text-sm uppercase text-gray-500 tracking-wider">
							<th className="py-3 font-medium">Descripción</th>
							<th className="py-3 font-medium text-center">Cant.</th>
							<th className="py-3 font-medium text-right">Precio Unit.</th>
							<th className="py-3 font-medium text-right">Total</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{data.items.map((item, index) => (
							<tr key={index} className="hover:bg-gray-50 transition-colors">
								<td className="py-4 text-gray-800 font-medium">
									{item.description}
								</td>
								<td className="py-4 text-center text-gray-600">
									{item.quantity}
								</td>
								<td className="py-4 text-right text-gray-600">
									{formatMoney(item.unitPrice, data.currency)}
								</td>
								<td className="py-4 text-right font-bold text-gray-800">
									{formatMoney(item.total, data.currency)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Footer con Botones */}
			<div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-3">
				<button
					onClick={() => window.location.reload()}
					className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
				>
					Nueva Factura
				</button>
				<button
					onClick={downloadCSV}
					className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md font-medium"
				>
					<span>📥 Descargar Excel</span>
				</button>
			</div>
		</div>
	);
}
