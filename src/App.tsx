import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

export function App(){
	const queryClient = new QueryClient();
  return (
		<QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
		</QueryClientProvider>
    )
}