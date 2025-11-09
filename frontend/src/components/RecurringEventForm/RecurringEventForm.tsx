import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import './RecurringEventForm.css';

import {
  Card,
  CardBody,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Badge,
  InputGroup,
} from 'reactstrap';

export type RecurringEvent = {
  name: string;
  days: {
    sun: boolean;
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
  };
  start: string; // HH:MM
  end: string; // HH:MM
};

export type RecurringEventFormProps = {
  initial?: Partial<RecurringEvent>;
  onChange?: (value: RecurringEvent) => void;
  onSubmit?: (value: RecurringEvent) => void;
};

const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function timeToMinutes(t: string) {
  const [hh, mm] = t.split(':').map(Number);
  return hh * 60 + mm;
}

function minutesToTime(m: number) {
  const hh = Math.floor(m / 60) % 24;
  const mm = m % 60;
  return `${pad(hh)}:${pad(mm)}`;
}

function formatTime12(t: string) {
  const [hh, mm] = t.split(':').map(Number);
  const suffix = hh >= 12 ? 'PM' : 'AM';
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour12}:${pad(mm)} ${suffix}`;
}

export default function RecurringEventForm({ initial, onChange, onSubmit }: RecurringEventFormProps) {
  const defaultEvent: RecurringEvent = {
    name: '',
    days: { sun: false, mon: false, tue: false, wed: false, thu: false, fri: false, sat: false },
    start: '09:00',
    end: '17:00',
  };

  const merged = { ...defaultEvent, ...(initial || {}) } as RecurringEvent;

  const [name, setName] = useState<string>(merged.name);
  const [days, setDays] = useState(merged.days);
  const [start, setStart] = useState(merged.start);
  const [end, setEnd] = useState(merged.end);
  const [lastAdjustment, setLastAdjustment] = useState<string | null>(null);

  // Generate time options in 10-minute increments
  const timeOptions = useMemo(() => {
    const opts: string[] = [];
    for (let m = 0; m < 24 * 60; m += 10) {
      opts.push(minutesToTime(m));
    }
    return opts;
  }, []);

  // Ensure end is not before start. If it is, adjust end to be start.
  useEffect(() => {
    const s = timeToMinutes(start);
    const e = timeToMinutes(end);
    if (e <= s) {
      // set end to next valid slot after start (at least +10 minutes) or same as start if at end of day
      const newEndMinutes = Math.min(s + 10, 24 * 60 - 1);
      const newEnd = minutesToTime(newEndMinutes - (newEndMinutes % 10));
      if (newEnd !== end) {
        setEnd(newEnd);
        setLastAdjustment(newEnd);
        // clear the message after a few seconds
        const t = setTimeout(() => setLastAdjustment(null), 3000);
        return () => clearTimeout(t);
      }
    }
  }, [start]);

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange({ name, days, start, end });
    }
  }, [name, days, start, end]);

  const dayLabels: Record<string, string> = {
    sun: 'Sun',
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
  };

  function toggleDay(key: keyof RecurringEvent['days']) {
    setDays((d) => ({ ...d, [key]: !d[key] }));
  }

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (onSubmit) onSubmit({ name, days, start, end });
  }

  function formatDuration(s: string, e: string) {
    const diff = timeToMinutes(e) - timeToMinutes(s);
    if (diff <= 0) return '0m';
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours ? `${hours}h` : ''}${hours && minutes ? ' ' : ''}${minutes ? `${minutes}m` : ''}`.trim();
  }

  return (
    <Card className="recurring-event-card mb-3">
      <CardBody>
        <Form onSubmit={handleSubmit}>
          <Row className="align-items-center">
            <Col md="6">
              <FormGroup>
                <Label for="re-name">Name</Label>
                <Input id="re-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Event name" />
              </FormGroup>

              <FormGroup>
                <Label>Days</Label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {dayKeys.map((k) => {
                    const selected = !!days[k];
                    return (
                      <Button
                        key={k}
                        color="primary"
                        outline={!selected}
                        onClick={() => toggleDay(k)}
                        active={selected}
                        aria-pressed={selected}
                        className="text-capitalize"
                        style={{ flex: 1, minWidth: 40, padding: '0.45rem 0.75rem', minHeight: 40 }}
                      >
                        {dayLabels[k] ?? k}
                      </Button>
                    );
                  })}
                </div>
              </FormGroup>
            </Col>

            <Col md="3">
              <FormGroup>
                <Label>Time</Label>
                <InputGroup>
                  <Input
                    id="re-start"
                    type="select"
                    className="re-time-select"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    style={{ padding: '0.45rem 0.75rem', minHeight: 40 }}
                  >
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>{formatTime12(t)}</option>
                    ))}
                  </Input>

                  {/* custom arrow moved to the selects via CSS background-image; remove group arrow */}

                  <Input
                    id="re-end"
                    type="select"
                    className="re-time-select"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    style={{ padding: '0.45rem 0.75rem', minHeight: 40 }}
                  >
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>{formatTime12(t)}</option>
                    ))}
                  </Input>

                </InputGroup>

                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 13, color: '#666', minWidth: 64 }}>Duration</div>
                  <Badge color="secondary" pill style={{ fontSize: 14, padding: '0.4rem 0.6rem' }}>
                    {formatDuration(start, end)}
                  </Badge>
                </div>

                {lastAdjustment && (
                  <div className="text-muted small mt-1">End adjusted to {formatTime12(lastAdjustment)}</div>
                )}
              </FormGroup>
            </Col>

            <Col md="3">
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button color="primary" type="submit">Save</Button>
                <Button color="secondary" type="button" onClick={() => {
                  setName('');
                  setDays({ sun: false, mon: false, tue: false, wed: false, thu: false, fri: false, sat: false });
                  setStart('09:00');
                  setEnd('17:00');
                }}>Reset</Button>
              </div>
            </Col>
          </Row>
        </Form>
      </CardBody>
    </Card>
  );
}
