import { Schema, InferSchemaType, model, PaginateModel } from 'mongoose';
import paginate from "mongoose-paginate-v2";

const orderItemSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "students",
        required: true
    },
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: "teachers",
        required: true
    },
    position: {
        type: String,
        required: true
    },
    comment: {
        type: String
    }
}, {timestamps: true});

type orderItemCollectionType = InferSchemaType<typeof orderItemSchema>;

orderItemSchema.plugin(paginate);

const orderItemCollection = model<orderItemCollectionType, PaginateModel<orderItemCollectionType>>("result", orderItemSchema);

export {orderItemCollection, orderItemCollectionType};
