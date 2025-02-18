import express, { Application } from "express";


const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hi there!");
});

app.get('/integration-json', (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('host')
    res.json(
        {
            author: "Aanuoluwapo Liasu",
            data: {
                date: {
                    created_at: "2025-02-18",
                    updated_at: "2025-02-18"
                },
                descriptions: {
                    app_name: "Event Scheduler and Reminder",
                    app_description: "Schedules events and sends reminders to a Telex channel",
                    app_logo: "https://res.cloudinary.com/dev-storage/image/upload/v1739805541/event-icon.png",
                    app_url: baseUrl,
                    background_color: "#fff"
                },
                integration_category: "Communication & Collaboration",
                integration_type: "interval",
                is_active: true,
                key_features: [
                    "Schedules events",
                    "Reminds users of upcoming events",
                    "Set default reminder interval",
                    "Set reminder interval for an event to the Telex channel",
                ],
                settings: [
                    {
                        label: "defaultRemiderInterval",
                        type: "text",
                        required: true,
                        default: "1440,60"
                    }
                ],
                target_url: `${baseUrl}/event`,
                tick_url: `${baseUrl}/tick`
            }
        }
    );
}
)

app.post('/event', (req, res) => {
    console.log(req.body);
    res.status(200).send();
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
