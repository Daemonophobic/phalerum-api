import { model, Schema } from 'mongoose';
import JobDto from '../data/DataTransferObjects/JobDto';
import OS from '../data/enums/OsEnum';

const jobSchema = new Schema<JobDto>(
    {
      jobName: {
        type: String,
        required: true,
      },
      jobDescription: {
        type: String,
        default: '',
      },
      completed: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      crossCompatible: {
        type: Boolean,
        default: true,
      },
      os: {
        type: String,
        enum: OS,
      },
      agentId: {
        type: Schema.Types.ObjectId,
        ref: 'Agent',
      },
      masterJob: {
        type: Boolean,
        default: false,
      },
      shellCommand: {
        type: Boolean,
        default: false,
      },
      command: {
        type: String,
        default: '',
      },
      createdAt: {
        type: Date,
        default: Date.now,
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
  

const jobModel = model('Job', jobSchema);

export default jobModel;