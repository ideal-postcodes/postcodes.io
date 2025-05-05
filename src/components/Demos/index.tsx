import styles from "./styles.module.css";
import React from "react";
import GetPostcode from "./getPostcode";
import PostMethod from "./postMethod";
import GetGeocode from "./getGeocode";

export default function HomepageDemos(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>API Endpoints</h2>
        </div>
        <div>
          <GetPostcode
            endpointTemplate="api.postcodes.io/postcodes/"
            linkEnd=""
            headingText="Lookup a Postcode"
            placeholder=":postcode"
            defaultPostcode="BR8 7RE"
          />

          <PostMethod
            headerText="Bulk Postcode Lookup"
            payload={{ postcodes: ["OX49 5NU", "M32 0JG", "NE30 1DP"] }}
            endpoint="api.postcodes.io/postcodes"
          />

          <GetGeocode
            endpointTemplate="api.postcodes.io/postcodes"
            headingText="Lookup Nearest Postcodes around a Point"
            longPlaceholder=":longitude"
            latPlaceholder=":latitude"
          />

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

          <GetPostcode
            endpointTemplate="api.postcodes.io/postcodes/"
            linkEnd="/nearest"
            headingText="Nearest Postcodes around a Postcode"
            placeholder=":postcode"
          />

          <GetPostcode
            endpointTemplate="api.postcodes.io/terminated_postcodes/"
            linkEnd=""
            headingText="Lookup Terminated Postcode"
            placeholder=":postcode"
          />

          <GetPostcode
            endpointTemplate="api.postcodes.io/outcodes/"
            linkEnd=""
            headingText="Lookup an Outward Code"
            placeholder=":outcode"
          />

          <GetPostcode
            endpointTemplate="api.postcodes.io/outcodes/"
            linkEnd="/nearest"
            headingText="Nearest Outward Code around an Outward Code"
            placeholder=":outcode"
          />
        </div>
      </div>
    </section>
  );
}
