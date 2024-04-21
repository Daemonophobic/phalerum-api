import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";
import AgentDto from '../data/DataTransferObjects/AgentDto';
import agentModel from "../models/agent";

export default class AgentRepository {
    private agent = agentModel;

    public getAllAgents = async (): Promise<AgentDto[]> =>
        await this.agent.find()
        .populate("addedByUser")
        .populate("addedByAgent");

    public getAgent = async (_id: string): Promise<AgentDto> => 
        await this.agent.findOne({_id})
        .populate("addedByUser")
        .populate("addedByAgent");

    public addAgent = async (agent: Partial<AgentDto>): Promise<AgentDto> =>
        (await this.agent.create(agent)).toObject({ useProjection: true });

    public deleteAgent = async (_id: string) => 
        await this.agent.findOneAndDelete({_id});

    public updateAgent = async (_id: string, agent: Partial<AgentDto>): Promise<AgentDto> =>
        await this.agent.findOneAndUpdate({_id}, agent, { new: true });
}