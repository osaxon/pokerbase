import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useMediaQuery } from "usehooks-ts";
import { Button } from "./ui/button";

export interface DrawerDialogProps extends DialogPrimitive.DialogProps {
    triggerLabel: string;
    title: string;
    description?: string;
    drawerCloseLabel?: string;
    children: React.ReactNode;
}

export default function DrawerDialog(props: DrawerDialogProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return (
            <Dialog open={props.open} onOpenChange={props.onOpenChange}>
                <DialogTrigger asChild>
                    <Button variant="outline">{props.triggerLabel}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{props.title}</DialogTitle>
                        {props.description && (
                            <DialogDescription>
                                {props.description}
                            </DialogDescription>
                        )}
                    </DialogHeader>
                    {props.children}
                </DialogContent>
            </Dialog>
        );
    }
    return (
        <Drawer open={props.open} onOpenChange={props.onOpenChange}>
            <DrawerTrigger asChild>
                <Button variant="outline">{props.triggerLabel}</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>{props.title}</DrawerTitle>
                    {props.description && (
                        <DrawerDescription>
                            {props.description}
                        </DrawerDescription>
                    )}
                </DrawerHeader>
                <div className="p-4">{props.children}</div>
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">
                            {props.drawerCloseLabel ?? "Cancel"}
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
