import AgentRepository from '../repositories/AgentRepository';
// import logger from '../helpers/functions/logger';
import CryptoHelper from '../helpers/functions/CryptoHelper';

class AgentService {
    private agentRepository: AgentRepository;
    private cryptoHelper: CryptoHelper;

    constructor() {
        this.agentRepository = new AgentRepository();
        this.cryptoHelper = new CryptoHelper();
    }

    public getAllAgents = async () => this.agentRepository.getAllAgents();

    public getAgent = async (agentId: number) => this.agentRepository.getAgent(agentId);
}

export default AgentService;