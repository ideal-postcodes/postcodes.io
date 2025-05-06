## [17.2.1](https://github.com/ideal-postcodes/postcodes.io/compare/17.2.0...17.2.1) (2025-04-17)


### Bug Fixes

* **OpenAPI:** Update spec ([c9bbda8](https://github.com/ideal-postcodes/postcodes.io/commit/c9bbda8abc8a65741a127dd0183fefc12a9a87bd))

# [17.2.0](https://github.com/ideal-postcodes/postcodes.io/compare/17.1.2...17.2.0) (2025-04-10)


### Bug Fixes

* **CCGs:** Add missing CCG for IoM ([d1fc128](https://github.com/ideal-postcodes/postcodes.io/commit/d1fc128a0a10ca629152c6153d78958f40e75a0b))
* **NUTS/ITL:** Update ITL for Feb 2025 ([a3fbd34](https://github.com/ideal-postcodes/postcodes.io/commit/a3fbd3466845fa4e7f9bf7b71ef1cd0b062b5e0d))


### Features

* **ONSPD:** Bump to Feb 2025 ([db8dd65](https://github.com/ideal-postcodes/postcodes.io/commit/db8dd65a4c76f6f4a7983b7e86b1c69a39351c7b))

## [17.1.2](https://github.com/ideal-postcodes/postcodes.io/compare/17.1.1...17.1.2) (2025-02-05)


### Bug Fixes

* **Constituency:** Fix encoding issues ([dbb5ced](https://github.com/ideal-postcodes/postcodes.io/commit/dbb5cedeaa17bc36a241b24be4b123d02ea0f5d8))

## [17.1.1](https://github.com/ideal-postcodes/postcodes.io/compare/17.1.0...17.1.1) (2025-01-20)


### Bug Fixes

* **Constituencies:** Fix encoding for Ynys Môn ([d9e48ca](https://github.com/ideal-postcodes/postcodes.io/commit/d9e48cab88475c53479c5d14e5ec7e14a39f6994))

# [17.1.0](https://github.com/ideal-postcodes/postcodes.io/compare/17.0.1...17.1.0) (2025-01-06)


### Features

* **ONSPD:** Update Nov 2024 ([5eaed7c](https://github.com/ideal-postcodes/postcodes.io/commit/5eaed7c60aa9d981e19c317a27fd48f857a823e7))

## [17.0.1](https://github.com/ideal-postcodes/postcodes.io/compare/17.0.0...17.0.1) (2024-10-09)


### Bug Fixes

* **ONSPD:** Aug 2024 v2 release drops BUASD ([71ed982](https://github.com/ideal-postcodes/postcodes.io/commit/71ed982126268e6e1b53b82f6ac9fd95cf10917f))
* **ONSPD:** Bump for updated Aug 2024 ONSPD ([46210f6](https://github.com/ideal-postcodes/postcodes.io/commit/46210f638d6c333545c50884794051724557eecc))

# [17.0.0](https://github.com/ideal-postcodes/postcodes.io/compare/16.0.1...17.0.0) (2024-09-30)


### Bug Fixes

* **Constituencies:** Update Westminster Constituencies ([a1d3c1e](https://github.com/ideal-postcodes/postcodes.io/commit/a1d3c1e164d603bbe5d07cbdf558d71e0d5f276f))


### Features

* **ONSPD Aug 2024:** Update pg_dump ([fabc7ee](https://github.com/ideal-postcodes/postcodes.io/commit/fabc7ee2b95d0e43292e29bd8a7f9c238dd98610))


### BREAKING CHANGES

* **Constituencies:** - ONSPD now reports 2024 Westminster Constituencies. 2014 data is no
  longer available
- Both `parliamentary_constituency` and
  `parliamentary_constituency_2024` will now reference the 2024 constituencies

## [16.0.1](https://github.com/ideal-postcodes/postcodes.io/compare/16.0.0...16.0.1) (2024-05-31)


### Bug Fixes

* **Support Tables:** Rebuild constituency table ([ebcfc19](https://github.com/ideal-postcodes/postcodes.io/commit/ebcfc1990c340b7b2caeecd6322ec653a319f06b))

# [16.0.0](https://github.com/ideal-postcodes/postcodes.io/compare/15.5.1...16.0.0) (2024-05-28)


### Bug Fixes

* **Westminster:** Add missing Scottish Westminster constituencies ([b7b39a3](https://github.com/ideal-postcodes/postcodes.io/commit/b7b39a341c4b2c25de83167c8cf11f121f3cac17))


### Features

* **ONSPD May:** Update for May 2024 ([3d8f66d](https://github.com/ideal-postcodes/postcodes.io/commit/3d8f66d2f33e27a4b73eac92174122773e339692))
* **Postgres:** Upgrade to Postgresql 16 ([c770882](https://github.com/ideal-postcodes/postcodes.io/commit/c7708823943c5e183671daeadbcb90c78f554a1a))


### BREAKING CHANGES

* **Postgres:** Migrates Postgresql from 10 to 16
(postgis/postgis:16-3.4)

## [15.5.1](https://github.com/ideal-postcodes/postcodes.io/compare/15.5.0...15.5.1) (2024-03-06)


### Bug Fixes

* **2024 Constituency:** Apply IDs to 2024 field ([52fa74e](https://github.com/ideal-postcodes/postcodes.io/commit/52fa74e57e90d4e9e3a008acd2fc04faef9a7624))
* **Constituencies:** Put 2024 Cons in separate field ([871b189](https://github.com/ideal-postcodes/postcodes.io/commit/871b189d722e04c89d455b9bffc798e69c33aeb0))

# [15.5.0](https://github.com/ideal-postcodes/postcodes.io/compare/15.4.1...15.5.0) (2024-03-01)


### Features

* **2024 Constituencies:** Apply expected 2024 Westminster ([20ad61a](https://github.com/ideal-postcodes/postcodes.io/commit/20ad61a527b4af32f35c5de2943e17ae91f7c5db))
* **ONSPD:** Bump to Feb 2024 ([00eec21](https://github.com/ideal-postcodes/postcodes.io/commit/00eec21f36360fbafab67186311eb845bb106161))

## [15.4.1](https://github.com/ideal-postcodes/postcodes.io/compare/15.4.0...15.4.1) (2024-02-07)


### Bug Fixes

* **Nov 2023:** Rebuild release for NUTS/ITL ([ba78b97](https://github.com/ideal-postcodes/postcodes.io/commit/ba78b973ea5d06000649a88c1484b4c2fbd95b15))
* **NUTS:** Update NUTS/ITL ([4cf64ea](https://github.com/ideal-postcodes/postcodes.io/commit/4cf64ea309422c23497a006473cd69ab4d57edfc))

# [15.4.0](https://github.com/ideal-postcodes/postcodes.io/compare/15.3.0...15.4.0) (2024-01-31)


### Bug Fixes

* **CI:** Drop test in release step ([9c0f2c8](https://github.com/ideal-postcodes/postcodes.io/commit/9c0f2c8a44623426d5b94afecf35a65c8ff5db7f))
* **Node:** Bump to v20 ([46d5af2](https://github.com/ideal-postcodes/postcodes.io/commit/46d5af2a68ca1680c9c9ede67601edb4d91e0991))
* **ONSPD Aug 2023:** Update CCGs ([3191842](https://github.com/ideal-postcodes/postcodes.io/commit/3191842431f8a1c2be32d05a05b82ca21ddf65af))


### Features

* **NUTS/ITL:** Update names ([837a951](https://github.com/ideal-postcodes/postcodes.io/commit/837a9518782b5920b590a7f65d567e9f86afbd57))
* **ONSPD:** Update for Nov 2023 ([af1c922](https://github.com/ideal-postcodes/postcodes.io/commit/af1c922f4ed36ef2ba39052beef1a1062a49d5cc))
* **Parish:** Update for 2023 ([c15a1c1](https://github.com/ideal-postcodes/postcodes.io/commit/c15a1c1ca0ec75d1e4082503db5ab9fb5b8a3a02))

# [15.3.0](https://github.com/ideal-postcodes/postcodes.io/compare/15.2.0...15.3.0) (2023-08-24)


### Bug Fixes

* **ONPSD Aug 2023:** Update districts ([d78cc76](https://github.com/ideal-postcodes/postcodes.io/commit/d78cc76a24ff471a3b8488d11c569e38004d7ef7))
* **ONSPD May 2023:** Update CCGs ([d848c76](https://github.com/ideal-postcodes/postcodes.io/commit/d848c76b3dc8454f0205260ce820ad6344405af6))


### Features

* **ONSPD:** Update to August 2023 ([0003f4a](https://github.com/ideal-postcodes/postcodes.io/commit/0003f4a1384da65b56c4e6d413a65461dafacbc5))
* **ONSPD:** Update to May 2023 ([25db52b](https://github.com/ideal-postcodes/postcodes.io/commit/25db52b46368439e41c12cbed12015ca4a1372b4))

# [15.2.0](https://github.com/ideal-postcodes/postcodes.io/compare/15.1.0...15.2.0) (2023-06-10)


### Bug Fixes

* **App:** Load router if URL Prefix not defined ([ff7a427](https://github.com/ideal-postcodes/postcodes.io/commit/ff7a427c918d8c706b41689e7c45387f3f5fe8ce))


### Features

* **URL Prefix:** Enable URL Prefixes with URL_PREFIX env flag ([c0ee972](https://github.com/ideal-postcodes/postcodes.io/commit/c0ee972ed5f62d58875df635e75bc4f3a98aa16b))

# [15.1.0](https://github.com/ideal-postcodes/postcodes.io/compare/15.0.0...15.1.0) (2023-03-10)


### Features

* **ONSPD:** Bump to ONSPD Feb 2023 ([2034e01](https://github.com/ideal-postcodes/postcodes.io/commit/2034e01970211be5ccab984b20b679f3250fa3a0))

# [15.0.0](https://github.com/ideal-postcodes/postcodes.io/compare/14.4.1...15.0.0) (2023-01-04)


### Bug Fixes

* **Wards:** Fix for ONSPD Nov ([3be07ad](https://github.com/ideal-postcodes/postcodes.io/commit/3be07adc16a729a53a5a3e4bc636bec359eeb3ef))


### Features

* **CCGs:** Migrate CCGs to Sub ICB Locations ([0dac18a](https://github.com/ideal-postcodes/postcodes.io/commit/0dac18a1bbef2b864de5e625a2a58bf62d4c388e))
* **ONPSD:** Bump to Nov ([9d159ad](https://github.com/ideal-postcodes/postcodes.io/commit/9d159ada8f8643b5cbc6ccf0f1ff67a7153dc346))
* **Police Force Area:** Add PFA model ([b3183b4](https://github.com/ideal-postcodes/postcodes.io/commit/b3183b4106b781fe4246b467904605a5f3854333))
* **Police Force Areas:** Ingest PFA GSS codes ([ab37f8c](https://github.com/ideal-postcodes/postcodes.io/commit/ab37f8c6fd292aac0034101aae4cc9354142d14b))
* **Police Force Areas:** Return PFA name on API ([64d43f4](https://github.com/ideal-postcodes/postcodes.io/commit/64d43f4023b0794641f8939713c68b71a01b3438))
* **Postcodes:** Return date of creation in YYYYMM format ([df36589](https://github.com/ideal-postcodes/postcodes.io/commit/df365892bda113b6fdd6a3d16f2d6c0c4aef6c63))


### BREAKING CHANGES

* **CCGs:** From July 2022, CCGs were replaced by Sub-ICB locations.

## [14.4.1](https://github.com/ideal-postcodes/postcodes.io/compare/14.4.0...14.4.1) (2022-08-25)


### Bug Fixes

* **Dockerfile:** Fix npm install ([92deb67](https://github.com/ideal-postcodes/postcodes.io/commit/92deb6709452ee98a67ae8d73fa96169af1b1a60))

# [14.4.0](https://github.com/ideal-postcodes/postcodes.io/compare/14.3.0...14.4.0) (2022-08-25)


### Bug Fixes

* **Parish:** Add missing parish data ([2d4af13](https://github.com/ideal-postcodes/postcodes.io/commit/2d4af1322b4091b76b027384db74629163e6c4d3))
* **Wards:** Update for missing wards ([556c960](https://github.com/ideal-postcodes/postcodes.io/commit/556c9607bad973e29dabffdb9aabede3b6b8e0bc))


### Features

* **Node:** Run on Node 16 ([2e6bcde](https://github.com/ideal-postcodes/postcodes.io/commit/2e6bcdec7442b82fdcc94631243595f9c3f5e534))
* **ONSPD:** Update dataset for ONSPD Aug 2022 ([f3aecea](https://github.com/ideal-postcodes/postcodes.io/commit/f3aecea95bbb7e10ad0be0bb75b73d5a699fa39b))

# [14.3.0](https://github.com/ideal-postcodes/postcodes.io/compare/14.2.0...14.3.0) (2022-02-23)


### Features

* **ONSPD:** Bump to Feb 2022 ([7ef4c17](https://github.com/ideal-postcodes/postcodes.io/commit/7ef4c17d1457eb64698cf3c28cd224d1256693d2))

# [14.2.0](https://github.com/ideal-postcodes/postcodes.io/compare/14.1.0...14.2.0) (2021-12-13)


### Bug Fixes

* **ONSPD:** Add missing wards for ONSPD 11/21 ([91a0d15](https://github.com/ideal-postcodes/postcodes.io/commit/91a0d154f386f549a7d013b6b03c3bbc03b2f095))


### Features

* **ONSPD:** Bump to Nov 2021 ([5fd8973](https://github.com/ideal-postcodes/postcodes.io/commit/5fd8973ac2558819bcaf6501e828ecaa484792be))

# [14.1.0](https://github.com/ideal-postcodes/postcodes.io/compare/14.0.4...14.1.0) (2021-09-07)


### Bug Fixes

* **ONSPD:** Update CED dataset ([6589312](https://github.com/ideal-postcodes/postcodes.io/commit/65893125092e17024e9123ac5a21b0c2d09e725c))
* **ONSPD:** Update NUTS/ITL dataset ([257e8ab](https://github.com/ideal-postcodes/postcodes.io/commit/257e8ab3fe7307c789d81d770c338a4aafc85e06))


### Features

* **ONSPD:** Update for ONSPD August 2021 ([9aad316](https://github.com/ideal-postcodes/postcodes.io/commit/9aad316c96db6af1b943e19fd30ad1a91d4dc490))

## [14.0.4](https://github.com/ideal-postcodes/postcodes.io/compare/14.0.3...14.0.4) (2021-07-08)


### Bug Fixes

* **Districts:** Add missing codes for Northamptonshire ([1d8d4f8](https://github.com/ideal-postcodes/postcodes.io/commit/1d8d4f880170a900f9327a6fa208d876d5712a4b))

## [14.0.3](https://github.com/ideal-postcodes/postcodes.io/compare/14.0.2...14.0.3) (2021-07-05)


### Bug Fixes

* **Database:** Point to latest pg_dump ([9df3bf5](https://github.com/ideal-postcodes/postcodes.io/commit/9df3bf5e60098588e2d6f086bdd6a245d9e3efbb))

## [14.0.2](https://github.com/ideal-postcodes/postcodes.io/compare/14.0.1...14.0.2) (2021-07-05)


### Bug Fixes

* **ITL:** Use level 3 codes ([e633daa](https://github.com/ideal-postcodes/postcodes.io/commit/e633daa9de5469d6738a8264ba5902a388f377c0))

## [14.0.1](https://github.com/ideal-postcodes/postcodes.io/compare/14.0.0...14.0.1) (2021-06-28)


### Bug Fixes

* **Rust:** Add reference to Rust crate ([bd7bb84](https://github.com/ideal-postcodes/postcodes.io/commit/bd7bb841fb400f987becba319eaebdd943b235ec))

# [14.0.0](https://github.com/ideal-postcodes/postcodes.io/compare/13.1.0...14.0.0) (2021-06-25)


### Bug Fixes

* **CCG:** Update CCGs for May 2021 ([21b2a7c](https://github.com/ideal-postcodes/postcodes.io/commit/21b2a7c1601171a13689d7476c05e8dc0eb74fc8))
* **NUTS:** Transition NUTS to ITL ([4939eac](https://github.com/ideal-postcodes/postcodes.io/commit/4939eace5228de5369aeab3618cccc4a0899b6d4))
* **Wards:** Update wards for ONSPD May 2021 ([ab7fcdb](https://github.com/ideal-postcodes/postcodes.io/commit/ab7fcdb30301663d0a35d4cb172bb54c0baecd40))


### Features

* **ONSPD:** Bump to ONSPD May 2021 ([02db17f](https://github.com/ideal-postcodes/postcodes.io/commit/02db17f4041873ea254607f901d5ac43ce402fa2))


### BREAKING CHANGES

* **NUTS:** ONSPD has removed NUTS in favour of ITL

As of May 2021. NUTS has changed to International Territorial Levels (ITL). Postcodes.io will report ITL in nuts and codes.nuts to preserve backwards compatibility.

Following the UK’s withdrawal from the EU, a new UK-managed international statistical geography - ITL (International Territorial Levels) - was introduced from 1st January 2021, replacing the former NUTS classification

# [13.1.0](https://github.com/ideal-postcodes/postcodes.io/compare/13.0.4...13.1.0) (2021-03-09)


### Bug Fixes

* **Parish:** Update Parish dataset ([52f74bb](https://github.com/ideal-postcodes/postcodes.io/commit/52f74bb3136d1211a53e93c197d0b683f8bafd57))


### Features

* **Bulk Search:** Guarantee results in same order ([816214b](https://github.com/ideal-postcodes/postcodes.io/commit/816214be1dfff0c45cf4721c3641a757c9c55c76)), closes [#675](https://github.com/ideal-postcodes/postcodes.io/issues/675)
* **ONSPD:** Update ONSPD to Feb 2021 ([d567664](https://github.com/ideal-postcodes/postcodes.io/commit/d567664119b273e2765e04335efa0b8fe22e2553))

## [13.0.4](https://github.com/ideal-postcodes/postcodes.io/compare/13.0.3...13.0.4) (2021-01-24)


### Bug Fixes

* **Healthcheck:** Fixues docker healthcheck ([12ec633](https://github.com/ideal-postcodes/postcodes.io/commit/12ec633c489f906f11c4f99b81609d9ae25ea9c0)), closes [#699](https://github.com/ideal-postcodes/postcodes.io/issues/699)

## [13.0.3](https://github.com/ideal-postcodes/postcodes.io/compare/13.0.2...13.0.3) (2020-12-21)


### Bug Fixes

* **Zenodo:** Trigger new release ([3d5f561](https://github.com/ideal-postcodes/postcodes.io/commit/3d5f56157ec9aea4c3f49668cad10744ce82a51f))

## [13.0.2](https://github.com/ideal-postcodes/postcodes.io/compare/13.0.1...13.0.2) (2020-12-17)


### Bug Fixes

* **SPD:** Add back dual SPD entries ([80f2f90](https://github.com/ideal-postcodes/postcodes.io/commit/80f2f90f53242659f72014da5ee5df7b440c9776))
* **SPD:** Correct and ingest invalid SPD postcodes ([8564f5a](https://github.com/ideal-postcodes/postcodes.io/commit/8564f5a8d5fe5e003b682933aeb4108a5acde31f)), closes [#578](https://github.com/ideal-postcodes/postcodes.io/issues/578)

## [13.0.1](https://github.com/ideal-postcodes/postcodes.io/compare/13.0.0...13.0.1) (2020-12-11)


### Bug Fixes

* **Async Limit:** Fix queuing for bulk requests ([e196a2c](https://github.com/ideal-postcodes/postcodes.io/commit/e196a2c38c1bd30b9b83da83603447bcd9ac6f40)), closes [#642](https://github.com/ideal-postcodes/postcodes.io/issues/642)

# [13.0.0](https://github.com/ideal-postcodes/postcodes.io/compare/12.1.1...13.0.0) (2020-12-09)


### Bug Fixes

* **MapBox:** Update to latest MapBox lib ([1f68e3b](https://github.com/ideal-postcodes/postcodes.io/commit/1f68e3b7a140805556a65769aa5568e6eca29b1b))


### Features

* **Docker:** Add readiness check `/ready` ([890e33b](https://github.com/ideal-postcodes/postcodes.io/commit/890e33bdee103186e6b8c1fcf1669ca850caca8c))
* **GSS Codes:** Add LSOA and MSOA data models ([4aac8a1](https://github.com/ideal-postcodes/postcodes.io/commit/4aac8a1d216f42487f85f63e8c491f2c05189099))
* **GSS Codes:** Return MSOA and LSOA in codes ([3562e35](https://github.com/ideal-postcodes/postcodes.io/commit/3562e35581ca4e5d98a3e0ac921243d39038c406))
* **LAU2:** Add LAU2 to codes block ([3af2938](https://github.com/ideal-postcodes/postcodes.io/commit/3af293805ff61807bdef56990150159424d6c308))
* **ONSPD:** Update ONSPD and OS Open Names ([e820b73](https://github.com/ideal-postcodes/postcodes.io/commit/e820b73883343b6cb3f979adf1135c2cb9816620))
* **Postcodes.io:** Port to Typescript ([144a566](https://github.com/ideal-postcodes/postcodes.io/commit/144a5664bc452d8c387ea4a57fe729f484e3cf60))


### BREAKING CHANGES

* **GSS Codes:** postcodes relation has been altered to store GSS Codes
for MSOA and LSOA (as `msoa_id` and `lsoa_id`) rather than names

## [12.1.1](https://github.com/ideal-postcodes/postcodes.io/compare/12.1.0...12.1.1) (2020-11-30)


### Bug Fixes

* correct grammar on documentation page ([eea9056](https://github.com/ideal-postcodes/postcodes.io/commit/eea90564438d89b1f7772a1466cf119d9466ba90))

# [12.1.0](https://github.com/ideal-postcodes/postcodes.io/compare/12.0.4...12.1.0) (2020-08-24)


### Features

* **ONSPD:** Bump to ONSP Aug 2020 ([64f9831](https://github.com/ideal-postcodes/postcodes.io/commit/64f9831a023b123ca9b98d407da0093a40e33ed8))

## [12.0.4](https://github.com/ideal-postcodes/postcodes.io/compare/12.0.3...12.0.4) (2020-08-23)


### Bug Fixes

* **SPD:** Correct and ingest invalid SPD postcodes ([954469c](https://github.com/ideal-postcodes/postcodes.io/commit/954469cd2c7f461182e931ba3c2550edbaedadf4))

## [12.0.3](https://github.com/ideal-postcodes/postcodes.io/compare/12.0.2...12.0.3) (2020-07-09)


### Bug Fixes

* **NUTS:** Incorporate NUTS updates into latest dataset ([2fb71ae](https://github.com/ideal-postcodes/postcodes.io/commit/2fb71ae9e877f05b5399ac2e81d0f5410f8c5eb7))

## [12.0.2](https://github.com/ideal-postcodes/postcodes.io/compare/12.0.1...12.0.2) (2020-07-09)


### Bug Fixes

* **NUTS:** Add missing NUTS from ONSPD May 2020 ([869e264](https://github.com/ideal-postcodes/postcodes.io/commit/869e2648447efc5803fdfa781bca868311b2377f))

## [12.0.1](https://github.com/ideal-postcodes/postcodes.io/compare/12.0.0...12.0.1) (2020-07-02)


### Bug Fixes

* **Demo:** Don't clear input on click ([8f70d0e](https://github.com/ideal-postcodes/postcodes.io/commit/8f70d0e9b8a844364047ce1baca47a8c332fef32)), closes [#541](https://github.com/ideal-postcodes/postcodes.io/issues/541)

# [12.0.0](https://github.com/ideal-postcodes/postcodes.io/compare/11.1.0...12.0.0) (2020-06-22)


### Bug Fixes

* **a11y:** add title attributes to iframe elements and structure headings on page ([65ca5a3](https://github.com/ideal-postcodes/postcodes.io/commit/65ca5a3efaa53db39bb8263ed5cb5f45685a88ee))


### chore

* **Node:** Deprecate node 8, switch to node 12 LTS ([e8d211c](https://github.com/ideal-postcodes/postcodes.io/commit/e8d211c98bbc583061cfb8200a5d75c460cca7a7))


### Features

* **Data:** Update ONSPD, Open Names, SPD ([a92a91a](https://github.com/ideal-postcodes/postcodes.io/commit/a92a91a5a0ba76886c10fbc7016c3044ca073b87))


### BREAKING CHANGES

* **Node:** Node 8 no longer supported

# Changelog

Any changes, including backwards incompatible changes will be listed here

## 11.1.0 (6/3/2020)

- Updated ONSPD to Feb 2020
- Updated Open Names to Jan 2020
- Updated GSS codes for missing parishes
- Chore: Refactored static ejs templates

## 11.0.1 (6/1/2020)

- Fix: codes.cgg incorrectly returning short code rather than GSS code

## 11.0.0 (3/1/2020)

- *Breaking Change* CCG Short Code column added to ccgs table
- CCG Short Code returned in `codes` object
- Update ONSPD to November 2019
- Update OS Open Names to October 2019
- Updated GSS codes for midding NUTS
- Updated GSS codes for midding wards
- New docker-compose setup for test, dev and s3 pg_dump testing

## 10.2.1 (2/9/2019)

- Return specific error message if postcode not in SPD but in ONSPD. Thanks to [@mashedkeyboard](https://github.com/mashedkeyboard)

## 10.2.0 (27/8/2019)

- Update ONSPD to August 2019
- Update OS Open Names to July 2019
- Updated GSS codes for missing wards
- Integrated Scotland Postcode Directory (SPD) dataset
- Added Scotland postcode lookup (for Scottish Constituencies) `/scotland/postcodes/:postcode`

## 10.1.4 (5/7/2019)

- CI testing on node 12 (instead of 11)
- Deprecated PMX configuration option. Use prom-client for monitoring
- Fix: Prom client uses stricter path matching to reduce cardinaility in `path=` label
- Update ONSPD to May 2019
- Update OS Names dataset to April 2019
- Rebuild GSS codes

## 10.1.3 (23/3/2019)

- Enable prometheus endpoint
- .env files loaded upon application start. These are overwritten with explicit ENV variables

## 10.1.2 (7/3/2019)

- Fix: `npm run setup` on ubuntu
- Dependency Update: switch from `pmx` to `@pm2/io`
- Add abiltiy to define google analytics key with environment variable

## 10.1.1 (6/3/2019)

- Fix: renamed and moved docker-compose-test.yml as it [breaks Docker Hub build](https://docs.docker.com/docker-hub/builds/automated-testing/)

## 10.1.0 (3/3/2019)

- Updated ONSPD dataset to February 2019
- Updated OS Names dataset to January 2019
- Rebuild GSS codes for NHSHA and NUTS datasets
- Dropped bunyan as dependency. Replaced with pino, a faster and actively maintained logging library
- Log destination can now be assigned via env variable `LOG_DESTINATION`
  - `"/absolute/path/to/file"` logs to file
  - `"stdout"` logs to stdout
  - `"perf"` logs to stdout in [extreme mode](https://github.com/pinojs/pino/blob/master/docs/extreme.md)
- Added ability to export prometheus metrics by basic auth protected `/metrics` endpoint. To enable include `PROMETHEUS_USERNAME` and `PROMETHEUS_PASSWORD` as environment variables. Those environment variables are required to authenticate using [HTTP basic authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)
- Updated dependencies
- Added ability to configure application limits using environment variables. [See readme](/api/config/README.md)
- Amended `npm run setup` bash script to accept more configuration arguments

## 10.0.1 (16/01/2019)

- Fix: default `config.js` file would fail to load under `NODE_ENV=production` (thanks to @g-wilson)
- Update dependencies
- Added link to new Python lib (thanks to @raigad)
- Clean up documentation

## 10.0.0 (29/11/2018)

- *Breaking Change* Install dependencies upgraded. Going forward, only the following minimum versions will be tested:
  - Node.js 8
  - PostgreSQL 10
- Postcode responses now include County Electoral Districts (ceds)
- Updated documentation (outcodes, installation)
- Updated dependencies
- Updated GSS codes for missing wards
- Updated ONSPD dataset to November 2018
- Updated OS Names dataset to October 2018

## 9.0.3 (26/10/2018)

Minor updates and fixes. Many related to docker improvements

- Fix: /outcodes endpoint returned a `result` attribute rather than an `error` attribute for a not found response
- Docker Related: Application gracefully exits from SIGTERM
- Docker Related: Application writes logs to stdout when `NODE_ENV=production`
- DockerFile:
  - Added healthcheck
  - Run application as non-root user (`node`)
  - Reduced image size: delete npm cache, added .dockerignore
- DockerFile.pg:
  - New docker file that builds a postgresql container that preloads postcodesio.io dataset

## 9.0.2 (23/8/2018)

- Updated ONSPD dataset to August 2018
- Updated OS Names dataset to July 2018

## 9.0.1 (18/6/2018)

- Fixed regression. WGS84 geolocations for points with no assigned geolocation (in `postcodes` and `terminated_postcodes` relations) returned `0` and `99.9999` (ONSPD default identifiers for no geolocation) instead of `null` and `null`.
- Updated `pg_dump` released in 9.0.0 to incorporate above fix
- Updated noticeboard

## 9.0.0 (8/6/2018)

- *Breaking Change* Updated `postcode` and `terminated_postcode` models for the new schema in ONSPD CSV file. This means `>9.0.0` will not be able to import ONSPD CSV files produced before May 2018. `pg_dump` imports will not be affected
- Added package.lock file
- Updated wards, districts, nuts, ccgs GSS Codes
- Updated ONSPD dataset to May 2018
- Updated OS Names dataset to April 2018

## 8.0.0 (6/3/2018)

- *Breaking Change* Terminated Postcode schema has been updated to include geolocation attributes: `longitude`, `latitude`, `northings`, `eastings` and `location`
- Extended `/terminated_postcodes` endpoint to include `longitude` and `latitude`
- Updated parishes GSS Codes
- Tidy up of ONSPD and Open Names import scripts. Now named `postcodesio-onspd` and `postcodesio-oson` respectively. Dropped unmaintained update script
- Updated ONSPD dataset to Feb 2018
- Updated OS Names dataset to Jan 2018

## 7.0.1 (26/1/2018)

- Fixed performance regression on `/places` endpoint where postgresql's unaccent() causing index miss

## 7.0.0 (8/12/2017)

- *Breaking Change* Place schema has been amended with additional columns to support better text search for place names. When upgrading, `places` will need to be rebuilt
- Added Dockerfile & Dockerhub Repository (thanks to @jamescun and @billinghamj)
- Fix: Added missing filterable attributes for `?filter=`
- Updated dependencies
- Updated NUTS, wards, parishes GSS codes
- Added optional rate limiting on bulk lookup endpoints
- Updated ONSPD dataset to Nov 2017
- Updated OS Names dataset to Oct 2017

## 6.1.1 (28/9/2017)

- Updated dependencies
- [Dev] Run code coverage and linter by default

## 6.1.0 (4/9/2017)

- Minimum required version of node.js bumped to 6.x
- Added terminated postcodes relation and /terminated_postcodes API
- Postcode responses now include a GSS code for parliamentary constituencies
- Extraction scripts data files (`data/*.json`) now stored in `data/scripts/` and will effectively document how the data files are generated
- Mispecified resources (404 errors) now return JSON instead of application/text
- Invalid JSON post requests return 400 errors instead of 500 HTTP response codes
- Updated ONSPD dataset to Aug 2017
- Updated OS Names dataset to July 2017

## 6.0.1 (29/7/2017)

- Bulk postcode lookups now accept a `filter` parameter to restrict the attributes of the returned result set

### Data File Changes

The extraction process for the key/value (JSON) representation of GSS codes stored in the `data/` directory is now formally documented with code in the `data/scripts/` directory. See the README.md for more information

Following the formalisation, some data files were rebuilt and the following datasets have been modified:

- Districts: 4 names have been updated
```
"Eilean Siar" is now "Na h-Eileanan Siar"
"Armagh, Banbridge and Craigavon" is now "Armagh City, Banbridge and Craigavon"
"Derry and Strabane" is now "Derry City and Strabane"
"North Down and Ards" is now "Ards and North Down"
```
- LSOA: A large number of Scottish LSOAs have been expanded to include more information. E.g. For code `S01013429`, "Blackridge" is now "Blackridge, Westfield and Torphichen - 01"
- MSOA: A large number of Scottish LSOAs have been expanded to include more information. E.g. For code `S02001501`, "Altonhill South" is now "Altonhill South, Longpark and Hillhead"
- NHSHA: Dropping codes S08000001 to S08000014 as they appear to no longer feature in ONSPD
- NHSHA: 4 names have been modified
```
"Health & Social Care Board" => "ZB001"
"Jersey" => "Jersey Health Authority"
"Guernsey (including Sark and Herm)" => "Guernsey Health Authority"
"Alderney " => "Sark Health Authority"
```
- Parishes: ~60 names have been updated for various reasons. Some have had a preceeding backslash remove, some have been expanded, some are renamed
- PCTS: 7 names have been expanded
```
"Betsi Cadwaladr University" => "Betsi Cadwaladr University Health Board"
"Powys Teaching" => "Powys Teaching Health Board"
"Hywel Dda" => "Hywel Dda University Health Board"
"Abertawe Bro Morgannwg University" => "Abertawe Bro Morgannwg University Health Board"
"Cwm Taf" => "Cwm Taf University Health Board"
"Aneurin Bevan" => "Aneurin Bevan University Health Board"
"Cardiff and Vale University" => "Cardiff and Vale University Health Board"
```
- CCG: Naming is more consistent. CCG suffix will always be dropped (previously there were 5 exceptions)

For the exact changes, you can may inspect the most recent commit applied to the file

## 6.0.0 (29/6/2017)

- *Breaking Change* Outcode schema has been modified to include country. When upgrading it's sufficient to rebuild support tables with `npm run rebuild_support_tables`
- `/outcodes/:outcode`, `/outcodes/:outcode/nearest` and `/outcodes` now also return a `country` array in the outcode result

## 5.0.0 (24/5/2017)

- *Breaking Change* Postcode schema has been modified to facilitate faster and better quality
- Faster and better quality postcode search and autocomplete
- Add missing wards for ONSPD May 2017

## 4.0.1 (23/2/2017)
- Update express & body-parser

## 4.0.0 (23/2/2017)
- Incorporate OS Places dataset
- npm package now points to `app.ts` which exports instance postcodes.io express app
- Minimum advised required Postgresql version of 9.5 (due to backwards incompatible pg_dump)
- Updated latest pg_dump for Feb 2017 ONSPD, January 2017 OS Places data

## 3.0.3
- Updated latest pg_dump for Nov 2016 ONSPD
- Updated NUTS GSS codes
- Added support for Node.js 6.9

## 3.0.2
- Updated latest pg_dump for Aug 2016 ONSPD

## 3.0.1
- Added some missing GSS codes. Fix import script for Aug 2016 ONSPD

## 3.0.0
- Drop support for node.js 0.10 and 0.12

## 2.0.1
- Expanded accept headers and HTTP methods in CORS preflight requests

## 2.0.0
- Updated dataset to February 2016
