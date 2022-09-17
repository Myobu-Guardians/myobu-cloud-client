import { ethers } from "ethers";
import {
  MyobuDBJWT,
  MyobuDBJWTPayload,
  MyobuDBJWTSignature,
  MyobuDBRequest,
  MyobuRecord,
} from "./types";
import { io } from "socket.io-client";

export interface MyobuPubSubHandler<EmitDataType> {
  unsubscribe: () => void;
  publish: (data: EmitDataType) => Promise<void>;
}

export function appendPrefixToObjectKeys(
  obj: { [key: string]: any },
  prefix: string
): { [key: string]: any } {
  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    newObj[`${prefix}${key}`] = obj[key];
  }
  return newObj;
}

interface MyobuCloudClientConstructorProps {
  signer?: ethers.Signer;
  cloudServer?: string;
  expiresIn?: number;
}
export default class MyobuCloudClient {
  public signer?: ethers.Signer;
  public cloudServer: string;
  public expiresIn: number;
  private socket?: any;

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
    const exp = Date.now() + this.expiresIn;
    const payload: MyobuDBJWTPayload = {
      iss: await this.signer.getAddress(),
      exp: exp,
      msg: `Authorize to use Myobu Cloud on behalf of ${address} by ${new Date(
        exp
      ).toLocaleString()}`,
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
    if (
      request.create ||
      request.merge ||
      request.set ||
      request.delete ||
      request.createConstraints ||
      request.dropConstraints
    ) {
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

  // TODO: should we allow this? as setting signer might cause the JWT to be invalid and introduce bugs like for pubsub
  setSigner(signer: ethers.Signer) {
    this.signer = signer;
  }

  /**
   * Subscribing and emitting messages require JWT to be set
   * Unsubscribing adn listening to events do not require JWT
   * @param roomName
   * @param callback
   * @returns
   */
  async subscribe<EmitDataType, ReceiveDataType>(
    roomName: string,
    callback: (data: ReceiveDataType, from: string) => void
  ): Promise<MyobuPubSubHandler<EmitDataType>> {
    if (!this.signer) {
      throw new Error("No signer set. Please connect wallet first.");
    }

    if (!this.socket) {
      const socket = io(this.cloudServer);
      this.socket = socket;
    }

    const jwt = await this.generateJWT();
    this.socket.emit("subscribe", roomName, jwt);
    this.socket.on("message", callback);

    return {
      unsubscribe: () => {
        this.socket.emit("unsubscribe", roomName);
      },
      publish: async (data) => {
        const jwt = await this.generateJWT();
        this.socket.emit("message", roomName, jwt, data);
      },
    };
  }
}
