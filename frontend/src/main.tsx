import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import "csh-material-bootstrap/dist/csh-material-bootstrap.css"
import { OidcProvider, OidcSecure } from "@axa-fr/react-oidc"
import configuration, { USE_SSO } from "./config"

// eslint-disable-next-line react-refresh/only-export-components
const NoneComponent = () => <></>

// eslint-disable-next-line react-refresh/only-export-components
const ErrorComponent = (text: string) => () => (
    <h3 className="text-center mt-3">{text}</h3>
)

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        {USE_SSO ? 
        <OidcProvider
            configuration={configuration}
            loadingComponent={NoneComponent}
            authenticatingComponent={NoneComponent}
            callbackSuccessComponent={NoneComponent}
            authenticatingErrorComponent={ErrorComponent(
                "Error during Authentication."
            )}
            sessionLostComponent={ErrorComponent(
                "Session was lost. Please log back in."
            )}>
            <OidcSecure>
                <App />
            </OidcSecure>
        </OidcProvider> : <App />}
    </React.StrictMode>
)
