import { generateAttributeMethods } from "./attribute_base";

const relation = "scottish_constituencies";

export const ScottishConstituency = generateAttributeMethods({ relation });
