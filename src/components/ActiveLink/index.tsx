import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";

// import { cloneElement } from "react";

interface ActiveLinkProps extends LinkProps {
  children: React.ReactNode;
  activeClassName: string;
}

export function ActiveLink({ children, activeClassName, ...rest }: ActiveLinkProps) {
  const { asPath } = useRouter();

  const className = asPath === rest.href
    ? activeClassName
    : '';

  return (
    <Link className={className} {...rest}>
      {children}
    </Link>
  )
}