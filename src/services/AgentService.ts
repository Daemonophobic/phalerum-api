import AgentRepository from '../repositories/AgentRepository';
// import logger from '../helpers/functions/logger';
import CryptoHelper from '../helpers/functions/CryptoHelper';
import JWTHelper from '../helpers/functions/JWTHelper';
import OsEnum from '../data/enums/OsEnum';
import AddedBy from '../data/enums/AddedByEnum';
import { ExceptionEnum } from '../helpers/exceptions/OperationExceptions';
import AgentDto from '../data/DataTransferObjects/AgentDto';
import Compiler from '../helpers/functions/Compiler';

class AgentService {
    private agentRepository: AgentRepository;
    private cryptoHelper: CryptoHelper;
    private compiler: Compiler;
    private JWTHelper: JWTHelper;

    constructor() {
        this.agentRepository = new AgentRepository();
        this.cryptoHelper = new CryptoHelper();
        this.compiler = new Compiler();
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

    public getAgentByComToken = async (communicationToken: string) => {
        const hash = this.cryptoHelper.hash(communicationToken);
        const agent = await this.agentRepository.getAgentByComToken(hash);
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
            return this.agentRepository.addAgent({agentName, addedBy, addedByUser: addedByGuid, master, os, communicationToken: communicationToken.prod}, communicationToken.plain)
        return this.agentRepository.addAgent({agentName, addedBy, addedByAgent: addedByGuid, master: false, os, communicationToken: communicationToken.prod}, communicationToken.plain)
    }

    public updateAgent = async (_id: string, agent: Partial<AgentDto>) => this.agentRepository.updateAgent(_id, agent);

    public compileAgent = async (agent: AgentDto, comToken: string) => this.compiler.compile(agent, comToken);

    public cleanup = async (binName: string) => this.compiler.cleanup(binName);

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