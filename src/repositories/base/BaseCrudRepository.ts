import DatabaseConnection from '../DatabaseHandler';

export default class BaseCrudRepository {
  // Create base repository
  db: DatabaseConnection;

  tableNames: string[];

  constructor(tableNames: string[]) {
    this.db = new DatabaseConnection();
    this.tableNames = tableNames;
  }
}