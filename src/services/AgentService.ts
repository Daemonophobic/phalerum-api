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

    public getAgent = async (guid: string) => this.agentRepository.getAgent(guid);

    public addAgent = async (master: boolean, os: OsEnum, addedBy: AddedBy, addedByGuid: string, agentName: string = '') => {
        const guid = this.cryptoHelper.generateGuid();
        const communicationToken = this.cryptoHelper.generateToken();

        if (addedBy === AddedBy.Agent || (addedBy === AddedBy.User && agentName === '')) {
            agentName = this.cryptoHelper.generateString(16);
        }

        return this.agentRepository.addAgent({agentName, guid, addedBy, addedByGuid, master: false, os}, communicationToken.prod)
    }

    public deleteAgent = async (guid: string) => this.agentRepository.deleteAgent(guid);
}

export default AgentService;