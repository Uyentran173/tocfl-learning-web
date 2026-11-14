import { ExploreAbout } from "@/components/ExploreExperience";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("Về Tai Wén", "Câu chuyện của Uyên Trần và mục đích tạo nên Tai Wén: một nơi học tiếng Hoa Đài Loan và luyện TOCFL dễ dùng.", "/explore/about");
export default function Page() { return <ExploreAbout />; }
