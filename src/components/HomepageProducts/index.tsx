import clsx from "clsx";
//@ts-ignore
import styles from "./styles.module.css";
import React from "react";

export default function HomepageProducts(): React.JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <div className="col col--12 text--center">
            <div className="text--center">
              <img src="img/api.png" className={styles.featureSvg} />
            </div>
            <h2 className={styles.header}>API Endpoints</h2>
          </div>
        </div>
        <div className={styles.splitContainer}>
          <div className={clsx(styles.featureCard, styles.featuredCard)}>
            <div className={styles.featuredContent}>
              <div className={styles.featuredText}>
                <h3 className={styles.featuredLabel}>Postcode Validation</h3>
                <p className={styles.featuredDescription}>
                  Quickly confirm if a UK postcode is valid, find nearest
                  postcodes or lookup outward codes. Our validation API handles
                  all UK postcode formats and provides detailed responses with
                  comprehensive geographic data.
                </p>
                <div className={styles.featuredCta}>
                  <a href="/docs/postcode/lookup" className={styles.learnMore}>
                    Learn more →
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.smallCardsContainer}>
            <div className={clsx(styles.featureCard, styles.smallCard)}>
              <h3 className={styles.pointLabel}>Bulk Reverse Geocoding</h3>
              <p>
                Convert large sets of lat/long coordinates into their nearest
                postcode areas
              </p>
            </div>
            <div className={clsx(styles.featureCard, styles.smallCard)}>
              <h3 className={styles.pointLabel}>
                Geographical & Demographic Data
              </h3>
              <p>
                Retrieve region, boundary, and administrative details for any
                given postcode
              </p>
            </div>
          </div>
        </div>
        <div className="row margin-top--xl">
          <div className="col col--12 text--center">
            <div className={styles.buttonContainer}>
              <a
                href="/products"
                className="button button--primary button--lg"
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
      </div>
    </section>
  );
}
