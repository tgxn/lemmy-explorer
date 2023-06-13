// wrapper for PM2
import { start } from "./src/main.js";

const args = process.argv.slice(2);
start(args);
