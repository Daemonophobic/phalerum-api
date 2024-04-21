import AgentRepository from '../repositories/AgentRepository';
// import logger from '../helpers/functions/logger';
import CryptoHelper from '../helpers/functions/CryptoHelper';
import JWTHelper from '../helpers/functions/JWTHelper';
import OsEnum from '../data/enums/OsEnum';
import AddedBy from '../data/enums/AddedByEnum';
import { ExceptionEnum } from '../helpers/exceptions/OperationExceptions';

class AgentService {
    private agentRepository: AgentRepository;
    private cryptoHelper: CryptoHelper;
    private JWTHelper: JWTHelper;

    constructor() {
        this.agentRepository = new AgentRepository();
        this.cryptoHelper = new CryptoHelper();
        this.JWTHelper = new JWTHelper();
    }

    public getAllAgents = async () => this.agentRepository.getAllAgents();

    public getAgent = async (_id: string) => {
        const agent = await this.agentRepository.getAgent(_id);
        if (agent === null) {
            throw ExceptionEnum.NotFound;
        }
        return agent;
    }
    public addAgent = async (master: boolean, os: OsEnum, addedBy: AddedBy, addedByGuid: string, agentName: string = '') => {
        const communicationToken = this.cryptoHelper.generateToken();

        if (addedBy === AddedBy.Agent || (addedBy === AddedBy.User && agentName === '')) {
            agentName = this.cryptoHelper.generateString(16);
        }

        if (addedBy === AddedBy.User) 
            return await this.agentRepository.addAgent({agentName, addedBy, addedByUser: addedByGuid, master: false, os, communicationToken: communicationToken.prod})
        return await this.agentRepository.addAgent({agentName, addedBy, addedByAgent: addedByGuid, master: false, os, communicationToken: communicationToken.prod})
    }

    public generateToken = async (_id: string): Promise<{error: boolean, session?: string}> => {
        const agent = await this.agentRepository.getAgent(_id);
        if (agent === null) {
            throw ExceptionEnum.NotFound;
        }
        return this.JWTHelper.generateToken(agent);
    }

    public deleteAgent = async (_id: string) => this.agentRepository.deleteAgent(_id);
}

export default AgentService;