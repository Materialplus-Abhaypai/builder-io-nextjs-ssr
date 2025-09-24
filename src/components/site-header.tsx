import Link from "next/link";

export type NavLink = { text: string; link: string };

export function SiteHeader({ links }: { links?: NavLink[] }) {
  const items = links ?? [];
  return (
    <header className="w-full border-b">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold">Home</Link>
        <nav className="flex items-center gap-6">
          {items.map((item) => (
            <Link key={`${item.text}-${item.link}`} href={item.link} className="text-blue-600 hover:underline">
              {item.text}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
