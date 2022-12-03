export type MyobuDBPropValueObject = {
  $object: {
    [key: string]: MyobuDBPropValue;
  };
};

export type MyobuDBPropValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | {
      $add: MyobuDBPropValue[];
    }
  | {
      $sub: MyobuDBPropValue[];
    }
  | {
      $mul: MyobuDBPropValue[];
    }
  | {
      $div: MyobuDBPropValue[];
    }
  /** Property key, eg "mns.name" */
  | {
      $key: string;
    }
  | {
      $timestamp: boolean;
    }
  | {
      $signer: boolean;
    }
  | {
      $coalesce: MyobuDBPropValue[];
    }
  | {
      $arg: string;
    }
  | {
      $votingPower: MyobuDBPropValue;
    }
  | MyobuDBPropValueObject
  | {
      $get: [{ $arg: string }, string];
    }
  | {
      $id: "uuid" | "nanoid";
    }

  /*
  | {
      $sum: {
        $prop: string;
      };
    }
    */
  | MyobuDBPropValue[];

export interface MyobuRecord {
  labels?: string[];
  type?: string;
  props: { [key: string]: MyobuDBPropValue };
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

export type MyobuDBJWTSignature = string;

export interface MyobuDBJWT {
  message?: string;
  payload: MyobuDBJWTPayload;
  /**
   * Signature is generated from `message + JSON.stringify(payload)`
   */
  signature: MyobuDBJWTSignature;
}

export enum MyobuDBOrder {
  ASC = "ASC",
  DESC = "DESC",
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
  props?: { [key: string]: MyobuDBPropValue };
}

export type MyobuDBWhereClauseValue =
  | {
      $gt: MyobuDBPropValue;
    }
  | {
      $gte: MyobuDBPropValue;
    }
  | {
      $lt: MyobuDBPropValue;
    }
  | {
      $lte: MyobuDBPropValue;
    }
  | {
      $ne: MyobuDBPropValue;
    }
  | {
      $eq: MyobuDBPropValue;
    }
  | {
      $in: MyobuDBPropValue[];
    }
  | {
      $nin: MyobuDBPropValue[];
    }
  | {
      $regex: string;
    }
  | {
      $contains: string;
    }
  | {
      $startsWith: string;
    }
  | {
      $endsWith: string;
    }
  | {
      $labels: string[];
    };

export type MyobuDBReturnValue =
  | string
  | {
      key: string;
      count?: boolean;
      sum?: boolean;
      as?: string;
      distinct?: boolean;
    };

export type MyobuDBWithValue = MyobuDBReturnValue;

export type MyobuDBWhereClause = /*
  | {
      $and: MyobuDBWhereClause[];
    }
  | {
      $or: MyobuDBWhereClause[];
    }
  |*/ { [key: string]: MyobuDBWhereClauseValue };

export interface MergeOnMatchOnCreate {
  onMatch?: {
    [key: string]: MyobuDBPropValue;
  };
  onCreate?: {
    [key: string]: MyobuDBPropValue;
  };
}

/*
export interface MyobuDBWriteOperation {
  create?: (MyobuDBNode | MyobuDBRelationship)[];
  merge?: ((MyobuDBNode & MergeOnMatchOnCreate) | MyobuDBRelationship)[];
  delete?: string[];
  detachDelete?: string[];
  set?: {
    [key: string]: MyobuDBPropValue;
  };
}
*/

export interface MyobuDBOperation {
  // CRUD
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
  // CRUD
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

export interface MyobuDBRequest extends MyobuDBReadOperation {}

export interface MyobuDBLabelSchema {
  label: string;
  properties: { [key: string]: MyobuDBLabelSchemaProperty };
  required?: string[];
}

export type MyobuDBLabelSchemaProperty =
  | {
      type: "string";
      minLength?: number;
      maxLength?: number;
    }
  | { type: "number" }
  | { type: "boolean" }
  | {
      type: "array";
      // items: MyobuDBLabelSchemaProperty
    };

export interface MyobuDBLabelSchemaRequest {
  schema: MyobuDBLabelSchema;
  // JWT
  jwt?: MyobuDBJWT;
  // Delete
  delete?: boolean;
}

export function isMyobuDBLabelSchema(obj: any): obj is MyobuDBLabelSchema {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.label === "string" &&
    typeof obj.properties === "object" &&
    obj.schema !== null
  );
}

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
  // JWT
  jwt?: MyobuDBJWT;
  // Delete
  delete?: boolean;
}

export function isMyobuDBLabelACL(obj: any): obj is MyobuDBLabelACL {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.label === "string" &&
    typeof obj.node === "object" &&
    obj.node !== null &&
    typeof obj.node.write === "object"
  );
}

export interface MyobuDBLabelConstraints {
  label: string;
  unique: string[][];
}

export interface MyobuDBLabelConstraintsCreateRequest {
  constraints: MyobuDBLabelConstraints;
  // JWT
  jwt?: MyobuDBJWT;
}

export interface MyobuDBLabelConstraintsDeleteRequest {
  constraintNames: string[];
  // JWT
  jwt?: MyobuDBJWT;
}

export function isMyobuDBLabelConstraints(
  obj: any
): obj is MyobuDBLabelConstraints {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.label === "string" &&
    Array.isArray(obj.unique)
  );
}

export interface MNSProfile {
  name: string;
  displayName: string;
  email?: string;
  avatar?: string;
  wallpaper?: string;
  description?: string;

  // Social medias
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

  // Wallet addresses
  eth?: string;
  btc?: string;
}

export type MyobuDBEventParameter = /*
  | {
      name: string;
      type: "string" | "number" | "boolean" | "enum" | "array" | "object";
      enum?: string[];
      description?: string;
      required?: boolean;
      default?: MyobuDBPropValue;
    }
  |*/ string;

export interface MyobuDBEvent {
  label: string;
  name: string;
  params: MyobuDBEventParameter[];
  description?: string;
  db: MyobuDBOperation;
}

export interface MyobuDBEventRequest {
  event: MyobuDBEvent;
  // JWT
  jwt?: MyobuDBJWT;
  // Delete
  delete?: boolean;
}

export interface MyobuDBApplyEventRequest {
  label: string;
  eventName: string;
  eventArgs: { [key: string]: MyobuDBPropValue };
  jwt: MyobuDBJWT;
}

export interface MyobuDBProposal {
  title: string;
  description: string;
  voteType: "SINGLE_CHOICE";
  totalVotingPower: number;

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
