const db = require("mongoose");

const support_recordChema = db.Schema(
  {
    partnerId: String,
    UserId: String,
    MSBN: String,
    CardId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = db.model(
  "user_accounts",
  support_recordChema,
  "user_accounts"
);
