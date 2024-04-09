import RoleDto from "data/DataTransferObjects/RoleDto";
import PermissionDto from "data/DataTransferObjects/PermissionDto";
import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";
import roleModel from "../models/roles";

export default class RoleRepository {
    private role = roleModel;

    public getAllRoles = async (): Promise<RoleDto[]> =>
        await this.role.find()
        .populate('permissions');

    public createRole = async (role: RoleDto): Promise<RoleDto> =>
        await this.role.create(role);
}