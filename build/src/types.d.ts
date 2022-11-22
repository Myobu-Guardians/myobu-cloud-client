export declare type MyobuDBPropValue = string | number | boolean | null | MyobuDBPropValue[];
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
export interface MyobuDBLabelACL {
    node: {
        minHold: number;
        minStake: number;
        relationship: string;
        "!relationship": string;
    };
}
export interface MyobuDBNodeACL {
    relationship: {
        minHold: number;
        minStake: number;
        relationship: string;
        "!relationship": string;
    };
}
export declare type MyobuDBReturnValue = string | {
    key: string;
    count?: boolean;
    as?: string;
    distinct?: boolean;
};
export declare type MyobuDBWhereClause = {
    [key: string]: MyobuDBWhereClauseValue;
};
export interface MergeOnMatchOnCreate {
    onMatch?: {
        [key: string]: any;
    };
    onCreate?: {
        [key: string]: any;
    };
}
export declare type MyobuDBRequest = {
    match?: (MyobuDBNode | MyobuDBRelationship)[];
    create?: (MyobuDBNode | MyobuDBRelationship)[];
    /**
     * For MERGE on relationships, we don't accept node props.
     */
    merge?: ((MyobuDBNode & MergeOnMatchOnCreate) | MyobuDBRelationship)[];
    delete?: string[];
    detachDelete?: string[];
    set?: {
        [key: string]: any;
    };
    where?: MyobuDBWhereClause;
    skip?: number;
    limit?: number;
    orderBy?: {
        [key: string]: MyobuDBOrder;
    };
    return?: MyobuDBReturnValue[];
    /**
     * List constraints of label.
     */
    listConstraints?: string;
    /**
     * Drop constraints by constraint names
     */
    dropConstraints?: string[];
    /**
     * Create constraints
     */
    createConstraints?: {
        label: string;
        unique: string[][];
    };
    jwt?: MyobuDBJWT;
};
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
export interface MNSProfileRequest {
    profile: MNSProfile;
    jwt: MyobuDBJWT;
}
