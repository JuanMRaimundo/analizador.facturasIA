"use server";

import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// 1. Definimos la estructura EXACTA que queremos extraer
const invoiceSchema = z.object({
	invoiceNumber: z.string().describe("El número de la factura o comprobante"),
	date: z.string().describe("La fecha de emisión (formato DD/MM/YYYY)"),
	time: z
		.string()
		.optional()
		.describe("La hora de emisión si está disponible (formato HH:MM)"),
	vendorName: z
		.string()
		.describe("El nombre de la empresa o negocio que emite la factura"),
	totalAmount: z.number().describe("El monto total final a pagar"),
	currency: z.string().describe("La moneda (ARS, USD, EUR)"),
	items: z
		.array(
			z.object({
				description: z.string().describe("Nombre del producto o servicio"),
				quantity: z.number().describe("Cantidad comprada"),
				unitPrice: z.number().describe("Precio unitario"),
				total: z.number().describe("Precio total de la línea"),
			})
		)
		.describe("Lista de items comprados"),
});

export async function processInvoice(imageBase64: string) {
	try {
		//Usamos generateText con Output.object para forzar una respuesta JSON estructurada
		const result = await generateText({
			model: google("gemini-2.5-flash"),
			messages: [
				{
					role: "user" as const,
					content: [
						{
							type: "text" as const,
							text: "Analiza esta imagen de factura y extrae los datos según el esquema.",
						},
						{ type: "image" as const, image: imageBase64 },
					],
				},
			],
			output: Output.object({ schema: invoiceSchema }),
		});

		// Devolvemos el objeto limpio (JSON)
		return { success: true, data: result.output };
	} catch (error: any) {
		console.error("Error procesando factura:", error);
		return { success: false, error: error.message };
	}
}
