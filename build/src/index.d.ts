import { ethers } from "ethers";
import { MyobuDBJWT, MyobuDBRequest, MyobuRecord } from "./types";
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
    /**
     * Generate the JWT for `address`
     * @param address
     */
    generateJWT(): Promise<MyobuDBJWT>;
    db(request: MyobuDBRequest): Promise<{
        [key: string]: MyobuRecord;
    }[]>;
    setExpiresIn(expiresIn: number): void;
    setSigner(signer: ethers.Signer): void;
    subscribe(roomName: string, callback: (data: any) => void): {
        unsubscribe: () => void;
        emit: (data: any) => void;
    };
}
export {};
