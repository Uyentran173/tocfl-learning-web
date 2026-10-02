export function FormosanBear({ className = "", decorative = false }: { className?: string; decorative?: boolean }) {
  return <svg className={className} viewBox="0 0 180 190" role={decorative ? undefined : "img"} aria-label={decorative ? undefined : "Linh vật gấu đen Formosan"} aria-hidden={decorative || undefined} xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="90" cy="178" rx="65" ry="8" fill="#011f82" opacity=".09"/>
    <circle cx="41" cy="47" r="23" fill="#17243b"/><circle cx="139" cy="47" r="23" fill="#17243b"/>
    <circle cx="41" cy="47" r="12" fill="#52627d"/><circle cx="139" cy="47" r="12" fill="#52627d"/>
    <path d="M29 124c0-35 27-59 61-59s61 24 61 59v30c0 17-17 29-61 29s-61-12-61-29v-30Z" fill="#17243b"/>
    <ellipse cx="90" cy="86" rx="62" ry="58" fill="#1d2b42"/>
    <ellipse cx="66" cy="87" rx="5" ry="6" fill="#fff"/><ellipse cx="114" cy="87" rx="5" ry="6" fill="#fff"/>
    <circle cx="67" cy="86" r="2" fill="#dce7ff"/><circle cx="115" cy="86" r="2" fill="#dce7ff"/>
    <ellipse cx="48" cy="104" rx="10" ry="6" fill="#b97985" opacity=".55"/><ellipse cx="132" cy="104" rx="10" ry="6" fill="#b97985" opacity=".55"/>
    <ellipse cx="90" cy="111" rx="28" ry="21" fill="#f4f6fa"/>
    <path d="M82 104c0-4 4-6 8-6s8 2 8 6c0 4-5 7-8 7s-8-3-8-7Z" fill="#17243b"/>
    <path d="M90 111v7m0 0c-5 5-10 5-14 1m14-1c5 5 10 5 14 1" fill="none" stroke="#17243b" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M52 137c13 4 20 12 38 28 18-16 25-24 38-28-7 16-20 30-38 40-18-10-31-24-38-40Z" fill="#f5f7fb"/>
    <ellipse cx="35" cy="145" rx="17" ry="28" transform="rotate(-20 35 145)" fill="#1d2b42"/>
    <ellipse cx="145" cy="145" rx="17" ry="28" transform="rotate(20 145 145)" fill="#1d2b42"/>
  </svg>;
}

export function TaiwanLandscape({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 480 190" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <circle cx="376" cy="43" r="23" fill="#f2cba8" opacity=".8"/>
    <path d="M0 155 78 92l42 36 67-78 89 105H0Z" fill="#b5c7ed" opacity=".62"/>
    <path d="m123 160 99-85 67 56 55-42 136 71H123Z" fill="#8fa8db" opacity=".48"/>
    <path d="M0 171c80-30 159-36 240-18 79 18 159 22 240-3v40H0Z" fill="#7d9bd0" opacity=".25"/>
    <path d="M264 66c-16 0-20 10-8 14h71c10-4 5-13-8-13-6-11-22-11-28-3-9-4-18-3-27 2Z" fill="#fff" opacity=".82"/>
    <path d="M49 42c-12 0-14 8-5 11h46c8-3 4-9-5-9-5-8-16-8-20-2-6-3-11-3-16 0Z" fill="#fff" opacity=".78"/>
  </svg>;
}

export function TeaCup({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 100 100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M31 18c-7 9 5 11-1 20m19-22c-7 9 5 11-1 20m19-18c-7 9 5 11-1 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".55"/>
    <path d="M16 46h60v19c0 13-11 22-24 22H40c-13 0-24-9-24-22V46Z" fill="#fff" stroke="currentColor" strokeWidth="3"/>
    <path d="M76 52h8c8 0 11 5 11 11s-6 11-17 11h-3" fill="none" stroke="currentColor" strokeWidth="3"/>
    <path d="M11 91h72" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <path d="M31 60c9 8 22 8 31 0" fill="none" stroke="currentColor" strokeWidth="2" opacity=".55"/>
  </svg>;
}
