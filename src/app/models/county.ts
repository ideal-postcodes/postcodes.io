import { generateAttributeMethods } from "./attribute_base";

const relation = "counties";

export const County = generateAttributeMethods({ relation });
