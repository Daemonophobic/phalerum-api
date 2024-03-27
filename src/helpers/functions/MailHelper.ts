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
        await this.transporter.sendMail({
            from,
            to,
            subject,
            html
          });
    }
}

export default MailHelper;