import { model, Schema } from 'mongoose';
import SettingsDto from '../data/DataTransferObjects/SettingsDto';

const settingsSchema = new Schema<SettingsDto>(
    {
        name: {
            type: String,
            required: true,
        },
        value: {
            type: Schema.Types.Mixed,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

const settingsModel = model('Setting', settingsSchema);

export default settingsModel;