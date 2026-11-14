import { ExploreHome } from "@/components/ExploreExperience";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("Khám phá Tai Wén", "Tìm hiểu câu chuyện Tai Wén, cách học với Academy, từ vựng và đề TOCFL, cùng những câu hỏi thường gặp.", "/explore");
export default function Page() { return <ExploreHome />; }
