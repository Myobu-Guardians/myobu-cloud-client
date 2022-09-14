import { ethers } from "ethers";
import {
  MyobuDBJWT,
  MyobuDBJWTPayload,
  MyobuDBJWTSignature,
  MyobuDBRequest,
  MyobuRecord,
} from "./types";

interface MyobuCloudClientConstructorProps {
  signer?: ethers.Signer;
  cloudServer?: string;
  expiresIn?: number;
}
export default class MyobuCloudClient {
  private signer?: ethers.Signer;
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

  /**
   * Generate the JWT for `address`
   * @param address
   */
  async generateJWT(): Promise<MyobuDBJWT> {
    if (!this.signer) {
      throw new Error("No signer set. Please connect wallet first.");
    }
    const address = await this.signer.getAddress();
    if (localStorage && localStorage.getItem(`myobu-cloud/jwt/${address}`)) {
      const jwt: MyobuDBJWT = JSON.parse(
        localStorage.getItem(`myobu-cloud/jwt/${address}`) || "{}"
      );
      // Check if the JWT is still valid
      if (
        jwt.signature &&
        jwt.payload &&
        Date.now() < jwt.payload.exp &&
        jwt.payload.iss === address
      ) {
        return jwt;
      }
    }

    // Generate new JWT
    const payload: MyobuDBJWTPayload = {
      iss: await this.signer.getAddress(),
      exp: Date.now() + this.expiresIn,
      msg: `Authorize Myobu Cloud to perform database operations on behalf of ${address}`,
    };
    let signature: MyobuDBJWTSignature = "";
    try {
      signature = await this.signer.signMessage(JSON.stringify(payload));
    } catch (error) {
      throw new Error(
        "Failed to sign JWT to authenticate the Myobu Cloud database request"
      );
    }

    const jwt: MyobuDBJWT = {
      payload,
      signature,
    };
    // Save to localStorage
    if (localStorage) {
      localStorage.setItem(`myobu-cloud/jwt/${address}`, JSON.stringify(jwt));
    }
    return jwt;
  }

  async db(request: MyobuDBRequest): Promise<
    {
      [key: string]: MyobuRecord;
    }[]
  > {
    if (request.create || request.set || request.delete) {
      request.jwt = await this.generateJWT();
    }

    //
    const res = await fetch(`${this.cloudServer}/db`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (res.status === 200) {
      return await res.json();
    } else {
      throw new Error(await res.text());
    }
  }

  setExpiresIn(expiresIn: number) {
    this.expiresIn = expiresIn;
  }

  setSigner(signer: ethers.Signer) {
    this.signer = signer;
  }
}
