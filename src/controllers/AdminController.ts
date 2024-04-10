import { Response, Router } from 'express';
import { Request } from 'express-jwt';

import Dtos from '../data/enums/DtoEnum';
import IController from '../interfaces/IController';
import {OperationException, ExceptionEnum} from '../helpers/exceptions/OperationExceptions';
import mapToDto from '../helpers/functions/DtoMapper';
import logger from '../helpers/functions/logger';
import JWTHelper from '../helpers/functions/JWTHelper';
import AdminService from '../services/AdminService';

class AgentController implements IController {
    public path = '/admin';

    public router = Router();

    private adminService = new AdminService();
    private jwtHelper = new JWTHelper();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/user/initialize`, this.initializeAdmin);
        this.router.get(`${this.path}/users/:_id`, this.getUsers);
    }

    private initializeAdmin = async (request: Request, response: Response) => {
        try {
            const {firstName, lastName, username, email} = request.body;
            if (typeof firstName === 'undefined' || typeof lastName === 'undefined' || typeof username === 'undefined' || typeof email === 'undefined') {
                return OperationException.MissingParameters(response, ["firstName", "lastName", "username", "email"]);
            }

            const user = await this.adminService.addInitialUser({firstName, lastName, username, emailAddress: email});
            logger.info(`Added user ${user.emailAddress}`);
            return response.status(200).json(mapToDto(user, Dtos.UserDto));
        } catch (e) {
            logger.error(e);
            switch(e) {
                case(ExceptionEnum.NotFound): {
                    return OperationException.NotFound(response);
                } 
                case(ExceptionEnum.InvalidResult): {
                    return OperationException.ServerError(response);
                }
                case(ExceptionEnum.Forbidden): {
                    return OperationException.Forbidden(response);
                }
                default: {
                    return OperationException.ServerError(response);
                }
            }
        }
    }

    private getUsers = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "admin.user.read"))) {
                return OperationException.Forbidden(response);
            }

            const {_id} = request.params;

            const user = await this.adminService.getExtendedUser(_id);
            return response.status(200).json(mapToDto(user, Dtos.UserDto));
        } catch (e) {
            logger.error(e);
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
}

export default AgentController;