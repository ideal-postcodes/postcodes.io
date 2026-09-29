import { describe, expect, it } from "vitest";
import request from "supertest";
import { postcodesioApplication } from "./helper";
import { CATALOG_CONTENT_TYPE } from "../api/config/well_known";

const app = postcodesioApplication();

describe("/.well-known/api-catalog", () => {
  it("serves an RFC 9727 linkset", async () => {
    const { headers, text } = await request(app)
      .get("/.well-known/api-catalog")
      .set("Accept", "application/linkset+json, application/json")
      .expect(200);
    expect(headers["content-type"]).toBe(CATALOG_CONTENT_TYPE);
    expect(headers["link"]).toBe(
      '</.well-known/api-catalog>; rel="api-catalog"'
    );
    expect(headers["access-control-allow-origin"]).toBe("*");
    const [entry] = JSON.parse(text).linkset;
    expect(entry.anchor).toBe("https://api.postcodes.io");
    for (const rel of ["service-desc", "service-doc", "status"]) {
      expect(entry[rel][0].href).toMatch(/^https:\/\//);
    }
  });

  it("carries the api-catalog Link on HEAD", async () => {
    const { headers } = await request(app)
      .head("/.well-known/api-catalog")
      .expect(200);
    expect(headers["link"]).toBe(
      '</.well-known/api-catalog>; rel="api-catalog"'
    );
  });
});

describe("homepage", () => {
  it("carries a Link header to the api-catalog, spec and docs", async () => {
    const { headers } = await request(app).get("/");
    const link = headers["link"];
    expect(link).toContain('</.well-known/api-catalog>; rel="api-catalog"');
    expect(link).toContain(
      '<https://api.postcodes.io/openapi.json>; rel="service-desc"'
    );
    expect(link).toContain(
      '<https://postcodes.io/docs/api>; rel="service-doc"'
    );
  });
});
