import { MyobuDBEvent } from "./types";

const publishNote: MyobuDBEvent = {
  label: "Realm",
  name: "publishNote",
  params: ["summary", "images", "markdown", "ipfsHash", "arweaveId"],
  description: "Publish a note",
  db: {
    match: [
      {
        key: "author",
        labels: ["MNS"],
        props: {
          _owner: { $signer: true },
        },
      },
    ],
    create: [
      {
        key: "note",
        labels: ["Note"],
        props: {
          summary: { $arg: "summary" },
          images: { $arg: "images" },
          markdown: { $arg: "markdown" },
          ipfsHash: { $arg: "ipfsHash" },
          arweaveId: { $arg: "arweaveId" },

          _id: { $id: "nanoid" },
          _createdAt: { $timestamp: true },
          _updatedAt: { $timestamp: true },
          _owner: { $signer: true },
        },
      },
      {
        key: "r",
        type: "POSTED",
        from: { key: "author" },
        to: { key: "note" },
        props: {
          _owner: { $signer: true },
        },
      },
      {
        key: "r2",
        type: "SUBSCRIBED_TO",
        from: { key: "author" },
        to: { key: "note" },
        props: {
          _owner: { $signer: true },
        },
      },
    ],
    return: [
      "note",
      { key: "author.displayName", as: "authorDisplayName" },
      { key: "author.name", as: "authorName" },
      { key: "author.avatar", as: "authorAvatar" },
    ],
  },
};

const deleteNote: MyobuDBEvent = {
  label: "Realm",
  name: "deleteNote",
  params: ["noteId"],
  description: "Delete a note",
  db: {
    match: [
      {
        key: "note",
        labels: ["Note"],
        props: {
          _id: { $arg: "noteId" },
          _owner: { $signer: true },
        },
      },
    ],
    detachDelete: ["note"],
    return: ["note"],
  },
};

const updateNote: MyobuDBEvent = {
  label: "Realm",
  name: "updateNote",
  params: ["noteId", "summary", "images", "markdown", "ipfsHash"],
  description: "Update a note",
  db: {
    match: [
      {
        key: "note",
        labels: ["Note"],
        props: {
          _id: { $arg: "noteId" },
          _owner: { $signer: true },
        },
      },
    ],
    set: {
      "note.summary": { $arg: "summary" },
      "note.images": { $arg: "images" },
      "note.markdown": { $arg: "markdown" },
      "note.ipfsHash": { $arg: "ipfsHash" },
      "note._updatedAt": { $timestamp: true },
    },
    return: ["note"],
  },
};

const makeComment: MyobuDBEvent = {
  label: "Realm",
  name: "makeComment",
  params: ["noteId", "markdown"],
  description: "Make a comment on a note",
  db: {
    match: [
      {
        key: "note",
        labels: ["Note"],
        props: {
          _id: { $arg: "noteId" },
        },
      },
      {
        key: "author",
        labels: ["MNS"],
        props: {
          _owner: { $signer: true },
        },
      },
    ],
    create: [
      {
        key: "comment",
        labels: ["Comment"],
        props: {
          markdown: { $arg: "markdown" },

          _owner: { $signer: true },
          _id: { $id: "nanoid" },
          _createdAt: { $timestamp: true },
          _updatedAt: { $timestamp: true },
        },
      },
      {
        key: "r",
        type: "POSTED",
        from: { key: "author" },
        to: { key: "comment" },
        props: {
          _owner: { $signer: true },
        },
      },
      {
        key: "r2",
        type: "COMMENTED_ON",
        from: { key: "comment" },
        to: { key: "note" },
        props: {
          _owner: { $signer: true },
        },
      },
    ],
    return: [
      "comment",
      { key: "author.displayName", as: "authorDisplayName" },
      { key: "author.name", as: "authorName" },
      { key: "author.avatar", as: "authorAvatar" },
    ],
  },
};

const makeNoteComment: MyobuDBEvent = Object.assign({}, makeComment, {
  name: "makeNoteComment",
});

const makeProposalComment: MyobuDBEvent = {
  label: "Realm",
  name: "makeProposalComment",
  params: ["proposalId", "markdown"],
  description: "Make a comment on a proposal",
  db: {
    match: [
      {
        key: "proposal",
        labels: ["Proposal"],
        props: {
          _id: { $arg: "proposalId" },
        },
      },
      {
        key: "author",
        labels: ["MNS"],
        props: {
          _owner: { $signer: true },
        },
      },
    ],
    create: [
      {
        key: "comment",
        labels: ["Comment"],
        props: {
          markdown: { $arg: "markdown" },

          _owner: { $signer: true },
          _id: { $id: "nanoid" },
          _createdAt: { $timestamp: true },
          _updatedAt: { $timestamp: true },
        },
      },
      {
        key: "r",
        type: "POSTED",
        from: { key: "author" },
        to: { key: "comment" },
        props: {
          _owner: { $signer: true },
        },
      },
      {
        key: "r2",
        type: "COMMENTED_ON",
        from: { key: "comment" },
        to: { key: "proposal" },
        props: {
          _owner: { $signer: true },
        },
      },
    ],
    return: [
      "comment",
      { key: "author.displayName", as: "authorDisplayName" },
      { key: "author.name", as: "authorName" },
      { key: "author.avatar", as: "authorAvatar" },
    ],
  },
};

const addTagToNote: MyobuDBEvent = {
  label: "Realm",
  name: "addTagToNote",
  params: ["noteId", "tagName", "sanitizedTagName"],
  description: "Add a tag to a note",
  db: {
    match: [
      {
        key: "note",
        labels: ["Note"],
        props: {
          _id: { $arg: "noteId" },
          _owner: { $signer: true },
        },
      },
    ],
    merge: [
      {
        key: "tag",
        labels: ["Tag"],
        props: {
          _owner: { $signer: true },
          name: { $arg: "tagName" },
          sanitizedName: { $arg: "sanitizedTagName" },
        },
      },
      {
        key: "r",
        type: "TAGGED_WITH",
        from: { key: "note" },
        to: { key: "tag" },
        props: {
          _owner: { $signer: true },
        },
      },
    ],
    return: ["tag"],
  },
};

const deleteTagFromNote: MyobuDBEvent = {
  label: "Realm",
  name: "deleteTagFromNote",
  params: ["noteId", "tagName"],
  description: "Delete a tag from a note",
  db: {
    match: [
      {
        type: "TAGGED_WITH",
        key: "r",
        from: {
          key: "note",
          labels: ["Note"],
          props: {
            _id: { $arg: "noteId" },
          },
        },
        to: {
          key: "tag",
          labels: ["Tag"],
          props: {
            _owner: { $signer: true },
            name: { $arg: "tagName" },
          },
        },
      },
    ],
    delete: ["r"],
    return: ["tag"],
  },
};

const RealmEvents = {
  publishNote,
  deleteNote,
  updateNote,
  makeComment, // <- Decprecate this soon
  makeNoteComment,
  addTagToNote,
  deleteTagFromNote,
  makeProposalComment,
};

export default RealmEvents;
