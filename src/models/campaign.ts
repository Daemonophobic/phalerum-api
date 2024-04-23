import { model, Schema } from 'mongoose';
import CampaignDto from '../data/DataTransferObjects/CampaignDto';

const campaignSchema = new Schema<CampaignDto>(
    {
        number: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        active: {
            type: Boolean,
            default: true,
        },
        grafanaId: {
            type: String,
            default: '',
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    {
        timestamps: true,
    },
);

const campaignModel = model('Campaign', campaignSchema);

export default campaignModel;