var crypto = require("crypto");

var Schema = {};

Schema.createSchema = function(mongoose) {
  var UserSchema = mongoose.Schema({
    enabled: { type: Boolean, default: true },
    email: { type: String, unique: true, default: "" },
    group: { type: [String], default: [] },
    hashed_password: { type: String, required: true },
    salt: { type: String, required: true },
    name: { type: String, default: "" },
    rank: { type: String, default: "user" },
    student_number: { type: String, default: "" },
    favorite: { type: Array, default: [] },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
  });

  UserSchema.virtual("password")
    .set(function(password) {
      this._password = password;
      this.salt = this.makeSalt();
      this.hashed_password = this.encryptPassword(password);
      console.log(
        "[ ] (user_schema) Virtual password set called : " +
          this.hashed_password
      );
    })
    .get(function() {
      return this._password;
    });

  UserSchema.method("encryptPassword", function(plainText, inSalt) {
    if (inSalt) {
      return crypto
        .createHmac("sha256", inSalt)
        .update(plainText)
        .digest("hex");
    } else {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainText)
        .digest("hex");
    }
  });
  UserSchema.method("makeSalt", function() {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  });
  UserSchema.method("authenticate", function(
    plainText,
    inSalt,
    hashed_password
  ) {
    if (inSalt) {
      console.log(
        "[ ] (user_schema) Authenticate called : %s -> %s : %s",
        plainText,
        this.encryptPassword(plainText, inSalt),
        hashed_password
      );
      return this.encryptPassword(plainText, inSalt) === hashed_password;
    } else {
      console.log(
        "[ ] (user_schema) Authenticate called : %s -> %s : %s",
        plainText,
        this.encryptPassword(plainText),
        this.hashed_password
      );
      return this.encryptPassword(plainText) === this.hashed_password;
    }
  });

  UserSchema.path("email").validate(function(email) {
    return email.length;
  }, "[!] (user_schema) Column 'email' has no value");
  UserSchema.path("hashed_password").validate(function(hashed_password) {
    return hashed_password.length;
  }, "[!] (user_schema) Column 'hashed_password' has no value");

  UserSchema.static("findById", function(id, callback) {
    return this.find({ _id: id }, callback);
  });
  UserSchema.static("findAll", function(callback) {
    return this.find({}, callback);
  });

  return UserSchema;
};

module.exports = Schema;
