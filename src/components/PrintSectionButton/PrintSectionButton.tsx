import { Button } from "@/components/ui/button";
import { printSection } from "@/lib/printSection";
import { LuPrinter } from "react-icons/lu";

interface PrintSectionButtonProps {
  targetId: string;
  label: string;
}

export function PrintSectionButton({ targetId, label }: PrintSectionButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-xl"
      data-print-hide="true"
      onClick={() => {
        printSection(targetId);
      }}
    >
      <LuPrinter className="h-4 w-4" />
      {label}
    </Button>
  );
}
