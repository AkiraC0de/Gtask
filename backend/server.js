const express = require('express');
const connectToDB = require('./db/connect');
const cookieParser = require('cookie-parser');
const cors = require('cors')

const app = express();

// routes
const authRoute = require('./routes/Auth.routes');
const taskRoute = require('./routes/Task.routes');
const groupRoute = require('./routes/Group.routes');

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN_URL, credentials: true }));

app.use('/api/auth', authRoute);
app.use('/api/task', taskRoute);
app.use('/api/group', groupRoute);

app.listen(process.env.PORT, () => {
    connectToDB();
    console.log(`The Server is running at PORT ${process.env.PORT}`);
})