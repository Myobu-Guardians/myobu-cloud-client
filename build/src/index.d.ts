import { ethers } from "ethers";
import { MyobuDBRequest } from "./types";
interface MyobuCloudClientConstructorProps {
    signer?: ethers.Signer;
    cloudServer?: string;
    expiresIn?: number;
}
export default class MyobuCloudClient {
    private signer?;
    private cloudServer;
    private expiresIn;
    constructor({ signer, cloudServer, expiresIn, }: MyobuCloudClientConstructorProps);
    db(request: MyobuDBRequest): Promise<any>;
    setExpiresIn(expiresIn: number): void;
}
export {};
