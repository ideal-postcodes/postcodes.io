import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";
import React from "react";

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <div className={clsx("col col--4")}>
            <div className="text--center">
              <img src="img/opensource.png" className={styles.featureSvg} />
            </div>
            <div className="text--center padding-horiz--md">
              <Heading as="h3">Open Source</Heading>
              <p>
                MIT licensed. Maintained and freely available on{" "}
                <a
                  href="https://github.com/ideal-postcodes/postcodes.io"
                  target="_blank"
                >
                  GitHub
                </a>
                . Fork it, make a contribution or even set up your own
              </p>
            </div>
          </div>
          <div className={clsx("col col--4")}>
            <div className="text--center">
              <img src="img/database.png" className={styles.featureSvg} />
            </div>
            <div className="text--center padding-horiz--md">
              <Heading as="h3">Regularly Updated</Heading>
              <p>
                Updated with the latest data from Ordnance Survey and Office for
                National Statistics when it becomes available
              </p>
            </div>
          </div>
          <div className={clsx("col col--4")}>
            <div className="text--center">
              <img src="img/code.png" className={styles.featureSvg} />
            </div>
            <div className="text--center padding-horiz--md">
              <Heading as="h3">Convenient Methods</Heading>
              <p>
                Simple, useful and self-explanatory API methods like bulk
                reverse geocoding, autocomplete and validation
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
