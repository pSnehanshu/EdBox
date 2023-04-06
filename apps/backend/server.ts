import "dotenv/config";
import http from "http";
import app from "./express";
import initSocketIo from "./socketio";

const port = parseInt(process.env.PORT ?? "5080", 10);

// Initializing the HTTP server
const httpServer = http.createServer(app);
httpServer.listen(port, () => console.log(`Running on port ${port}`));

// Initializing Socket.io server
initSocketIo(httpServer);
