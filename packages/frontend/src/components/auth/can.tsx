'use client';
import { type ReactNode } from "react";
import { Can as CaslCan } from "@casl/react"
import { useAuthContext } from "./clientAuthProvider";
import type { Actions, Subjects, User, Task, Group } from "@task-manager/common";

interface CanProps {
  I: Actions;
  a: Subjects | User | Task | Group;
  field?: string;
  children: ReactNode;
}

export function Can({ I, a, field, children }: CanProps) {
  const { ability } = useAuthContext();

  return (
    <CaslCan I={I} a={a} field={field} ability={ability} >
      {children}
    </CaslCan>
  );
}

export function Cannot({ I, a, field, children }: CanProps) {
  const { ability } = useAuthContext();

  return (
    <CaslCan not I={I} a={a} field={field} ability={ability} >
      {children}
    </CaslCan>
  );
}

function detectSubjectType(obj: any): Subjects {
  if (obj.type) return obj.type as Subjects;

  if ('login' in obj && 'accessLevel' in obj) return 'User';
  if ('title' in obj && 'userId' in obj) return 'Task';
  if ('name' in obj && 'description' in obj && !('userId' in obj)) return 'Group';

  if (process.env.NODE_ENV === 'development') {
    console.warn('Could not detect subject type for object:', obj);
  }

  return 'all';
}
