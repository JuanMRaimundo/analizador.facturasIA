"use client";

import { ChangeEvent } from "react";

interface Props {
	onFilesSelect: (files: File[]) => void; // Ahora devuelve un ARRAY de archivos
}

export default function MultiUploader({ onFilesSelect }: Props) {
	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			// Convertimos la FileList a un Array normal para manejarlo mejor
			const filesArray = Array.from(e.target.files);
			onFilesSelect(filesArray);
		}
	};

	return (
		<div className="w-full max-w-2xl mx-auto">
			<label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-900 hover:bg-gray-800 transition-colors">
				<div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
					<svg
						className="w-10 h-10 mb-3 text-blue-500"
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
					<p className="text-xs text-gray-500">
						Soporta: PDF, PNG, JPG (Selecciona múltiples)
					</p>
				</div>
				<input
					type="file"
					className="hidden"
					accept="image/*,application/pdf" // Aceptamos PDF
					multiple // ¡Magia activada!
					onChange={handleFileChange}
				/>
			</label>
		</div>
	);
}
