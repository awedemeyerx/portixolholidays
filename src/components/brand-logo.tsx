import Image from 'next/image';

const PORTIXOL_LOGO_URL =
  'https://rmuas7fp0d3ofmmb.public.blob.vercel-storage.com/images/logo_portixolholidays_q_434.pdf.PNG';

type Props = {
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

export function BrandLogo({
  alt,
  priority = false,
  className,
  sizes = '(max-width: 767px) 180px, 220px',
}: Props) {
  return (
    <Image
      src={PORTIXOL_LOGO_URL}
      alt={alt}
      width={300}
      height={93}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
