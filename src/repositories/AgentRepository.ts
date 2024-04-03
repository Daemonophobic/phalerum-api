import BaseCrudRepository from "./base/BaseCrudRepository";
import { ExceptionEnum } from "../helpers/exceptions/OperationExceptions";
import AgentDto from '../data/DataTransferObjects/AgentDto';

export default class AgentRepository extends BaseCrudRepository {
    constructor() {
        super(['agents']);
    }

    async getAllAgents(): Promise<AgentDto[]>|undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.query(
                    `SELECT guid, agent_name as agentName, added_by as addedBy, last_check_in as lastCheckIn, ip_address as ipAddress, master, os FROM ${this.tableNames[0]}`,
                    (err: Error, res: any) => {
                        connection.release();
                        if (err) reject(err);
                        else resolve(res);
                    }
                );
            })
        });
    }

    async getAgent(guid: string): Promise<AgentDto>|undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.query(
                `SELECT guid, agent_name as agentName, added_by as addedBy, last_check_in as lastCheckIn, ip_address as ipAddress, master, os FROM ${this.tableNames[0]} WHERE guid = ?`,
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

    async addAgent(agent: Partial<AgentDto>, communicationToken: {data: string, iv: string}): Promise<Partial<AgentDto>>|undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.query(
                    `INSERT INTO ${this.tableNames[0]}(guid, agent_name, added_by, added_by_guid, master, communication_token, os) VALUES(?, ?, ?, ?, ?, ?, ?)`,
                    [agent.guid, agent.agentName, agent.addedBy, agent.addedByGuid, agent.master, JSON.stringify(communicationToken), agent.os],
                    (err: Error, res: any) => {
                        connection.release();
                        if (err) reject(err);
                        resolve(agent);
                    }
                );
            });
        });
    }

    async deleteAgent(guid: string): Promise<Boolean>|undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.query(
                    `DELETE FROM ${this.tableNames[0]} WHERE guid = ?`,
                    [guid],
                    (err: Error, _) => {
                        if (err) {
                            connection.release();
                            reject(err)
                        }
                        resolve(true);
                    });
                });
            });
        }
}