import "dotenv/config";

import { createApp } from "./app.js";
import { startBackgroundWorkers } from "./start-workers.js";

const port = Number(process.env.PORT) || 5000;
const app = createApp();

app.listen(port, () => {
  console.log(`🚀 Backend started on http://localhost:${port}`);
  startBackgroundWorkers();
});
