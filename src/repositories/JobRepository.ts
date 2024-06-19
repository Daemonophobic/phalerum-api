import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";
import JobDto from '../data/DataTransferObjects/JobDto';
import jobModel from "../models/job";

export default class JobRepository {
    private job = jobModel;

    public getAllJobs = async (): Promise<JobDto[]> =>
        this.job.find()
        .populate('createdBy')
        .populate('agentId')
        .where('hide').equals(false);

    public getJob = async (_id: string): Promise<JobDto> =>
        this.job.findOne({_id})
        .populate('createdBy')
        .populate('agentId');

    public getJobsForAgent = async (agentId: string): Promise<JobDto[]> =>
        this.job.find({ agentId })
        .populate('createdBy')
        .where('available').equals(true)
        .where('disabled').equals(false)
        .populate('agentId');

    public createJob = async (job: Partial<JobDto>): Promise<JobDto> =>
        this.job.create(job);

    public updateJob = async (_id: string, job: Partial<JobDto>): Promise<JobDto> =>
        this.job.findOneAndUpdate({_id}, job, { new: true });

    public deleteJob = async (_id: string): Promise<JobDto> =>
        this.job.findOneAndDelete({_id});

    public getAvailableJobs = async (os: string): Promise<JobDto[]> =>
        this.job.find({ $or: [{ os }, { crossCompatible: true }]})
        .where('available').equals(true)
        .where('disabled').equals(false)
        .where('masterJob').equals(false)
        .where('agentId').exists(false);

    public getJobsForRecruiter = async (): Promise<JobDto[]> =>
        this.job.find()
        .where('completed').equals(false)
        .where('available').equals(true)
        .where('disabled').equals(false)
        .where('masterJob').equals(true)
        .where('agentId').exists(false);

    public getJobsForPartialRecruiter = async (agentId: string): Promise<JobDto[]> =>
        this.job.find({ agentId })
        .where('completed').equals(false)
        .where('available').equals(true)
        .where('disabled').equals(false)
        .where('masterJob').equals(true);

    public toggleJob = async (_id: string): Promise<JobDto> => {
        const job = await this.job.findOne({_id});
        if (job === null) {
            throw ExceptionEnum.NotFound;
        }

        job.disabled = !job.disabled;
        return job.save();
    }
}