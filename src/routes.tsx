import { createBrowserRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { Table } from "./pages/Table";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/table",
    element: <Table />,
  },
]);