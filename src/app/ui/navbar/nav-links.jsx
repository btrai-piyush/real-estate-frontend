import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
	{ label: "Home", href: "/home", hasDropdown: false },
	{ label: "Listing", href: "/home/listing", hasDropdown: false },
	{ label: "Property", href: "/home/property", hasDropdown: false },
	{ label: "Pages", href: "/home/pages", hasDropdown: true },
	{ label: "Blog", href: "/home/blog", hasDropdown: false },
	{ label: "Contact", href: "/home/contact", hasDropdown: false },
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

export default function NavLinks({ mobile = false, onNavigate }) {
	const pathname = usePathname();

	return (
		<ul
			className={
				mobile
					? "flex flex-col gap-1"
					: "flex items-center gap-7"
			}
		>
			{navItems.map((item) => {
				const isActive = item.href === "/home"
					? pathname === item.href
					: pathname === item.href || pathname.startsWith(`${item.href}/`);

				return (
					<li key={item.label}>
						<Link
							href={item.href}
							onClick={onNavigate}
							className={
								mobile
									? `flex w-full items-center justify-between rounded-lg px-3 py-2 text-base transition-colors ${
											isActive
												? "bg-[#fff1f2] text-[#ff5a5f]"
												: "text-[#374151] hover:bg-[#fff1f2]"
										}`
									: `flex items-center gap-1.5 text-[15px] font-medium transition-colors ${
											isActive
												? "text-[#ff5a5f]"
												: "text-[#374151] hover:text-[#ff5a5f]"
										}`
							}
						>
							<span>{item.label}</span>
							{item.hasDropdown ? (
								<ChevronDown className="h-4 w-4" />
							) : null}
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
