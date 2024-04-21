import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";
import UserDto from '../data/DataTransferObjects/UserDto';
import userModel from "../models/user";

export default class UserRepository {
    private user = userModel;

    public getAllUsers = async (): Promise<UserDto[]> => await this.user.find();

    public getExtendedUser = async (_id: string): Promise<UserDto> =>
        await this.user.findOne({_id})
        .select(['+authenticationAttempts', '+locked', '+roles'])
        .populate('roles');

    public getUser = async(_id: string): Promise<UserDto> =>
        await this.user.findOne({_id});

    public addUser = async(user: Partial<UserDto>): Promise<UserDto> => {
        try {
            return (await this.user.create(user)).toObject({ useProjection: true });
        } catch(e) {
            if (e.errorResponse.code === 11000) {
                throw ExceptionEnum.DuplicateKey;
            }
            throw ExceptionEnum.InvalidResult;
        }
    }

    public updateUser = async(_id: string, user: Partial<UserDto>): Promise<UserDto> => {
        try {
            return await this.user.findOneAndUpdate({_id}, user, { new: true });
        } catch(e) {
            if (e.errorResponse.code === 11000) {
                throw ExceptionEnum.DuplicateKey;
            }
            throw ExceptionEnum.InvalidResult;
        }
    }
}