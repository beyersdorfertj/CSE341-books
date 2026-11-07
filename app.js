import express from 'express'
import router from './src/router.js'
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';

const app = express();

app.use(express.json());
app.use(router);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  return res.status(200).json({ message: 'Server is running' });
});

app.use((req, res, next) => {
  const err = new Error('Page not found');
  err.status = 404;
  return res.status(err.status).json({ message: err.message });
});


export default app;