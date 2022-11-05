(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('ethers'), require('socket.io-client')) :
    typeof define === 'function' && define.amd ? define(['exports', 'ethers', 'socket.io-client'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Korona = {}, global.ethers, global.socket_ioClient));
})(this, (function (exports, ethers, socket_ioClient) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function appendPrefixToObjectKeys(obj, prefix) {
        var newObj = {};
        for (var key in obj) {
            newObj["".concat(prefix).concat(key)] = obj[key];
        }
        return newObj;
    }
    var MyobuProtocolClient = /** @class */ (function () {
        function MyobuProtocolClient(_a) {
            var signer = _a.signer, server = _a.server, expiresIn = _a.expiresIn;
            server = server || "https://protocol.myobu.io";
            expiresIn = expiresIn || 1000 * 60 * 60; // 1 hour
            this.signer = signer;
            this.server = server;
            this.expiresIn = expiresIn;
        }
        /**
         * Generate the JWT for `address`
         * @param address
         */
        MyobuProtocolClient.prototype.generateJWT = function () {
            return __awaiter(this, void 0, void 0, function () {
                var address, jwt_1, exp, payload, message, signature, jwt;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.signer) {
                                throw new Error("No signer set. Please connect wallet first.");
                            }
                            return [4 /*yield*/, this.signer.getAddress()];
                        case 1:
                            address = _b.sent();
                            if (localStorage && localStorage.getItem("myobu-protocol/jwt/".concat(address))) {
                                jwt_1 = JSON.parse(localStorage.getItem("myobu-protocol/jwt/".concat(address)) || "{}");
                                // Check if the JWT is still valid
                                if (jwt_1.signature &&
                                    jwt_1.payload &&
                                    Date.now() < jwt_1.payload.exp &&
                                    jwt_1.payload.iss === address &&
                                    ethers.ethers.utils.verifyMessage((jwt_1.message || "") + JSON.stringify(jwt_1.payload), jwt_1.signature) === address) {
                                    return [2 /*return*/, jwt_1];
                                }
                            }
                            exp = Date.now() + this.expiresIn;
                            _a = {};
                            return [4 /*yield*/, this.signer.getAddress()];
                        case 2:
                            payload = (_a.iss = _b.sent(),
                                _a.exp = exp,
                                _a);
                            message = "Greetings from Myobu Protocol!\n\nSign this message to prove that you are the owner of the address ".concat(payload.iss, ".\nThis signature will not cost you any fees.  \nThis signature will expire at ").concat(new Date(exp).toLocaleString(), "\n\nJWT:");
                            signature = "";
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, this.signer.signMessage(message + JSON.stringify(payload))];
                        case 4:
                            signature = _b.sent();
                            return [3 /*break*/, 6];
                        case 5:
                            _b.sent();
                            throw new Error("Failed to sign JWT to authenticate the Myobu Protocol database request");
                        case 6:
                            jwt = {
                                message: message,
                                payload: payload,
                                signature: signature,
                            };
                            // Save to localStorage
                            if (localStorage) {
                                localStorage.setItem("myobu-protocol/jwt/".concat(address), JSON.stringify(jwt));
                            }
                            return [2 /*return*/, jwt];
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.db = function (request) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, res, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!(request.create ||
                                request.merge ||
                                request.set ||
                                request.delete ||
                                request.detachDelete ||
                                request.createConstraints ||
                                request.dropConstraints)) return [3 /*break*/, 2];
                            _a = request;
                            return [4 /*yield*/, this.generateJWT()];
                        case 1:
                            _a.jwt = _c.sent();
                            _c.label = 2;
                        case 2: return [4 /*yield*/, fetch("".concat(this.server, "/db"), {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(request),
                            })];
                        case 3:
                            res = _c.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 5];
                            return [4 /*yield*/, res.json()];
                        case 4: return [2 /*return*/, _c.sent()];
                        case 5:
                            _b = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 6: throw new (_b.apply(Error, [void 0, _c.sent()]))();
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.uploadImages = function (files) {
            return __awaiter(this, void 0, void 0, function () {
                var jwt, formData, files_1, files_1_1, file, res, _a;
                var e_1, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!this.signer) {
                                throw new Error("No signer set. Please connect wallet first.");
                            }
                            return [4 /*yield*/, this.generateJWT()];
                        case 1:
                            jwt = _c.sent();
                            formData = new FormData();
                            try {
                                for (files_1 = __values(files), files_1_1 = files_1.next(); !files_1_1.done; files_1_1 = files_1.next()) {
                                    file = files_1_1.value;
                                    formData.append("file[]", file);
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (files_1_1 && !files_1_1.done && (_b = files_1.return)) _b.call(files_1);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                            formData.append("jwt", JSON.stringify(jwt));
                            return [4 /*yield*/, fetch("".concat(this.server, "/image"), {
                                    method: "POST",
                                    body: formData,
                                })];
                        case 2:
                            res = _c.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 4];
                            return [4 /*yield*/, res.json()];
                        case 3: return [2 /*return*/, _c.sent()];
                        case 4:
                            _a = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 5: throw new (_a.apply(Error, [void 0, _c.sent()]))();
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.setExpiresIn = function (expiresIn) {
            this.expiresIn = expiresIn;
        };
        // TODO: should we allow this? as setting signer might cause the JWT to be invalid and introduce bugs like for pubsub
        MyobuProtocolClient.prototype.setSigner = function (signer) {
            this.signer = signer;
        };
        /**
         * Subscribing and emitting messages require JWT to be set
         * Unsubscribing adn listening to events do not require JWT
         * @param roomName
         * @param callback
         * @returns
         */
        MyobuProtocolClient.prototype.subscribe = function (roomName, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var socket, jwt;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.signer) {
                                throw new Error("No signer set. Please connect wallet first.");
                            }
                            if (!this.socket) {
                                socket = socket_ioClient.io(this.server);
                                this.socket = socket;
                            }
                            return [4 /*yield*/, this.generateJWT()];
                        case 1:
                            jwt = _a.sent();
                            this.socket.emit("subscribe", roomName, jwt);
                            this.socket.on("message", callback);
                            return [2 /*return*/, {
                                    unsubscribe: function () {
                                        _this.socket.emit("unsubscribe", roomName);
                                    },
                                    publish: function (data) { return __awaiter(_this, void 0, void 0, function () {
                                        var jwt;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, this.generateJWT()];
                                                case 1:
                                                    jwt = _a.sent();
                                                    this.socket.emit("message", roomName, jwt, data);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); },
                                }];
                    }
                });
            });
        };
        return MyobuProtocolClient;
    }());

    exports.appendPrefixToObjectKeys = appendPrefixToObjectKeys;
    exports["default"] = MyobuProtocolClient;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
