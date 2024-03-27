import BaseCrudRepository from "./base/BaseCrudRepository";
import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";
import UserDto from '../data/DataTransferObjects/UserDto';

export default class AuthRepository extends BaseCrudRepository {
    constructor() {
        super(['user_auth', 'users']);
    }

    async getAuthenticationInformation(emailAddress: string): Promise<UserDto|boolean>|undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.query(
                    `SELECT user_id as id, username as username, email_address as emailAddress, password, OTP_Secret as OTPSecret, authentication_attempts as authenticationAttempts, locked,
                        initialization_token as initializationToken FROM 
                      ${this.tableNames[0]} INNER JOIN ${this.tableNames[1]} ON id = user_id WHERE email_address = ?`,
                    [emailAddress],
                    (err: Error, res: any) => {
                        connection.release();
                        if (err) reject(err);
                        if (typeof res === "undefined") reject(ExceptionEnum.InvalidResult)
                        if (res.length === 1) resolve(res[0])
                        else resolve(false);
                    }
                );
            })
        });
    }

    async addUser(user: Partial<UserDto>): Promise<Error|boolean>|undefined { // Legacy, used only for seeding
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.query(
                    `INSERT INTO ${this.tableNames[0]}(user_id, password, OTP_secret, locked) VALUES(?, ?, ?, ?)`,
                    [user.id, user.password, user.OTPSecret, 0],
                    (err: Error, res: any) => {
                        connection.release();
                        if (err) reject(err);
                        else resolve(res);
                    }
                )
            });
        });
    }

    async getInitializationToken(user: Partial<UserDto>): Promise<{data: string, iv: string}>|undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.query(
                    `SELECT initialization_token FROM ${this.tableNames[0]} INNER JOIN ${this.tableNames[1]} 
                        ON ${this.tableNames[0]}.user_id = ${this.tableNames[1]}.id WHERE email_address = ?`,
                    [user.emailAddress],
                    (err: Error, res: any) => {
                        connection.release();
                        if (err) reject(err);
                        if (res.length === 0) reject(ExceptionEnum.NotFound);
                        else resolve(res[0].initialization_token);
                    }
                )
            })
        })
    }

    async updateOTPSecret(user: Partial<UserDto>): Promise<Boolean>|undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.query(
                    `UPDATE ${this.tableNames[0]} INNER JOIN ${this.tableNames[1]} ON ${this.tableNames[0]}.user_id = 
                        ${this.tableNames[1]}.id SET OTP_secret = ? WHERE email_address = ?`,
                    [JSON.stringify(user.OTPSecret), user.emailAddress],
                    (err: Error, res: any) => {
                        connection.release();
                        if (err) reject(err);
                        else resolve(true);
                    }
                )
            })
        })
    }

    async updateCredentials(user: Partial<UserDto>): Promise<Boolean>|undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.query(
                    `UPDATE ${this.tableNames[0]} INNER JOIN ${this.tableNames[1]} ON ${this.tableNames[0]}.user_id = 
                        ${this.tableNames[1]}.id SET password = ? WHERE email_address = ?`,
                    [user.password, user.emailAddress],
                    (err: Error, res: any) => {
                        connection.release();
                        if (err) reject(err);
                        else resolve(true);
                    }
                )
            });
        })
    }

    async unlockAccount(emailAddress: string): Promise<Boolean>|undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.query(
                    `UPDATE ${this.tableNames[0]} INNER JOIN ${this.tableNames[1]} ON ${this.tableNames[0]}.user_id = 
                    ${this.tableNames[1]}.id SET locked = 0, initialization_token = NULL WHERE email_address = ?`,
                    [emailAddress],
                    (err: Error, res: any) => {
                        connection.release();
                        if (err) reject(err);
                        else resolve(true);
                    }
                )
            })
        })
    }
}