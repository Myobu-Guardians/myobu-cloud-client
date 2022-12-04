import { MyobuDBEvent } from "./types";
declare const ProposalEvents: {
    createProposal: MyobuDBEvent;
    updateProposal: MyobuDBEvent;
    addProposalChoice: MyobuDBEvent;
    vote: MyobuDBEvent;
    unvoteAll: MyobuDBEvent;
};
export default ProposalEvents;
