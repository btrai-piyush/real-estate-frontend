"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Squares2X2Icon,
  PlusIcon,
  EnvelopeIcon,
  GiftTopIcon,
  UserIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

const navItemsMain = [
  { label: "Dashboard", icon: Squares2X2Icon, href: "/admin/dashboard/", hasDropdown: false },
  { label: "Create Listing", icon: PlusIcon, href: "/admin/create-listing/", hasDropdown: false },
  { label: "Messages", icon: EnvelopeIcon, href: "/admin/messages/", hasDropdown: false },
];

const navItemsManageListings = [
  { label: "My Properties", icon: HomeIcon, href: "/admin/my-properties/", hasDropdown: false },
  // { label: "Reviews", icon: ChatBubbleLeftRightIcon, href: "/admin/reviews", hasDropdown: true },
  // { label: "My Favorites", icon: MagnifyingGlassIcon, href: "/admin/favorites", hasDropdown: false },
  // { label: "Saved Search", icon: MagnifyingGlassIcon, href: "/admin/saved-search", hasDropdown: false },
];

const navItemsManageAccount = [
  // { label: "My Package", icon: GiftTopIcon, href: "/admin/package", hasDropdown: false },
  { label: "My Profile", icon: UserIcon, href: "/admin/my-profile/", hasDropdown: false },
  // { label: "Logout", icon: ArrowLeftStartOnRectangleIcon, href: "/admin/logout", hasDropdown: false },
];

const navItemsAccounting=[
{ label: "Manage Branches", icon: GiftTopIcon, href: "/admin/manage-branches/", hasDropdown: false },
{ label: "Master Group ", icon: UserIcon, href: "/admin/master-group/", hasDropdown: false },
{ label: "GL Group", icon: UserIcon, href: "/admin/gl-group/", hasDropdown: false },
{ label: "GL Head", icon: UserIcon, href: "/admin/gl-head/", hasDropdown: false },
{label: "Journal Entry", icon: UserIcon, href: "/admin/journal-entry/", hasDropdown: false },
{label: "Voucher Verification", icon: UserIcon, href: "/admin/voucher-verification/", hasDropdown: false },
];

function ChevronDown({ className = "" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5.5 7.75L10 12.25L14.5 7.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionLinks({ items, onNavigate }) {
  const pathname = usePathname();
  const normalizedPathname = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");

  return (
    <ul>
      {items.map((item) => {
        const Icon = item.icon;
        const normalizedHref = item.href === "/" ? "/" : item.href.replace(/\/+$/, "");
        const isActive =
          item.href !== "#" &&
          (normalizedPathname === normalizedHref || normalizedPathname.startsWith(`${normalizedHref}/`));

        return (
          <li key={item.label}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 px-4 py-3 text-[15px] font-medium transition-colors ${
                isActive
                  ? "bg-[#162744] text-white"
                  : "text-[#8ea2c8] hover:bg-[#162744] hover:text-white"
              }`}
            >
              <span
                className={`absolute inset-y-0 -left-1 w-1 bg-yellow-400 transition-opacity ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              />
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.hasDropdown ? (
                <ChevronDown className="h-4 w-4 text-[#8297bc] group-hover:text-white" />
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function MainNavLinks({ onNavigate }) {
    return (
      <SectionLinks items={navItemsMain} onNavigate={onNavigate} />
    );
}

export function ManageListingsNavLinks({ onNavigate }) {
    return (
      <SectionLinks items={navItemsManageListings} onNavigate={onNavigate} />
    );
}

export function ManageAccountNavLinks({ onNavigate }) {
    return (
      <SectionLinks items={navItemsManageAccount} onNavigate={onNavigate} />
    );
}

export function AccountingNavLinks({ onNavigate }) {
    return (
      <SectionLinks items={navItemsAccounting} onNavigate={onNavigate} />
    );
}
