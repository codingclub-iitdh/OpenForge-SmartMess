import mongoose, { Schema } from "mongoose";

const Suggestions = new Schema({
  messId: { type: Schema.Types.ObjectId, ref: "mess", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  suggestionTitle: { type: Schema.Types.String, required: true },
  suggestionType: { type: Schema.Types.String, required: true },
  suggestion: Schema.Types.String,
  image: Schema.Types.String,
  targetAudience: [
    {
      type: Schema.Types.String,
      enum: ["management", "dean", "students"],
    },
  ],
  status: {
    type: Schema.Types.String,
    enum: ["open", "closed"],
    default: "open",
  },
  officialResponse: {
    type: Schema.Types.String,
    default: null,
  },
  officialAttachment: {
    type: Schema.Types.String,
    default: null,
  },
  resolvedByRole: {
    type: Schema.Types.String,
    default: null,
  },
  responseHistory: [
    {
      response: { type: Schema.Types.String, required: true },
      attachment: { type: Schema.Types.String, default: null },
      respondedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
      respondedByRole: { type: Schema.Types.String, required: true },
      createdAt: { type: Schema.Types.Date, required: true },
    },
  ],
  resolutionUpvotes: [
    {
      type: Schema.Types.ObjectId,
      ref: "users",
      default: [],
    },
  ],
  resolutionDownvotes: [
    {
      type: Schema.Types.ObjectId,
      ref: "users",
      default: [],
    },
  ],
  upvotes: [
    {
      type: Schema.Types.ObjectId,
      ref: "users",
      default: [],
    },
  ],
  downvotes: [
    {
      type: Schema.Types.ObjectId,
      ref: "users",
      default: [],
    },
  ],

  children: [
    {
      id: { type: Schema.Types.ObjectId, required: true },
      userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
      upvotes: [
        {
          type: Schema.Types.ObjectId,
          ref: "users",
          default: [],
        },
      ],
      downvotes: [
        {
          type: Schema.Types.ObjectId,
          ref: "users",
          default: [],
        },
      ],
      comment: { type: Schema.Types.String, required: true },
    },
  ],

  createdAt: {
    type: Schema.Types.Date,
    required: true,
  },
});


export default mongoose.model("suggestions", Suggestions);
