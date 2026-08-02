
import type { Metadata } from 'next';
import { WhyUsClient } from './why-us-client';

export const metadata: Metadata = {
  title: 'Why Us | Eco-Fone Nepal',
  description: 'Learn why Eco-Fone Nepal is the best choice for sustainable and affordable smartphones in Nepal. We prioritize you and the planet.',
};

export default function WhyUsPage() {
  return <WhyUsClient />;
}
