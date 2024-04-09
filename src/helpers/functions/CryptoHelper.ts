import { randomBytes } from 'crypto'

const crypto = require('crypto');

class CryptoHelper {
    private algo: string;

    constructor(algo: string = 'aes-256-cbc') {
        this.algo = algo
    }

    public encrypt(data: string): {cipher: string, iv: string} {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algo, Buffer.from(process.env.ENC_KEY, 'hex'), iv);
        let encrypted = cipher.update(data);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return {cipher: encrypted.toString('hex'), iv: iv.toString('hex')};
    }

    public decrypt(data: {cipher: string, iv: string}): string {
        const iv = Buffer.from(data.iv, 'hex');
        const enc = Buffer.from(data.cipher, 'hex');
        const decipher = crypto.createDecipheriv(this.algo, Buffer.from(process.env.ENC_KEY, 'hex'), iv);
        let decrypted = decipher.update(enc);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

    public generateGuid(): string {
        return crypto.randomUUID();
    }

    public generateToken(): {prod: {cipher: string, iv: string}, plain: string} {
        const initializationToken = randomBytes(32).toString('hex');
        return {prod: this.encrypt(initializationToken), plain: initializationToken};
    }

    public generateString(length: number): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        return result;
    }
}

export default CryptoHelper;