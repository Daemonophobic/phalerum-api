import UserRepository from '../repositories/UserRepository';
import CryptoHelper from '../helpers/functions/CryptoHelper';
import MailHelper from '../helpers/functions/MailHelper';
import logger from '../helpers/functions/logger';
import { ExceptionEnum } from '../helpers/exceptions/OperationExceptions';
import RoleRepository from '../repositories/RoleRepository';
// import { ExceptionEnum } from '../helpers/exceptions/OperationExceptions';

class UserService {
    private userRepository: UserRepository;
    private roleRepository: RoleRepository;
    private cryptoHelper: CryptoHelper;
    private mailHelper: MailHelper;

    constructor() {
        this.userRepository = new UserRepository();
        this.roleRepository = new RoleRepository();
        this.cryptoHelper = new CryptoHelper();
        this.mailHelper = new MailHelper({host: process.env.MAIL_HOST, port: parseInt(process.env.MAIL_PORT)})
    }

    public getAllUsers = async () => this.userRepository.getAllUsers();

    public getUser = async (_id: string) => {
        const user = await this.userRepository.getUser(_id);
        if (user === null) {
            throw ExceptionEnum.NotFound;
        }
        return user;
    }

    public addUser = async (user: {firstName: string, lastName: string, username: string, emailAddress: string}, roleName: string = "Guest", initial: boolean = false) => {
        const initializationToken = this.cryptoHelper.generateToken();

        const role = await this.roleRepository.GetRoleByName(roleName);
        if (role === null) {
            throw ExceptionEnum.InvalidResult;
        }
        
        const data = await this.userRepository.addUser({...user, initializationToken: initializationToken.prod, roles: [role]});

        logger.info(`sending mail for ${user.username}`)
        this.mailHelper.sendMailAsync(process.env.MAIL_FROM, `${user.firstName} <${user.emailAddress}`, `You have been invited to join Phalerum`,
        `<h1>Welcome to Phalerum</h1>
         <p>${initial ? 'An account was created' : 'Your administrator has created an account'} for you. To join, fill in the following data on the website:</p>
         <ul>
            <li>Email: ${user.emailAddress}</l1>
            <li>Initialization Token: ${initializationToken.plain}</li>
         </ul>`);

         return data;
    }

    public updateUser = async (id: string, user: {firstName?: string, lastName?: string, username?: string, emailAddress?: string, profilePicture?: string}) =>
        this.userRepository.updateUser(id, user);
}

export default UserService;