import UserDto from "../../data/DataTransferObjects/UserDto";

const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');

class JWTHelper {
    private privateKey;

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
                    role: ["Admin"]
                }, privateKey, { algorithm: 'RS256' });
                resolve({error: false, session: token});
            });
        });
    }

    public verifyToken = async(req: any, res: any, next: any) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const {privateKey} = this;
        if (token == null) return res.sendStatus(401)
        jwt.verify(token, privateKey, (err: any, data: any) => {
            console.log(err)
            if (err) return res.sendStatus(403)
            req.role = data.role;
            next()
          })
     };
}

export default JWTHelper;