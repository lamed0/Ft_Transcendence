import { IsOptional, IsString, Length, Matches } from "class-validator";

export class UpdateDto {
    
    @IsOptional()
    @IsString()
    @Length(3, 20)
    @Matches(/^[a-zA-Z0-9_]+$/)
    username?: string;
}