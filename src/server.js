const app = require("./app");
const { testDbConnection } = require("./config/db");
const { PORT } = require("./config/misc/constants"); // Importamos el puerto de las variables de entorno

// Arrancamos el servidor comprobando que la conexión con la base de datos funciona correctamente
const startServer = async () => {
  try {
    await testDbConnection();
    app.listen(PORT, () => {
      console.log(`🔥 Servidor corriendo en puerto ${PORT} 🚀`);
    });
  } catch (error) {
    console.log("Error al arracar el servidor: ", error.message);
    process.exit(1);
  }
};

startServer();