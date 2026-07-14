import { Clock } from "@axionyx/ports";

export class SystemClock implements Clock {
  now(): string {
    return new Date().toISOString();
  }
  
  unixTimestamp(): number {
    return Date.now();
  }
}
