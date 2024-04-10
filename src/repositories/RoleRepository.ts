import RoleDto from "data/DataTransferObjects/RoleDto";
import PermissionDto from "data/DataTransferObjects/PermissionDto";
import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";
import { promises } from "fs";
import roleModel from "../models/role";

export default class RoleRepository {
    private role = roleModel;

    public GetAllRoles = async (): Promise<RoleDto[]> => await this.role.find()
    .populate("permissions");

    public GetRole = async (_id: string): Promise<RoleDto> => await this.role.findOne({_id}).populate("permissions");

    public GetRoleByName = async (name: string): Promise<RoleDto> => (await this.role.findOne({name})).populate("permissions");

    public CreateRole = async (role: Partial<RoleDto>): Promise<RoleDto> => {
        try{
            return (await this.role.create(role)).toObject({ useProjection: true });
        }catch(e){
            if (e.errorResponse.code === 11000) {
                throw ExceptionEnum.DuplicateKey;
            }
            throw ExceptionEnum.InvalidResult;
        }
    }

    public UpdateRole = async(_id: string, role: Partial<RoleDto>): Promise<RoleDto> => {
        try{
            return (await this.role.findOneAndUpdate({_id}, role, {new: true}));
        } catch(e) {
            if (e.errorResponse.code === 11000) {
                throw ExceptionEnum.DuplicateKey;
            }
            throw ExceptionEnum.InvalidResult;
        }
    }
    
}