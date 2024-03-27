import OsEnum from "../enums/OsEnum";

export default class AgentDto {
    id: number;
    agentName: string;
    addedBy: number;
    lastCheckIn: EpochTimeStamp;
    ipAddress: string;
    master: boolean;
    communicationToken: string;
    os: OsEnum;

    constructor(data: any) {
        this.id = data.id;
        this.agentName = data.agentName;
        this.addedBy = data.addedBy;
        this.lastCheckIn = data.lastCheckIn;
        this.ipAddress = data.ipAddress;
        this.master = data.master;
        this.communicationToken = data.communicationToken;
        this.os = data.os;
    }
}