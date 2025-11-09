import { toastError, useApi } from "../../API/API"
import { toast } from "react-toastify"
import { Card, CardBody, CardHeader, CardTitle, Container } from "reactstrap"
import ConfirmDialog from "../../components/ConfirmDialog"
import { useOidcUser } from "@axa-fr/react-oidc"
import { NoSSOUserInfo, USE_SSO } from "../../config"
import { isEboardOrRTP } from "../../util"

const Kevlar = () => {
    const { apiPut, apiDelete } = useApi()
    const { oidcUser } = USE_SSO ? useOidcUser() : { oidcUser: NoSSOUserInfo }

    const submit = () => {
        apiPut("/api/kevlar")
            .then(() => {
                toast.success("Toggled Kevlar!", { theme: "colored" })
                setTimeout(() => window.location.assign("/"), 1000)
            })
            .catch(
                toastError(
                    "Failed to toggle Kevlar. Have you used this too recently?"
                )
            )
    }

    const clearcache = () => {
        apiDelete("/api/kevlar")
            .then(() => {
                toast.success("Cache cleared!", { theme: "colored" })
            })
            .catch(toastError("Failed to clear cache"))
    }

    return (
        <Container>
            <Card>
                <CardHeader>
                    <CardTitle>Toggle Kevlar</CardTitle>
                </CardHeader>
                <CardBody className="d-flex py-">
                    <ConfirmDialog
                        onClick={submit}
                        buttonClassName="btn-danger ml-2">
                        Toggle
                    </ConfirmDialog>
                </CardBody>
            </Card>
            {isEboardOrRTP(oidcUser) && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Clear Kevlar Cache</CardTitle>
                        </CardHeader>
                        <CardBody className="d-flex py-">
                            <ConfirmDialog
                                onClick={clearcache}
                                buttonClassName="btn-danger ml-2">
                                Clear Cache
                            </ConfirmDialog>
                        </CardBody>
                    </Card>
                </>
            )}
        </Container>
    )
}

export default Kevlar
