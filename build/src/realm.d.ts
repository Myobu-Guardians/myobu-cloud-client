import { MyobuDBEvent } from "./types";
declare const RealmEvents: {
    publishNote: MyobuDBEvent;
    deleteNote: MyobuDBEvent;
    updateNote: MyobuDBEvent;
    makeComment: MyobuDBEvent;
    addTagToNote: MyobuDBEvent;
    deleteTagFromNote: MyobuDBEvent;
};
export default RealmEvents;
