import { MyobuDBEvent } from "./types";
declare const MNSEvents: {
    upsert: MyobuDBEvent;
    follows: MyobuDBEvent;
    unfollows: MyobuDBEvent;
};
export default MNSEvents;
