import RoleDto from "../../data/DataTransferObjects/RoleDto";
import RoleService from "../../services/RoleService";
import UserDto from "../../data/DataTransferObjects/UserDto";
import { Request } from 'express-jwt';

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

    public verifyPermission = async(request: Request, action: string): Promise<boolean> => {
        const roles = request.auth.roles;
        let result = new Promise((resolve, _) => {
            roles.forEach(async (role: string) => {
                const data = await this.roleService.GetRoleByName(role);
                if(await data.permissions.some(per => per.action === action)){
                    resolve(true);
                }
            });
            resolve(false);
        });

        return result.then((result: boolean) => {
            return typeof result === 'boolean' ? result : false;
        })
    }

}

export default JWTHelper;