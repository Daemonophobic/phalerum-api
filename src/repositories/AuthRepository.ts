import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";
import UserDto from '../data/DataTransferObjects/UserDto';
import userModel from "../models/user";

export default class AuthRepository {
    private user = userModel;

    public getAuthenticationInformation = async (emailAddress: string): Promise<UserDto> => 
        await this.user.findOne({emailAddress}).select(['+password', '+initializationToken', '+locked', '+authenticationAttempts', '+OTPSecret', '+roles'])
        .populate('roles');
        
    public unlockAccount = async (emailAddress: string): Promise<UserDto> =>
        await this.user.findOneAndUpdate({emailAddress}, {locked: false}, { new: true });
}