import express, { Application } from 'express';
import Storage from './data/storage';
import { EventData, TelexEventRequest, TickPayload } from './types';
import { parseEventCommand } from './utils';
import { BackgroundTaskQueue } from './queue';

const app: Application = express();
const PORT = process.env.PORT || 3000;

const storage = new Storage();
const taskQueue = new BackgroundTaskQueue();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hi there!');
});

app.get('/integration-json', (req, res) => {
  const baseUrl = req.protocol + '://' + req.get('host');
  res.json({
    author: 'Aanuoluwapo Liasu',
    data: {
      date: {
        created_at: '2025-02-18',
        updated_at: '2025-02-18',
      },
      descriptions: {
        app_name: 'Event Scheduler and Reminder',
        app_description:
          'Schedules events and sends reminders to a Telex channel',
        app_logo:
          'https://res.cloudinary.com/dev-storage/image/upload/v1739805541/event-icon.png',
        app_url: baseUrl,
        background_color: '#fff',
      },
      integration_category: 'Communication & Collaboration',
      integration_type: 'interval',
      is_active: true,
      key_features: [
        'Schedules events',
        'Reminds users of upcoming events',
        'Set default reminder interval',
        'Set reminder interval for an event to the Telex channel',
      ],
      settings: [
        {
          label: 'reminder-interval',
          description: 'The default reminder interval in minutes',
          type: 'number',
          default: 15,
          required: true,
        },
        {
          label: 'interval',
          type: 'text',
          required: true,
          default: '* * * * *',
        },
      ],
      target_url: `${baseUrl}/event`,
      tick_url: `${baseUrl}/tick`,
    },
  });
});

app.post('/event', (req, res) => {
  try {
    const { message, channel_id, settings } = req.body as TelexEventRequest;

    console.log('The request body is', { message, channel_id, settings });

    // Check if message begins with '/event'
    const cleanedMessage = message.replace(/<\/?p>/g, '').trim();
    if (cleanedMessage.startsWith('/event') === false) {
      return;
    }

    const { title, date, time } = parseEventCommand(cleanedMessage);

    const reminderIntervalSetting = settings.find(
      (setting) => setting.label === 'reminder-interval'
    );
    if (!reminderIntervalSetting) {
      throw new Error('Reminder interval setting not found');
    }

    const reminderInterval = reminderIntervalSetting.default;
    const eventData: EventData = {
      id: Date.now().toString(),
      title,
      date,
      time,
      channelId: channel_id,
      reminders: [
        {
          intervalInMinutes: parseInt(reminderInterval),
          label: `${reminderInterval} minutes before`,
        },
      ],
    };

    console.log(`Event received for channel: ${channel_id}`);
    storage.addEvent(eventData);

    res.status(200).send({ message: 'Event received correctly' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An error occurred' });
  }
});

app.post('/tick', (req, res) => {
  const payload: TickPayload = req.body;
  taskQueue.addTask(async () => {
    const events = storage.getEvents();
    const now = new Date();

    events.forEach((event) => {
      const eventDateTime = new Date(`${event.date}T${event.time}`);

      // Delete past events.
      if (eventDateTime < now) {
        storage.deleteEvent(event.id);
      }

      event.reminders.forEach(async (reminder) => {
        const reminderTime = new Date(
          eventDateTime.getTime() - reminder.intervalInMinutes * 60000
        );

        // Send reminder if the reminder time is within a minute of the current time
        if (Math.abs(now.getTime() - reminderTime.getTime()) < 60000) {
          try {
            await fetch(payload.return_url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                event_name: `${event.title} Reminder`,
                username: 'Event Scheduler',
                status: 'success',
                message: `"${event.title}" is scheduled for ${event.date} at ${event.time}.`,
              }),
            });
            console.log('Reminder sent');
          } catch (error) {
            console.error('Error:', error);
          }
        } else {
          console.log('No reminders due');
        }
      });
    });

    res.status(200).send({ message: 'Tick received' });
  });
  res.status(202).send({ status: 'accepted' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
