import { faker } from '@faker-js/faker';
import mongoose, { Collection, connect, mongo } from 'mongoose';
import CryptoHelper from "./CryptoHelper";
import logger from './logger';
import userModel from '../../models/user';
import agentModel from '../../models/agent';
import OS from '../../data/enums/OsEnum';
import AddedBy from '../../data/enums/AddedByEnum';
import permissionModel from '../../models/permission';
import roleModel from '../../models/role';
import PermissionDto from '../../data/DataTransferObjects/PermissionDto';
//import RoleRepository from '../../repositories/RoleRepository'

const bcrypt = require('bcrypt');
const fs = require('fs');

require('dotenv').config();

class Seeder {
    private user = userModel;
    private agent = agentModel;
    private permission = permissionModel;
    private role = roleModel;
    private cryptoHelper = new CryptoHelper();
    private userAmount = 5;
    private agentAmount = 5;
    //private roleRepository = new RoleRepository();

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

        // Adding Permissions
        var permissions = (await this.seedPermissions());

        // Adding Roles
        await this.seedRoles(permissions);


        
        logger.info("Completed seeding the database!");
        process.exit(0);
    }

    private clearCollections = async () => {
        var collections = await this.user.collection.conn.listCollections();
        if(collections.find(e => e.name == this.user.collection.name))
        {
            await this.user.collection.drop();
        }
        if(collections.find(e => e.name == this.agent.collection.name))
        {
            await this.agent.collection.drop();
        }
        if(collections.find(e => e.name == this.role.collection.name))
        {
            await this.role.collection.drop();
        }
        if(collections.find(e=> e.name ==this.permission.collection.name))
        {
            await this.permission.collection.drop();
        }
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

    private seedPermissions = async(): Promise<PermissionDto[]> => 
    {
        
        await this.permission.create({action:"user.read", description: "Can see users"});
        await this.permission.create({action: "user.write", description: "Can edit, create users"});
        await this.permission.create({action: "role.read", description: "Can see roles"});
        await this.permission.create({action: "role.write", description: "Can edit, create roles"});
        await this.permission.create({action: "job.read", description: "Can see jobs"});
        await this.permission.create({action: "job.write", description: "Can edit, create jobs"});
        await this.permission.create({action: "agent.read", description: "Can see agents"});
        await this.permission.create({action: "agent.write", description: "Can edit, create agents"});
        await this.permission.create({action: "user.read", description: "Can see users"});

        var result = await this.permission.find();
        
        return result;
    }

    private seedRoles = async(permissions: PermissionDto[]) =>
    {
        await this.role.create({name: "Admin", permissions: permissions});
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