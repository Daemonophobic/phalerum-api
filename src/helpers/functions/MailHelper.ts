import logger from "./logger";

const nodemailer = require('nodemailer');

class MailHelper {
    private transporter;

    constructor(configOptions: {host: string, port: number}) {
        this.transporter = nodemailer.createTransport({...configOptions,
            tls: {
                rejectUnauthorized: false
            }});
    }

    public sendMail = async (from: string, to: string, subject: string, html: string) => {
        try {
            await this.transporter.sendMail({
                from,
                to,
                subject,
                html
            });
            return null;
        }
        catch (err) {
            logger.error(`Failed sending email to ${to} with error: ${err}`);
            return err;
        }
    }
}

export default MailHelper;