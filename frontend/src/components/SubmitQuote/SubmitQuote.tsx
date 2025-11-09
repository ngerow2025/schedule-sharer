import { Button, Card, CardBody, Container, Input } from "reactstrap"
import UserPicker from "../UserPicker"
import { useState } from "react"
import { ReactSortable } from "react-sortablejs"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faCircleMinus,
    faCirclePlus,
    faGrip,
} from "@fortawesome/free-solid-svg-icons"
import { useApi, useFetchArray } from "../../API/API"
import type { CSHUser } from "../../API/Types"
import { toast } from "react-toastify"
import { useOidcUser } from "@axa-fr/react-oidc"
import { NoSSOUserInfo, USE_SSO } from "../../config"
import { extractUsername } from "../../util"

interface QuoteEntry {
    id: number
    speaker: string
    body: string
}

const SubmitQuote = () => {
    const { apiPost } = useApi()

    const { oidcUser } = USE_SSO ? useOidcUser() : { oidcUser: NoSSOUserInfo }

    const userList = useFetchArray<CSHUser>("/api/users")

    const [quoteEntries, setQuoteEntries] = useState<QuoteEntry[]>([
        {
            id: 0,
            body: "",
            speaker: "",
        },
    ])

    const addQuoteEntry = () =>
        setQuoteEntries([
            ...quoteEntries,
            {
                id: quoteEntries.reduce((a, b) => (a.id > b.id ? a : b)).id + 1,
                body: "",
                speaker: "",
            },
        ])

    const deleteQuoteEntry = (quote: QuoteEntry) =>
        setQuoteEntries(quoteEntries.filter(q => q.id !== quote.id))

    const changeQuoteText = (id: number, quote: string) =>
        setQuoteEntries(
            quoteEntries.map(q => ({
                ...q,
                body: q.id === id ? quote : q.body,
            }))
        )

    const changeQuoteUsername = (id: number, username: string) =>
        setQuoteEntries(
            quoteEntries.map(q => ({
                ...q,
                speaker: q.id === id ? username : q.speaker,
            }))
        )

    const canSubmit = () =>
        quoteEntries.every(
            q =>
                q.body.length > 0 &&
                userList
                    .map(u => u.uid.toLocaleLowerCase())
                    .includes(extractUsername(q.speaker) ?? "NONE!") &&
                oidcUser.preferred_username !== extractUsername(q.speaker)
        )

    const submit = () => {
        apiPost("/api/quote", {
            shards: quoteEntries.map(s => ({
                body: s.body,
                speaker: extractUsername(s.speaker),
            })),
        })
            .then(() => {
                toast.success("Submitted Quote!", { theme: "colored" })
                setQuoteEntries([
                    {
                        id: 0,
                        body: "",
                        speaker: "",
                    },
                ])
            })
            .catch(e => console.warn(e))
    }

    return (
        <Card>
            <CardBody>
                <ReactSortable
                    list={quoteEntries}
                    setList={setQuoteEntries}
                    handle=".grab-drag">
                    {quoteEntries.map((q, i) => (
                        <div
                            key={i}
                            className="d-flex align-items-center w-100 mb-3">
                            <FontAwesomeIcon
                                icon={faGrip}
                                className="fa-lg mr-4 grab-drag"
                                title="Drag + Drop"
                            />
                            <div className="w-100">
                                <Input
                                    className="mr-3"
                                    type="text"
                                    placeholder="Quote"
                                    value={q.body}
                                    onChange={e =>
                                        changeQuoteText(q.id, e.target.value)
                                    }
                                />

                                <UserPicker
                                    value={q.speaker}
                                    onChange={e => changeQuoteUsername(q.id, e)}
                                    userList={userList}
                                />
                            </div>
                            <Button
                                className={
                                    "ml-3 shadow-none" +
                                    (quoteEntries.length <= 1
                                        ? ""
                                        : " text-danger")
                                }
                                onClick={() => deleteQuoteEntry(q)}
                                disabled={quoteEntries.length <= 1}
                                title="Remove entry">
                                <FontAwesomeIcon
                                    icon={faCircleMinus}
                                    className="flex-grow-1"
                                />
                            </Button>
                        </div>
                    ))}
                </ReactSortable>
                {quoteEntries.length < 6 && (
                    <Button
                        className="float-right my-2 shadow-none btn-success"
                        onClick={addQuoteEntry}
                        title="Add entry">
                        <FontAwesomeIcon icon={faCirclePlus} />
                    </Button>
                )}
                <Container className="d-flex px-0 pt-3">
                    <Button
                        disabled={!canSubmit()}
                        onClick={submit}
                        color="primary"
                        className="flex-grow-1">
                        Submit
                    </Button>
                </Container>
            </CardBody>
        </Card>
    )
}

export default SubmitQuote
