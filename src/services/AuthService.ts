import AuthRepository from "../repositories/AuthRepository";
import UserRepository from "../repositories/UserRepository";
import UserDto from "../data/DataTransferObjects/UserDto";
import JWTHelper from "../helpers/functions/JWTHelper";
import CryptoHelper from "../helpers/functions/CryptoHelper";
import { ExceptionEnum, OperationException } from "../helpers/exceptions/OperationExceptions";

const { authenticator } = require('otplib')
const bcrypt = require('bcrypt');
const qrcode = require('qrcode');

class AuthService {
    private authRepository: AuthRepository;
    private userRepository: UserRepository;
    private cryptoHelper: CryptoHelper;
    private JWTHelper: JWTHelper;

    constructor() {
        this.authRepository = new AuthRepository();
        this.userRepository = new UserRepository();
        this.cryptoHelper = new CryptoHelper();
        this.JWTHelper = new JWTHelper();
    }

    public initializeCredentials = async (user: Partial<UserDto>): Promise<string> => {
       const userObject = await this.authRepository.getAuthenticationInformation(user.emailAddress);

       if (userObject.initializationToken == null) {
        return ExceptionEnum.InvalidResult;
       } 

       const initializationToken = this.cryptoHelper.decrypt(userObject.initializationToken);
       if (user.initializationToken !== initializationToken) {
        throw ExceptionEnum.Forbidden;
       }

       const hash = bcrypt.hashSync(user.password, 10);
       await this.userRepository.updateUser(userObject._id, {password: hash})

       const OTPSecret = authenticator.generateSecret();
       const OTPUri = authenticator.keyuri(user.emailAddress, 'phalerum', OTPSecret);

       const encryptedOTPSecret = this.cryptoHelper.encrypt(OTPSecret);
       await this.userRepository.updateUser(userObject._id, {OTPSecret: encryptedOTPSecret});
       
       return new Promise((resolve, reject) => {       
        qrcode.toDataURL(OTPUri, (err: Error, imageUrl: string) => {
            if (err) reject(OperationException.ServerError);
            resolve(imageUrl);
        })
       })
    }

    public initializeTwoFactorAuthentication = async (user: Partial<UserDto>, OTP: number) => {
        const authInfo = await this.authRepository.getAuthenticationInformation(user.emailAddress);
        if (typeof authInfo === 'boolean' || authInfo.initializationToken == null) {
            throw ExceptionEnum.InvalidResult;
        }

        const OTPSecret = this.cryptoHelper.decrypt(authInfo.OTPSecret);
        const isValid = authenticator.check(OTP.toString(), OTPSecret);
        if (!isValid) throw ExceptionEnum.Forbidden;

        return !(await this.authRepository.unlockAccount(user.emailAddress)).locked;
    }

    public authenticateUser = async (user: Partial<UserDto>, OTP: string): Promise<{error: boolean, session?: string}> => {
        const authInfo = await this.authRepository.getAuthenticationInformation(user.emailAddress);

        if (authInfo === null) {
            return {error: true};
        }

        if (authInfo.locked) {
            throw ExceptionEnum.Forbidden;
        } 

        const OTPSecret = this.cryptoHelper.decrypt(authInfo.OTPSecret);
        const isValid = authenticator.check(OTP, OTPSecret);
        if (isValid) throw ExceptionEnum.InvalidResult;

        const result = await this.JWTHelper.verifyCredentials(authInfo, user.password);
        return result;
    }
}

export default AuthService;