import { ExceptionEnum } from "../exceptions/OperationExceptions";
import AgentDto from "../../data/DataTransferObjects/AgentDto";
import OS from "../../data/enums/OsEnum";
import logger from "./logger";
import CryptoHelper from "./CryptoHelper";
const { exec } = require('child_process');

const Sentry = require("@sentry/node");
const fs = require('fs')

class Compiler {
    private cryptoHelper: CryptoHelper;
    private re: RegExp;

    constructor() {
        this.cryptoHelper = new CryptoHelper();
        this.re = new RegExp(/^[a-z0-9A-Z]*$/);
    }

    public compile = async (agent: Partial<AgentDto>, comToken: string): Promise<{name: string, comToken?: string}> => {
        if (!this.re.test(comToken)) {
            throw {name: '', comToken};
        }

        if (agent.os == OS.Windows) {
            // ?
            return {name: ''};
        }

        if (agent.os == OS.Linux) {
            const outName = this.cryptoHelper.generateString(25);
            await exec(`go build -ldflags "-X main.Comtoken=${comToken}" -o ../compiling/${outName} .`, {
                cwd: 'agents-linux'
            }, (err: any, stdout: any, stderr: any) => {
                if (err) {
                    //Sentry.captureException(err);
                    logger.error(err);
                    throw ExceptionEnum.CompilerError;
                }
            });

            return {name: outName};
        }

        return {name: ''};
    }

    public cleanup = async (binName: string) => {
        if (binName == '') {
            return;
        }

        fs.unlink(`compiling/${binName}`, (err: any) => {
            if (err) {
                logger.error(err);
            }
        });
    }
}

export default Compiler;