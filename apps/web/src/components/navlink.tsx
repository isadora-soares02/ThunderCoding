import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import type { AnchorHTMLAttributes, ReactNode, RefObject } from "react";
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

const NavLink = ({
    className,
    activeClassName,
    href,
    end,
    ref,
    ...props
}: NavLinkProps & { ref?: RefObject<HTMLAnchorElement | null> }) => {
    const pathname = usePathname();

    const hrefString = typeof href === "string" ? href : (href.pathname ?? "");

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
        />
    );
};

NavLink.displayName = "NavLink";

export { NavLink };
