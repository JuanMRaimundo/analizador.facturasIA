"use client";

import { useState, ChangeEvent } from "react";

// Definimos qué "props" recibe este componente
interface Props {
	onImageSelect: (file: File) => void; // Función para avisar al padre que hay imagen
}

export default function ImageUploader({ onImageSelect }: Props) {
	const [preview, setPreview] = useState<string | null>(null);

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		//Guardamos la imagen para mostrarla
		const objectUrl = URL.createObjectURL(file);
		setPreview(objectUrl);

		//Avisamos al componente padre que ya tenemos el archivo
		onImageSelect(file);
	};

	return (
		<div className="w-full max-w-md mx-auto">
			<label
				className={`
          flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-lg cursor-pointer 
          transition-colors duration-300
          ${
						preview
							? "border-blue-500 bg-blue-50"
							: "border-gray-300 hover:bg-gray-800 bg-gray-900"
					}
        `}
			>
				{preview ? (
					// Si hay imagen, la mostramos
					<div className="relative w-full h-full p-2">
						<img
							src={preview}
							alt="Vista previa"
							className="w-full h-full object-contain rounded-md"
						/>
						<p className="text-xs text-center text-blue-600 mt-2">
							Click para cambiar
						</p>
					</div>
				) : (
					// Si no hay imagen, mostramos el ícono de subida
					<div className="flex flex-col items-center justify-center pt-5 pb-6">
						<svg
							className="w-8 h-8 mb-4 text-gray-500"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 20 16"
						>
							<path
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
							/>
						</svg>
						<p className="mb-2 text-sm text-gray-500">
							<span className="font-semibold">Click para subir</span> factura
						</p>
						<p className="text-xs text-gray-500">PNG, JPG or WEBP</p>
					</div>
				)}

				{/* El input real está oculto pero funcional */}
				<input
					type="file"
					className="hidden"
					accept="image/*"
					onChange={handleFileChange}
				/>
			</label>
		</div>
	);
}
