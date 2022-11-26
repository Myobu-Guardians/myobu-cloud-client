import { MyobuDBLabelTrigger } from "./types";

async function main() {
  // User ownes the node `Proposal` and `Choices`
  // We own the `Proposal` -> `Choices` relationship

  const addProposalChoiceTrigger: MyobuDBLabelTrigger = {
    label: "Proposal",
    name: "addProposalChoice",
    args: ["proposalId", "choiceId"],
    description: "Add a choice to a proposal",
    db: {
      match: [
        {
          key: "proposal",
          labels: ["Proposal"],
          props: { _id: { $arg: "proposalId" }, _type: "SINGLE_CHOICE" },
        },
        {
          key: "choice",
          labels: ["Choice"],
          props: { _id: { $arg: "choiceId" } },
        },
      ],
      merge: [
        {
          key: "r", // The `_owner` of the relationship is the `#Proposal`
          labels: ["HAS_CHOICE"],
          from: {
            key: "proposal",
          },
          to: {
            key: "choice",
          },
          onMatch: {},
          onCreate: {
            "proposal._votingPower": {
              $add: [
                {
                  $coalesce: [
                    {
                      $prop: "proposal._votingPower",
                    },
                    0,
                  ],
                },
                {
                  $coalesce: [
                    {
                      $prop: "choice._votingPower",
                    },
                    0,
                  ],
                },
              ],
            },
          },
        },
      ],
    },
  };

  const voteSingleChoiceTrigger: MyobuDBLabelTrigger = {
    label: "Proposal",
    name: "voteSingleChoiceProposal",
    args: ["proposalId", "choiceId"],
    description: "User votes for a proposal choice",
    db: {
      match: [
        {
          key: "r",
          type: "HAS_CHOICES",
          from: {
            key: "proposal",
            labels: ["Proposal"],
            props: { _id: { $arg: "proposalId" }, _type: "SINGLE_CHOICE" },
          },
          to: {
            key: "choice",
            labels: ["Choice"],
            props: { _id: { $arg: "choiceId" } },
          },
        },
        {
          key: "user",
          labels: ["MNS"],
          props: { _owner: { $signer: true } },
        },
      ],
      merge: [
        {
          key: "r2",
          type: "VOTES",
          from: {
            key: "user",
          },
          to: {
            key: "choice",
          },
          onMatch: {},
          onCreate: {
            "proposal._votingPower": {
              $coalesce: [
                {
                  $add: [
                    { $prop: "proposal._votingPower" },
                    { $votingPower: "$signer" },
                  ],
                },
                { $votingPower: "$signer" },
              ],
            },
            "choice._votingPower": {
              $coalesce: [
                {
                  $add: [
                    { $prop: "choice._votingPower" },
                    { $votingPower: "$signer" },
                  ],
                },
                { $votingPower: "$signer" },
              ],
            },
          },
        },
      ],
    },
  };
}
