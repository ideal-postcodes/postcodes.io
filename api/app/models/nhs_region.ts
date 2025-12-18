import { generateAttributeMethods } from "./attribute_base";

const relation = "nhs_regions";

export const NhsRegion = generateAttributeMethods({ relation });
