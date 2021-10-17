const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: './config.env'});

const app = express();
app.use(cors())


app.use(express.json({ limit: '10kb' }));

const usersRouter = require('./routes/userRoute');

//===== Connection to the database
const DB = process.env.MONGODB_URI;
const DBConnect = async () => {
        try {
            await mongoose.connect(DB,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });

            console.log("Connection Successfull")

        } catch (error) {
            console.log("Connection failed", error.message);
            process.exit(1);
        }
}

DBConnect();

//==== Routes ============
app.use('/api/v1/users', usersRouter)


//========== Listen the port =============
const port = process.env.PORT || 8000;
app.listen(port, () =>  console.log(`The app is running in port ${port}`));