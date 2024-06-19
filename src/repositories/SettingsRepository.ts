import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";
import SettingsDto from "../data/DataTransferObjects/SettingsDto";
import settingsModel from "../models/settings";

export default class SettingsRepository {
    private settings = settingsModel;

    public getAllSettings = async (): Promise<SettingsDto[]> => this.settings.find();

    public getSetting = async (_id: string): Promise<SettingsDto> => this.settings.findOne({_id});

    public getSettingByName = async (name: string): Promise<SettingsDto> => this.settings.findOne({name});

    public setSettingByName = async (name: string, value: string | string[]): Promise<SettingsDto> => {
        try{
            const setting = await this.settings.findOne({name});
            if(setting){
                setting.value = value;
                return await setting.save();
            }
            return await (await this.settings.create({name, value})).toObject({ useProjection: true });
        }catch(e){
            if (e.errorResponse.code === 11000) {
                throw ExceptionEnum.DuplicateKey;
            }
            throw ExceptionEnum.InvalidResult;
        }
    }

    public getSettingForAgent = async (agentId: string): Promise<SettingsDto> => this.settings.findOne({agentId});

    public createSetting = async (setting: Partial<SettingsDto>): Promise<SettingsDto> => {
        try{
            return await (await this.settings.create(setting)).toObject({ useProjection: true });
        }catch(e){
            if (e.errorResponse.code === 11000) {
                throw ExceptionEnum.DuplicateKey;
            }
            throw ExceptionEnum.InvalidResult;
        }
    }

    public updateSetting = async(_id: string, setting: Partial<SettingsDto>): Promise<SettingsDto> => {
        try{
            return (await this.settings.findOneAndUpdate({_id}, setting, {new: true}));
        } catch(e) {
            if (e.errorResponse.code === 11000) {
                throw ExceptionEnum.DuplicateKey;
            }
            throw ExceptionEnum.InvalidResult;
        }
    }
    
}