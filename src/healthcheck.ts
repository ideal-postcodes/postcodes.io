import http from "http";

const prefix = process.env.URL_PREFIX === undefined ? "" : process.env.URL_PREFIX

const options = {
  host: "localhost",
  port: process.env.PORT,
  method: "GET",
  timeout: 2000,
  path: `${prefix}/ping`,
};

http
  .request(options, (response) => {
    if (response.statusCode === 200) return process.exit(0);
    return process.exit(1);
  })
  .on("error", (error) => {
    console.log(
      `Healthcheck failed to ${options.host}:${options.port}/ping: ${error}`
    );
    return process.exit(1);
  })
  .end();
