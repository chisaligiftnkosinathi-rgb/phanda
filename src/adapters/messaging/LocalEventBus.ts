import { EventPublisher, EventSubscriber } from "@axionyx/ports";
import { EpistemicEvent } from "@axionyx/contracts";

export class LocalEventBus implements EventPublisher, EventSubscriber {
  private handlers: ((event: EpistemicEvent) => Promise<void>)[] = [];

  async publish(event: EpistemicEvent): Promise<void> {
    console.log(`[Adapter] Publishing event to bus: ${event.type}`);
    for (const handler of this.handlers) {
      await handler(event);
    }
  }

  subscribe(handler: (event: EpistemicEvent) => Promise<void>): void {
    this.handlers.push(handler);
  }
}
