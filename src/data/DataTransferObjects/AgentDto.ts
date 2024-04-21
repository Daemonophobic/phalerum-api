import AddedBy from "../enums/AddedByEnum";
import OS from "../enums/OsEnum";

export default class AgentDto {
    _id: string;
    agentName: string;
    addedBy: AddedBy;
    addedByUser: any;
    addedByAgent: any;
    lastCheckIn: Date;
    ipAddress: string;
    master: boolean;
    communicationToken: any;
    createdAt: EpochTimeStamp;
    os: OS;

    constructor(data: any) {
        this._id = data._id;
        this.agentName = data.agentName;
        this.addedBy = data.addedBy;
        this.addedByUser = data.addedByUser;
        this.addedByAgent = data.addedByAgent;
        this.lastCheckIn = data.lastCheckIn;
        this.ipAddress = data.ipAddress;
        this.master = data.master;
        this.communicationToken = data.communicationToken;
        this.createdAt = data.createdAt;
        this.os = data.os;
    }
}