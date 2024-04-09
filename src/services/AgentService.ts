import AgentRepository from '../repositories/AgentRepository';
// import logger from '../helpers/functions/logger';
import CryptoHelper from '../helpers/functions/CryptoHelper';
import OsEnum from '../data/enums/OsEnum';
import AddedBy from '../data/enums/AddedByEnum';

class AgentService {
    private agentRepository: AgentRepository;
    private cryptoHelper: CryptoHelper;

    constructor() {
        this.agentRepository = new AgentRepository();
        this.cryptoHelper = new CryptoHelper();
    }

    public getAllAgents = async () => this.agentRepository.getAllAgents();

    public getAgent = async (_id: string) => this.agentRepository.getAgent(_id);

    public addAgent = async (master: boolean, os: OsEnum, addedBy: AddedBy, addedByGuid: string, agentName: string = '') => {
        const communicationToken = this.cryptoHelper.generateToken();

        if (addedBy === AddedBy.Agent || (addedBy === AddedBy.User && agentName === '')) {
            agentName = this.cryptoHelper.generateString(16);
        }

        if (addedBy === AddedBy.User) 
            return await this.agentRepository.addAgent({agentName, addedBy, addedByUser: addedByGuid, master: false, os, communicationToken: communicationToken.prod})
        return await this.agentRepository.addAgent({agentName, addedBy, addedByAgent: addedByGuid, master: false, os, communicationToken: communicationToken.prod})
    }

    public deleteAgent = async (_id: string) => this.agentRepository.deleteAgent(_id);
}

export default AgentService;