import { ExploreContact } from "@/components/ExploreExperience";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("Liên hệ và góp ý", "Báo lỗi, góp ý về bài học và trải nghiệm học trên Tai Wén qua kênh phản hồi công khai của dự án.", "/explore/contact");
export default function Page() { return <ExploreContact />; }
