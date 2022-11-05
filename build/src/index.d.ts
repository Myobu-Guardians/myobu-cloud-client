import { ethers } from "ethers";
import { MyobuDBJWT, MyobuDBRequest, MyobuRecord } from "./types";
export interface MyobuPubSubHandler<EmitDataType> {
    unsubscribe: () => void;
    publish: (data: EmitDataType) => Promise<void>;
}
export declare function appendPrefixToObjectKeys(obj: {
    [key: string]: any;
}, prefix: string): {
    [key: string]: any;
};
interface MyobuProtocolClientConstructorProps {
    signer?: ethers.Signer;
    server?: string;
    expiresIn?: number;
}
export default class MyobuProtocolClient {
    signer?: ethers.Signer;
    server: string;
    expiresIn: number;
    private socket?;
    constructor({ signer, server, expiresIn, }: MyobuProtocolClientConstructorProps);
    /**
     * Generate the JWT for `address`
     * @param address
     */
    generateJWT(): Promise<MyobuDBJWT>;
    db(request: MyobuDBRequest): Promise<{
        [key: string]: MyobuRecord;
    }[]>;
    uploadImages(files: File[]): Promise<{
        urls: (string | null)[];
    }>;
    setExpiresIn(expiresIn: number): void;
    setSigner(signer: ethers.Signer): void;
    /**
     * Subscribing and emitting messages require JWT to be set
     * Unsubscribing adn listening to events do not require JWT
     * @param roomName
     * @param callback
     * @returns
     */
    subscribe<EmitDataType, ReceiveDataType>(roomName: string, callback: (data: ReceiveDataType, from: string) => void): Promise<MyobuPubSubHandler<EmitDataType>>;
}
export {};
