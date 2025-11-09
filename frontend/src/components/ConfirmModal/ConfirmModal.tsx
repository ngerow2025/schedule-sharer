import { PropsWithChildren } from "react"
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap"

interface ConfirmModalProps extends PropsWithChildren {
    onConfirm: () => void
    headerText: string
    confirmText?: string
    cancelText?: string
    color?: string
    isOpen: boolean
    toggle: () => void
}

const ConfirmModal = (props: ConfirmModalProps) => {
    return (
        <>
            <Modal isOpen={props.isOpen} toggle={props.toggle} size="lg">
                <ModalHeader>{props.headerText}</ModalHeader>
                {props.children && <ModalBody>{props.children}</ModalBody>}
                <ModalFooter>
                    <Button
                        color={props.color || "primary"}
                        onClick={() => {
                            props.onConfirm()
                            props.toggle()
                        }}>
                        {props.confirmText || "Confirm"}
                    </Button>
                    <Button color="secondary" onClick={props.toggle}>
                        {props.cancelText || "Cancel"}
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default ConfirmModal
