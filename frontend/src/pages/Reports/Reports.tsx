import { useEffect, useState } from "react"
import { toastError, useApi } from "../../API/API"
import type { Quote, Report } from "../../API/Types"
import QuoteCard from "../../components/QuoteCard"
import { Card, CardBody, CardFooter, Container } from "reactstrap"
import ConfirmDialog from "../../components/ConfirmDialog"
import { toast } from "react-toastify"

interface ReportData extends Report {
    quote?: Quote
}

const Reports = () => {
    const { apiGet, apiPut } = useApi()

    const [reports, setReports] = useState<ReportData[]>([])

    useEffect(() => {
        apiGet<Report[]>("/api/reports")
            .then(setReports)
            .catch(toastError("Unable to fetch reports"))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        for (const r of reports) {
            if (!r.quote) {
                apiGet<Quote>(`/api/quote/${r.quote_id}`)
                    .then(q =>
                        setReports(rs =>
                            rs.map(r =>
                                r.quote_id === q.id ? { ...r, quote: q } : r
                            )
                        )
                    )
                    .catch(
                        toastError(
                            `Failed to fetch Quote for quote_id ${r.quote_id}`
                        )
                    )
                return
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reports])

    const sortQuotes = (a: ReportData, b: ReportData) =>
        ((a, b) => a.getTime() - b.getTime())(
            new Date(a.quote!.timestamp + "Z"),
            new Date(b.quote!.timestamp + "Z")
        )

    const resolve = (report: ReportData, action: "HIDE" | "IGNORE") => {
        apiPut(`/api/quote/${report.quote_id}/resolve`, undefined, {
            hide: action === "HIDE",
        })
            .then(() => {
                toast.success("Reports resolved!", { theme: "colored" })
                setReports(rs => rs.filter(r => r.quote_id !== report.quote_id))
            })
            .catch(toastError(`Failed to ${action.toLowerCase()} Quote`))
    }

    if (reports.length === 0) {
        return <p className="text-center">No Reports!!!! Yay :)</p>
    }

    return (
        <Container>
            {reports
                .filter(r => r.quote)
                .sort(sortQuotes)
                .map((r, i) => (
                    <Card className="mb-3" key={i}>
                        <CardBody>
                            <QuoteCard quote={r.quote!} />
                            {r.reports.map((r, j) => (
                                <div key={`${i}-${j}`} className="mt-3">
                                    <p className="mb-1">{r.reason}</p>
                                    <i className="font-weight-light">
                                        {new Date(r.timestamp)
                                            .toLocaleString()
                                            .replace(", ", " at ")}
                                    </i>
                                </div>
                            ))}
                        </CardBody>

                        <CardFooter>
                            <div className="float-right">
                                <ConfirmDialog
                                    onClick={() => resolve(r, "HIDE")}
                                    buttonClassName="btn-warning">
                                    Hide
                                </ConfirmDialog>
                                <ConfirmDialog
                                    onClick={() => resolve(r, "IGNORE")}
                                    buttonClassName="ml-1">
                                    Ignore
                                </ConfirmDialog>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
        </Container>
    )
}

export default Reports
