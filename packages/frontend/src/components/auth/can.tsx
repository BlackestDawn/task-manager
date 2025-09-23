'use client';
import { type ReactNode } from "react";
import { Can as CaslCan } from "@casl/react"
import { useAuthContext } from "./clientAuthProvider";
import type { Actions, Subjects } from "@task-manager/common";

interface CanProps {
  I: Actions;
  a: Subjects;
  children: ReactNode;
  // fallback?: ReactNode;
}

export function Can({ I, a, children/* , fallback */ }: CanProps) {
  const { ability } = useAuthContext();

  return (
    <CaslCan I={I} a={a} ability={ability} >
      {children}
    </CaslCan>
  );
}

export function Cannot({ I, a, children/* , fallback */ }: CanProps) {
  const { ability } = useAuthContext();

  return (
    <CaslCan not I={I} a={a} ability={ability} >
      {children}
    </CaslCan>
  );
}
