import RoleDto from "./RoleDto";

export default class UserDto {
    _id: string;
    username: string;
    emailAddress: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
    password: string;
    OTPSecret: any;
    initializationToken: any;
    authenticationAttempts: number;
    locked: boolean;
    roles: Array<RoleDto>;
    profilePicture: string;
    admin: boolean;

    constructor(data: any) {
        this._id = data._id;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.username = data.username;
        this.emailAddress = data.emailAddress;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.password = data.password;
        this.OTPSecret = data.OTPSecret;
        this.initializationToken = data.initializationToken;
        this.authenticationAttempts = data.authenticationAttempts;
        this.locked = data.locked; 
        this.roles = data.roles;
        this.profilePicture = data.profilePicture;
        this.admin = data.admin;
    }
}