import { MyobuDBEvent, MyobuDBPropValue } from "./types";

const upsert = (() => {
  const setProfile: { [key: string]: MyobuDBPropValue } = {
    "user.name": { $get: [{ $arg: "profile" }, "name"] },
    "user.displayName": { $get: [{ $arg: "profile" }, "displayName"] },
    "user.email": { $get: [{ $arg: "profile" }, "email"] },
    "user.avatar": { $get: [{ $arg: "profile" }, "avatar"] },
    "user.wallpaper": { $get: [{ $arg: "profile" }, "wallpaper"] },
    "user.description": { $get: [{ $arg: "profile" }, "description"] },

    // Social medias
    "user.url": { $get: [{ $arg: "profile" }, "url"] },
    "user.twitter": { $get: [{ $arg: "profile" }, "twitter"] },
    "user.discord": { $get: [{ $arg: "profile" }, "discord"] },
    "user.github": { $get: [{ $arg: "profile" }, "github"] },
    "user.telegram": { $get: [{ $arg: "profile" }, "telegram"] },
    "user.reddit": { $get: [{ $arg: "profile" }, "reddit"] },
    "user.youtube": { $get: [{ $arg: "profile" }, "youtube"] },
    "user.instagram": { $get: [{ $arg: "profile" }, "instagram"] },
    "user.facebook": { $get: [{ $arg: "profile" }, "facebook"] },
    "user.tiktok": { $get: [{ $arg: "profile" }, "tiktok"] },
    "user.twitch": { $get: [{ $arg: "profile" }, "twitch"] },
    "user.linkedin": { $get: [{ $arg: "profile" }, "linkedin"] },

    // Wallet addresses
    "user.eth": { $get: [{ $arg: "profile" }, "eth"] },
    "user.btc": { $get: [{ $arg: "profile" }, "btc"] },
  };

  const evt: MyobuDBEvent = {
    label: "MNS",
    name: "upsert",
    description: "Upsert MNS profile",
    params: ["profile"],
    db: {
      merge: [
        {
          key: "user",
          labels: ["MNS"],
          props: { _owner: { $signer: true } },
          onCreate: {
            "user._owner": { $signer: true },
            "user._createdAt": { $timestamp: true },
            "user._updatedAt": { $timestamp: true },
            ...setProfile,
          },
          onMatch: {
            "user._updatedAt": { $timestamp: true },
            ...setProfile,
          },
        },
      ],
      return: ["user"],
    },
  };

  return evt;
})();

const follows: MyobuDBEvent = {
  label: "MNS",
  name: "follows",
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
        props: {
          _owner: { $signer: true },
          _createdAt: { $timestamp: true },
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
  label: "MNS",
  name: "unfollows",
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
        props: {
          _owner: { $signer: true },
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
  upsert,
  follows,
  unfollows,
};

export default MNSEvents;
