import { Response, Router } from 'express';
import { Request } from 'express-jwt';

import Dtos from '../data/enums/DtoEnum';
import IController from '../interfaces/IController';
import {OperationException, ExceptionEnum} from '../helpers/exceptions/OperationExceptions';
import JobService from '../services/JobService';
import mapToDto from '../helpers/functions/DtoMapper';
import OS from '../data/enums/OsEnum';
import JWTHelper from '../helpers/functions/JWTHelper';

class JobController implements IController {
    public path = '/jobs';

    public router = Router();

    private jobService = new JobService();
    private jwtHelper = new JWTHelper();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.getJobs);
        this.router.get(`${this.path}/:_id`, this.getJob);
        this.router.post(`${this.path}`, this.createJob);
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
            console.log(e);
            return OperationException.ServerError(response);
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
            console.log(e);
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
            console.log(e);
            return OperationException.ServerError(response);
        }
    }
}

export default JobController;