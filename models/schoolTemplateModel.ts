import mongoose, { InferSchemaType, PaginateModel, Types } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from "mongoose-delete";
import paginate from "mongoose-paginate-v2";

const Schema = mongoose.Schema;

const schoolTemplateSchema = new Schema({
    uploadedById: {
        type: Schema.Types.ObjectId,
        ref: 'staffs',
        required: true
    },
    templateType: {
        type: String,
        enum: ["assignment-template", "curriculum-template"],
        required: true
    },
    fileLink: {
        type: String,
        required: true
    },
    schoolId: {
        type: Types.ObjectId,
        ref: "schoolprofile",
        required: true
    }
},
{ timestamps: true });

type schoolTemplateCollectionType = InferSchemaType<typeof schoolTemplateSchema>;

schoolTemplateSchema.plugin(paginate);

const schoolTemplateCollection = mongoose.model<schoolTemplateCollectionType, PaginateModel<schoolTemplateCollectionType> & SoftDeleteModel<SoftDeleteDocument, schoolTemplateCollectionType>>('schooltemplates', schoolTemplateSchema);

export { schoolTemplateCollection, schoolTemplateCollectionType };