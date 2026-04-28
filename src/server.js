const app = require("./app");
const { testDbConnection } = require("./config/db");
const { PORT } = require("./config/misc/constants");

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