import {Session, User} from "@supabase/supabase-js";
import {createContext, PropsWithChildren, useContext, useEffect, useState,} from "react";
import {supabase} from "@/config/initSupabase";
import {router} from "expo-router";

type AuthProps = {
    user: User | null;
    session: Session | null;
    initialized?: boolean;
    signOut?: () => void;
};

export const AuthContext = createContext<Partial<AuthProps>>({});

// Custom hook to read the context values
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [initialized, setInitialized] = useState<boolean>(false);
    const [channel, setChannel] = useState<any | null>(null);

    useEffect(() => {
        // Listen for auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                if (session) {
                    const { data: userData, error } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", session.user.id)
                        .single();

                    if (error) {
                        console.error("Error fetching user data:", error);
                    } else if (userData && userData !== user) {
                        setUser(userData); // Only update if the user data is different
                    }
                } else {
                    setUser(null);
                }
                setInitialized(true);
            },
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []); // Only run this effect once on mount

    useEffect(() => {
        if (session?.user) {
            // Subscribe to real-time updates for the logged-in user's profile
            const subscription = supabase
                .channel("profiles_channel")
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "profiles",
                        filter: `id=eq.${session.user.id}`,
                    },
                    async () => {
                        const { data: updatedUser, error } = await supabase
                            .from("profiles")
                            .select("*")
                            .eq("id", session.user.id)
                            .single();

                        if (error) {
                            console.error("Error fetching updated user data:", error);
                        } else if (updatedUser && updatedUser !== user) {
                            setUser(updatedUser); // Only update if the user data is different
                        }
                    },
                )
                .subscribe();

            return () => {
                subscription.unsubscribe(); // Cleanup subscription on unmount
            };
        }
    }, [session]); // Run this effect when the session changes

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        router.replace("/entry")
    };

    const value = {
        user,
        session,
        initialized,
        signOut,
        channel,
        setChannel,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
