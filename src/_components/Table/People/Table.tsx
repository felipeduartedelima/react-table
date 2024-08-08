import {
	type ColumnFiltersState,
	type GroupingState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getGroupedRowModel,
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Group, Ungroup } from "lucide-react";
import { useMemo, useState } from "react";
import { peopleColumnsDefinitions } from ".";

export function PeopleTable() {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [grouping, setGrouping] = useState<GroupingState>([]);
  const defaultData = useMemo(() => [], [])
  const peopleQuery = useQuery({
    queryKey: ['people'],
    queryFn: () => {
			return fetchPeople()
		},
    placeholderData: keepPreviousData,
  })
	const table = useReactTable({
		data: peopleQuery.data ?? defaultData,
		columns: peopleColumnsDefinitions,
		getCoreRowModel: getCoreRowModel(),
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
		},
		debugTable: true,
	});
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
															onClick={header.column.getToggleGroupingHandler()}
															variant="ghost"
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
		</div>
	);
}
