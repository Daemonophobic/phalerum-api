import { Response, Router } from 'express';
import { Request } from 'express-jwt';

import Dtos from '../data/enums/DtoEnum';
import IController from '../interfaces/IController';
import {OperationException, ExceptionEnum} from '../helpers/exceptions/OperationExceptions';
import UserService from '../services/UserService';
import mapToDto from '../helpers/functions/DtoMapper';
import logger from '../helpers/functions/logger';
import JWTHelper from '../helpers/functions/JWTHelper';

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const fs = require('fs');
const Sentry = require("@sentry/node");

class UserController implements IController {
    public path = '/users';

    public router = Router();

    private userService = new UserService();
    private jwtHelper = new JWTHelper();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.getUsers);
        this.router.get(`${this.path}/me`, this.getSelf);
        this.router.get(`${this.path}/:_id`, this.getUser);
        this.router.post(`${this.path}`, this.createUser);
        this.router.post(`${this.path}/avatar`, upload.single('picture'), this.updateUserAvatar);
        this.router.delete(`${this.path}/avatar`, this.resetUserAvatar);
        this.router.put(`${this.path}`, this.updateUser);
    }

    private getUsers = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "user.read"))) {
                return OperationException.Forbidden(response);
            }

            const users = await this.userService.getAllUsers();
            return response.status(200).json(mapToDto(users, Dtos.UserDto));
        } catch (e) {
            logger.error(e);
            Sentry.captureException(e);
            return OperationException.ServerError(response);
        }
    }

    private getSelf = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "user.read"))) {
                return OperationException.Forbidden(response);
            }

            const user = await this.userService.getUser(request.auth._id, true);
            return response.status(200).json(mapToDto(user, Dtos.UserDto));
        } catch (e) {
            logger.error(e);
            Sentry.captureException(e);
            return OperationException.ServerError(response);
        }
    }

    private getUser = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "user.read"))) {
                return OperationException.Forbidden(response);
            }            

            const {_id} = request.params

            if (typeof _id !== 'undefined') {
                const user = await this.userService.getUser(_id);
                return response.status(200).json(mapToDto(user, Dtos.UserDto));
            } 
                return OperationException.InvalidParameters(response, ["_id"])
            
        } catch (e) {
            logger.error(e);
            Sentry.captureException(e);
            switch(e) {
                case(ExceptionEnum.NotFound): {
                    return OperationException.NotFound(response);
                } 
                case(ExceptionEnum.InvalidResult): {
                    return OperationException.ServerError(response);
                }
                default: {
                    return OperationException.ServerError(response);
                }
            }
        }
    }

    private createUser = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "user.write"))) {
                return OperationException.Forbidden(response);
            }

            const {firstName, lastName, username, email} = request.body;
            if (typeof firstName === 'undefined' || typeof lastName === 'undefined' || typeof username === 'undefined' || typeof email === 'undefined') {
                return OperationException.MissingParameters(response, ["firstName", "lastName", "username", "email"]);
            }
            const user = await this.userService.addUser({firstName, lastName, username, emailAddress: email});
            logger.info(`Added user ${user.emailAddress}`);
            return response.status(200).json(mapToDto(user, Dtos.UserDto));
        } catch (e) {
            logger.error(e);
            Sentry.captureException(e);
            switch(e) {
                case(ExceptionEnum.DuplicateKey): {
                    return OperationException.DuplicateKey(response, {error: "An account already exists with the provided email address or username"});
                }
                default: {
                    return OperationException.ServerError(response);
                }
            }
        }
    }

    private updateUser = async (request: Request, response: Response) => {
        try {
            const {firstName, lastName, username, email} = request.body;
            if (typeof firstName === 'undefined' && typeof lastName === 'undefined' && typeof username === 'undefined' && typeof email === 'undefined') {
                return OperationException.MissingParameters(response, ["firstName", "lastName", "username", "email"]);
            }

            const user = await this.userService.updateUser(request.auth._id, {firstName, lastName, username, emailAddress: email});
            logger.info(`Updated user ${request.auth.username}`);
            if (typeof username !== 'undefined') { 
                return response.cookie('session', '', {
                    maxAge: 1,
                    path: "/api",
                    httpOnly: true,
                    secure: true,
                }).status(200).end();
            }
            return response.status(200).json(user);

        } catch (e) {
            logger.error(e);
            Sentry.captureException(e);
            return OperationException.ServerError(response);
        }
    }

    private updateUserAvatar = async (request: any, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "user.read"))) {
                return OperationException.Forbidden(response);
            }

            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedMimeTypes.includes(request.file.mimetype)) {
                fs.unlink(request.file.path, (err: Error) => {
                    if (err !== null) logger.error(err);
                });
                return OperationException.InvalidParameters(response, ["picture"]);
            }

            const newName = `${request.file.filename}.${request.file.mimetype.split("/")[1]}`;

            fs.rename(request.file.path, `public/img/${newName}`, (err: Error) => {
                if (err !== null) {
                    logger.error(err);
                    fs.unlink(request.file.path, (err: Error) => {
                        if (err !== null) logger.error(err);
                    });
                    return OperationException.ServerError(response);
                }
            });

            const {profilePicture} = await this.userService.getUser(request.auth._id);
            if (profilePicture !== 'default.jpg') {
                fs.unlink(`public/img/${profilePicture}`, (err: Error) => {
                    if (err !== null) logger.error(err);
                });
            }

            const user = await this.userService.updateUser(request.auth._id, {profilePicture: newName});
            return response.status(200).json(user);
        } catch (e) {
            logger.error(e);
            Sentry.captureException(e);
            return OperationException.ServerError(response);
        }
    }

    private resetUserAvatar = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "user.read"))) {
                return OperationException.Forbidden(response);
            }

            const {profilePicture} = await this.userService.getUser(request.auth._id);
            if (profilePicture !== 'default.jpg') {
                fs.unlink(`public/img/${profilePicture}`, (err: Error) => {
                    if (err !== null) logger.error(err);
                });
            }

            const user = await this.userService.updateUser(request.auth._id, {profilePicture: 'default.jpg'});
            return response.status(200).json(user);
        } catch (e) {
            logger.error(e);
            Sentry.captureException(e);
            return OperationException.ServerError(response);
        }
    }
}

export default UserController;