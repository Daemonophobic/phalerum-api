import { faker } from '@faker-js/faker';
import { connect } from 'mongoose';
import logger from './logger';
import userModel from '../../models/user';
import agentModel from '../../models/agent';
import jobModel from '../../models/job';
import permissionModel from '../../models/permission';
import roleModel from '../../models/role';
import PermissionDto from '../../data/DataTransferObjects/PermissionDto';
import campaignModel from '../../models/campaign';
import JobDto from '../../data/DataTransferObjects/JobDto';

const { exec } = require('child_process');

require('dotenv').config();

class ApplicationPreparer {
    private user = userModel;
    private agent = agentModel;
    private job = jobModel;
    private permission = permissionModel;
    private role = roleModel;
    private campaign = campaignModel;

    constructor() {
        faker.seed(1898);
        this.connectDatabase()
        .then(() => logger.info("Database Connected"))
        .catch((err) => logger.error(err));
    }

    public deploy = async () => {
        // Clear Collections
        await this.clearCollections();

        // Adding Permissions
        const permissions = (await this.addPermissions());

        // Adding Roles
        await this.addRoles(permissions);

        // Adding Jobs
        await this.addJobs();

        // Adding Campaign
        await this.addCampaign();

        logger.info("Completed preparing the application!");
        process.exit(0);
    }

    private clearCollections = async () => {
        const collections = await this.user.collection.conn.listCollections();
        if(collections.find(e => e.name == this.user.collection.name))
        {
            await this.user.collection.drop();
        }
        if(collections.find(e => e.name == this.agent.collection.name))
        {
            await this.agent.collection.drop();
        }
        if(collections.find(e => e.name == this.job.collection.name))
        {
            await this.job.collection.drop();
        }
        if(collections.find(e => e.name == this.role.collection.name))
        {
            await this.role.collection.drop();
        }
        if(collections.find(e=> e.name ==this.permission.collection.name))
        {
            await this.permission.collection.drop();
        }
        if(collections.find(e=> e.name ==this.campaign.collection.name))
        {
            await this.campaign.collection.drop();
        }
    }

    private addPermissions = async(): Promise<PermissionDto[]> => 
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

    private addCampaign = async () => {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 5);
        await this.campaign.create({number: 1, name: "Fontys ICT #Netlab", description: "Netlab Campaign", startDate: new Date(), endDate, active: true, grafanaId: ""});
    }

    private addJobs = async(): Promise<JobDto[]> =>
        {
            await this.job.create({jobName: "Firewall Statistics", jobDescription: "Checks whether the firewall is enabled", crossCompatible: true, command: "builtin.firewall", available: true});
            await this.job.create({jobName: "Check Password", jobDescription: "Checks whether the password was reset", crossCompatible: true, command: "builtin.password", available: true});
            await this.job.create({jobName: "Rollback", jobDescription: "Rollback the changes made to the system", crossCompatible: false, os: "Linux", disabled: true, available: true, masterJob: false, shellCommand: true, command: "rm -rf /usr/bin/linrem && systemctl daemon-reload && systemctl disable linrem && rm /lib/systemd/system/linrem.service && systemctl daemon-reload && service linrem stop"});
            await this.job.create({jobName: "Get Subnets", jobDescription: "Retrieve the available subnets from the agent", crossCompatible: false, os: "Linux", disabled: false, available: true, masterJob: false, shellCommand: true, command: "ip a | grep 'inet ' | grep -v 'br-\\|docker\\|host lo\\|calico' | awk '{print $2}'"})
            
            const result = await this.job.find();
            return result;
        }

    private addRoles = async(permissions: PermissionDto[]) =>
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

const applicationPreparer = new ApplicationPreparer();
applicationPreparer.deploy();