import Dtos from "../../data/enums/DtoEnum";
import UserDto from "../../data/DataTransferObjects/UserDto";
import AgentDto from "../../data/DataTransferObjects/AgentDto";
import JobDto from "../../data/DataTransferObjects/JobDto";

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
        default: {
            return {};
        }
    }
}

export default mapToDto;