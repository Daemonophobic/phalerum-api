import { Response, Router } from 'express';
import { Request } from 'express-jwt';

import Dtos from '../data/enums/DtoEnum';
import IController from '../interfaces/IController';
import {OperationException, ExceptionEnum} from '../helpers/exceptions/OperationExceptions';
import AgentService from '../services/AgentService';
import { mapToDto } from '../helpers/functions/DtoMapper';
import logger from '../helpers/functions/logger';

class AgentController implements IController {
    public path = '/agents';

    public router = Router();

    private agentService = new AgentService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.getAgents);
        this.router.get(`${this.path}/test`, this.sendCommand);
        this.router.post(`${this.path}/test`, this.receiveCommand);
        this.router.get(`${this.path}/:id`, this.getAgent);
    }

    private getAgents = async (request: Request, response: Response) => {
        try {
            const agents = await this.agentService.getAllAgents();
            return response.status(200).json(mapToDto(agents, Dtos.AgentDto));
        } catch (e) {
            return OperationException.ServerError(response);
        }
    }

    private getAgent = async (request: Request, response: Response) => {
        try {
            const {id} = request.params

            if (!Number.isNaN(parseInt(id))) {
                const agent = await this.agentService.getAgent(parseInt(id));
                return response.status(200).json(mapToDto(agent, Dtos.AgentDto));
            } 
                return OperationException.InvalidParameters(response, ["id"])
            
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
        response.send("ls").end();
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
}

export default AgentController;