import * as React from "react";
import { cn } from "@/lib/utils";

// List
const List = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("text-sm w-full space-y-2", className)}
    {...props}
  />
));
List.displayName = "List";

// ListItem
const ListItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("flex justify-between", className)}
    {...props}
  />
));
ListItem.displayName = "ListItem";

export { List, ListItem };
