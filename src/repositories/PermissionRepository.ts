import PermissionDto from "data/DataTransferObjects/PermissionDto";
import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";
import permissionModel from "../models/permission";

export default class PermissionRepository{
    private permission = permissionModel;

    public getAllPermission = async(): Promise<PermissionDto[]> => await this.permission.find();

    public getPermission = async(_id: string): Promise<PermissionDto> => await this.permission.findOne({_id});

    public getIdByAction = async(action: string): Promise<string> => await this.permission.findOne({action})

    public CreatePermission = async(permission: Partial<PermissionDto>): Promise<PermissionDto> => {
        try{
            return (await this.permission.create(permission)).toObject({ useProjection: true });
        }
        catch(e)
        {
            if (e.errorResponse.code === 11000) {
                throw ExceptionEnum.DuplicateKey;
            }
            throw ExceptionEnum.InvalidResult;
        }
    }

    public updatePermission = async(_id: string, permission: Partial<PermissionDto>): Promise<PermissionDto> => {
        try{
            return (await this.permission.findOneAndUpdate({_id}, permission, {new: true}));
        }
        catch(e)
        {
            if (e.errorResponse.code === 11000) {
                throw ExceptionEnum.DuplicateKey;
            }
            throw ExceptionEnum.InvalidResult;
        }
    }
}
