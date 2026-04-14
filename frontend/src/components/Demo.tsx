import RotatingEarth from "@/components/ui/wireframe-dotted-globe";

export default function DemoOne() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#020617]">
      <RotatingEarth width={1000} height={800} />
    </div>
  );
}
