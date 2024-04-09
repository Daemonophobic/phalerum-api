import PermissionDto  from "./PermissionDto";
export default class RoleDto {
    name: string;
    permissions: Array<PermissionDto>;

    constructor(data: any) {
        this.name = data.name;
        this.permissions = data.premissions;
    }
}