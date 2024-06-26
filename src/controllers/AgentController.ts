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
import JobService from '../services/JobService';

const Sentry = require("@sentry/node");

class AgentController implements IController {
    public path = '/agents';

    public router = Router();

    private agentService = new AgentService();
    private jobService = new JobService();
    private jwtHelper = new JWTHelper();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.getAgents);
        this.router.get(`${this.path}/:_id`, this.getAgent);
        this.router.get(`${this.path}/:_id/config`, this.getMasterConfig);
        this.router.post(`${this.path}`, this.addAgent);
        this.router.post(`${this.path}/hello`, this.checkIn);
        this.router.post(`${this.path}/:_id/compile`, this.compileAgent);
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
            //Sentry.captureException(e);
            return OperationException.ServerError(response);
        }
    }

    private getAgent = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "agent.read"))) {
                return OperationException.Forbidden(response);
            }

            const {_id} = request.params;

            if (typeof _id !== 'undefined') {
                const agent = await this.agentService.getAgent(_id);
                return response.status(200).json(mapToDto(agent, Dtos.AgentDto));
            } 
                return OperationException.InvalidParameters(response, ["_id"])
            
        } catch (e) {
            //Sentry.captureException(e);
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
    
    private getMasterConfig = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "master.config.read"))) {
                return OperationException.Forbidden(response);
            }

            const {_id} = request.params;

            if (typeof _id === 'undefined') {
                return OperationException.InvalidParameters(response, ["_id"])
            }
            
            const token = await this.agentService.generateToken(_id);
            const config = {API_URL: process.env.BASE_URL, JWT_TOKEN: token.session};

            response.setHeader('Content-disposition', 'attachment; filename=config.json');
            response.setHeader('Content-type', 'application/json');
            return response.send(JSON.stringify(config));
        } catch (e) {
            //Sentry.captureException(e);
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

    private checkIn = async (request: Request, response: Response) => {
        try {
            const {communicationToken} = request.body;

            if (typeof communicationToken === 'undefined') {
                return OperationException.MissingParameters(response, ["communicationToken"]);
            }

            if (typeof communicationToken !== 'string') {
                return OperationException.InvalidParameters(response, ["communicationToken"]);
            }

            const {_id, os} = await this.agentService.getAgentByComToken(communicationToken);
            logger.info(`Agent ${_id} checked in`)
            this.agentService.updateAgent(_id, {lastCheckIn: new Date()});

            const {jobs} = await this.jobService.checkIn(os, {_id});
            const personalJobs = await this.jobService.getJobsForAgent(_id);
            const allJobs = jobs.concat(personalJobs);
            const isRollback = allJobs.map((job: any) => job.jobName === 'Rollback').includes(true)
            if (isRollback) {
                await this.agentService.deleteAgent(_id);
            }
            return response.json({jobs: allJobs}).end();
        } catch (e) {
            //Sentry.captureException(e);
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

    private compileAgent = async (request: Request, response: Response) => {
        try {
            if (!request.auth.master && !request.auth.premaster) {
                return OperationException.Forbidden(response);
            }

            const {_id} = request.params;
            const {comToken} = request.body;

            if (typeof _id === 'undefined' || typeof comToken === 'undefined') {
                return OperationException.InvalidParameters(response, ["_id", "comToken"])
            }

            const agent = await this.agentService.getAgent(_id);
            const result = await this.agentService.compileAgent(agent, comToken);
            if (result.name === '') {
                return OperationException.CompilerError(response);
            }

            response.status(200).sendFile(result.name, { root: __dirname + '/../../compiling' }, (err: any) => {
                if (err) {
                    this.agentService.cleanup(result.name);
                    return OperationException.CompilerError(response);
                }
                this.agentService.cleanup(result.name);
            });
        } catch (e) {
            logger.error("Weird characters most likely sent by recruiter, reason: " + JSON.stringify(e));
            //Sentry.captureException("Weird characters most likely sent by recruiter, reason: " + JSON.stringify(e));
            switch (e) {
                case(ExceptionEnum.CompilerError): {
                    return OperationException.CompilerError(response)
                }
                default: {
                    return OperationException.ServerError(response);
                }
            }
            return OperationException.ServerError(response);
        }
    }

    // private sendCommand = async (request: Request, response: Response) => {
    //     response.send("ls -la").end();
    // }

    // private receiveCommand = async (request: Request, response: Response) => {
    //     const {message} = request.body;
    //     if (message) {
    //         const decode = (str: string):string => Buffer.from(str, 'base64').toString('utf8');
    //         logger.info(`Received command output: ${decode(message)}`);
    //         response.status(200).end();
    //     }
    //     response.status(400).end();
    // }

    private addAgent = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "agent.write"))) {
                return OperationException.Forbidden(response);
            }

            const {agentName, master, os, ipAddress} = request.body;
            if (request.auth.master) {
                if (typeof os === 'undefined' || typeof ipAddress === 'undefined') {
                    return OperationException.InvalidParameters(response, ["os", "ipAddress"])
                }

                if (Object.values(OS).includes(os)) {
                    const agent = await this.agentService.addAgent(false, os, AddedBy.Agent, request.auth._id, ipAddress);
                    logger.info(`Agent added by recruiter ${request.auth._id}`);
                    return response.status(200).json(mapToDto(agent, Dtos.AgentDto));
                } 
                    return OperationException.InvalidParameters(response, ["os"])
                
            }

            if (typeof master !== 'boolean' || !Object.values(OS).includes(os)) {
                return OperationException.MissingParameters(response, ["agentName", "master", "os"]);
            }
            
            const agent = await this.agentService.addAgent(master, os, AddedBy.User, request.auth._id, agentName);
            logger.info(`Agent added by ${request.auth.username}`);
            return response.status(200).json(mapToDto(agent, Dtos.AgentDto));
        } catch (e) {
            //Sentry.captureException(e);
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
            //Sentry.captureException(e);
            return OperationException.ServerError(response);
        }
    }
}

export default AgentController;