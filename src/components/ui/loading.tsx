/* eslint-disable @typescript-eslint/no-unused-vars */
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { ComponentProps } from "react";

const spinnerVariants = cva("animate-spin text-muted", {
    variants: {
        size: {
            default: "",
            large: "w-36 h-36",
        },
    },
});

type Props = ComponentProps<"svg"> & VariantProps<typeof spinnerVariants>;

export const LoadingSpinner = ({ className, size }: Props) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(spinnerVariants({ size, className }))}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
};
