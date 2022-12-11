import { MyobuDBEvent } from "./types";
declare const RealmEvents: {
    publishNote: MyobuDBEvent;
    deleteNote: MyobuDBEvent;
    updateNote: MyobuDBEvent;
    makeComment: MyobuDBEvent;
    makeNoteComment: MyobuDBEvent;
    addTagToNote: MyobuDBEvent;
    deleteTagFromNote: MyobuDBEvent;
    makeProposalComment: MyobuDBEvent;
};
export default RealmEvents;
