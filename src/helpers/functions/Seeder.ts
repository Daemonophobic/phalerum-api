import { faker } from '@faker-js/faker';

import AuthRepository from '../../repositories/AuthRepository';
import CryptoHelper from "./CryptoHelper";
import DatabaseHandler from '../../repositories/DatabaseHandler';
import UserRepository from '../../repositories/UserRepository';

// const { authenticator } = require('otplib')
const bcrypt = require('bcrypt');
const cliProgress = require('cli-progress');
const fs = require('fs');

require('dotenv').config();

class Seeder {
    private authRepository = new AuthRepository();
    private userRepository = new UserRepository();
    private cryptoHelper = new CryptoHelper();

    private db = new DatabaseHandler(true);

    constructor() {
        faker.seed(1898);
    }

    public seed = async () => {
        const progress = new cliProgress.SingleBar({stopOnComplete: true}, cliProgress.Presets.shades_classic);

        const userAmount = 5;

        progress.start(1 + 2*userAmount, 0);

        // Clearing Database
        await this.clearDatabase();
        progress.increment();
        
        // Adding Users
        const userIds: number[] = await this.generateUsers(userAmount, progress);

        // Adding authentication data
        await this.configureAuthentication(userIds, progress);

    }

    private clearDatabase = async () => {
        const dbScheme = fs.readFileSync('PHALERUM.sql', { encoding: 'utf8', flag: 'r' }).split("\n").join(" ");
        await this.db.prepDatabase(dbScheme);
    }

    private generateUsers = async (amount: number, progress: any): Promise<number[]> => {
        const userIds = []

        try {
            for (let i = 0; i < amount; i += 1) {
                const firstName = faker.person.firstName();
                const lastName = faker.person.lastName();
                const username = faker.internet.userName({firstName, lastName});
                const email = faker.internet.email({firstName, lastName}).toLowerCase();

                const information = await this.userRepository.addUserLegacy({firstName, lastName, username, email});
                userIds.push(information.res.insertId)
                progress.increment()
            }
            return userIds;
        } catch (e) {
            console.log(e)
            return;
        }
    }

    private configureAuthentication = async (userIds: number[], progress: any) => {
        userIds.forEach(async (userId: number) => {
            const hash = bcrypt.hashSync(process.env.DEFAULT_PASSWORD, 10);
            // let OTPSecret = authenticator.generateSecret();
            const OTPSecret = process.env.DEV_OTP_SECRET;
            const enc = this.cryptoHelper.encrypt(OTPSecret);
            const user = {id: userId, password: hash, OTPSecret: `{"data":"${enc.data}","iv":"${enc.iv}"}`}
            await this.authRepository.addUser(user);
            progress.increment();
        })
    }
}

const seeder = new Seeder();
seeder.seed();