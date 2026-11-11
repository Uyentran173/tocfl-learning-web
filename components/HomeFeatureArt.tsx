type Kind = "words" | "exam" | "guide";

export default function HomeFeatureArt({ kind }: { kind: Kind }) {
  if (kind === "words") return <svg viewBox="0 0 180 130" fill="none" aria-hidden="true">
    <path d="M24 31c17-11 34-11 58-2v77c-23-9-41-9-58 2V31Z" fill="#fffdf5" stroke="currentColor" strokeWidth="3"/>
    <path d="M82 29c24-9 41-9 58 2v77c-17-11-35-11-58-2V29Z" fill="#fff7ec" stroke="currentColor" strokeWidth="3"/>
    <path d="M82 29v77M40 51h23m-23 12h15m42-12h24m-24 12h17" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <text x="45" y="95" fill="currentColor" fontSize="25" fontFamily="sans-serif">學</text>
    <path d="M138 34c1-15 9-23 23-25-1 16-8 24-23 25Zm-6 7c-6-13-15-16-27-12 6 14 15 17 27 12Z" fill="#8fbd97" stroke="currentColor" strokeWidth="2"/>
    <path d="M134 47c2-14 8-26 18-36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>;
  if (kind === "exam") return <svg viewBox="0 0 180 130" fill="none" aria-hidden="true">
    <path d="M47 14h65l19 19v84H47a9 9 0 0 1-9-9V23a9 9 0 0 1 9-9Z" fill="#fffdf5" stroke="currentColor" strokeWidth="3"/>
    <path d="M112 14v19h19M56 50h54M56 61h40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="65" cy="85" r="9" fill="#e2ebff" stroke="currentColor" strokeWidth="2"/><circle cx="93" cy="85" r="9" fill="#e2ebff" stroke="currentColor" strokeWidth="2"/><circle cx="121" cy="85" r="9" fill="#e2ebff" stroke="currentColor" strokeWidth="2"/>
    <path d="m88 85 4 4 7-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="m145 24 3-11m8 20 10-6m-16 20 12 1" stroke="#df9a74" strokeWidth="3" strokeLinecap="round"/>
  </svg>;
  return <svg viewBox="0 0 180 130" fill="none" aria-hidden="true">
    <path d="M17 100c29-15 51-11 72-2 20 8 43 9 74-7" stroke="currentColor" strokeWidth="3" strokeDasharray="5 7" strokeLinecap="round"/>
    <path d="M68 106V67h7V55h9V42h9V27h10V13h8v14h11v15h9v13h9v12h7v39" fill="#d9f0e5" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M80 69h56M86 56h44M94 43h27M100 29h15" stroke="currentColor" strokeWidth="2"/>
    <path d="M28 52a13 13 0 1 0 26 0 13 13 0 0 0-26 0Zm13 13v19" stroke="currentColor" strokeWidth="3"/>
    <circle cx="145" cy="91" r="8" fill="#fff5df" stroke="currentColor" strokeWidth="3"/>
  </svg>;
}
