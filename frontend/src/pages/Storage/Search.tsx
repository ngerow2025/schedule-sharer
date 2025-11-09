import { faMagnifyingGlass, faSliders } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"
import { Button, Card, CardBody, Col, Input, Label, Row } from "reactstrap"
import UserPicker from "../../components/UserPicker"
import { assignParams } from "."
import type { CSHUser } from "../../API/Types"
import { extractUsername } from "../../util"

interface Props {
    userList: CSHUser[]
}

const Search = (props: Props) => {
    const [settingsVisible, setSettingsVisible] = useState<boolean>(false)

    const [search, setSearch] = useState<string>("")

    const [submitter, setSubmitter] = useState<string>("")

    const [speaker, setSpeaker] = useState<string>("")

    const [involved, setInvolved] = useState<string>("")

    const canApply = [speaker, submitter, involved].every(
        u =>
            !u ||
            props.userList
                .map(c => c.uid)
                .includes(extractUsername(u) ?? "NONE!")
    )

    const apply = () => {
        assignParams(
            settingsVisible
                ? {
                      q: search,
                      speaker: extractUsername(speaker) ?? "",
                      submitter: extractUsername(submitter) ?? "",
                      involved: extractUsername(involved) ?? "",
                  }
                : {
                      q: search,
                  }
        )
    }

    return (
        <Card className="" style={{ borderRadius: "20px" }}>
            <CardBody className="d-flex p-0 rounded-pill px-2">
                <Button
                    className="btn-sm shadow-none rounded-pill d-flex align-items-center"
                    onClick={apply}>
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="py-0"
                    />
                </Button>

                <Input
                    type="text"
                    placeholder="Search"
                    className=""
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && apply()}
                />

                <Button
                    className="btn-sm shadow-none rounded-pill d-flex align-items-center"
                    onClick={() => setSettingsVisible(s => !s)}>
                    <FontAwesomeIcon icon={faSliders} className="py-0" />
                </Button>
            </CardBody>

            {settingsVisible && (
                <CardBody className="px-4">
                    <Row>
                        <Col xs="12" md="4" className="mb-4">
                            <Label for="submitter">Submitter: </Label>
                            <UserPicker
                                inputId="submitter"
                                value={submitter}
                                onChange={e => setSubmitter(e)}
                                userList={props.userList}
                            />
                        </Col>

                        <Col xs="12" md="4" className="mb-4">
                            <Label for="speaker">Speaker: </Label>
                            <UserPicker
                                inputId="speaker"
                                value={speaker}
                                onChange={e => setSpeaker(e)}
                                userList={props.userList}
                            />
                        </Col>

                        <Col xs="12" md="4" className="mb-4">
                            <Label for="involved">Involved: </Label>
                            <UserPicker
                                inputId="involved"
                                value={involved}
                                onChange={e => setInvolved(e)}
                                userList={props.userList}
                            />
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col xl="12 d-flex">
                            <Button
                                className="flex-grow-1"
                                color="primary"
                                disabled={!canApply}
                                onClick={apply}>
                                Apply
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            )}
        </Card>
    )
}

export default Search
