import { BellRing } from "lucide-react";

interface LogoProps {
  variant?: "default" | "light";
  authBanner?:boolean
}

export function Logo({ authBanner=false,variant = "default" }: LogoProps) {
  const isLight = variant === "light";

  return (
    <div
      className={`flex items-center gap-2 cursor-pointer tracking-tight ${
        isLight ? "text-white" : "text-[var(--heading)]"
      }`}
    >
      <div
        className={`p-2 rounded-xl shadow-sm flex items-center justify-center ${
          isLight
            ? "bg-[#F2B63F] text-[var(--primary)]"
            : "bg-[var(--primary)] text-[#F2B63F] dark:bg-[#F2B63F] dark:text-[#0B1220]"
        }`}
      >
        <BellRing className="w-5 h-5" />
      </div>

      <span className={`text-[21px] font-extrabold ${authBanner?"text-white":""}`}>
        Remind
        <span className="text-[#E09A12]">CA</span>
      </span>
    </div>
  );
}
