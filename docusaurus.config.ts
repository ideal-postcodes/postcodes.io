import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Postcodes.io",
  tagline:
    "Search, validate and geolocate UK postcodes. Retrieve the latest administrative and geospatial information for postcodes",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://postcodes.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "ideal-postcodes", // Usually your GitHub org/user name.
  projectName: "postcodes.io", // Usually your repo name.

  onBrokenLinks: "throw",

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          docItemComponent: "@theme/ApiItem", // Fix for docusaurus-openapi-docs
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/postcodesio.png",
    navbar: {
      title: "Postcodes.io",
      logo: {
        alt: "Postcodes.io Logo",
        src: "img/house.png",
      },
      items: [
        {
          position: "left",
          label: "Endpoints",
          to: "/endpoints",
        },
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Documentation",
        },
        {
          position: "left",
          label: "API",
          to: "/docs/api",
        },
        {
          to: "https://status.ideal-postcodes.co.uk",
          label: "Status",
          target: "_blank",
          position: "right",
        },
        {
          to: "https://blog.ideal-postcodes.co.uk/tag/postcodes-io",
          label: "Blog",
          target: "_blank",
          position: "right",
        },
        {
          href: "https://github.com/ideal-postcodes/postcodes.io",
          label: "GitHub",
          position: "right",
          target: "_blank",
        },
      ],
    },
    footer: {
      style: "dark",

      logo: {
        alt: "Ideal Postcodes",
        src: "img/iddqd-logo-white.svg",
        href: "https://ideal-postcodes.co.uk",
        width: 120,
        height: 80,
      },

      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Overview",
              to: "/docs/overview",
            },
            {
              label: "Self Hosting",
              to: "/docs/self-host",
            },
            {
              label: "Licences",
              to: "/docs/licences",
            },
          ],
        },
        {
          title: "API",
          items: [
            {
              label: "API Reference",
              to: "/docs/api",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Help",
              href: "https://ideal-postcodes.co.uk/support",
            },
            {
              label: "Issue Tracker",
              href: "https://github.com/ideal-postcodes/postcodes.io/issues",
            },
            {
              label: "Libraries",
              to: "/docs/libraries",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/ideal-postcodes/postcodes.io",
            },
            {
              label: "Changelog",
              href: "https://github.com/ideal-postcodes/postcodes.io/blob/master/CHANGELOG.md",
            },
            {
              label: "Ideal Postcodes",
              href: "https://ideal-postcodes.co.uk",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()}`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["http"],
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    [
      "docusaurus-plugin-openapi-docs",
      {
        id: "api",
        docsPluginId: "classic",
        config: {
          ideal: {
            specPath: "static/openapi.yaml",
            outputDir: "docs/api",
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
          },
        },
      },
    ],
  ],

  themes: ["docusaurus-theme-openapi-docs"],
};

export default config;
