"use server";

import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// 1. Esquema de UNA factura (Este ya lo tenías)
const singleInvoiceSchema = z.object({
	vendorName: z.string().describe("Nombre del proveedor o empresa emisora"),
	invoiceNumber: z.string().describe("Número de la factura"),
	date: z.string().describe("Fecha de emisión (DD/MM/AAAA)"),
	currency: z.string().describe("Moneda (ARS, USD)"),
	totalAmount: z.number().describe("Total final a pagar"),
	// Hacemos los items opcionales para ahorrar tokens en documentos gigantes
	items: z
		.array(
			z.object({
				description: z.string(),
				total: z.number(),
			})
		)
		.optional()
		.describe("Resumen de items si es legible"),
});

// 2. Esquema de LISTA (La clave del éxito)
const batchSchema = z.object({
	invoices: z
		.array(singleInvoiceSchema)
		.describe("Lista de TODAS las facturas detectadas en el archivo"),
});

export async function processInvoice(fileBase64: string, mediaType: string) {
	try {
		const result = await generateText({
			model: google("gemini-2.5-flash"),
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							// PROMPT HÍBRIDO: Funciona para 1 foto o para 1 PDF de 50 páginas
							text: "Analiza este documento. Puede contener una sola factura o múltiples facturas de diferentes proveedores (compaginadas). Extrae CADA comprobante como un objeto independiente en la lista. Si es un PDF largo, recorre todas las páginas.",
						},
						{ type: "file", data: fileBase64, mediaType: mediaType },
					],
				},
			],
			// Forzamos siempre una estructura de LISTA, aunque sea de 1 elemento
			output: Output.object({ schema: batchSchema }),
		});

		return { success: true, data: result.output.invoices };
	} catch (error: any) {
		console.error("Error IA:", error);
		return { success: false, error: error.message };
	}
}
