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
import JobDto from '../data/DataTransferObjects/JobDto';
import SettingsService from '../services/SettingsService';

const Sentry = require("@sentry/node");

class JobController implements IController {
    public path = '/jobs';

    public router = Router();

    private jobService = new JobService();
    private agentService = new AgentService();
    private outputService = new OutputService();
    private jwtHelper = new JWTHelper();
    private settingsService = new SettingsService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.getJobs);
        this.router.get(`${this.path}/output/:_id`, this.getOutputForJob);
        this.router.get(`${this.path}/output/:_id/amount`, this.getOutputAmountForJob);
        this.router.get(`${this.path}/recruiter`, this.getRecruiterJobs);
        this.router.get(`${this.path}/:_id`, this.getJob);
        this.router.post(`${this.path}`, this.createJob);
        this.router.post(`${this.path}/output/:_id`, this.addOutput);
        this.router.put(`${this.path}/:_id`, this.updateJob);
        this.router.put(`${this.path}/toggle/:_id`, this.toggleJob);
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
            //Sentry.captureException(e);
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

    private getRecruiterJobs = async (request: Request, response: Response) => {
        try {
            if (!request.auth.master) {
                return OperationException.Forbidden(response);
            }

            logger.info(`Recruiter ${request.auth._id} checked in`)

            const {jobs} = await this.jobService.recruiterCheckIn();
            let scanJob = false;
            let scanJobIndex = -1;
            jobs.forEach((job: JobDto) => {
                if (job.command === 'recruiter.scan') {
                    scanJob = true;
                }
                scanJobIndex += 1;
            });
            if (scanJob) {
                this.jobService.deleteJob(jobs[scanJobIndex]._id);
            }

            return response.status(200).json(mapToDto(jobs, Dtos.JobDto));
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

    private getOutputForJob = async (request: Request, response: Response) => {
        try {
            const {_id} = request.params;
            const {amount, page} = request.query;

            if (typeof _id === 'undefined' || typeof amount === 'undefined' || typeof page === 'undefined') {
                return OperationException.MissingParameters(response, ["_id", "amount", "page"]);
            }

            if (typeof amount !== 'string' || typeof page !== 'string') {
                return OperationException.InvalidParameters(response, ["amount", "page"]);
            }

            let outputs = await this.outputService.getOutputForJob(_id, parseInt(amount), parseInt(page));

            return response.status(200).json(mapToDto(outputs, Dtos.OutputDto));
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

    private getOutputAmountForJob = async (request: Request, response: Response) => {
        try {
            const {_id} = request.params;

            if (typeof _id === 'undefined') {
                return OperationException.MissingParameters(response, ["_id"]);
            }

            let outputAmount = await this.outputService.getOutputAmountForJob(_id);

            return response.status(200).json(outputAmount);
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
            //Sentry.captureException(e);
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
            if (agent.upgraded === false) {
                const job = await this.jobService.getJob(_id);
                if (job.jobName === 'Get primary IP address') {
                    const scope = (await this.settingsService.getSubnets()).value;
                    let ips = Buffer.from(output, 'base64').toString('ascii').trimEnd().split('\n');
                    const inScopeIPs: string[] = [];
                    ips.filter((ip: string) => {
                        if (!Array.isArray(scope)) {
                            return;
                        }
                        scope.forEach((subnet: string) => {
                            const [subnetIp, subnetMask] = subnet.split('/');
                            const subnetIpArray = subnetIp.split('.');
                            const ipArray = ip.split('.');
                            const subnetIpBinary = subnetIpArray.map((octet: string) => {
                                return parseInt(octet).toString(2).padStart(8, '0');
                            }).join('');
                            const ipBinary = ipArray.map((octet: string) => {
                                return parseInt(octet).toString(2).padStart(8, '0');
                            }).join('');
                            const subnetIpNetwork = subnetIpBinary.substring(0, parseInt(subnetMask));
                            const ipNetwork = ipBinary.substring(0, parseInt(subnetMask));
                            if (subnetIpNetwork === ipNetwork) {
                                inScopeIPs.push(ip);
                            }
                        });
                    });
                    inScopeIPs.forEach((ip: string) => {
                        ips.splice(ips.indexOf(ip), 1);
                    });
                    if (ips.length > 0) {
                        this.jobService.createJob(null, {agentId: agent._id, jobName: 'Upgrade agent', jobDescription: 'Upgrades the agent to a recruiter', crossCompatible: false, masterJob: true, available: true, disabled: false, hide: true});
                        this.agentService.updateAgent(agent._id, {upgraded: true, partialMaster: true});
                        this.jobService.createJob(null, {agentId: agent._id, jobName: 'Recruiter Scan', jobDescription: 'Makes the recruiter scan the subnets', crossCompatible: false, command: 'recruiter.scan', masterJob: true, available: true, disabled: false, subnets: ips, hide: true});
                    }
                }
            }


            this.outputService.createOutput({jobId: _id, agentId: agent._id, output: output});
            return response.status(200).end();
        } catch (e) {
            logger.error(e);
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

    private updateJob = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "job.write"))) {
                return OperationException.Forbidden(response);
            }

            const {_id} = request.params;

            const {jobName, jobDescription, available, disabled, crossCompatible, os, agentId, masterJob, shellCommand, command} = request.body;
            if (typeof jobName === 'undefined' && typeof jobDescription === 'undefined' && typeof available === 'undefined' && typeof disabled === 'undefined' &&
                typeof crossCompatible === 'undefined' && typeof os === 'undefined' && typeof agentId === 'undefined' &&
                typeof masterJob === 'undefined' && typeof shellCommand === 'undefined' && typeof command === 'undefined') {
                return OperationException.MissingParameters(response, ["jobName", "jobDescription", "available", "disabled", "crossCompatible",
                "os", "agentId", "masterJob", "shellCommand", "command"]);
            }

            const job = await this.jobService.updateJob(_id, {jobName, jobDescription, available, disabled, crossCompatible, os, agentId, masterJob, shellCommand, command});
            return response.status(200).json(mapToDto(job, Dtos.JobDto));
        } catch (e) {
            logger.error(e);
            //Sentry.captureException(e);
            return OperationException.ServerError(response);
        }
    }

    private toggleJob = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "job.write"))) {
                return OperationException.Forbidden(response);
            }

            const {_id} = request.params;

            const job = await this.jobService.toggleJob(_id);
            return response.status(200).json(mapToDto(job, Dtos.JobDto));
        } catch (e) {
            logger.error(e);
            //Sentry.captureException(e);
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
            //Sentry.captureException(e);
            return OperationException.ServerError(response);
        }
    }
}

export default JobController;