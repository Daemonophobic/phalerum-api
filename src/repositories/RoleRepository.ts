import RoleDto from "data/DataTransferObjects/RoleDto";
import PermissionDto from "data/DataTransferObjects/PermissionDto";
import BaseCrudRepository from "./base/BaseCrudRepository";
import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";

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

    async CreateRole(role: Partial<RoleDto>): Promise<Partial<RoleDto>>|undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.query(
                    `INSERT INTO ${this.tableNames[0]} (name) VALUES (?)`,
                    [role.name],
                    (err: Error, res: any, fields: any) => {
                        connection.release;
                        if (err) reject(err);
                        resolve(role);
                    });
            });
        })
    }
}