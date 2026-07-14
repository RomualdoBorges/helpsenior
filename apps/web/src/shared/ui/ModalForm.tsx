import {
  useEffect,
  useRef,
  type FormEventHandler,
  type ReactNode,
  type SyntheticEvent,
} from "react";

import { Button } from "./Button";
import { classNames } from "./classNames";

type ModalFormWidth = "xl" | "2xl";

interface ModalFormProps {
  busyLabel: string;
  children: ReactNode;
  className?: string;
  description: ReactNode;
  descriptionId: string;
  isOpen: boolean;
  isSubmitting: boolean;
  maxWidth?: ModalFormWidth;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  submitLabel: string;
  title: string;
  titleId: string;
}

const widthClassNames: Record<ModalFormWidth, string> = {
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export function ModalForm({
  busyLabel,
  children,
  className,
  description,
  descriptionId,
  isOpen,
  isSubmitting,
  maxWidth = "xl",
  onClose,
  onSubmit,
  submitLabel,
  title,
  titleId,
}: ModalFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();

    if (!isSubmitting) {
      onClose();
    }
  }

  function handleClose() {
    if (isOpen) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClose={handleClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={classNames(
        "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-950 shadow-2xl backdrop:bg-slate-950/60",
        widthClassNames[maxWidth],
        className,
      )}>
      <form onSubmit={onSubmit} className="create-form p-6">
        <h3 id={titleId} className="m-0 text-2xl font-bold">
          {title}
        </h3>

        <p
          id={descriptionId}
          className="simple-mode-secondary mt-2 text-sm font-bold leading-5 text-slate-500">
          {description}
        </p>

        <div className="mt-5 grid gap-4">{children}</div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            disabled={isSubmitting}
            onClick={onClose}>
            Cancelar
          </Button>

          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? busyLabel : submitLabel}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
