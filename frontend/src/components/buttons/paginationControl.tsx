'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
  page: number;
  totalPages: number;
}

export default function PaginationControl({ page, totalPages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <Pagination className="text-white">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setPage(page - 1)}
            className={page === 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        {page > 3 && (
          <>
            <PaginationItem>
              <PaginationLink onClick={() => setPage(1)} className="cursor-pointer">
                {1}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        )}

        {[page, page + 1, page + 2]
          .filter((p) => p <= totalPages)
          .map((p, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                isActive={p === page}
                className={`px-4 py-2 border-0 cursor-pointer rounded-md transition ${
                  page === p
                    ? 'bg-red-700/50 backdrop-blur-2xl  text-white'
                    : 'hover:bg-gray-200 text-white'
                }`}
                onClick={() => setPage(p)}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}

        {page + 2 < totalPages && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink onClick={() => setPage(totalPages)} className="cursor-pointer">
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => setPage(page + 1)}
            className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
