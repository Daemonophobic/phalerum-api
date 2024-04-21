import RoleDto from "../../data/DataTransferObjects/RoleDto";
import RoleService from "../../services/RoleService";
import UserDto from "../../data/DataTransferObjects/UserDto";
import { Request } from 'express-jwt';
import AgentDto from "../../data/DataTransferObjects/AgentDto";

const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');

class JWTHelper {
    private privateKey;

    private roleService = new RoleService();

    constructor() {
        this.privateKey = fs.readFileSync('certificates/key.pem', { encoding: 'utf8', flag: 'r' });
    }

    public verifyCredentials = async (user: UserDto, password: string): Promise<{error: boolean, session?: string}> => {
        const {privateKey} = this;
        return new Promise((resolve, _) => {
            bcrypt.compare(password, user.password).then((result: boolean) => {
                if (!result) resolve({error: true});

                const token = jwt.sign({ 
                    exp: Math.floor(Date.now() / 1000) + (60 * 60),
                    _id: user._id,
                    username: user.username,
                    roles: user.roles.map(( role ) => { 
                        return role.name; 
                       })
                }, privateKey, { algorithm: 'RS256' });
                resolve({error: false, session: token});
            });
        });
    }

    public generateToken = async (agent: AgentDto): Promise<{error: boolean, session?: string}> => {
        const {privateKey} = this;
        return new Promise((resolve, reject) => {
            const token = jwt.sign({
                _id: agent._id,
                master: agent.master,
                roles: [agent.master ? "Master" : reject({"error": true})]
            }, privateKey, {algorithm: 'RS256'});
    
            resolve({error: false, session: token});
        });
    }

    public verifyPermission = async(request: Request, action: string): Promise<boolean> => {
        const roles = request.auth.roles;
        let permissions = [];
        let authorized = false;

        for (const role of roles) {
            const permissionList = (await this.roleService.GetRoleByName(role)).permissions;
            permissions.push(permissionList);
            permissionList.map((permission) => {
                permission.action === action ? authorized = true : '';
            })
        }

        return authorized;
    }

}

export default JWTHelper;