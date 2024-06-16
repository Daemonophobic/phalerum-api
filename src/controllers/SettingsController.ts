import { Response, Router } from 'express';
import { Request } from 'express-jwt';

import SettingsService from "../services/SettingsService";
import IController from "../interfaces/IController";
import mapToDto from '../helpers/functions/DtoMapper';
import Dtos from '../data/enums/DtoEnum';
import {OperationException, ExceptionEnum} from '../helpers/exceptions/OperationExceptions';
import JWTHelper from '../helpers/functions/JWTHelper';
import logger from '../helpers/functions/logger';
import JobService from '../services/JobService';

const Sentry = require("@sentry/node");

class SettingsController implements IController {
    public path = '/settings';

    public router = Router();

    private settingsService = new SettingsService();
    private jobService = new JobService();
    private jwtHelper = new JWTHelper();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/campaign/subnets`, this.getSubnets);
        this.router.put(`${this.path}/campaign/subnets`, this.setSubnets);
    }

    private getSubnets = async (request: Request, response: Response) => {
        try{
            if (!(await this.jwtHelper.verifyPermission(request, "campaign.read"))) {
                return OperationException.Forbidden(response);
            }

            const subnets = await this.settingsService.getSubnets();
            return response.status(200).json(subnets);
        }
        catch(e)
        {
            logger.error(e);
            //Sentry.captureException(e);
            return OperationException.ServerError(response);
        }
    }

    private setSubnets = async (request: Request, response: Response) => {
        try{
            if (!(await this.jwtHelper.verifyPermission(request, "campaign.write"))) {
                return OperationException.Forbidden(response);
            }

            const { subnets }: {subnets: string[]} = request.body;
            if (!subnets) {
                return OperationException.MissingParameters(response, ["subnets"]);
            }

            if (!Array.isArray(subnets)) {
                return OperationException.InvalidParameters(response, ["subnets"]);
            }
            
            let valid = true;
            subnets.forEach((subnet: string) => {
                if (!subnet.match(/^(((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}\/\d{1,2})$/)) {
                    valid = false;
                }
            })

            if (!valid) {
                return OperationException.InvalidParameters(response, ["subnets"]);
            }

            const subnetObj = await this.settingsService.setSubnets(subnets);
            this.jobService.createJob(request.auth._id, {jobName: 'Recruiter Scan', jobDescription: 'Makes the recruiter scan the subnets', crossCompatible: false, command: 'recruiter.scan', masterJob: true, available: true, disabled: false, subnets});

            return response.status(200).json(subnetObj);
        }
        catch(e)
        {
            logger.error(e);
            //Sentry.captureException(e);
            return OperationException.ServerError(response);
        }
    }
}

export default SettingsController;