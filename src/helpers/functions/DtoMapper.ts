import Dtos from "../../data/enums/DtoEnum";
import UserDto from "../../data/DataTransferObjects/UserDto";
import AgentDto from "../../data/DataTransferObjects/AgentDto";
import JobDto from "../../data/DataTransferObjects/JobDto";
import RoleDto from "../../data/DataTransferObjects/RoleDto";
import PermissionDto from "../../data/DataTransferObjects/PermissionDto";
import CampaignDto from "../../data/DataTransferObjects/CampaignDto";

const mapToDto = (data: any, type: Dtos): object => {
    switch(type) {
        case (Dtos.UserDto): {
            if (typeof data.length !== 'undefined') {
                const users: UserDto[] = [];
                data.forEach((user: object) => {
                    users.push(new UserDto(user));
                });
                return users;
            }
            return new UserDto(data);
        }
        case (Dtos.AgentDto): {
            if (typeof data.length !== 'undefined') {
                const agents: AgentDto[] = [];
                data.forEach((agent: object) => {
                    agents.push(new AgentDto(agent));
                });
                return agents;
            }
            return new AgentDto(data);
        }
        case (Dtos.JobDto): {
            if (typeof data.length !== 'undefined') {
                const jobs: JobDto[] = [];
                data.forEach((job: object) => {
                    jobs.push(new JobDto(job));
                });
                return jobs;
            }
            return new JobDto(data);
        }
        case (Dtos.RoleDto): {
            if (typeof data.length !== 'undefined') {
                
                const roles: RoleDto[] = [];
                data.forEach((role: any) => {
                    const permissions: PermissionDto[] =[];
                    if(typeof role.permissions.length !== 'undefined')
                    {
                        role.permissions.forEach((permission: object) => {
                            permissions.push(new PermissionDto(permission));
                        })
                    }
                    var result = new RoleDto(role);
                    result.permissions = permissions;
                    roles.push(result);
                });
                return roles;
            }
            const permissions: PermissionDto[] =[];
            if(typeof data.permissions.length !== 'undefined'){
                data.permissions.forEach((permission: object) => {
                    permissions.push(new PermissionDto(permission));
                });
            }
            var result = new RoleDto(data);
            result.permissions = permissions;
            return result;
        }
        case (Dtos.PermissionDto): {
            if (typeof data.length !== 'undefined') {
                const permissions: PermissionDto[] = [];
                data.forEach((permission: object) => {
                    permissions.push(new PermissionDto(permission));
                });
                return permissions;
            }
            return new PermissionDto(data);
        }
        case (Dtos.CampaignDto): {
            if (typeof data.length !== 'undefined') {
                const campaigns: CampaignDto[] = [];
                data.forEach((campaign: object) => {
                    campaigns.push(new CampaignDto(campaign));
                });
                return campaigns;
            }
            return new CampaignDto(data);
        }
        default: {
            return {};
        }
    }
}

export default mapToDto;