interface FormAlertProps {
  message?: string | null;
}

export default function FormAlert({ message }: FormAlertProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] leading-5 text-red-700"
    >
      <i className="fas fa-circle-exclamation mr-2" aria-hidden="true" />
      {message}
    </div>
  );
}
