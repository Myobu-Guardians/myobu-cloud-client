# Myobu Protocol

**Work in progress**

Myobu as a Service  
https://protocol.myobu.io

We provide a protocol service for Myobu, which offers:

1. Authentication
2. Graph Database service.
3. PubSub service.
4. Image Upload service.
5. MNS (Myobu Name Service).
6. DAO service.

---

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Myobu Protocol](#myobu-protocol)
  - [Client code](#client-code)
  - [Authentication](#authentication)
  - [Database](#database)
    - [Models](#models)
      - [Node](#node)
      - [Relationships](#relationships)
    - [Operations](#operations)
      - [Upsert (Create or Update) using `merge`](#upsert-create-or-update-using-merge)
      - [Query](#query)
      - [Update](#update)
      - [Delete](#delete)
    - [Constraints for Label](#constraints-for-label)
      - [List contraints](#list-contraints)
      - [Create constraints](#create-constraints)
      - [Delete constraints](#delete-constraints)
    - [Ownership](#ownership)
    - [Snapshot](#snapshot)
    - [Label schema](#label-schema)
    - [Label ACL](#label-acl)
    - [Label triggers](#label-triggers)
  - [PubSub](#pubsub)
  - [Image upload](#image-upload)
  - [DAO](#dao)
    - [Balance](#balance)
    - [Voting power](#voting-power)
    - [Delegation](#delegation)
    - [DAO proposal](#dao-proposal)
  - [MNS (Myobu Name Service)](#mns-myobu-name-service)
  - [Useful tools](#useful-tools)
  - [References](#references)

<!-- /code_chunk_output -->

## Client code

```typescript
import { MyobuProtocolClient } from "myobu-protocol-client";
import { ethers } from "ethers";

const signer = ... //get ethers signer...

const client = new MyobuProtocolClient({
  signer, // Needs the wallet to sign transactions
  server: "https://protocol.myobu.io/",
  expiresIn: 1000 * 60 * 60 * 24 * 365, // 1 year
});
```

## Authentication

The user will be authenticated using the `signer` provided in the constructor.
Whenever the user needs to be authenticated, the client will sign a message using the `signer` and send it to the server to verify.

## Database

### Models

#### Node

A node has `labels` to identify its type and `props` (properties) that describe its data.
You can create a node in Myobu Protocol like the below:

```typescript
const profileNode = await client.db({
  create: [
    {
      key: "profile",
      labels: ["MNS"],
      props: {
        name: "kirito",
        email: "kirito.m@myobu.io",
        created: "$now", // $now is a special keyword that will be replaced with current timestamp
        modified: "$now",
        age: 18,
      },
    },
  ],
  return: ["profile"],
});
console.log(profileNode);
/*
{
  "labels": ["MNS"],
  "props": {
    "name": "kirito",
    "email": "kirito.m@myobu.io",
    "created": 1620000000000,
    "modified": 1620000000000,
    "age": 18

    // System inserted props
    "_id": "0x0000000000000000000000000000000000000000000000000000000000000001",
    "_owner": "0x0000000000000000000000000000000000000000",
    "_nftId": "0x0000000000000000000000000000000000000000000000000000000000000000", // null if no NFT is attached
  },
}
*/
```

> In the future, the number of Myobu you hold (or staked) will decide how many nodes you can create.  
> Node labels are strictly required to be camel-case, beginning with an upper-case character. VehicleOwner rather than vehicle_owner etc.
> We only support `string`, `number`, `boolean`, and `null` types in `props` for now.

#### Relationships

A relationship is a directed connection between two nodes.
A relationship has a `type` and `props` (properties) to describe the relationship.

```typescript
const relationship = await client.db({
  match: [
    {
      ...profileNode,
      key: "profile",
    },
  ],
  create: [
    {
      key: "r",
      type: "LIVES_IN",
      from: { key: "profile" },
      to: {
        key: "city",
        labels: ["City"],
        props: {
          name: "Tokyo",
        },
      },
      props: {
        since: 2019,
      },
    },
  ],
  return: ["profile", "city", "r"],
});
```

> In the future, the number of Myobu you hold (or staked) will decide how many relationships you can create.  
> Relationship types are strictly required to be upper-case, using underscore to separate words. :OWNS_VEHICLE rather than :ownsVehicle etc.

### Operations

#### Upsert (Create or Update) using `merge`

```typescript
const profileNode = await client.db({
  merge: [
    {
      key: "profile",
      labels: ["MNS"],
      props: {
        name: "kirito",
      },
      onMatch: {
        "profile.fetched": "$now",
      },
      onCreate: {
        "profile.created": "$now",
        "profile.fetched": "$now",
      },
    }
  ],
  return ["profile"]
})
```

#### Query

```typescript
// Find people who lives in Mars and has age greater than 18 and less than 90
const result = await client.db({
  match: [
    {
      key: "r",
      type: "LIVES_IN",
      from: {
        key: "people",
        labels: ["MNS"],
      },
      to: {
        key: "city",
        labels: ["City"],
        props: {
          name: "Mars",
        },
      },
      props: {
        // ...
      },
    },
  ],
  where: {
    $and: [
      {
        "people.age": {
          $gt: 18,
        },
      },
      {
        "people.age": {
          $lt: 90,
        },
      },
    ],
    // We also support $gt, $gte, $lt, $lte, $ne, $eq, $in, $nin, $regex, $contains, $startsWith, $endsWith
  },
  skip: 10,
  limit: 5,
  orderBy: {
    "people.age": "DESC",
  },
  return: ["people"],
});
```

#### Update

```typescript
await client.db({
  match: [
    {
      key: "people",
      labels: ["MNS"],
      props: {
        name: "kirito",
      },
    },
  ],
  skip: 10,
  limit: 5,
  set: {
    "people.name": "newkirito",
    $inc: {
      "people.age": 1,
    },
  },
  return: ["people"],
});
```

#### Delete

```typescript
await client.db({
  match: [
    {
      key: "r",
      type: "LIVES_IN",
      from: {
        key: "people",
        labels: ["MNS"],
        props: {
          // ...
        },
      },
      to: {
        key: "city",
        labels: ["City"],
        props: {
          name: "Mars",
        },
      },
      props: {
        // ...
      },
    },
  ],
  skip: 10,
  limit: 5,
  delete: ["people", "r", "city"],
  detachDelete: ["city"], // When you want to delete a node and any relationship going to or from it, use DETACH DELETE.
  return: ["people"],
});
```

### Constraints for Label

#### List contraints

```typescript
await client.db({
  listConstraints: "MNS",
});
```

#### Create constraints

```typescript
await client.db({
  createConstraints: {
    label: "MNS",
    unique: [["_owner"], ["name"]],
  },
});
```

#### Delete constraints

```typescript
await client.db({
  dropConstraints: ["constraint_name_1", "constraint_name_2"],
});
```

### Ownership

Each node has an owner.
The owner of the node could transfer its ownership to another address only if the node has taken snapshot as NFT.

### Snapshot

Store nodes, and relationships (subgraph) data in a snapshot on blockchain.

```typescript
// TODO: Implement the related smart contract
await client.takeSnapshot(nodeId);
```

### Label schema

If you own the label, you can define the schema of the label. Then when other users create/update the nodes with the label, the schema will be checked.

- Set label schema

```typescript
await client.setLabelSchema({
  label: "Address",
  properties: {
    lines: {
      type: "array",
      items: { type: "string" },
    },
    zip: { type: "string" },
    city: { type: "string" },
    country: { type: "string" },
  },
  required: ["country"],
});
```

- Get label schema

```typescript
const schema = await client.getLabelSchema(labelName);
```

- Delete label schema

```typescript
await client.deleteLabelSchema(labelName);
```

### Label ACL

Access Control List (ACL) is a list of permissions for a label.

- Set label ACL

```typescript
await client.setLabelACL({
  label: "Address",
  node: {
    write: {
      // Create | Update | Delete
      minBalance: 100, // Minimum Myobu balance you need to create a node with this label. Check `DAO` section later.
      minVotingPower: 100, // Minimum voting power you need to create a node with this label. Check `DAO` section later.
    },
  },
});
```

- Get label ACL

```typescript
await client.getLabelACL(labelName);
```

- Delete label ACL

```typescript
await client.deleteLabelACL(labelName);
```

### Triggers

`To be implemented`

You can set triggers for a specific Label

```typescript
await client.setLabelTrigger({
  label: "Profile",
  triggers: [
    {
      type: "FOLLOWS", // When someone follows this node
      from: {
        label: "MNS",
      }
      set: {
        $inc: {
          "followers": 1,
        },
      },
    },
  ]
});
```

## PubSub

```typescript
const { unsubscribe, emit } = await client.pubsub(roomId, (event) => {
  // ...
});

emit("Message"); // Send message to `roomId`
unsubscribe(); // Unsubscribe from `roomId`
```

## Image upload

We upload images to imgur.com using their [nice API](https://api.imgur.com/endpoints/image#image-upload).

```typescript
const files: File[] = []; // Your image files.
const { urls } = await client.uploadImages(files);
```

## DAO

`Getting implemented`

### Balance

Get the user balance. This includes the amount of MYOBU tokens that the user holds and the amount of MYOBU tokens that the user has staked.

```typescript
const walletAddress = "0x1234567890";
const balance = await client.getBalance(walletAddress);
```

### Voting power

Get the user's voting power. The voting power is the weighted balance of the user's staked MYOBU token.

```typescript
const walletAddress = "0x1234567890";
const votingPower = await client.getVotingPower(walletAddress);
```

### Delegation

`To be implemented`

### DAO proposal

`To be implemented`

DAO proposal support

```typescript
// Create a proposal
const proposal = {
  title: "Proposal title",
  description: "Proposal description",
  voteType: "SINGLE_CHOICE", // SINGLE_CHOICE, MULTI_CHOICE, RANKED_CHOICE
  choices: [
    {
      description: "Choice 1 description",
    },
    {
      description: "Choice 2 description",
    },
  ],
  startAt: new Date().getTime(),
  endAt: new Date().getTime() + 1000 * 60 * 60 * 24 * 7, // 7 days
  minVotingPower: 100, // Minimum voting power required to vote
};
const _proposal = await client.createProposal(proposal);

// Get existing proposal by Id
const __proposal = await client.getProposal(_proposal.id);

// Delete owned proposal
await client.deleteProposal(_proposal.id);

// Add choice
const choice = {
  description: "Choice 3 description",
};
const _proposal = await client.addProposalChoice(_proposal.id, choice);

// Remove choice
const _proposal = await client.removeProposalChoice(_proposal.id, choice.id);

// Vote for a proposal
await client.voteForProposal(_proposal.id, [
  {
    id: _proposal.choices[0].id,
  },
  {
    id: _proposal.choices[1].id,
  },
]);

// Unvote for a proposal
await client.unvoteForProposal(_proposal.id);
```

## MNS (Myobu Name Service)

```typescript
// Create an MNS
const profile = await client.upsertMNS({
  name: "kirito",
  displayName: "Kirito",

  /*
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
*/
});

// Get an MNS
// * by name
const profile = await client.getMNS("kirito");
// * by wallet address
const profile = await client.getMNS("0x1234567890");

// Get minimum balance required to create an MNS
const minBalanceRequiredToCreateMNS =
  await client.getMinBalanceRequiredToCreateMNS();
```

## Useful tools

- https://gitcdn.link/

## References

- https://docs.snapshot.org/proposals/voting-types
