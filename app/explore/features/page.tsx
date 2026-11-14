import { ExploreFeatures } from "@/components/ExploreExperience";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("Hướng dẫn tính năng", "Cách dùng Tai Wén Academy, từ vựng, thẻ từ, luyện đề TOCFL, xem lại đáp án và theo dõi tiến độ học.", "/explore/features");
export default function Page() { return <ExploreFeatures />; }
