import clsx from "clsx";
//@ts-ignore
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
              <h2 className={styles.header}>When Your Project Demands More</h2>
              <p>
                Postcodes.io is our free and reliable tool for UK postcode
                lookup and geocoding. When you need broader coverage, fresher{" "}
                <br />
                and more detailed address data, and expert support, Ideal
                Postcodes is built for high-demand applications
              </p>
            </div>
          </div>
        </div>
        <div className="row margin-bottom--xl">
          <div className={clsx("col col--6 margin-bottom--xl")}>
            <div className={clsx(styles.card, "text--center")}>
              <h3 className={styles.cardTitle}>Broad Coverage</h3>
              <p className={styles.cardContent}>
                Ideal Postcodes includes more than mainland UK, with additional
                territories such as the Channel Islands and Isle of Man, plus
                international datasets
              </p>
            </div>
          </div>
          <div className={clsx("col col--6 margin-bottom--xl")}>
            <div className={clsx(styles.card, "text--center")}>
              <h3 className={styles.cardTitle}>Daily Data Updates</h3>
              <p className={styles.cardContent}>
                As a licensed partner of Royal Mail and other authoritative
                sources, Ideal Postcodes delivers daily updates for the most
                current address and postcode data
              </p>
            </div>
          </div>
          <div className={clsx("col col--6 margin-bottom--xl")}>
            <div className={clsx(styles.card, "text--center")}>
              <h3 className={styles.cardTitle}>Rich Address Data</h3>
              <p className={styles.cardContent}>
                Access UK rooftop geocodes, UPRNs, and unique property datasets
                for precise, property-level information
              </p>
            </div>
          </div>
          <div className={clsx("col col--6 margin-bottom--xl")}>
            <div className={clsx(styles.card, "text--center")}>
              <h3 className={styles.cardTitle}>Dedicated Support</h3>
              <p className={styles.cardContent}>
                Enjoy technical support, account access and optional SLAs, ideal
                for business-critical applications
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
