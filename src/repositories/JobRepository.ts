import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";
import JobDto from '../data/DataTransferObjects/JobDto';
import jobModel from "../models/job";

export default class JobRepository {
    private job = jobModel;

    public getAllJobs = async (): Promise<JobDto[]> =>
        await this.job.find()
        .populate('createdBy')
        .populate('agentId');

    public getJob = async (_id: string): Promise<JobDto> =>
        await this.job.findOne({_id})
        .populate('createdBy')
        .populate('agentId');

    public createJob = async (job: Partial<JobDto>): Promise<JobDto> =>
        await this.job.create(job);

    public updateJob = async (_id: string, job: Partial<JobDto>): Promise<JobDto> =>
        await this.job.findOneAndUpdate({_id}, job, { new: true });

    public deleteJob = async (_id: string): Promise<JobDto> =>
        await this.job.findOneAndDelete({_id});
}