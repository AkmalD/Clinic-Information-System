require('dotenv').config();
const express = require('express');
const { responseWrapper } = require('./utils/response');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const authRoutes = require('./routes/auth.routes');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(responseWrapper);

app.get('/api/health', (req, res) => {
	res.json({
		success: true,
		message: 'Success',
		data: {},
	});
});

app.use('/api/auth', authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
