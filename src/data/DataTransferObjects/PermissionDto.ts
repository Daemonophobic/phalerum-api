export default class PermissionDto {
    name: string;
    action: string;
    description: string;

    constructor(data: any) {
        this.name = data.name; 
        this.action = data.action;
        this.description = data.description;
    }
}