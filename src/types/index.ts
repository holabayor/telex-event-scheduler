export interface Reminder {
    intervalinMinutes: number;
    intervalLabel: string;
}

export interface EventData {
    id: string;
    title: string;
    date: string;
    time: string;
    description?: string;
    reminders: Reminder[];
}