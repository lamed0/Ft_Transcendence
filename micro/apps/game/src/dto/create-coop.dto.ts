import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCoopDto{
    
    @IsOptional()
    @IsString()
    @MaxLength(20)
    nameP1: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    nameP2: string;
}
