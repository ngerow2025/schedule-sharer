import { useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Container, Button } from "reactstrap"
import RecurringEventForm from '../../components/RecurringEventForm'
import type { RecurringEvent } from '../../components/RecurringEventForm'

const MySchedule = () => {
    const [preview, setPreview] = useState<RecurringEvent | null>(null)
    const [events, setEvents] = useState<RecurringEvent[]>([])
    const [editing, setEditing] = useState<RecurringEvent | null>(null)
    const [formKey, setFormKey] = useState(0) // used to remount form when initial changes

    function handleChange(value: RecurringEvent) {
        setPreview(value)
    }

    function handleSubmit(value: RecurringEvent) {
        // When saving from the form, always add the event back to saved list
        setEvents((e) => [...e, value])
        setPreview(null)
        // clear editing state and bump form key so form resets
        setEditing(null)
        setFormKey((k) => k + 1)
    }

    function handleEdit(index: number) {
        const ev = events[index]
        // remove it from saved list and load into form
        setEvents((e) => e.filter((_, i) => i !== index))
        setEditing(ev)
        setPreview(ev)
        // bump key so RecurringEventForm re-initializes with new initial
        setFormKey((k) => k + 1)
    }

    function handleDelete(index: number) {
        setEvents((e) => e.filter((_, i) => i !== index))
    }

    return (
        <Container>
            <Card>
                <CardHeader>
                    <CardTitle>My Schedule</CardTitle>
                </CardHeader>
                <CardBody>
                    <p>Create a recurring event:</p>
                    <RecurringEventForm key={formKey} initial={editing || undefined} onChange={handleChange} onSubmit={handleSubmit} />

                    {preview && (
                        <div style={{ marginTop: 12 }}>
                            <h6>Preview</h6>
                            <div><strong>{preview.name}</strong></div>
                            <div>Days: {Object.entries(preview.days).filter(([, v]) => v).map(([k]) => k).join(', ') || 'None'}</div>
                            <div>Time: {preview.start} — {preview.end}</div>
                        </div>
                    )}

                    <div style={{ marginTop: 16 }}>
                        <h6>Saved recurring events</h6>
                        {events.length === 0 && <div>No events yet.</div>}
                        {events.map((ev, i) => (
                            <div key={i} style={{ border: '1px solid #eee', padding: 8, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                <div>
                                    <div><strong>{ev.name}</strong></div>
                                    <div>Days: {Object.entries(ev.days).filter(([, v]) => v).map(([k]) => k).join(', ') || 'None'}</div>
                                    <div>Time: {ev.start} — {ev.end}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Button size="sm" color="warning" onClick={() => handleEdit(i)}>Edit</Button>
                                    <Button size="sm" color="danger" onClick={() => handleDelete(i)}>Delete</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
            <Card>
                 <CardHeader>
                    Current Weekview
                 </CardHeader>
                 <CardBody>
                    
                 </CardBody>
            </Card>
        </Container>
    )
}

export default MySchedule
