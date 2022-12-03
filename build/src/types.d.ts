export declare type MyobuDBPropValueObject = {
    $object: {
        [key: string]: MyobuDBPropValue;
    };
};
export declare type MyobuDBPropValue = string | number | boolean | null | undefined | {
    $add: MyobuDBPropValue[];
} | {
    $sub: MyobuDBPropValue[];
} | {
    $mul: MyobuDBPropValue[];
} | {
    $div: MyobuDBPropValue[];
}
/** Property key, eg "mns.name" */
 | {
    $key: string;
} | {
    $timestamp: boolean;
} | {
    $signer: boolean;
} | {
    $coalesce: MyobuDBPropValue[];
} | {
    $arg: string;
} | {
    $votingPower: MyobuDBPropValue;
} | MyobuDBPropValueObject | {
    $get: [{
        $arg: string;
    }, string];
} | {
    $id: "uuid" | "nanoid";
} | MyobuDBPropValue[];
export interface MyobuRecord {
    labels?: string[];
    type?: string;
    props: {
        [key: string]: MyobuDBPropValue;
    };
}
export interface MyobuDBJWTPayload {
    /**
     * Issuer of the signature. Usually it's the public key of the issuer.
     */
    iss: string;
    /**
     * Expiration time
     */
    exp: number;
}
export declare type MyobuDBJWTSignature = string;
export interface MyobuDBJWT {
    message?: string;
    payload: MyobuDBJWTPayload;
    /**
     * Signature is generated from `message + JSON.stringify(payload)`
     */
    signature: MyobuDBJWTSignature;
}
export declare enum MyobuDBOrder {
    ASC = "ASC",
    DESC = "DESC"
}
export interface MyobuDBNode {
    key: string;
    labels?: string[];
    props?: {
        [key: string]: MyobuDBPropValue;
    };
}
export interface MyobuDBRelationship {
    key: string;
    type: string;
    from: MyobuDBNode;
    to: MyobuDBNode;
    props?: {
        [key: string]: MyobuDBPropValue;
    };
}
export declare type MyobuDBWhereClauseValue = {
    $gt: MyobuDBPropValue;
} | {
    $gte: MyobuDBPropValue;
} | {
    $lt: MyobuDBPropValue;
} | {
    $lte: MyobuDBPropValue;
} | {
    $ne: MyobuDBPropValue;
} | {
    $eq: MyobuDBPropValue;
} | {
    $in: MyobuDBPropValue[];
} | {
    $nin: MyobuDBPropValue[];
} | {
    $regex: string;
} | {
    $contains: string;
} | {
    $startsWith: string;
} | {
    $endsWith: string;
} | {
    $labels: string[];
};
export declare type MyobuDBReturnValue = string | {
    key: string;
    count?: boolean;
    sum?: boolean;
    as?: string;
    distinct?: boolean;
};
export declare type MyobuDBWithValue = MyobuDBReturnValue;
export declare type MyobuDBWhereClause = {
    $and: MyobuDBWhereClause[];
} | {
    $or: MyobuDBWhereClause[];
} | {
    [key: string]: MyobuDBWhereClauseValue;
};
export interface MergeOnMatchOnCreate {
    onMatch?: {
        [key: string]: MyobuDBPropValue;
    };
    onCreate?: {
        [key: string]: MyobuDBPropValue;
    };
}
export interface MyobuDBOperation {
    match?: (MyobuDBNode | MyobuDBRelationship)[];
    create?: (MyobuDBNode | MyobuDBRelationship)[];
    /**
     * For MERGE on relationships, we don't accept node props.
     */
    merge?: ((MyobuDBNode & MergeOnMatchOnCreate) | MyobuDBRelationship)[];
    where?: MyobuDBWhereClause;
    with?: MyobuDBWithValue[];
    delete?: string[];
    detachDelete?: string[];
    set?: {
        [key: string]: MyobuDBPropValue;
    };
    skip?: number;
    limit?: number;
    orderBy?: {
        [key: string]: MyobuDBOrder;
    };
    return?: MyobuDBReturnValue[];
}
export interface MyobuDBReadOperation {
    match?: (MyobuDBNode | MyobuDBRelationship)[];
    /**
     * For MERGE on relationships, we don't accept node props.
     */
    where?: MyobuDBWhereClause;
    with?: MyobuDBWithValue[];
    skip?: number;
    limit?: number;
    orderBy?: {
        [key: string]: MyobuDBOrder;
    };
    return?: MyobuDBReturnValue[];
}
export interface MyobuDBRequest extends MyobuDBReadOperation {
}
export interface MyobuDBLabelSchema {
    label: string;
    properties: {
        [key: string]: MyobuDBLabelSchemaProperty;
    };
    required?: string[];
}
export declare type MyobuDBLabelSchemaProperty = {
    type: "string";
    minLength?: number;
    maxLength?: number;
} | {
    type: "number";
} | {
    type: "boolean";
} | {
    type: "array";
};
export interface MyobuDBLabelSchemaRequest {
    schema: MyobuDBLabelSchema;
    jwt?: MyobuDBJWT;
    delete?: boolean;
}
export declare function isMyobuDBLabelSchema(obj: any): obj is MyobuDBLabelSchema;
export interface MyobuDBLabelACL {
    label: string;
    node: {
        write: {
            minBalance?: number;
            minVotingPower?: number;
        };
    };
}
export interface MyobuDBLabelACLRequest {
    acl: MyobuDBLabelACL;
    jwt?: MyobuDBJWT;
    delete?: boolean;
}
export declare function isMyobuDBLabelACL(obj: any): obj is MyobuDBLabelACL;
export interface MyobuDBLabelConstraints {
    label: string;
    unique: string[][];
}
export interface MyobuDBLabelConstraintsCreateRequest {
    constraints: MyobuDBLabelConstraints;
    jwt?: MyobuDBJWT;
}
export interface MyobuDBLabelConstraintsDeleteRequest {
    constraintNames: string[];
    jwt?: MyobuDBJWT;
}
export declare function isMyobuDBLabelConstraints(obj: any): obj is MyobuDBLabelConstraints;
export interface MNSProfile {
    name: string;
    displayName: string;
    email?: string;
    avatar?: string;
    wallpaper?: string;
    description?: string;
    url?: string;
    twitter?: string;
    discord?: string;
    github?: string;
    telegram?: string;
    reddit?: string;
    youtube?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    twitch?: string;
    linkedin?: string;
    eth?: string;
    btc?: string;
}
export declare type MyobuDBEventParameter = string;
export interface MyobuDBEvent {
    label: string;
    name: string;
    params: MyobuDBEventParameter[];
    description?: string;
    db: MyobuDBOperation;
}
export interface MyobuDBEventRequest {
    event: MyobuDBEvent;
    jwt?: MyobuDBJWT;
    delete?: boolean;
}
export interface MyobuDBApplyEventRequest {
    label: string;
    eventName: string;
    eventArgs: {
        [key: string]: MyobuDBPropValue;
    };
    jwt: MyobuDBJWT;
}
export declare enum MyobuDBProposalVoteType {
    SINGLE_CHOICE = "SINGLE_CHOICE",
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
}
export interface MyobuDBProposal {
    title: string;
    description: string;
    voteType: MyobuDBProposalVoteType;
    /**
     * Minimum voting power required to vote.
     */
    minVotingPower: number;
    /**
     * Current total voting power voted.
     */
    totalVotingPower: number;
    /**
     * The date the proposal allows voting to start.
     */
    startDate: number;
    /**
     * The date the proposal allows voting to end.
     */
    endDate: number;
    choices: MyobuDBProposalChoice[];
    _id?: string;
    _owner?: string;
    _createdAt?: number;
    _updatedAt?: number;
}
export interface MyobuDBProposalChoice {
    description: string;
    totalVotingPower: number;
}
export interface MyobuDBProposalVote {
    proposalId: string;
    choiceId: string;
    votingPower: number;
    _id: string;
    _owner: string;
    _createdAt: number;
    _updatedAt: number;
}
