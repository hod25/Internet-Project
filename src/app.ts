import initApp from "./server";
import https from "https";
import fs from "fs";
import http from "http";

const port = process.env.PORT;
const domainBase = process.env.DOMAIN_BASE;

const tmpFunc = async () => {
  const app = await initApp();
  if (process.env.NODE_ENV === "production") {
    app.listen(port, () => {
      console.log(`Example app listening at ${domainBase}:${port}`);
    });
  } else {
    const httpsOptions = {
      key: fs.readFileSync("./client-key.pem"),
      cert: fs.readFileSync("./client-cert.pem"),
    };
    https.createServer(httpsOptions, app).listen(port, () => {
      console.log(`Example app listening at ${domainBase}:${port}`);
    });
  }
};
tmpFunc();