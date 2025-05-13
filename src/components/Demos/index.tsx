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

        {/* Postcode Validation */}
        <div className={styles.category}>
          <h3>Postcode Validation</h3>
          <div className={styles.demoGroup}>
            <GetPostcode
              endpointTemplate="api.postcodes.io/postcodes/"
              linkEnd=""
              headingText="Lookup a Postcode"
              placeholder=":postcode"
              defaultPostcode="BR8 7RE"
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
            <PostMethod
              headerText="Bulk Postcode Lookup"
              payload={{ postcodes: ["OX49 5NU", "M32 0JG", "NE30 1DP"] }}
              endpoint="api.postcodes.io/postcodes"
            />
          </div>
        </div>

        {/* Bulk Reverse Geocoding */}
        <div className={styles.category}>
          <h3>Bulk Reverse Geocoding</h3>
          <div className={styles.demoGroup}>
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
          </div>
        </div>

        {/* Geographical & Demographic Data */}
        <div className={styles.category}>
          <h3>Geographical & Demographic Data</h3>
          <div className={styles.demoGroup}>
            <GetPostcode
              endpointTemplate="api.postcodes.io/postcodes/"
              linkEnd="/nearest"
              headingText="Find Nearest Postcodes"
              placeholder=":postcode"
              defaultPostcode="BR8 7RE"
            />
            <GetPostcode
              endpointTemplate="api.postcodes.io/postcodes/"
              linkEnd="/nearest"
              headingText="Nearest Postcodes around a Postcode"
              placeholder=":postcode"
            />
            <GetPostcode
              endpointTemplate="api.postcodes.io/outcodes/"
              linkEnd="/nearest"
              headingText="Nearest Outward Code around an Outward Code"
              placeholder=":outcode"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
