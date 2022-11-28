import { MyobuDBEvent } from "./types";

const follows: MyobuDBEvent = {
  name: "follows",
  label: "MNS",
  description: "User follows another user",
  params: ["followeeId"],
  db: {
    match: [
      {
        key: "user",
        labels: ["MNS"],
        props: {
          _owner: { $signer: true }, // $signer here means the address who calls the event
        },
      },
      {
        key: "followee",
        labels: ["MNS"],
        props: {
          _owner: { $arg: "followeeId" }, // We use $arg to get the argument passed to the event
        },
      },
    ],
    merge: [
      {
        key: "r",
        type: "FOLLOWS",
        from: {
          key: "user",
        },
        to: {
          key: "followee",
        },
      },
    ],
    set: {
      // The `owner` can set properties with the name that starts with `_`, unlike the normal user.
      "user._followings": {
        $coalesce: [
          {
            $add: [{ $key: "user._followings" }, 1],
          },
          1, //
        ],
      },
      "followee._followers": {
        $coalesce: [
          {
            $add: [{ $key: "followee._followers" }, 1],
          },
          1,
        ],
      },
    },
  },
};

const unfollows: MyobuDBEvent = {
  name: "unfollows",
  label: "MNS",
  description: "User unfollows another user",
  params: ["followeeId"],
  db: {
    match: [
      {
        key: "user",
        labels: ["MNS"],
        props: {
          _owner: { $signer: true }, // $signer here means the address who calls the event
        },
      },
      {
        key: "followee",
        labels: ["MNS"],
        props: {
          _owner: { $arg: "followeeId" }, // We use $arg to get the argument passed to the event
        },
      },
      {
        key: "r",
        type: "FOLLOWS",
        from: {
          key: "user",
        },
        to: {
          key: "followee",
        },
      },
    ],
    set: {
      "user._followings": {
        $coalesce: [
          {
            $sub: [{ $key: "user._followings" }, 1],
          },
          0, //
        ],
      },
      "followee._followers": {
        $coalesce: [
          {
            $sub: [{ $key: "followee._followers" }, 1],
          },
          0,
        ],
      },
    },
    delete: ["r"],
  },
};

const MNSEvents = {
  follows,
};

export default MNSEvents;
