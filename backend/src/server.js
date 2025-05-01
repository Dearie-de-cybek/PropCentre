const App = require("./app");
const AuthRoute = require("./routes/auth");
const logger = require("./config/logger");
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const ENV = require('./config/env');
const PropertyRoutes = require('./routes/PropertyRoutes');

// Initialize Express app
const app = new App();

// Initialize routes
app.initializedRoutes([
  new AuthRoute(),
  new PropertyRoutes()
]);







// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logger.info(`Server started at http://localhost:${PORT}`);
});