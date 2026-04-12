import { NextFunction, Response } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { sendNotification } from "../../config/firebaseWeb";
import notificationToken from "../../models/notificationToken";
import SuggestionsModel from "../../models/suggestions";
import UserModel from "../../models/user";
import usernotifications from "../../models/usernotifications";
import { deleteFromCloudinary } from "../../services/uploadToCloudinary";

const AUDIENCE_OPTIONS = ["management", "dean", "students"] as const;
type AudienceType = (typeof AUDIENCE_OPTIONS)[number];

const normalizeAudienceSelection = (value: any): AudienceType[] => {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  const normalized = rawValues
    .map((entry) => String(entry).trim().toLowerCase())
    .filter(Boolean)
    .filter((entry): entry is AudienceType =>
      AUDIENCE_OPTIONS.includes(entry as AudienceType)
    );

  const unique = Array.from(new Set(normalized));
  return unique.length > 0 ? unique : ["management"];
};

const getAudienceLabel = (targetAudience: any) => {
  const normalized = normalizeAudienceSelection(targetAudience);
  if (normalized.length === AUDIENCE_OPTIONS.length) {
    return "All";
  }

  const labels: Record<AudienceType, string> = {
    management: "Secy & Mess Manager",
    dean: "SW Office",
    students: "Students",
  };

  return normalized.map((target) => labels[target]).join(", ");
};

const buildSuggestionQuery = (query: any) =>
  query
    .populate("userId", "Username Image Role Email")
    .populate("upvotes downvotes resolutionUpvotes resolutionDownvotes", "Username")
    .populate("children.userId", "Username Image")
    .populate("responseHistory.respondedBy", "Username Image Role");

const getCurrentUser = async (loggedInUserData: any) => {
  if (!loggedInUserData?.email) {
    return null;
  }

  return await UserModel.findOne({
    Email: loggedInUserData.email,
  });
};

const getAudienceRecipients = async (
  messId: any,
  targetAudience: any,
  excludeUserIds: string[] = []
) => {
  const normalized = normalizeAudienceSelection(targetAudience);
  const roleFilter = new Set<string>();

  if (normalized.includes("management")) {
    roleFilter.add("manager");
    roleFilter.add("secy");
    roleFilter.add("admin");
  }
  if (normalized.includes("dean")) {
    roleFilter.add("dean");
  }
  if (normalized.includes("students")) {
    roleFilter.add("user");
  }

  return await UserModel.find({
    Eating_Mess: messId,
    Role: { $in: Array.from(roleFilter) },
    _id: { $nin: excludeUserIds },
  });
};

const notifyRecipients = async ({
  title,
  body,
  attachment = "",
  recipients,
}: {
  title: string;
  body: string;
  attachment?: string;
  recipients: any[];
}) => {
  if (recipients.length === 0) {
    return;
  }

  await usernotifications.create({
    Title: title,
    Message: body,
    Attachment: attachment,
    sendTo: recipients.map((recipient) => recipient._id),
    Date: Date.now(),
    readBy: [],
  });

  const tokens = await notificationToken.find({
    Email: { $in: recipients.map((recipient) => recipient.Email) },
  });

  for (const token of tokens) {
    try {
      await sendNotification(token.Token, title, body);
    } catch (err) {
      console.error("Error sending notification:", err);
    }
  }
};

export const getSuggestions = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const loggedInUserData = req.user;
  try {
    const currUser = await getCurrentUser(loggedInUserData);
    if (!currUser) {
      return next(createHttpError(403, "Unauthorized"));
    }

    const messId = currUser.Eating_Mess;
    const currPage = Number(req.query.page || 1);
    const LIMIT = 10;
    const paginatedSuggestions = await buildSuggestionQuery(
      SuggestionsModel.find({
        messId,
        userId: currUser._id,
      })
        .skip((currPage - 1) * LIMIT)
        .limit(LIMIT)
        .sort({ createdAt: -1 })
    ).exec();

    if (paginatedSuggestions.length > 0) {
      return res.status(200).send({
        suggestions: paginatedSuggestions,
        hasNext: paginatedSuggestions.length === LIMIT,
      });
    }

    return res.status(204).send({ suggestions: [], hasNext: false });
  } catch (err) {
    console.log(err);
    return next(createHttpError(500, "Internal Server Error"));
  }
};

export const postSuggestion = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const loggedInUserData = req.user;
  try {
    const currUser = await getCurrentUser(loggedInUserData);
    if (!currUser) {
      return next(createHttpError(403, "Unauthorized"));
    }

    const messId = currUser.Eating_Mess;
    const newSuggestion = req.body;
    const targetAudience = normalizeAudienceSelection(newSuggestion.targetAudience);

    const addSuggestion = await SuggestionsModel.create({
      messId,
      userId: currUser._id,
      ...newSuggestion,
      targetAudience,
      createdAt: Date.now(),
    });

    if (!addSuggestion) {
      return res.status(400).send({ Message: "Failure suggestion not added" });
    }

    const recipients = await getAudienceRecipients(messId, targetAudience, [
      String(currUser._id),
    ]);
    await notifyRecipients({
      title: "New issue reported",
      body: `${currUser.Username} sent a complaint to ${getAudienceLabel(targetAudience)}.`,
      attachment: addSuggestion.image || "",
      recipients,
    });

    return res.status(200).send({ Message: "Suggestion added successfully" });
  } catch (err) {
    console.log(err);
    return next(createHttpError(500, "Internal Server Error"));
  }
};

export const patchSuggestion = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const loggedInUserData = req.user;
  try {
    const currUser = await getCurrentUser(loggedInUserData);
    if (!currUser) {
      return next(createHttpError(403, "Unauthorized"));
    }

    const suggestionId = req.body.suggestionId;
    const newSuggestion = req.body.suggestion;

    const updateSuggestion = await SuggestionsModel.updateOne(
      {
        _id: suggestionId,
        userId: currUser._id,
      },
      {
        $set: {
          suggestion: newSuggestion,
        },
      }
    );

    if (updateSuggestion.modifiedCount > 0) {
      return res.status(204).send({});
    }

    return res.status(404).send({ message: "Suggestion Not Found" });
  } catch (err) {
    console.error(err);
    next(createHttpError(500, "Internal Server Error"));
  }
};

export const deleteSuggestion = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const loggedInUserData = req.user;
  try {
    const currUser = await getCurrentUser(loggedInUserData);
    if (!currUser) {
      return next(createHttpError(403, "Unauthorized"));
    }

    const suggestionId = req.query.suggestionId;
    const currSuggestion = await SuggestionsModel.findOne({
      _id: suggestionId,
      userId: currUser._id,
    });

    if (!currSuggestion) {
      return res.status(404).send({ message: "Suggestion Not Found" });
    }

    const imageUrl = currSuggestion.image?.split("/");
    if (imageUrl != null) {
      const imagePublicID = imageUrl[imageUrl.length - 1].split(".")[0];
      const publicID = `Smart_Mess/User_Uploads/${imagePublicID}`;
      await deleteFromCloudinary(publicID);
    }

    await currSuggestion.deleteOne();
    return res
      .status(200)
      .send({ message: "Sugestion deleted successfully", deletedSuggestion: currSuggestion });
  } catch (err) {
    console.error(err);
    next(createHttpError(500, "Internal Server Error"));
  }
};

export const postSuggestionComment = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const loggedInUserData = req.user;
  try {
    const currUser = await getCurrentUser(loggedInUserData);
    if (!currUser) {
      return next(createHttpError(403, "Unauthorized"));
    }

    const suggestionId = req.body.suggestionId;
    const newComment = req.body.comment;
    const newCommentId = new mongoose.Types.ObjectId();

    const updateSuggestion = await SuggestionsModel.updateOne(
      {
        _id: suggestionId,
      },
      {
        $push: {
          children: {
            userId: currUser._id,
            id: newCommentId,
            comment: newComment,
          },
        },
      }
    );

    if (updateSuggestion.modifiedCount > 0) {
      return res.status(204).send({});
    }

    return res.status(404).send({ message: "Suggestion Not Found" });
  } catch (err) {
    console.error(err);
    next(createHttpError(500, "Internal Server Error"));
  }
};

export const patchSuggestionComment = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const loggedInUserData = req.user;
  try {
    const currUser = await getCurrentUser(loggedInUserData);
    if (!currUser) {
      return next(createHttpError(403, "Unauthorized"));
    }

    const suggestionId = req.body.suggestionId;
    const commentId = req.body.commentId;
    const newComment = req.body.comment;

    const updateSuggestion = await SuggestionsModel.updateOne(
      {
        _id: suggestionId,
        "children.id": commentId,
      },
      {
        $set: {
          "children.$.comment": newComment,
        },
      }
    );

    if (updateSuggestion.modifiedCount > 0) {
      return res.status(204).send({});
    }

    return res.status(404).send({ message: "Suggestion Not Found" });
  } catch (err) {
    console.error(err);
    next(createHttpError(500, "Internal Server Error"));
  }
};

export const deleteSuggestionComment = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const loggedInUserData = req.user;
  try {
    const currUser = await getCurrentUser(loggedInUserData);
    if (!currUser) {
      return next(createHttpError(403, "Unauthorized"));
    }

    const suggestionId = req.body.suggestionId;
    const commentId = req.body.commentId;
    const updateSuggestion = await SuggestionsModel.updateOne(
      {
        _id: suggestionId,
      },
      {
        $pull: {
          children: {
            id: commentId,
          },
        },
      }
    );

    if (updateSuggestion.modifiedCount > 0) {
      return res.status(204).send({});
    }

    return res.status(404).send({ message: "Suggestion Not Found" });
  } catch (err) {
    console.error(err);
    next(createHttpError(500, "Internal Server Error"));
  }
};

export const voteSuggestionComment = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const loggedInUserData = req.user;
  try {
    const currUser = await getCurrentUser(loggedInUserData);
    if (!currUser) {
      next(createHttpError(403, "Unauthorized"));
      return;
    }

    const suggestionId = req.body.suggestionId;
    const commentId = req.body.commentId;
    const updateType =
      req.body.upvote === true
        ? {
          $addToSet: { "children.$.upvotes": currUser._id },
          $pull: { "children.$.downvotes": currUser._id },
        }
        : {
          $pull: { "children.$.upvotes": currUser._id },
          $addToSet: { "children.$.downvotes": currUser._id },
        };

    const newVote = await SuggestionsModel.updateOne(
      {
        _id: suggestionId,
        "children.id": commentId,
      },
      updateType
    );

    if (newVote.modifiedCount > 0) {
      return res.send({ message: "Voted Successfully" });
    }

    return res.status(400).send({ message: "Vote not casted" });
  } catch (err) {
    console.log(err);
    next(createHttpError(500, "Internal Server Error"));
  }
};

export const markAsClosed = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const loggedInUserData = req.user;
  try {
    const currUser = await getCurrentUser(loggedInUserData);
    if (!currUser) {
      return next(createHttpError(403, "Unauthorized"));
    }

    const suggestionId = req.body.suggestionId;
    const updateSuggestion = await SuggestionsModel.updateOne(
      {
        _id: suggestionId,
      },
      {
        $set: {
          status: "closed",
        },
      }
    );

    if (updateSuggestion.modifiedCount <= 0) {
      return res.status(404).send({ message: "Suggestion Not Found" });
    }

    const title = "Issue Closed";
    const body = `Issue has been closed by ${currUser.Username}`;
    const tokens: string[] = [];
    const userToken = await notificationToken.findOne({ userId: currUser._id });
    if (userToken) {
      tokens.push(userToken.Token);
    }

    const users = await UserModel.find({
      $or: [{ Role: "admin" }, { Role: "secy" }, { Role: "manager" }, { Role: "dean" }],
    });

    await usernotifications.create({
      Title: title,
      Message: body,
      sendTo: users.map((user) => user._id),
      Date: Date.now(),
      readBy: [],
    });

    for (const user of users) {
      const token = await notificationToken.findOne({ Email: user.Email });
      if (token) {
        tokens.push(token.Token);
      }
    }

    for (const token of tokens.filter(Boolean)) {
      try {
        await sendNotification(token, title, body);
      } catch (err) {
        console.error("Error sending notification:", err);
      }
    }

    return res.status(204).send({});
  } catch (err) {
    console.error(err);
    return next(createHttpError(500, "Internal Server Error"));
  }
};

export const getOneSuggestion = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const loggedInUserData = req.user;
  try {
    const currUser = await getCurrentUser(loggedInUserData);
    if (!currUser) {
      return next(createHttpError(403, "Unauthorized"));
    }

    const suggestionId = req.query.suggestionId;
    const suggestion = await buildSuggestionQuery(
      SuggestionsModel.findOne({
        _id: suggestionId,
      })
    ).exec();

    if (suggestion) {
      return res.status(200).send({ suggestion });
    }

    return res.status(204).send({ suggestion: null });
  } catch (err) {
    console.log(err);
    return next(createHttpError(500, "Internal Server Error"));
  }
};

export const markAsClosedAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const loggedInUserData = req.user;
  try {
    const currUser = await getCurrentUser(loggedInUserData);
    if (!currUser) {
      return next(createHttpError(403, "Unauthorized"));
    }

    if (!["admin", "secy", "manager", "dean"].includes(currUser.Role)) {
      return next(createHttpError(403, "Unauthorized to perform this action"));
    }

    const suggestionId = req.body.suggestionId;
    const officialResponse = req.body.response;
    const officialAttachment = req.body.image || null;

    const updateSuggestion = await SuggestionsModel.updateOne(
      {
        _id: suggestionId,
      },
      {
        $set: {
          status: "closed",
          officialResponse,
          officialAttachment,
          resolvedByRole: currUser.Role,
        },
        $push: {
          responseHistory: {
            response: officialResponse,
            attachment: officialAttachment,
            respondedBy: currUser._id,
            respondedByRole: currUser.Role,
            createdAt: Date.now(),
          },
        },
      }
    );

    if (updateSuggestion.modifiedCount <= 0) {
      return res.status(404).send({ message: "Suggestion Not Found" });
    }

    const suggestion = await SuggestionsModel.findOne({ _id: suggestionId });
    if (!suggestion) {
      return res.status(404).send({ message: "Suggestion Not Found" });
    }

    const suggestionOwner = await UserModel.findOne({ _id: suggestion.userId });
    if (!suggestionOwner) {
      return res.status(404).send({ message: "User Not Found" });
    }

    const recipients = await getAudienceRecipients(
      suggestion.messId,
      suggestion.targetAudience,
      [String(currUser._id)]
    );

    if (!recipients.some((recipient) => String(recipient._id) === String(suggestionOwner._id))) {
      recipients.push(suggestionOwner);
    }

    await notifyRecipients({
      title: "Issue updated by administration",
      body: `${currUser.Username} posted an official response on "${suggestion.suggestionTitle}".`,
      attachment: officialAttachment || "",
      recipients,
    });

    return res.status(204).send({});
  } catch (err) {
    console.error(err);
    next(createHttpError(500, "Internal Server Error"));
  }
};

export const reopenSuggestion = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const loggedInUserData = req.user;
  try {
    const currUser = await getCurrentUser(loggedInUserData);
    if (!currUser) {
      return next(createHttpError(403, "Unauthorized"));
    }

    const suggestionId = req.body.suggestionId;
    const editedText = req.body.suggestion;
    const targetAudience = req.body.targetAudience
      ? normalizeAudienceSelection(req.body.targetAudience)
      : null;

    const updateSuggestion = await SuggestionsModel.updateOne(
      {
        _id: suggestionId,
        userId: currUser._id,
      },
      {
        $set: {
          status: "open",
          suggestion: editedText,
          ...(targetAudience ? { targetAudience } : {}),
        },
      }
    );

    if (updateSuggestion.modifiedCount <= 0) {
      return res.status(404).send({ message: "Not eligible to reopen." });
    }

    const latestSuggestion = await SuggestionsModel.findById(suggestionId);
    if (latestSuggestion) {
      const recipients = await getAudienceRecipients(
        latestSuggestion.messId,
        latestSuggestion.targetAudience,
        [String(currUser._id)]
      );

      await notifyRecipients({
        title: "Issue reopened",
        body: `${currUser.Username} reopened "${latestSuggestion.suggestionTitle}".`,
        recipients,
      });
    }

    return res.status(204).send({});
  } catch (err) {
    console.error(err);
    next(createHttpError(500, "Internal Server Error"));
  }
};

export const voteResolution = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const loggedInUserData = req.user;
  try {
    const currUser = await getCurrentUser(loggedInUserData);
    if (!currUser) {
      return next(createHttpError(403, "Unauthorized"));
    }

    const suggestionId = req.body.suggestionId;
    const updateType =
      req.body.upvote === true
        ? {
          $addToSet: { resolutionUpvotes: currUser._id },
          $pull: { resolutionDownvotes: currUser._id },
        }
        : {
          $pull: { resolutionUpvotes: currUser._id },
          $addToSet: { resolutionDownvotes: currUser._id },
        };

    const newVote = await SuggestionsModel.updateOne(
      { _id: suggestionId },
      updateType
    );

    if (newVote.modifiedCount > 0) {
      const suggestionData = await SuggestionsModel.findById(suggestionId);
      return res.send({
        message: "Voted Successfully",
        resolutionUpvotes: suggestionData?.resolutionUpvotes,
        resolutionDownvotes: suggestionData?.resolutionDownvotes,
      });
    }

    return res.status(400).send({ message: "Vote not casted" });
  } catch (err) {
    console.error(err);
    next(createHttpError(500, "Internal Server Error"));
  }
};
