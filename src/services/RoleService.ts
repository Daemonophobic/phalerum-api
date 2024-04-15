import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";
import PermissionRepository from "../repositories/PermissionRepository";
import RoleRepository from "../repositories/RoleRepository"


class RoleService {
    private roleRepository: RoleRepository;
    private permissionRepository: PermissionRepository;

    constructor() {
        this.roleRepository = new RoleRepository();
        this.permissionRepository = new PermissionRepository();
    }

    public GetAllRole = async() => await this.roleRepository.GetAllRoles();

    public GetRole = async(_id: string) => {
        const role = await this.roleRepository.GetRole(_id);
        if(role === null)
        {
            throw ExceptionEnum.NotFound;
        }
        return role;
    }

    public GetRoleByName = async (name: string) => {
        const role = await this.roleRepository.GetRoleByName(name);
        if(role == null)
        {
            throw ExceptionEnum.NotFound;
        }
        return role;
    }


}

export default RoleService;