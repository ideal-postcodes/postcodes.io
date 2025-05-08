import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";

import styles from "./index.module.css";
import HomepageDemos from "../components/Demos";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.btnContainer}>
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/docs/intro"
            >
              Star
            </Link>
          </div>
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/docs/intro"
            >
              Fork
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <section className={styles.section}>
          <div className="container">
            <div className="row">
              <div className="col">
                <h2 className="text--center">How to use Postcodes.io</h2>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <h3 className="text--center">Use Our Endpoints </h3>
                <p className="text--center">
                  Easiest and quickest way to get started is to use our public,
                  hosted endpoints to query data directly. No installation
                  required
                </p>
              </div>
              <div className="col">
                <h3 className="text--center">Self-host the Service </h3>
                <p className="text--center">
                  For complete control over the data and environment, just clone
                  the repository and run it on your own servers. SQL?
                </p>
              </div>
              <div className="col">
                <h3 className="text--center">Contribute or Fork </h3>
                <p className="text--center">
                  We love community input! Tailor Postcodes.io to your needs by
                  adding features or modify the functionality.
                </p>
              </div>
            </div>
            <div className="row" style={{ marginTop: "3rem" }}>
              <div className="col text--center">
                <HomepageDemos />
                <Link
                  className="button button--primary button--lg"
                  to="/docs/overview"
                >
                  View the Documentation
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className={styles.sectionAlt}>
          <div className="container">
            <div className="row">
              <div className="col col--6 col--offset-3">
                <h3 className="text--center">
                  When You Need More Than Open Data
                </h3>
                <p className="text--center">
                  Postcodes.io is a free, open source API for postcode data.
                  It's a great way to get started with postcode data, but if you
                  need more, we recommend using a commercial postcode service.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className={styles.section}>
          <div className="container">
            <div className="row">
              <div className="col">
                <h2 className="text--center">
                  Here&apos;s why developers upgrade
                </h2>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <table className={styles.comparisonTable}>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Postcodes.io</th>
                      <th>Ideal Postcodes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Coverage</td>
                      <td>Mainland UK</td>
                      <td>Mainland UK + additional British Isles coverage</td>
                    </tr>
                    <tr>
                      <td>Data Updates</td>
                      <td>Updated periodically as Ordnance Survey & ONS data becomes public</td>
                      <td>Licensed partner of royal mail and other data sources with daily updates</td>
                    </tr>
                    <tr>
                      <td>Scale</td>
                      <td>No rate limits. Great for prototypes, small/medium projects</td>
                      <td>Capacity for high-volume lookups and critical applications</td>
                    </tr>
                    <tr>
                      <td>Reliability</td>
                      <td>Sporadically maintained</td>
                      <td>High availability, and 99.99% uptime guarantee</td>
                    </tr>
                    <tr>
                      <td>Support</td>
                      <td>Self-serve docs and community support</td>
                      <td>Account access, priority technical support and SLAs available</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="row" style={{ marginTop: '3rem' }}>
              <div className="col text--center">
                <a
                  className="button button--primary button--lg"
                  href="https://ideal-postcodes.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explore Ideal Postcodes
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
