"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import type { AnchorHTMLAttributes, RefObject } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps
    extends LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
    activeClassName?: string;
    end?: boolean;
}

const NavLink = ({
    className,
    activeClassName,
    href,
    end,
    ref,
    ...props
}: NavLinkProps & { ref?: RefObject<HTMLAnchorElement | null> }) => {
    const pathname = usePathname();
    const hrefString = href.toString();

    const isActive = end
        ? pathname === hrefString
        : hrefString === "/"
            ? pathname === "/"
            : pathname === hrefString || pathname.startsWith(`${hrefString}/`);

    return (
        <Link
            className={cn(className, isActive && activeClassName)}
            href={href}
            ref={ref}
            {...props}
        />
    );
};

NavLink.displayName = "NavLink";

export { NavLink };
