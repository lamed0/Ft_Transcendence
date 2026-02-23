import { IsOptional, IsString, Length, Matches, IsEmail } from "class-validator";

export class UpdateDto {
    
    @IsOptional()
    @IsString()
    @Length(3, 20)
    @Matches(/^[a-zA-Z0-9_]+$/)
    username?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;
}