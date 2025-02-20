const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRouter');
const app = express();
const path = require('path');

const PORT = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

app.use(express.json())
app.use("/auth", authRouter)

const start = async () => {
    try{
        await mongoose.connect(`mongodb+srv://user:Qwerty123!@cluster0.la9eq.mongodb.net/database?retryWrites=true&w=majority&appName=Cluster0`)
        app.listen(PORT, () => console.log(`server started on port ${PORT}`))
    } catch (e){
        console.log(e)
    }
}

start()