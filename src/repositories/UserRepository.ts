import BaseCrudRepository from "./base/BaseCrudRepository";
import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";
import UserDto from '../data/DataTransferObjects/UserDto';
import { QueryError } from "mysql2";

export default class UserRepository extends BaseCrudRepository {
    constructor() {
        super(['users', 'user_auth']);
    }

    async getAllUsers(): Promise<UserDto[]>|undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.query(
                    `SELECT guid, first_name as firstName, last_name as lastName, username, created_at as createdAt FROM ${this.tableNames[0]}`,
                    (err: Error, res: any) => {
                        connection.release();
                        if (err) reject(err);
                        else resolve(res);
                    }
                );
            })
        });
    }

    async getUser(guid: string): Promise<UserDto>|undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.query(
                  `SELECT guid, first_name as firstName, last_name as lastName, username, created_at as createdAt FROM ${this.tableNames[0]} WHERE guid = ?`,
                  [guid],
                  (err: Error, res: any) => {
                    connection.release();
                    if (err) reject(err);
                    res.length === 0 ? reject(ExceptionEnum.NotFound) : '';
                    res.length === 1 ? resolve(res[0]): reject(ExceptionEnum.InvalidResult);
                  }
                );
            });
        });
    }

    async getUserById(userId: number): Promise<UserDto>|undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.query(
                    `SELECT guid, first_name as firstName, last_name as lastName, username, created_at as createdAt FROM ${this.tableNames[0]} WHERE id = ?`,
                    [userId],
                    (err: Error, res: any) => {
                      connection.release();
                      if (err) reject(err);
                      res.length === 0 ? reject(ExceptionEnum.NotFound) : '';
                      res.length === 1 ? resolve(res[0]): reject(ExceptionEnum.InvalidResult);
                    }
                  );
            });
        });
    }

    async addUser(user: {guid: string, firstName: string, lastName: string, username: string, emailAddress: string}, initializationToken: {data: string, iv: string}): Promise<{user: Partial<UserDto>, res: any}>|undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.beginTransaction((err: Error) => {
                    if (err) {
                        reject(err);
                    }
                });

                connection.query(
                    `INSERT INTO ${this.tableNames[0]}(guid, first_name, last_name, username, email_address) VALUES(?, ?, ?, ?, ?)`,
                    [user.guid, user.firstName, user.lastName, user.username, user.emailAddress],
                    (err: Error, res: any, fields: any) => {
                        if (err) {
                            connection.release();
                            reject(err)
                        }

                        if (typeof res === "undefined") return reject(ExceptionEnum.InvalidResult);

                        connection.query(
                            `INSERT INTO ${this.tableNames[1]}(user_guid, initialization_token) VALUES(?, ?)`,
                            [user.guid, JSON.stringify(initializationToken)],
                            (err: Error, res: any) => {
                                connection.release();
                                if (err) {
                                    connection.rollback((err) => {
                                        if (err) {
                                            reject(err);
                                        }
                                    })
                                    reject(err);
                                }
                                else {
                                    connection.commit((err: QueryError) => {
                                        if (err) {
                                            reject(err);
                                        }
                                    });
                                    resolve({user, res})
                                };
                            }
                        )
                    }
                );
            });
        });
    }

    async addUserLegacy(user: {guid: string, firstName: string, lastName: string, username: string, email: string}): Promise<{user: Partial<UserDto>, res: any}>|undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.query(
                    `INSERT INTO ${this.tableNames[0]}(guid, first_name, last_name, username, email_address) VALUES(?, ?, ?, ?, ?)`,
                    [user.guid, user.firstName, user.lastName, user.username, user.email],
                    (err: Error, res: any, fields: any) => {
                        connection.release();
                        if (err) reject(err)
                        else resolve({user, res});
                    }
                );
            });
        });
    }

    async deleteUser(guid: string): Promise<Boolean>|undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.beginTransaction((err: Error) => {
                    if (err) {
                        reject(err);
                    }
                });

                connection.query(
                    `DELETE FROM ${this.tableNames[1]} WHERE user_guid = ?`,
                    [guid],
                    (err: Error, _) => {
                        if (err) {
                            connection.release();
                            reject(err)
                        }

                        connection.query(
                            `DELETE FROM ${this.tableNames[0]} WHERE guid = ?`,
                            [guid],
                            (err: Error, _) => {
                                connection.release();
                                if (err) {
                                    connection.rollback((err) => {
                                        if (err) {
                                            reject(err);
                                        }
                                    })
                                    reject(err);
                                }
                                else {
                                    connection.commit((err: QueryError) => {
                                        if (err) {
                                            reject(err);
                                        }
                                    });
                                    resolve(true);
                                };
                            }
                        )
                    })
            });
        });
    }
}