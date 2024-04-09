import { Response, Router } from 'express';
import { Request } from 'express-jwt';

import RoleService from "../services/RoleService";
import IController from "../interfaces/IController";
import mapToDto from '../helpers/functions/DtoMapper';
import Dtos from '../data/enums/DtoEnum';
import {OperationException, ExceptionEnum} from '../helpers/exceptions/OperationExceptions';


class RoleController implements IController {
    public path = '/roles';

    public router = Router();

    private roleService = new RoleService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.getRoles);
        this.router.get(`${this.path}/:_id`, this.getRole);
    }

    private getRoles = async (request: Request, response: Response) => {
        try{
            const roles = await this.roleService.GetAllRole();
            return response.status(200).json(mapToDto(roles, Dtos.RoleDto));
        }
        catch(e)
        {
            console.log(e);
            return OperationException.ServerError(response);
        }
    }

    private getRole = async (request: Request, response: Response) => {
        try{
            const {_id} = request.params
            console.log(_id);

            if(typeof _id !== 'undefined')
            {
                const role = await this.roleService.GetRole(_id);
                return response.status(200).json(mapToDto(role, Dtos.RoleDto));
            }
            return OperationException.InvalidParameters(response, ["_id"])

        }catch (e) {
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

export default RoleController;