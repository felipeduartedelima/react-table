import { Header } from "@/_components/Header";
import { PeopleTable } from "@/_components/Table/People/Table";

export function Table() {
  return (
    <div>
      <Header />
      <div className="px-6">
        <PeopleTable />
      </div>
    </div>
  )
}
