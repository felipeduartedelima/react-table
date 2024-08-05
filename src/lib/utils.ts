import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export type PaginationNumberProps = {
  maxPages: number,
  totalPages: number,
  currentPage: number
}

export function getPaginationNumbers({currentPage,maxPages,totalPages}: PaginationNumberProps) {
  let startPage = Math.max(currentPage - Math.floor(maxPages / 2), 0);
  let endPage = startPage + maxPages - 1;
  if (endPage >= totalPages) {
    endPage = totalPages - 1;
    startPage = Math.max(endPage - maxPages + 1, 0);
  }
  return [startPage, endPage + 1];
}