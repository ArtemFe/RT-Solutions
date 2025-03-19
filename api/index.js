const express = require("express");
const session = require("express-session");
const Rental = require("./models/Rental");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRouter = require("./authRouter");
const path = require("path");
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.static(path.join(__dirname, "../client")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use("/", authRouter);

app.post("/rentals", async (req, res) => {
    try {
        const { user_id, product_id, start_at, until_at } = req.body;

        const newRental = new Rental({
            user_id,
            product_id,
            start_at: new Date(start_at),
            until_at: new Date(until_at),
        });

        const savedRental = await newRental.save();
        res.status(201).json(savedRental);
    } catch (err) {
        res.status(500).json({
            message: "Error creating rental",
            error: err.message,
        });
    }
});

const start = async () => {
    try {
        await mongoose.connect(
            `mongodb+srv://user:Qwerty123!@cluster0.la9eq.mongodb.net/database?retryWrites=true&w=majority&appName=Cluster0`
        );
        app.listen(PORT, () => console.log(`server started on port ${PORT}`));
    } catch (e) {
        console.log(e);
    }
};

start();