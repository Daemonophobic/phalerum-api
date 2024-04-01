import { Response, Router } from 'express';
import { Request } from 'express-jwt';

import Dtos from '../data/enums/DtoEnum';
import IController from '../interfaces/IController';
import {OperationException, ExceptionEnum} from '../helpers/exceptions/OperationExceptions';
import UserService from '../services/UserService';
import mapToDto from '../helpers/functions/DtoMapper';
import logger from '../helpers/functions/logger';

class UserController implements IController {
    public path = '/users';

    public router = Router();

    private userService = new UserService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.getUsers);
        this.router.get(`${this.path}/:guid`, this.getUser);
        this.router.post(`${this.path}`, this.createUser);
        // this.router.put(`${this.path}`, this.updateUser);
        this.router.delete(`${this.path}/:guid`, this.deleteUser);
    }

    private getUsers = async (request: Request, response: Response) => {
        try {
            const users = await this.userService.getAllUsers();
            return response.status(200).json(mapToDto(users, Dtos.UserDto));
        } catch (e) {
            console.log(e);
            return OperationException.ServerError(response);
        }
    }

    private getUser = async (request: Request, response: Response) => {
        try {
            const {guid} = request.params

            if (typeof guid !== 'undefined') {
                const user = await this.userService.getUser(guid);
                return response.status(200).json(mapToDto(user, Dtos.UserDto));
            } 
                return OperationException.InvalidParameters(response, ["guid"])
            
        } catch (e) {
            console.log(e);
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
            const {firstName, lastName, username, email} = request.body;
            if (typeof firstName === 'undefined' || typeof lastName === 'undefined' || typeof username === 'undefined' || typeof email === 'undefined') {
                return OperationException.MissingParameters(response, ["firstName", "lastName", "username", "email"]);
            }
            
            const {user} = await this.userService.addUser({firstName, lastName, username, emailAddress: email});
            logger.info(`Added user ${user.emailAddress}`);
            return response.status(200).json(mapToDto(user, Dtos.UserDto));
        } catch (e) {
            console.log(e);
            return OperationException.ServerError(response);
        }
    }

    private deleteUser = async (request: Request, response: Response) => {
        try {
            const {guid} = request.params;

            if (guid === request.auth.guid) {
                return OperationException.Forbidden(response, {"error": "Invalid operation, cannot delete your own account"})
            }

            if (typeof guid === 'string') {
                const success = await this.userService.deleteUser(guid);
                return response.status(200).json({"success": success});
            } 
                return OperationException.InvalidParameters(response, ["guid"])
            
        } catch (e) {
            console.log(e);
            return OperationException.ServerError(response);
        }
    }
}

export default UserController;