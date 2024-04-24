import CampaignRepository from "../repositories/CampaignRepository";
import CampaignDto from "../data/DataTransferObjects/CampaignDto";
import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";

class CampaignService {
    private campaignRepository: CampaignRepository;

    constructor() {
        this.campaignRepository = new CampaignRepository();
    }

    public getCampaigns = async (): Promise<CampaignDto[]> => this.campaignRepository.getCampaigns();

    public getCurrentCampaign = async (): Promise<CampaignDto> => {
        const campaign = await this.campaignRepository.getCurrentCampaign();
        if (campaign === null) {
            throw ExceptionEnum.NotFound;
        }
        return campaign;
    }

    public getCampaign = async (_id: string): Promise<CampaignDto> => {
        const campaign = await this.campaignRepository.getCampaign(_id);
        if (campaign === null) {
            throw ExceptionEnum.NotFound;
        }
        return campaign;
    }

    public createCampaign = async (campaign: Partial<CampaignDto>): Promise<CampaignDto> => this.campaignRepository.createCampaign(campaign);

    public updateCampaign = async (_id: string, campaign: Partial<CampaignDto>): Promise<CampaignDto> => this.campaignRepository.updateCampaign(_id, campaign);

    public deleteCampaign = async (_id: string): Promise<CampaignDto> => this.campaignRepository.deleteCampaign(_id);
}

export default CampaignService;