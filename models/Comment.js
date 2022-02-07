const { Schema, model, Types } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const ReplySchema = new Schema(
    {
        // set a custom id to avoid confusion with parent comment Id
        replyId: {
            type: Schema.Types.ObjectId,
            default: () => new Types.ObjectId()
        }
        replyBody: {
            type: String
        },
        writtenBy: {
            type: String
        }
        createdAt: {
            type: Date,
            default: Date.now,
            get: createdAtVal => dateFormat(createdAtVal);
        }
    },
    {
        toJSON: {
            getters: true
        }
    }
)

const CommentSchema = new Schema({
    written: {
        type: String
    },
    commentBody: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
        get: (createdAtVal)  => dateFormat(createdAtVal)
    },
    // use ReplySchema to validate data for a reply
    replies: [ReplySchema]
    },
    {
        toJSON: {
            virtuals: true
            getters: true
        },
        id: false
    }
);

CommentSchema.virtual('replyCount').get(function() {
    return this.replies.length;
});

const Comment = model('Comment', CommentSchema);

module.exports = Comment;