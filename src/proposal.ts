import { MyobuDBEvent } from "./types";

/**
 * Proposal => Choice => Vote
 */

const createProposal: MyobuDBEvent = {
  label: "Proposal",
  name: "createProposal",
  params: ["title", "description", "voteType"],
  description: "Create a new proposal",
  db: {
    create: [
      {
        key: "proposal",
        labels: ["Proposal"],
        props: {
          voteType: { $arg: "voteType" },
          title: { $arg: "title" },
          description: { $arg: "description" },
          totalVotingPower: 0,

          _id: { $id: "nanoid" },
          _createdAt: { $timestamp: true },
          _updatedAt: { $timestamp: true },
          _owner: { $signer: true },
        },
      },
    ],
    return: ["proposal"],
  },
};

const updateProposal: MyobuDBEvent = {
  label: "Proposal",
  name: "updateProposal",
  params: ["proposalId", "title", "description"],
  description: "Update a proposal",
  db: {
    match: [
      {
        key: "proposal",
        labels: ["Proposal"],
        props: {
          _id: { $arg: "proposalId" },
          _owner: { $signer: true },
        },
      },
    ],
    set: {
      "proposal.title": { $arg: "title" },
      "proposal.description": { $arg: "description" },
    },
    return: ["proposal"],
  },
};

const addProposalChoice: MyobuDBEvent = {
  label: "Proposal",
  name: "addProposalChoice",
  params: ["proposalId", "choiceDescription"],
  description: "Add a choice to a proposal",
  db: {
    match: [
      {
        key: "proposal",
        labels: ["Proposal"],
        props: {
          _id: { $arg: "proposalId" },
          _owner: { $signer: true },
        },
      },
    ],
    create: [
      {
        key: "choice",
        labels: ["Choice"],
        props: {
          description: { $arg: "choiceDescription" },
          totalVotingPower: 0,

          _id: { $id: "nanoid" },
          _createdAt: { $timestamp: true },
          _updatedAt: { $timestamp: true },
          _owner: { $signer: true },
        },
      },
      {
        type: "HAS_CHOICE",
        key: "r",
        from: {
          key: "proposal",
        },
        to: {
          key: "choice",
        },
        props: {
          _id: { $id: "nanoid" },
          _createdAt: { $timestamp: true },
          _updatedAt: { $timestamp: true },
          _owner: { $signer: true },
        },
      },
    ],
    return: ["proposal", "choice"],
  },
};

const vote: MyobuDBEvent = {
  label: "Proposal",
  name: "vote",
  params: ["proposalId", "choiceId"],
  description: "Vote on a proposal choice",
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
        key: "choice",
        labels: ["Choice"],
        props: {
          _id: { $arg: "choiceId" },
        },
      },
      {
        key: "user",
        labels: ["MNS"],
        props: {
          _owner: { $signer: true },
        },
      },
      {
        key: "r",
        type: "HAS_CHOICE",
        from: {
          key: "proposal",
        },
        to: {
          key: "choice",
        },
      },
    ],
    merge: [
      {
        key: "vote",
        labels: ["Vote"],
        props: {
          proposalId: { $arg: "proposalId" },
          choiceId: { $arg: "choiceId" },
          _owner: { $signer: true },
        },
        onCreate: {
          "vote.votingPower": { $votingPower: { $signer: true } },
          "vote._id": { $id: "nanoid" },
          "vote._owner": { $signer: true },
          "vote._createdAt": { $timestamp: true },
          "vote._updatedAt": { $timestamp: true },

          "choice.totalVotingPower": {
            $add: [
              {
                $key: "choice.totalVotingPower",
              },
              { $key: "vote.votingPower" },
            ],
          },
          "proposal.totalVotingPower": {
            $add: [
              {
                $key: "proposal.totalVotingPower",
              },
              { $key: "vote.votingPower" },
            ],
          },
        },
        onMatch: {},
      },
      {
        key: "r2",
        type: "HAS_VOTE",
        from: {
          key: "choice",
        },
        to: {
          key: "vote",
        },
      },
    ],
    return: ["vote"],
  },
};

const unvote: MyobuDBEvent = {
  label: "Proposal",
  name: "unvote",
  params: ["proposalId", "choiceId"],
  description: "Unvote on a proposal choice",
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
        key: "choice",
        labels: ["Choice"],
        props: {
          _id: { $arg: "choiceId" },
        },
      },
      {
        key: "user",
        labels: ["MNS"],
        props: {
          _owner: { $signer: true },
        },
      },
      {
        key: "r",
        type: "HAS_CHOICE",
        from: {
          key: "proposal",
        },
        to: {
          key: "choice",
        },
      },
      {
        key: "r2",
        type: "VOTED",
        from: {
          key: "vote",
          labels: ["Vote"],
          props: {
            _owner: { $signer: true },
          },
        },
        to: {
          key: "choice",
        },
      },
    ],
    set: {
      "proposal.totalVotingPower": {
        $sub: [
          {
            $key: "proposal.totalVotingPower",
          },
          {
            $key: "vote.votingPower",
          },
        ],
      },
      "choice.totalVotingPower": {
        $sub: [
          {
            $key: "choice.totalVotingPower",
          },
          {
            $key: "vote.votingPower",
          },
        ],
      },
    },
    detachDelete: ["vote"],
    return: ["vote"],
  },
};

const ProposalEvents = {
  createProposal,
  updateProposal,
  addProposalChoice,
  vote,
  unvote,
};

export default ProposalEvents;
