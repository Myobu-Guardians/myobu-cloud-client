import { ethers } from "ethers";
interface MyobuCloudClientConstructorProps {
    signer: ethers.Signer;
    cloudServer?: string;
    expiresIn?: number;
}
export default class MyobuCloudClient {
    private signer;
    private cloudServer;
    private expiresIn;
    constructor({ signer, cloudServer, expiresIn, }: MyobuCloudClientConstructorProps);
}
export {};
