import { model, Schema } from 'mongoose';
import RoleDto from 'data/DataTransferObjects/RoleDto';

const roleSchema = new Schema<RoleDto>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        permissions: [{ 
            type: Schema.Types.ObjectId, 
            ref: 'Permission',
            default: [] 
        }]

    }
);
const roleModel = model('Role', roleSchema);

export default roleModel;