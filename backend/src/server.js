require('dotenv').config();
const express = require('express');
const { responseWrapper } = require('./utils/response');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const doctorRoutes = require('./routes/doctor.routes');
const poliRoutes = require('./routes/poli.routes');
const userRoutes = require('./routes/user.routes');
const registrationRoutes = require('./routes/registration.routes');
const queueRoutes = require('./routes/queue.routes');
const medicalRecordRoutes = require('./routes/medicalRecord.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const medicineRoutes = require('./routes/medicine.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

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
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/poli', poliRoutes);
app.use('/api/users', userRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});