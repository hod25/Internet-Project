import initApp from "./server";
import https from "https";
import fs from "fs";
import http from "http";

const port = process.env.PORT;
const domainBase = process.env.DOMAIN_BASE;

const tmpFunc = async () => {
  try {
    const app = await initApp();
    if (process.env.NODE_ENV === "production") {
      app.listen(port, () => {
        console.log(`Example app listening at ${domainBase}:${port}`);
      });
    } else {
      const keyPath = "./certificates/client-key.pem";
      const certPath = "./certificates/client-cert.pem";

      if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
        console.error("Certificate files not found at the specified path.");
        return;
      }

      const httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),      
      };
      https.createServer(httpsOptions, app).listen(port, () => {
        console.log(`Example app listening at ${domainBase}:${port}`);
      });
    }
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};
tmpFunc();