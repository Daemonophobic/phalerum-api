import { Pool } from "mysql2";
import logger from "../helpers/functions/logger";

const mysql  = require("mysql2");

class DatabaseHandler {
    private pool: Pool;
    private prepPool: Pool;

    constructor(prepMode: boolean = false) {
        if (prepMode == false) {
            this.pool = this.getPool();
        } else {
            this.prepPool = this.getPrepPool();
        }
    }

    public getPool() {
        if (this.pool) return this.pool;
        this.pool = mysql.createPool({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DATABASE,
          connectionLimit: 100,
        });
        return this.pool;
    }

    private getPrepPool() {
        if (this.prepPool) return this.prepPool;
        this.prepPool = mysql.createPool({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          connectionLimit: 5,
          multipleStatements: true,
        });
        return this.prepPool;
    }

    public async testConnection(): Promise<Error|boolean> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    logger.error(err.message);
                    reject(err);
                }

                if (typeof connection !== 'undefined') {
                    connection.release();
                    logger.info("Database Connected");
                    resolve(true);
                }
            });
        });
    }

    public async prepDatabase(lines: any): Promise<Error|boolean> {
        return new Promise((resolve, reject) => {
            this.prepPool.getConnection((err, connection) => {
                if (err) {
                    logger.error(err.message);
                    reject(err);
                }

                connection.query(
                    lines,
                    (err: Error) => {
                        connection.release();
                        if (err) throw(err);
                        logger.info("The database has been prepared");
                        resolve(true);
                    })
            });
        });
    }
}

export default DatabaseHandler;