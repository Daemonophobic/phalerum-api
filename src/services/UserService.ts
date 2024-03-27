import UserRepository from '../repositories/UserRepository';
import CryptoHelper from '../helpers/functions/CryptoHelper';
import MailHelper from '../helpers/functions/MailHelper';
import logger from '../helpers/functions/logger';
import { ExceptionEnum } from '../helpers/exceptions/OperationExceptions';

class UserService {
    private userRepository: UserRepository;
    private cryptoHelper: CryptoHelper;
    private mailHelper: MailHelper;

    constructor() {
        this.userRepository = new UserRepository();
        this.cryptoHelper = new CryptoHelper();
        this.mailHelper = new MailHelper({host: process.env.MAIL_HOST, port: parseInt(process.env.MAIL_PORT)})
    }

    public getAllUsers = async () => this.userRepository.getAllUsers();

    public getUser = async (userId: number) => this.userRepository.getUser(userId);

    public addUser = async (user: {firstName: string, lastName: string, username: string, emailAddress: string}) => {
        const initializationToken = this.cryptoHelper.generateToken();

        const data = await this.userRepository.addUser(user, initializationToken.prod);

        logger.info(`sending mail for ${user.username}`)
        this.mailHelper.sendMail("Phalerum <phalerum@phalerum.stickybits.red>", `${user.username} <${user.emailAddress}>`, `You have been invited to join Phalerum`,
        `<h1>Welcome to Phalerum</h1>
         <p>Your administrator has created an account for you. To join, fill in the following data on the website:</p>
         <ul>
            <li>Email: ${user.emailAddress}</l1>
            <li>Initialization Token: ${initializationToken.plain}</li>
         </ul>`);

         return data;
    }

    public deleteUser = async (userId: number) => this.userRepository.deleteUser(userId);
}

export default UserService;