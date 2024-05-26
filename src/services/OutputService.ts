import OutputRepository from '../repositories/OutputRepository';
import OsEnum from '../data/enums/OsEnum';
import OutputDto from '../data/DataTransferObjects/OutputDto';
import { ExceptionEnum } from '../helpers/exceptions/OperationExceptions';
import AgentDto from '../data/DataTransferObjects/AgentDto';

class OutputService {
    private outputRepository: OutputRepository;

    constructor() {
        this.outputRepository = new OutputRepository();
    }

    getOutputForJob = async (jobId: string) => this.outputRepository.getOutputForJob(jobId);

    createOutput = async (output: Partial<OutputDto>) => this.outputRepository.createOutput(output);

    deleteOutput = async (_id: string) => this.outputRepository.deleteOutput(_id);
}

export default OutputService;