import PublicLayoutChrome from "@/components/public/PublicLayoutChrome"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PublicLayoutChrome>{children}</PublicLayoutChrome>
}
