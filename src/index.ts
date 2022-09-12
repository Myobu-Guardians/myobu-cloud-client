import { ethers } from "ethers";

interface MyobuCloudClientConstructorProps {
  signer: ethers.Signer;
  cloudServer?: string;
  expiresIn?: number;
}
export default class MyobuCloudClient {
  private signer: ethers.Signer;
  private cloudServer: string;
  private expiresIn: number;

  constructor({
    signer,
    cloudServer,
    expiresIn,
  }: MyobuCloudClientConstructorProps) {
    cloudServer = cloudServer || "http://cloud.myobu.io";
    expiresIn = expiresIn || 1000 * 60 * 60; // 1 hour

    this.signer = signer;
    this.cloudServer = cloudServer;
    this.expiresIn = expiresIn;
  }
}
