import OS from "../enums/OsEnum";

export default class JobDto {
    _id: string;
    jobName: string;
    jobDescription: string;
    completed: boolean;
    disabled: boolean;
    crossCompatible: boolean;
    os: OS;
    agentId: any;
    masterJob: boolean;
    shellCommand: boolean;
    command: string;
    available: boolean;
    useCron: boolean;
    cron: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: any;
    subnets: string[];
    hide: boolean;

    constructor(data: any) {
        this._id = data._id;
        this.jobName = data.jobName;
        this.jobDescription = data.jobDescription;
        this.completed = data.completed;
        this.disabled = data.disabled;
        this.crossCompatible = data.crossCompatible;
        this.os = data.os;
        this.agentId = data.agentId;
        this.masterJob = data.masterJob;
        this.shellCommand = data.shellCommand;
        this.command = data.command;
        this.available = data.available;
        this.useCron = data.useCron;
        this.cron = data.cron;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.createdBy = data.createdBy;
        this.subnets = data.subnets;
        this.hide = data.hide;
    }
}