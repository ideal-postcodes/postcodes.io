import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";
import GetPostcode from "./getPostcode";
import PostMethod from "./postMethod";

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

          <PostMethod />

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
        </div>
      </div>
    </section>
  );
}
