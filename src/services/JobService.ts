import JobRepository from '../repositories/JobRepository';
// import logger from '../helpers/functions/logger';
import CryptoHelper from '../helpers/functions/CryptoHelper';
import OsEnum from '../data/enums/OsEnum';
import AddedBy from '../data/enums/AddedByEnum';

class JobService {
    private jobRepository: JobRepository;
    private cryptoHelper: CryptoHelper;

    constructor() {
        this.jobRepository = new JobRepository();
        this.cryptoHelper = new CryptoHelper();
    }

    public getAllJobs = async (includeDisabled: boolean = false) => this.jobRepository.getAllJobs(includeDisabled);

    // public getJob = async (guid: string) => this.jobRepository.getJob(guid);

    // public addAgent = async (master: boolean, os: OsEnum, addedBy: AddedBy, addedByGuid: string, agentName: string = '') => {
    //     const guid = this.cryptoHelper.generateGuid();
    //     const communicationToken = this.cryptoHelper.generateToken();

    //     if (addedBy === AddedBy.Agent || (addedBy === AddedBy.User && agentName === '')) {
    //         agentName = this.cryptoHelper.generateString(16);
    //     }

    //     return this.jobRepository.addAgent({agentName, guid, addedBy, addedByGuid, master: false, os}, communicationToken.prod)
    // }

    // public toggleJob = async (guid: string) => this.jobRepository.toggleJob(guid);

    // public deleteJob = async (guid: string) => this.jobRepository.deleteJob(guid);
}

export default JobService;