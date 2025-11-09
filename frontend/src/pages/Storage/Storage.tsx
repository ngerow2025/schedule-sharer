import { useEffect, useState } from "react"
import { useConstCallback } from "powerhooks"
import type { CSHUser, Quote, Vote } from "../../API/Types"
import InfiniteScroll from "react-infinite-scroll-component"
import { toastError, useApi, useFetchArray } from "../../API/API"
import { toast } from "react-toastify"
import QuoteCard from "../../components/QuoteCard/QuoteCard"
import { useOidcUser } from "@axa-fr/react-oidc"
import { NoSSOUserInfo, USE_SSO } from "../../config"
import ConfirmModal from "../../components/ConfirmModal"
import { isEboardOrRTP } from "../../util"
import { useSearchParams } from "react-router-dom"
import Search from "./Search"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faEyeSlash,
    faFlag,
    faTrash,
    faX,
} from "@fortawesome/free-solid-svg-icons"
import { deleteParams, searchParams } from "."
import { Badge, Button, Container, DropdownItem, Input } from "reactstrap"

const pageSize = parseInt(import.meta.env.VITE_QUOTEFAULT_STORAGE_PAGE_SIZE || "10")

interface Props {
    storageType: "STORAGE" | "HIDDEN" | "PERSONAL" | "FAVORITES"
}

interface ModalProps {
    quote: Quote
    confirmAction: (quote: Quote) => void
    isOpen: boolean
    color: string
    headerText: string
    confirmText: string
    inputPlaceholder?: string
}

type QuoteDict = { [key: number]: Quote }

const Storage = (props: Props) => {
    const { oidcUser } = USE_SSO ? useOidcUser() : { oidcUser: NoSSOUserInfo }

    const [queryParams] = useSearchParams()

    const getParam = (key: string): string | null =>
        queryParams.has(key) ? queryParams.get(key) || null : null

    const { apiGet, apiPut, apiDelete, apiPost } = useApi()

    const userList = useFetchArray<CSHUser>("/api/users")

    const [quotes, setQuotes] = useState<QuoteDict>([])

    const getQuotes = (q?: QuoteDict) => Object.values(q || quotes)

    const [isMore, setIsMore] = useState<boolean>(true)

    const [modalState, setModalState] = useState<ModalProps | null>(null)

    const [reportText, setReportText] = useState<string>("")

    if (props.storageType === "PERSONAL" && getParam("involved")) {
        window.location.assign(`/storage?involved=${getParam("involved")}`)
    }

    const fetchQuotes = (quotes?: QuoteDict) => {
        if (!oidcUser) {
            return
        }

        const getVar = (name: string) =>
            getParam(name) ? { [name]: getParam(name) } : {}

        const storageTypeParams = (() => {
            switch (props.storageType) {
                case "STORAGE":
                    return { hidden: false }
                case "HIDDEN":
                    return { hidden: true }
                case "PERSONAL":
                    return { involved: oidcUser.preferred_username }
                case "FAVORITES":
                    return { favorited: true }
            }
        })()

        apiGet<Quote[]>("/api/quotes", {
            lt: getQuotes(quotes).reduce(
                (a, b) => (a.id < b.id && a.id != 0 ? a : b),
                { id: 0 }
            ).id,
            limit: pageSize,
            ...searchParams
                .map(s => getVar(s.param))
                .reduce((a, b) => ({ ...a, ...b })),
            ...storageTypeParams,
        })
            .then(q => {
                if (q.length < pageSize) {
                    setIsMore(false)
                }
                return q
            })
            .then(qs =>
                setQuotes(quotes => ({
                    ...qs
                        .map(q => ({ [q.id]: q }))
                        .reduce((a, b) => ({ ...a, ...b }), {}),
                    ...quotes,
                }))
            )
            .catch(toastError("Error fetching Quotes"))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(fetchQuotes, [oidcUser])

    const updateQuote = (id: number) =>
        apiGet<Quote>(`/api/quote/${id}`)
            .then(q => setQuotes(getQuotes().map(o => (o.id === q.id ? q : o))))
            .catch(toastError("Failed to update quote"))

    const canHide = (q: Quote) =>
        props.storageType !== "HIDDEN" &&
        !q.hidden &&
        (isEboardOrRTP(oidcUser) ||
            q.shards
                .map(s => s.speaker.uid)
                .includes(oidcUser.preferred_username || ""))

    const deleteQuote = (quote: Quote) => {
        apiDelete(`/api/quote/${quote.id}`)
            .then(() => toast.success("Deleted Quote!", { theme: "colored" }))
            .then(() =>
                setQuotes(quotes =>
                    getQuotes(quotes).filter(q => q.id !== quote.id)
                )
            )
            .catch(toastError("Failed to delete quote"))
    }

    const hideQuote = useConstCallback((quote: Quote) => {
        apiPut(`/api/quote/${quote.id}/hide`, { reason: reportText })
            .then(() =>
                setQuotes(quotes =>
                    getQuotes(quotes).filter(q => q.id !== quote.id)
                )
            )
            .catch(toastError("Failed to hide quote"))
    })

    const reportQuote = useConstCallback((quote: Quote) =>
        apiPost(`/api/quote/${quote?.id}/report`, {
            reason: reportText,
        })
            .then(() =>
                toast.success("Submitted report!", { theme: "colored" })
            )
            .catch(toastError("Failed to submit report"))
    )

    const confirmHide = (quote: Quote) => {
        setModalState({
            confirmText: "Hide",
            color: "warning",
            isOpen: true,
            headerText: "Are you sure you want to hide this quote?",
            quote: quote,
            confirmAction: hideQuote,
            inputPlaceholder: "Why do you want to hide this quote?",
        })
    }
    const confirmDelete = (quote: Quote) => {
        setModalState({
            confirmText: "Delete",
            color: "danger",
            isOpen: true,
            headerText: "Are you sure you want to delete this quote?",
            quote: quote,
            confirmAction: deleteQuote,
        })
    }
    const confirmReport = (quote: Quote) => {
        setModalState({
            confirmText: "Report",
            color: "primary",
            isOpen: true,
            headerText: "Why do you want to report this quote?",
            quote: quote,
            confirmAction: reportQuote,
            inputPlaceholder: "Why do you want to report this quote?",
        })
    }

    const voteChange = (quote: Quote) => (action: Vote) => {
        switch (action) {
            case null: {
                apiDelete(`/api/quote/${quote.id}/vote`)
                    .then(() => updateQuote(quote.id))
                    .catch(toastError("Failed to alter vote"))
                break
            }
            default: {
                apiPost(`/api/quote/${quote.id}/vote`, undefined, {
                    vote: action,
                })
                    .then(() => updateQuote(quote.id))
                    .catch(toastError("Failed to alter vote"))
            }
        }
    }

    const favoriteChange = (quote: Quote) => (favorite: boolean) => {
        if (favorite) {
            apiPost(`/api/quote/${quote.id}/favorite`)
                .then(() => updateQuote(quote.id))
                .catch(toastError("Failed to favorite quote"))
        } else {
            apiDelete(`/api/quote/${quote.id}/favorite`)
                .then(() => {
                    if (props.storageType === "FAVORITES") {
                        setQuotes(quotes =>
                            getQuotes(quotes).filter(q => q.id !== quote.id)
                        )
                    } else {
                        updateQuote(quote.id)
                    }
                })
                .catch(toastError("Failed to un-favorite quote"))
        }
    }

    const sortQuotes = (a: Quote, b: Quote) =>
        ((a, b) => b.getTime() - a.getTime())(
            new Date(a.timestamp + "Z"),
            new Date(b.timestamp + "Z")
        )

    const canBeFunny = () =>
        !isMore &&
        searchParams.every(p => !getParam(p.param)) &&
        props.storageType === "STORAGE"

    const searchBadges = searchParams.filter(q => getParam(q.param))

    return (
        <Container>
            <Search userList={userList} />

            <span className="d-flex my-3">
                {searchBadges.map((q, i) => (
                    <p key={i} className="d-inline h5">
                        <Badge
                            color="light"
                            className="mr-2 text-dark font-weight-normal p-2 my-1">
                            <b>{q.name}</b>:&nbsp;
                            {(s =>
                                q.username
                                    ? userList
                                          .filter(u => u.uid === s)
                                          .map(u => `${u.cn} (${u.uid})`)[0] ??
                                      s
                                    : s)(getParam(q.param))}
                            <Button
                                size="sm"
                                className="ml-2 bg-transparent shadow-none p-0"
                                color=""
                                onClick={() => deleteParams(q.param)}>
                                <FontAwesomeIcon icon={faX} />
                            </Button>
                        </Badge>
                    </p>
                ))}
            </span>

            <h1 className="mb-4" style={{ textTransform: "capitalize" }}>
                {props.storageType.toLocaleLowerCase()}
            </h1>

            <InfiniteScroll
                dataLength={getQuotes().length}
                next={fetchQuotes}
                hasMore={isMore}
                loader={<p className="text-center">Loading ...</p>}>
                <Container>
                    {getQuotes()
                        .sort(sortQuotes)
                        .map((q, i) => (
                            <QuoteCard
                                key={i}
                                quote={q}
                                onVoteChange={voteChange(q)}
                                onFavorite={favoriteChange(q)}>
                                {oidcUser.preferred_username ===
                                    q.submitter.uid && (
                                    <DropdownItem
                                        onClick={() => confirmDelete(q)}
                                        className="btn-danger shadow-none">
                                        <FontAwesomeIcon
                                            icon={faTrash}
                                            className="mr-2"
                                            fixedWidth
                                        />
                                        Delete
                                    </DropdownItem>
                                )}

                                {canHide(q) && (
                                    <DropdownItem
                                        onClick={() => confirmHide(q)}
                                        className="btn-warning shadow-none">
                                        <FontAwesomeIcon
                                            icon={faEyeSlash}
                                            className="mr-2"
                                            fixedWidth
                                        />
                                        Hide
                                    </DropdownItem>
                                )}

                                {props.storageType !== "HIDDEN" && (
                                    <DropdownItem
                                        onClick={() => confirmReport(q)}
                                        className="btn-danger shadow-none">
                                        <FontAwesomeIcon
                                            icon={faFlag}
                                            className="mr-2"
                                            fixedWidth
                                        />
                                        Report
                                    </DropdownItem>
                                )}
                            </QuoteCard>
                        ))}

                    {isMore && (
                        <div className="d-flex justify-content-center mb-3">
                            <Button
                                onClick={() => fetchQuotes()}
                                className="btn-info">
                                Load more
                            </Button>
                        </div>
                    )}
                    {canBeFunny() && (
                        <div className="text-center mb-3">
                            How did you read ALL of the quotes lol
                        </div>
                    )}
                    {modalState && (
                        <ConfirmModal
                            onConfirm={() =>
                                modalState.confirmAction(modalState.quote)
                            }
                            isOpen={modalState.isOpen}
                            headerText={modalState.headerText}
                            toggle={() =>
                                setModalState({
                                    ...modalState,
                                    isOpen: !modalState.isOpen,
                                })
                            }
                            color={modalState.color}
                            confirmText={modalState.confirmText}>
                            <QuoteCard quote={modalState.quote} />
                            {modalState.inputPlaceholder && (
                                <Input
                                    type="text"
                                    placeholder={modalState.inputPlaceholder}
                                    value={reportText}
                                    onChange={e => {
                                        setReportText(e.target.value)
                                    }}
                                />
                            )}
                        </ConfirmModal>
                    )}
                </Container>
            </InfiniteScroll>
        </Container>
    )
}

export default Storage
