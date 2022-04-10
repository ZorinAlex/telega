import {IsNotEmpty} from "class-validator";

export default class OneSignalDto {
    @IsNotEmpty()
    id: string;
}
