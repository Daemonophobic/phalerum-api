import { model, Schema } from 'mongoose';
import PermissionDto from '../data/DataTransferObjects/PermissionDto';

const permissionSchema = new Schema<PermissionDto>(
  {
    name: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    }
  },
  {
    timestamps: true,
  },
);

const permissionModel = model('Permissions', permissionSchema);

export default permissionModel;