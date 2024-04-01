export default class UserDto {
    id: number;
    guid: string;
    username: string;
    emailAddress: string;
    firstName: string;
    lastName: string;
    createdAt: EpochTimeStamp;
    lastModified: EpochTimeStamp;
    password: string;
    OTPSecret: any;
    initializationToken: string;
    authenticationAttempts: number;
    locked: boolean;

    constructor(data: any) {
        this.id = data.id;
        this.guid = data.guid;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.username = data.username;
        this.createdAt = data.createdAt;
        this.password = data.password;
        this.OTPSecret = data.OTPSecret;
        this.initializationToken = data.initializationToken;
        this.authenticationAttempts = data.authenticationAttempts;
        this.locked = data.enabled;    
    }
}