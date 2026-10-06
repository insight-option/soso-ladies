import { notFound } from 'next/navigation';

// Unknown URLs render the localized not-found page inside the site layout.
export default function CatchAll() {
  notFound();
}
