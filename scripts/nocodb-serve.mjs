#!/usr/bin/env node
/**
 * Local NocoDB for B1.
 * Metadata: SQLite under NC_TOOL_DIR (isolated from business PG).
 * Do NOT pass DATABASE_URL into this process.
 */
import express from "express";
import nocodb from "nocodb";

const { Noco } = nocodb;
const port = Number(process.env.PORT || 8080);
const server = express();
server.enable("trust proxy");

const httpServer = server.listen(port, "127.0.0.1", async () => {
  try {
    server.use(await Noco.init({}, httpServer, server));
    console.log(`NocoDB listening on http://127.0.0.1:${port}`);
  } catch (err) {
    console.error("NocoDB failed to start", err);
    process.exit(1);
  }
});

httpServer.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
