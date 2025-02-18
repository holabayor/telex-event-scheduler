import express, { Application } from "express";


const app: Application = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Hi there!");
});

app.get('/integration.json', (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('host')
    res.json({
        app_logo: "https://res.cloudinary.com/dev-storage/image/upload/v1739805541/event-icon.png",
        baseUrl
    });
}
)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// https://res.cloudinary.com/dev-storage/image/upload/v1739805541/event-icon.png