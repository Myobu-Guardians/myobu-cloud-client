import { ethers } from "ethers";
import {
  MyobuDBJWT,
  MyobuDBJWTPayload,
  MyobuDBJWTSignature,
  MyobuDBLabelSchema,
  MyobuDBLabelSchemaRequest,
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

interface MyobuProtocolClientConstructorProps {
  signer?: ethers.Signer;
  server?: string;
  expiresIn?: number;
}
export default class MyobuProtocolClient {
  public signer?: ethers.Signer;
  public server: string;
  public expiresIn: number;
  private socket?: any;

  constructor({
    signer,
    server,
    expiresIn,
  }: MyobuProtocolClientConstructorProps) {
    server = server || "https://protocol.myobu.io";
    expiresIn = expiresIn || 1000 * 60 * 60; // 1 hour

    this.signer = signer;
    this.server = server;
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
    if (localStorage && localStorage.getItem(`myobu-protocol/jwt/${address}`)) {
      const jwt: MyobuDBJWT = JSON.parse(
        localStorage.getItem(`myobu-protocol/jwt/${address}`) || "{}"
      );
      // Check if the JWT is still valid
      if (
        jwt.signature &&
        jwt.payload &&
        Date.now() < jwt.payload.exp &&
        jwt.payload.iss === address &&
        ethers.utils.verifyMessage(
          (jwt.message || "") + JSON.stringify(jwt.payload),
          jwt.signature
        ) === address
      ) {
        return jwt;
      }
    }

    // Generate new JWT
    const exp = Date.now() + this.expiresIn;
    const payload: MyobuDBJWTPayload = {
      iss: await this.signer.getAddress(),
      exp: exp,
    };
    const message = `Greetings from Myobu Protocol!

Sign this message to prove that you are the owner of the address ${payload.iss}.
This signature will not cost you any fees.  
This signature will expire at ${new Date(exp).toLocaleString()}

JWT:`;

    let signature: MyobuDBJWTSignature = "";
    try {
      signature = await this.signer.signMessage(
        message + JSON.stringify(payload)
      );
    } catch (error) {
      throw new Error(
        "Failed to sign JWT to authenticate the Myobu Protocol database request"
      );
    }

    const jwt: MyobuDBJWT = {
      message,
      payload,
      signature,
    };
    // Save to localStorage
    if (localStorage) {
      localStorage.setItem(
        `myobu-protocol/jwt/${address}`,
        JSON.stringify(jwt)
      );
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
      request.detachDelete ||
      request.createConstraints ||
      request.dropConstraints
    ) {
      request.jwt = await this.generateJWT();
    }

    //
    const res = await fetch(`${this.server}/db`, {
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

  async uploadImages(files: File[]): Promise<{ urls: (string | null)[] }> {
    if (!this.signer) {
      throw new Error("No signer set. Please connect wallet first.");
    }

    const jwt = await this.generateJWT();
    const formData = new FormData();
    for (const file of files) {
      formData.append("file[]", file);
    }
    formData.append("jwt", JSON.stringify(jwt));

    const res = await fetch(`${this.server}/image`, {
      method: "POST",
      body: formData,
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
      const socket = io(this.server);
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

  async setLabelSchema(schema: MyobuDBLabelSchema) {
    if (!this.signer) {
      throw new Error("No signer set. Please connect wallet first.");
    }

    const jwt = await this.generateJWT();
    const request: MyobuDBLabelSchemaRequest = {
      jwt,
      schema,
    };
    const res = await fetch(`${this.server}/label-schema`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (res.status === 200) {
      return await res.json();
    }
    throw new Error(await res.text());
  }

  async getLabelSchema(label: string): Promise<MyobuDBLabelSchema> {
    const res = await fetch(`${this.server}/label-schema/${label}`);
    if (res.status === 200) {
      return await res.json();
    }
    throw new Error(await res.text());
  }

  async deleteLabelSchema(label: string) {
    if (!this.signer) {
      throw new Error("No signer set. Please connect wallet first.");
    }

    const jwt = await this.generateJWT();
    const request: MyobuDBLabelSchemaRequest = {
      jwt,
      schema: {
        label,
        properties: {},
      },
      delete: true,
    };
    const res = await fetch(`${this.server}/label-schema`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (res.status === 200) {
      return await res.json();
    }
    throw new Error(await res.text());
  }

  async getBalance(walletAddress: string): Promise<number> {
    const res = await fetch(`${this.server}/balance/${walletAddress}`);
    if (res.status === 200) {
      return parseInt(await res.json());
    }
    throw new Error(await res.text());
  }

  async getVotingPower(walletAddress: string): Promise<number> {
    const res = await fetch(`${this.server}/voting-power/${walletAddress}`);
    if (res.status === 200) {
      return parseInt(await res.json());
    }
    throw new Error(await res.text());
  }
}
