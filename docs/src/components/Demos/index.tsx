import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";
import GetPostcode from "./getPostcode";
import PostMethod from "./postMethod";
import GetGeocode from "./getGeocode";

export default function HomepageDemos(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>API Endpoint & Methods</h2>
        </div>
        <div>
          <GetPostcode
            endpointTemplate="api.postcodes.io/postcodes/"
            linkEnd=""
            headingText="Lookup a postcode"
            placeholder=":postcode"
          />

          <PostMethod
            headerText="Bulk Postcode Lookup"
            payload={{ postcodes: ["OX49 5NU", "M32 0JG", "NE30 1DP"] }}
            endpoint="api.postcodes.io/postcodes"
          />

          <GetGeocode
            endpointTemplate="api.postcodes.io/postcodes"
            headingText="Get nearest postcodes for a given longitude & latitude"
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
            linkEnd="/validate"
            headingText="Validate a postcode"
            placeholder=":postcode"
          />

          <GetPostcode
            endpointTemplate="api.postcodes.io/postcodes/"
            linkEnd="/nearest"
            headingText="Nearest postcodes for postcode"
            placeholder=":postcode"
          />

          <GetPostcode
            endpointTemplate="api.postcodes.io/postcodes/"
            linkEnd="/autocomplete"
            headingText="Autocomplete a postcode partial"
            placeholder=":postcode"
          />

          <GetPostcode
            endpointTemplate="api.postcodes.io/postcodes?q="
            linkEnd=""
            headingText="Query for postcode"
            placeholder=":postcode"
          />

          <GetPostcode
            endpointTemplate="api.postcodes.io/terminated_postcodes/"
            linkEnd=""
            headingText="Lookup terminated postcode"
            placeholder=":postcode"
          />

          <GetPostcode
            endpointTemplate="api.postcodes.io/outcodes/"
            linkEnd=""
            headingText="Lookup Outward Code"
            placeholder=":outcode"
          />

          <GetPostcode
            endpointTemplate="api.postcodes.io/outcodes/"
            linkEnd="/nearest"
            headingText="Nearest outward code for outward code"
            placeholder=":outcode"
          />

          <GetGeocode
            endpointTemplate="api.postcodes.io/outcodes"
            headingText="Get nearest outward codes for a given longitude & latitude"
            longPlaceholder=":longitude"
            latPlaceholder=":latitude"
          />
        </div>
      </div>
    </section>
  );
}
