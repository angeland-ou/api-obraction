const { prisma }  = require("../config/db");

async function generateUniqueSlug(name) {
    if (!name || typeof name !== 'string') {
        console.error("Se intentó generar un slug de un valor no válido:", name);
        throw new Error("El nombre de empresa es obligatorio para generar un identificador único (slug)");
    }

    const slugFromName = name
        .toLowerCase()           // paso a minúsculas
        .trim()                  // eliminamos los espacios del inicio y del final
        .replace(/\s+/g, "-")   // convertimos los espacios a guiones medios
        .replace(/[^a-z0-9-]/g, "") // eliminamos posibles caracteres especiales
        .replace(/-+/g, "-");   // convertimos varios guiones seguidos a un solo guión medio

        let slug = slugFromName;
        let counter = 1;
        // mientras no salgamos con return, estaremos en el bucle
        while(true){
            // comprobamos si hay algun tenant cuyo slug sea slugFromName
            const tenant = await prisma.tenant.findUnique({
                where: { slug }
            });
            
            // si tenant no existe salimos del bucle devolviendo el slug
            if(!tenant) return slug;

            // si tenant existe anadimos un numero
            // y lo añadimos al slugFromName
            slug = `${slugFromName}-${counter}`;
            counter++;
        }
};

module.exports = {
    generateUniqueSlug
};