import { RequestHandler } from "express";

// RFC 9727 API catalog and RFC 8288 homepage Link header. Served on both
// postcodes.io and api.postcodes.io (same app).

export const API_CATALOG_PATH = "/.well-known/api-catalog";

export const catalog = {
  linkset: [
    {
      anchor: "https://api.postcodes.io",
      "service-desc": [
        {
          href: "https://api.postcodes.io/openapi.json",
          type: "application/json",
        },
      ],
      "service-doc": [
        { href: "https://postcodes.io/docs/api", type: "text/html" },
      ],
      status: [
        { href: "https://api.postcodes.io/ready", type: "application/json" },
      ],
    },
  ],
};

const CATALOG_BODY = Buffer.from(JSON.stringify(catalog, null, 2));

export const CATALOG_CONTENT_TYPE =
  'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"';

export const HOMEPAGE_LINK = [
  `<${API_CATALOG_PATH}>; rel="api-catalog"`,
  '<https://api.postcodes.io/openapi.json>; rel="service-desc"; type="application/json"',
  '<https://postcodes.io/docs/api>; rel="service-doc"; type="text/html"',
].join(", ");

// Express answers HEAD with this handler too, keeping the Link header on HEAD.
// A Buffer body keeps the Content-Type exact: res.json would replace it and a
// string body gets "; charset=utf-8" appended.
export const apiCatalog: RequestHandler = (_, response) => {
  response
    .set({
      "Content-Type": CATALOG_CONTENT_TYPE,
      Link: `<${API_CATALOG_PATH}>; rel="api-catalog"`,
      "Cache-Control": "public, max-age=3600",
    })
    .send(CATALOG_BODY);
};

export const homepageLink: RequestHandler = (_, response, next) => {
  response.set("Link", HOMEPAGE_LINK);
  next();
};
