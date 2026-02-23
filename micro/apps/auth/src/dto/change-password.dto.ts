import { IsString, Length, Matches } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    @Length(6, 128)
    oldPassword: string;

    @IsString()
    @Length(6, 128)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
        message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
    })
    newPassword: string;

    @IsString()
    @Length(6, 128)
    confirmPassword: string;
}
