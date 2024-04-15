import PermissionDto  from "./PermissionDto";
export default class RoleDto {
    _id: string;
    name: string;
    permissions: Array<PermissionDto>;

    constructor(data: any) {
        this._id = data._id
        this.name = data.name;
        this.permissions = data.permissions;
    }
}