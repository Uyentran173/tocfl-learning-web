import MascotLoader, { type MascotLoaderVariant } from "./MascotLoader";

export default function PageLoading({ variant, message = "Đang mở Tai Wén…" }: { variant?: MascotLoaderVariant; message?: string }) {
  return <main className="mx-auto min-h-[55vh] max-w-6xl px-5 py-12 sm:px-8 sm:py-16" aria-busy="true">
    <div className="ui-loading-panel paper max-w-2xl p-7 sm:p-10">
      <p className="page-eyebrow">TAI WÉN</p>
      <MascotLoader variant={variant} message={message} />
      <div className="mt-8 grid gap-3" aria-hidden="true">
        <span className="ui-skeleton h-5 w-2/3" />
        <span className="ui-skeleton h-4 w-full" />
        <span className="ui-skeleton h-4 w-4/5" />
      </div>
    </div>
  </main>;
}
