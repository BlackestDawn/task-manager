'use client';
import { type ReactNode } from "react";
import { Can as CaslCan } from "@casl/react"
import { useAuthContext } from "./clientAuthProvider";
import { useMounted } from "@/hooks/useMounted";
import type { Actions, Subjects, User, Task, Group } from "@task-manager/common";

interface CanProps {
  I: Actions;
  a: Subjects | User | Task | Group;
  field?: string;
  children: ReactNode;
}

export function Can({ I, a, field, children }: CanProps) {
  const { ability } = useAuthContext();
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <CaslCan I={I} a={a} field={field} ability={ability} >
      {children}
    </CaslCan>
  );
}

export function Cannot({ I, a, field, children }: CanProps) {
  const { ability } = useAuthContext();
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <CaslCan not I={I} a={a} field={field} ability={ability} >
      {children}
    </CaslCan>
  );
}
