export interface MyobuRecord {
    labels?: string[];
    type?: string;
    props: {
        [key: string]: any;
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
    payload: MyobuDBJWTPayload;
    signature: MyobuDBJWTSignature;
}
export declare enum MyobuDBOrder {
    ASC = "ASC",
    DESC = "DESC"
}
export declare enum MyobuDBRequestMethod {
    CREATE = "CREATE",
    QUERY = "QUERY",
    UPDATE = "UPDATE",
    DELETE = "DELETE"
}
export interface MyobuDBNode {
    labels?: string[];
    props?: any;
}
export interface MyobuDBRelationship {
    type: string;
    from: string;
    to: string;
    props?: any;
}
export declare type MyobuDBRequest = {
    method: MyobuDBRequestMethod.CREATE;
    nodes: {
        [key: string]: MyobuDBNode;
    };
    relationships?: {
        [key: string]: MyobuDBRelationship;
    };
    skip?: number;
    limit?: number;
    return?: string[];
    jwt: MyobuDBJWT;
} | {
    method: MyobuDBRequestMethod.QUERY;
    nodes: {
        [key: string]: MyobuDBNode;
    };
    relationships?: {
        [key: string]: MyobuDBRelationship;
    };
    skip?: number;
    limit?: number;
    return?: string[];
    orderBy?: {
        [key: string]: {
            [key: string]: MyobuDBOrder;
        };
    };
    jwt: MyobuDBJWT;
} | {
    method: MyobuDBRequestMethod.UPDATE;
    nodes: {
        [key: string]: MyobuDBNode;
    };
    relationships?: {
        [key: string]: MyobuDBRelationship;
    };
    skip?: number;
    limit?: number;
    update: {
        [key: string]: {
            props: any;
        };
    };
    return?: string[];
    jwt: MyobuDBJWT;
} | {
    method: MyobuDBRequestMethod.DELETE;
    nodes: {
        [key: string]: MyobuDBNode;
    };
    relationships?: {
        [key: string]: MyobuDBRelationship;
    };
    skip?: number;
    limit?: number;
    delete: string[];
    return?: string[];
    jwt: MyobuDBJWT;
};
