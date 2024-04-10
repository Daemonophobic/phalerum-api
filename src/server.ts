import AgentController from "./controllers/AgentConroller";
import AuthController from "./controllers/AuthController";
import App from "./app";
import logger from "./helpers/functions/logger";
import UserController from "./controllers/UserController";
import JobController from "./controllers/JobController";

const app = new App(
    [
        new AuthController(),
        new UserController(),
        new AgentController(),
        new JobController(),
    ],
);

logger.info("Server starting...")

app.listen();