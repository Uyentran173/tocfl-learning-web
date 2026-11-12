import MascotLoader, { type MascotLoaderVariant } from "./MascotLoader";

export default function PageLoading({ variant, message = "Đang mở Tai Wén…" }: { variant?: MascotLoaderVariant; message?: string }) {
  return <main className="mascot-loading-screen" aria-busy="true">
    <MascotLoader variant={variant} message={message} />
  </main>;
}
