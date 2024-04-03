export default class PermissionDto {
    id: number;
    name: string;
    premissions: PermissionDto[];

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.premissions = data.premissions;
    }
}