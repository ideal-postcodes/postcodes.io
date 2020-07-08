import morgan from "morgan";
import { configure } from "../app/lib/logger";

export default (app: any, config: any) => {
  const logger = configure(config);

  const stream = {
    write: (message: string) => logger.info(message.slice(0, -1)),
  };

  app.pcioLogger = logger;

  app.use(morgan("combined", { stream }));
};
