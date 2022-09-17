# Myobu Cloud

**Work in progress**

Myobu as a Service

We provide a cloud service for Myobu, which offers a Graph Database based on which you could quickly build your own web3 application.

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Myobu Cloud](#myobu-cloud)
  - [Client code](#client-code)
  - [Data models](#data-models)
    - [Node](#node)
    - [Relationships](#relationships)
  - [Query](#query)
  - [Update](#update)
  - [Delete](#delete)
  - [PubSub](#pubsub)
  - [Ownership](#ownership)
  - [Snapshot](#snapshot)
  - [Indexing](#indexing)
  - [Label and unique constraints](#label-and-unique-constraints)
  - [ACL](#acl)
  - [Useful tools](#useful-tools)

<!-- /code_chunk_output -->

## Client code

```typescript
import { MyobuCloudClient } from "myobu-cloud-client";
import { ethers } from "ethers";

const signer = ... //get ethers signer...

const client = new MyobuCloudClient({
  signer, // Needs the wallet to sign transactions
  cloudServer: "http://cloud.myobu.io/",
  expiresIn: 1000 * 60 * 60 * 24 * 365, // 1 year
});
```

## Data models

### Node

A node has `labels` to identify its type and `props` (properties) that decribes its data.
You can create a node in Myobu Cloud like below:

```typescript
const profileNode = await client.db({
  create: [
    {
      key: "profile",
      labels: ["MyobuProfile"],
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
  "labels": ["MyobuProfile"],
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

### Relationships

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

## Upsert (Create or Update) using `merge`

```typescript
const profileNode = await client.db({
  merge: [
    {
      key: "profile",
      labels: ["MyobuProfile"],
      props: {
        name: "kirito",
      }
    }
  ],
  onMatch: {
    "profile.fetched": "$now",
  },
  onCreate: {
    "profile.created": "$now",
    "profile.fetched": "$now",
  },
  return ["profile"]
})
```

## Query

```typescript
// Find people who lives in Mars and has age greater than 18 and less than 90
const result = await client.db({
  match: [
    {
      key: "r",
      type: "LIVES_IN",
      from: {
        key: "people",
        labels: ["MyobuProfile"],
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

## Update

```typescript
await client.db({
  match: [
    {
      key: "people",
      labels: ["MyobuProfile"],
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

## Delete

```typescript
await client.db({
  match: [
    {
      key: "r",
      type: "LIVES_IN",
      from: {
        key: "people",
        labels: ["MyobuProfile"],
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
  return: ["people"],
});
```

## Constraints for Label

### List contraints

```typescript
await client.db({
  listConstraints: "MyobuProfile",
});
```

### Create constraints

```typescript
await client.db({
  createConstraints: {
    label: "MyobuProfile",
    unique: [["_id"], ["email", "name"]],
  },
});
```

### Delete constraints

```typescript
await client.db({
  dropConstraints: ["constraint_name_1", "constraint_name_2"],
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

## Ownership

Each node has an owner.
The owner of the node could transfer its ownership to another address only is the node has been taken snapshot as NFT.

## Snapshot

Store nodes, relationships (subgraph) data in a snapshot on blockchain.

```typescript
// TODO: Implement the related smart contract
await client.takeSnapshot(nodeId);
```

## Indexing

TODO

## Label and unique constraints

TODO

## ACL

TODO

## Useful tools

- https://gitcdn.link/
