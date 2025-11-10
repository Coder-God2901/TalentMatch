"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "./utils";

// forward ref for Root (optional) — keep simple wrapper
const Dialog = React.forwardRef<any, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>>(function Dialog(props, _ref) {
  // DialogPrimitive.Root does not accept a ref prop, so we don't forward it into the Root element.
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
});
Dialog.displayName = "Dialog";

// Trigger should forward ref
const DialogTrigger = React.forwardRef<any, React.ComponentProps<typeof DialogPrimitive.Trigger>>(function DialogTrigger(props, ref) {
  return <DialogPrimitive.Trigger ref={ref} data-slot="dialog-trigger" {...props} />;
});
DialogTrigger.displayName = "DialogTrigger";

// Portal forward ref
const DialogPortal = React.forwardRef<any, React.ComponentProps<typeof DialogPrimitive.Portal>>(function DialogPortal(props, _ref) {
  // DialogPrimitive.Portal does not accept a ref prop, so we don't forward it into the Portal element.
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
});
DialogPortal.displayName = "DialogPortal";

// Close forward ref
const DialogClose = React.forwardRef<any, React.ComponentProps<typeof DialogPrimitive.Close>>(function DialogClose(props, ref) {
  return <DialogPrimitive.Close ref={ref} data-slot="dialog-close" {...props} />;
});
DialogClose.displayName = "DialogClose";

// Overlay must forward ref so Radix can control it
const DialogOverlay = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof DialogPrimitive.Overlay>>(function DialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
});
DialogOverlay.displayName = "DialogOverlay";

// Content forward ref and use portal wrapper to center
const DialogContent = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof DialogPrimitive.Content>>(function DialogContent({ className, children, ...props }, ref) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogPrimitive.Content
          ref={ref}
          data-slot="dialog-content"
          className={cn(
            "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
            className,
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(function DialogHeader({ className, ...props }, ref) {
  return <div ref={ref} data-slot="dialog-header" className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />;
});
DialogHeader.displayName = "DialogHeader";

const DialogFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(function DialogFooter({ className, ...props }, ref) {
  return <div ref={ref} data-slot="dialog-footer" className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
});
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.ComponentProps<typeof DialogPrimitive.Title>>(function DialogTitle({ className, ...props }, ref) {
  return <DialogPrimitive.Title ref={ref} data-slot="dialog-title" className={cn("text-lg leading-none font-semibold", className)} {...props} />;
});
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.ComponentProps<typeof DialogPrimitive.Description>>(function DialogDescription({ className, ...props }, ref) {
  return <DialogPrimitive.Description ref={ref} data-slot="dialog-description" className={cn("text-muted-foreground text-sm", className)} {...props} />;
});
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
