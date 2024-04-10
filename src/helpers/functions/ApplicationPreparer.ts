import { faker } from '@faker-js/faker';
import { connect } from 'mongoose';
import logger from './logger';
import userModel from '../../models/user';
import agentModel from '../../models/agent';
import jobModel from '../../models/job';
import permissionModel from '../../models/permission';
import roleModel from '../../models/role';
import PermissionDto from '../../data/DataTransferObjects/PermissionDto';
const { exec } = require('child_process');

require('dotenv').config();

class ApplicationPreparer {
    private user = userModel;
    private agent = agentModel;
    private job = jobModel;
    private permission = permissionModel;
    private role = roleModel;

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
        var permissions = (await this.addPermissions());

        // Adding Roles
        await this.addRoles(permissions);

        // Generate JWT Certificates
        await this.generateCertificates();

        logger.info("Completed preparing the application!");
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
        await this.permission.create({action: "admin.user.read", description: "Can retrieve extended user information"});
        await this.permission.create({action: "admin.user.write", description: "Can modify extended user information"});

        var result = await this.permission.find();
        
        return result;
    }

    private addRoles = async(permissions: PermissionDto[]) =>
    {   
        var ModeratorFilter = ["user.read", "job.read", "job.write", "agent.read", "agent.write", "role.read"];
        var UserFilter = ["user.read", "job.read", "job.write", "agent.read", "role.read"];
        var guestFilter = ["user.read","job.read", "agent.read", "role.read"];



        await this.role.create({name: "Admin", permissions: permissions});
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
    }

    private generateCertificates = async () => {
        exec('mkdir certificates;openssl genrsa -out certificates/key.pem 4096;\
        openssl rsa -in certificates/key.pem -outform PEM -pubout -out certificates/public.pem', (err: any, stdout: any, stderr: any) => {
            if (err) {
              throw new Error("Failed generate certificates");
            }
          });
    }

    private connectDatabase() {
        return connect(process.env.MONGODB_CONNECTION_STRING);
    }

}

const applicationPreparer = new ApplicationPreparer();
applicationPreparer.deploy();