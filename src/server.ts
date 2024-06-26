import AgentController from "./controllers/AgentController";
import AuthController from "./controllers/AuthController";
import App from "./app";
import logger from "./helpers/functions/logger";
import UserController from "./controllers/UserController";
import JobController from "./controllers/JobController";
import RoleController from "./controllers/RoleController";
import AdminController from "./controllers/AdminController";
import CampaignController from "./controllers/CampaignController";
import SettingsController from "./controllers/SettingsController";

const app = new App(
    [
        new AuthController(),
        new UserController(),
        new AgentController(),
        new JobController(),
        new RoleController(),
        new AdminController(),
        new CampaignController(),
        new SettingsController(),
    ],
);

logger.info("Server starting...")

app.listen();