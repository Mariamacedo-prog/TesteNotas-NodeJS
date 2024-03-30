
import express, { Express, Request, Response } from "express";
import cors from "cors";
import path from 'path';

const server: Express = express();

// CORS
const corsOptions: cors.CorsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
};

server.use(cors(corsOptions));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Static files
server.use(express.static(path.join(__dirname, 'public')));

// routes API 
server.use("/", (req: Request, res: Response) => {
  res.json({ pong: true });
});

// Start the server
const PORT: number = parseInt(process.env.PORT || '3000');
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});