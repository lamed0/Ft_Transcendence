import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

type sendMailInput = {
    to: string;
    subject: string;
    html:   string;
    text?:  string;
}

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    constructor(){
        const host = process.env.MAIL_HOST;
        const portStr = process.env.MAIL_PORT;
        const user = process.env.MAIL_USER;
        const pass = process.env.MAIL_PASS;

        if (!host || !portStr || !user || !pass) throw new Error("Missing Mail_* environement variables");

        const port = Number(portStr);
        if (Number.isNaN(port)) throw new Error("MAIL_PORT must be a number") ;

        this.transporter = nodemailer.createTransport({
            host: host,
            port: port,
            secure: port === 465,
            auth: { user, pass },
        });
    }

    async SendEmail(data: sendMailInput){
        try{
            const from = process.env.MAIL_FROM || process.env.MAIL_USER || '';
            await this.transporter.sendMail({
                from,
                to: data.to,
                subject: data.subject,
                html: data.html,
                text: data.text,
            });
            return true;
        }catch(err){
            console.error('NODEMAILER ERROR:', err);   // ✅ add this
            // If err is an Error object:
            console.error('NODEMAILER MESSAGE:', (err as any)?.message);
            console.error('NODEMAILER RESPONSE:', (err as any)?.response);
            console.error('NODEMAILER CODE:', (err as any)?.code);
            throw new InternalServerErrorException('Failed to send mail');
        }
    }

    async sendVerificationMail(to: string, verifyLink: string){
        const html = `
        <h2>Verify your email</h2>
        <p>Click the button below to verify your email address.</p>
        <p><a href="${verifyLink}">Verify Email</a></p>
        <p>If you didn't request this, ignore this email.</p>`;
        return this.SendEmail({
            to,
            subject: 'Verify your Email',
            html,
            text: `Verify your Email: ${verifyLink}`,
        });
    }
}
