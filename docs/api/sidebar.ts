import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "api/api-reference-postcodes-io",
    },
    {
      type: "category",
      label: "Postcodes",
      link: {
        type: "doc",
        id: "api/postcodes",
      },
      items: [
        {
          type: "doc",
          id: "api/lookup-postcode",
          label: "Lookup Postcode",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/postcode-lookup",
          label: "Autocomplete Search a Postcode",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/nearest-postcode",
          label: "Find the Nearest Postcodes",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/random-postcode",
          label: "Get a Random Postcode",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Terminated Postcodes",
      link: {
        type: "doc",
        id: "api/terminated-postcodes",
      },
      items: [
        {
          type: "doc",
          id: "api/lookup-terminated-postcode",
          label: "Lookup Terminated Postcodes",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Scottish Postcodes",
      link: {
        type: "doc",
        id: "api/scottish-postcodes",
      },
      items: [
        {
          type: "doc",
          id: "api/get-scottish-postcode",
          label: "Lookup Scottish Postcode",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Outward Codes",
      link: {
        type: "doc",
        id: "api/outward-codes",
      },
      items: [
        {
          type: "doc",
          id: "api/find-outcode",
          label: "Find an Outward Code",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Places",
      link: {
        type: "doc",
        id: "api/places",
      },
      items: [
        {
          type: "doc",
          id: "api/place-query",
          label: "Find a Place",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/find-place",
          label: "Find a Place by ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/random-place",
          label: "Retrieve a Random Place",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Postcode Query",
      items: [
        {
          type: "doc",
          id: "api/bulk-postcode-lookup",
          label: "Bulk Postcode Lookup",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
