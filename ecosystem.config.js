module.exports = {
  apps : [{
    name   : "Internet-Project",
    script : "./dist/src/app.js",
    env_production: {
      NODE_ENV: "production", 
  }
}]
};
