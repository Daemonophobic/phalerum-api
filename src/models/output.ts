import { model, Schema } from 'mongoose';
import OutputDto from '../data/DataTransferObjects/OutputDto';

const outputSchema = new Schema<OutputDto>(
    {
      output: {
          type: String,
          required: true,
      },
      success: {
          type: Boolean,
          default: true,
      },
      jobId: {
          type: Schema.Types.ObjectId,
          ref: 'Job',
          required: true,
      },
      agentId: {
          type: Schema.Types.ObjectId,
          ref: 'Agent',
          required: true,
      },
      deleted: {
          type: Boolean,
          default: false,
      },
    },
    {
      timestamps: true,
    },
  );
  

const outputModel = model('Output', outputSchema);

export default outputModel;