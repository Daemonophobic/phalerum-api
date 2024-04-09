import JobRepository from '../repositories/JobRepository';
import OsEnum from '../data/enums/OsEnum';
import JobDto from '../data/DataTransferObjects/JobDto';
import { ExceptionEnum } from '../helpers/exceptions/OperationExceptions';

class JobService {
    private jobRepository: JobRepository;

    constructor() {
        this.jobRepository = new JobRepository();
    }

    public getAllJobs = async () => await this.jobRepository.getAllJobs();

    public getJob = async (_id: string) => {
        const job = await this.jobRepository.getJob(_id);
        if (job === null) {
            throw ExceptionEnum.NotFound;
        }
        return job;
    }

    public createJob = async (_id: string, job: Partial<JobDto>) => await this.jobRepository.createJob({...job, createdBy: _id});

    public updateJob = async (_id: string, job: Partial<JobDto>) => await this.jobRepository.updateJob(_id, job);

    public deleteJob = async (_id: string) => await this.jobRepository.deleteJob(_id);
}

export default JobService;