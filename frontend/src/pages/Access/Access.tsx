import React, { useEffect, useState } from "react"
import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Container,
    Button,
    Input,
    Badge,
    Form,
    FormGroup,
    Label,
} from "reactstrap"
import { useApi, toastError } from "../../API/API"

// Lightweight local types for the access page. These mirror simple server shapes.
interface EventItem {
    id: number
    name: string
    start?: string
    end?: string
    tags?: string[]
}

interface Group {
    id?: number
    name: string
    tags: string[]
    users: string[]
}

interface CSHUser {
    username: string,
    uuid: string,
    fullName: string,
}

const Access = () => {
    const { apiGet, apiPost, apiPatch } = useApi()
    const [events, setEvents] = useState<EventItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Group form state
    const [groupName, setGroupName] = useState("")
    const [groupUsers, setGroupUsers] = useState("") // comma separated uids
    const [groupTags, setGroupTags] = useState("") // comma separated tags
    const [groups, setGroups] = useState<Group[]>([])

    const [users, setUsers] = useState<CSHUser[]>([])

    console.log("asdfsadf")

    useEffect(() => {
        apiGet<CSHUser[]>("/users")
            .then(u => {
                setUsers(u || [])
            })
            .catch(err => {
                toastError("Failed to load users")(err)
            })
    }, [])

    useEffect(() => {
        setLoading(true)
        apiGet<EventItem[]>("/events")
            .then(e => {
                setEvents(e || [])
                setError(null)
            })
            .catch(err => {
                setError("Failed to load events")
                toastError("Failed to load events")(err)
            })
            .finally(() => setLoading(false))

        // load groups if server supports it (best-effort)
        apiGet<Group[]>('/access/groups')
            .then(g => setGroups(g || []))
            .catch(() => {
                // ignore - groups may not exist yet on server
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const addTagToEvent = (ev: EventItem, tag: string) => {
        const normalized = tag.trim()
        if (!normalized) return
        const current = new Set(ev.tags || [])
        if (current.has(normalized)) return
        const updatedTags = [...Array.from(current), normalized]

        // optimistic update
        setEvents(prev => prev.map(p => (p.id === ev.id ? { ...p, tags: updatedTags } : p)))

        // try to persist
        apiPatch(`/events/${ev.id}/tags`, { tags: updatedTags })
            .then(() => {
                // success
            })
            .catch(err => {
                // rollback on error (re-fetch or remove tag)
                toastError("Failed to save tags")(err)
                setEvents(prev => prev.map(p => (p.id === ev.id ? { ...p, tags: ev.tags || [] } : p)))
            })
    }

    const removeTagFromEvent = (ev: EventItem, tag: string) => {
        const updatedTags = (ev.tags || []).filter(t => t !== tag)
        setEvents(prev => prev.map(p => (p.id === ev.id ? { ...p, tags: updatedTags } : p)))
        apiPatch(`/events/${ev.id}/tags`, { tags: updatedTags }).catch(err => {
            toastError("Failed to remove tag")(err)
            setEvents(prev => prev.map(p => (p.id === ev.id ? { ...p, tags: ev.tags || [] } : p)))
        })
    }

    const handleCreateGroup = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        const g: Group = {
            name: groupName.trim(),
            tags: groupTags.split(",").map(t => t.trim()).filter(Boolean),
            users: groupUsers.split(",").map(u => u.trim()).filter(Boolean),
        }
        if (!g.name) {
            setError("Group must have a name")
            return
        }
        // optimistic add locally
        setGroups(prev => [...prev, g])
        setGroupName("")
        setGroupTags("")
        setGroupUsers("")

        apiPost('/access/groups', g)
            .then(resp => resp.json && resp.json())
            .then(() => {
                // if server returns full groups we could re-fetch; keep best-effort
            })
            .catch(err => {
                toastError("Failed to create group")(err)
                // remove last optimistic
                setGroups(prev => prev.filter(x => x !== g))
            })
    }

    return (
        <Container>
            <Card>
                <CardHeader>
                    <CardTitle>Access — Events & Tags</CardTitle>
                </CardHeader>
                <CardBody>
                    {loading && <div>Loading events…</div>}
                    {error && <div style={{ color: "red" }}>{error}</div>}
                    {!loading && events.length === 0 && <div>No events for your account.</div>}

                    {events.map(ev => (
                        <div key={ev.id} style={{ border: "1px solid #eee", padding: 12, marginBottom: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{ev.name}</div>
                                    <div style={{ fontSize: 12, color: "#666" }}>{ev.start || ""} — {ev.end || ""}</div>
                                </div>
                            </div>
                            <div style={{ marginTop: 8 }}>
                                {(ev.tags || []).map(t => (
                                    <Badge color="secondary" key={t} style={{ marginRight: 6 }}>
                                        {t}
                                        <Button close onClick={() => removeTagFromEvent(ev, t)} aria-label={`Remove ${t}`} style={{ marginLeft: 6 }} />
                                    </Badge>
                                ))}
                            </div>
                            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                                <TagInput onAdd={(tag) => addTagToEvent(ev, tag)} />
                            </div>
                        </div>
                    ))}
                </CardBody>
            </Card>

            <Card style={{ marginTop: 12 }}>
                <CardHeader>
                    <CardTitle>Groups</CardTitle>
                </CardHeader>
                <CardBody>
                    <Form onSubmit={handleCreateGroup}>
                        <FormGroup>
                            <Label for="groupName">Group name</Label>
                            <Input id="groupName" value={groupName} onChange={e => setGroupName(e.target.value)} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="groupUsers">Users (comma-separated UIDs)</Label>
                            <Input id="groupUsers" value={groupUsers} onChange={e => setGroupUsers(e.target.value)} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="groupTags">Tags allowed (comma-separated)</Label>
                            <Input id="groupTags" value={groupTags} onChange={e => setGroupTags(e.target.value)} />
                        </FormGroup>
                        <Button color="primary" type="submit">Create Group</Button>
                    </Form>

                    <div style={{ marginTop: 12 }}>
                        <h6>Existing groups</h6>
                        {groups.length === 0 && <div>No groups yet.</div>}
                        {groups.map((g, i) => (
                            <div key={i} style={{ border: "1px solid #eee", padding: 8, marginTop: 8 }}>
                                <div style={{ fontWeight: 600 }}>{g.name}</div>
                                <div style={{ fontSize: 12 }}>Users: {g.users.join(", ") || "(none)"}</div>
                                <div style={{ fontSize: 12 }}>Tags: {g.tags.join(", ") || "(none)"}</div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </Container>
    )
}

// small TagInput component in the same file for simplicity
const TagInput: React.FC<{ onAdd: (tag: string) => void }> = ({ onAdd }) => {
    const [val, setVal] = useState("")
    return (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Input value={val} onChange={e => setVal(e.target.value)} placeholder="Add tag…" />
            <Button color="success" onClick={() => { onAdd(val); setVal("") }}>Add</Button>
        </div>
    )
}

export default Access
