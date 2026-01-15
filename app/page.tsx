"use client";

import { useEffect, useState } from "react";
import ImageUploader from "./components/ImageUploader";
import { processInvoice } from "./actions"; // Importamos la nueva función
import InvoiceResult from "./components/InvoiceResult";

export default function Home() {
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [invoiceData, setInvoiceData] = useState<any>(null); // Aquí guardaremos el JSON
	const [error, setError] = useState("");

	// Función auxiliar para convertir File -> Base64
	const fileToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				// Quitamos el prefijo "data:image/jpeg;base64," para enviar solo los datos limpios si es necesario,
				// pero el SDK de Vercel suele manejar bien la URL completa.
				// Por seguridad, enviamos solo la parte base64 pura:
				const base64String = reader.result as string;
				const pureBase64 = base64String.split(",")[1];
				resolve(pureBase64);
			};
			reader.onerror = (error) => reject(error);
		});
	};

	// Lógica para mostrar mensajes de carga
	const mensajes = [
		"Subiendo imagen...",
		"Contactando al servidor...",
		"Analizando datos...",
	];
	const [mensajeIndex, setMensajeIndex] = useState(0);
	useEffect(() => {
		let interval: any;
		if (loading) {
			interval = setInterval(() => {
				setMensajeIndex((prev) => (prev + 1) % mensajes.length);
			}, 1500);
		} else {
			setMensajeIndex(0);
		}
		return () => clearInterval(interval);
	}, [loading, mensajes.length]);

	const handleProcessImage = async () => {
		if (!imageFile) return;

		setLoading(true);
		setError("");
		setInvoiceData(null);

		try {
			// 1. Convertir imagen
			const base64 = await fileToBase64(imageFile);

			// 2. Llamar al cerebro (Server Action)
			const result = await processInvoice(base64);

			if (result.success) {
				setInvoiceData(result.data);
			} else {
				setError("Error: " + result.error);
			}
		} catch {
			setError("Error inesperado al procesar");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="flex min-h-screen flex-col items-center p-8 bg-gray-950 text-white">
			<h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
				Extractor de Facturas IA
			</h1>

			<ImageUploader onImageSelect={(file) => setImageFile(file)} />

			{imageFile && (
				<div className="mt-8">
					<button
						onClick={handleProcessImage}
						disabled={loading}
						className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
					>
						{loading ? mensajes[mensajeIndex] : "✨ Extraer Datos"}
					</button>
				</div>
			)}

			{/* Mostrar Error si hay */}
			{error && (
				<div className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded text-red-200">
					{error}
				</div>
			)}

			{/* Mostrar Resultados (JSON crudo por ahora) */}
			{invoiceData && (
				<div className="mt-8 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8">
					<h2 className="text-2xl font-bold mb-4 text-green-400">
						¡Datos Extraídos!
					</h2>

					<div className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-2xl overflow-auto max-h-[500px]">
						{/* Un truco visual para mostrar JSON bonito */}
						<pre className="text-sm text-gray-300 font-mono">
							{invoiceData && (
								<div className="mt-8 w-full flex justify-center pb-20">
									<InvoiceResult data={invoiceData} />
								</div>
							)}
						</pre>
					</div>
				</div>
			)}
		</main>
	);
}
