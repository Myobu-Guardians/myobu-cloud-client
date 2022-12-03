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

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

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

    /**
     * We only support a-z and number for now, all lowercase
     * @param name
     */
    function isMNSNameValid(name) {
        return /^[a-z0-9]+$/.test(name);
    }

    exports.MyobuDBOrder = void 0;
    (function (MyobuDBOrder) {
        MyobuDBOrder["ASC"] = "ASC";
        MyobuDBOrder["DESC"] = "DESC";
    })(exports.MyobuDBOrder || (exports.MyobuDBOrder = {}));
    function isMyobuDBLabelSchema(obj) {
        return (typeof obj === "object" &&
            obj !== null &&
            typeof obj.label === "string" &&
            typeof obj.properties === "object" &&
            obj.schema !== null);
    }
    function isMyobuDBLabelACL(obj) {
        return (typeof obj === "object" &&
            obj !== null &&
            typeof obj.label === "string" &&
            typeof obj.node === "object" &&
            obj.node !== null &&
            typeof obj.node.write === "object");
    }
    function isMyobuDBLabelConstraints(obj) {
        return (typeof obj === "object" &&
            obj !== null &&
            typeof obj.label === "string" &&
            Array.isArray(obj.unique));
    }
    exports.MyobuDBProposalVoteType = void 0;
    (function (MyobuDBProposalVoteType) {
        MyobuDBProposalVoteType["SINGLE_CHOICE"] = "SINGLE_CHOICE";
        MyobuDBProposalVoteType["MULTIPLE_CHOICE"] = "MULTIPLE_CHOICE";
    })(exports.MyobuDBProposalVoteType || (exports.MyobuDBProposalVoteType = {}));

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
        MyobuProtocolClient.prototype.queryDB = function (request) {
            return __awaiter(this, void 0, void 0, function () {
                var res, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(this.server, "/db"), {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(request),
                            })];
                        case 1:
                            res = _b.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 3];
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _b.sent()];
                        case 3:
                            _a = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 4: throw new (_a.apply(Error, [void 0, _b.sent()]))();
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.applyDBEvent = function (label, eventName, eventArgs) {
            return __awaiter(this, void 0, void 0, function () {
                var jwt, request, res, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.signer) {
                                throw new Error("No signer set. Please connect wallet first.");
                            }
                            return [4 /*yield*/, this.generateJWT()];
                        case 1:
                            jwt = _b.sent();
                            request = {
                                jwt: jwt,
                                label: label,
                                eventName: eventName,
                                eventArgs: eventArgs,
                            };
                            return [4 /*yield*/, fetch("".concat(this.server, "/db/apply-event"), {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(request),
                                })];
                        case 2:
                            res = _b.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 4];
                            return [4 /*yield*/, res.json()];
                        case 3: return [2 /*return*/, _b.sent()];
                        case 4:
                            _a = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 5: throw new (_a.apply(Error, [void 0, _b.sent()]))();
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.createDBEvent = function (event) {
            return __awaiter(this, void 0, void 0, function () {
                var jwt, request, res, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.signer) {
                                throw new Error("No signer set. Please connect wallet first.");
                            }
                            return [4 /*yield*/, this.generateJWT()];
                        case 1:
                            jwt = _b.sent();
                            request = {
                                jwt: jwt,
                                event: event,
                            };
                            return [4 /*yield*/, fetch("".concat(this.server, "/db-events"), {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(request),
                                })];
                        case 2:
                            res = _b.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 4];
                            return [4 /*yield*/, res.json()];
                        case 3: return [2 /*return*/, _b.sent()];
                        case 4:
                            _a = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 5: throw new (_a.apply(Error, [void 0, _b.sent()]))();
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.deleteDBEvent = function (label, eventName) {
            return __awaiter(this, void 0, void 0, function () {
                var jwt, request, res, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.signer) {
                                throw new Error("No signer set. Please connect wallet first.");
                            }
                            return [4 /*yield*/, this.generateJWT()];
                        case 1:
                            jwt = _b.sent();
                            request = {
                                jwt: jwt,
                                event: {
                                    label: label,
                                    name: eventName,
                                    db: {},
                                    params: [],
                                },
                                delete: true,
                            };
                            return [4 /*yield*/, fetch("".concat(this.server, "/db-events"), {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(request),
                                })];
                        case 2:
                            res = _b.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 4];
                            return [4 /*yield*/, res.json()];
                        case 3: return [2 /*return*/, _b.sent()];
                        case 4:
                            _a = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 5: throw new (_a.apply(Error, [void 0, _b.sent()]))();
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.getDBEvents = function (label) {
            return __awaiter(this, void 0, void 0, function () {
                var res, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(this.server, "/db-events/").concat(label))];
                        case 1:
                            res = _b.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 3];
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _b.sent()];
                        case 3:
                            _a = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 4: throw new (_a.apply(Error, [void 0, _b.sent()]))();
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
        MyobuProtocolClient.prototype.setLabelSchema = function (schema) {
            return __awaiter(this, void 0, void 0, function () {
                var jwt, request, res, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.signer) {
                                throw new Error("No signer set. Please connect wallet first.");
                            }
                            return [4 /*yield*/, this.generateJWT()];
                        case 1:
                            jwt = _b.sent();
                            request = {
                                jwt: jwt,
                                schema: schema,
                            };
                            return [4 /*yield*/, fetch("".concat(this.server, "/label-schema"), {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(request),
                                })];
                        case 2:
                            res = _b.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 4];
                            return [4 /*yield*/, res.json()];
                        case 3: return [2 /*return*/, _b.sent()];
                        case 4:
                            _a = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 5: throw new (_a.apply(Error, [void 0, _b.sent()]))();
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.getLabelSchema = function (label) {
            return __awaiter(this, void 0, void 0, function () {
                var res, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(this.server, "/label-schema/").concat(label))];
                        case 1:
                            res = _b.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 3];
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _b.sent()];
                        case 3:
                            _a = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 4: throw new (_a.apply(Error, [void 0, _b.sent()]))();
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.deleteLabelSchema = function (label) {
            return __awaiter(this, void 0, void 0, function () {
                var jwt, request, res, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.signer) {
                                throw new Error("No signer set. Please connect wallet first.");
                            }
                            return [4 /*yield*/, this.generateJWT()];
                        case 1:
                            jwt = _b.sent();
                            request = {
                                jwt: jwt,
                                schema: {
                                    label: label,
                                    properties: {},
                                },
                                delete: true,
                            };
                            return [4 /*yield*/, fetch("".concat(this.server, "/label-schema"), {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(request),
                                })];
                        case 2:
                            res = _b.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 4];
                            return [4 /*yield*/, res.json()];
                        case 3: return [2 /*return*/, _b.sent()];
                        case 4:
                            _a = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 5: throw new (_a.apply(Error, [void 0, _b.sent()]))();
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.createLabelConstraints = function (constraints) {
            return __awaiter(this, void 0, void 0, function () {
                var jwt, request, res, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.signer) {
                                throw new Error("No signer set. Please connect wallet first.");
                            }
                            return [4 /*yield*/, this.generateJWT()];
                        case 1:
                            jwt = _b.sent();
                            request = {
                                jwt: jwt,
                                constraints: constraints,
                            };
                            return [4 /*yield*/, fetch("".concat(this.server, "/label-constraints"), {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(request),
                                })];
                        case 2:
                            res = _b.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 4];
                            return [4 /*yield*/, res.json()];
                        case 3: return [2 /*return*/, _b.sent()];
                        case 4:
                            _a = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 5: throw new (_a.apply(Error, [void 0, _b.sent()]))();
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.deleteLabelConstraints = function (constraintNames) {
            return __awaiter(this, void 0, void 0, function () {
                var jwt, request, res, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.signer) {
                                throw new Error("No signer set. Please connect wallet first.");
                            }
                            return [4 /*yield*/, this.generateJWT()];
                        case 1:
                            jwt = _b.sent();
                            request = {
                                jwt: jwt,
                                constraintNames: constraintNames,
                            };
                            return [4 /*yield*/, fetch("".concat(this.server, "/label-constraints"), {
                                    method: "DELETE",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(request),
                                })];
                        case 2:
                            res = _b.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 4];
                            return [4 /*yield*/, res.json()];
                        case 3: return [2 /*return*/, _b.sent()];
                        case 4:
                            _a = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 5: throw new (_a.apply(Error, [void 0, _b.sent()]))();
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.listLabelConstraints = function (label) {
            return __awaiter(this, void 0, void 0, function () {
                var res, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(this.server, "/label-constraints/").concat(label))];
                        case 1:
                            res = _b.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 3];
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _b.sent()];
                        case 3:
                            _a = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 4: throw new (_a.apply(Error, [void 0, _b.sent()]))();
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.setLabelACL = function (acl) {
            return __awaiter(this, void 0, void 0, function () {
                var jwt, request, res, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.signer) {
                                throw new Error("No signer set. Please connect wallet first.");
                            }
                            return [4 /*yield*/, this.generateJWT()];
                        case 1:
                            jwt = _b.sent();
                            request = {
                                jwt: jwt,
                                acl: acl,
                            };
                            return [4 /*yield*/, fetch("".concat(this.server, "/label-acl"), {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(request),
                                })];
                        case 2:
                            res = _b.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 4];
                            return [4 /*yield*/, res.json()];
                        case 3: return [2 /*return*/, _b.sent()];
                        case 4:
                            _a = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 5: throw new (_a.apply(Error, [void 0, _b.sent()]))();
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.getLabelACL = function (label) {
            return __awaiter(this, void 0, void 0, function () {
                var res, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(this.server, "/label-acl/").concat(label))];
                        case 1:
                            res = _b.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 3];
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _b.sent()];
                        case 3:
                            _a = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 4: throw new (_a.apply(Error, [void 0, _b.sent()]))();
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.deleteLabelACL = function (label) {
            return __awaiter(this, void 0, void 0, function () {
                var jwt, request, res, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.signer) {
                                throw new Error("No signer set. Please connect wallet first.");
                            }
                            return [4 /*yield*/, this.generateJWT()];
                        case 1:
                            jwt = _b.sent();
                            request = {
                                jwt: jwt,
                                acl: {
                                    label: label,
                                    node: {
                                        write: {},
                                    },
                                },
                                delete: true,
                            };
                            return [4 /*yield*/, fetch("".concat(this.server, "/label-acl"), {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(request),
                                })];
                        case 2:
                            res = _b.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 4];
                            return [4 /*yield*/, res.json()];
                        case 3: return [2 /*return*/, _b.sent()];
                        case 4:
                            _a = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 5: throw new (_a.apply(Error, [void 0, _b.sent()]))();
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.getBalance = function (walletAddress) {
            return __awaiter(this, void 0, void 0, function () {
                var res, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(this.server, "/balance/").concat(walletAddress))];
                        case 1:
                            res = _c.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 3];
                            _a = parseInt;
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.apply(void 0, [_c.sent()])];
                        case 3:
                            _b = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 4: throw new (_b.apply(Error, [void 0, _c.sent()]))();
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.getVotingPower = function (walletAddress) {
            return __awaiter(this, void 0, void 0, function () {
                var res, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(this.server, "/voting-power/").concat(walletAddress))];
                        case 1:
                            res = _c.sent();
                            if (!(res.status === 200)) return [3 /*break*/, 3];
                            _a = parseInt;
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.apply(void 0, [_c.sent()])];
                        case 3:
                            _b = Error.bind;
                            return [4 /*yield*/, res.text()];
                        case 4: throw new (_b.apply(Error, [void 0, _c.sent()]))();
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.upsertMNS = function (profile) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!isMNSNameValid(profile.name)) {
                                throw new Error("Name ".concat(profile.name, " is not valid"));
                            }
                            return [4 /*yield*/, this.applyDBEvent("MNS", "upsert", {
                                    profile: { $object: profile },
                                })];
                        case 1:
                            result = _a.sent();
                            if (result.length === 0) {
                                throw new Error("Failed to upsert MNS");
                            }
                            else {
                                return [2 /*return*/, result[0]["user"]["props"]];
                            }
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.getMNS = function (addressOrName) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (addressOrName.endsWith(".m")) {
                                addressOrName = addressOrName.slice(0, -2);
                            }
                            return [4 /*yield*/, this.queryDB({
                                    match: [
                                        {
                                            key: "mns",
                                            labels: ["MNS"],
                                            props: __assign({}, (addressOrName.startsWith("0x")
                                                ? { _owner: addressOrName }
                                                : { name: addressOrName })),
                                        },
                                    ],
                                    return: ["mns"],
                                })];
                        case 1:
                            result = _a.sent();
                            if (result.length === 0) {
                                return [2 /*return*/, undefined];
                            }
                            else {
                                return [2 /*return*/, result[0]["mns"]["props"]];
                            }
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.createProposal = function (proposal) {
            return __awaiter(this, void 0, void 0, function () {
                var result, createdProposal, i, choice, addedChoice;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.applyDBEvent("Proposal", "createProposal", {
                                title: proposal.title,
                                description: proposal.description,
                                voteType: proposal.voteType,
                                minVotingPower: proposal.minVotingPower,
                                startDate: proposal.startDate,
                                endDate: proposal.endDate,
                            })];
                        case 1:
                            result = _a.sent();
                            if (result.length === 0) {
                                throw new Error("Failed to create proposal");
                            }
                            createdProposal = result[0]["proposal"]["props"];
                            createdProposal.choices = [];
                            i = 0;
                            _a.label = 2;
                        case 2:
                            if (!(i < proposal.choices.length)) return [3 /*break*/, 5];
                            choice = proposal.choices[i];
                            return [4 /*yield*/, this.addProposalChoice(createdProposal._id || "", choice.description)];
                        case 3:
                            addedChoice = _a.sent();
                            createdProposal.choices.push(addedChoice);
                            _a.label = 4;
                        case 4:
                            i++;
                            return [3 /*break*/, 2];
                        case 5: return [2 /*return*/, createdProposal];
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.addProposalChoice = function (proposalId, choiceDescription) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.applyDBEvent("Proposal", "addChoice", {
                                proposalId: proposalId,
                                choiceDescription: choiceDescription,
                            })];
                        case 1:
                            result = _a.sent();
                            if (result.length === 0) {
                                throw new Error("Failed to add choice");
                            }
                            return [2 /*return*/, result[0]["choice"]["props"]];
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.updateProposal = function (proposalId, _a) {
            var title = _a.title, description = _a.description, minVotingPower = _a.minVotingPower, startDate = _a.startDate, endDate = _a.endDate;
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.applyDBEvent("Proposal", "updateProposal", {
                                proposalId: proposalId,
                                title: title,
                                description: description,
                                minVotingPower: minVotingPower,
                                startDate: startDate,
                                endDate: endDate,
                            })];
                        case 1:
                            result = _b.sent();
                            if (result.length === 0) {
                                throw new Error("Failed to update proposal");
                            }
                            return [4 /*yield*/, this.getProposal(proposalId)];
                        case 2: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.getProposal = function (proposalId) {
            return __awaiter(this, void 0, void 0, function () {
                var result, proposal, choicesResult;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.queryDB({
                                match: [
                                    {
                                        key: "proposal",
                                        labels: ["Proposal"],
                                        props: {
                                            _id: proposalId,
                                        },
                                    },
                                ],
                                return: ["proposal"],
                            })];
                        case 1:
                            result = _a.sent();
                            if (!(result.length === 0)) return [3 /*break*/, 2];
                            return [2 /*return*/, undefined];
                        case 2:
                            proposal = result[0]["proposal"]["props"];
                            return [4 /*yield*/, this.queryDB({
                                    match: [
                                        {
                                            key: "proposal",
                                            labels: ["Proposal"],
                                            props: {
                                                _id: proposalId,
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
                                    ],
                                    return: ["choice"],
                                })];
                        case 3:
                            choicesResult = _a.sent();
                            proposal.choices = ((choicesResult || []).map(function (r) { return r["choice"]["props"]; }) || []);
                            return [2 /*return*/, proposal];
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.vote = function (proposalId, choiceId) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.applyDBEvent("Proposal", "vote", {
                                proposalId: proposalId,
                                choiceId: choiceId,
                            })];
                        case 1:
                            result = _a.sent();
                            if (result.length === 0) {
                                throw new Error("Failed to vote");
                            }
                            else {
                                return [2 /*return*/, result[0]["proposal"]["props"]];
                            }
                    }
                });
            });
        };
        MyobuProtocolClient.prototype.unvote = function (proposalId, choiceId) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.applyDBEvent("Proposal", "unvote", {
                                proposalId: proposalId,
                                choiceId: choiceId,
                            })];
                        case 1:
                            result = _a.sent();
                            if (result.length === 0) {
                                throw new Error("Failed to unvote");
                            }
                            else {
                                return [2 /*return*/, result[0]["proposal"]["props"]];
                            }
                    }
                });
            });
        };
        return MyobuProtocolClient;
    }());

    exports.appendPrefixToObjectKeys = appendPrefixToObjectKeys;
    exports["default"] = MyobuProtocolClient;
    exports.isMNSNameValid = isMNSNameValid;
    exports.isMyobuDBLabelACL = isMyobuDBLabelACL;
    exports.isMyobuDBLabelConstraints = isMyobuDBLabelConstraints;
    exports.isMyobuDBLabelSchema = isMyobuDBLabelSchema;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
