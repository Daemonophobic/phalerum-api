import UserRepository from '../repositories/UserRepository';
import UserService from './UserService';
import { ExceptionEnum } from '../helpers/exceptions/OperationExceptions';

class AdminService {
    private userRepository: UserRepository;
    private userService: UserService;

    constructor() {
        this.userRepository = new UserRepository();
        this.userService = new UserService();
    }

    public addInitialUser = async (user: {firstName: string, lastName: string, username: string, emailAddress: string}) => {
        const users = await this.userRepository.getAllUsers();

        if (users.length === 0) {
            return this.userService.addUser(user, "Admin", true);
        }
        throw ExceptionEnum.Forbidden;
    }

    public getExtendedUser = async (_id: string) => {
        const user = await this.userRepository.getExtendedUser(_id);
        if (user === null) {
            throw ExceptionEnum.NotFound;
        }
        return user;
    }
}

export default AdminService;