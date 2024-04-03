import PermissionDto  from "./PermissionDto";
export default class RoleDto {
    id: number;
    name: string;
    permissions: PermissionDto[];

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.permissions = data.premissions;
    }
}