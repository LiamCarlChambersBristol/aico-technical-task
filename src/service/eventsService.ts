import { EventsRepo } from "../repo/eventsRepo";

export class EventsService {
    constructor(private eventsRepo: EventsRepo) {}

    async getEvents() {
        return this.eventsRepo.getEvents();
    }
}