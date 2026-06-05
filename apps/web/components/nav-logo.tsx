import Image from 'next/image'

export function NavLogo() {
  return (
    <Image
      src="/cdc-logo.png"
      alt="Career Development Centre"
      width={200}
      height={60}
      className="h-8 w-auto"
    />
  )
}
