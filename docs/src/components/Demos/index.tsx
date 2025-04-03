import { useState } from "react";
import styles from "./styles.module.css";
import GetPostcode from "./getPostcode";
import PostMethod from "./postMethod";
import GetGeocode from "./getGeocode";

const demos = [
  {
    id: "postcode-lookup",
    name: "Lookup a Postcode",
    component: () => (
      <GetPostcode
        endpointTemplate="api.postcodes.io/postcodes/"
        linkEnd=""
        headingText="Lookup a postcode"
        placeholder=":postcode"
      />
    ),
  },
  {
    id: "bulk-lookup",
    name: "Bulk Postcode Lookup",
    component: () => (
      <PostMethod
        headerText="Bulk Postcode Lookup"
        payload={{ postcodes: ["OX49 5NU", "M32 0JG", "NE30 1DP"] }}
        endpoint="api.postcodes.io/postcodes"
      />
    ),
  },
  {
    id: "geocode-lookup",
    name: "Reverse Geocoding",
    component: () => (
      <GetGeocode
        endpointTemplate="api.postcodes.io/postcodes"
        headingText="Get nearest postcodes for a given longitude & latitude"
        longPlaceholder=":longitude"
        latPlaceholder=":latitude"
      />
    ),
  },
  {
    id: "bulk-reverse-geocoding",
    name: "Bulk Reverse Geocoding",
    component: () => (
      <PostMethod
        headerText="Bulk Reverse Geocoding"
        payload={{
          geolocations: [
            {
              longitude: 0.629834723775309,
              latitude: 51.7923246977375,
            },
            {
              longitude: -2.49690382054704,
              latitude: 53.5351312861402,
              radius: 1000,
              limit: 5,
            },
          ],
        }}
        endpoint="api.postcodes.io/postcodes"
      />
    ),
  },
  {
    id: "nearest-postcode",
    name: "Nearest Postcodes for Postcode",
    component: () => (
      <GetPostcode
        endpointTemplate="api.postcodes.io/postcodes/"
        linkEnd="/nearest"
        headingText="Nearest postcodes for postcode"
        placeholder=":postcode"
      />
    ),
  },
  {
    id: "terminated-postcode",
    name: "Lookup Terminated Postcode",
    component: () => (
      <GetPostcode
        endpointTemplate="api.postcodes.io/terminated_postcodes/"
        linkEnd=""
        headingText="Lookup terminated postcode"
        placeholder=":postcode"
      />
    ),
  },
  {
    id: "outcode-lookup",
    name: "Lookup Outward Code",
    component: () => (
      <GetPostcode
        endpointTemplate="api.postcodes.io/outcodes/"
        linkEnd=""
        headingText="Lookup Outward Code"
        placeholder=":outcode"
      />
    ),
  },
  {
    id: "nearest-outcode",
    name: "Nearest Outward Code",
    component: () => (
      <GetPostcode
        endpointTemplate="api.postcodes.io/outcodes/"
        linkEnd="/nearest"
        headingText="Nearest outward code for outward code"
        placeholder=":outcode"
      />
    ),
  },
  {
    id: "geocode-outcode",
    name: "Reverse Geocoding for Outcodes",
    component: () => (
      <GetGeocode
        endpointTemplate="api.postcodes.io/outcodes"
        headingText="Get nearest outward codes for a given longitude & latitude"
        longPlaceholder=":longitude"
        latPlaceholder=":latitude"
      />
    ),
  },
];

export default function HomepageDemos(): JSX.Element {
  const [selectedDemo, setSelectedDemo] = useState(demos[0].id);

  const currentDemo = demos.find((demo) => demo.id === selectedDemo);

  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>API Endpoint & Methods</h2>
          <select
            value={selectedDemo}
            onChange={(e) => setSelectedDemo(e.target.value)}
            className={styles.demoSelect}
          >
            {demos.map((demo) => (
              <option key={demo.id} value={demo.id}>
                {demo.name}
              </option>
            ))}
          </select>
        </div>
        <div>{currentDemo?.component()}</div>
      </div>
    </section>
  );
}
