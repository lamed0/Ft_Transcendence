type sendMailInput = {
    to: string;
    subject: string;
    html: string;
    text?: string;
};
export declare class MailService {
    private transporter;
    constructor();
    SendEmail(data: sendMailInput): Promise<boolean>;
    sendVerificationMail(to: string, verifyLink: string): Promise<boolean>;
}
export {};
