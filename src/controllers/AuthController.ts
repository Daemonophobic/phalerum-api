import { Response, Router } from 'express';
import { Request } from 'express-jwt';

import AuthService from '../services/AuthService';
import IController from '../interfaces/IController';
import { OperationException, ExceptionEnum } from '../helpers/exceptions/OperationExceptions';
import logger from '../helpers/functions/logger';

const Sentry = require("@sentry/node");

class AuthController implements IController {
    public path = '/auth';

    public router = Router();

    private authService = new AuthService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/login`, this.authenticateUser);
        this.router.post(`${this.path}/initialize/credentials`, this.initializeCredentials);
        this.router.post(`${this.path}/initialize/2fa`, this.initializeTwoFactorAuthentication);
        this.router.get(`${this.path}/logout`, this.logout);
        this.router.get(`${this.path}/health`, this.checkAuthentication);
    }

    private authenticateUser = async (request: Request, response: Response) => {
        try {
            const { email, password, OTP, keepSession=false } = request.body;

            if (typeof email === 'undefined' || typeof password === 'undefined' || typeof OTP === 'undefined')
                return OperationException.MissingParameters(response, ["email", "password", "OTP"]);

            const result = await this.authService.authenticateUser({emailAddress: email, password}, OTP);

            if (result.error) {
                setTimeout(() => OperationException.Unauthenticated(response, {error: "Invalid OTP, credentials, or user does not exist"}), 80);
            } else {
                logger.info(`User ${email} authenticated`);

                return keepSession ? response.cookie('session', result.session, {
                    maxAge: 7200*1000,
                    path: "/api",
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                }).json({success: true}) :
                response.cookie('session', result.session, {
                    path: "/api",
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                }).json({success: true});
            }
        } catch(e) {
            logger.error(e);
            //Sentry.captureException(e);
            switch (e) {
                case (ExceptionEnum.Forbidden): {
                    return OperationException.Forbidden(response, {error: "This account is locked"})
                }
                case (ExceptionEnum.InvalidResult): {
                    return OperationException.Forbidden(response, {error: "Invalid OTP, credentials, or user does not exist"})
                }
                default: {
                    return OperationException.ServerError(response);
                }
            }
        }
    }

    private initializeCredentials = async (request: Request, response: Response) => {
        try {
            const {initializationToken, email, password, verifyPassword} = request.body;

            if (typeof initializationToken === "undefined" || typeof email === "undefined" || 
                typeof password === "undefined" || typeof verifyPassword === "undefined") {
                return OperationException.MissingParameters(response, ["initializationToken", "email", "password", "verifyPassword"]);
            }

            if (password !== verifyPassword) {
                return OperationException.InvalidParameters(response, ["password", "verifyPassword"], {error: "The submitted passwords are not equal to eachother"});
            }

            const imageUrl: string = await this.authService.initializeCredentials({initializationToken, emailAddress: email, password});   
            logger.info(`User ${email} initialized`);         
            return response.status(200).send(imageUrl);
        } catch (e) {
            logger.error(e);
            //Sentry.captureException(e);
            switch(e) {
                case(ExceptionEnum.NotFound): {
                    return OperationException.NotFound(response);
                } 
                case(ExceptionEnum.Forbidden): {
                    return OperationException.Forbidden(response, {error: "The initializationToken is incorrect"})
                }
                default: {
                    return OperationException.ServerError(response);
                }
            }
        }
    }

    private initializeTwoFactorAuthentication = async (request: Request, response: Response) => {
        try {
            const { email, OTP } = request.body;

            if (typeof email === 'undefined' || typeof OTP === 'undefined') {
                return OperationException.MissingParameters(response, ["email", "OTP"]);
            }

            const success = await this.authService.initializeTwoFactorAuthentication({emailAddress: email}, OTP);
            logger.info(`User ${email} unlocked`);

            response.status(200).json({success})
        } catch (e) {
            logger.error(e);
            //Sentry.captureException(e);
            switch (e) {
                case (ExceptionEnum.Forbidden): {
                    return OperationException.Unauthenticated(response, {error: "Invalid OTP code"})
                }
                case (ExceptionEnum.InvalidResult): {
                    return OperationException.Forbidden(response, {error: "Account already initialized"})
                }
                default: {
                    return OperationException.ServerError(response);
                }
            }
        }
    }

    private logout = async (request: Request, response: Response) => {
        try {
            if (request.auth) {
                return response.cookie('session', '', {
                    maxAge: 1,
                    path: "/api",
                    httpOnly: true,
                    secure: true,
                }).status(200).end();
            } 
                return response.status(200).end();
            
        } catch (e) {
            //Sentry.captureException(e);
            return OperationException.ServerError(response);
        }
    }

    private checkAuthentication = async (request: Request, response: Response) => {
        try {
            if (request.auth) {
                return response.status(200).json({authenticated: true});
            } 
                return response.status(200).json({authenticated: false});
            
        } catch (e) {
            //Sentry.captureException(e);
            return OperationException.ServerError(response);
        }
    } 
}

export default AuthController;