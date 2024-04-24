import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";
import UserDto from '../data/DataTransferObjects/UserDto';
import userModel from "../models/user";

export default class AuthRepository {
    private user = userModel;

    public getAuthenticationInformation = async (emailAddress: string): Promise<UserDto> => 
        this.user.findOne({emailAddress}).select(['+password', '+initializationToken', '+locked', '+authenticationAttempts', '+OTPSecret', '+roles'])
        .populate('roles');
        
    public unlockAccount = async (emailAddress: string): Promise<UserDto> =>
        this.user.findOneAndUpdate({emailAddress}, {locked: false, initializationToken: null}, { new: true });
}