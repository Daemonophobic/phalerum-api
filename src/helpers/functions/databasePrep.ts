import DatabaseHandler from '../../repositories/DatabaseHandler';

const fs = require('fs');

require("dotenv").config();

const db = new DatabaseHandler(true);

const prepDatabase = async () => {
    const dbScheme = fs.readFileSync('PHALERUM.sql', { encoding: 'utf8', flag: 'r' }).split("\n").join(" ");
    await db.prepDatabase(dbScheme);
    process.exit(0);
}

prepDatabase();