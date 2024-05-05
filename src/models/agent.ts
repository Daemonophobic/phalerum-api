import { model, Schema } from 'mongoose';
import AgentDto from '../data/DataTransferObjects/AgentDto';
import AddedBy from '../data/enums/AddedByEnum';
import OS from '../data/enums/OsEnum';

const agentSchema = new Schema<AgentDto>(
    {
      agentName: {
          type: String,
          required: true,
          unique: true,
      },
      addedBy: {
          type: String,
          enum: AddedBy,
          required: true,
      },
      addedByUser: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: false,
      },
      addedByAgent: {
          type: Schema.Types.ObjectId,
          ref: 'Agent',
          required: false,
      },
      lastCheckIn: {
          type: Date
      },
      ipAddress: {
          type: String
      },
      master: {
          type: Boolean,
          default: false,
      },
      communicationToken: {
          type: String,
          required: true,
          select: false,
      },
      os: {
          type: String,
          enum: OS,
          required: true,
      }
    },
    {
      timestamps: true,
    },
  );
  

const agentModel = model('Agent', agentSchema);

export default agentModel;