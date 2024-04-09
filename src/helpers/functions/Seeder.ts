import { faker } from '@faker-js/faker';
import { connect } from 'mongoose';

import CryptoHelper from "./CryptoHelper";
import logger from './logger';
import userModel from '../../models/user';
import agentModel from '../../models/agent';
import OS from '../../data/enums/OsEnum';
import AddedBy from '../../data/enums/AddedByEnum';
import roleModel from '../../models/roles';

const bcrypt = require('bcrypt');
const fs = require('fs');

require('dotenv').config();

class Seeder {
    private user = userModel;
    private agent = agentModel;
    private role = roleModel;
    private cryptoHelper = new CryptoHelper();
    private userAmount = 5;
    private agentAmount = 5;

    constructor() {
        faker.seed(1898);
        this.connectDatabase()
        .then(() => logger.info("Database Connected"))
        .catch((err) => logger.error(err));
    }

    public seed = async () => {
        // Clear Collections
        await this.clearCollections();

        // Adding Users
        await this.seedUsers(this.userAmount);

        // Adding Agents
        await this.seedAgents(this.userAmount, this.agentAmount);

        // Adding Roles
        await this.seedRoles();

        logger.info("Completed seeding the database!");
        process.exit(0);
    }

    private clearCollections = async () => {
        await this.user.deleteMany({});
        await this.agent.deleteMany({});
        await this.role.deleteMany({});
    }

    private seedUsers = async (userAmount: number) => {
        for (let i = 0; i < userAmount; i += 1) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const username = faker.internet.userName({firstName, lastName});
            const email = faker.internet.email({firstName, lastName}).toLowerCase();
            const hash = bcrypt.hashSync(process.env.DEV_SEED_PASSWORD, 10);
            const OTPSecret = process.env.DEV_OTP_SECRET;
            const encryptedOTPSecret = this.cryptoHelper.encrypt(OTPSecret);
            await this.user.create({firstName, lastName, username, emailAddress: email, password: hash, OTPSecret: encryptedOTPSecret, locked: false, initializationToken: {}});
        }
    }

    private seedAgents = async (userAmount: number, agentAmount: number) => {
        if (userAmount === 0) {
            return;
        }

        const users = await this.user.find();

        for (let i = 0; i < agentAmount; i += 1) {
            const agentName = this.cryptoHelper.generateString(16);
            const communicationToken = this.cryptoHelper.generateToken().prod;
            const os = i % 2 === 0 ? OS.Linux : OS.Windows;
            const addedBy = AddedBy.User;
            const addedByUser = users[faker.number.int({min: 0, max: userAmount - 1})]._id;
            await this.agent.create({agentName, communicationToken, os, addedBy, addedByUser})
        }
    }

    private seedRoles = async () => {
        await this.role.create({name: "Admin"});
        await this.role.create({name: "Moderator"});
        await this.role.create({name: "User"});
        await this.role.create({name: "Guest"});
    }

    private connectDatabase() {
        return connect(process.env.MONGODB_CONNECTION_STRING);
    }
}

const seeder = new Seeder();
seeder.seed();
