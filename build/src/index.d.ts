import { ethers } from "ethers";
import { MNSProfile, MyobuDBEvent, MyobuDBJWT, MyobuDBLabelACL, MyobuDBLabelConstraints, MyobuDBLabelSchema, MyobuDBProposal, MyobuDBProposalChoice, MyobuDBProposalVote, MyobuDBPropValue, MyobuDBRequest, MyobuRecord } from "./types";
export interface MyobuPubSubHandler<EmitDataType> {
    unsubscribe: () => void;
    publish: (data: EmitDataType) => Promise<void>;
}
interface MyobuProtocolClientConstructorProps {
    signer?: ethers.Signer;
    server?: string;
    expiresIn?: number;
}
export declare class MyobuProtocolClient {
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
    queryDB(request: MyobuDBRequest): Promise<{
        [key: string]: MyobuRecord;
    }[]>;
    applyDBEvent(label: string, eventName: string, eventArgs: {
        [key: string]: MyobuDBPropValue;
    }): Promise<any>;
    createDBEvent(event: MyobuDBEvent): Promise<{
        success: boolean;
    }>;
    deleteDBEvent(label: string, eventName: string): Promise<{
        success: boolean;
    }>;
    getDBEvents(label: string): Promise<MyobuDBEvent[]>;
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
    setLabelSchema(schema: MyobuDBLabelSchema): Promise<any>;
    getLabelSchema(label: string): Promise<MyobuDBLabelSchema>;
    deleteLabelSchema(label: string): Promise<any>;
    createLabelConstraints(constraints: MyobuDBLabelConstraints): Promise<any>;
    deleteLabelConstraints(constraintNames: string[]): Promise<{
        constraint: NamedCurve;
        success: boolean;
        error?: string;
    }[]>;
    listLabelConstraints(label: string): Promise<MyobuDBLabelConstraints[]>;
    setLabelACL(acl: MyobuDBLabelACL): Promise<any>;
    getLabelACL(label: string): Promise<MyobuDBLabelACL>;
    deleteLabelACL(label: string): Promise<any>;
    getBalance(walletAddress: string): Promise<number>;
    getVotingPower(walletAddress: string): Promise<number>;
    upsertMNS(profile: MNSProfile): Promise<MNSProfile>;
    getMNS(addressOrName: string): Promise<MNSProfile | undefined>;
    createProposal(proposal: MyobuDBProposal): Promise<MyobuDBProposal>;
    addProposalChoice(proposalId: string, choiceDescription: string): Promise<MyobuDBProposalChoice>;
    updateProposal(proposalId: string, { title, description, minVotingPower, startDate, endDate, }: {
        title: string;
        description: string;
        minVotingPower: number;
        startDate: number;
        endDate: number;
    }): Promise<MyobuDBProposal | undefined>;
    getProposal(proposalId: string): Promise<MyobuDBProposal | undefined>;
    /**
     * This will unvote all choices of the proposal, then vote for the choices specified
     * @param proposalId
     * @param choicesId
     * @returns
     */
    vote(proposalId: string, choiceIds: string[]): Promise<MyobuDBProposalVote[]>;
    unvote(proposalId: string, choiceId: string): Promise<MyobuDBProposalVote>;
}
export * from "./types";
export * from "./utils";
