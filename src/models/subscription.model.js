import mongoose, { Schema } from "mongoose";

// in this i am finding the channel to find the total subscriber of the channel:
// not the subscriber: subscriber: is given by : subscriber value
const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, //One who is subscribing
      ref: "User",
    },
    subscribing: {
      type: Schema.Types.ObjectId, //One whose subscriber subscribing
      ref: "User",
    },
  },
  { timestamps: true }
); 

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
