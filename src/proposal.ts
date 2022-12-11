import { MyobuDBEvent } from "./types";

/**
 * Proposal => Choice => Vote
 */

const createProposal: MyobuDBEvent = {
  label: "Proposal",
  name: "createProposal",
  params: [
    "title",
    "description",
    "voteType",
    "minVotingPower",
    "startDate",
    "endDate",
  ],
  description: "Create a new proposal",
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
        key: "proposal",
        labels: ["Proposal"],
        props: {
          voteType: { $arg: "voteType" },
          title: { $arg: "title" },
          description: { $arg: "description" },
          minVotingPower: { $arg: "minVotingPower" },
          startDate: { $arg: "startDate" },
          endDate: { $arg: "endDate" },
          totalVotingPower: 0,

          _id: { $id: "nanoid" },
          _createdAt: { $timestamp: true },
          _updatedAt: { $timestamp: true },
          _owner: { $signer: true },
        },
      },
      {
        key: "p",
        type: "PROPOSED",
        from: { key: "author" },
        to: { key: "proposal" },
        props: {
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
  params: [
    "proposalId",
    "title",
    "description",
    "minVotingPower",
    "startDate",
    "endDate",
  ],
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
      "proposal.minVotingPower": { $arg: "minVotingPower" },
      "proposal.startDate": { $arg: "startDate" },
      "proposal.endDate": { $arg: "endDate" },
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
          totalVotesCount: 0,

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
      /*
      {
        key: "votes",
        labels: ["Vote"],
        props: {
          proposalId: { $arg: "proposalId" },
          _owner: { $signer: true },
        },
      },
      */
    ],
    with: [
      "proposal",
      "choice",
      "user",
      /*
      {
        key: "votes",
        count: true,
        as: "votesCount",
      },
      */
    ],
    where: {
      $and: [
        /*
        {
          $or: [
            {
              $and: [
                {
                  "proposal.voteType": {
                    $eq: "SINGLE_CHOICE",
                  },
                },
                { votesCount: { $eq: 0 } },
              ],
            },
            {
              $and: [{ "proposal.voteType": { $eq: "MULTIPLE_CHOICE" } }],
            },
          ],
        },
        */
        {
          $and: [
            {
              "proposal.startDate": { $lte: { $timestamp: true } },
            },
            {
              "proposal.endDate": { $gte: { $timestamp: true } },
            },
            {
              "proposal.minVotingPower": {
                $lte: { $votingPower: { $signer: true } },
              },
            },
          ],
        },
      ],
    },
    merge: [
      {
        key: "vote",
        labels: ["Vote"],
        props: {
          proposalId: { $key: "proposal._id" },
          choiceId: { $key: "choice._id" },
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
          "choice.totalVotesCount": {
            $add: [
              {
                $coalesce: [
                  {
                    $key: "choice.totalVotesCount",
                  },
                  0, // default value
                ],
              },
              1,
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

const unvoteAll: MyobuDBEvent = {
  label: "Proposal",
  name: "unvoteAll",
  params: ["proposalId"],
  description: "Unvote all votes by the signer on a proposal",
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
        key: "vote",
        labels: ["Vote"],
        props: {
          proposalId: { $arg: "proposalId" },
          _owner: { $signer: true },
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
          labels: ["Choice"],
        },
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
    with: [
      "proposal",
      "vote",
      "user",
      "choice",
      { key: "vote.votingPower", sum: true, as: "totalVotingPower" },
    ],
    where: {
      $and: [
        {
          "proposal.startDate": { $lte: { $timestamp: true } },
        },
        {
          "proposal.endDate": { $gte: { $timestamp: true } },
        },
      ],
    },
    set: {
      "proposal.totalVotingPower": {
        $sub: [
          {
            $key: "proposal.totalVotingPower",
          },
          {
            $key: "totalVotingPower",
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
      "choice.totalVotesCount": {
        $sub: [
          {
            $coalesce: [{ $key: "choice.totalVotesCount" }, 1],
          },
          1,
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
  unvoteAll,
};

export default ProposalEvents;
