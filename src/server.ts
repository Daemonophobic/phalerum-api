import AgentController from "./controllers/AgentConroller";
import AuthController from "./controllers/AuthController";
import App from "./app";
import logger from "./helpers/functions/logger";
import UserController from "./controllers/UserController";

const app = new App(
    [
        new AuthController(),
        new UserController(),
        new AgentController(),
    ],
);

logger.info("Server starting...")

app.listen();