"use client";

import { BackButton } from "@/components/auth/back-button";
import {
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card";

interface Props {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
}

export function CardWrapper({
  children,
  // headerLabel,
  backButtonLabel,
  backButtonHref,
}: Props) {
  return (
    <Card className="w-[400px] shadow-md">
      {/* <CardHeader>
        <Header label={headerLabel} />
      </CardHeader> */}
      <CardContent>{children}</CardContent>
      <CardFooter>
        <BackButton href={backButtonHref} label={backButtonLabel} />
      </CardFooter>
    </Card>
  );
}
