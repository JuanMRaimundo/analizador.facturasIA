"use client";

import { ChangeEvent, useState } from "react";

interface Props {
	onFilesSelect: (files: File[]) => void;
}

export default function MultiUploader({ onFilesSelect }: Props) {
	const [error, setError] = useState<string | null>(null);
	const MAX_SIZE_MB = 4;
	const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		setError(null); // Limpiamos errores previos

		if (e.target.files && e.target.files.length > 0) {
			const allFiles = Array.from(e.target.files);
			const validFiles: File[] = [];
			const rejectedFiles: string[] = [];

			allFiles.forEach((file) => {
				if (file.size > MAX_SIZE_BYTES) {
					rejectedFiles.push(file.name);
				} else {
					validFiles.push(file);
				}
			});

			// Si hubo rechazados, mostramos error
			if (rejectedFiles.length > 0) {
				setError(
					`⚠️ Los siguientes archivos superan los ${MAX_SIZE_MB}MB y fueron descartados: ${rejectedFiles.join(
						", "
					)}`
				);
			}

			// Si hay válidos, los mandamos al padre
			if (validFiles.length > 0) {
				onFilesSelect(validFiles);
			}
		}
	};

	return (
		<div className="w-full max-w-2xl mx-auto">
			<label
				className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
					error
						? "border-red-500 bg-red-900/20"
						: "border-gray-600 bg-gray-900 hover:bg-gray-800"
				}`}
			>
				<div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
					<svg
						className={`w-10 h-10 mb-3 ${
							error ? "text-red-500" : "text-blue-500"
						}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
						></path>
					</svg>

					<p className="mb-2 text-sm text-gray-400">
						<span className="font-semibold text-white">
							Click para subir facturas
						</span>
					</p>

					<p className="text-xs text-gray-500 mb-2">
						Soporta: PDF, PNG, JPG (Selecciona múltiples)
					</p>

					{/* EL CARTEL ACLARATIVO */}
					<div className="bg-blue-900/50 text-blue-200 text-xs py-1 px-3 rounded-full border border-blue-800">
						ℹ️ Máximo {MAX_SIZE_MB}MB por archivo (Versión Gratuita)
					</div>

					{/* MENSAJE DE ERROR SI INTENTAN SUBIR ALGO GRANDE */}
					{error && (
						<p className="mt-3 text-xs text-red-400 font-bold bg-black/50 p-2 rounded max-w-md">
							{error}
						</p>
					)}
				</div>

				<input
					type="file"
					className="hidden"
					accept="image/*,application/pdf"
					multiple
					onChange={handleFileChange}
				/>
			</label>
		</div>
	);
}
