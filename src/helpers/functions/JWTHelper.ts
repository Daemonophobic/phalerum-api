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
                    id: user.id,
                    username: user.username,
                }, privateKey, { algorithm: 'RS256' });
                resolve({error: false, session: token});
            });
        });
    }
}

export default JWTHelper;