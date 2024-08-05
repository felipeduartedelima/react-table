import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();
  const handleNavigate = (to: string)=> () =>{
    navigate(to)
  }
  return (<header className="bg-slate-100 border-b w-full flex py-2 px-8 items-center justify-between">
    <h1 className="font-bold text-lg">APP</h1>
    <div className="flex gap-4">
      <Button onClick={handleNavigate("/")} variant="outline">Home</Button>
      <Button onClick={handleNavigate("/table")} variant="outline">Table</Button>
    </div>
  </header>)
}