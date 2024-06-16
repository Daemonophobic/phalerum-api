import { faker } from '@faker-js/faker';
import { connect } from 'mongoose';
import CryptoHelper from "./CryptoHelper";
import logger from './logger';
import userModel from '../../models/user';
import agentModel from '../../models/agent';
import jobModel from '../../models/job';
import OS from '../../data/enums/OsEnum';
import AddedBy from '../../data/enums/AddedByEnum';
import permissionModel from '../../models/permission';
import roleModel from '../../models/role';
import PermissionDto from '../../data/DataTransferObjects/PermissionDto';
import campaignModel from '../../models/campaign';

const bcrypt = require('bcrypt');

require('dotenv').config();

class Seeder {
    private user = userModel;
    private agent = agentModel;
    private job = jobModel;
    private permission = permissionModel;
    private role = roleModel;
    private campaign = campaignModel;
    private cryptoHelper = new CryptoHelper();
    private userAmount = 5;
    private agentAmount = 5;
    private jobAmount = 5;

    constructor() {
        faker.seed(1898);
        this.connectDatabase()
        .then(() => logger.info("Database Connected"))
        .catch((err) => logger.error(err));
    }

    public seed = async () => {
        // Clear Collections
        await this.clearCollections();

        // Adding Campaigns
        await this.seedCampaigns();

        // Adding Permissions
        // const permissions = (await this.seedPermissions());

        // Adding Roles
        // await this.seedRoles(permissions);

        // Adding Users
        // await this.seedUsers(this.userAmount);
        
        // Adding Agents
        // await this.seedAgents(this.userAmount, this.agentAmount);

        // Add Jobs
        // await this.seedJobs();


        logger.info("Completed seeding the database!");
        process.exit(0);
    }

    private clearCollections = async () => {
        const collections = await this.user.collection.conn.listCollections();
        // if(collections.find(e => e.name == this.user.collection.name))
        // {
        //     await this.user.collection.drop();
        // }
        if(collections.find(e => e.name == this.agent.collection.name))
        {
            await this.agent.collection.drop();
        }
        // if(collections.find(e => e.name == this.job.collection.name))
        // {
        //     await this.job.collection.drop();
        // }
        // if(collections.find(e => e.name == this.role.collection.name))
        // {
        //     await this.role.collection.drop();
        // }
        // if(collections.find(e=> e.name ==this.permission.collection.name))
        // {
        //     await this.permission.collection.drop();
        // }
        if(collections.find(e=> e.name ==this.campaign.collection.name))
        {
            await this.campaign.collection.drop();
        }
    }

    private seedCampaigns = async () => {
        await this.campaign.create({number: 1, name: "Fontys ICT #Netlab", description: "Netlab Campaign", startDate: new Date(), endDate: new Date(), active: true, grafanaId: "bebd59993fa141d3b396811aff737526"});
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
            i === 0 ? await this.user.create({firstName, lastName, username, emailAddress: email, password: hash, OTPSecret: encryptedOTPSecret, locked: false, initializationToken: {}, roles: [(await this.role.findOne({name: "Admin"}))]}) :
            await this.user.create({firstName, lastName, username, emailAddress: email, password: hash, OTPSecret: encryptedOTPSecret, locked: false, initializationToken: {}, roles: [(await this.role.findOne({name: "Guest"}))]})
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
            const master = i == 0;
            const addedBy = AddedBy.User;
            const addedByUser = users[faker.number.int({min: 0, max: userAmount - 1})]._id;
            await this.agent.create({agentName, master, communicationToken, os, addedBy, addedByUser})
        }
    }

    private seedJobs = async () => {        
        await this.job.create({jobName: "Firewall Statistics", jobDescription: "Checks whether the firewall is enabled", crossCompatible: true, command: "builtin.firewall", available: true});
        await this.job.create({jobName: "Check Password", jobDescription: "Checks whether the password was reset", crossCompatible: true, command: "builtin.password", available: true});
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
        await this.permission.create({action: "master.config.read", description: "Can retrieve configurations for master nodes"});
        await this.permission.create({action: "admin.user.read", description: "Can retrieve extended user information"});
        await this.permission.create({action: "admin.user.write", description: "Can modify extended user information"});
        await this.permission.create({action: "campaign.read", description: "Can see campaigns"});
        await this.permission.create({action: "campaign.write", description: "Can edit, create campaigns"});

        const result = await this.permission.find();
        
        return result;
    }

    private seedRoles = async(permissions: PermissionDto[]) =>
    {   
        const ModeratorFilter = ["campaign.read", "user.read", "job.read", "job.write", "agent.read", "agent.write", "role.read"];
        const UserFilter = ["campaign.read", "user.read", "job.read", "job.write", "agent.read", "role.read"];
        const guestFilter = ["campaign.read", "user.read","job.read", "agent.read", "role.read"];
        const masterFilter = ["agent.read", "agent.write", "role.read"];

        await this.role.create({name: "Admin", permissions});
        await this.role.create({name: "Moderator", permissions: permissions.reduce((permissionsList, permission) => {
            if (ModeratorFilter.includes(permission.action)) {
                permissionsList.push(permission)
            };
            return permissionsList;
        }, [])});
        await this.role.create({name: "User", permissions: permissions.reduce((permissionsList, permission) => {
            if (UserFilter.includes(permission.action)) {
                permissionsList.push(permission)
            };
            return permissionsList;
        }, [])});
        await this.role.create({name: "Guest", permissions: permissions.reduce((permissionsList, permission) => {
            if (guestFilter.includes(permission.action)) {
                permissionsList.push(permission)
            };
            return permissionsList;
        }, [])})
        await this.role.create({name: "Master", permissions: permissions.reduce((permissionsList, permission) => {
            if (masterFilter.includes(permission.action)) {
                permissionsList.push(permission)
            };
            return permissionsList;
        }, [])})
    }

    private connectDatabase() {
        return connect(process.env.MONGODB_CONNECTION_STRING);
    }

}

const seeder = new Seeder();
seeder.seed();
