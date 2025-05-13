import clsx from "clsx";
//@ts-ignore
import Heading from "@theme/Heading";
//@ts-ignore
import styles from "./styles.module.css";
import React from "react";

export default function HomepageProducts(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <div className="col col--12 text--center">
            <Heading as="h2" className="margin-bottom--xl">
              API Endpoints and methods
            </Heading>
          </div>
        </div>
        <div className="row margin-bottom--xl">
          <div className={clsx("col col--4")}>
            <div className="text--center padding-horiz--md">
              <Heading as="h3">Postcode Validation</Heading>
              <p>
                Quickly confirm if a UK postcode is valid, find nearest
                postcodes or lookup outward codes
              </p>
            </div>
          </div>
          <div className={clsx("col col--4")}>
            <div className="text--center padding-horiz--md">
              <Heading as="h3">Bulk Reverse Geocoding</Heading>
              <p>
                Convert large sets of lat/long coordinates into their nearest
                postcode areas
              </p>
            </div>
          </div>
          <div className={clsx("col col--4")}>
            <div className="text--center padding-horiz--md">
              <Heading as="h3">Geographical & Demographic Data</Heading>
              <p>
                Retrieve region, boundary, and administrative details for any
                given postcode
              </p>
            </div>
          </div>
        </div>
        <div className="row margin-top--xl">
          <div className="col col--12 text--center gap-4">
            <a
              href="/products"
              className="button button--primary button--lg margin-right--md"
            >
              Try it now
            </a>
            <a
              href="/docs/overview"
              className="button button--secondary button--lg"
            >
              Documentation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
