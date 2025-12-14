import { generateAttributeMethods } from "./attribute_base";

const relation = "national_parks";

export const NationalPark = generateAttributeMethods({ relation });
