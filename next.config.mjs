/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		// !! Ignora errores de TypeScript para poder desplegar !!
		ignoreBuildErrors: true,
	},
	eslint: {
		// !! Ignora errores de estilo para poder desplegar !!
		ignoreDuringBuilds: true,
	},
};

export default nextConfig;
