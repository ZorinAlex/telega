import {IsNotEmpty} from "class-validator";

export default class LoginDto {
    @IsNotEmpty()
    walletAddress: string;
    @IsNotEmpty()
    signature: string;
    @IsNotEmpty()
    message: string
}
