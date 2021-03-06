function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }

  return true;
}

module.exports.isJsonString = isJsonString;

function stringToHex(tmp) {
  var str = '',
    i = 0,
    tmp_len = tmp.length,
    c,
    f;

  for (; i < tmp_len; i += 1) {
    c = tmp.charCodeAt(i);
    f = d2h(c);

    if (f.length == 1) {
      str += '0' + f + ' ';
    } else {
      str += f + ' ';
    }
  }
  return str;
}

module.exports.stringToHex = stringToHex;

function d2h(d) {
  return d.toString(16);
}

function h2d(h) {
  return parseInt(h, 16);
}

function hexToString(tmp) {
  var arr = tmp.split(' '),
    str = '',
    i = 0,
    arr_len = arr.length,
    c;

  for (; i < arr_len; i += 1) {
    c = String.fromCharCode(h2d(arr[i]));
    str += c;
  }

  return str;
}

var crypto = require('crypto');

var config = {
  // size of the generated hash
  hashBytes: 32,
  // larger salt means hashed passwords are more resistant to rainbow table, but
  // you get diminishing returns pretty fast
  saltBytes: 16,
  // more iterations means an attacker has to take longer to brute force an
  // individual password, so larger is better. however, larger also means longer
  // to hash the password. tune so that hashing the password takes about a
  // second
  iterations: 872791
};

function hashPassword(password, callback) {
  // generate a salt for pbkdf2
  crypto.randomBytes(config.saltBytes, function (err, salt) {
    if (err) {
      return callback(err);
    }

    crypto.pbkdf2(password, salt, config.iterations, config.hashBytes,
      function (err, hash) {

        if (err) {
          return callback(err);
        }

        var combined = new Buffer(hash.length + salt.length + 8);
        combined.writeUInt32BE(salt.length, 0, true);
        combined.writeUInt32BE(config.iterations, 4, true);

        salt.copy(combined, 8);
        hash.copy(combined, salt.length + 8);
        callback(null, combined);
      });
  });
}

function verifyPassword(password, combined, callback) {
  // extract the salt and hash from the combined buffer
  var saltBytes = combined.readUInt32BE(0);
  var hashBytes = combined.length - saltBytes - 8;
  var iterations = combined.readUInt32BE(4);
  var salt = combined.slice(8, saltBytes + 8);
  var hash = combined.toString('binary', saltBytes + 8);

  // verify the salt and hash against the password
  crypto.pbkdf2(password, salt, iterations, hashBytes, function (err, verify) {
    if (err) {
      return callback(err, false);
    }

    callback(null, verify.toString('binary') === hash);
  });
}

module.exports.hexToString = hexToString;
module.exports.verifyPassword = verifyPassword;
module.exports.hashPassword = hashPassword;