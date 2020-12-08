import * as net from "net";
import { assert } from "chai";
import { postcodesioApplication } from "./helper";

describe("Malformed request", () => {
  before(() => {
    postcodesioApplication().listen(8001);
  });

  it("returns a 400 response in node 6 and greater", (done) => {
    const majorVersion = parseInt(
      process.version.replace(/[a-z]/gi, "").split(".")[0],
      10
    );

    if (majorVersion < 6) return done(); // Skip if node < 6.x

    let dataReceived = false;

    const client = net
      .connect({ port: 8001 })
      .on("connect", () => {
        client.write("GET /fo o HTTP/1.1\r\n");
        client.write("Host: www.example.com\r\n");
        client.write(
          "User-Agent: Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)\r\n\r\n\r\n\r\n"
        );
      })
      .on("data", (data) => {
        dataReceived = true;
        assert.match(data.toString(), /400\sBad\sRequest/);
      })
      .on("close", () => {
        if (!dataReceived) return done(new Error("Did not receive 400"));
        done();
      })
      .on("error", done);
  });
});
