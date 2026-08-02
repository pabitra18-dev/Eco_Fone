
import { getAnnouncements } from "@/lib/announcements";
import { AnnouncementsClient } from "./announcements-client";

export default async function AnnouncementsPage() {
    const announcements = await getAnnouncements();

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Announcements</h1>
                    <p className="text-muted-foreground">Create and manage site-wide announcements.</p>
                </div>
            </div>
            <AnnouncementsClient initialAnnouncements={announcements} />
        </div>
    );
}
