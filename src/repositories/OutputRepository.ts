import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";
import OutputDto from '../data/DataTransferObjects/OutputDto';
import outputModel from "../models/output";

export default class OutputRepository {
    private output = outputModel;

    public getOutputForJob = async (jobId: string): Promise<OutputDto[]> =>
        this.output.find({jobId})
        .populate('jobId')
        .populate('agentId');

    public createOutput = async (output: Partial<OutputDto>): Promise<OutputDto> =>
        this.output.create(output);

    public deleteOutput = async (_id: string): Promise<OutputDto> =>
        this.output.findOneAndDelete({_id}, {new: true});
}