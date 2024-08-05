import axios from "axios";

type Pagination = {
	pageIndex: number,
	pageSize: number
}

type Sorting = {
	id: string,
	desc: boolean
}

const BASE_URL = import.meta.env.VITE_API_URL
export const fetchPeople = async ({pageIndex,pageSize}: Pagination, sort: Sorting[]) => {
	let stringSort = "";
	if(sort.length){
		stringSort = "&_sort=" + sort.map((s)=>{
			return `${s.desc ?"-" : ""}${s.id}`
		}).join(",")
	}
	const response = await axios.get(`${BASE_URL}/people?_page=${pageIndex+1}&_per_page=${pageSize}${stringSort}`);
	return response.data;
};
