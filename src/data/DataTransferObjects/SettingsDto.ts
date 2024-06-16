export default class SettingsDto {
    _id: string;
    name: string;
    value: string | string[];

    constructor(data: any) {
        this.name = data.name;
        this.value = data.value;
    }
}