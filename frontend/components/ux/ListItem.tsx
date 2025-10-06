import * as React from "react";
import Link from "next/link";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";

interface ListItemProps extends React.ComponentPropsWithoutRef<"li"> {
  title: string;
  href: string;
  children: React.ReactNode;
}

export function ListItem({ title, href, children, ...props }: ListItemProps) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
