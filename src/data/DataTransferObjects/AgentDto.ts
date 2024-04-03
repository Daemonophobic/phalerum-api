import AddedBy from "../enums/AddedByEnum";
import OS from "../enums/OsEnum";

export default class AgentDto {
    id: number;
    guid: string;
    agentName: string;
    addedBy: AddedBy;
    addedByGuid: string;
    lastCheckIn: EpochTimeStamp;
    ipAddress: string;
    master: boolean;
    communicationToken: string;
    os: OS;

    constructor(data: any) {
        this.id = data.id;
        this.guid = data.guid;
        this.agentName = data.agentName;
        this.addedBy = data.addedBy;
        this.addedByGuid = data.addedByGuid;
        this.lastCheckIn = data.lastCheckIn;
        this.ipAddress = data.ipAddress;
        this.master = data.master;
        this.communicationToken = data.communicationToken;
        this.os = data.os;
    }
}