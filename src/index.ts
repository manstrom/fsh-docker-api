import { app } from "./app";
import { seedDb } from "./db/database";

const PORT = process.env.PORT || 3000;

seedDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/docs`);
  });
}).catch(console.error);