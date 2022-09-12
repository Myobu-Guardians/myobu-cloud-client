(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Korona = factory());
})(this, (function () { 'use strict';

    var MyobuCloudClient = /** @class */ (function () {
        function MyobuCloudClient(_a) {
            var signer = _a.signer, cloudServer = _a.cloudServer, expiresIn = _a.expiresIn;
            cloudServer = cloudServer || "http://cloud.myobu.io";
            expiresIn = expiresIn || 1000 * 60 * 60; // 1 hour
            this.signer = signer;
            this.cloudServer = cloudServer;
            this.expiresIn = expiresIn;
        }
        return MyobuCloudClient;
    }());

    return MyobuCloudClient;

}));
