const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
	res.json({
		success: true,
		message: 'Success',
		data: {},
	});
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
