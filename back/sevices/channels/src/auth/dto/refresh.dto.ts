import {IsNotEmpty} from "class-validator";

export default class RefreshDto {
    @IsNotEmpty()
    refreshToken: string;
}
