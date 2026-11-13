import MascotLoader, { type MascotLoaderVariant } from "./MascotLoader";

export default function PageLoading({ variant, message = "Đang mở Tai Wén…", fullViewport = false }: { variant?: MascotLoaderVariant; message?: string; fullViewport?: boolean }) {
  return <main className={`mascot-loading-screen${fullViewport ? " mascot-loading-screen-full" : ""}`} aria-busy="true">
    <MascotLoader variant={variant} message={message} />
  </main>;
}
