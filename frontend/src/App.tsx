import { Container } from "reactstrap"
import Home from "./pages/Home"
import NavBar from "./components/NavBar"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Storage from "./pages/Storage"
import Kevlar from "./pages/Kevlar"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import SubmitReport from "./pages/SubmitReport"
import Reports from "./pages/Reports"

function App() {
    return (
        <BrowserRouter>
            <Container className="main px-0" fluid>
                <NavBar />
                <ToastContainer
                    theme="colored"
                    hideProgressBar
                    newestOnTop
                    className="py-5 my-5"
                    autoClose={5000}
                />
                <Container style={{ marginTop: "90px" }} className="px-0">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/storage"
                            element={<Storage storageType="STORAGE" />}
                        />
                        <Route
                            path="/hidden"
                            element={<Storage storageType="HIDDEN" />}
                        />
                        <Route
                            path="/personal"
                            element={<Storage storageType="PERSONAL" />}
                        />
                        <Route
                            path="/favorites"
                            element={<Storage storageType="FAVORITES" />}
                        />
                        <Route path="/kevlar" element={<Kevlar />} />
                        <Route path="/report" element={<SubmitReport />} />
                        <Route path="/reports" element={<Reports />} />
                    </Routes>
                </Container>
            </Container>
        </BrowserRouter>
    )
}

export default App
