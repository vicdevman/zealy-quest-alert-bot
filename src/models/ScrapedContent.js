import mongoose from '../db/connect.js';

const scrapedContentSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true
  },
  scrapedcontent: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('ScrapedContent', scrapedContentSchema);
