import { IsInt, Min } from "class-validator";

export class CreateInviteDto {
    @IsInt()
    @Min(1)
    toUserId: number;
}
