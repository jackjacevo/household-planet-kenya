'use client';

import Link from 'next/link';
import { FaChevronRight, FaHome } from 'react-icons/fa';
import SchemaMarkup from './SchemaMarkup';
import { generateBreadcrumbSchema } from '@/lib/seo';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const breadcrumbItems = [{ name: 'Home', url: '/' }, ...items];
  const schema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      <SchemaMarkup schema={schema} />
      <nav aria-label="Breadcrumb" className="py-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <FaChevronRight className="mx-2 text-gray-400" />}
              {index === 0 ? (
                <Link href={item.url} className="flex items-center hover:text-blue-600">
                  <FaHome className="mr-1" />
                  {item.name}
                </Link>
              ) : index === breadcrumbItems.length - 1 ? (
                <span className="text-gray-900 font-medium">{item.name}</span>
              ) : (
                <Link href={item.url} className="hover:text-blue-600">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}