"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      className="absolute top-4 right-4"
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
  );
} 