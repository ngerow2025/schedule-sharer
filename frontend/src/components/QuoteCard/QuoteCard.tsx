import {
    Button,
    Card,
    CardBody,
    CardFooter,
    Dropdown,
    DropdownMenu,
    DropdownToggle,
} from "reactstrap"
import type { Quote, Vote } from "../../API/Types"
import { formatUser } from "../../API/Types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faCaretDown,
    faCaretUp,
    faSquareCaretDown,
    faSquareCaretUp,
    faEllipsis,
    faStar,
} from "@fortawesome/free-solid-svg-icons"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { assignParams } from "../../pages/Storage"

interface Props {
    quote: Quote
    onVoteChange?: (type: Vote) => void
    onFavorite?: (favorite: boolean) => void
    children?: ReactNode
}

const QuoteCard = (props: Props) => {
    const [vote, setVote] = useState<Vote>(null)
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)

    const toggleDropdownOpen = () => setDropdownOpen(prevState => !prevState)

    const updateVote = (state: Vote) => {
        props.onVoteChange!(state)
        setVote(state)
    }

    useEffect(() => {
        setVote(props.quote.vote)
    }, [props.quote])

    const hidden = props.quote.hidden
    const hiddenByContent = hidden && (
        <p>
            Hidden by&nbsp;
            <a
                onClick={() =>
                    assignParams({
                        involved: hidden.actor.uid,
                    })
                }
                href="#"
                className="text-primary">
                <b>{formatUser(hidden.actor)}</b>
            </a>
            . Reason: {hidden.reason}
        </p>
    )

    return (
        <Card
            className={`mb-3 ${props.quote.hidden && "border-warning"}`}
            style={props.quote.hidden ? { borderWidth: "5px" } : {}}>
            <CardBody className="d-flex pr-2">
                <span className="float-left flex-grow-1">
                    {props.quote.shards.map((s, i) => (
                        <p key={i}>
                            {s.body} - &nbsp;
                            <a
                                onClick={() =>
                                    assignParams({ involved: s.speaker.uid })
                                }
                                href="#"
                                className="text-primary">
                                <b>{formatUser(s.speaker)}</b>
                            </a>
                        </p>
                    ))}
                </span>
                {props.onVoteChange && (
                    <span className="float-right ml-4 d-flex flex-column">
                        <FontAwesomeIcon
                            icon={
                                vote === "upvote" ? faSquareCaretUp : faCaretUp
                            }
                            onClick={() =>
                                updateVote(vote === "upvote" ? null : "upvote")
                            }
                            className={`fa-3x ${
                                vote === "upvote" ? "text-success" : ""
                            }`}
                        />
                        <h2
                            className="text-center my-0 mx-2"
                            style={{ minWidth: "3rem" }}>
                            {props.quote.score}
                        </h2>
                        <FontAwesomeIcon
                            icon={
                                vote === "downvote"
                                    ? faSquareCaretDown
                                    : faCaretDown
                            }
                            onClick={() =>
                                updateVote(
                                    vote === "downvote" ? null : "downvote"
                                )
                            }
                            className={`fa-3x dw-100 ${
                                vote === "downvote" ? "text-danger" : ""
                            }`}
                        />
                    </span>
                )}
            </CardBody>
            <CardFooter>
                <div className="d-flex">
                    <div className="d-flex flex-row float-left flex-grow-1">
                        <div className="d-flex flex-column float-left flex-grow-1">
                            <p>
                                Submitted By&nbsp;
                                <a
                                    onClick={() =>
                                        assignParams({
                                            involved: props.quote.submitter.uid,
                                        })
                                    }
                                    href="#"
                                    className="text-primary">
                                    <b>{formatUser(props.quote.submitter)}</b>
                                </a>
                                &nbsp;on{" "}
                                {new Date(props.quote.timestamp + "Z")
                                    .toLocaleString()
                                    .replace(", ", " at ")}
                            </p>
                            {hiddenByContent}
                        </div>
                    </div>

                    {props.onFavorite && (
                        <Button
                            className="shadow-none"
                            style={{
                                background: props.quote.favorited
                                    ? "gold"
                                    : "none",
                            }}
                            onClick={() =>
                                props.onFavorite!(!props.quote.favorited)
                            }>
                            <FontAwesomeIcon icon={faStar} />
                        </Button>
                    )}

                    {props.children && (
                        <Dropdown
                            isOpen={dropdownOpen}
                            toggle={toggleDropdownOpen}
                            className="float-right d-flex">
                            <DropdownToggle
                                className="shadow-none"
                                style={{ background: "none" }}>
                                <FontAwesomeIcon icon={faEllipsis} />
                            </DropdownToggle>
                            <DropdownMenu>{props.children}</DropdownMenu>
                        </Dropdown>
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}

export default QuoteCard
