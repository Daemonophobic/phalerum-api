import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";
import OutputDto from '../data/DataTransferObjects/OutputDto';
import outputModel from "../models/output";

export default class OutputRepository {
    private output = outputModel;

    public getOutputForJob = async (jobId: string, amount: number, page: number): Promise<OutputDto[]> =>
        this.output.find({ jobId, deleted: false })
            .sort({createdAt:-1})
            .skip(page * amount)
            .limit(amount)
            .populate('jobId')
            .populate('agentId');

    public setOutputDeletedForAgent = async (agentId: string): Promise<void> => {
        await this.output.updateMany({agentId}, {deleted: true});
    }

    public getOutputAmountForJob = async (jobId: string): Promise<number> =>
        this.output.find({jobId, deleted: false}).countDocuments();

    public createOutput = async (output: Partial<OutputDto>): Promise<OutputDto> =>
        this.output.create(output);

    public deleteOutput = async (_id: string): Promise<OutputDto> =>
        this.output.findOneAndDelete({_id}, {new: true});
}