# Myobu Protocol

**Work in progress**

Myobu as a Service

We provide a cloud service for Myobu, which offers a Graph Database based on which you could quickly build your own web3 application.

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Myobu Protocol](#myobu-protocol)
  - [Client code](#client-code)
  - [Data models](#data-models)
    - [Node](#node)
    - [Relationships](#relationships)
  - [Upsert (Create or Update) using `merge`](#upsert-create-or-update-using-merge)
  - [Query](#query)
  - [Update](#update)
  - [Delete](#delete)
  - [Constraints for Label](#constraints-for-label)
    - [List contraints](#list-contraints)
    - [Create constraints](#create-constraints)
    - [Delete constraints](#delete-constraints)
  - [PubSub](#pubsub)
  - [Ownership](#ownership)
  - [Snapshot](#snapshot)
  - [ACL](#acl)
  - [Triggers](#triggers)
  - [Useful tools](#useful-tools)

<!-- /code_chunk_output -->

## Client code

```typescript
import { MyobuProtocolClient } from "myobu-protocol-client";
import { ethers } from "ethers";

const signer = ... //get ethers signer...

const client = new MyobuProtocolClient({
  signer, // Needs the wallet to sign transactions
  cloudServer: "http://cloud.myobu.io/",
  expiresIn: 1000 * 60 * 60 * 24 * 365, // 1 year
});
```

## Data models

### Node

A node has `labels` to identify its type and `props` (properties) that decribes its data.
You can create a node in Myobu Protocol like below:

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
      labels: ["MNS"],
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

## Update

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

## Delete

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
  return: ["people"],
});
```

## Constraints for Label

### List contraints

```typescript
await client.db({
  listConstraints: "MNS",
});
```

### Create constraints

```typescript
await client.db({
  createConstraints: {
    label: "MNS",
    unique: [["_owner"], ["name"]],
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

## ACL

`To be implemented`

Access Control List (ACL) is a list of permissions for a label or node.

- **Label**

```typescript
await client.db({
  create: [
    {
      key: "myLabelWithACL",
      labels: ["Label"],
      props: {
        name: "MyLabel",
        _acl: JSON.stringify({
          node: {
            minHold: 100, // Minimum number of Myobu you need to hold to create a node with this label
            minStake: 100, // Minimum number of Myobu you need to stake to create a node with this label
            relationship: "ALLOW_CREATE", // The relationship type to address required to create a node with this label
            "!relationship": "DENY_CREATE", // The relationship type to address not allowed to create a node with this label
          },
        }),
      },
    },
  ],
  return: ["myLabelWithACL"],
});
```

- **Node**

```typescript
await client.db({
  create: [
    {
      key: "myNodeWithACL",
      labels: ["MNS"],
      props: {
        name: "MyNode",
        _acl: JSON.stringify({
          relationship: {
            minHold: 100, // Minimum number of Myobu you need to hold to create a relationship with this node
            minStake: 100, // Minimum number of Myobu you need to stake to create a relationship with this node
            relationship: "ALLOW_CREATE", // The relationship type to address required to create a relationship with this node
            "!relationship": "DENY_CREATE", // The relationship type to address not allowed to create a relationship with this node
          },
        }),
      },
    },
  ],
  return: ["myNodeWithACL"],
});
```

## Triggers

`To be implemented`

You can set triggers for a specific node

```typescript
await client.db({
  create: [
    {
      key: "profile",
      labels: ["MNS"],
      props: {
        name: "kirito",
        followers: 0,
        followings: 0,
      },
      triggers: [
        {
          type: "FOLLOWS", // When someone follows this node
          from: {
            label: "MNS",
          }
          set: {
            $inc: {
              "profile.followers": 1,
            },
          },
        },
      ],
    },
  ],
});
```

## Useful tools

- https://gitcdn.link/
