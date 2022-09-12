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
  - [Listener](#listener)
  - [Ownership](#ownership)
  - [Snapshot](#snapshot)
  - [Indexing](#indexing)
  - [Label and unique constraints](#label-and-unique-constraints)
  - [ACL](#acl)

<!-- /code_chunk_output -->

## Client code

```typescript
import { MyobuCloudClient } from "myobu-cloud-client";
import { ethers } from "ethers";

const signer = ... //get ethers signer...

const client = MyobuCloudClient({
  signer, // Needs the wallet to sign transactions
  cloudServer: "https://cloud.myobu.io/"
});
```

## Data models

### Node

A node has `labels` to identify its type and `props` (properties) that decribes its data.
You can create a node in Myobu Cloud like below:

```typescript
const profileNode = await client.create({
  nodes: {
    profile: {
      labels: ["MyobuProfile"],
      props: {
        name: "kirito",
        email: "kirito.m@myobu.io",
      },
    },
  },
  return: ["profile"],
});
console.log(profileNode);
/*
{
  "label": "MyobuProfile",
  "props": {
    "name": "kirito",
    "email": "kirito.m@myobu.io",

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
> We only support `string` and `number` types in `props` for now.

### Relationships

A relationship is a directed connection between two nodes.
A relationship has a `type` and `props` (properties) to describe the relationship.

```typescript
const cityNode = await client.create({
  nodes: {
    city: {
      labels: ["City"],
      props: {
        name: "Tokyo",
      },
    },
  },
  return: ["city"],
});

const relationship = await client.create({
  nodes: {
    city: cityNode,
    profile: profileNode,
  },
  relationships: {
    r: {
      type: "LIVES_IN",
      from: "profile",
      to: "city",
      props: {
        since: "2021-03-01",
      },
    },
  },
  return: ["profile", "city", "r"],
});
```

> In the future, the number of Myobu you hold (or staked) will decide how many relationships you can create.  
> Relationship types are strictly required to be upper-case, using underscore to separate words. :OWNS_VEHICLE rather than :ownsVehicle etc.

## Query

```typescript
// Find people who lives in Mars
const result = await client.query({
  nodes: {
    people: {
      labels: ["MyobuProfile"],
      props: {
        // ...
      },
    },
    city: {
      labels: ["City"],
      props: {
        name: "Mars",
      },
    },
  },
  relationships: {
    r: {
      from: "people",
      to: "city",
      type: "LIVES_IN",
      props: {
        // ...
      },
    },
  },
  skip: 10,
  limit: 5,
  orderBy: {
    people: {
      _createdAt: "DESC",
    },
  },
  return: ["people"],
});
```

## Update

```typescript
await client.update({
  nodes: {
    people: {
      labels: ["MyobuProfile"],
      props: {
        // ...
      },
    },
    city: {
      labels: ["City"],
      props: {
        name: "Mars",
      },
    },
  },
  relationships: {
    r: {
      from: "people",
      to: "city",
      type: "LIVES_IN",
      props: {
        // ...
      },
    },
  },
  skip: 10,
  limit: 5,
  update: {
    people: {
      props: {
        name: "kirito",
      },
    },
  },
  return: ["people"],
});
```

## Delete

```typescript
await client.delete({
  nodes: {
    people: {
      labels: ["MyobuProfile"],
      props: {
        // ...
      },
    },
    city: {
      labels: ["City"],
      props: {
        name: "Mars",
      },
    },
  },
  relationships: {
    r: {
      from: "people",
      to: "city",
      type: "LIVES_IN",
      props: {
        // ...
      },
    },
  },
  skip: 10,
  limit: 5,
  delete: ['people', 'r', 'city'],
  return: ["people"],
});
```

## Listener

Listen for a change of node

```typescript
const unsubscribe = await client.listenNodeChangeById(nodeId, (event) => {
  // ...
});

unsubscribe();
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
