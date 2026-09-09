"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/stores/locale-store";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function LangToggle() {
  const { locale, toggleLocale } = useLocaleStore();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      if (locale === "zh") {
        document.documentElement.classList.add("font-zh");
      } else {
        document.documentElement.classList.remove("font-zh");
      }
    }
  }, [locale]);

  const handleToggle = () => {
    const nextLang = locale === "en" ? "zh" : "en";
    toggleLocale();
    toast.success(
      nextLang === "en" ? "Language switched to English" : "语言已切换为 中文"
    );
  };

  return (
    <div
      onClick={handleToggle}
      title={locale === "en" ? "Current: English (Click to switch to 中文)" : "当前: 中文 (点击切换至 English)"}
      className="flex items-center gap-1.5 p-1 rounded-full bg-white border border-[#D8D2C8] shadow-xs cursor-pointer select-none transition-all hover:border-[#046241]/60"
    >
      <div className="w-6 h-6 rounded-full bg-[#046241]/10 flex items-center justify-center text-[#046241] ml-0.5">
        <Globe className="w-3.5 h-3.5 text-[#046241]" />
      </div>

      <div className="relative flex items-center bg-[#F9F7F7] rounded-full p-0.5 text-xs font-bold text-[#133020]">
        {/* Animated active language background indicator pill */}
        <motion.div
          className="absolute top-0.5 bottom-0.5 rounded-full bg-[#046241] shadow-xs"
          initial={false}
          animate={{
            left: locale === "en" ? "2px" : "calc(50% + 1px)",
            width: "calc(50% - 3px)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />

        <button
          type="button"
          className={`relative z-10 px-2.5 py-0.5 text-[11px] font-extrabold transition-colors ${
            locale === "en" ? "text-white" : "text-[#666666] hover:text-[#133020]"
          }`}
        >
          EN
        </button>

        <button
          type="button"
          className={`relative z-10 px-2.5 py-0.5 text-[11px] font-extrabold transition-colors ${
            locale === "zh" ? "text-white" : "text-[#666666] hover:text-[#133020]"
          }`}
        >
          中文
        </button>
      </div>
    </div>
  );
}
