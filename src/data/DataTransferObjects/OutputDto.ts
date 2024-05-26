export default class OutputDto {
    _id: string;
    output: string;
    success: boolean;
    jobId: any;
    agentId: any;

    constructor(data: any) {
        this._id = data._id;
        this.output = data.output;
        this.success = data.success;
        this.jobId = data.jobId;
        this.agentId = data.agentId;
    }
}