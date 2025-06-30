// @ts-ignore
import styles from "./styles.module.css";
import React from "react";
import GetPostcode from "./getPostcode";
import PostMethod from "./postMethod";
import GetGeocode from "./getGeocode";

export default function EndpointsDemo(): React.JSX.Element {
  return (
    <section className={styles.endpointsSection}>
      <div className={styles.container}>

        {/* Postcode Validation */}
        <div className={styles.categoryCard}>
          <div className={styles.categoryHeader}>
            <div className={styles.categoryIcon}>
              <img src="img/verification.png" alt="Verification" />
            </div>
            <div>
              <h2 className={styles.categoryTitle}>Postcode Validation</h2>
              <p className={styles.categoryDescription}>
                Validate, lookup, and search UK postcodes with comprehensive geographic data
              </p>
            </div>
          </div>
          <div className={styles.demoGroup}>
            <GetPostcode
              endpointTemplate="api.postcodes.io/postcodes/"
              linkEnd=""
              headingText="Lookup a Postcode"
              placeholder=":postcode"
              defaultPostcode="BR8 7RE"
            />
            <div className={styles.mobileDivider}></div>
            <GetPostcode
              endpointTemplate="api.postcodes.io/terminated_postcodes/"
              linkEnd=""
              headingText="Lookup Terminated Postcode"
              placeholder=":postcode"
            />
            <div className={styles.mobileDivider}></div>
            <GetPostcode
              endpointTemplate="api.postcodes.io/outcodes/"
              linkEnd=""
              headingText="Lookup an Outward Code"
              placeholder=":outcode"
              defaultPostcode="BR8"
            />
            <div className={styles.mobileDivider}></div>
            <PostMethod
              headerText="Bulk Postcode Lookup"
              payload={{ postcodes: ["OX49 5NU", "M32 0JG", "NE30 1DP"] }}
              endpoint="api.postcodes.io/postcodes"
            />
          </div>
        </div>

        {/* Bulk Reverse Geocoding */}
        <div className={styles.categoryCard}>
          <div className={styles.categoryHeader}>
            <div className={styles.categoryIcon}>
              <img src="img/reverse_geocoding.png" alt="Reverse Geocoding" />
            </div>
            <div>
              <h2 className={styles.categoryTitle}>Reverse Geocoding</h2>
              <p className={styles.categoryDescription}>
                Convert coordinates to postcodes and find nearest locations
              </p>
            </div>
          </div>
          <div className={styles.demoGroup}>
            <GetGeocode
              endpointTemplate="api.postcodes.io/postcodes"
              headingText="Lookup Nearest Postcodes around a Point"
              longPlaceholder=":longitude"
              latPlaceholder=":latitude"
            />
            <div className={styles.mobileDivider}></div>
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
        <div className={styles.categoryCard}>
          <div className={styles.categoryHeader}>
            <div className={styles.categoryIcon}>
              <img src="img/data.png" alt="Data" />
            </div>
            <div>
              <h2 className={styles.categoryTitle}>Geographical & Demographic Data</h2>
              <p className={styles.categoryDescription}>
                Access detailed administrative boundaries and demographic information
              </p>
            </div>
          </div>
          <div className={styles.demoGroup}>
            <GetPostcode
              endpointTemplate="api.postcodes.io/postcodes/"
              linkEnd="/nearest"
              headingText="Find Nearest Postcodes"
              placeholder=":postcode"
              defaultPostcode="BR87RE"
            />
            <div className={styles.mobileDivider}></div>
            <GetPostcode
              endpointTemplate="api.postcodes.io/postcodes/"
              linkEnd="/nearest"
              headingText="Nearest Postcodes around a Postcode"
              placeholder=":postcode"
            />
            <div className={styles.mobileDivider}></div>
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
