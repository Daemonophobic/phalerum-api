export default class PermissionDto {
    id: number;
    action: string;
    description: string;

    constructor(data: any) {
        this.id = data.id;
        this.action = data.action;
        this.description = data.description;
    }
}