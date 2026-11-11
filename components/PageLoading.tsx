import T from "./T";

export default function PageLoading() {
  return <main className="mx-auto min-h-[55vh] max-w-6xl px-5 py-12 sm:px-8 sm:py-16" aria-busy="true">
    <div className="ui-loading-panel paper max-w-2xl p-7 sm:p-10" role="status">
      <p className="page-eyebrow">TAI WÉN</p>
      <p className="mt-3 text-lg font-semibold"><T>Đang mở Tai Wén…</T></p>
      <div className="mt-8 grid gap-3" aria-hidden="true">
        <span className="ui-skeleton h-5 w-2/3" />
        <span className="ui-skeleton h-4 w-full" />
        <span className="ui-skeleton h-4 w-4/5" />
      </div>
    </div>
  </main>;
}
