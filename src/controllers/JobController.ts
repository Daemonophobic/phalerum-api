import { Response, Router } from 'express';
import { Request } from 'express-jwt';

import Dtos from '../data/enums/DtoEnum';
import IController from '../interfaces/IController';
import {OperationException, ExceptionEnum} from '../helpers/exceptions/OperationExceptions';
import JobService from '../services/JobService';
import mapToDto from '../helpers/functions/DtoMapper';
import OS from '../data/enums/OsEnum';
import JWTHelper from '../helpers/functions/JWTHelper';
import logger from '../helpers/functions/logger';
import AgentService from '../services/AgentService';
import OutputService from '../services/OutputService';

const Sentry = require("@sentry/node");

class JobController implements IController {
    public path = '/jobs';

    public router = Router();

    private jobService = new JobService();
    private agentService = new AgentService();
    private outputService = new OutputService();
    private jwtHelper = new JWTHelper();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.getJobs);
        this.router.get(`${this.path}/output/:_id`, this.getOutputForJob);
        this.router.get(`${this.path}/:_id`, this.getJob);
        this.router.post(`${this.path}`, this.createJob);
        this.router.post(`${this.path}/output/:_id`, this.addOutput);
        this.router.put(`${this.path}/:_id`, this.updateJob);
        this.router.delete(`${this.path}/:_id`, this.deleteJob);
    }

    private getJobs = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "job.read"))) {
                return OperationException.Forbidden(response);
            }

            const jobs = await this.jobService.getAllJobs();
            return response.status(200).json(mapToDto(jobs, Dtos.JobDto));
        } catch (e) {
            Sentry.captureException(e);
            return OperationException.ServerError(response);
        }
    }

    private getJob = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "job.read"))) {
                return OperationException.Forbidden(response);
            }

            const {_id} = request.params;

            if (typeof _id !== 'undefined') {
                const job = await this.jobService.getJob(_id);
                return response.status(200).json(mapToDto(job, Dtos.JobDto));
            } 
                return OperationException.InvalidParameters(response, ["_id"])
            
        } catch (e) {
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

    public getOutputForJob = async (request: Request, response: Response) => {
        try {
            const {_id} = request.params;

            if (typeof _id === 'undefined') {
                return OperationException.MissingParameters(response, ["_id"]);
            }

            let outputs = await this.outputService.getOutputForJob(_id);

            return response.status(200).json(mapToDto(outputs, Dtos.OutputDto));
        } catch (e) {
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

    private createJob = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "job.write"))) {
                return OperationException.Forbidden(response);
            }

            const {jobName, jobDescription, crossCompatible, os, agentId, masterJob, shellCommand, command} = request.body;
            if (typeof jobName === 'undefined' || jobDescription === 'undefined') {
                return OperationException.MissingParameters(response, ["jobName", "jobDescription"]);
            }

            if (typeof os !== 'undefined' && !Object.values(OS).includes(os)) {
                return OperationException.InvalidParameters(response, ["os"]);
            }

            const job = await this.jobService.createJob(request.auth._id, {jobName, jobDescription, crossCompatible, os, agentId, masterJob, shellCommand, command});
            return response.status(200).json(mapToDto(job, Dtos.JobDto));
        } catch (e) {
            logger.error(e);
            Sentry.captureException(e);
            return OperationException.ServerError(response);
        }
    }

    private addOutput = async (request: Request, response: Response) => {
        try {
            const {_id} = request.params;
            const {communicationToken, output} = request.body;

            if (typeof _id === 'undefined' || typeof communicationToken === 'undefined' || typeof output === 'undefined') {
                return OperationException.MissingParameters(response, ["_id", "communicationToken", "output"]);
            }

            if (_id === '' || communicationToken === '' || output === '') {
                return OperationException.InvalidParameters(response, ["_id", "communicationToken", "output"]);
            }

            const agent = await this.agentService.getAgentByComToken(communicationToken);

            this.outputService.createOutput({jobId: _id, agentId: agent._id, output: output});
            return response.status(200).end();
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

    private updateJob = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "job.write"))) {
                return OperationException.Forbidden(response);
            }

            const {_id} = request.params;

            const {jobName, jobDescription, disabled, crossCompatible, os, agentId, masterJob, shellCommand, command} = request.body;
            if (typeof jobName === 'undefined' && typeof jobDescription === 'undefined' && typeof disabled === 'undefined' &&
                typeof crossCompatible === 'undefined' && typeof os === 'undefined' && typeof agentId === 'undefined' &&
                typeof masterJob === 'undefined' && typeof shellCommand === 'undefined' && typeof command === 'undefined') {
                return OperationException.MissingParameters(response, ["jobName", "jobDescription", "disabled", "crossCompatible",
                "os", "agentId", "masterJob", "shellCommand", "command"]);
            }

            const job = await this.jobService.updateJob(_id, {jobName, jobDescription, disabled, crossCompatible, os, agentId, masterJob, shellCommand, command});
            return response.status(200).json(mapToDto(job, Dtos.JobDto));
        } catch (e) {
            logger.error(e);
            Sentry.captureException(e);
            return OperationException.ServerError(response);
        }
    }

    private deleteJob = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "job.write"))) {
                return OperationException.Forbidden(response);
            }

            const {_id} = request.params;

            if (typeof _id === 'string') {
                const success = await this.jobService.deleteJob(_id);
                return response.status(200).json({"success": success});
            } 
                return OperationException.InvalidParameters(response, ["_id"])
            
        } catch (e) {
            logger.error(e);
            Sentry.captureException(e);
            return OperationException.ServerError(response);
        }
    }
}

export default JobController;