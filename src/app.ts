import initApp from "./server";
const port = process.env.PORT;
const path = process.env.PATH;

initApp()
  .then((app) => {
    app.listen(port, () => {
      //console.log(`Example app listening at http://localhost:${port}`);
      console.log(`Example app listening at http://${path}:${port}`);
      
    });
  })
  .catch(() => {
    console.log("Error Fail starting the server");
  });


