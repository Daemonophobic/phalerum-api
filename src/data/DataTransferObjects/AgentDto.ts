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
    partialMaster: boolean;
    communicationToken: any;
    createdAt: EpochTimeStamp;
    os: OS;
    upgraded: boolean;

    constructor(data: any) {
        this._id = data._id;
        this.agentName = data.agentName;
        this.addedBy = data.addedBy;
        this.addedByUser = data.addedByUser;
        this.addedByAgent = data.addedByAgent;
        this.lastCheckIn = data.lastCheckIn;
        this.ipAddress = data.ipAddress;
        this.master = data.master;
        this.partialMaster = data.partialMaster;
        this.communicationToken = data.communicationToken;
        this.createdAt = data.createdAt;
        this.os = data.os;
        this.upgraded = data.upgraded;
    }
}