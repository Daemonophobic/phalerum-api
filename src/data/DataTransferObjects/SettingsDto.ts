export default class SettingsDto {
    _id: string;
    name: string;
    config: boolean;
    agentId: any;
    value: string | string[];

    constructor(data: any) {
        this.name = data.name;
        this.config = data.config;
        this.agentId = data.agentId;
        this.value = data.value;
    }
}