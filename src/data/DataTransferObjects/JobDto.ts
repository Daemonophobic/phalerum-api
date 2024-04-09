import OS from "../enums/OsEnum";

export default class JobDto {
    id: number;
    guid: string;
    jobName: string;
    jobDescription: string;
    completed: boolean;
    disabled: boolean;
    crossCompatible: boolean;
    os: OS;
    agentGUID: string;
    masterJob: boolean;
    shellCommand: boolean;
    command: string;
    createdAt: EpochTimeStamp;
    createdBy: string;

    constructor(data: any) {
        this.id = data.id;
        this.guid = data.guid;
        this.jobName = data.jobName;
        this.jobDescription = data.jobDescription;
        this.completed = data.completed;
        this.disabled = data.disabled;
        this.crossCompatible = data.crossCompatible;
        this.os = data.os;
        this.agentGUID = data.agentGUID;
        this.masterJob = data.masterJob;
        this.shellCommand = data.shellCommand;
        this.command = data.command;
        this.createdAt = data.createdAt;
        this.createdBy = data.createdBy;      
    }
}