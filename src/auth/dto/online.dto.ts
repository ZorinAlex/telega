import {IsNotEmpty} from "class-validator";

export default class OnlineDto {
    @IsNotEmpty()
    isOnline: number;
}
