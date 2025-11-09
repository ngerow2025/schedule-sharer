import { useSearchParams } from "react-router-dom"
import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Container,
    Input,
} from "reactstrap"
import { toastError, useApi, useFetch } from "../../API/API"
import QuoteCard from "../../components/QuoteCard"
import type { Quote } from "../../API/Types"
import ConfirmDialog from "../../components/ConfirmDialog"
import { useState } from "react"
import { toast } from "react-toastify"

const SubmitReport = () => {
    const [queryParams] = useSearchParams()

    const { apiPost } = useApi()

    const quote = useFetch<Quote>(`/api/quote/${queryParams.get("id")}`)

    const [reportText, setReportText] = useState<string>("")

    const submit = () => {
        apiPost(`/api/quote/${quote?.id}/report`, {
            reason: reportText,
        })
            .then(() => {
                toast.success("Submitted report!", { theme: "colored" })
                setTimeout(() => window.location.assign("/"), 1000)
            })
            .catch(toastError("Failed to submit report"))
    }

    if (!quote) {
        return <></>
    }

    return (
        <Container>
            <QuoteCard quote={quote} />
            <Card>
                <CardHeader>
                    <CardTitle>Report Message</CardTitle>
                </CardHeader>
                <CardBody className="d-flex py-">
                    <Input
                        type="text"
                        placeholder="Why do you want to report this Quote?"
                        value={reportText}
                        onChange={e => setReportText(e.target.value)}
                    />
                    <ConfirmDialog
                        onClick={submit}
                        buttonClassName="btn-danger ml-2"
                        disabled={reportText.length === 0}>
                        Submit
                    </ConfirmDialog>
                </CardBody>
            </Card>
        </Container>
    )
}

export default SubmitReport
