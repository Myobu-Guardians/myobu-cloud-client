import { ethers } from "ethers";
import {
  MyobuDBJWT,
  MyobuDBJWTPayload,
  MyobuDBJWTSignature,
  MyobuDBRequest,
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

  async db(request: MyobuDBRequest) {
    if (request.create || request.set || request.delete) {
      if (!this.signer) {
        throw new Error("No signer set");
      }
      const payload: MyobuDBJWTPayload = {
        iss: await this.signer.getAddress(),
        exp: Date.now() + this.expiresIn,
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
      request.jwt = jwt;
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
