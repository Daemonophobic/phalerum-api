import SettingsDto from '../data/DataTransferObjects/SettingsDto';
import SettingsRepository from '../repositories/SettingsRepository';
// import { ExceptionEnum } from '../helpers/exceptions/OperationExceptions';

class SettingsService {
    private settingsRepository: SettingsRepository;

    constructor() {
        this.settingsRepository = new SettingsRepository();
    }

    public getSubnets = async () => this.settingsRepository.getSettingByName('subnets');

    public setSubnets = async (subnets: string[]) => this.settingsRepository.setSettingByName('subnets', subnets);

    public addConfig = async (setting: Partial<SettingsDto>) => this.settingsRepository.createSetting(setting);
    
    public getConfig = async (agentId: string) => this.settingsRepository.getSettingForAgent(agentId);
}

export default SettingsService;