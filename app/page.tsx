"use client";

import { useState } from "react";
import MultiUploader from "./components/ImageUploader";
import { processInvoice } from "./actions";
import InvoiceResult from "./components/InvoiceResult";

export default function Home() {
	// Estado para la "Cola" de archivos sin procesar
	const [fileQueue, setFileQueue] = useState<File[]>([]);

	// Estado para los resultados procesados
	const [invoices, setInvoices] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [currentFile, setCurrentFile] = useState("");

	// Función para agregar a la cola (sin procesar aún)
	const handleAddFiles = (newFiles: File[]) => {
		// Evitamos duplicados por nombre
		const uniqueFiles = newFiles.filter(
			(nf) => !fileQueue.some((f) => f.name === nf.name)
		);
		setFileQueue([...fileQueue, ...uniqueFiles]);
	};

	// Función para borrar de la cola
	const removeFile = (index: number) => {
		const newQueue = [...fileQueue];
		newQueue.splice(index, 1);
		setFileQueue(newQueue);
	};

	const fileToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				const result = reader.result as string;
				const base64 = result.split(",")[1];
				resolve(base64);
			};
			reader.onerror = (error) => reject(error);
		});
	};
	const wait = (ms: number) =>
		new Promise((resolve) => setTimeout(resolve, ms));
	const handleProcessQueue = async () => {
		if (fileQueue.length === 0) return;

		setLoading(true);
		setInvoices([]); // Reiniciamos (o podrías no hacerlo si quieres acumular)

		// Usamos una variable temporal para ir acumulando todo
		let allInvoices: any[] = [];

		for (let i = 0; i < fileQueue.length; i++) {
			const file = fileQueue[i];
			setCurrentFile(`Analizando ${i + 1}/${fileQueue.length}: ${file.name}`);

			try {
				const base64 = await fileToBase64(file);
				const response = await processInvoice(base64, file.type);

				if (response.success) {
					// TRUCO: Usamos el spread operator (...) para "sacar" las facturas de la lista
					// y agregarlas al array principal.
					// Si el PDF trajo 20 facturas, las 20 se agregan individualmente.
					if (Array.isArray(response.data)) {
						allInvoices = [...allInvoices, ...response.data];
					} else if (response.data) {
						allInvoices = [...allInvoices, response.data];
					}
				} else {
					console.error(`Error en ${file.name}:`, response.error);
				}
				if (i < fileQueue.length - 1) {
					setCurrentFile(`Esperando a Google (evitando saturación)...`);
					await wait(4000);
				}
			} catch (e) {
				console.error("Error crítico:", e);
			}
		}

		setInvoices(allInvoices);
		setLoading(false);
		setCurrentFile("");
		// setFileQueue([]); // Descomentar si quieres limpiar la cola al terminar
	};

	// --- LÓGICA DEL DASHBOARD (Igual que antes) ---
	const vendorStats = invoices.reduce((acc: any, invoice) => {
		const name = invoice.vendorName || "Desconocido";
		if (!acc[name]) {
			acc[name] = { count: 0, total: 0 };
		}
		acc[name].count += 1;
		acc[name].total += invoice.totalAmount;
		return acc;
	}, {});

	const grandTotal = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

	const downloadSummaryCSV = () => {
		const headers = ["Proveedor", "Cantidad Facturas", "Deuda Total"];
		const rows = Object.keys(vendorStats).map((vendor) => [
			vendor,
			vendorStats[vendor].count,
			vendorStats[vendor].total.toFixed(2),
		]);
		const csvContent = [
			headers.join(","),
			...rows.map((r) => r.join(",")),
		].join("\n");
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "resumen_proveedores.csv";
		link.click();
	};

	return (
		<main className="flex min-h-screen flex-col items-center p-8 bg-gray-950 text-white">
			<h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
				Gestión Masiva de Facturas IA
			</h1>

			{/* 1. SECCIÓN DE CARGA Y COLA */}
			<div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
				{/* Lado Izquierdo: El cargador */}
				<div>
					<h3 className="text-xl font-semibold mb-4 text-blue-300">
						1. Cargar Documentos
					</h3>
					<MultiUploader onFilesSelect={handleAddFiles} />
				</div>

				{/* Lado Derecho: La Cola (Queue) */}
				<div className="bg-gray-900 rounded-xl p-4 border border-gray-800 h-64 overflow-y-auto">
					<h3 className="text-xl font-semibold mb-4 text-purple-300 flex justify-between">
						<span>2. Lista de Espera</span>
						<span className="text-sm bg-gray-800 px-2 py-1 rounded">
							{fileQueue.length} archivos
						</span>
					</h3>

					{fileQueue.length === 0 ? (
						<p className="text-gray-500 text-center mt-10">
							No hay archivos en cola
						</p>
					) : (
						<ul className="space-y-2">
							{fileQueue.map((file, idx) => (
								<li
									key={idx}
									className="flex justify-between items-center bg-gray-800 p-2 rounded text-sm"
								>
									<span className="truncate max-w-[200px]">{file.name}</span>
									<button
										onClick={() => removeFile(idx)}
										className="text-red-400 hover:text-red-200 px-2"
									>
										✕
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			{/* BOTÓN DE PROCESAR */}
			{fileQueue.length > 0 && !loading && (
				<button
					onClick={handleProcessQueue}
					className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-12 rounded-full shadow-2xl transition-all hover:scale-105 text-lg"
				>
					🚀 Procesar {fileQueue.length} Facturas
				</button>
			)}

			{loading && (
				<div className="mt-4 mb-12 text-2xl text-blue-300 animate-pulse font-mono">
					⏳ {currentFile}
				</div>
			)}

			{/* 3. RESULTADOS (Dashboard) */}
			{invoices.length > 0 && (
				<div className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom-10">
					<div className="flex justify-between items-end mb-6 border-b border-gray-700 pb-4">
						<h2 className="text-3xl font-bold text-white">
							Reporte Financiero
						</h2>
						<button
							onClick={downloadSummaryCSV}
							className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2"
						>
							📥 Descargar Excel General
						</button>
					</div>

					{/* Tarjetas KPI */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						<div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
							<p className="text-gray-400">Total Documentos</p>
							<p className="text-4xl font-bold">{invoices.length}</p>
						</div>
						<div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
							<p className="text-gray-400">Deuda Total Acumulada</p>
							<p className="text-4xl font-bold text-green-400">
								${" "}
								{grandTotal.toLocaleString("es-AR", {
									minimumFractionDigits: 2,
								})}
							</p>
						</div>
						<div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
							<p className="text-gray-400">Proveedores Únicos</p>
							<p className="text-4xl font-bold text-purple-400">
								{Object.keys(vendorStats).length}
							</p>
						</div>
					</div>

					{/* Tabla Resumen */}
					<div className="bg-white text-gray-900 rounded-xl overflow-hidden shadow-2xl mb-12">
						<table className="w-full text-left">
							<thead className="bg-gray-100 border-b">
								<tr>
									<th className="p-4 font-semibold">Proveedor</th>
									<th className="p-4 font-semibold text-center">Docs</th>
									<th className="p-4 font-semibold text-right">Total</th>
								</tr>
							</thead>
							<tbody>
								{Object.keys(vendorStats).map((vendor) => (
									<tr key={vendor} className="border-b hover:bg-gray-50">
										<td className="p-4 font-medium">{vendor}</td>
										<td className="p-4 text-center">
											{vendorStats[vendor].count}
										</td>
										<td className="p-4 text-right font-bold text-blue-700">
											${" "}
											{vendorStats[vendor].total.toLocaleString("es-AR", {
												minimumFractionDigits: 2,
											})}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Detalle Tarjetas */}
					<div className="grid grid-cols-1 gap-8">
						{invoices.map((inv, idx) => (
							<InvoiceResult key={idx} data={inv} />
						))}
					</div>
				</div>
			)}
		</main>
	);
}
