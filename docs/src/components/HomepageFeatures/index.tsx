import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  imgUrl: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Open Source",
    imgUrl: "img/github.png",
    description: (
      <>
        MIT licensed. Maintained and freely available on{" "}
        <a
          href="https://github.com/ideal-postcodes/postcodes.io"
          target="_blank"
        >
          GitHub
        </a>
        . Fork it, make a contribution or even set up your own
      </>
    ),
  },
  {
    title: "Regularly Updated",
    imgUrl: "img/map.png",
    description: (
      <>
        Updated with the latest data from Ordnance Survey and Office for
        National Statistics when it becomes available
      </>
    ),
  },
  {
    title: "Convenient Methods",
    imgUrl: "img/cmd.png",
    description: (
      <>
        Simple, useful and self-explanatory API methods like bulk reverse
        geocoding, autocomplete and validation
      </>
    ),
  },
];

function Feature({ title, imgUrl, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <img src={imgUrl} className={styles.featureSvg} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={clsx(styles.intro, "row")}>
          <p>
            A short paragraph about postcodes.io and something like built by
            developers for developers. e.g Postcodes.io is an open-source
            project maintained by Ideal Postcodes, offering a free resource for
            developers to query UK postcode data via a JSON HTTP API.{" "}
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
