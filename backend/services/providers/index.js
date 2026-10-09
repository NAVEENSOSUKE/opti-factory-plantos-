// backend/services/providers/index.js
// AI Provider Abstraction Registry for OptiFactory PlantOS

const llmProvider = require('./llmProvider');
const localProvider = require('./localProvider');

module.exports = {
  llmProvider,
  localProvider,
  getActiveProvider() {
    if (llmProvider.isConfigured()) {
      return llmProvider;
    }
    return localProvider;
  }
};
