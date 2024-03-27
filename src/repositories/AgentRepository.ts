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
                    `SELECT id, agent_name as agentName, added_by as addedBy, last_check_in as lastCheckIn, ip_address as ipAddress, master, communication_token as communicationToken, os FROM ${this.tableNames[0]}`,
                    (err: Error, res: any) => {
                        connection.release();
                        if (err) reject(err);
                        else resolve(res);
                    }
                );
            })
        });
    }

    async getAgent(agentId: Number): Promise<AgentDto>|undefined {
        return new Promise((resolve, reject) => {
            this.db.getPool().getConnection((err, connection) => {
                if (err) reject(err);

                connection.query(
                `SELECT id, agent_name as agentName, added_by as addedBy, last_check_in as lastCheckIn, ip_address as ipAddress, master, communication_token as communicationToken, os FROM ${this.tableNames[0]} WHERE id = ?`,
                  [agentId],
                  (err: Error, res: any) => {
                    connection.release();
                    if (err) reject(err);
                    res.length == 0 ? reject(ExceptionEnum.NotFound) : '';
                    res.length == 1 ? resolve(res[0]): reject(ExceptionEnum.InvalidResult);
                  }
                );
            });
        });
    }
}