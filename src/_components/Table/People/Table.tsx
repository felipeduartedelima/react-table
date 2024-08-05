import {
	type ColumnFiltersState,
	type GroupingState,
	PaginationState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getGroupedRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable
} from "@tanstack/react-table";

import { fetchPeople } from "@/api/people";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getPaginationNumbers } from "@/lib/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Group, Ungroup } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { peopleColumnsDefinitions } from ".";

export function PeopleTable() {
	const navigate = useNavigate();
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const sortParts = params.get("sort");
	const initialSorting = sortParts
		? sortParts.split(",").flatMap(part =>{
			const desc = part.startsWith("-")
			return {
				id: part.replace("-", ""),
				desc
			}
		})
		: [];
	const [sorting, setSorting] = useState<SortingState>(initialSorting);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [hasGroup, setHasGroup] = useState(params.get("group") || "");
	const [grouping, setGrouping] = useState<GroupingState>(
		params.get("group") ? [params.get("group") as string] : []
	);
  const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: Math.max(Number.parseInt(params.get("page") || "1"), 1) - 1,
    pageSize: Number.parseInt(params.get("per_page") || "10"),
  })
  const defaultData = useMemo(() => [], [])
  const peopleQuery = useQuery({
    queryKey: ['people', pagination, sorting],
    queryFn: () => {
			const s = sorting.map(a=>{
				return `${a.desc ? "-": ""}${a.id}`
			}).join(",")
			if(s.length){
				params.set("sort", s);
				navigate({
					search: params.toString(),
				});
			}
			return fetchPeople(pagination, sorting)
		},
    placeholderData: keepPreviousData,
  })
	const table = useReactTable({
		data: peopleQuery.data?.data ?? defaultData,
		rowCount: peopleQuery.data?.pages,
		columns: peopleColumnsDefinitions,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		getGroupedRowModel: getGroupedRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onGroupingChange: setGrouping,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			grouping,
			pagination,
		},
		manualPagination: true,
		manualSorting: true,
		debugTable: true,
	});
	const handlePage = (page: number) => {
		params.set("page", (page + 1).toString());
		setPagination(prev =>({
			pageIndex: page,
			pageSize: prev.pageSize
		}))
		navigate({
			search: params.toString(),
		});
	};

	const handlePreviousPage = () => {
		const currentPage = table.getState().pagination.pageIndex;
		setPagination(prev =>({
			pageIndex: table.getState().pagination.pageIndex - 1,
			pageSize: prev.pageSize
		}))
		params.set("page", (currentPage).toString());
		navigate({
			search: params.toString(),
		});
		table.previousPage();
	};

	const handleNextPage = () => {
		const nextPage = table.getState().pagination.pageIndex + 2;
		setPagination(prev =>({
			pageIndex: table.getState().pagination.pageIndex+1,
			pageSize: prev.pageSize
		}))
		params.set("page", nextPage.toString());
		navigate({
			search: params.toString(),
		});
	};
	const [startPageNumber, endPageNumber] = getPaginationNumbers({
		currentPage:table.getState().pagination.pageIndex,
		maxPages: 10,
		totalPages: peopleQuery.data?.pages
	})
	const pageOptions = [...Array(peopleQuery.data?.pages).fill("").map((_,index)=>index)];
	const pages = pageOptions.slice(
		startPageNumber,
		endPageNumber
	)


	return (
		<div className=" pb-32">
			<div className="flex items-center py-4">
				<div>
					<CardTitle>People</CardTitle>
					<CardDescription>people from api</CardDescription>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto">
							Columns
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder ? null : (
												<div className="flex items-center">
													{header.column.getCanGroup() ? (
														<Button
															onClick={()=>{
																if(hasGroup === header.column.id){
																	setHasGroup("")
																	params.delete("group")
																	navigate({
																		search: params.toString()
																	})
																}else {
																	setHasGroup(header.column.id)
																}
																header.column.getToggleGroupingHandler()()
															}}
															variant="ghost"
															disabled={hasGroup != "" && hasGroup !== header.column.id}
															size="sm"
														>
															{header.column.getIsGrouped() ? (
																<Ungroup />
															) : (
																<Group />
															)}
														</Button>
													) : null}{" "}
													{flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
												</div>
											)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => {
										return (
											<TableCell key={cell.id}>
												{cell.getIsGrouped() ? (
													<>
														<Button
															variant="ghost"
															size="sm"
															onClick={row.getToggleExpandedHandler()}
															disabled={!row.getCanExpand()}
														>
															{row.getIsExpanded() ? (
																<ChevronDown />
															) : (
																<ChevronRight />
															)}{" "}
															{flexRender(
																cell.column.columnDef.cell,
																cell.getContext(),
															)}{" "}
															({row.subRows.length})
														</Button>
													</>
												) : cell.getIsAggregated() ? (
													<></>
												) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
													// Otherwise, just render the regular cell
													flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)
												)}
											</TableCell>
										);
									})}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={peopleColumnsDefinitions.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center py-4">
				<div className="flex-1">
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									onClick={handlePreviousPage}
									disabled={pageOptions[0] === table.getState().pagination.pageIndex}
								/>
							</PaginationItem>
							{JSON.stringify(pageOptions.slice(0, 10)) === JSON.stringify(pages) || (
							<PaginationItem>
								<PaginationEllipsis />
							</PaginationItem>
							)}
							<PaginationItem>
								{pages.map((page) => (
									<PaginationLink
										onClick={() => handlePage(page)}
										isActive={table.getState().pagination.pageIndex === page}
										key={page}
									>
										{page + 1}
									</PaginationLink>
								))}
							</PaginationItem>
							{JSON.stringify(pageOptions.slice(pageOptions.length -10)) === JSON.stringify(pages)  || (
							<PaginationItem>
								<PaginationEllipsis />
							</PaginationItem>
							)}
							<PaginationItem>
								<PaginationNext
									onClick={handleNextPage}
									disabled={pageOptions[pageOptions.length - 1] === table.getState().pagination.pageIndex}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
				<div className="flex gap-2 items-center">
					<span>Rows per page: </span>
					<Select value={pagination.pageSize.toString()} onValueChange={(e)=>{
						setPagination((prev)=>{
							params.set("per_page", (e).toString());
							navigate({
								search: params.toString(),
							});
							return{pageIndex: prev.pageIndex, pageSize: parseInt(e)}
						})
					}}>
						<SelectTrigger className="w-[80px]">
							<SelectValue placeholder="Select a fruit" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="10">10</SelectItem>
							<SelectItem value="20">20</SelectItem>
							<SelectItem value="50">50</SelectItem>
							<SelectItem value="100">100</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}
