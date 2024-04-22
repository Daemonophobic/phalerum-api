import { Response, Router } from 'express';
import { Request } from 'express-jwt';

import CampaignService from '../services/CampaignService';
import IController from '../interfaces/IController';
import { OperationException, ExceptionEnum } from '../helpers/exceptions/OperationExceptions';
import logger from '../helpers/functions/logger';
import JWTHelper from '../helpers/functions/JWTHelper';
import mapToDto from '../helpers/functions/DtoMapper';
import Dtos from '../data/enums/DtoEnum';

class CampaignController implements IController {
    public path = '/campaigns';

    public router = Router();

    private campaignService = new CampaignService();
    private jwtHelper = new JWTHelper();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.getCampaigns);
        this.router.get(`${this.path}/current`, this.getCurrentCampaign)
        this.router.get(`${this.path}/:_id`, this.getCampaign);
        this.router.put(`${this.path}/:_id`, this.updateCampaign);
        this.router.post(`${this.path}`, this.createCampaign);
        this.router.delete(`${this.path}/:_id`, this.deleteCampaign);
    }

    private getCampaigns = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "campaign.read"))) {
                return OperationException.Forbidden(response);
            }

            const campaigns = await this.campaignService.getCampaigns();
            return response.status(200).json(mapToDto(campaigns, Dtos.CampaignDto));
        } catch (e) {
            logger.error(e);
            return OperationException.ServerError(response);
        }
    }

    private getCurrentCampaign = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "campaign.read"))) {
                return OperationException.Forbidden(response);
            }

            const campaign = await this.campaignService.getCurrentCampaign();
            return response.status(200).json(mapToDto(campaign, Dtos.CampaignDto));
        } catch (e) {
            logger.errro(e);
            return OperationException.ServerError(response);
        }
    }

    private getCampaign = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "campaign.read"))) {
                return OperationException.Forbidden(response);
            }            

            const {_id} = request.params

            if (typeof _id !== 'undefined') {
                const campaign = await this.campaignService.getCampaign(_id);
                return response.status(200).json(mapToDto(campaign, Dtos.CampaignDto));
            } 
                return OperationException.InvalidParameters(response, ["_id"])
            
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

    private updateCampaign = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "campaign.write"))) {
                return OperationException.Forbidden(response);
            }

            const {_id} = request.params;
            const {name, description, startDate, endDate, active} = request.body;

            if (typeof name === 'undefined' && typeof description === 'undefined' && typeof startDate === 'undefined' && typeof endDate === 'undefined' && typeof active === 'undefined') {
                return OperationException.InvalidParameters(response, ["name", "description", "startDate", "endDate", "active"]);
            }

            if (typeof _id !== 'undefined') {
                const campaign = await this.campaignService.updateCampaign(_id, {name, description, startDate, endDate, active});
                return response.status(200).json(mapToDto(campaign, Dtos.CampaignDto));
            }
                return OperationException.InvalidParameters(response, ["_id"]);
            
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

    private createCampaign = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "campaign.write"))) {
                return OperationException.Forbidden(response);
            }

            const {name, description, startDate, endDate, active} = request.body;

            if (typeof name === 'undefined' || typeof description === 'undefined' || typeof startDate === 'undefined' || typeof endDate === 'undefined' || typeof active === 'undefined') {
                return OperationException.InvalidParameters(response, ["name", "description", "startDate", "endDate", "active"]);
            }
            
            const campaign = await this.campaignService.createCampaign({name, description, startDate, endDate, active});
            return response.status(200).json(mapToDto(campaign, Dtos.CampaignDto));
        } catch (e) {
            console.log(e);
            return OperationException.ServerError(response);
        }
    }

    private deleteCampaign = async (request: Request, response: Response) => {
        try {
            if (!(await this.jwtHelper.verifyPermission(request, "campaign.write"))) {
                return OperationException.Forbidden(response);
            }

            const {_id} = request.params;

            if (typeof _id !== 'undefined') {
                await this.campaignService.deleteCampaign(_id);
                return response.status(200).json({message: "Campaign deleted"});
            }
                return OperationException.InvalidParameters(response, ["_id"]);
            
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
}

export default CampaignController;