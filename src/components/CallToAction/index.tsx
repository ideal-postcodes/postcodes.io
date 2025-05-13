import clsx from "clsx";
//@ts-ignore
import Heading from "@theme/Heading";
//@ts-ignore
import styles from "./styles.module.css";
import React from "react";

export default function CallToAction(): JSX.Element {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className="row margin-bottom--xl">
          <div className="col col--12 d-flex align-items-center justify-content-center">
            <div className="text--center">
              <Heading as="h2" className="margin-bottom--md">
                When You Need More Than Open Data
              </Heading>
              <p>
                Some projects outgrow what free data alone can offer. While our
                free service is robust, your project might benefit <br />
                from a more comprehensive solution. Ideal Postcodes offers
                several key advantages.
              </p>
            </div>
          </div>
        </div>
        <div className="row margin-bottom--xl">
          <div className={clsx("col col--6 margin-bottom--xl")}>
            <div className="text--center padding-horiz--md">
              <Heading as="h3">Broader Coverage</Heading>
              <p>
                Includes mainland UK plus additional territories such as the
                Channel Islands and Isle of Man
              </p>
            </div>
          </div>
          <div className={clsx("col col--6 margin-bottom--xl")}>
            <div className="text--center padding-horiz--md">
              <Heading as="h3">Daily Data Updates</Heading>
              <p>
                Licensed partner of Royal mail and other authoritative data
                sources with daily updates
              </p>
            </div>
          </div>
          <div className={clsx("col col--6 margin-bottom--xl")}>
            <div className="text--center padding-horiz--md">
              <Heading as="h3">Enhanced Address Data</Heading>
              <p>
                Access UK rooftop geocodes, UPRNs and more unique property
                datasets
              </p>
            </div>
          </div>
          <div className={clsx("col col--6 margin-bottom--xl")}>
            <div className="text--center padding-horiz--md">
              <Heading as="h3">Dedicated Support</Heading>
              <p>
                Includes account access, technical support, and optional SLAs
              </p>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col col--12 text--center">
            <a
              href="https://ideal-postcodes.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="button button--primary button--lg"
            >
              Explore Ideal Postcodes
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
