import JobRepository from '../repositories/JobRepository';
import OsEnum from '../data/enums/OsEnum';
import JobDto from '../data/DataTransferObjects/JobDto';
import { ExceptionEnum } from '../helpers/exceptions/OperationExceptions';
import AgentDto from '../data/DataTransferObjects/AgentDto';

class JobService {
    private jobRepository: JobRepository;

    constructor() {
        this.jobRepository = new JobRepository();
    }

    public getAllJobs = async () => this.jobRepository.getAllJobs();

    public getJob = async (_id: string) => {
        const job = await this.jobRepository.getJob(_id);
        if (job === null) {
            throw ExceptionEnum.NotFound;
        }
        return job;
    }

    public createJob = async (_id: string, job: Partial<JobDto>) => this.jobRepository.createJob({...job, createdBy: _id});

    public updateJob = async (_id: string, job: Partial<JobDto>) => this.jobRepository.updateJob(_id, job);

    public deleteJob = async (_id: string) => this.jobRepository.deleteJob(_id);

    public checkIn = async (os: OsEnum, agent: Partial<AgentDto>) => {
        const availableJobs = await this.jobRepository.getAvailableJobs(os);
        const jobsForAgent = await this.jobRepository.getJobsForAgent(agent._id);

        if (jobsForAgent.length === 0) {
            return {jobs: availableJobs};
        }

        return {jobs: availableJobs.concat(jobsForAgent)};
    }
}

export default JobService;