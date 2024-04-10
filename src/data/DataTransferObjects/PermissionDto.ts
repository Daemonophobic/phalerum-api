export default class PermissionDto {
    _id: string;
    name: string;
    action: string;
    description: string;

    constructor(data: any) {
        this._id = data._id;
        this.name = data.name; 
        this.action = data.action;
        this.description = data.description;
    }
}