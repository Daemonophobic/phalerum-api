import agentModel from "../models/agent";
import CampaignDto from "../data/DataTransferObjects/CampaignDto";
import campaignModel from "../models/campaign";
import jobModel from "../models/job";

export default class CampaignRepository {
    private campaign = campaignModel;
    
    // For statistics
    private agent = agentModel;
    private job = jobModel;

    public getCampaigns = async (): Promise<CampaignDto[]> =>
        await this.campaign.find()
        .populate('createdBy');

    public getCurrentCampaign = async (): Promise<CampaignDto> => {
        const campaign = await this.campaign.findOne({active: true})
        .populate('createdBy')

        const agentAmount = await this.agent.countDocuments({});
        const jobAmount = await this.job.countDocuments({});
        return {...campaign.toJSON(), statistics: {agents: agentAmount, jobs: jobAmount}};
    }

    public getCampaign = async (_id: string): Promise<CampaignDto> =>
        await this.campaign.findOne({_id})
        .populate('createdBy');

    public createCampaign = async (campaign: Partial<CampaignDto>): Promise<CampaignDto> => {
        if (await this.campaign.countDocuments({}) === 0) return await this.campaign.create({number: 1, ...campaign});
        const lastCampaignNumber = (await this.campaign.findOne({}).sort({number: -1}).limit(1)).number;
        return await this.campaign.create({number: lastCampaignNumber + 1, ...campaign});
    }

    public updateCampaign = async (_id: string, campaign: Partial<CampaignDto>): Promise<CampaignDto> =>
        await this.campaign.findOneAndUpdate({_id}, campaign, { new: true });

    public deleteCampaign = async (_id: string): Promise<CampaignDto> =>
        await this.campaign.findOneAndDelete({_id});
}