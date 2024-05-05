import helmet from "helmet";
import { connect } from 'mongoose';

import errorMiddleware from "./middlewares/errorMiddleware";
import IController from "./interfaces/IController";
import logger from "./helpers/functions/logger";

const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const { expressjwt: jwt } = require("express-jwt");
const fs = require("fs");
const Sentry = require("@sentry/node");

require("dotenv").config();

const allowedOrigins = ["https://phalerum.stickybits.red"];

class App {
    public app;

    constructor(controllers: IController[]) {
      this.app = express();
      this.initializeMonitoring();
      this.connectDatabase()
      .then(() => logger.info("Database Connected"))
      .catch((err) => logger.error(err));
      this.initializeMiddlewares();
      this.initializeControllers(controllers);
      this.initializeErrorHandling();
    }

    public listen() {
      const host = process.env.HOST || "127.0.0.1";
      const port = process.env.PORT || 3000;
      this.app.listen(port, host, () => {
          logger.info(`Server listening on port ${port}`);
      });
    }

    public getServer() {
      return this.app;
    }

    private initializeMiddlewares() {
      this.app.use(express.json());
      this.app.use(helmet());
      this.app.use(
        cors({
          origin: allowedOrigins,
        }),
      );
      this.app.use(cookieParser());
      
      const publicKey = fs.readFileSync("./certificates/public.pem");
      this.app.use(
        jwt({
          secret: publicKey,
          algorithms: ["RS256"],
          getToken: function getFromCookie(request: any) {
            return request.cookies.session;
          }
        }).unless({ path: ["/api/v1/admin/user/initialize", "/api/v1/auth/login", "/api/v1/auth/initialize/credentials", "/api/v1/auth/initialize/2fa", "/api/v1/agents/hello", /^\/img\//] })
      );
    }

    private initializeControllers(controllers: IController[]) {
      controllers.forEach((controller) => {
        this.app.use("/api/v1", controller.router);
      });
      this.app.use(express.static('public'));
    }

    private initializeMonitoring() {
      Sentry.init({
        dsn: "https://8f849e01c76ebf50a1e2e3330e23d784@sentry.stickybits.red/8",
        integrations: [
          // enable MongoDB tracking
          new Sentry.Integrations.Mongo({
            useMongoose: true,
          }),
          // enable HTTP calls tracing
          new Sentry.Integrations.Http({ tracing: true }),
          // enable Express.js middleware tracing
          new Sentry.Integrations.Express({ app: this.app }),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, //  Capture 100% of the transactions
      });
      this.app.use(Sentry.Handlers.requestHandler()); 
      this.app.use(Sentry.Handlers.tracingHandler());
    }

    private initializeErrorHandling() {
      this.app.use(Sentry.Handlers.errorHandler());
      this.app.use(errorMiddleware);
    }

    private connectDatabase() {
      return connect(process.env.MONGODB_CONNECTION_STRING);
    }
}

export default App;