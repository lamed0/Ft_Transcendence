"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let MailService = class MailService {
    transporter;
    constructor() {
        const host = process.env.MAIL_HOST;
        const portStr = process.env.MAIL_PORT;
        const user = process.env.MAIL_USER;
        const pass = process.env.MAIL_PASS;
        if (!host || !portStr || !user || !pass)
            throw new Error("Missing Mail_* environement variables");
        const port = Number(portStr);
        if (Number.isNaN(port))
            throw new Error("MAIL_PORT must be a number");
        this.transporter = nodemailer.createTransport({
            host: host,
            port: port,
            secure: port === 465,
            auth: { user, pass },
        });
    }
    async SendEmail(data) {
        try {
            const from = process.env.MAIL_FROM || process.env.MAIL_USER || '';
            await this.transporter.sendMail({
                from,
                to: data.to,
                subject: data.subject,
                html: data.html,
                text: data.text,
            });
            return true;
        }
        catch (err) {
            console.error('NODEMAILER ERROR:', err);
            console.error('NODEMAILER MESSAGE:', err?.message);
            console.error('NODEMAILER RESPONSE:', err?.response);
            console.error('NODEMAILER CODE:', err?.code);
            throw new common_1.InternalServerErrorException('Failed to send mail');
        }
    }
    async sendVerificationMail(to, verifyLink) {
        const html = `
        <h2>Verify your email</h2>
        <p>Click the button below to verify your email address.</p>
        <p><a href="${verifyLink}">Verify Email</a></p>
        <p>If you didn’t request this, ignore this email.</p>`;
        return this.SendEmail({
            to,
            subject: 'Verify your Email',
            html,
            text: `Verify your Email: ${verifyLink}`,
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
//# sourceMappingURL=mail.service.js.map