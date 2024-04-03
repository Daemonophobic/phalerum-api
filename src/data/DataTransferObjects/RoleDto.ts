import PermissionDto  from "./PermissionDto";
export default class RoleDto {
    id: number;
    name: string;
    premissions: PermissionDto[];

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.premissions = data.premissions;
    }
}