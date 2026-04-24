export const PRINT_MODE_ATTRIBUTE = "data-printing-section";
export const PRINT_TARGET_ATTRIBUTE = "data-print-target";

export function printSection(targetId: string): boolean {
  const target = document.getElementById(targetId);
  if (!target) {
    return false;
  }

  document.body.setAttribute(PRINT_MODE_ATTRIBUTE, "true");
  target.setAttribute(PRINT_TARGET_ATTRIBUTE, "true");

  try {
    window.print();
    return true;
  } finally {
    document.body.removeAttribute(PRINT_MODE_ATTRIBUTE);
    target.removeAttribute(PRINT_TARGET_ATTRIBUTE);
  }
}
