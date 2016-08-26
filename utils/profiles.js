/*******************************************************************************
 * Copyright (c) 2016 IBM Corp.
 *
 * All rights reserved. 
 *
 * Contributors:
 *   Justin E. Ervin - Initial implementation
 *******************************************************************************/

var crypto = require('crypto');
var encoding = require('./encoding');
var fs = require('fs');
var certsStorage = [];
var currChainId;
var currChain;
var profileDir;
var cacheEnrollment = false;
var defaultCustomUserProperties = {};
var profiles_creds = {
    host: '',
    port: '',
    username: '',
    password: '',
    database: '',
};
var db;

function setupConn() {
    console.log("[Profiles] Connecting to the database server...")
    var nano = require('nano')('https://' + profiles_creds.username + ':' + profiles_creds.password + '@' + profiles_creds.host + ':' + profiles_creds.port);	//lets use api key to make the docs
    nano.db.get(profiles_creds.database, function (geterr, getbody) {
        console.log(geterr);
        if (!geterr) {
            console.log("[Profiles] Ready. Found database");
            db = nano.use(profiles_creds.database);
        } else {
            console.log("[Profiles] Creating database...");
            nano.db.create(profiles_creds.database, function (createerr, createbody) {
                if (!createerr) {
                    console.log("[Profiles] Ready. Created database");
                    db = nano.use(profiles_creds.database);
                }
            });
        }
    });
}

/*
function ResetProfile() {
    // clean up the database we created previously
    nano.db.destroy(profiles_creds.database, function () {
        // create a new database
        nano.db.create(profiles_creds.database, function () {

        });
    });
}
*/

function checkLogin(checkVariable) {
    if (typeof checkVariable !== 'undefined') {
        if (!checkVariable || checkVariable == '') {
            console.log('[Profiles] No session is logged in');
            return false;
        }
    } else {
        console.log('[Profiles] No session is logged in');
        return false;
    }

    console.log("[Profiles] Session found: " + checkVariable);

    return true;
}

function createDBProfile(username, password, enrollmentPassword, customProperties, cb) {
    var NodeRSA = require('node-rsa');
    var key = new NodeRSA({ b: 512 });
    key.generateKeyPair();

    if (typeof username === 'undefined') {
        throw "username is undefined";
    }

    if (typeof password === 'undefined') {
        throw "password is undefined";
    }

    if (typeof enrollmentPassword === 'undefined') {
        throw "enrollmentPassword is undefined";
    }

    encoding.hashPassword(password, function (err, hashResult) {
        saveCerts(username, { username: username.trim(), password: hashResult.toString('hex'), publicKey: encoding.stringToHex(key.exportKey('pkcs8-public-pem')), privateKey: encoding.stringToHex(key.exportKey('pkcs8-private-pem')), tagMemberName: username.trim(), tagSecret: enrollmentPassword.trim(), customProperties: customProperties }, function (err) {
            console.log("[Profiles] Created new account with the database or file-based storage:" + username);
            if (cb) {
                cb(username, password, { public: encoding.stringToHex(key.exportKey('pkcs8-public-pem')), private: encoding.stringToHex(key.exportKey('pkcs8-private-pem')) }, false);
            }
        });
    });
}

function registerProfile(username, account, affiliation, userRoles, availableRoles, newUserAvailableRoles, customProperties, cb) {
    var requestRegister = {
        enrollmentID: username,
        account: account,
        affiliation: affiliation,
        roles: userRoles,
        registrar: {
            roles: availableRoles,
            delegateRoles: newUserAvailableRoles,
        },
    };

    if (typeof username === 'undefined') {
        throw "username is undefined";
    }

    if (typeof account === 'undefined') {
        throw "account is undefined";
    }

    if (typeof affiliation === 'undefined') {
        throw "affiliation is undefined";
    }

    currChain.getMember(username.trim(), function (errCA, memberCA) {
        var exists = false;

        if (typeof memberCA !== 'undefined') {
            exists = memberCA.isRegistered();
        }

        if (exists) {
            cb(username, "", { public: "", private: "" }, exists);
            return
        }

        currChain.register(requestRegister, function (err, enrollmentPassword) {
            if (!err) {
                console.log("[Profiles] Created new account with the sdk:" + username);
                createDBProfile(username, enrollmentPassword, enrollmentPassword, customProperties, cb);
            } else {
                console.log("[Profiles] Error: Creating new account with the sdk:" + username + " Reason:" + err);
                cb(username, "", { public: "", private: "" }, exists);
            }
        });
    });
}

function registerProfileWithPass(username, password, account, affiliation, userRoles, availableRoles, newUserAvailableRoles, customProperties, cb) {
    var requestRegister = {
        enrollmentID: username,
        account: account,
        affiliation: affiliation,
        roles: userRoles,
        registrar: {
            roles: availableRoles,
            delegateRoles: newUserAvailableRoles,
        },
    };

    if (typeof username === 'undefined') {
        throw "username is undefined";
    }

    if (typeof password === 'undefined') {
        throw "password is undefined";
    }

    if (typeof account === 'undefined') {
        throw "account is undefined";
    }

    if (typeof affiliation === 'undefined') {
        throw "affiliation is undefined";
    }

    currChain.getMember(username.trim(), function (errCA, memberCA) {
        var exists = false;

        if (typeof memberCA !== 'undefined') {
            exists = memberCA.isRegistered();
        }

        if (exists) {
            cb(username, "", { public: "", private: "" }, exists);
            return
        }

        currChain.register(requestRegister, function (err, enrollmentPassword) {
            if (!err) {
                console.log("[Profiles] Created new account with the sdk:" + username);
                createDBProfile(username, password, enrollmentPassword, customProperties, cb);
            } else {
                console.log("[Profiles] Error: Creating new account with the sdk:" + username + " Reason:" + err);
                cb(username, "", { public: "", private: "" }, exists);
            }
        });
    });
}

function registerProfileByUser(registrarUsername, username, password, account, affiliation, userRoles, availableRoles, newUserAvailableRoles, customProperties, cb) {
    var requestRegister = {
        enrollmentID: username,
        account: account,
        affiliation: affiliation,
        roles: userRoles,
        registrar: {
            roles: availableRoles,
            delegateRoles: newUserAvailableRoles,
        },
    };

    if (typeof username === 'undefined') {
        throw "username is undefined";
    }

    if (typeof account === 'undefined') {
        throw "account is undefined";
    }

    if (typeof affiliation === 'undefined') {
        throw "affiliation is undefined";
    }

    currChain.getMember(registrarUsername.trim(), function (errRegistrar, memberRegistrar) {
        if (!errRegistrar) {
            currChain.getMember(username.trim(), function (errCA, memberCA) {
                var exists = false;

                if (typeof memberCA !== 'undefined') {
                    exists = memberCA.isRegistered();
                }

                if (exists) {
                    cb(username, "", { public: "", private: "" }, exists);
                    return
                }

                currChain.getMemberServices().register(requestRegister, memberRegistrar, function (err, enrollmentPassword) {
                    if (!err) {
                        console.log("[Profiles] Created new account with the sdk:" + username);
                        createDBProfile(username, enrollmentPassword, enrollmentPassword, customProperties, cb);
                    } else {
                        console.log("[Profiles] Error: Creating new account with the sdk:" + username + " Reason:" + err);
                        cb(username, "", { public: "", private: "" }, exists);
                    }
                });
            });
        } else {
            console.log("[Profiles] Error: Creating new account with the sdk:" + username + " Reason:" + errRegistrar);
            cb(username, "", { public: "", private: "" }, false);
        }
    });
}

function registerProfileByUserWithPass(registrarUsername, username, password, account, affiliation, userRoles, availableRoles, newUserAvailableRoles, customProperties, cb) {
    var requestRegister = {
        enrollmentID: username,
        account: account,
        affiliation: affiliation,
        roles: userRoles,
        registrar: {
            roles: availableRoles,
            delegateRoles: newUserAvailableRoles,
        },
    };

    if (typeof username === 'undefined') {
        throw "username is undefined";
    }

    if (typeof password === 'undefined') {
        throw "password is undefined";
    }

    if (typeof account === 'undefined') {
        throw "account is undefined";
    }

    if (typeof affiliation === 'undefined') {
        throw "affiliation is undefined";
    }

    currChain.getMember(registrarUsername.trim(), function (errRegistrar, memberRegistrar) {
        if (!errRegistrar) {
            currChain.getMember(username.trim(), function (errCA, memberCA) {
                var exists = false;

                if (typeof memberCA !== 'undefined') {
                    exists = memberCA.isRegistered();
                }

                if (exists) {
                    cb(username, "", { public: "", private: "" }, exists);
                    return
                }

                currChain.getMemberServices().register(requestRegister, memberRegistrar, function (err, enrollmentPassword) {
                    if (!err) {
                        console.log("[Profiles] Created new account with the sdk:" + username);
                        createDBProfile(username, password, enrollmentPassword, customProperties, cb);
                    } else {
                        console.log("[Profiles] Error: Creating new account with the sdk:" + username + " Reason:" + err);
                        cb(username, "", { public: "", private: "" }, exists);
                    }
                });
            });
        } else {
            console.log("[Profiles] Error: Creating new account with the sdk:" + username + " Reason:" + errRegistrar);
            cb(username, "", { public: "", private: "" }, false);
        }
    });
}

function loginProfile(usernameFromReq, passwordFromReq, cb) {
    if (typeof usernameFromReq === 'undefined') {
        throw "username is undefined";
    }

    if (typeof passwordFromReq === 'undefined') {
        throw "password is undefined";
    }

    getEnrollmentInfo(usernameFromReq, function (loginData) {
        console.log("[Profiles] Checking login information...");
        if (typeof loginData !== 'undefined') {
            if (typeof loginData.username !== 'undefined' && typeof loginData.password !== 'undefined') {
                console.log("[Profiles] Logging in: " + loginData.username + "...");
                encoding.verifyPassword(passwordFromReq.trim(), new Buffer(loginData.password, 'hex'), function (err, valid) {
                    if (valid) {
                        console.log("[Profiles] Enrolling user: " + loginData.username + "...");
                        currChain.enroll(loginData.tagMemberName, loginData.tagSecret, function (err, member) {
                            if (typeof member !== 'undefined') {
                                console.log("[Profiles] Enrolled user: " + loginData.username);
                                cb(true, false, { username: member.getName(), password: loginData.password.trim(), keys: { public: loginData.publicKey, private: loginData.privateKey }, customProperties: loginData.customProperties }, member.isRegistered());
                            } else {
                                cb(false, false, null, member.isRegistered());
                            }
                        });
                    } else {
                        cb(false, false, null, true);
                    }
                });
            }
        } else {
            console.log("[Profiles] Checking if the user is enrolled...");
            currChain.getMember(usernameFromReq.trim(), function (errCA, memberCA) {
                if (errCA == null && memberCA) {
                    if (!memberCA.isEnrolled()) {
                        console.log("[Profiles] Enrolling user: " + memberCA.getName() + "...");
                        currChain.enroll(usernameFromReq.trim(), passwordFromReq.trim(), function (err, member) {
                            if (!err) {
                                if (typeof member !== 'undefined') {
                                    console.log("[Profiles] Enrolled user: " + member.getName());

                                    createDBProfile(member.getName(), passwordFromReq.trim(), passwordFromReq.trim(), defaultCustomUserProperties, function (profileUser, profilePass, profileKeys) {
                                        cb(true, true, { username: profileUser, password: profilePass, keys: profileKeys, customProperties: defaultCustomUserProperties }, true);
                                    });
                                } else {
                                    cb(false, true, null, true);
                                }
                            } else {
                                cb(false, true, null, true);
                            }
                        });
                    } else {
                        console.log("[Profiles] Error: User is already enrolled");
                        cb(false, true, null, true);
                    }
                } else {
                    console.log(errCA);
                    cb(false, true, null, false);
                }
            });
        }
    });
}

function loadsCerts(username, cb) {
    if (db) {
        get_user_doc(username, function (err, memberdoc) {
            if (err == null) {
                if (cacheEnrollment) {
                    pushEnrollmentInfo(memberdoc);
                    console.log("[Profiles] Number of certs loaded: " + certsStorage.length);
                }

                console.log("[Profiles] User found in the database: " + username);
                cb(memberdoc);
            } else {
                console.log("[Profiles] User not found in the database: " + username);
                cb(undefined);
            }
        });
    } else {
        var fs = require("fs");
        var content = fs.readFileSync(profileDir + username.trim() + ".json");

        if (encoding.isJsonString(content)) {
            var converted = JSON.parse(content);

            if (cacheEnrollment) {
                pushEnrollmentInfo(converted.certs);
                console.log("[Profiles] Number of certs loaded: " + certsStorage.length);
            }

            cb(converted.certs);
        } else {
            console.log("[Profiles] Error: failed to load certs");
            cb(undefined);
        }
    }
}

function saveCerts(username, object, cb) {
    if (db) {
        get_user_doc(username, function (currerr, currmemberdoc) {
            var memberdoc = object;
            memberdoc._id = username;

            if (currerr != null) {
                insert_doc(memberdoc, function (err, userdoc) {
                    if (err) {
                        console.log("[Profiles] ", err);
                    } else {
                        console.log("[Profiles] " + username + "`s certs file was saved!");
                    }

                    if (cb) {
                        cb(err);
                    }
                });
            } else {
                memberdoc._rev = currmemberdoc._rev;
                insert_doc(memberdoc, function (err, userdoc) {
                    if (err) {
                        console.log("[Profiles] ", err);
                    } else {
                        console.log("[Profiles] " + username + "`s certs file was saved!");
                    }

                    if (cb) {
                        cb(err);
                    }
                });
            }
        });
    } else {
        fs.writeFile(profileDir + username.trim() + ".json", JSON.stringify({ certs: object }), function (err) {
            if (cb) {
                cb("[Profiles] ", err);
            }
        });

        console.log("[Profiles] " + username + "`s certs file was saved!");
        if (cb) {
            cb(null);
        }
    }
}

function getEnrollmentInfo(username, ccb) {
    if (typeof username === 'undefined') {
        throw "username is undefined";
    }

    if (cacheEnrollment) {
        for (var i = 0; i < certsStorage.length; i++) {
            if (certsStorage[i].username == username.trim()) {
                console.log("[Profiles] User found in cache: " + username);
                ccb(certsStorage[i]);
                return;
            }
        }
    }

    if (db) {
        loadsCerts(username, function (userData) {
            ccb(userData);
        });
    } else {
        if (fs.existsSync(profileDir + username.trim() + ".json")) {
            console.log("[Profiles] User found on disk: " + username);
            loadsCerts(username, function (userData) {
                ccb(userData);
            });
        } else {
            console.log("[Profiles] User not found on disk: " + username);
            ccb(undefined);
        }
    }
}

function pushEnrollmentInfo(memberObject) {
    if (typeof memberObject === 'undefined') {
        throw "memberObject is undefined";
    }

    certsStorage.push(memberObject);
}

function setDefaultUserProperties(object) {
    if (typeof object === 'undefined') {
        throw "user properties is undefined";
    }

    defaultCustomUserProperties = object;
}

function signRequest(privateKey, args) {
    const sign = crypto.createSign('RSA-SHA256');
    var signString = "";

    for (i = 0; i < args.length; i++) {
        signString = signString + args[i].trim();
    }

    sign.update(signString);

    return sign.sign(privateKey).toString('hex');
}

function get_user_doc(username, cb) {
    db.get(username, { revs_info: true }, function (err, body) {		//doc_name, query parameters, callback
        if (cb) {
            if (!err && body) cb(null, body);
            else if (err && err.statusCode) cb(err.statusCode, { error: err.error, reason: err.reason });
            else cb(500, { error: err, reason: 'unknown!' });
        }
    });
}

function insert_doc(doc, cb) {
    db.insert(doc, function (err, body) {
        if (cb) {
            if (!err && body) {
                doc._rev = body.rev;
                cb(null, doc);
            }
            else if (err && err.statusCode) cb(err.statusCode, { error: err.error, reason: err.reason });
            else cb(500, { error: err, reason: 'unknown!' });
        }
    });
}

module.exports.config = function (chain, chainId, dir, credentials, useDatabase) {
    //do config
    currChain = chain;
    currChainId = chainId;

    if (profiles_creds == undefined || profiles_creds == {}) {
        useDatabase = false;
    }

    if (useDatabase) {
        console.log("[Profiles] Using a cloudant database");
        profiles_creds = {
            host: credentials.host,
            port: credentials.port,
            username: credentials.username,
            password: credentials.password,
            database: credentials.database,
        };

        setupConn();
    } else {
        console.log("[Profiles] Using a file-based database");
        profileDir = dir + '/';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }
};

module.exports.getEnrollmentInfo = getEnrollmentInfo;
module.exports.setDefaultUserProperties = setDefaultUserProperties;
module.exports.createDBProfile = createDBProfile;
module.exports.registerProfile = registerProfile;
module.exports.registerProfileWithPass = registerProfileWithPass;
module.exports.registerProfileByUser = registerProfileByUser;
module.exports.registerProfileByUserWithPass = registerProfileByUserWithPass;
module.exports.signRequest = signRequest;
module.exports.checkLogin = checkLogin;
module.exports.loginProfile = loginProfile;