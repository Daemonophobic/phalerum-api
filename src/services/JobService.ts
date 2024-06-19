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

    public getJobsForAgent = async (agentId: string) => this.jobRepository.getJobsForAgent(agentId);

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

    public toggleJob = async (_id: string) => this.jobRepository.toggleJob(_id);

    public recruiterCheckIn = async () => {
        const availableJobs = await this.jobRepository.getJobsForRecruiter();
        return {jobs: availableJobs};
    }

    public partialRecruiterCheckIn = async (agentId: string) => {
        const availableJobs = await this.jobRepository.getJobsForPartialRecruiter(agentId);
        return {jobs: availableJobs};
    }

    public deleteJobs = async (agentId: string) => {
        const jobs = await this.jobRepository.getJobsForAgent(agentId);
        for (const job of jobs) {
            if (job.jobName == 'Upgrade agent') {
                await this.jobRepository.deleteJob(job._id);
            }
        }
    }
}

export default JobService;