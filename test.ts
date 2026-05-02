import { infer } from "./lib/vercel-ai.ts";
import "dotenv/config";

infer("Convert the following string to lowercase:Hello World")
  .then(console.log)
  .catch(console.error);
