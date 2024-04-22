export default class CampaignDto {
    _id: string;
    number: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: any;
    startDate: Date;
    endDate: Date;
    active: boolean;
    statistics: {agents: number, jobs: number};

    constructor(data: any) {
        this._id = data._id;
        this.number = data.number;
        this.name = data.name;
        this.description = data.description;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.createdBy = data.createdBy;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.active = data.active;
        this.statistics = data.statistics;
    }
}