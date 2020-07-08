import { generateAttributeMethods } from "./attribute_base";

const relation = "constituencies";

export const Constituency = generateAttributeMethods({ relation });
