import { model, Schema } from 'mongoose';
import PermissionDto from 'data/DataTransferObjects/PermissionDto';

const permissionSchema = new Schema<PermissionDto>(
    {
        action:{
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String
        }
    },
);

const permissionModel = model("Permission", permissionSchema);

export default permissionModel;