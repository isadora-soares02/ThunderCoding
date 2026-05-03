"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { type AnchorHTMLAttributes, forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavLinkClassName = string | ((props: { isActive: boolean }) => string);

interface NavLinkProps
    extends LinkProps,
    Omit<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        keyof LinkProps | "className"
    > {
    activeClassName?: string;
    children?: ReactNode;
    className?: NavLinkClassName;
    end?: boolean;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
    ({ className, activeClassName, href, end, ...props }, ref) => {
        const pathname = usePathname();

        const hrefString =
            typeof href === "string"
                ? href
                : typeof href.pathname === "string"
                    ? href.pathname
                    : "";

        console.log({ pathname, hrefString })

        const isActive = end
            ? pathname === hrefString
            : hrefString === "/"
                ? pathname === "/"
                : pathname === hrefString || pathname.startsWith(`${hrefString}/`);

        const resolvedClassName =
            typeof className === "function" ? className({ isActive }) : className;

        return (
            <Link
                className={cn(resolvedClassName, isActive && activeClassName)}
                href={href}
                ref={ref}
                {...props}
            >
                {props.children}
            </Link>
        );
    }
);

NavLink.displayName = "NavLink";

export { NavLink };
