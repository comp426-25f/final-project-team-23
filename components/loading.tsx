import { Loader2Icon } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader2Icon className="animate-spin" />
    </div>
  );
}
