import { model, Schema } from 'mongoose';
import RoleDto from '../data/DataTransferObjects/RoleDto';

const roleSchema = new Schema<RoleDto>(
  {
    name: {
        type: String,
        required: true,
    },
    permissions: [{type: Schema.Types.ObjectId, ref: 'Permissions', required: false}]
  },
  {
    timestamps: true,
  },
);

const roleModel = model('Roles', roleSchema);

export default roleModel;