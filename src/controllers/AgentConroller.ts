import { Response, Router } from 'express';
import { Request } from 'express-jwt';

import Dtos from '../data/enums/DtoEnum';
import IController from '../interfaces/IController';
import {OperationException, ExceptionEnum} from '../helpers/exceptions/OperationExceptions';
import AgentService from '../services/AgentService';
import mapToDto from '../helpers/functions/DtoMapper';
import logger from '../helpers/functions/logger';
import OS from '../data/enums/OsEnum';
import AddedBy from '../data/enums/AddedByEnum';
import JWTHelper from '../helpers/functions/JWTHelper';

class AgentController implements IController {
    public path = '/agents';

    public router = Router();

    private agentService = new AgentService();
    private jwtHelper = new JWTHelper();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.getAgents);
        this.router.get(`${this.path}/test`, this.sendCommand);
        this.router.post(`${this.path}/test`, this.receiveCommand);
        this.router.get(`${this.path}/:_id`, this.getAgent);
        this.router.post(`${this.path}`, this.addAgent);
        this.router.delete(`${this.path}/:_id`, this.deleteAgent);
    }

    private getAgents = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "agent.read"))) {
                return OperationException.Forbidden(response);
            }

            const agents = await this.agentService.getAllAgents();
            return response.status(200).json(mapToDto(agents, Dtos.AgentDto));
        } catch (e) {
            return OperationException.ServerError(response);
        }
    }

    private getAgent = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "agent.read"))) {
                return OperationException.Forbidden(response);
            }

            const {_id} = request.params

            if (typeof _id !== 'undefined') {
                const agent = await this.agentService.getAgent(_id);
                return response.status(200).json(mapToDto(agent, Dtos.AgentDto));
            } 
                return OperationException.InvalidParameters(response, ["_id"])
            
        } catch (e) {
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

    private sendCommand = async (request: Request, response: Response) => {
        response.send("ls -la").end();
    }

    private receiveCommand = async (request: Request, response: Response) => {
        const {message} = request.body;
        if (message) {
            const decode = (str: string):string => Buffer.from(str, 'base64').toString('utf8');
            logger.info(`Received command output: ${decode(message)}`);
            response.status(200).end();
        }
        response.status(400).end();
    }

    private addAgent = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "agent.write"))) {
                return OperationException.Forbidden(response);
            }


            const {agentName, master, os} = request.body;
            if (request.auth.master) {
                if (typeof os === 'undefined') {
                    return OperationException.InvalidParameters(response, ["os"])
                }

                if (Object.values(OS).includes(os)) {
                    const agent = await this.agentService.addAgent(false, os, AddedBy.Agent, request.auth._id);
                    logger.info(`Agent added by master ${request.auth._id}`);
                    return response.status(200).json(mapToDto(agent, Dtos.AgentDto));
                } else {
                    return OperationException.InvalidParameters(response, ["os"])
                }
            }

            if (typeof master !== 'boolean' || !Object.values(OS).includes(os)) {
                return OperationException.MissingParameters(response, ["agentName", "master", "os"]);
            }

            const agent = await this.agentService.addAgent(master, os, AddedBy.User, request.auth._id, agentName);
            logger.info(`Agent added by ${request.auth.username}`);
            return response.status(200).json(mapToDto(agent, Dtos.AgentDto));
        } catch (e) {
            console.log(e);
            return OperationException.ServerError(response);
        }
    }

    private deleteAgent = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "agent.write"))) {
                return OperationException.Forbidden(response);
            }

            const {_id} = request.params;

            if (typeof _id === 'string') {
                const success = await this.agentService.deleteAgent(_id);
                return response.status(200).json({"success": success});
            } 
                return OperationException.InvalidParameters(response, ["_id"])
            
        } catch (e) {
            console.log(e);
            return OperationException.ServerError(response);
        }
    }
}

export default AgentController;