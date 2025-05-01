const App = require("./app");
const AuthRoute = require("./routes/auth");
const logger = require("./config/logger");

// Initialize Express app
const app = new App();

// Initialize routes
app.initializedRoutes([
  new AuthRoute(),
]);


// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logger.info(`Server started at http://localhost:${PORT}`);
});