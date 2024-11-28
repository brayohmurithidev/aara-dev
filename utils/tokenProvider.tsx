import { supabase } from "@/config/initSupabase.ts";

export const tokenProvider = async () => {
  const { data, error } = await supabase.functions.invoke("stream-token");
  if (error) console.log("Edge function call error: ", error);
  // console.log({ data });
  return data.token;
};
