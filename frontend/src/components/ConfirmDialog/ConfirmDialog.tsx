import { PropsWithChildren, useId, useState } from "react"
import { Button, Popover, PopoverBody, PopoverHeader } from "reactstrap"

interface ConfirmButtonProps extends PropsWithChildren {
    onClick: () => void
    headerText?: string
    confirmText?: string
    cancelText?: string
    buttonClassName?: string
    disabled?: boolean
    placement?: typeof Popover.prototype.props.placement
}

const ConfirmDialog = (props: ConfirmButtonProps) => {
    const id = useId().replace(/:/g, "-")

    const [open, setOpen] = useState(false)

    return (
        <>
            <Button
                id={`confirm-dialog-${id}`}
                className={`btn ${props.buttonClassName}`}
                disabled={props.disabled}
                onClick={() => setOpen(o => !o)}
                onBlur={() => setOpen(false)}
                onTouchCancel={() => setOpen(false)}
                onTouchEnd={() => setOpen(false)}>
                {props.children}
            </Button>
            <Popover
                target={`confirm-dialog-${id}`}
                isOpen={open}
                placement={props.placement || "bottom"}>
                <PopoverHeader>
                    {props.headerText || "Are you sure?"}
                </PopoverHeader>
                <PopoverBody>
                    <Button
                        color=""
                        size="sm"
                        className="mr-2"
                        onClick={() => setOpen(false)}>
                        {props.cancelText || "Cancel"}
                    </Button>
                    <Button
                        color="danger"
                        size="sm"
                        className="float-right"
                        onClick={() => {
                            setOpen(false)
                            props.onClick()
                        }}>
                        {props.confirmText || props.children}
                    </Button>
                </PopoverBody>
            </Popover>
        </>
    )
}

export default ConfirmDialog
