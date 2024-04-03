import RoleDto from "data/DataTransferObjects/RoleDto";
import PermissionDto from "data/DataTransferObjects/PermissionDto";
import BaseCrudRepository from "./base/BaseCrudRepository";
import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";
import { promises } from "fs";

export default class RoleRepository extends BaseCrudRepository {
    constructor() {
        super(["roles", "permissions", "permissions_lookup", "role_lookup"]);
    }

    async GetAllRoles(): Promise<RoleDto[]>| undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if(err) reject(err);

                connection.query(
                    `SELECT id, name FROM ${this.tableNames[0]}`,(err: Error, res: any) => {
                        connection.release();
                        if (err) reject(err);
                        else {
                            resolve(res);
                        };
                    }
                );
            }
            )
        });
    }

    async CreateRole(name: string): Promise<{role: Partial<RoleDto>, res: any}>| undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if(err) reject(err);

                connection.query(`INSERT INTO ${this.tableNames[0]} ('names') VALUES (?)`, [name], (err: Error, res: any) => {
                    if(err) {
                        connection.release();
                        reject(err);
                    }
                }
                );
            }
        )
            })
    }
}